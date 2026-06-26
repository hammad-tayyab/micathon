/**
 * App.tsx — Root of the application.
 * Wraps everything in ThemeProvider + AuthProvider.
 * Handles page routing based on `nav` state (no external router needed).
 */
import { useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
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

  /* ── Loading splash ── */
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--bg-page)' }}
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-10 h-10 border-2 rounded-full animate-spin"
            style={{
              borderColor: 'var(--border)',
              borderTopColor: 'var(--indigo)',
            }}
          />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Loading Nighabaan...
          </p>
        </div>
      </div>
    );
  }

  /* ── Not logged in → Login/Signup screen ── */
  if (!user) {
    return <Login />;
  }

  /* ── Logged in → Main app ── */
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
    <ThemeProvider>
      <AuthProvider>
        <AppInner />
        <Analytics />
      </AuthProvider>
    </ThemeProvider>
  );
}
