import { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft, MapPin, Calendar, Phone, Copy, Check,
  CheckCircle, Users, UserCheck, AlertTriangle, HardHat, Banknote
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Job, User, NavState } from '../types';
import { StatusBadge } from '../components/StatusBadge';

interface JobDetailProps {
  jobId: string;
  navigate: (state: NavState) => void;
}

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

    await supabase.from('jobs').update({ status: 'closed' }).eq('id', job.id);

    setSuccess(`✓ Task completed! ₨ ${payment.toLocaleString()} transferred to worker.`);
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

  if (loading) {
    return (
      <div className="min-h-screen pt-24 bg-page flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/10 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen pt-24 bg-page flex items-center justify-center">
        <p className="text-muted">Task not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-page text-primary flex flex-col">
      <div className="w-full max-w-lg mx-auto">

        {/* Back */}
        <button
          onClick={() => navigate({ page: 'dashboard' })}
          className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest mb-8 text-muted hover:text-white transition-opacity"
        >
          <ArrowLeft size={14} />
          Back
        </button>

        {/* ── Job Card ── */}
        <div className="card p-6 mb-6 animate-fadeUp bg-transparent border-white/5 relative overflow-hidden">
          {/* Subtle gradient flash */}
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none" />

          <div className="flex items-start justify-between gap-3 mb-4">
            <h1 className="text-xl font-display font-semibold tracking-wide leading-snug text-white">
              {job.title}
            </h1>
            <StatusBadge status={job.status} size="md" />
          </div>

          <div className="flex items-center gap-2 mb-6 p-3 rounded-lg border border-white/5 bg-white/5">
             <Banknote size={16} className="text-indigo-400" />
             <span className="text-base font-bold text-white tracking-widest">
                ₨ {(job.total_amount || 0).toLocaleString()}
             </span>
          </div>

          {job.description && (
            <p className="text-sm leading-relaxed mb-6 text-muted/90">
              {job.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-[11px] font-semibold text-muted uppercase tracking-widest">
            <span className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded">
              <MapPin size={12} />
              <span className="capitalize">{job.city}</span>
            </span>
            <span className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded">
              <Calendar size={12} />
              {timeAgo(job.created_at)}
            </span>
            {isOwner && (
              <span className="flex items-center gap-1.5 text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">
                <Users size={12} />
                {acceptedWorkers.length} interested
              </span>
            )}
          </div>
        </div>

        {/* ── Alerts ── */}
        {error && (
          <div className="flex items-center gap-2 text-sm rounded-lg px-4 py-3 mb-6 animate-popIn text-red-400 bg-red-400/10 border border-red-400/20 font-medium">
            <AlertTriangle size={16} />
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 text-sm rounded-lg px-4 py-3 mb-6 animate-popIn text-green-400 bg-green-500/10 border border-green-500/20 font-medium">
            <CheckCircle size={16} />
            {success}
          </div>
        )}

        {/* ═══════════════════════════════════
            OWNER VIEW — Applicant list + Hire
            ═══════════════════════════════════ */}
        {isOwner && (
          <div className="animate-fadeUp">
            <div className="flex items-center gap-2 mb-4 pl-1">
              <Users size={14} className="text-indigo-500" />
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">
                Interested Workers ({acceptedWorkers.length})
              </h2>
            </div>

            {job.status === 'hired' && (
              <div className="rounded-xl p-5 mb-5 space-y-4 bg-indigo-500/5 border border-indigo-500/20">
                <div className="flex items-center gap-2 text-sm font-semibold tracking-wide text-indigo-400">
                   <UserCheck size={16} />
                   This task has been filled!
                </div>
                
                <button
                  onClick={handleJobDone}
                  disabled={finishing}
                  className="btn-accept w-full py-3"
                >
                  {finishing ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                  ) : (
                    <>Job Done — Pay Worker</>
                  )}
                </button>
              </div>
            )}
            
            {job.status === 'closed' && (
              <div className="rounded-xl px-4 py-4 mb-5 text-center text-xs uppercase tracking-widest font-semibold bg-surface border border-white/5 text-muted/60">
                Task Closed and Paid
              </div>
            )}

            {acceptedWorkers.length === 0 && job.status === 'open' && (
              <div className="card border-dashed border-white/10 p-10 text-center bg-transparent mt-4 opacity-70">
                <HardHat size={32} className="mx-auto mb-4 text-muted/50" />
                <p className="font-semibold text-white tracking-wide">
                  No applicants yet
                </p>
                <p className="text-sm mt-2 text-muted">
                  Workers in {job.city} will see this soon
                </p>
              </div>
            )}

            <div className="grid gap-3">
              {acceptedWorkers.map((worker) => (
                <div
                  key={worker.id}
                  className="card p-4 flex items-center gap-4 animate-popIn bg-transparent border-white/5"
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-sm border border-indigo-500/30 bg-indigo-500/10">
                    {worker.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-white tracking-wide mb-1">
                      {worker.name}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-muted/80">
                      <Phone size={10} />
                      <span className="tracking-widest">{worker.phone}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => copyPhone(worker.phone, worker.id)}
                      className={`p-2 rounded-lg transition-all border ${
                        copiedId === worker.id 
                          ? 'border-green-500/30 bg-green-500/10 text-green-400' 
                          : 'border-white/10 bg-transparent text-muted hover:border-white/30 hover:text-white'
                      }`}
                      title="Copy number"
                    >
                      {copiedId === worker.id ? <Check size={14} /> : <Copy size={14} />}
                    </button>

                    {job.status === 'open' && (
                      <button
                        onClick={() => handleHire(worker.id, worker.name)}
                        disabled={!!hiringId}
                        className="btn-primary text-xs uppercase tracking-widest px-4 py-2 min-h-0"
                      >
                        {hiringId === worker.id ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block mx-2" />
                        ) : (
                          <>Hire</>
                        )}
                      </button>
                    )}
                    
                    {job.status !== 'open' && job.worker_id === worker.id && (
                       <span className="text-[10px] font-bold uppercase tracking-widest text-green-400 bg-green-500/10 px-3 py-1.5 rounded-lg border border-green-500/20">
                         Hired ✓
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
          <div className="animate-fadeUp mt-2">
            <div className="card p-6 border-white/5 bg-surface/50">
              <p className="text-xs uppercase tracking-widest text-muted/70 font-semibold mb-6 flex items-center gap-2">
                <span className="w-5 h-px bg-white/10"></span>
                Posted by {job.owner?.name}
              </p>

              {/* Job is still open */}
              {job.status === 'open' && !hasAccepted && (
                <button
                  onClick={handleAccept}
                  disabled={accepting}
                  className="btn-accept w-full py-4"
                >
                  {accepting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle size={18} />
                      Accept This Task
                    </>
                  )}
                </button>
              )}

              {/* Accepted — show owner phone */}
              {hasAccepted && (
                <div className="rounded-xl p-5 animate-popIn bg-green-500/10 border border-green-500/20">
                  <p className="text-sm font-bold tracking-wide mb-3 flex items-center gap-2 text-green-400">
                    <Check size={16} />
                    You accepted this job!
                  </p>
                  <p className="text-xs mb-3 font-medium text-muted/90">
                    Contact the client to discuss details:
                  </p>
                  <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-black/40 border border-white/5">
                    <div className="flex items-center gap-2.5">
                      <Phone size={14} className="text-green-500" />
                      <span className="font-bold text-sm tracking-widest text-white">
                        {job.owner?.phone}
                      </span>
                    </div>
                    <button
                      onClick={() => copyPhone(job.owner?.phone ?? '', 'owner')}
                      className={`flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-md transition-all border ${
                        copiedId === 'owner' 
                          ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                          : 'bg-transparent text-muted border-white/10 hover:border-white/30 hover:text-white'
                      }`}
                    >
                      {copiedId === 'owner' ? <Check size={12} /> : <Copy size={12} />}
                      {copiedId === 'owner' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              )}

              {/* Job already hired (not this worker) */}
              {job.status === 'hired' && !hasAccepted && (
                <div className="rounded-xl p-6 text-center bg-black/40 border border-white/5">
                  <UserCheck size={28} className="mx-auto mb-3 text-muted/40" />
                  <p className="font-semibold text-sm tracking-wide text-muted/80">
                    This task has been filled
                  </p>
                  <p className="text-xs mt-1.5 text-muted/50">The client hired someone else</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
