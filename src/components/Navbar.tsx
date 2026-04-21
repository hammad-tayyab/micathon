import { MapPin, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NavState } from '../types';

interface NavbarProps {
  current: NavState;
  navigate: (state: NavState) => void;
}

export function Navbar({ current, navigate }: NavbarProps) {
  const { user, logout } = useAuth();
  const isOwner = user?.role === 'owner';

  const navBtn = (page: NavState['page'], label: string) => {
    const active = current.page === page;
    return (
      <button
        onClick={() => navigate({ page })}
        className={`px-3 py-1.5 text-sm transition-all duration-300 tracking-wide font-medium ${
          active 
            ? 'text-white drop-shadow-[0_0_4px_rgba(255,255,255,0.4)]' 
            : 'text-muted hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]'
        }`}
      >
        {label}
      </button>
    );
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#050505]/80 border-b border-white/5">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        
        {/* ── Logo ── */}
        <button
          onClick={() => navigate({ page: 'dashboard' })}
          className="flex items-center gap-3 shrink-0 group"
        >
          <div className="flex items-center justify-center group-hover:scale-105 transition-transform">
            <svg width="28" height="28" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 2L38 12.3923V32.3923L20 42.7846L2 32.3923V12.3923L20 2Z" fill="transparent" stroke="#4F46E5" strokeWidth="1" strokeOpacity="1"/>
              <path d="M12 28V12L28 28V12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="hidden xs:block font-display font-medium text-sm sub-tracking uppercase text-white">
            Nighabaan
          </span>
        </button>

        {/* ── Nav Links ── */}
        <div className="flex items-center gap-1">
          {navBtn('dashboard', 'Marketplace')}
          {navBtn('wallet', 'Wallet')}
          <button
            onClick={() => navigate({ page: 'dashboard' })}
            className="px-3 py-1.5 text-sm transition-all duration-300 tracking-wide font-medium text-muted hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
          >
            History
          </button>
        </div>

        {/* ── Right Side ── */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* Post Job (Minimalist Outline) */}
          {isOwner && (
            <button
              onClick={() => navigate({ page: 'create-job' })}
              className={`px-4 py-1.5 text-xs tracking-widest font-medium uppercase rounded-full border transition-all ${
                current.page === 'create-job'
                  ? 'border-indigo-500 bg-indigo-500/10 text-white'
                  : 'border-white/10 text-muted hover:border-white/30 hover:text-white'
              }`}
            >
              Post
            </button>
          )}

          {/* City */}
          {user?.city && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium px-3 py-1 text-muted border border-white/5 rounded-full">
              <MapPin size={12} />
              <span className="capitalize">{user.city}</span>
            </div>
          )}

          {/* Logout */}
          <button
            onClick={logout}
            className="p-1.5 rounded-full transition-all text-muted hover:text-red-400 hover:bg-red-400/10"
            title="Logout"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </nav>
  );
}
