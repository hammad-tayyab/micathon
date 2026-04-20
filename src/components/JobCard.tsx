import { useState } from 'react';
import { CheckCircle, Phone, Copy, Check, Users, Banknote } from 'lucide-react';
import { Job } from '../types';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface JobCardProps {
  job: Job;
  onAccepted?: (jobId: string) => void;
  navigate?: (state: { page: 'job-detail'; jobId: string }) => void;
}

/**
 * JobCard Component
 * Has two visual variants:
 *   - Owner: shows job title, interested count, opens detail page on click
 *   - Worker: shows title, description, and an inline green Accept button
 *             After accepting it reveals the owner's phone number
 */
export function JobCard({ job, onAccepted, navigate }: JobCardProps) {
  const { user } = useAuth();
  const isOwner = user?.role === 'owner';

  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(
    user ? job.accepted_by?.includes(user.id) : false
  );
  const [copied, setCopied] = useState(false);

  const ownerPhone = job.owner?.phone ?? '';

  const handleAccept = async () => {
    if (!user || accepting || accepted) return;
    setAccepting(true);

    const newAcceptedBy = [...(job.accepted_by ?? []), user.id];
    const { error } = await supabase
      .from('jobs')
      .update({ accepted_by: newAcceptedBy })
      .eq('id', job.id);

    if (!error) {
      setAccepted(true);
      onAccepted?.(job.id);
    }
    setAccepting(false);
  };

  const copyPhone = () => {
    navigator.clipboard.writeText(ownerPhone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return 'Just now';
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  /* ── Owner View ── */
  if (isOwner) {
    return (
      <button
        onClick={() => navigate?.({ page: 'job-detail', jobId: job.id })}
        className="w-full text-left card p-4 hover:shadow-md transition-all group animate-fadeUp"
        style={{ cursor: navigate ? 'pointer' : 'default' }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3
              className="font-semibold truncate mb-1"
              style={{ color: 'var(--text-primary)' }}
            >
              {job.title}
            </h3>
            <p
              className="text-sm line-clamp-1 mb-3"
              style={{ color: 'var(--text-muted)' }}
            >
              {job.description || 'No description'}
            </p>
            <div className="flex items-center justify-between">
              <div
                className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
                style={{
                  backgroundColor: 'var(--indigo-soft)',
                  color: 'var(--indigo)',
                }}
              >
                <Users size={12} />
                {(job.accepted_by ?? []).length} interested
              </div>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  job.status === 'open'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500'
                }`}
                style={
                  job.status === 'open'
                    ? { backgroundColor: 'var(--green-soft)', color: 'var(--green)' }
                    : { backgroundColor: 'var(--bg-muted)', color: 'var(--text-muted)' }
                }
              >
                {job.status === 'open' ? 'Open' : job.status === 'hired' ? 'Hired ✓' : 'Closed'}
              </span>
            </div>
            
            {/* Added: Cash Amount Display for Owner */}
            <div className="mt-2 flex items-center justify-end">
               <span className="flex items-center gap-1 text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                 <Banknote size={14} style={{ color: 'var(--indigo)' }} />
                 ₨ {(job.total_amount || 0).toLocaleString()}
               </span>
            </div>
          </div>
        </div>
        <p
          className="text-xs mt-3 text-right"
          style={{ color: 'var(--text-muted)' }}
        >
          {timeAgo(job.created_at)}
        </p>
      </button>
    );
  }

  /* ── Worker View ── */
  return (
    <div className="card p-4 animate-fadeUp">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3
          className="font-semibold text-base leading-snug"
          style={{ color: 'var(--text-primary)' }}
        >
          {job.title}
        </h3>
        <span className="text-xs shrink-0 mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {timeAgo(job.created_at)}
        </span>
      </div>

      {job.description && (
        <p
          className="text-sm mb-3 line-clamp-2 leading-relaxed"
          style={{ color: 'var(--text-secondary)' }}
        >
          {job.description}
        </p>
      )}
      
      {/* Added: Financials for Worker */}
      <div className="flex flex-col gap-1 mb-4 p-3 rounded-xl bg-gray-50" style={{ backgroundColor: 'var(--bg-muted)' }}>
        <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
          <span>Total Payment:</span>
          <span>₨ {(job.total_amount || 0).toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between font-bold text-sm" style={{ color: 'var(--green)' }}>
          <span>You will Take Home:</span>
          <span className="flex items-center gap-1">
             <Banknote size={14} /> 
             ₨ {((job.total_amount || 0) * 0.95).toLocaleString()}
          </span>
        </div>
        <p className="text-[10px] text-right mt-1" style={{ color: 'var(--text-muted)' }}>(5% platform fee deducted)</p>
      </div>

      <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
        Posted by {job.owner?.name ?? 'Owner'}
      </p>

      {/* Accept button or contact reveal */}
      {!accepted ? (
        <button
          onClick={handleAccept}
          disabled={accepting}
          className="btn-accept w-full"
        >
          {accepting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <CheckCircle size={18} />
              Accept Job — قبول کریں
            </>
          )}
        </button>
      ) : (
        <div
          className="rounded-xl p-3 animate-popIn"
          style={{
            backgroundColor: 'var(--green-soft)',
            border: '1.5px solid var(--green-border)',
          }}
        >
          <p
            className="text-xs font-semibold mb-2 flex items-center gap-1.5"
            style={{ color: 'var(--green)' }}
          >
            <Check size={14} /> You accepted! Contact the owner:
          </p>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Phone size={15} style={{ color: 'var(--green)' }} />
              <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                {ownerPhone}
              </span>
            </div>
            <button
              onClick={copyPhone}
              className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg transition-all"
              style={{
                backgroundColor: copied ? 'var(--green)' : 'var(--bg-surface)',
                color: copied ? 'white' : 'var(--text-secondary)',
                border: '1px solid var(--border)',
              }}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
