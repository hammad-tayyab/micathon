/**
 * types/index.ts
 * Central type definitions for the entire Nighabaan app.
 */

/** Roles — 'homeowner' stored in DB, displayed as 'Owner' in UI */
export type UserRole = 'homeowner' | 'worker';

/** Job lifecycle: open → hired (or closed) */
export type JobStatus = 'open' | 'hired' | 'closed';

/** A user account */
export interface User {
  id: string;
  phone: string;
  name: string;
  role: UserRole;
  city: string;
  balance_pkr: number;
  created_at: string;
}

/** A job posting */
export interface Job {
  id: string;
  title: string;
  description: string;
  city: string;
  homeowner_id: string;      // original DB column name
  worker_id?: string;
  total_amount: number;
  status: JobStatus;
  /** Array of worker user IDs who clicked Accept */
  accepted_by: string[];
  created_at: string;
  /** Joined owner details */
  owner?: User;
  /** Workers who accepted — populated on detail view */
  accepted_workers?: User[];
}

/** App pages */
export type Page = 'dashboard' | 'create-job' | 'job-detail' | 'wallet';

export interface NavState {
  page: Page;
  jobId?: string;
}
