import Catalog from "./components/catalog/page";
import { Suspense } from "react";
import CatalogLoading from "./components/catalog/loading";
import NewsletterSignup from "./components/mailList/mailList";
import HomePageClient from "./components/HomePageClient.tsx";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <div className="min-h-screen bg-[var(--palette-surface-catalog)] pb-16 lg:pb-0">
      <HomePageClient />

      <Suspense fallback={<CatalogLoading />}>
        <Catalog />
      </Suspense>

      <HomePageClient showBottomSections>
        <NewsletterSignup />
      </HomePageClient>
    </div>
  );
}
