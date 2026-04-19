import { Lock, CheckCircle, Clock, AlertTriangle, Zap } from 'lucide-react';
import { JobStatus } from '../types';

const statusConfig: Record<JobStatus, { label: string; icon: React.ReactNode; classes: string }> = {
  active: {
    label: 'Active',
    icon: <Zap size={12} />,
    classes: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  },
  funds_secured: {
    label: 'Funds Locked',
    icon: <Lock size={12} />,
    classes: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
  },
  release_requested: {
    label: 'Release Requested',
    icon: <Clock size={12} />,
    classes: 'bg-orange-500/20 text-orange-300 border border-orange-500/30',
  },
  completed: {
    label: 'Completed',
    icon: <CheckCircle size={12} />,
    classes: 'bg-green-500/20 text-green-300 border border-green-500/30',
  },
  disputed: {
    label: 'Disputed',
    icon: <AlertTriangle size={12} />,
    classes: 'bg-red-500/20 text-red-300 border border-red-500/30',
  },
};

interface StatusBadgeProps {
  status: JobStatus;
  size?: 'sm' | 'md';
}

/**
 * StatusBadge Component
 * A small pill-shaped label that visually shows what stage a job is in (e.g., "Active", "Funds Locked", "Completed").
 */
export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const config = statusConfig[status];
  const sizeClass = size === 'md' ? 'text-sm px-3 py-1.5 gap-1.5' : 'text-xs px-2 py-1 gap-1';
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${sizeClass} ${config.classes}`}>
      {config.icon}
      {config.label}
    </span>
  );
}
