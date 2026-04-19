import { useState, useEffect } from 'react';
import { Plus, Lock, TrendingUp, Briefcase, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Job, NavState } from '../types';
import { JobCard } from '../components/JobCard';

interface DashboardProps {
  navigate: (state: NavState) => void;
}

/**
 * Dashboard Page
 * The main screen the user sees after logging in.
 * It fetches and displays the jobs related to the user (either jobs they created or jobs assigned to them).
 * It also shows a quick summary of their wallet balance and locked escrow funds.
 */
export function Dashboard({ navigate }: DashboardProps) {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const isHomeowner = user?.role === 'homeowner';

  // This block runs automatically and fetches all jobs where the current user is either the homeowner or the worker.
  useEffect(() => {
    if (!user) return;
    const field = isHomeowner ? 'homeowner_id' : 'worker_id';

    supabase
      .from('jobs')
      .select(`
        *,
        homeowner:homeowner_id(id, name, phone, role),
        worker:worker_id(id, name, phone, role)
      `)
      .eq(field, user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setJobs((data as Job[]) ?? []);
        setLoading(false);
      });
  }, [user, isHomeowner]);

  const securedJobs = jobs.filter((j) => j.status === 'funds_secured' || j.status === 'release_requested');
  const completedJobs = jobs.filter((j) => j.status === 'completed');
  const totalSecured = securedJobs.reduce((s, j) => s + j.total_amount, 0);

  return (
    <div className="min-h-screen bg-[#0D1B2A] pt-24 pb-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white font-display">
            Welcome back, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-slate-400 text-sm mt-1 capitalize">{user?.role} Account</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-8 sm:grid-cols-3">
          <div className="bg-[#162233] border border-[#1e3448] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 bg-amber-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp size={14} className="text-amber-400" />
              </div>
              <span className="text-slate-400 text-xs">Wallet</span>
            </div>
            <p className="text-xl font-bold text-white">₨ {(user?.balance_pkr ?? 0).toLocaleString()}</p>
          </div>

          <div className="bg-[#162233] border border-[#1e3448] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 bg-amber-500/20 rounded-lg flex items-center justify-center">
                <Lock size={14} className="text-amber-400" />
              </div>
              <span className="text-slate-400 text-xs">In Escrow</span>
            </div>
            <p className="text-xl font-bold text-white">₨ {totalSecured.toLocaleString()}</p>
          </div>

          <div className="bg-[#162233] border border-[#1e3448] rounded-xl p-4 col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Briefcase size={14} className="text-green-400" />
              </div>
              <span className="text-slate-400 text-xs">Completed</span>
            </div>
            <p className="text-xl font-bold text-white">{completedJobs.length} Jobs</p>
          </div>
        </div>

        {isHomeowner && (
          <button
            onClick={() => navigate({ page: 'create-job' })}
            className="w-full bg-amber-500 hover:bg-amber-400 text-[#0D1B2A] font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors mb-8 shadow-lg shadow-amber-500/20 text-lg"
          >
            <Plus size={22} />
            Secure a New Job
          </button>
        )}

        <div className="space-y-6">
          {securedJobs.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Lock size={15} className="text-amber-400" />
                <h2 className="text-white font-semibold text-sm uppercase tracking-wider">
                  {isHomeowner ? 'Active Escrow' : 'Payment Secured'}
                </h2>
              </div>

              {!isHomeowner && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 mb-3 flex items-start gap-3">
                  <Lock size={16} className="text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-amber-300 text-sm">
                    Your payment is locked safely in Nighabaan. You will receive it as soon as you complete the job.
                  </p>
                </div>
              )}

              <div className="space-y-2">
                {securedJobs.map((job) => (
                  <JobCard key={job.id} job={job} navigate={navigate} />
                ))}
              </div>
            </div>
          )}

          {jobs.filter((j) => j.status === 'active').length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Users size={15} className="text-blue-400" />
                <h2 className="text-white font-semibold text-sm uppercase tracking-wider">Pending</h2>
              </div>
              <div className="space-y-2">
                {jobs
                  .filter((j) => j.status === 'active')
                  .map((job) => (
                    <JobCard key={job.id} job={job} navigate={navigate} />
                  ))}
              </div>
            </div>
          )}

          {completedJobs.length > 0 && (
            <div>
              <h2 className="text-slate-500 font-semibold text-sm uppercase tracking-wider mb-3">
                Completed
              </h2>
              <div className="space-y-2">
                {completedJobs.map((job) => (
                  <JobCard key={job.id} job={job} navigate={navigate} />
                ))}
              </div>
            </div>
          )}

          {jobs.length === 0 && !loading && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-[#162233] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Briefcase size={28} className="text-slate-600" />
              </div>
              <p className="text-slate-400 font-medium">No jobs yet</p>
              {isHomeowner && (
                <p className="text-slate-600 text-sm mt-1">
                  Create your first job to get started
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
