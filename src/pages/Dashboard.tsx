import { useState, useEffect } from 'react';
import { Plus, MapPin, Briefcase, HardHat, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Job, NavState } from '../types';
import { JobCard } from '../components/JobCard';

interface DashboardProps {
  navigate: (state: NavState) => void;
}

export function Dashboard({ navigate }: DashboardProps) {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isOwner = user?.role === 'owner';

  const fetchJobs = async (showRefresh = false) => {
    if (!user) return;
    if (showRefresh) setRefreshing(true);

    if (isOwner) {
      const { data } = await supabase
        .from('jobs')
        .select('*, owner:users!homeowner_id(id, name, phone, role, city)')
        .eq('homeowner_id', user.id)
        .order('created_at', { ascending: false });
      setJobs((data as Job[]) ?? []);
    } else {
      const { data } = await supabase
        .from('jobs')
        .select('*, owner:users!homeowner_id(id, name, phone, role, city)')
        .eq('city', user.city)
        .eq('status', 'open')
        .order('created_at', { ascending: false });
      setJobs((data as Job[]) ?? []);
    }

    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchJobs();
  }, [user]);

  const openJobs = jobs.filter((j) => j.status === 'open');
  const closedJobs = jobs.filter((j) => j.status !== 'open');

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-page text-primary flex flex-col">
      <div className="w-full max-w-xl mx-auto">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-display font-semibold tracking-wide text-white">
              Hi, {user?.name?.split(' ')[0]}
            </h1>
            <div className="flex items-center gap-2 mt-2 text-xs font-semibold uppercase tracking-widest text-muted">
              <MapPin size={12} />
              <span>{user?.city}</span>
              <span className="opacity-50 mx-1">|</span>
              <span className={isOwner ? "text-indigo-400" : "text-green-400"}>
                {isOwner ? 'Owner' : 'Worker'}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3">
            {isOwner && (
              <button
                onClick={() => navigate({ page: 'create-job' })}
                className="btn-primary py-2.5 px-5 text-xs tracking-widest uppercase rounded-full shadow-none"
              >
                <Plus size={16} />
                Post Job
              </button>
            )}
            <button
              onClick={() => fetchJobs(true)}
              disabled={refreshing}
              className="p-3 bg-surface rounded-full border border-white/5 hover:border-white/20 transition-all text-muted hover:text-white"
              title="Refresh"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-6 h-6 border-2 border-white/10 border-t-indigo-500 rounded-full animate-spin" />
            <p className="text-xs uppercase tracking-widest text-muted font-medium">Loading Tasks</p>
          </div>
        )}

        {/* ── Owner Job Lists ── */}
        {!loading && isOwner && (
          <div className="space-y-8">
            {openJobs.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Briefcase size={14} className="text-indigo-500" />
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">
                    Active Tasks ({openJobs.length})
                  </h2>
                </div>
                <div className="grid gap-3">
                  {openJobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      navigate={(s) => navigate(s)}
                    />
                  ))}
                </div>
              </section>
            )}

            {closedJobs.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold uppercase tracking-widest text-muted mb-4">
                  Past Tasks ({closedJobs.length})
                </h2>
                <div className="grid gap-3 opacity-80">
                  {closedJobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      navigate={(s) => navigate(s)}
                    />
                  ))}
                </div>
              </section>
            )}

            {jobs.length === 0 && (
              <EmptyState
                icon={<Briefcase size={28} className="text-muted/50" />}
                title="No tasks yet"
                subtitle='Create your first task to see it here'
              />
            )}
          </div>
        )}

        {/* ── Worker Job Feed ── */}
        {!loading && !isOwner && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
              <div className="flex items-center gap-2">
                <HardHat size={14} className="text-green-500" />
                <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">
                  Tasks Near You ({jobs.length})
                </h2>
              </div>
            </div>

            {jobs.length === 0 ? (
              <EmptyState
                icon={<HardHat size={28} className="text-muted/50" />}
                title="No open tasks nearby"
                subtitle="Check back later for new opportunities"
              />
            ) : (
              <div className="grid gap-4">
                {jobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onAccepted={() => fetchJobs()}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Empty State ── */
function EmptyState({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 animate-fadeUp">
      <div className="w-16 h-16 rounded-full flex items-center justify-center bg-surface border border-white/5 mb-2">
        {icon}
      </div>
      <div className="text-center">
        <p className="font-semibold text-white tracking-wide">{title}</p>
        {subtitle && (
          <p className="text-sm mt-1.5 text-muted/80">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
