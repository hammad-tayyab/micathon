import { CheckCircle, Zap, UserCheck } from 'lucide-react';
import { JobStatus } from '../types';

const statusConfig: Record<JobStatus, { label: string; icon: React.ReactNode; bg: string; color: string }> = {
  open: {
    label: 'Open',
    icon: <Zap size={11} />,
    bg: 'var(--green-soft)',
    color: 'var(--green)',
  },
  hired: {
    label: 'Hired ✓',
    icon: <UserCheck size={11} />,
    bg: 'var(--indigo-soft)',
    color: 'var(--indigo)',
  },
  closed: {
    label: 'Closed',
    icon: <CheckCircle size={11} />,
    bg: 'var(--bg-muted)',
    color: 'var(--text-muted)',
  },
};

interface StatusBadgeProps {
  status: JobStatus;
  size?: 'sm' | 'md';
}

/** A small colored pill showing the job's current status. */
export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig.open;
  const sizeClass = size === 'md' ? 'text-sm px-3 py-1.5 gap-1.5' : 'text-xs px-2.5 py-1 gap-1';
  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ${sizeClass}`}
      style={{ backgroundColor: config.bg, color: config.color }}
    >
      {config.icon}
      {config.label}
    </span>
  );
}
