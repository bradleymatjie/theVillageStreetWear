"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const handleRecoverySession = async () => {
      const hash = window.location.hash;

      if (!hash) {
        setSessionReady(true);
        return;
      }

      const params = new URLSearchParams(hash.substring(1));
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");

      if (access_token && refresh_token) {
        const { error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });

        if (error) {
          setError(error.message);
        } else {
          window.history.replaceState({}, document.title, "/auth/reset-password");
        }
      }

      setSessionReady(true);
    };

    handleRecoverySession();
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!sessionReady) return;

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/protected/brand-dashboard");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
        <h1 className="text-2xl font-black sm:text-3xl">Set Your Password</h1>

        <p className="mt-2 text-sm text-white/60">
          Create a password to access your brand dashboard.
        </p>

        <form onSubmit={handleReset} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-bold">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none"
              placeholder="Enter password"
            />
          </div>

          <div>
            <label className="text-sm font-bold">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none"
              placeholder="Confirm password"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading || !sessionReady}
            className="mt-4 w-full rounded-xl bg-white py-3 font-black text-black transition hover:bg-white/80 disabled:opacity-60"
          >
            {!sessionReady ? "Preparing..." : loading ? "Saving..." : "Set Password"}
          </button>
        </form>
      </div>
    </main>
  );
}