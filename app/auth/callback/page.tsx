"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ExtendedUser, useUser } from '@/app/lib/user';
import { supabase } from '@/lib/supabaseClient';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { setUser } = useUser();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check for error in query params
        const urlParams = new URLSearchParams(window.location.search);
        const errorParam = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');

        if (errorParam) {
          setError(errorDescription || errorParam);
          setTimeout(() => router.push('/login?error=verification_failed'), 3000);
          return;
        }

        // Handle PKCE flow (code in query params) - this is what email verification uses
        const code = urlParams.get('code');
        if (code) {
          const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            console.error('Error exchanging code:', exchangeError);
            setError(exchangeError.message);
            setTimeout(() => router.push('/login?error=verification_failed'), 3000);
            return;
          }

          // Verify the user's email is confirmed
          if (sessionData.user && !sessionData.user.email_confirmed_at) {
            console.error('Email not confirmed');
            setError('Email verification incomplete. Please check your email.');
            setTimeout(() => router.push('/login?error=email_not_confirmed'), 3000);
            return;
          }

          // Store user in Zustand after successful authentication
          if (sessionData.user) {
            const extendedUser: ExtendedUser = {
              ...sessionData.user,
              user_metadata: {
                email: sessionData.user.user_metadata?.email ?? sessionData.user.email ?? '',
                email_verified: sessionData.user.user_metadata?.email_verified ?? true,
                full_name: sessionData.user.user_metadata?.full_name ?? sessionData.user.user_metadata?.name ?? '',
                phone: sessionData.user.user_metadata?.phone ?? '',
                phone_verified: sessionData.user.user_metadata?.phone_verified ?? false,
                sub: sessionData.user.user_metadata?.sub ?? '',
              },
            };

            setUser(extendedUser);
            console.log('✅ Email verified! User stored in Zustand:', extendedUser);
          }

          // Successfully authenticated and verified
          router.push('/products');
          router.refresh();
          return;
        }

        // Handle hash fragment (implicit flow) - for OAuth providers like Google
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken) {
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });

          if (sessionError) {
            console.error('Error setting session:', sessionError);
            setError(sessionError.message);
            setTimeout(() => router.push('/login?error=verification_failed'), 3000);
            return;
          }

          // Store user in Zustand after successful authentication
          if (sessionData.user) {
            const extendedUser: ExtendedUser = {
              ...sessionData.user,
              user_metadata: {
                email: sessionData.user.user_metadata?.email ?? sessionData.user.email ?? '',
                email_verified: sessionData.user.user_metadata?.email_verified ?? true,
                full_name: sessionData.user.user_metadata?.full_name ?? sessionData.user.user_metadata?.name ?? '',
                phone: sessionData.user.user_metadata?.phone ?? '',
                phone_verified: sessionData.user.user_metadata?.phone_verified ?? false,
                sub: sessionData.user.user_metadata?.sub ?? '',
              },
            };

            setUser(extendedUser);
            console.log('✅ OAuth verified! User stored in Zustand:', extendedUser);
          }

          // Successfully authenticated
          router.push('/products');
          router.refresh();
          return;
        }

        // No authentication data found
        console.error('No authentication data found in callback');
        setError('No authentication data received');
        setTimeout(() => router.push('/login'), 3000);
      } catch (err) {
        console.error('Unexpected error in auth callback:', err);
        setError('An unexpected error occurred');
        setTimeout(() => router.push('/login'), 3000);
      }
    };

    handleAuthCallback();
  }, [router, setUser]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        {error ? (
          <>
            <div className="text-red-600 text-lg font-semibold">Authentication Error</div>
            <p className="text-gray-600">{error}</p>
            <p className="text-sm text-gray-500">Redirecting to login...</p>
          </>
        ) : (
          <>
            <div className="flex justify-center">
              <svg
                className="animate-spin h-10 w-10 text-black"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
            <div className="text-lg font-semibold">Verifying your email...</div>
            <p className="text-sm text-gray-500">Please wait while we complete your registration</p>
          </>
        )}
      </div>
    </div>
  );
}