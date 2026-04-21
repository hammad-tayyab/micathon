import { useState } from 'react';
import { ArrowLeft, FileText, AlignLeft, MapPin, Send, Banknote } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { NavState } from '../types';

interface CreateJobProps {
  navigate: (state: NavState) => void;
}

export function CreateJob({ navigate }: CreateJobProps) {
  const { user, refreshUser } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!user || !title.trim() || isNaN(numAmount) || numAmount <= 0) {
      setError('Please fill in all required fields with valid amounts.');
      return;
    }
    
    if ((user.balance_pkr || 0) < numAmount) {
      setError(`Insufficient balance. You need ₨ ${numAmount.toLocaleString()} but only have ₨ ${(user.balance_pkr || 0).toLocaleString()}. Please add funds via Wallet.`);
      return;
    }
    
    setError('');
    setLoading(true);

    const newBalance = user.balance_pkr - numAmount;
    const { error: balErr } = await supabase
      .from('users')
      .update({ balance_pkr: newBalance })
      .eq('id', user.id);

    if (balErr) {
      setError('Failed to deduct balance. Job not posted.');
      setLoading(false);
      return;
    }

    const { data, error: jobErr } = await supabase
      .from('jobs')
      .insert({
        title: title.trim(),
        description: description.trim(),
        city: user.city,
        homeowner_id: user.id,
        total_amount: numAmount,
        status: 'open',
        accepted_by: [],
      })
      .select()
      .single();

    if (jobErr || !data) {
      setError('Could not post job. Please try again.');
      setLoading(false);
      return;
    }

    await refreshUser();
    navigate({ page: 'job-detail', jobId: data.id });
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-page text-primary flex flex-col">
      <div className="w-full max-w-lg mx-auto">

        {/* Back */}
        <button
          onClick={() => navigate({ page: 'dashboard' })}
          className="flex items-center gap-2 text-xs uppercase tracking-widest font-semibold mb-8 text-muted hover:text-white transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Marketplace
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-semibold tracking-wide text-white">
            Post a Job
          </h1>
          <p className="text-sm mt-1 text-muted">
            نوکری پوسٹ کریں — Workers in your city will see this
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 animate-fadeUp">
          <div className="card p-6 space-y-6">

            {/* Job Title */}
            <div className="floating-label-group">
              <input
                id="job-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder=" "
                className="input pl-10"
                required
                autoFocus
              />
              <label htmlFor="job-title" className="left-10 text-muted">Job Title</label>
              <FileText size={18} className="absolute left-4 top-[55%] -translate-y-1/2 text-muted pointer-events-none" />
            </div>

            {/* Amount */}
            <div>
              <div className="floating-label-group">
                <input
                  id="job-amount"
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder=" "
                  className="input pl-10"
                  required
                />
                <label htmlFor="job-amount" className="left-10 text-muted">Job Payment (PKR)</label>
                <span className="absolute left-4 top-[55%] -translate-y-1/2 font-semibold text-muted pointer-events-none tracking-widest">
                  ₨
                </span>
              </div>
              <p className="text-xs mt-2 text-muted/70 tracking-wide leading-relaxed">
                This amount will be locked from your wallet and given to the worker (minus 5% fee) when the job is done.
              </p>
            </div>

            {/* Description */}
            <div className="floating-label-group">
              <textarea
                id="job-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder=" "
                rows={4}
                className="input pl-10 resize-none min-h-[120px]"
              />
              <label htmlFor="job-desc" className="left-10 top-6 -translate-y-0 text-muted bg-surface px-1">Description (Optional)</label>
              <AlignLeft size={18} className="absolute left-4 top-5 text-muted pointer-events-none" />
            </div>

            {/* City (locked) */}
            <div>
              <p className="text-xs uppercase tracking-widest text-muted mb-2 font-medium pl-1">Target City</p>
              <div className="input flex items-center justify-between capitalize border-white/5 bg-transparent cursor-not-allowed">
                <div className="flex items-center gap-2 text-muted">
                  <MapPin size={16} />
                  {user?.city}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-indigo-500/10 text-indigo-400">
                  Auto-locked
                </span>
              </div>
              <p className="text-xs mt-2 text-muted/70 tracking-wide leading-relaxed">
                Only workers verified in {user?.city} will see this job.
              </p>
            </div>
          </div>

          {error && (
            <p className="text-sm px-4 py-3 text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg font-medium">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !title.trim()}
            className="btn-primary py-4 text-base tracking-wide mt-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Send size={18} />
                Post Job
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
