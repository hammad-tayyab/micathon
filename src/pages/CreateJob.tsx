import { useState } from 'react';
import { ArrowLeft, FileText, AlignLeft, MapPin, Send, Banknote } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { NavState } from '../types';

interface CreateJobProps {
  navigate: (state: NavState) => void;
}

/**
 * CreateJob Page (Owners only)
 * Simple form: title + description. City is auto-filled from user profile.
 * No escrow, no amount, no worker selection — just post the job.
 */
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

    // 1. Deduct balance from owner
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

    // 2. Insert Job

    const { data, error: jobErr } = await supabase
      .from('jobs')
      .insert({
        title: title.trim(),
        description: description.trim(),
        city: user.city, // auto-filled from profile
        homeowner_id: user.id,
        total_amount: numAmount,
        status: 'open',
        accepted_by: [],
      })
      .select()
      .single();

    if (jobErr || !data) {
      // Rollback is ideal, but for MVP we inform the user
      setError('Could not post job. Please try again.');
      setLoading(false);
      return;
    }

    await refreshUser();
    navigate({ page: 'job-detail', jobId: data.id });
  };

  return (
    <div
      className="min-h-screen pt-20 pb-10 px-4"
      style={{ backgroundColor: 'var(--bg-page)' }}
    >
      <div className="max-w-lg mx-auto">

        {/* Back */}
        <button
          onClick={() => navigate({ page: 'dashboard' })}
          className="flex items-center gap-2 text-sm font-medium mb-6 transition-colors"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {/* Header */}
        <div className="mb-6">
          <h1
            className="text-2xl font-display font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            Post a Job
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            نوکری پوسٹ کریں — Workers in your city will see this
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="card p-5 space-y-5">

            {/* Job Title */}
            <div>
              <label className="label" htmlFor="job-title">
                <span className="flex items-center gap-2">
                  <FileText size={14} style={{ color: 'var(--indigo)' }} />
                  Job Title — کام کا نام
                </span>
              </label>
              <input
                id="job-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Fix water pipe, Paint room, Repair gate"
                className="input"
                required
                autoFocus
              />
            </div>

            {/* Amount */}
            <div>
              <label className="label" htmlFor="job-amount">
                <span className="flex items-center gap-2">
                  <Banknote size={14} style={{ color: 'var(--indigo)' }} />
                  Job Payment — کل رقم (PKR)
                </span>
              </label>
              <div className="relative">
                <span
                  className="absolute left-4 top-1/2 -translate-y-1/2 font-bold"
                  style={{ color: 'var(--text-muted)' }}
                >
                  ₨
                </span>
                <input
                  id="job-amount"
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 5000"
                  className="input pl-9"
                  required
                />
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                This amount will be locked from your wallet and given to the worker (minus 5% fee) when the job is done.
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="label" htmlFor="job-desc">
                <span className="flex items-center gap-2">
                  <AlignLeft size={14} style={{ color: 'var(--indigo)' }} />
                  Description — تفصیل (optional)
                </span>
              </label>
              <textarea
                id="job-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what needs to be done..."
                rows={4}
                className="input resize-none"
                style={{ height: 'auto' }}
              />
            </div>

            {/* City (locked) */}
            <div>
              <label className="label">
                <span className="flex items-center gap-2">
                  <MapPin size={14} style={{ color: 'var(--indigo)' }} />
                  City — شہر
                </span>
              </label>
              <div
                className="input flex items-center gap-2 capitalize"
                style={{
                  color: 'var(--text-muted)',
                  cursor: 'not-allowed',
                  opacity: 0.8,
                }}
              >
                <MapPin size={14} />
                {user?.city}
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: 'var(--indigo-soft)',
                    color: 'var(--indigo)',
                  }}
                >
                  Auto
                </span>
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Only workers in {user?.city} will see this job
              </p>
            </div>
          </div>

          {error && (
            <p
              className="text-sm rounded-xl px-4 py-3"
              style={{
                color: 'var(--red)',
                backgroundColor: 'var(--red-soft)',
                border: '1px solid var(--red)',
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !title.trim()}
            className="btn-primary"
            style={{ backgroundColor: 'var(--indigo)' }}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Send size={18} />
                Post Job — نوکری پوسٹ کریں
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
