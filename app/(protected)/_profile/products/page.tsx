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
      <div className="flex min-h-screen items-center justify-center bg-theme-ink text-theme-base dark:bg-theme-base dark:text-theme-ink">
        <div className="text-center">
          <p className="mb-4 text-xl text-red-500">Error loading catalog</p>
          <p className="text-theme-base/50 dark:text-theme-ink/50">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-ink p-4 text-theme-base transition-colors dark:bg-theme-base dark:text-theme-ink md:p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-4xl font-black md:text-5xl">Catalog</h1>

        <ProductFilters data={data as Product[] | null} />
      </div>
    </div>
  );
}