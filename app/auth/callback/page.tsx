import { Suspense } from "react";
import AuthCallbackPage from "./callbackClient";
export const dynamic = 'force-dynamic';

export default function Page() {
  <Suspense fallback="loading...">
    <AuthCallbackPage />
  </Suspense>
}