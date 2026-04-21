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
        className="w-full text-left card p-5 hover:bg-white/5 transition-all group animate-fadeUp border-white/5 bg-transparent"
        style={{ cursor: navigate ? 'pointer' : 'default' }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-1.5">
              <h3 className="font-semibold text-white truncate pr-4 text-base tracking-wide">
                {job.title}
              </h3>
              <span className="text-[10px] uppercase tracking-widest text-muted/70 shrink-0 mt-1 whitespace-nowrap">
                {timeAgo(job.created_at)}
              </span>
            </div>
            
            <p className="text-sm line-clamp-1 mb-4 text-muted/80 leading-relaxed">
              {job.description || 'No description'}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400">
                <Users size={12} />
                {(job.accepted_by ?? []).length} interested
              </div>
              
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-sm font-semibold text-white">
                  <Banknote size={14} className="text-indigo-400" />
                  ₨ {(job.total_amount || 0).toLocaleString()}
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${
                  job.status === 'open'
                    ? 'bg-green-500/10 text-green-400'
                    : 'bg-white/5 text-muted'
                }`}>
                  {job.status === 'open' ? 'Open' : job.status === 'hired' ? 'Hired ✓' : 'Closed'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </button>
    );
  }

  /* ── Worker View ── */
  return (
    <div className="card p-5 animate-fadeUp bg-transparent border-white/5">
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="font-semibold text-lg leading-snug text-white tracking-wide">
          {job.title}
        </h3>
        <span className="text-[10px] uppercase tracking-widest shrink-0 mt-1 text-muted/70">
          {timeAgo(job.created_at)}
        </span>
      </div>

      {job.description && (
        <p className="text-sm mb-5 line-clamp-2 leading-relaxed text-muted">
          {job.description}
        </p>
      )}
      
      {/* Financials for Worker */}
      <div className="flex flex-col gap-1.5 mb-5 p-3 rounded-lg bg-white/5 border border-white/5">
        <div className="flex items-center justify-between text-xs text-muted font-medium">
          <span>Client Payment</span>
          <span>₨ {(job.total_amount || 0).toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between font-bold text-sm text-green-400 pt-1 border-t border-white/5 mt-1 text-[13px]">
          <span>You Earn</span>
          <span className="flex items-center gap-1">
             <Banknote size={14} /> 
             ₨ {((job.total_amount || 0) * 0.95).toLocaleString()}
          </span>
        </div>
        <p className="text-[10px] uppercase tracking-widest text-right mt-1 text-muted/50 font-medium">Minus 5% platform fee</p>
      </div>

      <div className="flex items-center justify-between mb-5">
        <p className="text-xs text-muted/80">
          Posted by <span className="font-medium text-white">{job.owner?.name ?? 'Client'}</span>
        </p>
      </div>

      {/* Accept button or contact reveal */}
      {!accepted ? (
        <button
          onClick={handleAccept}
          disabled={accepting}
          className="btn-accept w-full py-3 mt-1"
        >
          {accepting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <CheckCircle size={18} />
              Accept Task
            </>
          )}
        </button>
      ) : (
        <div className="rounded-xl p-4 animate-popIn bg-green-500/10 border border-green-500/20">
          <p className="text-xs font-semibold mb-3 flex items-center gap-1.5 text-green-400 tracking-wide">
            <Check size={14} /> You're hired! Contact client:
          </p>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Phone size={15} className="text-green-500" />
              <span className="font-bold text-sm text-white tracking-widest">
                {ownerPhone}
              </span>
            </div>
            <button
              onClick={copyPhone}
              className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all border ${
                copied 
                  ? 'bg-green-500 text-white border-green-500' 
                  : 'bg-transparent text-muted border-white/10 hover:text-white hover:border-white/30'
              }`}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
