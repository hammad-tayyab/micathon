import { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft, Lock, CheckCircle, Clock, User, Calendar,
  Send, DollarSign, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Job, NavState } from '../types';
import { StatusBadge } from '../components/StatusBadge';

interface JobDetailProps {
  jobId: string;
  navigate: (state: NavState) => void;
}

/**
 * JobDetail Page
 * This is the control center for a specific job.
 * - Homeowners use this page to verify work and release the locked funds to the worker.
 * - Workers use this page to see that their payment is secured and to leave a note when the job is done.
 */
export function JobDetail({ jobId, navigate }: JobDetailProps) {
  const { user, refreshUser } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [proofNote, setProofNote] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchJob = useCallback(async () => {
    const { data } = await supabase
      .from('jobs')
      .select(`
        *,
        homeowner:homeowner_id(id, name, phone, role, balance_pkr),
        worker:worker_id(id, name, phone, role, balance_pkr)
      `)
      .eq('id', jobId)
      .maybeSingle();
    setJob(data as Job | null);
    setLoading(false);
  }, [jobId]);

  useEffect(() => { fetchJob(); }, [fetchJob]);

  const isHomeowner = user?.id === job?.homeowner_id;
  const isWorker = user?.id === job?.worker_id;

  // Called by the worker to notify the homeowner that the work is finished and money can be released.
  const handleRequestRelease = async () => {
    if (!user || !job) return;
    setActionLoading(true);
    setError('');

    const { error: err } = await supabase.rpc('request_release', {
      p_job_id: job.id,
      p_worker_id: user.id,
      p_note: proofNote,
    });

    if (err) {
      setError(err.message || 'Failed to request release.');
    } else {
      setSuccess('Release requested! The homeowner will review your work.');
      await fetchJob();
      setProofNote('');
    }
    setActionLoading(false);
  };

  // Called by the homeowner. It officially moves the locked escrow money into the worker's wallet.
  const handleReleaseFunds = async () => {
    if (!user || !job) return;
    setActionLoading(true);
    setError('');

    const { error: err } = await supabase.rpc('release_funds', {
      p_job_id: job.id,
      p_homeowner_id: user.id,
    });

    if (err) {
      setError(err.message || 'Failed to release funds.');
    } else {
      setSuccess(`Funds released to ${job.worker?.name ?? 'worker'}!`);
      await refreshUser();
      await fetchJob();
    }
    setActionLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D1B2A] pt-24 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#1e3448] border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-[#0D1B2A] pt-24 flex items-center justify-center">
        <p className="text-slate-400">Job not found.</p>
      </div>
    );
  }

  const workerFee = job.total_amount * 0.01;
  const workerReceives = job.total_amount - workerFee;

  return (
    <div className="min-h-screen bg-[#0D1B2A] pt-24 pb-8 px-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate({ page: 'dashboard' })}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        <div className="bg-[#162233] border border-[#1e3448] rounded-2xl overflow-hidden mb-4">
          <div className="p-5 border-b border-[#1e3448]">
            <div className="flex items-start justify-between gap-3 mb-3">
              <h1 className="text-xl font-bold text-white font-display">{job.title}</h1>
              <StatusBadge status={job.status} size="md" />
            </div>
            {job.description && (
              <p className="text-slate-400 text-sm leading-relaxed">{job.description}</p>
            )}
          </div>

          {(job.status === 'funds_secured' || job.status === 'release_requested') && (
            <div className="bg-amber-500/10 border-b border-amber-500/20 px-5 py-4 flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center shrink-0">
                <Lock size={16} className="text-amber-400" />
              </div>
              <div>
                <p className="text-amber-300 font-semibold text-sm">Payment Secured in Nighabaan</p>
                <p className="text-amber-400/70 text-xs mt-0.5">
                  ₨ {job.total_amount.toLocaleString()} is held safely in escrow
                </p>
              </div>
            </div>
          )}

          {job.status === 'completed' && (
            <div className="bg-green-500/10 border-b border-green-500/20 px-5 py-4 flex items-center gap-3">
              <CheckCircle size={20} className="text-green-400 shrink-0" />
              <p className="text-green-300 font-semibold text-sm">Job completed & funds released</p>
            </div>
          )}

          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-slate-500 text-xs mb-1">Homeowner</p>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-amber-500/20 rounded-full flex items-center justify-center">
                    <User size={12} className="text-amber-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{job.homeowner?.name}</p>
                    <p className="text-slate-500 text-xs">{job.homeowner?.phone}</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-slate-500 text-xs mb-1">Worker</p>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <User size={12} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{job.worker?.name ?? 'Unassigned'}</p>
                    <p className="text-slate-500 text-xs">{job.worker?.phone ?? '—'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#0D1B2A] rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <DollarSign size={13} /> Job Payment
                </span>
                <span className="text-white font-semibold">₨ {job.total_amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Platform Fee (1%)</span>
                <span className="text-slate-300">₨ {workerFee.toFixed(0)}</span>
              </div>
              <div className="border-t border-[#1e3448] pt-2 flex justify-between">
                <span className="text-slate-400 text-sm">Worker Receives</span>
                <span className="text-amber-400 font-bold text-lg">₨ {workerReceives.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-500 text-xs">
              <Calendar size={12} />
              <span>Created {new Date(job.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
          </div>
        </div>

        {job.status === 'release_requested' && job.proof_note && (
          <div className="bg-[#162233] border border-orange-500/30 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={15} className="text-orange-400" />
              <p className="text-orange-300 font-semibold text-sm">Worker's Completion Note</p>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed italic">"{job.proof_note}"</p>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4">
            <AlertTriangle size={16} />
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 text-green-400 text-sm bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 mb-4">
            <CheckCircle size={16} />
            {success}
          </div>
        )}

        {isWorker && job.status === 'funds_secured' && (
          <div className="bg-[#162233] border border-[#1e3448] rounded-xl p-5 space-y-3">
            <h3 className="text-white font-semibold">Mark Job as Finished</h3>
            <p className="text-slate-400 text-sm">
              Add a note describing what you completed, then submit for homeowner approval.
            </p>
            <textarea
              value={proofNote}
              onChange={(e) => setProofNote(e.target.value)}
              placeholder="e.g. All tiles laid and grouted. Bathroom is clean and ready for inspection."
              rows={3}
              className="w-full bg-[#0D1B2A] border border-[#1e3448] rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/60 transition-colors resize-none text-sm"
            />
            <button
              onClick={handleRequestRelease}
              disabled={actionLoading || !proofNote.trim()}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              {actionLoading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send size={18} />
                  Submit Completion Request
                </>
              )}
            </button>
          </div>
        )}

        {isHomeowner && (job.status === 'funds_secured' || job.status === 'release_requested') && (
          <div className="bg-[#162233] border border-[#1e3448] rounded-xl p-5 space-y-3">
            <h3 className="text-white font-semibold">Release Payment</h3>
            {job.status === 'release_requested' ? (
              <div className="flex items-start gap-2 bg-orange-500/10 border border-orange-500/20 rounded-lg px-3 py-2">
                <Clock size={14} className="text-orange-400 mt-0.5 shrink-0" />
                <p className="text-orange-300 text-sm">
                  <strong>{job.worker?.name}</strong> has submitted a completion request. Review their note above, then release the funds if satisfied.
                </p>
              </div>
            ) : (
              <p className="text-slate-400 text-sm">
                Confirm that <strong className="text-white">{job.worker?.name}</strong> has completed the work, then release the payment.
              </p>
            )}
            <button
              onClick={handleReleaseFunds}
              disabled={actionLoading}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-[#0D1B2A] font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-amber-500/20 text-lg"
            >
              {actionLoading ? (
                <div className="w-5 h-5 border-2 border-[#0D1B2A]/30 border-t-[#0D1B2A] rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle size={20} />
                  Release ₨ {workerReceives.toLocaleString()} to {job.worker?.name?.split(' ')[0]}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
