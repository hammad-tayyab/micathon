import { LayoutDashboard, Wallet, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NavState } from '../types';

interface NavbarProps {
  current: NavState;
  navigate: (state: NavState) => void;
}

/**
 * Navbar Component
 * The menu bar at the top of the screen. It let users see their name/role, navigate to their dashboard or wallet, and log out.
 */
export function Navbar({ current, navigate }: NavbarProps) {
  const { user, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0D1B2A]/95 backdrop-blur border-b border-[#1e3448]">
      <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
        <button
          onClick={() => navigate({ page: 'dashboard' })}
          className="flex items-center gap-2 group"
        >
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
            <Shield size={16} className="text-[#0D1B2A]" />
          </div>
          <span className="font-bold text-white text-lg font-display">Nighabaan</span>
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate({ page: 'dashboard' })}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              current.page === 'dashboard'
                ? 'bg-amber-500/20 text-amber-400'
                : 'text-slate-400 hover:text-white hover:bg-[#162233]'
            }`}
          >
            <LayoutDashboard size={16} />
            <span className="hidden sm:inline">Dashboard</span>
          </button>

          <button
            onClick={() => navigate({ page: 'wallet' })}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              current.page === 'wallet'
                ? 'bg-amber-500/20 text-amber-400'
                : 'text-slate-400 hover:text-white hover:bg-[#162233]'
            }`}
          >
            <Wallet size={16} />
            <span className="hidden sm:inline">Wallet</span>
          </button>

          <div className="w-px h-5 bg-[#1e3448] mx-1" />

          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-slate-400 leading-none">{user?.name}</p>
              <p className="text-xs text-amber-500 capitalize leading-none mt-0.5">{user?.role}</p>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
