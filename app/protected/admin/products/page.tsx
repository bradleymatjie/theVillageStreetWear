import { Suspense } from "react";
import { ProductsPage } from "./products";
export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <Suspense fallback={"loading"}>
      <ProductsPage />
    </Suspense>
  )
}