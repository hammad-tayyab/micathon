import { useState } from 'react';
import { Phone, User, MapPin, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

type Tab = 'signin' | 'signup';

export function Login() {
  const { signIn, signUp } = useAuth();

  const [tab, setTab] = useState<Tab>('signin');

  // Sign In state
  const [siPhone, setSiPhone] = useState('');
  const [siError, setSiError] = useState('');
  const [siLoading, setSiLoading] = useState(false);

  // Sign Up state
  const [suName, setSuName] = useState('');
  const [suPhone, setSuPhone] = useState('');
  const [suCity, setSuCity] = useState('');
  const [suRole, setSuRole] = useState<UserRole | null>(null);
  const [suError, setSuError] = useState('');
  const [suLoading, setSuLoading] = useState(false);

  /* ── Sign In ── */
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siPhone.trim()) return;
    setSiError('');
    setSiLoading(true);
    const { error } = await signIn(siPhone);
    if (error) setSiError(error);
    setSiLoading(false);
  };

  /* ── Sign Up ── */
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suRole) { setSuError('Please select your role.'); return; }
    setSuError('');
    setSuLoading(true);
    const { error } = await signUp(suName, suPhone, suCity, suRole);
    if (error) setSuError(error);
    setSuLoading(false);
  };

  const setHeroRole = (role: UserRole) => {
    setSuRole(role);
    setTab('signup');
    // scroll down on mobile
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 relative overflow-hidden text-primary">
      {/* Background dark abstract mesh/gradient (CSS only, using fixed bg) */}
      <div className="absolute inset-0 pointer-events-none z-0" style={{
        background: 'radial-gradient(circle at 30% 20%, rgba(79, 70, 229, 0.08) 0%, transparent 60%)'
      }} />

      {/* ── Left Side: Hero Section ── */}
      <div className="relative z-10 flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-20 animate-fadeUp">
        {/* N Logo Minimalist Hex Icon */}
        <div className="flex items-center gap-3 mb-10 opacity-80">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 2L38 12.3923V32.3923L20 42.7846L2 32.3923V12.3923L20 2Z" fill="transparent" stroke="var(--border-focus)" strokeWidth="1" strokeOpacity="0.5"/>
            <path d="M12 28V12L28 28V12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="font-display font-medium text-lg tracking-widest uppercase">Nighabaan</span>
        </div>

        <h1 className="text-5xl lg:text-7xl font-bold headline-tracking mb-6 leading-tight">
          <span className="text-transparent bg-clip-text bg-gradient-to-br from-white to-neutral-500">
            Local Labor.
          </span>
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-600">
            Locked Trust.
          </span>
        </h1>
        
        <p className="text-lg lg:text-xl text-muted mb-12 max-w-md font-light leading-relaxed">
          Pakistan’s first micro-escrow platform for domestic services.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 max-w-sm lg:max-w-none">
          <button 
            onClick={() => setHeroRole('owner')}
            className="btn-primary flex-1 !rounded-full py-4 text-sm tracking-wide bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 hover:border-slate-600"
          >
            I need a Service
          </button>
          <button 
            onClick={() => setHeroRole('worker')}
            className="btn-ghost flex-1 !rounded-full py-4 text-sm tracking-wide text-white border-white/20 hover:border-white/40 hover:bg-white/5"
          >
            I want to Work
          </button>
        </div>
      </div>

      {/* ── Right Side: Auth Form ── */}
      <div className="relative z-10 flex items-center justify-center p-8 sm:p-12 animate-fadeUp" style={{ animationDelay: '0.1s' }}>
        <div className="w-full max-w-md card p-6 sm:p-8 backdrop-blur-md bg-surface/80">
          
          {/* Tab Switcher */}
          <div className="flex border border-white/5 rounded-lg p-1 mb-8 bg-muted relative">
            <button
              onClick={() => setTab('signin')}
              className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all duration-300 z-10 ${tab === 'signin' ? 'text-white' : 'text-muted'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => setTab('signup')}
              className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all duration-300 z-10 ${tab === 'signup' ? 'text-white' : 'text-muted'}`}
            >
              Sign Up
            </button>
            {/* Sliding strict tab background */}
            <div 
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#2a2a2a] rounded-md transition-transform duration-300 pointer-events-none"
              style={{ transform: tab === 'signin' ? 'translateX(0%)' : 'translateX(calc(100% + 8px))' }}
            />
          </div>

          {/* ── Sign In Form ── */}
          {tab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-5 animate-popIn">
              <div className="floating-label-group">
                <input
                  id="si-phone"
                  type="tel"
                  value={siPhone}
                  onChange={(e) => setSiPhone(e.target.value)}
                  placeholder=" "
                  className="input pl-12"
                  autoComplete="tel"
                />
                <label htmlFor="si-phone" className="left-12">Phone Number</label>
                <Phone size={18} className="absolute left-4 top-[55%] -translate-y-1/2 text-muted pointer-events-none" />
              </div>

              {siError && (
                <p className="text-sm px-4 py-3 text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg">
                  {siError}
                </p>
              )}

              <button
                type="submit"
                disabled={siLoading || !siPhone.trim()}
                className="btn-primary mt-4"
              >
                {siLoading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Continue <ArrowRight size={16} /></>
                )}
              </button>
            </form>
          )}

          {/* ── Sign Up Form ── */}
          {tab === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4 animate-popIn">
              <div className="floating-label-group">
                <input
                  id="su-name"
                  type="text"
                  value={suName}
                  onChange={(e) => setSuName(e.target.value)}
                  placeholder=" "
                  className="input pl-12"
                  autoComplete="name"
                />
                <label htmlFor="su-name" className="left-12">Full Name</label>
                <User size={18} className="absolute left-4 top-[55%] -translate-y-1/2 text-muted pointer-events-none" />
              </div>

              <div className="floating-label-group">
                <input
                  id="su-phone"
                  type="tel"
                  value={suPhone}
                  onChange={(e) => setSuPhone(e.target.value)}
                  placeholder=" "
                  className="input pl-12"
                  autoComplete="tel"
                />
                <label htmlFor="su-phone" className="left-12">Phone Number</label>
                <Phone size={18} className="absolute left-4 top-[55%] -translate-y-1/2 text-muted pointer-events-none" />
              </div>

              <div className="floating-label-group">
                <input
                  id="su-city"
                  type="text"
                  value={suCity}
                  onChange={(e) => setSuCity(e.target.value)}
                  placeholder=" "
                  className="input pl-12"
                />
                <label htmlFor="su-city" className="left-12">City</label>
                <MapPin size={18} className="absolute left-4 top-[55%] -translate-y-1/2 text-muted pointer-events-none" />
              </div>

              {/* Role selector minimalist */}
              <div>
                <p className="text-xs text-muted mb-2 uppercase tracking-widest pl-1 font-medium mt-2">I am a</p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setSuRole('owner')}
                    className={`flex-1 py-3 text-sm rounded-lg border transition-all duration-200 ${
                      suRole === 'owner' 
                        ? 'border-indigo-500 bg-indigo-500/10 text-white' 
                        : 'border-white/5 bg-transparent text-muted hover:border-white/20'
                    }`}
                  >
                    Owner
                  </button>
                  <button
                    type="button"
                    onClick={() => setSuRole('worker')}
                    className={`flex-1 py-3 text-sm rounded-lg border transition-all duration-200 ${
                      suRole === 'worker' 
                        ? 'border-green-500 bg-green-500/10 text-white' 
                        : 'border-white/5 bg-transparent text-muted hover:border-white/20'
                    }`}
                  >
                    Worker
                  </button>
                </div>
              </div>

              {suError && (
                <p className="text-sm px-4 py-3 mt-2 text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg">
                  {suError}
                </p>
              )}

              <button
                type="submit"
                disabled={ suLoading || !suName.trim() || !suPhone.trim() || !suCity.trim() || !suRole }
                className="btn-primary mt-6 !mb-2"
              >
                {suLoading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Create Account <ArrowRight size={16} /></>
                )}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
