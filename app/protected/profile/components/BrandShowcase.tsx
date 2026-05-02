import { supabase } from "@/lib/supabaseClient";
import { Product } from "@/app/lib/types";
import BrandShowcaseClient from "./BrandShowcaseClient";

export default async function BrandShowcase() {
  const { data, error } = await supabase
    .from("thevillageproducts")
    .select("*")
    .order("created_at", { ascending: false }).limit(4);

  if (error) {
    console.error("Error fetching products:", error);

    return (
      <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-sm text-red-400">Could not load brands.</p>
      </section>
    );
  }

  return (
    <BrandShowcaseClient products={(data as Product[]) || []} />
  )
}