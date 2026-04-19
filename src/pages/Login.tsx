import { useState } from 'react';
import { Shield, Phone, ArrowRight, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Login() {
  const { login } = useAuth();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;
    setError('');
    setLoading(true);
    const { error: err } = await login(phone);
    if (err) setError(err);
    setLoading(false);
  };

  const quickLogin = async (ph: string) => {
    setPhone(ph);
    setError('');
    setLoading(true);
    const { error: err } = await login(ph);
    if (err) setError(err);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0D1B2A] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500 rounded-2xl mb-4 shadow-lg shadow-amber-500/30">
            <Shield size={32} className="text-[#0D1B2A]" />
          </div>
          <h1 className="text-3xl font-bold text-white font-display mb-1">Nighabaan</h1>
          <p className="text-amber-400 text-sm font-medium tracking-wide">نگہبان</p>
          <p className="text-slate-400 text-sm mt-3 leading-relaxed">
            آپ کی محنت، ہماری ذمہ داری
          </p>
          <p className="text-slate-500 text-xs mt-1">Your hard work, our responsibility</p>
        </div>

        <div className="bg-[#162233] rounded-2xl border border-[#1e3448] p-6 shadow-xl">
          <h2 className="text-white font-semibold mb-4">Sign In with Phone</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-400 text-sm mb-2">Phone Number</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="03001234567"
                  className="w-full bg-[#0D1B2A] border border-[#1e3448] rounded-xl pl-9 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/60 transition-colors"
                />
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !phone.trim()}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-[#0D1B2A] font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-[#0D1B2A]/30 border-t-[#0D1B2A] rounded-full animate-spin" />
              ) : (
                <>
                  Continue <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-[#1e3448]">
            <p className="text-slate-500 text-xs mb-3 text-center">Quick demo login</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => quickLogin('03001234567')}
                disabled={loading}
                className="bg-[#0D1B2A] hover:bg-[#1a2a3d] border border-[#1e3448] hover:border-amber-500/30 rounded-xl p-3 text-left transition-all disabled:opacity-50"
              >
                <p className="text-xs text-amber-400 font-medium mb-0.5">Homeowner</p>
                <p className="text-white text-sm font-semibold">Asad Khan</p>
                <p className="text-slate-500 text-xs">03001234567</p>
              </button>
              <button
                onClick={() => quickLogin('03009876543')}
                disabled={loading}
                className="bg-[#0D1B2A] hover:bg-[#1a2a3d] border border-[#1e3448] hover:border-amber-500/30 rounded-xl p-3 text-left transition-all disabled:opacity-50"
              >
                <p className="text-xs text-blue-400 font-medium mb-0.5">Worker</p>
                <p className="text-white text-sm font-semibold">Rafiq Ahmed</p>
                <p className="text-slate-500 text-xs">03009876543</p>
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mt-6 text-slate-600 text-xs">
          <Lock size={12} />
          <span>Funds are held securely in escrow</span>
        </div>
      </div>
    </div>
  );
}
