import { ChevronRight, Lock } from 'lucide-react';
import { Job } from '../types';
import { StatusBadge } from './StatusBadge';
import { NavState } from '../types';

interface JobCardProps {
  job: Job;
  navigate: (state: NavState) => void;
}

/**
 * JobCard Component
 * Displays a summary of a single job. When clicked, it takes the user to the detailed view of that job.
 */
export function JobCard({ job, navigate }: JobCardProps) {
  const counterpart = job.homeowner || job.worker;

  return (
    <button
      onClick={() => navigate({ page: 'job-detail', jobId: job.id })}
      className="w-full text-left bg-[#162233] border border-[#1e3448] rounded-xl p-4 hover:border-amber-500/40 hover:bg-[#1a2a3d] transition-all group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {(job.status === 'funds_secured' || job.status === 'release_requested') && (
              <Lock size={14} className="text-amber-400 shrink-0" />
            )}
            <h3 className="font-semibold text-white truncate">{job.title}</h3>
          </div>

          {counterpart && (
            <p className="text-sm text-slate-400 mb-3">
              {job.homeowner ? `Worker: ${job.worker?.name ?? '—'}` : `Owner: ${job.homeowner?.name ?? '—'}`}
              {job.worker && !job.homeowner && `Worker: ${job.worker.name}`}
            </p>
          )}

          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-amber-400">
              ₨ {job.total_amount.toLocaleString()}
            </span>
            <StatusBadge status={job.status} />
          </div>
        </div>
        <ChevronRight size={18} className="text-slate-500 group-hover:text-amber-400 transition-colors shrink-0 mt-1" />
      </div>
    </button>
  );
}
