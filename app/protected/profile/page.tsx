import { Suspense } from "react";
import BrandShowcase from "./components/BrandShowcase";
import BrandShowcaseSkeleton from "./components/BrandShowcaseSkeleton";
import HomeTab from "./components/HomeTab";
import { Link, ShoppingBag, Truck } from "lucide-react";
import HomeScreenOrder from "./components/HomeScreenOrder";

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