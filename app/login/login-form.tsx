'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { ExtendedUser, useUser } from '../lib/user';
import { Mail, Lock, ShoppingBag, AlertCircle, Eye, EyeOff } from 'lucide-react';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { setUser } = useUser();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate inputs
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address.');
      }
      if (password.length < 1) {
        throw new Error('Please enter your password.');
      }

      // Sign in with Supabase Auth
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        // Handle specific Supabase errors for better UX
        let errorMessage = 'An unexpected error occurred. Please try again.';
        if (authError.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please try again.';
        } else if (authError.message.includes('Email not confirmed')) {
          errorMessage = 'Please confirm your email before logging in.';
        } else {
          errorMessage = authError.message;
        }
        throw new Error(errorMessage);
      }

      if (!data.session) {
        throw new Error('Login successful, but session could not be established. Please try again.');
      }

      // Store user in Zustand on success
      if (data.user) {
        const extendedUser: ExtendedUser = {
          ...data.user,
          user_metadata: {
            email: data.user.user_metadata?.email ?? data.user.email ?? '',
            email_verified: data.user.user_metadata?.email_verified ?? false,
            full_name: data.user.user_metadata?.full_name ?? '',
            phone: data.user.user_metadata?.phone ?? '',
            phone_verified: data.user.user_metadata?.phone_verified ?? false,
            sub: data.user.user_metadata?.sub ?? '',
          },
        };

        setUser(extendedUser);
      }

      // Clear form and redirect
      setEmail('');
      setPassword('');
      router.push('/products');
      router.refresh();
    } catch (err: unknown) {
      let errorMessage = 'An error occurred during login. Please try again.';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      setError(errorMessage);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          skipBrowserRedirect: false,
        },
      });

      if (error) {
        throw error;
      }

    } catch (err: unknown) {
      let errorMessage = 'An error occurred during Google sign-in. Please try again.';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      console.error('Google sign-in error:', err);
      setGoogleLoading(false);
    }
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <form onSubmit={handleLogin} aria-busy={loading || googleLoading}>
        <div className="flex flex-col gap-6">
          {/* Header with Icon */}
          <div className="text-center space-y-3">
            <div>
              <p className="text-sm text-muted-foreground mt-1">
                Welcome back! Please login to continue
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link 
                href="/signup" 
                className="font-medium text-foreground underline underline-offset-4 hover:text-primary transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>

          {error && (
            <Alert variant="destructive" id="error-message" className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-900">{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-4">
            {/* Email Input with Icon */}
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  required
                  autoComplete="email"
                  aria-label="Email for login"
                  aria-describedby={error ? 'error-message' : undefined}
                  disabled={loading || googleLoading}
                />
              </div>
            </div>

            {/* Password Input with Icons */}
            <div className="flex flex-col space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                {/* <Link 
                  href="/forgot-password" 
                  className="text-xs text-muted-foreground hover:text-primary underline underline-offset-4 transition-colors"
                >
                  Forgot password?
                </Link> */}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-9"
                  required
                  autoComplete="current-password"
                  aria-label="Password for login"
                  aria-describedby={error ? 'error-message' : undefined}
                  disabled={loading || googleLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={loading || googleLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-black text-white hover:bg-gray-800 transition-colors"
              disabled={loading || googleLoading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Logging In...
                </span>
              ) : (
                'Login'
              )}
            </Button>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>
                 {/* Google Sign-In Button */}
          <div className="flex flex-col gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignIn}
              disabled={loading || googleLoading}
              className="w-full border-gray-200 bg-white hover:bg-gray-50 flex items-center gap-2"
            >
              {googleLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Redirecting to Google...
                </span>
              ) : (
                <>
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Continue with Google
                </>
              )}
            </Button>
          </div>

        </div>
      </form>

      {/* Terms and Privacy */}
      <div className="text-muted-foreground text-center text-xs text-balance">
        By clicking continue, you agree to our{' '}
        <Link 
          href="/terms" 
          aria-label="Terms of Service"
          className="underline underline-offset-4 hover:text-primary transition-colors"
        >
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link 
          href="/privacy" 
          aria-label="Privacy Policy"
          className="underline underline-offset-4 hover:text-primary transition-colors"
        >
          Privacy Policy
        </Link>
        .
      </div>
    </div>
  );
}