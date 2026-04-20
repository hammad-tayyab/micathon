import { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft, MapPin, Calendar, Phone, Copy, Check,
  CheckCircle, Users, UserCheck, AlertTriangle, HardHat
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Job, User, NavState } from '../types';
import { StatusBadge } from '../components/StatusBadge';

interface JobDetailProps {
  jobId: string;
  navigate: (state: NavState) => void;
}

/**
 * JobDetail Page
 * Owner view: shows list of workers who accepted, phone numbers, and a Hire button.
 * Worker view: shows accept button (if not yet accepted) or owner's phone number.
 * Hiring a worker sets job status to 'hired' and removes it from other workers' feeds.
 */
export function JobDetail({ jobId, navigate }: JobDetailProps) {
  const { user } = useAuth();

  const [job, setJob] = useState<Job | null>(null);
  const [acceptedWorkers, setAcceptedWorkers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [hiringId, setHiringId] = useState<string | null>(null);
  const [finishing, setFinishing] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isOwner = user?.role === 'owner';
  const hasAccepted = user ? (job?.accepted_by ?? []).includes(user.id) : false;

  const fetchJob = useCallback(async () => {
    const { data } = await supabase
      .from('jobs')
      .select('*, owner:users!homeowner_id(id, name, phone, role, city)')
      .eq('id', jobId)
      .maybeSingle();

    const j = data as Job | null;
    setJob(j);

    // Fetch the profiles of workers who accepted
    if (j && (j.accepted_by ?? []).length > 0) {
      const { data: workers } = await supabase
        .from('users')
        .select('*')
        .in('id', j.accepted_by);
      setAcceptedWorkers((workers as User[]) ?? []);
    } else {
      setAcceptedWorkers([]);
    }

    setLoading(false);
  }, [jobId]);

  useEffect(() => { fetchJob(); }, [fetchJob]);

  /* ── Worker: Accept job ── */
  const handleAccept = async () => {
    if (!user || !job || accepting || hasAccepted) return;
    setAccepting(true);
    setError('');

    const newAcceptedBy = [...(job.accepted_by ?? []), user.id];
    const { error: err } = await supabase
      .from('jobs')
      .update({ accepted_by: newAcceptedBy })
      .eq('id', job.id);

    if (err) {
      setError('Could not accept job. Please try again.');
    } else {
      await fetchJob();
    }
    setAccepting(false);
  };

  /* ── Owner: Hire a worker ── */
  const handleHire = async (workerId: string, workerName: string) => {
    if (!user || !job || hiringId) return;
    setHiringId(workerId);
    setError('');

    const { error: err } = await supabase
      .from('jobs')
      .update({ status: 'hired', worker_id: workerId })
      .eq('id', job.id);

    if (err) {
      setError('Could not hire worker. Please try again.');
      setHiringId(null);
    } else {
      setSuccess(`✓ ${workerName} has been hired! Job is now closed for other workers.`);
      await fetchJob();
      setHiringId(null);
    }
  };

  /* ── Owner: Job Done (Finalize Payment) ── */
  const handleJobDone = async () => {
    if (!user || !job || !job.worker_id || finishing) return;
    setFinishing(true);
    setError('');

    // 1. Get worker's current balance
    const { data: workerData, error: wErr } = await supabase
      .from('users')
      .select('balance_pkr')
      .eq('id', job.worker_id)
      .single();

    if (wErr || !workerData) {
      setError('Could not fetch worker details.');
      setFinishing(false);
      return;
    }

    // 2. Add 95% of total amount
    const payment = Math.floor((job.total_amount || 0) * 0.95);
    const newBalance = (workerData.balance_pkr || 0) + payment;

    const { error: balErr } = await supabase
      .from('users')
      .update({ balance_pkr: newBalance })
      .eq('id', job.worker_id);

    if (balErr) {
      setError('Failed to transfer funds to worker.');
      setFinishing(false);
      return;
    }

    // 3. Close job
    await supabase.from('jobs').update({ status: 'closed' }).eq('id', job.id);

    setSuccess(`✓ Job completed! ₨ ${payment.toLocaleString()} transferred to worker.`);
    await fetchJob();
    setFinishing(false);
  };

  const copyPhone = (phone: string, id: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return 'Just now';
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)} days ago`;
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div
        className="min-h-screen pt-20 flex items-center justify-center"
        style={{ backgroundColor: 'var(--bg-page)' }}
      >
        <div
          className="w-8 h-8 border-2 rounded-full animate-spin"
          style={{ borderColor: 'var(--border)', borderTopColor: 'var(--indigo)' }}
        />
      </div>
    );
  }

  if (!job) {
    return (
      <div
        className="min-h-screen pt-20 flex items-center justify-center"
        style={{ backgroundColor: 'var(--bg-page)' }}
      >
        <p style={{ color: 'var(--text-muted)' }}>Job not found.</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen pt-20 pb-12 px-4"
      style={{ backgroundColor: 'var(--bg-page)' }}
    >
      <div className="max-w-lg mx-auto">

        {/* Back */}
        <button
          onClick={() => navigate({ page: 'dashboard' })}
          className="flex items-center gap-2 text-sm font-medium mb-6 transition-opacity hover:opacity-70"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {/* ── Job Card ── */}
        <div className="card p-5 mb-4 animate-fadeUp">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h1
              className="text-xl font-display font-bold leading-snug"
              style={{ color: 'var(--text-primary)' }}
            >
              {job.title}
            </h1>
            <StatusBadge status={job.status} size="md" />
          </div>

          {job.description && (
            <p
              className="text-sm leading-relaxed mb-4"
              style={{ color: 'var(--text-secondary)' }}
            >
              {job.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span className="flex items-center gap-1">
              <MapPin size={12} />
              <span className="capitalize">{job.city}</span>
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {timeAgo(job.created_at)}
            </span>
            {isOwner && (
              <span className="flex items-center gap-1" style={{ color: 'var(--indigo)' }}>
                <Users size={12} />
                {acceptedWorkers.length} interested
              </span>
            )}
          </div>
        </div>

        {/* ── Alerts ── */}
        {error && (
          <div
            className="flex items-center gap-2 text-sm rounded-xl px-4 py-3 mb-4 animate-popIn"
            style={{
              color: 'var(--red)',
              backgroundColor: 'var(--red-soft)',
              border: '1px solid var(--red)',
            }}
          >
            <AlertTriangle size={16} />
            {error}
          </div>
        )}

        {success && (
          <div
            className="flex items-center gap-2 text-sm rounded-xl px-4 py-3 mb-4 animate-popIn"
            style={{
              color: 'var(--green)',
              backgroundColor: 'var(--green-soft)',
              border: '1px solid var(--green-border)',
            }}
          >
            <CheckCircle size={16} />
            {success}
          </div>
        )}

        {/* ═══════════════════════════════════
            OWNER VIEW — Applicant list + Hire
            ═══════════════════════════════════ */}
        {isOwner && (
          <div className="animate-fadeUp">
            <div className="flex items-center gap-2 mb-3">
              <Users size={15} style={{ color: 'var(--indigo)' }} />
              <h2
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: 'var(--text-muted)' }}
              >
                Workers Interested ({acceptedWorkers.length})
              </h2>
            </div>

            {job.status === 'hired' && (
              <div
                className="rounded-xl px-4 py-3 mb-4 flex items-center justify-between text-sm font-medium"
                style={{
                  backgroundColor: 'var(--indigo-soft)',
                  color: 'var(--indigo)',
                  border: '1px solid var(--indigo-border)',
                }}
              >
                <div className="flex items-center gap-2">
                   <UserCheck size={16} />
                   This job has been filled.
                </div>
                
                <button
                  onClick={handleJobDone}
                  disabled={finishing}
                  className="px-3 py-1.5 rounded-lg text-white font-bold bg-green-500 hover:bg-green-600 transition-colors"
                >
                  {finishing ? 'Wait...' : 'Job Done - Pay Worker'}
                </button>
              </div>
            )}
            
            {job.status === 'closed' && (
              <div className="rounded-xl px-4 py-3 mb-4 text-center text-sm font-medium" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                Job Closed and Paid
              </div>
            )}

            {acceptedWorkers.length === 0 && job.status === 'open' && (
              <div
                className="card p-8 text-center"
                style={{ color: 'var(--text-muted)' }}
              >
                <HardHat size={28} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  No workers yet
                </p>
                <p className="text-sm mt-1">
                  Workers in {job.city} will see this job and accept it
                </p>
              </div>
            )}

            <div className="space-y-3">
              {acceptedWorkers.map((worker) => (
                <div
                  key={worker.id}
                  className="card p-4 flex items-center gap-4 animate-popIn"
                >
                  {/* Avatar */}
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-base"
                    style={{ backgroundColor: 'var(--indigo)' }}
                  >
                    {worker.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-semibold text-sm"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {worker.name}
                    </p>
                    <div
                      className="flex items-center gap-1.5 text-sm mt-0.5"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <Phone size={12} />
                      {worker.phone}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Copy phone */}
                    <button
                      onClick={() => copyPhone(worker.phone, worker.id)}
                      className="p-2 rounded-lg transition-all"
                      style={{
                        backgroundColor:
                          copiedId === worker.id ? 'var(--green-soft)' : 'var(--bg-muted)',
                        color:
                          copiedId === worker.id ? 'var(--green)' : 'var(--text-muted)',
                        border: '1px solid var(--border)',
                      }}
                      title="Copy number"
                    >
                      {copiedId === worker.id ? <Check size={14} /> : <Copy size={14} />}
                    </button>

                    {/* Hire button */}
                    {job.status === 'open' && (
                      <button
                        onClick={() => handleHire(worker.id, worker.name)}
                        disabled={!!hiringId}
                        className="btn-accept px-3 py-2 text-sm"
                        style={{ minHeight: 'auto', fontSize: '0.8125rem', padding: '8px 14px' }}
                      >
                        {hiringId === worker.id ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <UserCheck size={14} />
                            Hire — رکھیں
                          </>
                        )}
                      </button>
                    )}
                    
                    {/* Hired indicator */}
                    {job.status !== 'open' && job.worker_id === worker.id && (
                       <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-md border border-green-200">
                         HIRED ✓
                       </span>
                    )}

                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════
            WORKER VIEW — Accept / Contact
            ═══════════════════════════════════ */}
        {!isOwner && (
          <div className="animate-fadeUp">
            <div className="card p-5">
              <p
                className="text-sm font-semibold mb-4"
                style={{ color: 'var(--text-secondary)' }}
              >
                Posted by {job.owner?.name}
              </p>

              {/* Job is still open */}
              {job.status === 'open' && !hasAccepted && (
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
                      Accept This Job — قبول کریں
                    </>
                  )}
                </button>
              )}

              {/* Accepted — show owner phone */}
              {hasAccepted && (
                <div
                  className="rounded-xl p-4 animate-popIn"
                  style={{
                    backgroundColor: 'var(--green-soft)',
                    border: '1.5px solid var(--green-border)',
                  }}
                >
                  <p
                    className="text-sm font-bold mb-3 flex items-center gap-2"
                    style={{ color: 'var(--green)' }}
                  >
                    <Check size={15} />
                    You accepted this job!
                  </p>
                  <p
                    className="text-xs mb-2 font-medium"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Contact the owner to discuss details:
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Phone size={15} style={{ color: 'var(--green)' }} />
                      <span
                        className="font-bold text-base"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {job.owner?.phone}
                      </span>
                    </div>
                    <button
                      onClick={() => copyPhone(job.owner?.phone ?? '', 'owner')}
                      className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-lg transition-all"
                      style={{
                        backgroundColor:
                          copiedId === 'owner' ? 'var(--green)' : 'var(--bg-surface)',
                        color: copiedId === 'owner' ? 'white' : 'var(--text-secondary)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      {copiedId === 'owner' ? <Check size={13} /> : <Copy size={13} />}
                      {copiedId === 'owner' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              )}

              {/* Job already hired (not this worker) */}
              {job.status === 'hired' && !hasAccepted && (
                <div
                  className="rounded-xl p-4 text-center"
                  style={{
                    backgroundColor: 'var(--bg-muted)',
                    color: 'var(--text-muted)',
                  }}
                >
                  <UserCheck size={24} className="mx-auto mb-2" />
                  <p className="font-medium text-sm" style={{ color: 'var(--text-secondary)' }}>
                    This job has been filled
                  </p>
                  <p className="text-xs mt-1">The owner hired someone else</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
