import { Suspense } from "react";
import { AnalyticsPage } from "./analytics";
export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <Suspense fallback="loading...">
      <AnalyticsPage />
    </Suspense>
  )
}