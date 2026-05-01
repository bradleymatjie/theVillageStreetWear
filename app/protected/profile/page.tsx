import { Suspense } from "react";
import BrandShowcase from "./components/BrandShowcase";
import BrandShowcaseSkeleton from "./components/BrandShowcaseSkeleton";
import HomeTab from "./components/HomeTab";
import { Link, ShoppingBag, Truck } from "lucide-react";

export default function ProfilePage() {
  return (
    <>
      <HomeTab />
      <div className="px-4">
        <Suspense fallback={<BrandShowcaseSkeleton />}>
          <BrandShowcase />
        </Suspense>
      </div>
    </>
  );
}