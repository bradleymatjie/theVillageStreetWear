import { supabase } from "@/lib/supabaseClient";
import ProductFilters from "./components/ProductFilters";
import { Product } from "@/app/lib/types";

export const dynamic = "force-dynamic";

export default async function CatalogPage() {
  const { data, error } = await supabase
    .from("thevillageproducts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase error:", error);

    return (
      <div className="flex min-h-screen items-center justify-center bg-theme-base text-theme-ink">
        <div className="text-center">
          <p className="mb-4 text-xl text-theme-error-ink">Error loading catalog</p>
          <p className="text-theme-muted">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 transition-colors bg-theme-base text-theme-ink md:p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-4xl font-black md:text-5xl">Catalog</h1>

        <ProductFilters data={data as Product[] | null} />
      </div>
    </div>
  );
}