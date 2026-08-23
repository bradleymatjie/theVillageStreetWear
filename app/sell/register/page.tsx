"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle, Percent } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type FormState = {
  ownerName: string;
  email: string;
  phone: string;
  brandName: string;
  instagram: string;
  location: string;
  category: string;
  description: string;
};

const initialForm: FormState = {
  ownerName: "",
  email: "",
  phone: "",
  brandName: "",
  instagram: "",
  location: "",
  category: "",
  description: "",
};

function buildApplicationDescription(form: FormState) {
  return [
    form.description,
    "",
    "Application details:",
    `Location: ${form.location}`,
    `What the brand sells: ${form.category}`,
  ].join("\n");
}

export default function RegisterBrandPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<FormState>(initialForm);

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
      plan: "commission",
      description: buildApplicationDescription(form),
      status: "pending",
    });

    if (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("brand_application_submitted", {
          detail: { brandName: form.brandName },
        })
      );
    }

    setSubmitted(true);
    setLoading(false);
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-black px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="border border-white/10 bg-white/[0.04] p-6 sm:p-10">
            <p className="mb-4 inline-flex bg-white px-3 py-1 text-xs font-black uppercase tracking-wide text-black">
              Application received
            </p>
            <h1 className="text-4xl font-black leading-tight sm:text-6xl">
              APPLICATION RECEIVED.
            </h1>
            <p className="mt-5 text-sm leading-7 text-white/60 sm:text-base">
              Your application has been sent to The Village. Every brand is
              reviewed before approval.
            </p>

            <div className="mt-8 grid gap-3">
              {[
                "Application submitted",
                "Village review",
                "Approved",
                "Create your account",
                "Build your storefront",
                "Start selling",
              ].map((item, index) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-white/10 bg-white/5 text-xs font-black text-white/55">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <p className="border border-white/10 bg-black px-4 py-3 text-sm font-black uppercase tracking-wide text-white/75">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-4 py-16 text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="mb-4 inline-flex border border-white/20 px-3 py-1 text-xs font-black uppercase tracking-[0.24em] text-white/55">
            Brand application
          </p>
          <h1 className="text-5xl font-black leading-none sm:text-6xl">
            Apply to join The Village.
          </h1>
          <p className="mt-5 text-sm leading-7 text-white/60 sm:text-base">
            This first step is intentionally short. Tell us enough to understand
            your brand, your product direction and whether The Village is the
            right fit.
          </p>

          <div className="mt-8 border border-white/10 bg-white/5 p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-white text-black">
                <Percent className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-black">Commission partnership</h2>
                <p className="mt-2 text-sm leading-6 text-white/60">
                  Applying is free. The Village only earns 10% from completed
                  marketplace sales.
                </p>
              </div>
            </div>
            <div className="mt-5 grid gap-3 text-sm font-bold text-white/80">
              {["R0 monthly fees", "R0 listing fees", "Applications reviewed"].map(
                (item) => (
                  <p key={item} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    {item}
                  </p>
                )
              )}
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 border border-white/10 bg-white/[0.04] p-6 sm:p-8"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="text-sm font-bold">Brand Name *</label>
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
              <label className="text-sm font-bold">Owner / Contact Name *</label>
              <input
                name="ownerName"
                required
                value={form.ownerName}
                onChange={handleChange}
                className="mt-2 w-full border border-white/10 bg-black px-4 py-3 text-white focus:outline-none"
                placeholder="Your name"
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="text-sm font-bold">Email *</label>
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
              <label className="text-sm font-bold">Phone *</label>
              <input
                name="phone"
                required
                value={form.phone}
                onChange={handleChange}
                className="mt-2 w-full border border-white/10 bg-black px-4 py-3 text-white focus:outline-none"
                placeholder="+27..."
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="text-sm font-bold">Instagram *</label>
              <input
                name="instagram"
                required
                value={form.instagram}
                onChange={handleChange}
                className="mt-2 w-full border border-white/10 bg-black px-4 py-3 text-white focus:outline-none"
                placeholder="@yourbrand"
              />
            </div>
            <div>
              <label className="text-sm font-bold">Location *</label>
              <input
                name="location"
                required
                value={form.location}
                onChange={handleChange}
                className="mt-2 w-full border border-white/10 bg-black px-4 py-3 text-white focus:outline-none"
                placeholder="Johannesburg, Gauteng"
              />
            </div>

            <div>
              <label className="text-sm font-bold">What does your brand sell? *</label>
              <input
                name="category"
                required
                value={form.category}
                onChange={handleChange}
                className="mt-2 w-full border border-white/10 bg-black px-4 py-3 text-white focus:outline-none"
                placeholder="T-shirts, caps, sneakers..."
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-bold">Tell us about your brand *</label>
            <textarea
              name="description"
              required
              rows={5}
              value={form.description}
              onChange={handleChange}
              className="mt-2 w-full border border-white/10 bg-black px-4 py-3 text-white focus:outline-none"
              placeholder="What does your brand stand for? Who is it for? What makes it different?"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 bg-white py-4 font-black uppercase tracking-wide text-black transition hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Submitting..." : "Apply to The Village"}
            <ArrowRight className="h-4 w-4" />
          </button>

          <p className="text-center text-xs font-bold uppercase tracking-[0.18em] text-white/35">
            Applications are reviewed before approval.
          </p>
        </form>
      </div>
    </main>
  );
}
