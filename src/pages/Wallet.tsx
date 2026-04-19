import { useState, useEffect } from 'react';
import { Wallet as WalletIcon, ArrowDownLeft, ArrowUpRight, Lock, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Transaction, Job } from '../types';

interface EnrichedTransaction extends Transaction {
  job?: Pick<Job, 'id' | 'title'>;
}

/**
 * Wallet Page
 * Shows the user their available balance and a history of all their money movements.
 * This includes money locked for a job, money received from jobs, and platform fees.
 */
export function Wallet() {
  const { user, refreshUser } = useAuth();
  const [transactions, setTransactions] = useState<EnrichedTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Loads all financial transactions for the logged-in user from the database.
  useEffect(() => {
    if (!user) return;
    refreshUser();

    supabase
      .from('transactions')
      .select(`*, job:job_id(id, title)`)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setTransactions((data as EnrichedTransaction[]) ?? []);
        setLoading(false);
      });
  }, [user?.id]);

  const totalEarned = transactions
    .filter((t) => t.type === 'release')
    .reduce((s, t) => s + t.amount, 0);

  const totalLocked = transactions
    .filter((t) => t.type === 'lock')
    .reduce((s, t) => s + t.amount, 0);

  const typeConfig = {
    lock: {
      icon: <Lock size={14} className="text-amber-400" />,
      label: 'Funds Locked',
      bg: 'bg-amber-500/10',
      amountClass: 'text-amber-400',
      prefix: '−',
    },
    release: {
      icon: <ArrowDownLeft size={14} className="text-green-400" />,
      label: 'Payment Received',
      bg: 'bg-green-500/10',
      amountClass: 'text-green-400',
      prefix: '+',
    },
    fee: {
      icon: <ArrowUpRight size={14} className="text-slate-400" />,
      label: 'Platform Fee',
      bg: 'bg-slate-500/10',
      amountClass: 'text-slate-400',
      prefix: '−',
    },
  };

  return (
    <div className="min-h-screen bg-[#0D1B2A] pt-24 pb-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white font-display">Wallet</h1>
          <p className="text-slate-400 text-sm mt-1">Your balance and transaction history</p>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 mb-6 relative overflow-hidden shadow-xl shadow-amber-500/20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-black/10 rounded-full translate-y-6 -translate-x-6" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <WalletIcon size={18} className="text-[#0D1B2A]" />
              <span className="text-[#0D1B2A] font-semibold text-sm">Available Balance</span>
            </div>
            <p className="text-[#0D1B2A] text-4xl font-bold font-display">
              ₨ {(user?.balance_pkr ?? 0).toLocaleString()}
            </p>
            <p className="text-[#0D1B2A]/70 text-sm mt-2">{user?.name} · {user?.phone}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-[#162233] border border-[#1e3448] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={14} className="text-green-400" />
              <span className="text-slate-400 text-xs">Total Earned</span>
            </div>
            <p className="text-white font-bold text-lg">₨ {totalEarned.toLocaleString()}</p>
          </div>
          <div className="bg-[#162233] border border-[#1e3448] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Lock size={14} className="text-amber-400" />
              <span className="text-slate-400 text-xs">Total Locked</span>
            </div>
            <p className="text-white font-bold text-lg">₨ {totalLocked.toLocaleString()}</p>
          </div>
        </div>

        <div>
          <h2 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Transaction History</h2>

          {loading && (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-[#1e3448] border-t-amber-500 rounded-full animate-spin" />
            </div>
          )}

          {!loading && transactions.length === 0 && (
            <div className="text-center py-12 bg-[#162233] border border-[#1e3448] rounded-xl">
              <WalletIcon size={28} className="text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No transactions yet</p>
            </div>
          )}

          <div className="space-y-2">
            {transactions.map((tx) => {
              const config = typeConfig[tx.type];
              return (
                <div
                  key={tx.id}
                  className="bg-[#162233] border border-[#1e3448] rounded-xl p-4 flex items-center gap-3"
                >
                  <div className={`w-9 h-9 ${config.bg} rounded-lg flex items-center justify-center shrink-0`}>
                    {config.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {tx.job?.title ?? 'Unknown Job'}
                    </p>
                    <p className="text-slate-500 text-xs">{config.label}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`font-bold ${config.amountClass}`}>
                      {config.prefix}₨ {tx.amount.toLocaleString()}
                    </p>
                    <p className="text-slate-600 text-xs">
                      {new Date(tx.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
