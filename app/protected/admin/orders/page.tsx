import { Suspense } from "react";
import OrdersPage from "./ordersClient";
export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <Suspense fallback={"loading"}>
      <OrdersPage />
    </Suspense>
  )
}