import { Suspense } from "react";
import BrandShowcase from "./components/BrandShowcase";
import BrandShowcaseSkeleton from "./components/BrandShowcaseSkeleton";
import HomeTab from "./components/HomeTab";
import HomeScreenOrder from "./components/HomeScreenOrder";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default function ProfilePage() {
  return (
    <div className="py-2">
      <HomeTab />

      <div className="px-4">
        <Suspense fallback={<BrandShowcaseSkeleton />}>
          <BrandShowcase />
        </Suspense>

        <HomeScreenOrder />
      </div>
    </div>
  );
}