import { useState, useEffect } from 'react';
import { Wallet as WalletIcon, Plus, ArrowDownLeft, Check, PlusCircle, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface TopUpRecord {
  id: string;
  amount: number;
  created_at: string;
}

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

    // 2. Record in topups table
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
    <div className="min-h-screen pt-20 pb-12 px-4 bg-page text-primary">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-display tracking-wide font-semibold text-white">
            My Wallet
          </h1>
          <p className="text-sm mt-1 text-muted">
            میرا بیلنس — Your balance
          </p>
        </div>

        {/* ── Balance Card ── */}
        <div className="rounded-xl p-8 mb-6 relative overflow-hidden animate-fadeUp bg-silk border border-white/10 shadow-lg">
          <div className="relative z-10 flex flex-col gap-1">
            <div className="flex items-center gap-2 mb-2 tracking-widest text-xs uppercase text-muted font-medium">
              <WalletIcon size={16} />
              <span>Available Balance</span>
            </div>
            <p className="text-5xl font-display font-medium text-white mb-2 tracking-tight">
              ₨ {(user?.balance_pkr ?? 0).toLocaleString()}
            </p>
            <p className="text-sm font-medium text-muted/70 tracking-wide">
              {user?.name} &nbsp;·&nbsp; {user?.phone}
            </p>
          </div>
        </div>

        {/* Success message */}
        {addedMsg && (
          <div className="flex items-center gap-2 text-sm rounded-lg px-4 py-3 mb-4 animate-popIn bg-green-500/10 text-green-400 border border-green-500/20">
            <Check size={16} />
            {addedMsg}
          </div>
        )}

        {/* ── Add/Withdraw Buttons / Form ── */}
        {!showForm ? (
          <div className="mb-10 space-y-3">
            {isOwner ? (
               <button
                 onClick={() => setShowForm(true)}
                 className="btn-primary"
               >
                 <Plus size={18} />
                 Top Up Balance
               </button>
            ) : (
               <button
                 onClick={handleWithdraw}
                 disabled={withdrawing || (user?.balance_pkr || 0) <= 0}
                 className="btn-accept"
               >
                 {withdrawing ? (
                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                 ) : (
                   <>
                     <ArrowUpRight size={18} />
                     Withdraw via JazzCash
                   </>
                 )}
               </button>
            )}
          </div>
        ) : (
          <form
            onSubmit={handleAddMoney}
            className="card p-6 mb-10 animate-popIn space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-white tracking-wide">
                Add Funds
              </h2>
              <button
                type="button"
                onClick={() => { setShowForm(false); setFormError(''); setAmount(''); }}
                className="text-xs font-semibold text-muted hover:text-white uppercase tracking-wider"
              >
                Cancel
              </button>
            </div>

            {/* Quick amounts */}
            <div>
              <p className="text-xs uppercase tracking-widest text-muted mb-3 font-medium">Quick select</p>
              <div className="grid grid-cols-4 gap-2">
                {quickAmounts.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setAmount(String(q))}
                    className={`rounded-lg py-2.5 text-sm font-medium transition-all border ${
                      amount === String(q) 
                      ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' 
                      : 'border-white/5 bg-transparent text-muted hover:border-white/20 hover:text-white'
                    }`}
                  >
                    ₨{q >= 1000 ? `${q / 1000}k` : q}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom amount */}
            <div>
              <div className="floating-label-group mt-2">
                <input
                  id="topup-amount"
                  type="number"
                  min="1"
                  max="1000000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder=" "
                  className="input pl-10"
                />
                <label htmlFor="topup-amount" className="left-10">Amount (PKR)</label>
                <span className="absolute left-4 top-[55%] -translate-y-1/2 font-semibold text-muted pointer-events-none">
                  ₨
                </span>
              </div>
            </div>

            {formError && (
              <p className="text-sm font-medium text-red-400 bg-red-400/10 border border-red-400/20 px-3 py-2 rounded">
                {formError}
              </p>
            )}

            <button
              type="submit"
              disabled={adding || !amount || parseFloat(amount) <= 0}
              className="btn-primary"
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
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted mb-4">
            Recent Activity
          </h2>

          {loadingHistory && (
            <div className="flex justify-center py-8">
              <div className="w-5 h-5 border-2 border-white/10 border-t-indigo-500 rounded-full animate-spin" />
            </div>
          )}

          {!loadingHistory && topups.length === 0 && (
            <div className="card border-dashed border-white/10 p-8 text-center bg-transparent">
              <WalletIcon size={24} className="mx-auto mb-3 text-muted/50" />
              <p className="text-sm font-medium text-muted">
                No activity yet
              </p>
            </div>
          )}

          <div className="space-y-2">
            {topups.map((tx) => (
              <div
                key={tx.id}
                className="card p-4 flex items-center justify-between gap-4 animate-fadeUp bg-transparent border-white/5 hover:bg-white/5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-500/10 text-green-400 shrink-0">
                    <ArrowDownLeft size={16} />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-white">Deposit</p>
                    <p className="text-xs text-muted/70 uppercase tracking-wide mt-0.5">
                      {new Date(tx.created_at).toLocaleDateString('en-PK', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </p>
                  </div>
                </div>
                <p className="font-semibold text-sm text-green-400">
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
