"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
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
        plan: "starter",
        description: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
        debugger;
        if (error) {
            debugger;
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
            <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
                <div className="max-w-md text-center">
                    <h1 className="text-3xl font-black mb-4">Application Sent</h1>
                    <p className="text-white/60">
                        We’ve received your application. We’ll contact you shortly to complete onboarding and payment.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-black text-white px-4 py-16 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-4xl sm:text-5xl font-black leading-tight">
                        Apply to Join
                        <br />
                        The Village
                    </h1>
                    <p className="mt-4 text-white/60">
                        Launch your streetwear brand, sell products, and grow your presence.
                    </p>
                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8"
                >
                    {/* Owner Name */}
                    <div>
                        <label className="text-sm font-bold">Owner Name</label>
                        <input
                            name="ownerName"
                            required
                            value={form.ownerName}
                            onChange={handleChange}
                            className="mt-2 w-full rounded-xl bg-black border border-white/10 px-4 py-3 text-white focus:outline-none"
                            placeholder="John Doe"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="text-sm font-bold">Email</label>
                        <input
                            name="email"
                            type="email"
                            required
                            value={form.email}
                            onChange={handleChange}
                            className="mt-2 w-full rounded-xl bg-black border border-white/10 px-4 py-3 text-white focus:outline-none"
                            placeholder="you@email.com"
                        />
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="text-sm font-bold">Phone / WhatsApp</label>
                        <input
                            name="phone"
                            required
                            value={form.phone}
                            onChange={handleChange}
                            className="mt-2 w-full rounded-xl bg-black border border-white/10 px-4 py-3 text-white focus:outline-none"
                            placeholder="+27..."
                        />
                    </div>

                    {/* Brand Name */}
                    <div>
                        <label className="text-sm font-bold">Brand Name</label>
                        <input
                            name="brandName"
                            required
                            value={form.brandName}
                            onChange={handleChange}
                            className="mt-2 w-full rounded-xl bg-black border border-white/10 px-4 py-3 text-white focus:outline-none"
                            placeholder="Your Brand"
                        />
                    </div>

                    {/* Instagram */}
                    <div>
                        <label className="text-sm font-bold">Instagram (optional)</label>
                        <input
                            name="instagram"
                            value={form.instagram}
                            onChange={handleChange}
                            className="mt-2 w-full rounded-xl bg-black border border-white/10 px-4 py-3 text-white focus:outline-none"
                            placeholder="@yourbrand"
                        />
                    </div>

                    {/* Plan */}
                    <div>
                        <label className="text-sm font-bold">Select Plan</label>
                        <select
                            name="plan"
                            value={form.plan}
                            onChange={handleChange}
                            className="mt-2 w-full rounded-xl bg-black border border-white/10 px-4 py-3 text-white focus:outline-none"
                        >
                            <option value="starter">Starter – R399 (10 products)</option>
                            <option value="growth">Growth – R599 (20 products)</option>
                            <option value="premium">Premium – R1199 (Unlimited)</option>
                        </select>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="text-sm font-bold">About Your Brand</label>
                        <textarea
                            name="description"
                            rows={4}
                            value={form.description}
                            onChange={handleChange}
                            className="mt-2 w-full rounded-xl bg-black border border-white/10 px-4 py-3 text-white focus:outline-none"
                            placeholder="Tell us about your brand..."
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-white text-black py-4 font-black uppercase tracking-wide transition hover:bg-white/80"
                    >
                        {loading ? "Submitting..." : "Apply to Join"}
                        <ArrowRight className="h-4 w-4" />
                    </button>
                </form>
            </div>
        </main>
    );
}