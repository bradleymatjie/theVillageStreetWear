"use client";

import { useUser } from "@/app/lib/user";
import { useEffect, useState } from "react";
import { LogOut, Edit, Mail, Phone, User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";

export default function ProfilePage() {
  const { user, clearUser, signOut } = useUser();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.user_metadata?.full_name || "",
        email: user.email || "",
        phone: user.user_metadata?.phone || "",
      });
    }
  }, [user]);

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    signOut();
    router.push("/login");
    router.refresh();
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: formData.full_name,
        phone: formData.phone,
      },
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Profile updated");
      setEditing(false);
      router.refresh();
    }

    setLoading(false);
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-black dark:bg-black dark:text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-4 py-8 text-black dark:bg-black dark:text-white">
      <div className="mx-auto max-w-2xl">

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black">My Profile</h1>
          <p className="mt-2 text-sm text-black/60 dark:text-white/60">
            Manage your account
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-black/10 bg-black/5 p-6 dark:border-white/10 dark:bg-white/5">

          {/* Avatar */}
          <div className="mb-6 flex justify-center">
            <img
              src="/defaultPic.jpg"
              className="h-24 w-24 rounded-full border border-black/10 object-cover dark:border-white/10"
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Name */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-black/70 dark:text-white/70">
                <UserIcon className="h-4 w-4" />
                Full Name
              </label>

              <input
                name="full_name"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
                disabled={!editing}
                className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-black focus:outline-none dark:border-white/10 dark:bg-black dark:text-white"
              />
            </div>

            {/* Email */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-black/70 dark:text-white/70">
                <Mail className="h-4 w-4" />
                Email
              </label>

              <input
                value={formData.email}
                disabled
                className="mt-2 w-full rounded-xl border border-black/10 bg-black/5 px-3 py-2 text-black/60 dark:border-white/10 dark:bg-white/5 dark:text-white/60"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-black/70 dark:text-white/70">
                <Phone className="h-4 w-4" />
                Phone
              </label>

              <input
                name="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                disabled={!editing}
                className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-black focus:outline-none dark:border-white/10 dark:bg-black dark:text-white"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              {!editing ? (
                <>
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="flex-1 rounded-xl bg-black py-3 text-sm font-black text-white dark:bg-white dark:text-black"
                  >
                    Edit Profile
                  </button>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex-1 rounded-xl border border-black/20 py-3 text-sm font-black dark:border-white/20"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="flex-1 rounded-xl border border-black/20 py-3 text-sm dark:border-white/20"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-black py-3 text-sm font-black text-white dark:bg-white dark:text-black"
                  >
                    Save
                  </button>
                </>
              )}
            </div>
          </form>

          {/* Meta */}
          <div className="mt-6 border-t border-black/10 pt-4 text-center text-xs text-black/50 dark:border-white/10 dark:text-white/50">
            <p>
              Member since{" "}
              {new Date(user.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}