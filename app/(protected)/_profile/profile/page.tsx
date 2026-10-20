"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { ArrowRight, Check, CheckCircle2, ChevronRight, Clock3, HelpCircle, Loader2, LogOut, Mail, Monitor, Package, Pencil, Phone, ShieldCheck, UserRound } from "lucide-react";
import { useUser, type ExtendedUser } from "@/app/lib/user";
import { getCurrentProfileBase, joinProfilePath } from "@/app/lib/profileRoutes";
import { supabase } from "@/lib/supabaseClient";

const panel = "rounded-2xl border border-theme-ink/10 bg-theme-ink/[0.03]";
const secondaryButton = "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-theme-ink/15 px-4 text-sm font-semibold transition hover:bg-theme-ink/5 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
const primaryButton = "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-theme-ink px-5 text-sm font-bold text-theme-base transition hover:bg-theme-ink/85 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
const inputStyle = "mt-2 min-h-12 w-full rounded-xl border border-theme-ink/15 bg-theme-base px-3 text-base text-theme-ink outline-none focus:border-theme-ink/50 focus:ring-2 focus:ring-theme-ink/10 disabled:opacity-60";

function formatDate(value?: string) {
  if (!value || Number.isNaN(new Date(value).getTime())) return "Unavailable";
  return new Intl.DateTimeFormat("en-ZA", { day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Johannesburg" }).format(new Date(value));
}

export default function ProfilePage() {
  const { user, isLoading } = useUser();
  if (!user) {
    return <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-theme-base px-4 text-theme-ink">
      {isLoading ? <><Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" /><p role="status">Loading your profile…</p></> : <><h1 className="text-2xl font-bold">Your account</h1><p className="text-theme-ink/60">Sign in to view and manage your profile.</p><Link href="/login" className={primaryButton}>Sign in <ArrowRight className="h-4 w-4" /></Link></>}
    </div>;
  }
  return <ProfileDetails key={user.id} user={user} />;
}

function ProfileDetails({ user }: { user: ExtendedUser }) {
  const { setUser, signOut } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const { systemTheme } = useTheme();
  const profileBase = getCurrentProfileBase(pathname, user);
  const fullName = user.user_metadata.full_name || "";
  const phone = user.user_metadata.phone || "";
  const [draft, setDraft] = useState<{ full_name: string; phone: string } | null>(null);
  const [busy, setBusy] = useState<"save" | "logout" | null>(null);
  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; message: string } | null>(null);
  const verified = Boolean(user.email_confirmed_at);
  const displayName = fullName || user.email?.split("@")[0] || "Village member";
  const initials = displayName.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join("").toUpperCase();
  const providers = Array.from(new Set(user.identities?.map(identity => identity.provider) || [user.app_metadata.provider || "email"]));
  const providerName = providers.map(provider => provider === "email" ? "Email & password" : provider.charAt(0).toUpperCase() + provider.slice(1)).join(", ");
  const hasChanges = Boolean(draft && (draft.full_name.trim() !== fullName || draft.phone.trim() !== phone));

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft || busy) return;
    const name = draft.full_name.trim();
    const number = draft.phone.trim();
    if (name.length < 2) { setFeedback({ kind: "error", message: "Enter your full name using at least 2 characters." }); return; }
    if (number && (!/^[+\d\s().-]+$/.test(number) || !/^\d{7,15}$/.test(number.replace(/\D/g, "")))) {
      setFeedback({ kind: "error", message: "Enter a valid phone number with 7–15 digits, or leave it blank." }); return;
    }
    setBusy("save");
    setFeedback(null);
    try {
      const { data, error } = await supabase.auth.updateUser({ data: { full_name: name, phone: number } });
      if (error) throw error;
      if (!data.user) throw new Error("Your profile could not be saved. Please try again.");
      setUser(data.user as ExtendedUser);
      setDraft(null);
      setFeedback({ kind: "success", message: "Your profile has been updated." });
      router.refresh();
    } catch (error) {
      setFeedback({ kind: "error", message: error instanceof Error ? error.message : "Could not save your profile. Please try again." });
    } finally { setBusy(null); }
  }

  async function logout() {
    if (busy) return;
    setBusy("logout");
    setFeedback(null);
    try {
      await signOut();
      router.replace("/login");
      router.refresh();
    } catch {
      setFeedback({ kind: "error", message: "Could not sign out. Please try again." });
      setBusy(null);
    }
  }

  return (
    <div className="min-h-screen bg-theme-base px-4 py-7 text-theme-ink sm:px-6 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 sm:mb-8">
          <Link href={profileBase} className="mb-3 inline-flex items-center gap-1 text-xs font-semibold text-theme-ink/60 hover:text-theme-ink">Your account <ChevronRight className="h-3 w-3" /> Profile</Link>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">My profile</h1>
          <p className="mt-2 text-sm text-theme-ink/60">Your details, account information, and shopping essentials.</p>
        </div>

        <section aria-label="Account overview" className={`${panel} mb-5 flex items-center gap-4 p-5 sm:p-6`}>
          <div aria-hidden="true" className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-theme-ink text-xl font-bold text-theme-base">{initials}</div>
          <div className="min-w-0 flex-1">
            <h2 className="break-words text-xl font-bold">{displayName}</h2>
            <p className="mt-1 break-all text-sm text-theme-ink/60">{user.email || "No email on file"}</p>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-theme-ink/60"><Clock3 className="h-3.5 w-3.5 shrink-0" /> Member since {formatDate(user.created_at)}</p>
          </div>
        </section>

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="space-y-5">
            <section aria-labelledby="details-heading" className={`${panel} p-5 sm:p-6`}>
              <div className="mb-5 flex items-center justify-between gap-3">
                <div><h2 id="details-heading" className="text-lg font-bold">Personal details</h2><p className="mt-1 text-xs text-theme-ink/60">Keep your contact information up to date.</p></div>
                {!draft && <button type="button" disabled={Boolean(busy)} onClick={() => { setDraft({ full_name: fullName, phone }); setFeedback(null); }} className={secondaryButton}><Pencil className="h-3.5 w-3.5" /> Edit</button>}
              </div>
              {draft ? <form onSubmit={saveProfile} className="space-y-4" aria-busy={busy === "save"}>
                <div><label htmlFor="profile-name" className="text-sm font-semibold">Full name</label><input id="profile-name" name="full_name" autoComplete="name" required minLength={2} maxLength={80} autoFocus disabled={Boolean(busy)} value={draft.full_name} onChange={event => setDraft({ ...draft, full_name: event.target.value })} className={inputStyle} /></div>
                <div><label htmlFor="profile-phone" className="text-sm font-semibold">Phone number <span className="font-normal text-theme-ink/60">(optional)</span></label><input id="profile-phone" name="phone" type="tel" autoComplete="tel" maxLength={30} disabled={Boolean(busy)} value={draft.phone} placeholder="e.g. +27 72 123 4567" onChange={event => setDraft({ ...draft, phone: event.target.value })} className={inputStyle} /></div>
                <div className="flex flex-wrap gap-3 pt-1"><button type="submit" disabled={Boolean(busy) || !hasChanges} className={`${primaryButton} flex-1`}>{busy === "save" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}{busy === "save" ? "Saving…" : "Save changes"}</button><button type="button" disabled={Boolean(busy)} onClick={() => { setDraft(null); setFeedback(null); }} className={secondaryButton}>Cancel</button></div>
              </form> : <dl className="divide-y divide-theme-ink/10">
                {[{ label: "Full name", value: fullName || "Not added", icon: UserRound }, { label: "Email address", value: user.email || "Not added", icon: Mail }, { label: "Phone number", value: phone || "Not added", icon: Phone }].map(({ label, value, icon: Icon }) => <div key={label} className="flex items-start gap-3 py-4 first:pt-0 last:pb-0"><Icon className="mt-0.5 h-4 w-4 shrink-0 text-theme-ink/50" /><div className="min-w-0"><dt className="text-xs text-theme-ink/60">{label}</dt><dd className="mt-1 break-words text-sm font-medium">{value}</dd></div></div>)}
              </dl>}
              <p className="mt-5 border-t border-theme-ink/10 pt-4 text-xs leading-5 text-theme-ink/60">Your email is linked to your sign-in. <Link href="/contact" className="font-semibold text-theme-ink underline underline-offset-4">Contact support</Link> if you need help changing it.</p>
            </section>

            {feedback && <p role={feedback.kind === "error" ? "alert" : "status"} className={`${panel} flex items-start gap-2 p-4 text-sm`}>
              {feedback.kind === "success" && <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />}{feedback.message}
            </p>}

            <section aria-labelledby="shopping-heading" className={`${panel} overflow-hidden`}>
              <h2 id="shopping-heading" className="px-5 pt-5 text-lg font-bold sm:px-6">Shopping & support</h2>
              {[{ title: "My orders", description: "Track deliveries and view past purchases", href: joinProfilePath(profileBase, "orders"), icon: Package }, { title: "Need a hand?", description: "Get help with an order or your account", href: "/contact", icon: HelpCircle }].map(({ title, description, href, icon: Icon }) => <Link key={title} href={href} className="flex min-h-20 items-center gap-3 px-5 py-4 text-theme-ink transition hover:bg-theme-ink/5 sm:px-6"><Icon className="h-5 w-5 shrink-0 text-theme-ink/70" /><div className="min-w-0 flex-1"><p className="text-sm font-semibold">{title}</p><p className="mt-1 text-xs leading-5 text-theme-ink/60">{description}</p></div><ArrowRight className="h-4 w-4 shrink-0" /></Link>)}
            </section>
          </div>

          <div className="space-y-5">
            <section aria-labelledby="account-heading" className={`${panel} p-5 sm:p-6`}>
              <h2 id="account-heading" className="flex items-center gap-2 text-lg font-bold"><ShieldCheck className="h-5 w-5" /> Account information</h2>
              <dl className="mt-5 space-y-5 text-sm">
                <div><dt className="text-xs text-theme-ink/60">Email status</dt><dd className="mt-1.5 flex items-center gap-2 font-medium">{verified && <CheckCircle2 className="h-4 w-4" />}{verified ? "Verified" : "Not verified"}</dd></div>
                <div><dt className="text-xs text-theme-ink/60">Sign-in method</dt><dd className="mt-1.5 font-medium">{providerName || "Email"}</dd></div>
                <div><dt className="text-xs text-theme-ink/60">Last sign-in</dt><dd className="mt-1.5 font-medium">{formatDate(user.last_sign_in_at)}</dd></div>
              </dl>
            </section>

            <section aria-labelledby="appearance-heading" className={`${panel} flex items-start gap-3 p-5 sm:p-6`}>
              <Monitor className="mt-0.5 h-5 w-5 shrink-0 text-theme-ink/70" /><div><h2 id="appearance-heading" className="text-sm font-semibold">Follows your device</h2><p className="mt-1 text-xs leading-5 text-theme-ink/60">{systemTheme ? `${systemTheme === "dark" ? "Dark" : "Light"} mode is active. ` : ""}Change your device appearance to switch the website theme.</p></div>
            </section>

            <div className="px-1"><button type="button" onClick={logout} disabled={Boolean(busy) || Boolean(draft)} className={`${secondaryButton} w-full`}>{busy === "logout" ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}{busy === "logout" ? "Signing out…" : "Sign out"}</button>{draft && <p className="mt-2 text-center text-xs text-theme-ink/60">Save or cancel your changes before signing out.</p>}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
