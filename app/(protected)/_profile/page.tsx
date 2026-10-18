import { Suspense } from "react";
import BrandShowcase from "./components/BrandShowcase";
import BrandShowcaseSkeleton from "./components/BrandShowcaseSkeleton";
import HomeTab from "./components/HomeTab";
import HomeScreenOrder from "./components/HomeScreenOrder";
import AnimatedProfileShell from "./components/AnimatedProfileShell";
import AccountShortcuts from "./components/AccountShortcuts";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default function ProfilePage() {
  return (
    <AnimatedProfileShell>
      <HomeTab />

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6 lg:px-8">
        <HomeScreenOrder />

        <Suspense fallback={<BrandShowcaseSkeleton />}>
          <BrandShowcase />
        </Suspense>

        <AccountShortcuts />
      </div>
    </AnimatedProfileShell>
  );
}
