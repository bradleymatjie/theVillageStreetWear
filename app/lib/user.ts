// store/authStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

export interface ExtendedUser extends User {
  user_metadata: {
    email: string;
    email_verified: boolean;
    full_name?: string;
    phone?: string;
    phone_verified: boolean;
    sub: string;
    role?: "customer" | "brand" | "super_admin";
    brand_id?: string;
    brand_name?: string;
  };
}

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
          _authSubscription: null,
        }),

      initializeAuth: async () => {
        try {
          set({ isLoading: true });

          // Remove old storage key once after rename
          if (typeof window !== "undefined") {
            localStorage.removeItem("mazwi-auth-storage");
          }

          const existingSubscription = get()._authSubscription;
          if (existingSubscription) {
            existingSubscription();
          }

          const {
            data: { session },
            error,
          } = await supabase.auth.getSession();

          if (error) {
            console.error("Error getting session:", error);
            get().clearUser();
            return;
          }

          if (session?.user) {
            get().setUser(session.user as ExtendedUser);
          } else {
            get().clearUser();
          }

          const {
            data: { subscription },
          } = supabase.auth.onAuthStateChange((event, session) => {
            if (
              ["SIGNED_IN", "TOKEN_REFRESHED", "USER_UPDATED"].includes(event) &&
              session?.user
            ) {
              get().setUser(session.user as ExtendedUser);
              return;
            }

            if (event === "SIGNED_OUT") {
              get().clearUser();
            }
          });

          set({ _authSubscription: () => subscription.unsubscribe() });
        } catch (error) {
          console.error("Error initializing auth:", error);
          get().clearUser();
        }
      },

      signOut: async () => {
        try {
          const { error } = await supabase.auth.signOut();

          if (error) {
            console.error("Error signing out:", error);
            throw error;
          }

          get().clearUser();

          if (typeof window !== "undefined") {
            localStorage.removeItem("thevillage-auth-storage");
          }
        } catch (error) {
          console.error("Sign out failed:", error);
          throw error;
        }
      },
    }),
    {
      name: "thevillage-auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export const useUser = () => {
  const { user, isAuthenticated, isLoading, setUser, clearUser, signOut } =
    useAuthStore();

  return {
    user,
    isAuthenticated,
    isLoading,
    setUser,
    clearUser,
    signOut,
  };
};

export const useInitializeAuth = () => {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const isLoading = useAuthStore((state) => state.isLoading);

  return { initializeAuth, isLoading };
};
