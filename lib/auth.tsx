// lib/auth.tsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from './supabaseClient';

interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'staff';
}

interface AuthContextType {
  user: AdminUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
}

// Add your real admin emails here (you can add as many as you want
const ADMIN_EMAILS = new Set([
  'mazwi@mazwistore.com',
  'admin@mazwistore.com',
  'your-personal@gmail.com', // ← add more if needed
]);

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check session on mount and listen for changes
  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user && ADMIN_EMAILS.has(session.user.email!)) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          role: 'admin',
        });
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user && ADMIN_EMAILS.has(session.user.email!)) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          role: 'admin',
        });
      } else {
        setUser(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error || !data.user) {
      console.error('Login failed:', error?.message);
      return false;
    }

    // Only allow if email is in the admin list
    if (!ADMIN_EMAILS.has(data.user.email!)) {
      await supabase.auth.signOut();
      return false;
    }

    setUser({
      id: data.user.id,
      email: data.user.email!,
      role: 'admin',
    });

    return true;
  };

const logout = async () => {
  try {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = "/auth/admin-login";
  } catch (error) {
    console.error("Logout failed:", error);
    setUser(null);
    router.push("/");
  }
};

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}