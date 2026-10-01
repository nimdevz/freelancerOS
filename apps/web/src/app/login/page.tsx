'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get('redirect') || '/dashboard';
  const registered = searchParams?.get('registered');

  const { setUser } = useAppStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotPasswordNotice, setForgotPasswordNotice] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 4) {
      setError('Please enter your password (minimum 4 characters).');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.auth.login({ email, password });
      setUser(res.user);
      router.push(redirectTo);
    } catch (err: any) {
      setError(err?.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.auth.login({
        email: 'nimish@freelanceros.com',
        password: 'password123',
      });
      setUser(res.user);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Failed to sign in demo account.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-neutral-900 selection:text-white dark:selection:bg-neutral-100 dark:selection:text-black">
      {/* Top Navbar */}
      <header className="w-full border-b border-border bg-card/60 backdrop-blur-md px-4 sm:px-8 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-85 transition-opacity">
          <div className="w-6 h-6 rounded bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 flex items-center justify-center text-xs font-bold font-mono">
            OS
          </div>
          <span className="text-sm font-semibold tracking-tight">FreelancerOS</span>
        </Link>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground hidden sm:inline">Don't have an account?</span>
          <Link
            href="/signup"
            className="font-medium text-foreground hover:underline transition-all"
          >
            Create workspace
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-8">
        <div className="w-full max-w-[420px] space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Header text */}
          <div className="text-center space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
              Welcome back
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Sign in to manage your clients, projects, and revenue.
            </p>
          </div>

          {/* Registration Success Banner */}
          {registered && (
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Workspace registered successfully! You can now sign in.</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Card */}
          <div className="rounded-xl border border-border bg-card p-6 sm:p-8 shadow-xs space-y-5">
            {/* Google Authentication */}
            <div>
              <GoogleSignInButton
                label="Sign in with Google"
                redirectTo={redirectTo}
              />
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-border" />
              <span className="absolute bg-card px-3 text-[11px] text-muted-foreground uppercase tracking-wider font-mono">
                or with email
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground block">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder="you@creativestudio.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-hidden focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-foreground block">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setForgotPasswordNotice(true)}
                    className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-9 py-2 rounded-lg border border-border bg-background text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-hidden focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-muted-foreground hover:text-foreground">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-border text-neutral-900 focus:ring-0 cursor-pointer"
                  />
                  <span>Remember this device</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 text-xs sm:text-sm font-medium transition-colors shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Access Button */}
            <div className="pt-2 border-t border-border/70">
              <button
                type="button"
                onClick={handleQuickDemoLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border hover:border-neutral-400 dark:hover:border-neutral-600 bg-muted/30 hover:bg-muted/70 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Demo 1-Click Sign In (Nimish Studio)</span>
              </button>
            </div>
          </div>

          {/* Forgot password info dialog */}
          {forgotPasswordNotice && (
            <div className="p-3.5 rounded-lg border border-border bg-card text-xs space-y-2 animate-in fade-in duration-150">
              <div className="flex items-center justify-between font-medium text-foreground">
                <div className="flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Password Reset</span>
                </div>
                <button
                  onClick={() => setForgotPasswordNotice(false)}
                  className="text-muted-foreground hover:text-foreground text-[10px]"
                >
                  Dismiss
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Enter your email address above and submit to sign in directly, or click <strong>Demo 1-Click Sign In</strong> to access the workspace instantly.
              </p>
            </div>
          )}

          {/* Privacy text */}
          <p className="text-[11px] text-center text-muted-foreground leading-relaxed px-4">
            By signing in, you agree to FreelancerOS{' '}
            <a href="#" className="underline hover:text-foreground">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="underline hover:text-foreground">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="w-full border-t border-border py-4 px-4 text-center text-xs text-muted-foreground">
        <span>© {new Date().getFullYear()} FreelancerOS. Your freelance business, in one place.</span>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
