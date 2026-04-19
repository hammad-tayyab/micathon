import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { CreateJob } from './pages/CreateJob';
import { JobDetail } from './pages/JobDetail';
import { Wallet } from './pages/Wallet';
import { Navbar } from './components/Navbar';
import { NavState } from './types';

function AppInner() {
  const { user, loading } = useAuth();
  const [nav, setNav] = useState<NavState>({ page: 'dashboard' });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D1B2A] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[#1e3448] border-t-amber-500 rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Loading Nighabaan...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <>
      <Navbar current={nav} navigate={setNav} />
      {nav.page === 'dashboard' && <Dashboard navigate={setNav} />}
      {nav.page === 'create-job' && <CreateJob navigate={setNav} />}
      {nav.page === 'job-detail' && nav.jobId && (
        <JobDetail jobId={nav.jobId} navigate={setNav} />
      )}
      {nav.page === 'wallet' && <Wallet />}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
