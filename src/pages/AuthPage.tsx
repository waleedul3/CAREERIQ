import React, { useState } from 'react';
import {
  ArrowRight,
  GitBranch,
  Info,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { BrandMark } from '../components/BrandMark.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { loginSchema, registerSchema } from '../lib/validation.ts';

interface AuthPageProps {
  mode: 'register' | 'login';
  onNavigate: (path: string) => void;
}

export function AuthPage({ mode, onNavigate }: AuthPageProps) {
  const { login, register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isRegister = mode === 'register';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isRegister) {
      const parsed = registerSchema.safeParse({ name, email, password, confirmPassword });
      if (!parsed.success) {
        setError(parsed.error.issues[0]?.message || 'Please check your registration details.');
        return;
      }
    } else {
      const parsed = loginSchema.safeParse({ email, password });
      if (!parsed.success) {
        setError(parsed.error.issues[0]?.message || 'Please enter valid credentials.');
        return;
      }
    }

    setSubmitting(true);
    try {
      const user = isRegister
        ? await register({ name, email, password, confirmPassword })
        : await login(email, password);
      onNavigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col dark:bg-slate-950">
      {/* Top Bar */}
      <header className="border-b border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-6 py-4">
          <BrandMark onClick={() => onNavigate('/')} />
          <div className="text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">
            {isRegister ? (
              <>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => onNavigate('/login')}
                  className="font-semibold text-[#1D4ED8] hover:underline dark:text-blue-400"
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                New to CareerIQ?{' '}
                <button
                  type="button"
                  onClick={() => onNavigate('/register')}
                  className="font-semibold text-[#1D4ED8] hover:underline dark:text-blue-400"
                >
                  Create account
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Split Card matching Screenshot 2 */}
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm grid md:grid-cols-12 dark:border-slate-800 dark:bg-slate-900">
          {/* Left Cobalt Panel */}
          <div className="md:col-span-5 bg-[#1D4ED8] p-8 text-white flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center rounded-md bg-white/15 px-2.5 py-1 text-xs font-medium text-white">
                Student access
              </div>
              <h1 className="mt-6 text-2xl font-bold leading-snug font-display">
                {isRegister
                  ? 'Start with the career story only you can tell.'
                  : 'Welcome back to your readiness workspace.'}
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-blue-100">
                Your account keeps your profile, readiness history, learning roadmap, and resume
                feedback in one private place.
              </p>
            </div>

            <ul className="mt-10 space-y-3.5 text-xs text-blue-50">
              <li className="flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 shrink-0 text-blue-200" />
                <span>Private student workspace</span>
              </li>
              <li className="flex items-center gap-2.5">
                <TrendingUp className="h-4 w-4 shrink-0 text-blue-200" />
                <span>Track evidence, not promises</span>
              </li>
              <li className="flex items-center gap-2.5">
                <GitBranch className="h-4 w-4 shrink-0 text-blue-200" />
                <span>Build a focused learning path</span>
              </li>
            </ul>
          </div>

          {/* Right Form Panel */}
          <div className="md:col-span-7 p-8 sm:p-10">
            <p className="text-xs font-semibold text-[#1D4ED8] dark:text-blue-400">
              {isRegister ? 'Create account' : 'Student sign in'}
            </p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
              {isRegister ? 'Join CareerIQ' : 'Sign in to CareerIQ'}
            </h2>
            <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300">
              {isRegister
                ? 'Use your academic email to create a student account.'
                : 'Enter your email and password to open your dashboard.'}
            </p>

            {error && (
              <div
                role="alert"
                className="mt-5 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
              >
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {isRegister && (
                <div>
                  <label
                    htmlFor="auth-name"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-200"
                  >
                    Full name
                  </label>
                  <input
                    id="auth-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Aisha Khan"
                    className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="auth-email"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-200"
                >
                  University email
                </label>
                <input
                  id="auth-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="aisha@university.edu"
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className={isRegister ? 'grid gap-4 sm:grid-cols-2' : ''}>
                <div>
                  <label
                    htmlFor="auth-password"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-200"
                  >
                    Password
                  </label>
                  <input
                    id="auth-password"
                    type="password"
                    required
                    minLength={isRegister ? 8 : 1}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isRegister ? 'At least 8 characters' : 'Enter password'}
                    className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                {isRegister && (
                  <div>
                    <label
                      htmlFor="auth-confirm"
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-200"
                    >
                      Confirm password
                    </label>
                    <input
                      id="auth-confirm"
                      type="password"
                      required
                      minLength={8}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                )}
              </div>

              {isRegister && (
                <div className="flex items-start gap-2.5 rounded-lg bg-slate-50 p-3.5 text-xs leading-relaxed text-slate-600 border border-slate-100 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
                  <Info className="h-4 w-4 shrink-0 text-blue-700 dark:text-blue-400 mt-0.5" />
                  <span>
                    CareerIQ creates student accounts by default. Administrator access is assigned
                    separately and is protected on the server.
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#1D4ED8] px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60 transition-colors"
              >
                <span>
                  {submitting
                    ? isRegister
                      ? 'Creating account...'
                      : 'Signing in...'
                    : isRegister
                      ? 'Create my account'
                      : 'Sign in'}
                </span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <p className="pt-1 text-center text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                By continuing, you acknowledge that CareerIQ provides educational readiness estimates
                and guidance, not employment decisions or guarantees.
              </p>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
