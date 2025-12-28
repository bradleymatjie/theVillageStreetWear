// store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';

// Extended User type to include metadata
export interface ExtendedUser extends User {
  user_metadata: {
    email: string;
    email_verified: boolean;
    full_name?: string;
    phone?: string;
    phone_verified: boolean;
    sub: string;
  };
}

// Zustand store interface
interface AuthState {
  user: ExtendedUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: ExtendedUser | null) => void;
  clearUser: () => void;
  initializeAuth: () => Promise<void>;
  signOut: () => Promise<void>;
  _authSubscription: (() => void) | null;
}

// Create the store
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      _authSubscription: null,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        }),

      clearUser: () =>
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      // Initialize auth state from Supabase
      initializeAuth: async () => {
        try {
          set({ isLoading: true });

          // Cleanup existing subscription if any
          const existingSubscription = get()._authSubscription;
          if (existingSubscription) {
            existingSubscription();
          }

          // Get current session
          const { data: { session }, error } = await supabase.auth.getSession();
          debugger;
          if (error) {
            console.error('Error getting session:', error);
            get().clearUser();
            return;
          }

          if (session?.user) {
            get().setUser(session.user as ExtendedUser);
          } else {
            get().clearUser();
          }

          // Listen for auth state changes
          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
              console.log('Auth state changed:', event);

              if (event === 'SIGNED_IN' && session?.user) {
                get().setUser(session.user as ExtendedUser);
              } else if (event === 'SIGNED_OUT') {
                get().clearUser();
              } else if (event === 'TOKEN_REFRESHED' && session?.user) {
                get().setUser(session.user as ExtendedUser);
              } else if (event === 'USER_UPDATED' && session?.user) {
                get().setUser(session.user as ExtendedUser);
              }
            }
          );

          // Store cleanup function
          set({ _authSubscription: () => subscription.unsubscribe() });
        } catch (error) {
          console.error('Error initializing auth:', error);
          get().clearUser();
        }
      },

      // Sign out helper
      signOut: async () => {
        try {
          const { error } = await supabase.auth.signOut();
          if (error) {
            console.error('Error signing out:', error);
            throw error;
          }
          get().clearUser();
        } catch (error) {
          console.error('Sign out failed:', error);
          throw error;
        }
      },
    }),
    {
      name: 'mazwi-auth-storage',
      // Only persist user data, not loading state or subscription
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);

// Usage hook (for convenience)
export const useUser = () => {
  const { user, isAuthenticated, isLoading, setUser, clearUser, signOut } = useAuthStore();
  return { user, isAuthenticated, isLoading, setUser, clearUser, signOut };
};

// Hook to ensure auth is initialized (call this in your root layout or app component)
export const useInitializeAuth = () => {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const isLoading = useAuthStore((state) => state.isLoading);

  return { initializeAuth, isLoading };
};