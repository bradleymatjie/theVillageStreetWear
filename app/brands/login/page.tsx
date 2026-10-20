"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function BrandLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    const role = data.user?.user_metadata?.role;

    if (role !== "brand") {
      await supabase.auth.signOut();
      setError("This login is only for brand accounts.");
      return;
    }

    router.push("/brand-dashboard");
    router.refresh();
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-theme-base px-4 text-theme-ink">
      <div className="w-full max-w-md rounded-3xl border border-theme-ink/10 bg-theme-ink/5 p-6 sm:p-8">
        <p className="mb-3 text-xs font-black uppercase tracking-[0.25em] text-theme-muted">
          Brand Portal
        </p>

        <h1 className="text-3xl font-black">Brand Login</h1>

        <p className="mt-2 text-sm text-theme-muted">
          Sign in to manage your products and orders.
        </p>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-bold">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-xl border border-theme-ink/10 bg-theme-base px-4 py-3 text-theme-ink outline-none"
              placeholder="brand@email.com"
            />
          </div>

          <div>
            <label className="text-sm font-bold">Password</label>

            <div className="relative mt-2">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-theme-ink/10 bg-theme-base px-4 py-3 pr-12 text-theme-ink outline-none"
                placeholder="Enter password"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-muted hover:text-theme-ink"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-theme-error-ink">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-theme-ink py-3 font-black text-theme-base transition hover:bg-theme-ink/80 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>
    </main>
  );
}