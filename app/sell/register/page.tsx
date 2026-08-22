"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle, Percent } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function RegisterBrandPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    ownerName: "",
    email: "",
    phone: "",
    brandName: "",
    instagram: "",
    plan: "commission",
    description: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from("brand_applications").insert({
      owner_name: form.ownerName,
      email: form.email,
      phone: form.phone,
      brand_name: form.brandName,
      instagram: form.instagram,
      plan: form.plan,
      description: form.description,
      status: "pending",
    });

    if (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    setSubmitted(true);

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1200);
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
        <div className="max-w-md text-center">
          <h1 className="mb-4 text-3xl font-black">Application Sent</h1>
          <p className="text-white/60">
            We&apos;ve received your application. We&apos;ll contact you shortly to
            complete onboarding.
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black px-4 py-16 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10">
          <h1 className="text-4xl font-black leading-tight sm:text-5xl">
            Apply to Join
            <br />
            The Village
          </h1>
          <p className="mt-4 text-white/60">
            Launch your streetwear brand, sell products, and grow your presence
            on a commission-based partnership.
          </p>
        </div>

        <div className="mb-8 border border-white/10 bg-white/5 p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-white text-black">
              <Percent className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-black">Commission partnership</h2>
              <p className="mt-2 text-sm leading-6 text-white/60">
                Applying is free. The Village only earns a commission from
                completed marketplace sales.
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 text-sm font-bold text-white/80 sm:grid-cols-3">
            {["No setup fee", "No monthly plan", "Pay when you sell"].map(
              (item) => (
                <p key={item} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  {item}
                </p>
              )
            )}
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 border border-white/10 bg-white/5 p-6 sm:p-8"
        >
          <div>
            <label className="text-sm font-bold">Owner Name</label>
            <input
              name="ownerName"
              required
              value={form.ownerName}
              onChange={handleChange}
              className="mt-2 w-full border border-white/10 bg-black px-4 py-3 text-white focus:outline-none"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="text-sm font-bold">Email</label>
            <input
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              className="mt-2 w-full border border-white/10 bg-black px-4 py-3 text-white focus:outline-none"
              placeholder="you@email.com"
            />
          </div>

          <div>
            <label className="text-sm font-bold">Phone / WhatsApp</label>
            <input
              name="phone"
              required
              value={form.phone}
              onChange={handleChange}
              className="mt-2 w-full border border-white/10 bg-black px-4 py-3 text-white focus:outline-none"
              placeholder="+27..."
            />
          </div>

          <div>
            <label className="text-sm font-bold">Brand Name</label>
            <input
              name="brandName"
              required
              value={form.brandName}
              onChange={handleChange}
              className="mt-2 w-full border border-white/10 bg-black px-4 py-3 text-white focus:outline-none"
              placeholder="Your Brand"
            />
          </div>

          <div>
            <label className="text-sm font-bold">Instagram (optional)</label>
            <input
              name="instagram"
              value={form.instagram}
              onChange={handleChange}
              className="mt-2 w-full border border-white/10 bg-black px-4 py-3 text-white focus:outline-none"
              placeholder="@yourbrand"
            />
          </div>

          <input type="hidden" name="plan" value={form.plan} />

          <div>
            <label className="text-sm font-bold">About Your Brand</label>
            <textarea
              name="description"
              rows={4}
              value={form.description}
              onChange={handleChange}
              className="mt-2 w-full border border-white/10 bg-black px-4 py-3 text-white focus:outline-none"
              placeholder="Tell us about your brand..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 bg-white py-4 font-black uppercase tracking-wide text-black transition hover:bg-white/80"
          >
            {loading ? "Submitting..." : "Apply to Join"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </div>
    </main>
  );
}
