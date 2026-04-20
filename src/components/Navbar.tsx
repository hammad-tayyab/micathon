import { LayoutDashboard, Wallet, LogOut, Shield, Sun, Moon, MapPin, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { NavState } from '../types';

interface NavbarProps {
  current: NavState;
  navigate: (state: NavState) => void;
}

/**
 * Navbar
 * Fixed top bar with: logo, nav links (Home + Wallet), theme toggle, user info, logout.
 * Owners also get a "Post Job" shortcut pill.
 */
export function Navbar({ current, navigate }: NavbarProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const isOwner = user?.role === 'owner';

  const navBtn = (
    page: NavState['page'],
    icon: React.ReactNode,
    label: string
  ) => {
    const active = current.page === page;
    return (
      <button
        onClick={() => navigate({ page })}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all"
        style={{
          backgroundColor: active ? 'var(--indigo-soft)' : 'transparent',
          color: active ? 'var(--indigo)' : 'var(--text-secondary)',
        }}
      >
        {icon}
        <span className="hidden sm:inline">{label}</span>
      </button>
    );
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md"
      style={{
        backgroundColor: `color-mix(in srgb, var(--bg-surface) 92%, transparent)`,
        borderBottom: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div className="max-w-lg mx-auto px-4 h-16 flex items-center justify-between gap-3">

        {/* ── Logo ── */}
        <button
          onClick={() => navigate({ page: 'dashboard' })}
          className="flex items-center gap-2 shrink-0"
        >
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm"
            style={{ backgroundColor: 'var(--indigo)' }}
          >
            <Shield size={15} color="white" />
          </div>
          <div className="hidden xs:block">
            <span
              className="font-display font-bold text-base leading-none block"
              style={{ color: 'var(--text-primary)' }}
            >
              Nighabaan
            </span>
          </div>
        </button>

        {/* ── Nav Links ── */}
        <div className="flex items-center gap-0.5">
          {navBtn('dashboard', <LayoutDashboard size={16} />, 'Home')}
          {navBtn('wallet', <Wallet size={16} />, 'Wallet')}

          {/* Owner: quick post job */}
          {isOwner && (
            <button
              onClick={() => navigate({ page: 'create-job' })}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all ml-1"
              style={{
                backgroundColor:
                  current.page === 'create-job' ? 'var(--indigo-soft)' : 'var(--bg-muted)',
                color:
                  current.page === 'create-job' ? 'var(--indigo)' : 'var(--text-secondary)',
                border: '1.5px solid var(--border)',
              }}
            >
              <Plus size={15} />
              <span className="hidden sm:inline">Post Job</span>
            </button>
          )}
        </div>

        {/* ── Right Side ── */}
        <div className="flex items-center gap-1 shrink-0">

          {/* City badge */}
          {user?.city && (
            <div
              className="hidden sm:flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full"
              style={{
                backgroundColor: 'var(--indigo-soft)',
                color: 'var(--indigo)',
              }}
            >
              <MapPin size={10} />
              <span className="capitalize">{user.city}</span>
            </div>
          )}

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl transition-all"
            style={{
              color: 'var(--text-muted)',
              backgroundColor: 'transparent',
            }}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light'
              ? <Moon size={16} />
              : <Sun size={16} />
            }
          </button>

          {/* Logout */}
          <button
            onClick={logout}
            className="p-2 rounded-xl transition-all"
            style={{ color: 'var(--text-muted)' }}
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </nav>
  );
}
