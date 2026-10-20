"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { ExtendedUser, useAuthStore } from "@/app/lib/user";

export default function AuthSession() {
  useEffect(() => {
    // INITIAL_SESSION restores the saved session; subsequent events keep UI in sync.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      useAuthStore.getState().setUser((session?.user as ExtendedUser) ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  return null;
}
