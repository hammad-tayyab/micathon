import { useState, useEffect } from 'react';
import { Wallet as WalletIcon, Plus, ArrowDownLeft, Check, PlusCircle, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface TopUpRecord {
  id: string;
  amount: number;
  created_at: string;
}

/**
 * Wallet Page
 * Shows the user's current balance and allows them to top it up.
 * Keeps a local list of top-up history fetched from the 'topups' table.
 * If the 'topups' table doesn't exist yet, it degrades gracefully.
 */
export function Wallet() {
  const { user, refreshUser } = useAuth();

  const [topups, setTopups] = useState<TopUpRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState('');
  const [adding, setAdding] = useState(false);
  const [addedMsg, setAddedMsg] = useState('');
  const [formError, setFormError] = useState('');

  const [withdrawing, setWithdrawing] = useState(false);
  const isOwner = user?.role === 'owner';

  /* Fetch top-up history */
  useEffect(() => {
    if (!user) return;
    refreshUser();

    supabase
      .from('topups')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setTopups((data as TopUpRecord[]) ?? []);
        setLoadingHistory(false);
      });
  }, [user?.id]);

  /* Add money */
  const handleAddMoney = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!user || isNaN(num) || num <= 0) {
      setFormError('Please enter a valid amount.');
      return;
    }
    if (num > 1000000) {
      setFormError('Maximum top-up is ₨ 1,000,000.');
      return;
    }

    setAdding(true);
    setFormError('');

    // 1. Update user balance
    const newBalance = (user.balance_pkr ?? 0) + num;
    const { error: balErr } = await supabase
      .from('users')
      .update({ balance_pkr: newBalance })
      .eq('id', user.id);

    if (balErr) {
      setFormError('Failed to update balance. Try again.');
      setAdding(false);
      return;
    }

    // 2. Record in topups table (optional — won't fail if table missing)
    const { data: newRecord } = await supabase
      .from('topups')
      .insert({ user_id: user.id, amount: num })
      .select()
      .single();

    if (newRecord) {
      setTopups((prev) => [newRecord as TopUpRecord, ...prev]);
    }

    await refreshUser();
    setAddedMsg(`✓ ₨ ${num.toLocaleString()} added to your balance!`);
    setAmount('');
    setShowForm(false);
    setAdding(false);

    setTimeout(() => setAddedMsg(''), 4000);
  };

  /* Withdraw money (Worker) */
  const handleWithdraw = async () => {
    if (!user || user.balance_pkr <= 0) {
       setFormError('No funds available to withdraw.');
       return;
    }
    setWithdrawing(true);
    setFormError('');

    const { error: balErr } = await supabase
      .from('users')
      .update({ balance_pkr: 0 })
      .eq('id', user.id);

    if (balErr) {
      setFormError('Failed to process withdrawal.');
      setWithdrawing(false);
      return;
    }

    await refreshUser();
    setAddedMsg('✓ Withdrawal processed via JazzCash (Mock)');
    setWithdrawing(false);
    setTimeout(() => setAddedMsg(''), 4000);
  };

  const quickAmounts = [500, 1000, 2000, 5000];

  return (
    <div
      className="min-h-screen pt-20 pb-12 px-4"
      style={{ backgroundColor: 'var(--bg-page)' }}
    >
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1
            className="text-2xl font-display font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            My Wallet
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            میرا بیلنس — Your balance
          </p>
        </div>

        {/* ── Balance Card ── */}
        <div
          className="rounded-2xl p-6 mb-4 relative overflow-hidden animate-fadeUp"
          style={{
            background: 'linear-gradient(135deg, var(--indigo) 0%, #7C3AED 100%)',
            boxShadow: '0 8px 32px rgba(79,70,229,0.3)',
          }}
        >
          {/* Decorative circles */}
          <div
            className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10"
            style={{ background: 'white', transform: 'translate(30%, -30%)' }}
          />
          <div
            className="absolute bottom-0 left-0 w-24 h-24 rounded-full opacity-10"
            style={{ background: 'white', transform: 'translate(-30%, 30%)' }}
          />

          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <WalletIcon size={16} color="rgba(255,255,255,0.8)" />
              <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>
                Available Balance
              </span>
            </div>
            <p className="text-4xl font-display font-bold text-white mb-1">
              ₨ {(user?.balance_pkr ?? 0).toLocaleString()}
            </p>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
              {user?.name} · {user?.phone}
            </p>
          </div>
        </div>

        {/* Success message */}
        {addedMsg && (
          <div
            className="flex items-center gap-2 text-sm rounded-xl px-4 py-3 mb-4 animate-popIn"
            style={{
              backgroundColor: 'var(--green-soft)',
              color: 'var(--green)',
              border: '1px solid var(--green-border)',
            }}
          >
            <Check size={16} />
            {addedMsg}
          </div>
        )}

        {/* ── Add/Withdraw Buttons / Form ── */}
        {!showForm ? (
          <div className="mb-6 space-y-3">
            {isOwner ? (
               <button
                 onClick={() => setShowForm(true)}
                 className="btn-primary w-full flex items-center justify-center gap-2"
                 style={{ backgroundColor: '#ed1c24' /* JazzCash Red */ }}
               >
                 <span className="font-bold border border-white px-2 py-0.5 rounded text-xs bg-white text-[#ed1c24]">
                   JazzCash
                 </span>
                 <Plus size={20} />
                 Add Money (Top Up)
               </button>
            ) : (
               <button
                 onClick={handleWithdraw}
                 disabled={withdrawing || (user?.balance_pkr || 0) <= 0}
                 className="btn-primary w-full flex items-center justify-center gap-2"
                 style={{ backgroundColor: 'var(--green)' }}
               >
                 {withdrawing ? (
                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                 ) : (
                   <>
                     <ArrowUpRight size={20} />
                     Withdraw via JazzCash
                   </>
                 )}
               </button>
            )}
          </div>
        ) : (
          <form
            onSubmit={handleAddMoney}
            className="card p-5 mb-6 animate-popIn space-y-4"
          >
            <div className="flex items-center justify-between mb-1">
              <h2
                className="font-bold"
                style={{ color: 'var(--text-primary)' }}
              >
                Add Funds
              </h2>
              <button
                type="button"
                onClick={() => { setShowForm(false); setFormError(''); setAmount(''); }}
                className="text-sm font-medium"
                style={{ color: 'var(--text-muted)' }}
              >
                Cancel
              </button>
            </div>

            {/* Quick amounts */}
            <div>
              <p className="label mb-2">Quick select</p>
              <div className="grid grid-cols-4 gap-2">
                {quickAmounts.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setAmount(String(q))}
                    className="rounded-xl py-2 text-sm font-semibold transition-all"
                    style={{
                      backgroundColor:
                        amount === String(q) ? 'var(--indigo-soft)' : 'var(--bg-muted)',
                      color:
                        amount === String(q) ? 'var(--indigo)' : 'var(--text-secondary)',
                      border: `1.5px solid ${amount === String(q) ? 'var(--indigo)' : 'var(--border)'}`,
                    }}
                  >
                    ₨{q >= 1000 ? `${q / 1000}k` : q}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom amount */}
            <div>
              <label className="label" htmlFor="topup-amount">Or enter amount (PKR)</label>
              <div className="relative">
                <span
                  className="absolute left-4 top-1/2 -translate-y-1/2 font-bold"
                  style={{ color: 'var(--text-muted)' }}
                >
                  ₨
                </span>
                <input
                  id="topup-amount"
                  type="number"
                  min="1"
                  max="1000000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="input pl-9"
                />
              </div>
            </div>

            {formError && (
              <p className="text-sm font-medium" style={{ color: 'var(--red)' }}>
                {formError}
              </p>
            )}

            <button
              type="submit"
              disabled={adding || !amount || parseFloat(amount) <= 0}
              className="btn-accept w-full"
            >
              {adding ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <PlusCircle size={18} />
                  Top Up ₨ {amount ? parseFloat(amount).toLocaleString() : '—'} 
                </>
              )}
            </button>
          </form>
        )}

        {/* ── Top-Up History ── */}
        <div>
          <h2
            className="text-xs font-bold uppercase tracking-wider mb-3"
            style={{ color: 'var(--text-muted)' }}
          >
            Top-Up History
          </h2>

          {loadingHistory && (
            <div className="flex justify-center py-8">
              <div
                className="w-6 h-6 border-2 rounded-full animate-spin"
                style={{ borderColor: 'var(--border)', borderTopColor: 'var(--indigo)' }}
              />
            </div>
          )}

          {!loadingHistory && topups.length === 0 && (
            <div
              className="card p-8 text-center"
              style={{ color: 'var(--text-muted)' }}
            >
              <WalletIcon size={28} className="mx-auto mb-3" />
              <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                No top-ups yet
              </p>
              <p className="text-sm mt-1">Your deposits will appear here</p>
            </div>
          )}

          <div className="space-y-2">
            {topups.map((tx) => (
              <div
                key={tx.id}
                className="card p-4 flex items-center gap-3 animate-fadeUp"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: 'var(--green-soft)' }}
                >
                  <ArrowDownLeft size={16} style={{ color: 'var(--green)' }} />
                </div>
                <div className="flex-1">
                  <p
                    className="font-semibold text-sm"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Money Added
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {new Date(tx.created_at).toLocaleDateString('en-PK', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <p
                  className="font-bold text-base shrink-0"
                  style={{ color: 'var(--green)' }}
                >
                  + ₨ {tx.amount.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
