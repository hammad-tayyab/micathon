import { useState } from 'react';
import { Phone, User, MapPin, ArrowRight, Shield, Briefcase, HardHat } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

type Tab = 'signin' | 'signup';

/**
 * Login / Signup Page
 * The first screen users see. Two tabs:
 *   - Sign In: enter phone → access existing account
 *   - Sign Up: name + phone + city + role → create account
 * No OTP — phone is just an identifier.
 */
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

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-10"
      style={{ backgroundColor: 'var(--bg-page)' }}
    >
      <div className="w-full max-w-sm animate-fadeUp">

        {/* ── Brand ── */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-lg"
            style={{ backgroundColor: 'var(--indigo)' }}
          >
            <Shield size={30} color="white" />
          </div>
          <h1
            className="text-3xl font-display font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            Nighabaan
          </h1>
          <p style={{ color: 'var(--indigo)' }} className="text-sm font-semibold mt-0.5">
            نگہبان
          </p>
          <p style={{ color: 'var(--text-muted)' }} className="text-sm mt-2">
            Local jobs. Real connections.
          </p>
        </div>

        {/* ── Card ── */}
        <div className="card p-1 mb-4">

          {/* Tab switcher */}
          <div
            className="flex rounded-xl p-1 mb-1"
            style={{ backgroundColor: 'var(--bg-muted)' }}
          >
            {(['signin', 'signup'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{
                  backgroundColor: tab === t ? 'var(--bg-surface)' : 'transparent',
                  color: tab === t ? 'var(--text-primary)' : 'var(--text-muted)',
                  boxShadow: tab === t ? 'var(--shadow-sm)' : 'none',
                }}
              >
                {t === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* ── Sign In Form ── */}
          {tab === 'signin' && (
            <form onSubmit={handleSignIn} className="p-4 space-y-4 animate-popIn">
              <div>
                <label className="label">Phone Number</label>
                <div className="relative">
                  <Phone
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--text-muted)' }}
                  />
                  <input
                    type="tel"
                    value={siPhone}
                    onChange={(e) => setSiPhone(e.target.value)}
                    placeholder="03001234567"
                    className="input pl-9"
                    autoComplete="tel"
                  />
                </div>
              </div>

              {siError && (
                <p
                  className="text-sm rounded-xl px-4 py-3"
                  style={{
                    color: 'var(--red)',
                    backgroundColor: 'var(--red-soft)',
                    border: '1px solid var(--red)',
                  }}
                >
                  {siError}
                </p>
              )}

              <button
                type="submit"
                disabled={siLoading || !siPhone.trim()}
                className="btn-primary"
                style={{ backgroundColor: 'var(--indigo)' }}
              >
                {siLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Continue <ArrowRight size={18} />
                  </>
                )}
              </button>

              <p className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                New here?{' '}
                <button
                  type="button"
                  onClick={() => setTab('signup')}
                  className="font-semibold"
                  style={{ color: 'var(--indigo)' }}
                >
                  Create account
                </button>
              </p>
            </form>
          )}

          {/* ── Sign Up Form ── */}
          {tab === 'signup' && (
            <form onSubmit={handleSignUp} className="p-4 space-y-4 animate-popIn">

              {/* Name */}
              <div>
                <label className="label">Full Name</label>
                <div className="relative">
                  <User
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--text-muted)' }}
                  />
                  <input
                    type="text"
                    value={suName}
                    onChange={(e) => setSuName(e.target.value)}
                    placeholder="Ahmed Khan"
                    className="input pl-9"
                    autoComplete="name"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="label">Phone Number</label>
                <div className="relative">
                  <Phone
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--text-muted)' }}
                  />
                  <input
                    type="tel"
                    value={suPhone}
                    onChange={(e) => setSuPhone(e.target.value)}
                    placeholder="03001234567"
                    className="input pl-9"
                    autoComplete="tel"
                  />
                </div>
              </div>

              {/* City */}
              <div>
                <label className="label">City — آپ کا شہر</label>
                <div className="relative">
                  <MapPin
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--text-muted)' }}
                  />
                  <input
                    type="text"
                    value={suCity}
                    onChange={(e) => setSuCity(e.target.value)}
                    placeholder="Karachi, Lahore, Islamabad..."
                    className="input pl-9"
                  />
                </div>
              </div>

              {/* Role selector */}
              <div>
                <label className="label">I am a… — میں ہوں</label>
                <div className="grid grid-cols-2 gap-3">
                  {/* Owner card */}
                  <button
                    type="button"
                    onClick={() => setSuRole('owner')}
                    className="rounded-2xl p-4 text-left transition-all border-2"
                    style={{
                      backgroundColor:
                        suRole === 'owner' ? 'var(--indigo-soft)' : 'var(--bg-muted)',
                      borderColor:
                        suRole === 'owner' ? 'var(--indigo)' : 'var(--border)',
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                      style={{
                        backgroundColor:
                          suRole === 'owner' ? 'var(--indigo)' : 'var(--border)',
                      }}
                    >
                      <Briefcase size={20} color="white" />
                    </div>
                    <p
                      className="font-bold text-sm"
                      style={{
                        color:
                          suRole === 'owner' ? 'var(--indigo)' : 'var(--text-primary)',
                      }}
                    >
                      Owner
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      مالک — I post jobs
                    </p>
                  </button>

                  {/* Worker card */}
                  <button
                    type="button"
                    onClick={() => setSuRole('worker')}
                    className="rounded-2xl p-4 text-left transition-all border-2"
                    style={{
                      backgroundColor:
                        suRole === 'worker' ? 'var(--green-soft)' : 'var(--bg-muted)',
                      borderColor:
                        suRole === 'worker' ? 'var(--green)' : 'var(--border)',
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                      style={{
                        backgroundColor:
                          suRole === 'worker' ? 'var(--green)' : 'var(--border)',
                      }}
                    >
                      <HardHat size={20} color="white" />
                    </div>
                    <p
                      className="font-bold text-sm"
                      style={{
                        color:
                          suRole === 'worker' ? 'var(--green)' : 'var(--text-primary)',
                      }}
                    >
                      Worker
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      مزدور — I find jobs
                    </p>
                  </button>
                </div>
              </div>

              {suError && (
                <p
                  className="text-sm rounded-xl px-4 py-3"
                  style={{
                    color: 'var(--red)',
                    backgroundColor: 'var(--red-soft)',
                    border: '1px solid var(--red)',
                  }}
                >
                  {suError}
                </p>
              )}

              <button
                type="submit"
                disabled={
                  suLoading ||
                  !suName.trim() ||
                  !suPhone.trim() ||
                  !suCity.trim() ||
                  !suRole
                }
                className="btn-primary"
                style={{ backgroundColor: 'var(--indigo)' }}
              >
                {suLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Create Account <ArrowRight size={18} />
                  </>
                )}
              </button>

              <p className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                Already have account?{' '}
                <button
                  type="button"
                  onClick={() => setTab('signin')}
                  className="font-semibold"
                  style={{ color: 'var(--indigo)' }}
                >
                  Sign in
                </button>
              </p>
            </form>
          )}
        </div>

        <p className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>
          City-based jobs · No OTP needed
        </p>
      </div>
    </div>
  );
}
