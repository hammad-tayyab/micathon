import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (phone: string) => Promise<{ error: string | null }>;
  signUp: (name: string, phone: string, city: string, role: UserRole) => Promise<{ error: string | null }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const SESSION_KEY = 'nighabaan_user_id';

/**
 * AuthProvider
 * Manages user session. Supports both Sign In (existing user by phone)
 * and Sign Up (new user with name, phone, city, role). No OTP needed.
 */
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

  /** Sign in an existing user by phone number */
  const signIn = async (phone: string): Promise<{ error: string | null }> => {
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

  /** Register a brand new user — no OTP, just insert and log in */
  const signUp = async (
    name: string,
    phone: string,
    city: string,
    role: UserRole
  ): Promise<{ error: string | null }> => {
    const trimmedPhone = phone.trim();
    const trimmedCity = city.trim().toLowerCase();
    const trimmedName = name.trim();

    if (!trimmedName || !trimmedPhone || !trimmedCity) {
      return { error: 'Please fill in all fields.' };
    }

    // Check if phone already registered
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('phone', trimmedPhone)
      .maybeSingle();

    if (existing) {
      return { error: 'This phone number is already registered. Use Sign In instead.' };
    }

    // Insert new user
    const { data, error } = await supabase
      .from('users')
      .insert({
        name: trimmedName,
        phone: trimmedPhone,
        city: trimmedCity,
        role,
        balance_pkr: 0,
      })
      .select()
      .single();

    if (error || !data) {
      return { error: 'Could not create account. Please try again.' };
    }

    localStorage.setItem(SESSION_KEY, data.id);
    setUser(data as User);
    return { error: null };
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
