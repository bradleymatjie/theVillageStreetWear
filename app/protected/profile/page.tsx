import { Suspense } from "react";
import ProfilePage from "./profilePage";
export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <Suspense fallback="loading">
      <ProfilePage />
    </Suspense>
  )
}