"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle,
  Image as ImageIcon,
  Instagram,
  Loader2,
  MapPin,
  Save,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type BrandProfile = {
  id: string;
  name: string;
  tagline?: string | null;
  story?: string | null;
  street_address?: string | null;
  location_city?: string | null;
  location_province?: string | null;
  location_country?: string | null;
  instagram?: string | null;
  tiktok?: string | null;
  founded_year?: string | number | null;
  style_category?: string | null;
  logo_url?: string | null;
  cover_image_url?: string | null;
};

type ProfileForm = {
  tagline: string;
  story: string;
  street_address: string;
  location_city: string;
  location_province: string;
  location_country: string;
  instagram: string;
  tiktok: string;
  founded_year: string;
  style_category: string;
  logo_url: string;
  cover_image_url: string;
};

const emptyForm: ProfileForm = {
  tagline: "",
  story: "",
  street_address: "",
  location_city: "",
  location_province: "",
  location_country: "South Africa",
  instagram: "",
  tiktok: "",
  founded_year: "",
  style_category: "",
  logo_url: "",
  cover_image_url: "",
};

export default function BrandProfilePage() {
  const [brand, setBrand] = useState<BrandProfile | null>(null);
  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<"logo" | "cover" | null>(null);

  useEffect(() => {
    loadBrandProfile();
  }, []);

  const loadBrandProfile = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    if (user.user_metadata?.role !== "brand") {
      window.location.href = "/protected/profile";
      return;
    }

    const metaBrandId = user.user_metadata?.brand_id;

    let brandData: BrandProfile | null = null;

    if (metaBrandId) {
      const { data, error } = await supabase
        .from("brands")
        .select("*")
        .eq("id", metaBrandId)
        .single();

      if (error) {
        toast.error(error.message);
      }

      brandData = data as BrandProfile | null;
    }

    if (!brandData) {
      const { data, error } = await supabase
        .from("brands")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        toast.error(error.message);
      }

      brandData = data as BrandProfile | null;
    }

    if (!brandData) {
      toast.error("Brand profile could not be found.");
      setLoading(false);
      return;
    }

    setBrand(brandData);
    setForm({
      tagline: brandData.tagline || "",
      story: brandData.story || "",
      street_address: brandData.street_address || "",
      location_city: brandData.location_city || "",
      location_province: brandData.location_province || "",
      location_country: brandData.location_country || "South Africa",
      instagram: brandData.instagram || "",
      tiktok: brandData.tiktok || "",
      founded_year: brandData.founded_year ? String(brandData.founded_year) : "",
      style_category: brandData.style_category || "",
      logo_url: brandData.logo_url || "",
      cover_image_url: brandData.cover_image_url || "",
    });
    setLoading(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const uploadBrandImage = async (
    file: File,
    type: "logo" | "cover"
  ): Promise<string> => {
    if (!brand) throw new Error("Brand profile missing.");

    const fileExt = file.name.split(".").pop();
    const fileName = `${type}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${fileExt}`;
    const filePath = `brands/${brand.id}/identity/${fileName}`;

    const { error } = await supabase.storage
      .from("thevillageProductsBucket")
      .upload(filePath, file, { upsert: true });

    if (error) throw error;

    const {
      data: { publicUrl },
    } = supabase.storage.from("thevillageProductsBucket").getPublicUrl(filePath);

    return publicUrl;
  };

  const handleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "logo" | "cover"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(type);

    try {
      const publicUrl = await uploadBrandImage(file, type);

      setForm((current) => ({
        ...current,
        [type === "logo" ? "logo_url" : "cover_image_url"]: publicUrl,
      }));

      toast.success(type === "logo" ? "Logo uploaded." : "Cover image uploaded.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploading(null);
      e.target.value = "";
    }
  };

  const handleSave = async () => {
    if (!brand) return;

    setSaving(true);

    const payload = {
      tagline: form.tagline || null,
      story: form.story || null,
      street_address: form.street_address || null,
      location_city: form.location_city || null,
      location_province: form.location_province || null,
      location_country: form.location_country || null,
      instagram: form.instagram || null,
      tiktok: form.tiktok || null,
      founded_year: form.founded_year || null,
      style_category: form.style_category || null,
      logo_url: form.logo_url || null,
      cover_image_url: form.cover_image_url || null,
    };

    const { error } = await supabase
      .from("brands")
      .update(payload)
      .eq("id", brand.id);

    if (error) {
      toast.error(error.message);
      setSaving(false);
      return;
    }

    setBrand({ ...brand, ...payload });
    toast.success("Brand profile saved.");
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-white">
        <Loader2 className="mr-3 h-5 w-5 animate-spin" />
        Loading brand profile...
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="mx-auto max-w-3xl border border-white/10 bg-white/5 p-8 text-center">
        <p className="text-lg font-black">Brand profile unavailable</p>
        <p className="mt-2 text-sm text-white/50">
          Contact admin if this keeps happening.
        </p>
      </div>
    );
  }

  const location = [
    form.street_address,
    form.location_city,
    form.location_province,
    form.location_country,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/protected/brand-dashboard"
            className="mb-3 inline-flex items-center gap-2 text-sm text-white/50 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>

          <p className="text-sm font-bold uppercase tracking-[0.25em] text-white/40">
            Brand Identity
          </p>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">
            {brand.name}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-white/50">
            Shape how your brand appears on The Village: story, location,
            visuals, and social presence.
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={saving || !!uploading}
          className="bg-white text-black hover:bg-white/80"
        >
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Profile
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="space-y-6">
          <Panel
            eyebrow="Visual identity"
            title="Logo and cover image"
            description="These visuals will carry your brand profile and future public brand page."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <ImageUploadField
                label="Brand Logo"
                help="Square image works best."
                previewUrl={form.logo_url}
                uploading={uploading === "logo"}
                onChange={(e) => handleImageChange(e, "logo")}
              />

              <ImageUploadField
                label="Cover Image"
                help="Wide campaign or lifestyle image."
                previewUrl={form.cover_image_url}
                uploading={uploading === "cover"}
                onChange={(e) => handleImageChange(e, "cover")}
                wide
              />
            </div>
          </Panel>

          <Panel
            eyebrow="Brand story"
            title="What the brand is"
            description="Give customers a reason to care about the label behind the product."
          >
            <div className="space-y-5">
              <Field
                label="Tagline"
                name="tagline"
                value={form.tagline}
                onChange={handleChange}
                placeholder="Independent streetwear from Johannesburg."
              />

              <div>
                <Label>Brand Story</Label>
                <Textarea
                  name="story"
                  value={form.story}
                  onChange={handleChange}
                  placeholder="Tell customers what your brand stands for, where it started, and what makes it different."
                  rows={7}
                  className="mt-2 rounded-none border-white/10 bg-black text-white placeholder:text-white/30"
                />
              </div>

              <Field
                label="Style / Category"
                name="style_category"
                value={form.style_category}
                onChange={handleChange}
                placeholder="Streetwear, cut-and-sew, accessories..."
              />

              <Field
                label="Founded Year"
                name="founded_year"
                value={form.founded_year}
                onChange={handleChange}
                placeholder="2024"
              />
            </div>
          </Panel>

          <Panel
            eyebrow="Location and socials"
            title="Where customers can place you"
            description="Location and social links make the brand feel real and discoverable."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field
                  label="Street Address"
                  name="street_address"
                  value={form.street_address}
                  onChange={handleChange}
                  placeholder="123 Commissioner Street"
                />
              </div>
              <Field
                label="City"
                name="location_city"
                value={form.location_city}
                onChange={handleChange}
                placeholder="Johannesburg"
              />
              <Field
                label="Province"
                name="location_province"
                value={form.location_province}
                onChange={handleChange}
                placeholder="Gauteng"
              />
              <Field
                label="Country"
                name="location_country"
                value={form.location_country}
                onChange={handleChange}
                placeholder="South Africa"
              />
              <Field
                label="Instagram"
                name="instagram"
                value={form.instagram}
                onChange={handleChange}
                placeholder="@yourbrand"
              />
              <Field
                label="TikTok"
                name="tiktok"
                value={form.tiktok}
                onChange={handleChange}
                placeholder="@yourbrand"
              />
            </div>
          </Panel>
        </section>

        <aside className="lg:sticky lg:top-8 lg:self-start">
          <div className="border border-white/10 bg-white/[0.04] p-5">
            <p className="mb-4 text-xs font-black uppercase tracking-[0.22em] text-white/35">
              Public Preview
            </p>

            <div className="overflow-hidden border border-white/10 bg-black">
              <div className="relative h-52 bg-white/5">
                {form.cover_image_url ? (
                  <img
                    src={form.cover_image_url}
                    alt={`${brand.name} cover`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ImageIcon className="h-10 w-10 text-white/20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
              </div>

              <div className="relative px-5 pb-6">
                <div className="-mt-12 flex h-24 w-24 items-center justify-center overflow-hidden border border-white/20 bg-black">
                  {form.logo_url ? (
                    <img
                      src={form.logo_url}
                      alt={`${brand.name} logo`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-black">
                      {brand.name.slice(0, 1)}
                    </span>
                  )}
                </div>

                <div className="mt-5">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-white/35">
                    {form.style_category || "Streetwear brand"}
                  </p>
                  <h2 className="mt-2 text-3xl font-black">{brand.name}</h2>
                  {form.tagline && (
                    <p className="mt-2 text-sm font-bold text-white/75">
                      {form.tagline}
                    </p>
                  )}
                </div>

                <div className="mt-5 space-y-3 text-sm text-white/60">
                  {location && (
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {location}
                    </p>
                  )}
                  {form.instagram && (
                    <p className="flex items-center gap-2">
                      <Instagram className="h-4 w-4" />
                      {form.instagram}
                    </p>
                  )}
                </div>

                <div className="mt-6 border-t border-white/10 pt-5">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-white/35">
                    Story
                  </p>
                  <p className="mt-3 whitespace-pre-line text-sm leading-6 text-white/65">
                    {form.story ||
                      "Add your story to help shoppers understand what your brand stands for."}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              {[
                "Story helps shoppers connect",
                "Location builds trust",
                "Socials make the brand discoverable",
              ].map((item) => (
                <p key={item} className="flex items-center gap-2 text-sm text-white/60">
                  <CheckCircle className="h-4 w-4 text-white/70" />
                  {item}
                </p>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Panel({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-white/10 bg-white/[0.04] p-5 sm:p-6">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-white/35">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-2xl font-black">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-white/50">{description}</p>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  name: keyof ProfileForm;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Input
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="mt-2 rounded-none border-white/10 bg-black text-white placeholder:text-white/30"
      />
    </div>
  );
}

function ImageUploadField({
  label,
  help,
  previewUrl,
  uploading,
  onChange,
  wide,
}: {
  label: string;
  help: string;
  previewUrl: string;
  uploading: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  wide?: boolean;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div
        className={`mt-2 overflow-hidden border border-white/10 bg-black ${
          wide ? "aspect-[16/9]" : "aspect-square"
        }`}
      >
        {previewUrl ? (
          <img src={previewUrl} alt={label} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImageIcon className="h-10 w-10 text-white/20" />
          </div>
        )}
      </div>

      <p className="mt-2 text-xs text-white/40">{help}</p>

      <label className="mt-3 inline-flex cursor-pointer items-center justify-center gap-2 border border-white/10 px-4 py-3 text-sm font-black text-white/70 transition hover:bg-white hover:text-black">
        {uploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        {uploading ? "Uploading..." : "Upload Image"}
        <input
          type="file"
          accept="image/*"
          onChange={onChange}
          className="hidden"
          disabled={uploading}
        />
      </label>
    </div>
  );
}
