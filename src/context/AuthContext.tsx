import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (phone: string) => Promise<{ error: string | null }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const SESSION_KEY = 'nighabaan_user_id';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async (id: string): Promise<User | null> => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error || !data) return null;
    return data as User;
  };

  const refreshUser = async () => {
    const id = localStorage.getItem(SESSION_KEY);
    if (!id) return;
    const u = await fetchUser(id);
    if (u) setUser(u);
  };

  useEffect(() => {
    const id = localStorage.getItem(SESSION_KEY);
    if (id) {
      fetchUser(id).then((u) => {
        setUser(u);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (phone: string): Promise<{ error: string | null }> => {
    const trimmed = phone.trim();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone', trimmed)
      .maybeSingle();

    if (error) return { error: 'Something went wrong. Please try again.' };
    if (!data) return { error: 'No account found with this phone number.' };

    localStorage.setItem(SESSION_KEY, data.id);
    setUser(data as User);
    return { error: null };
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
