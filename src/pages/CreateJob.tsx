import { useState, useEffect } from 'react';
import { ArrowLeft, Lock, User, ChevronDown, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { User as UserType, NavState } from '../types';

interface CreateJobProps {
  navigate: (state: NavState) => void;
}

/**
 * CreateJob Page (For Homeowners)
 * This page allows a homeowner to define a new job, select a worker, and specify the payment amount.
 * When submitted, it takes the money out of the homeowner's wallet and locks it in a secure "escrow" system so the worker knows they will be paid.
 */
export function CreateJob({ navigate }: CreateJobProps) {
  const { user, refreshUser } = useAuth();
  const [workers, setWorkers] = useState<UserType[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [workerId, setWorkerId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase
      .from('users')
      .select('*')
      .eq('role', 'worker')
      .then(({ data }) => setWorkers((data as UserType[]) ?? []));
  }, []);

  const totalCharge = amount ? parseFloat(amount) * 1.01 : 0;
  const hasEnough = user ? user.balance_pkr >= totalCharge : false;

  // Submits the job to the database, deducts the total from the homeowner's wallet, and moves it to locked funds (escrow)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title || !amount || !workerId) return;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    if (!hasEnough) {
      setError('Insufficient wallet balance.');
      return;
    }

    setLoading(true);
    setError('');

    const { data: jobData, error: jobErr } = await supabase
      .from('jobs')
      .insert({
        title,
        description,
        total_amount: numAmount,
        homeowner_id: user.id,
        worker_id: workerId,
        status: 'active',
      })
      .select()
      .single();

    if (jobErr || !jobData) {
      setError('Failed to create job. Please try again.');
      setLoading(false);
      return;
    }

    const { error: lockErr } = await supabase.rpc('lock_funds', {
      p_job_id: jobData.id,
      p_homeowner_id: user.id,
    });

    if (lockErr) {
      setError(lockErr.message || 'Failed to lock funds.');
      await supabase.from('jobs').delete().eq('id', jobData.id);
      setLoading(false);
      return;
    }

    await refreshUser();
    navigate({ page: 'job-detail', jobId: jobData.id });
  };

  return (
    <div className="min-h-screen bg-[#0D1B2A] pt-24 pb-8 px-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate({ page: 'dashboard' })}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white font-display">Secure a New Job</h1>
          <p className="text-slate-400 text-sm mt-1">
            Funds are locked immediately — worker can start with confidence.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-[#162233] border border-[#1e3448] rounded-xl p-5 space-y-4">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Job Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Bathroom Tiling, Kitchen Paint"
                required
                className="w-full bg-[#0D1B2A] border border-[#1e3448] rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/60 transition-colors"
              />
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the scope of work..."
                rows={3}
                className="w-full bg-[#0D1B2A] border border-[#1e3448] rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/60 transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Assign Worker</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <select
                  value={workerId}
                  onChange={(e) => setWorkerId(e.target.value)}
                  required
                  className="w-full bg-[#0D1B2A] border border-[#1e3448] rounded-xl pl-9 pr-9 py-3 text-white focus:outline-none focus:border-amber-500/60 transition-colors appearance-none"
                >
                  <option value="" className="text-slate-600">Select a worker...</option>
                  {workers.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} — {w.phone}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Payment Amount (PKR)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₨</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  min="1"
                  required
                  className="w-full bg-[#0D1B2A] border border-[#1e3448] rounded-xl pl-8 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/60 transition-colors"
                />
              </div>
            </div>
          </div>

          {amount && parseFloat(amount) > 0 && (
            <div className="bg-[#162233] border border-[#1e3448] rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Job Payment</span>
                <span className="text-white">₨ {parseFloat(amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Nighabaan Trust Fee (1%)</span>
                <span className="text-white">₨ {(parseFloat(amount) * 0.01).toFixed(0)}</span>
              </div>
              <div className="border-t border-[#1e3448] pt-2 flex justify-between">
                <span className="text-white font-semibold">Total Deducted</span>
                <span className={`font-bold text-lg ${hasEnough ? 'text-amber-400' : 'text-red-400'}`}>
                  ₨ {totalCharge.toFixed(0)}
                </span>
              </div>
              {!hasEnough && (
                <div className="flex items-center gap-2 text-red-400 text-xs">
                  <AlertCircle size={12} />
                  <span>Your wallet balance (₨ {user?.balance_pkr.toLocaleString()}) is insufficient.</span>
                </div>
              )}
              {hasEnough && (
                <div className="flex items-center gap-2 text-green-400 text-xs">
                  <Lock size={12} />
                  <span>Funds will be locked instantly upon job creation.</span>
                </div>
              )}
            </div>
          )}

          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !hasEnough || !title || !amount || !workerId}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-[#0D1B2A] font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors text-lg shadow-lg shadow-amber-500/20"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-[#0D1B2A]/30 border-t-[#0D1B2A] rounded-full animate-spin" />
            ) : (
              <>
                <Lock size={20} />
                Lock Funds & Create Job
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
