import { useState, useEffect } from 'react';
import { Plus, MapPin, Briefcase, HardHat, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Job, NavState } from '../types';
import { JobCard } from '../components/JobCard';

interface DashboardProps {
  navigate: (state: NavState) => void;
}

/**
 * Dashboard Page
 * Owner: sees their posted jobs, can post a new one.
 * Worker: sees all open jobs in their city with inline Accept buttons.
 */
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
      // Owner: see jobs they posted
      const { data } = await supabase
        .from('jobs')
        .select('*, owner:users!homeowner_id(id, name, phone, role, city)')
        .eq('homeowner_id', user.id)
        .order('created_at', { ascending: false });
      setJobs((data as Job[]) ?? []);
    } else {
      // Worker: see ALL open jobs in their city
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
    <div
      className="min-h-screen pt-20 pb-10 px-4"
      style={{ backgroundColor: 'var(--bg-page)' }}
    >
      <div className="max-w-lg mx-auto">

        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1
              className="text-2xl font-display font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              Hi, {user?.name?.split(' ')[0]} 👋
            </h1>
            <div
              className="flex items-center gap-1.5 mt-1 text-sm font-medium"
              style={{ color: 'var(--text-secondary)' }}
            >
              <MapPin size={13} style={{ color: 'var(--indigo)' }} />
              <span className="capitalize">{user?.city}</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold ml-1"
                style={{
                  backgroundColor: isOwner ? 'var(--indigo-soft)' : 'var(--green-soft)',
                  color: isOwner ? 'var(--indigo)' : 'var(--green)',
                }}
              >
                {isOwner ? 'Owner' : 'Worker'}
              </span>
            </div>
          </div>

          {/* Refresh button */}
          <button
            onClick={() => fetchJobs(true)}
            disabled={refreshing}
            className="p-2 rounded-xl transition-all"
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              color: 'var(--text-muted)',
            }}
            title="Refresh"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* ── Owner: Post New Job Button ── */}
        {isOwner && (
          <button
            onClick={() => navigate({ page: 'create-job' })}
            className="btn-primary mb-6"
            style={{ backgroundColor: 'var(--indigo)' }}
          >
            <Plus size={20} />
            Post a New Job — نئی نوکری
          </button>
        )}

        {/* ── Loading ── */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div
              className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: 'var(--border)', borderTopColor: 'var(--indigo)' }}
            />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Loading jobs...
            </p>
          </div>
        )}

        {/* ── Owner Job Lists ── */}
        {!loading && isOwner && (
          <div className="space-y-6">
            {openJobs.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Briefcase size={15} style={{ color: 'var(--indigo)' }} />
                  <h2
                    className="text-xs font-bold uppercase tracking-wider"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Active Jobs ({openJobs.length})
                  </h2>
                </div>
                <div className="space-y-3">
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
                <h2
                  className="text-xs font-bold uppercase tracking-wider mb-3"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Past Jobs ({closedJobs.length})
                </h2>
                <div className="space-y-3">
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
                icon={<Briefcase size={32} style={{ color: 'var(--text-muted)' }} />}
                title="No jobs yet"
                subtitle='Tap "Post a New Job" to get started'
              />
            )}
          </div>
        )}

        {/* ── Worker Job Feed ── */}
        {!loading && !isOwner && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <HardHat size={15} style={{ color: 'var(--green)' }} />
              <h2
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: 'var(--text-muted)' }}
              >
                Jobs in{' '}
                <span className="capitalize" style={{ color: 'var(--text-primary)' }}>
                  {user?.city}
                </span>{' '}
                ({jobs.length})
              </h2>
            </div>

            {jobs.length === 0 ? (
              <EmptyState
                icon={<HardHat size={32} style={{ color: 'var(--text-muted)' }} />}
                title="No open jobs nearby"
                subtitle="Check back later — new jobs will appear here"
              />
            ) : (
              jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onAccepted={() => fetchJobs()}
                />
              ))
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
    <div className="flex flex-col items-center justify-center py-16 gap-4 animate-fadeUp">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{ backgroundColor: 'var(--bg-muted)' }}
      >
        {icon}
      </div>
      <div className="text-center">
        <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
          {title}
        </p>
        {subtitle && (
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
