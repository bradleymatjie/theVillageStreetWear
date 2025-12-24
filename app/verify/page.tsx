"use client";
import { useSearchParams } from "next/navigation";
import { Mail, CheckCircle2, ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Suspense } from "react";

function VerifyContents() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
            <Mail className="h-8 w-8 text-white" />
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black mb-3 uppercase tracking-tight">
            Check Your Email
          </h1>
          <p className="text-gray-600 text-sm mb-2">
            We sent a verification link to
          </p>
          <p className="text-black font-medium break-all">{email}</p>
        </div>



        {/* Instructions */}
        <div className="mb-8 space-y-4 text-sm">
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
              1
            </div>
            <div>
              <p className="font-medium text-black">Check your inbox</p>
              <p className="text-gray-600 text-xs">Look for an email from us</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
              2
            </div>
            <div>
              <p className="font-medium text-black">Click the link</p>
              <p className="text-gray-600 text-xs">Confirm your email address</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
              3
            </div>
            <div>
              <p className="font-medium text-black">Start shopping</p>
              <p className="text-gray-600 text-xs">You'll be redirected automatically</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-300 mb-8"></div>

        {/* Action Buttons */}
        <div className="space-y-3">

          <Link href={"/signup"} className="w-full border-2 border-black text-black py-3 px-4 font-medium text-sm uppercase tracking-wider hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            BACK TO SIGN UP
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-gray-300 border-t-gray-900 rounded-full mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <VerifyContents />
    </Suspense>
  );
}