// store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware'; // Optional: for persistence across tabs/sessions
import { User } from '@supabase/supabase-js'; // Reuse Supabase's User type for accuracy

// Extended User type to include metadata (based on your Supabase response)
export interface ExtendedUser extends User {
  user_metadata: {
    email: string;
    email_verified: boolean;
    full_name: string;
    phone: string;
    phone_verified: boolean;
    sub: string;
  };
}

// Zustand store interface
interface AuthState {
  user: ExtendedUser | null;
  isAuthenticated: boolean;
  setUser: (user: ExtendedUser | null) => void;
  clearUser: () => void;
}

// Create the store
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),
      clearUser: () =>
        set({
          user: null,
          isAuthenticated: false,
        }),
      // Optional token handling (uncomment if needed)
      // accessToken: null,
      // setAccessToken: (token) => set({ accessToken: token }),
    }),
    {
      name: 'mazwi-auth-storage', // Custom storage key
      // Optional: Partialize to avoid storing sensitive tokens if not needed
      partialize: (state) => ({ user: state.user }), // Only persist user, not tokens
    }
  )
);

// Usage hook (optional, for convenience)
export const useUser = () => {
  const { user, isAuthenticated, setUser, clearUser } = useAuthStore();
  return { user, isAuthenticated, setUser, clearUser };
};