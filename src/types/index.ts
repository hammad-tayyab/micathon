export type UserRole = 'homeowner' | 'worker';

export type JobStatus = 'active' | 'funds_secured' | 'release_requested' | 'completed' | 'disputed';

export interface User {
  id: string;
  phone: string;
  name: string;
  role: UserRole;
  balance_pkr: number;
  created_at: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  total_amount: number;
  homeowner_id: string;
  worker_id: string;
  status: JobStatus;
  proof_note: string;
  created_at: string;
  homeowner?: User;
  worker?: User;
}

export interface Transaction {
  id: string;
  job_id: string;
  user_id: string;
  amount: number;
  type: 'lock' | 'release' | 'fee';
  created_at: string;
}

export type Page = 'login' | 'dashboard' | 'create-job' | 'job-detail' | 'wallet';

export interface NavState {
  page: Page;
  jobId?: string;
}
