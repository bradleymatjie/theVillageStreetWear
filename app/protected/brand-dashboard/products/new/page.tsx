"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { productCategories, productMaterials } from "@/app/lib/productOptions";

export default function NewBrandProductPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
    imageurl: "",
    availableSizes: "S,M,L,XL",
    availableMaterials: "Cotton",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      alert("You must be logged in.");
      setLoading(false);
      return;
    }

    const brandId = user.user_metadata?.brand_id;
    const brandName = user.user_metadata?.brand_name;

    if (!brandId || !brandName) {
      alert("Brand details missing. Please contact admin.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("thevillageproducts").insert({
      name: form.name,
      price: form.price,
      category: form.category,
      description: form.description,
      imageurl: form.imageurl || "/noImage.jpg",
      images: form.imageurl ? [form.imageurl] : [],
      availableSizes: form.availableSizes
        .split(",")
        .map((size) => size.trim())
        .filter(Boolean),
      availableMaterials: form.availableMaterials
        .split(",")
        .map((material) => material.trim())
        .filter(Boolean),
      soldOut: false,
      brand_id: brandId,
      brand_name: brandName,
      created_by: user.id,
    });

    setLoading(false);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    router.push("/protected/brand-dashboard");
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/protected/brand-dashboard"
          className="mb-8 inline-flex items-center gap-2 text-sm text-white/60 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>

        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-white/40">
            Brand Dashboard
          </p>
          <h1 className="mt-2 text-4xl font-black">Add Product</h1>
          <p className="mt-2 text-sm text-white/50">
            Upload a new product to The Village marketplace.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-3xl border border-white/10 bg-white/5 p-6"
        >
          <Input
            label="Product Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Oversized Logo Tee"
            required
          />

          <PriceInput
            value={form.price}
            onChange={handleChange}
            required
          />

          <CategorySelect
            value={form.category}
            onChange={handleChange}
            required
          />

          <Input
            label="Main Image URL"
            name="imageurl"
            value={form.imageurl}
            onChange={handleChange}
            placeholder="https://..."
            required
          />

          <div>
            <RequiredLabel>Description</RequiredLabel>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              required
              className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none"
              placeholder="Tell customers about this product..."
            />
          </div>

          <Input
            label="Available Sizes"
            name="availableSizes"
            value={form.availableSizes}
            onChange={handleChange}
            placeholder="S,M,L,XL"
            required
          />

          <MaterialSelect
            value={form.availableMaterials}
            onChange={handleChange}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-white py-4 text-sm font-black uppercase tracking-wide text-black transition hover:bg-white/80 disabled:opacity-50"
          >
            {loading ? "Adding Product..." : "Add Product"}
          </button>
        </form>
      </div>
    </main>
  );
}

function CategorySelect({
  value,
  onChange,
  required,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  required?: boolean;
}) {
  return (
    <div>
      <RequiredLabel>Category</RequiredLabel>
      <select
        name="category"
        value={value}
        onChange={onChange}
        required={required}
        className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none"
      >
        <option value="">Select category</option>
        {productCategories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
    </div>
  );
}

function PriceInput({
  value,
  onChange,
  required,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}) {
  return (
    <div>
      <RequiredLabel>Price</RequiredLabel>
      <div className="mt-2 flex overflow-hidden rounded-xl border border-white/10 bg-black">
        <span className="flex items-center border-r border-white/10 px-4 text-sm font-black text-white/60">
          R
        </span>
        <input
          name="price"
          value={value}
          onChange={onChange}
          required={required}
          inputMode="decimal"
          placeholder="399"
          className="w-full bg-transparent px-4 py-3 text-white outline-none"
        />
      </div>
    </div>
  );
}

function MaterialSelect({
  value,
  onChange,
  required,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  required?: boolean;
}) {
  return (
    <div>
      <RequiredLabel>Material</RequiredLabel>
      <select
        name="availableMaterials"
        value={value}
        onChange={onChange}
        required={required}
        className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none"
      >
        <option value="">Select material</option>
        {productMaterials.map((material) => (
          <option key={material} value={material}>
            {material}
          </option>
        ))}
      </select>
    </div>
  );
}

function Input({
  label,
  name,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      {required ? (
        <RequiredLabel>{label}</RequiredLabel>
      ) : (
        <label className="text-sm font-bold">{label}</label>
      )}
      <input
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none"
      />
    </div>
  );
}

function RequiredLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-sm font-bold">
      {children} <span className="text-red-400">*</span>
    </label>
  );
}
