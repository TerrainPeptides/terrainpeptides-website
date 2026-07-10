'use client'

import { Suspense, useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { Eye, EyeOff, FlaskConical, Truck, Microscope } from 'lucide-react'

const AUTH_HERO_FEATURES = [
  {
    icon: FlaskConical,
    iconClass: 'text-sky-300',
    text: 'High quality · Lab tested · Verified COAs',
  },
  {
    icon: Truck,
    iconClass: 'text-clinical-teal',
    text: 'Same-day shipping on orders before 1PM PST',
  },
  {
    icon: Microscope,
    iconClass: 'text-sky-200',
    text: 'Research use only · Verified accounts',
  },
] as const

type Tab = 'signin' | 'signup'

interface FormErrors {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
  general?: string
}

export default function AuthPage() {
  return (
    <Suspense fallback={<AuthPageSkeleton />}>
      <AuthPageInner />
    </Suspense>
  )
}

function AuthPageSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-navy" />
    </div>
  )
}

function saveClaimedPromo(code: string, percent: number) {
  try {
    const existing = JSON.parse(localStorage.getItem('terrain-saved-discounts') ?? '[]')
    const already = existing.some((d: { code: string }) => d.code === code)
    if (!already) {
      existing.push({ code, percent, claimedAt: new Date().toISOString() })
      localStorage.setItem('terrain-saved-discounts', JSON.stringify(existing))
    }
    // Also pre-load into the cart discount keys so it applies immediately
    localStorage.setItem('terrain-referral', code)
    localStorage.setItem('terrain-discount', String(percent))
  } catch { /* silent */ }
}

function AuthPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/'
  const claimPromo = searchParams.get('claimPromo')
  const promoPercent = claimPromo === 'WELCOME15' ? 15 : null
  const tabParam = searchParams.get('tab')
  const affiliateSignup =
    tabParam === 'signup' || (callbackUrl.includes('tab=affiliate') || callbackUrl.includes('tab%3Daffiliate'))

  const [tab, setTab] = useState<Tab>(claimPromo || affiliateSignup ? 'signup' : 'signin')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})

  const [signInForm, setSignInForm] = useState({ email: '', password: '' })
  const [signUpForm, setSignUpForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const skipTabErrorClearRef = useRef(false)

  useEffect(() => {
    // Don't wipe a success / error banner we just set when switching tabs (e.g. after signup)
    if (skipTabErrorClearRef.current) {
      skipTabErrorClearRef.current = false
    } else {
      setErrors({})
    }
    setShowPassword(false)
    setShowConfirmPassword(false)
  }, [tab])

  function validateSignIn(): boolean {
    const errs: FormErrors = {}
    if (!signInForm.email) errs.email = 'Email is required.'
    else if (!/\S+@\S+\.\S+/.test(signInForm.email)) errs.email = 'Enter a valid email address.'
    if (!signInForm.password) errs.password = 'Password is required.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function validateSignUp(): boolean {
    const errs: FormErrors = {}
    if (!signUpForm.name.trim()) errs.name = 'Full name is required.'
    if (!signUpForm.email) errs.email = 'Email is required.'
    else if (!/\S+@\S+\.\S+/.test(signUpForm.email)) errs.email = 'Enter a valid email address.'
    if (!signUpForm.password) errs.password = 'Password is required.'
    else if (signUpForm.password.length < 8) errs.password = 'Password must be at least 8 characters.'
    if (!signUpForm.confirmPassword) errs.confirmPassword = 'Please confirm your password.'
    else if (signUpForm.password !== signUpForm.confirmPassword) errs.confirmPassword = 'Passwords do not match.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    if (!validateSignIn()) return
    setLoading(true)
    setErrors({})
    try {
      const result = await signIn('credentials', {
        email: signInForm.email,
        password: signInForm.password,
        redirect: false,
      })
      if (result?.error) {
        setErrors({ general: 'Invalid email or password. Please try again.' })
      } else {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (err) {
      // NextAuth v5 throws CredentialsSignin instead of returning { error } for bad credentials
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.toLowerCase().includes('credentialssignin') || msg.toLowerCase().includes('credentials')) {
        setErrors({ general: 'Invalid email or password. Please try again.' })
      } else {
        setErrors({ general: 'Something went wrong. Please try again.' })
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    if (!validateSignUp()) return
    setLoading(true)
    setErrors({})
    try {
      // Outside /api/auth/* so NextAuth catch-all can never intercept this route
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signUpForm.name,
          email: signUpForm.email,
          password: signUpForm.password,
        }),
      })

      const raw = await res.text()
      let data: { error?: string; message?: string } = {}
      if (raw.trim()) {
        try {
          data = JSON.parse(raw) as { error?: string; message?: string }
        } catch {
          setErrors({
            general: `Registration failed (HTTP ${res.status}). The server returned an unexpected response — please try again.`,
          })
          return
        }
      }

      if (!res.ok) {
        setErrors({ general: data.error ?? 'Sign up failed. Please try again.' })
        return
      }

      const emailLower = signUpForm.email.trim().toLowerCase()
      if (claimPromo && promoPercent) {
        saveClaimedPromo(claimPromo, promoPercent)
      }

      try {
        const signInResult = await signIn('credentials', {
          email: emailLower,
          password: signUpForm.password,
          redirect: false,
        })
        if (!signInResult?.error) {
          router.push(callbackUrl)
          router.refresh()
          return
        }
      } catch (signInErr) {
        const msg = signInErr instanceof Error ? signInErr.message : String(signInErr)
        if (!msg.toLowerCase().includes('credentialssignin') && !msg.toLowerCase().includes('credentials')) {
          console.error('[auth] auto sign-in after signup:', signInErr)
        }
      }

      skipTabErrorClearRef.current = true
      setSignInForm({ email: emailLower, password: '' })
      setSignUpForm({ name: '', email: '', password: '', confirmPassword: '' })
      setTab('signin')
      setErrors({
        general: 'Account created! Sign in below with the same email and password.',
      })
    } catch (err) {
      console.error('[auth] handleSignUp:', err)
      setErrors({ general: 'Network error. Check your connection and try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* ── Left Panel: full-bleed photo (vial on right, empty navy on left) + HTML text in that left zone ── */}
      <div className="relative hidden min-h-screen md:block md:w-[55%] lg:w-[60%]">
        <div className="relative min-h-screen w-full">
          <Image
            src="/images/auth-hero-panel.png"
            alt="GHK-Cu research peptide vial"
            fill
            className="object-cover object-left"
            priority
            sizes="(min-width: 1024px) 60vw, 55vw"
          />
          {/* Text in the left “empty” area (see annotated reference); vial stays visible on the right */}
          <div className="absolute inset-0 flex items-center justify-start">
            <div
              className="flex h-full w-1/2 min-w-0 max-w-md flex-col justify-center px-7 py-10 pl-8 sm:max-w-lg sm:pl-10 xl:pl-12 xl:pr-2 [&_h1]:[text-shadow:0_2px_24px_rgba(0,0,0,0.55)] [&_li_span:last-child]:[text-shadow:0_1px_12px_rgba(0,0,0,0.45)] [&_p]:[text-shadow:0_1px_16px_rgba(0,0,0,0.4)]"
            >
              <h1 className="text-3xl font-bold leading-[1.1] tracking-tight text-white sm:text-4xl xl:text-[2.65rem] xl:leading-[1.08]">
                Member-only
                <br />
                <span className="text-[#BAE6FD]">research access.</span>
              </h1>
              <p className="mt-5 max-w-none text-[15px] leading-relaxed text-[#cbd5e1] sm:text-base">
                Sign up to browse our full catalog of lab-tested, high-purity peptides — for verified
                researchers only.
              </p>
              <ul className="mt-9 space-y-4">
                {AUTH_HERO_FEATURES.map(({ icon: Icon, iconClass, text }) => (
                  <li key={text} className="flex items-start gap-3.5">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/20 bg-white/10 backdrop-blur-[2px]">
                      <Icon className={`h-4 w-4 ${iconClass}`} strokeWidth={2} />
                    </span>
                    <span className="pt-1 text-sm font-medium leading-snug text-white/95">{text}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-12 text-xs text-white/45 [text-shadow:0_1px_8px_rgba(0,0,0,0.5)]">
                © {new Date().getFullYear()} Terrain Peptides · For research use only
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Panel ─────────────────────────────────────── */}
      <div className="flex flex-1 items-center justify-center bg-white px-6 py-12 sm:px-10">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="mb-8 flex justify-center md:hidden">
            <Image
              src="/images/terrain-logo.png"
              alt="Terrain"
              width={603}
              height={278}
              className="h-12 w-auto"
            />
          </div>

          {/* Promo claim banner */}
          {claimPromo && promoPercent && (
            <div className="mb-6 rounded-2xl bg-primary px-5 py-4 text-white">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <span className="text-sm">🎁</span>
                </div>
                <div>
                  <p className="text-sm font-bold">
                    {promoPercent}% off waiting for you
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-white/60">
                    Create your account and code{' '}
                    <span className="font-mono font-bold text-white">{claimPromo}</span>{' '}
                    will be saved automatically.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab switcher */}
          <div className="mb-8 border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setTab('signin')}
                className={`pb-3 pr-6 text-sm font-semibold transition-all ${
                  tab === 'signin'
                    ? 'border-b-2 border-navy text-navy'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setTab('signup')}
                className={`pb-3 px-4 text-sm font-semibold transition-all ${
                  tab === 'signup'
                    ? 'border-b-2 border-navy text-navy'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Create Account
              </button>
            </div>
          </div>

          {/* General error banner */}
          {errors.general && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errors.general}
            </div>
          )}

          {/* ── Sign In Form ─────────────────── */}
          {tab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-5" noValidate>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Email or Username
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={signInForm.email}
                  onChange={e => setSignInForm(f => ({ ...f, email: e.target.value }))}
                  className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition focus:border-navy focus:ring-2 focus:ring-navy/10 ${
                    errors.email ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
                  }`}
                />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={signInForm.password}
                    onChange={e => setSignInForm(f => ({ ...f, password: e.target.value }))}
                    className={`w-full rounded-lg border px-4 py-2.5 pr-11 text-sm outline-none transition focus:border-navy focus:ring-2 focus:ring-navy/10 ${
                      errors.password ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
              </div>

              <div className="flex justify-end">
                <Link
                  href="/auth/forgot-password"
                  className="text-xs font-medium text-navy/70 hover:text-navy transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-navy px-4 py-3 text-sm font-semibold text-white transition hover:bg-navy-light disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Signing in…
                  </>
                ) : (
                  'Sign In →'
                )}
              </button>

              <p className="text-center text-xs text-gray-500">
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => setTab('signup')}
                  className="font-semibold text-navy hover:underline"
                >
                  Create one
                </button>
              </p>
            </form>
          )}

          {/* ── Sign Up Form ─────────────────── */}
          {tab === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-5" noValidate>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Full Name
                </label>
                <input
                  type="text"
                  autoComplete="name"
                  placeholder="Dr. Jane Smith"
                  value={signUpForm.name}
                  onChange={e => setSignUpForm(f => ({ ...f, name: e.target.value }))}
                  className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition focus:border-navy focus:ring-2 focus:ring-navy/10 ${
                    errors.name ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
                  }`}
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Email
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={signUpForm.email}
                  onChange={e => setSignUpForm(f => ({ ...f, email: e.target.value }))}
                  className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition focus:border-navy focus:ring-2 focus:ring-navy/10 ${
                    errors.email ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
                  }`}
                />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Min. 8 characters"
                    value={signUpForm.password}
                    onChange={e => setSignUpForm(f => ({ ...f, password: e.target.value }))}
                    className={`w-full rounded-lg border px-4 py-2.5 pr-11 text-sm outline-none transition focus:border-navy focus:ring-2 focus:ring-navy/10 ${
                      errors.password ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Re-enter your password"
                    value={signUpForm.confirmPassword}
                    onChange={e => setSignUpForm(f => ({ ...f, confirmPassword: e.target.value }))}
                    className={`w-full rounded-lg border px-4 py-2.5 pr-11 text-sm outline-none transition focus:border-navy focus:ring-2 focus:ring-navy/10 ${
                      errors.confirmPassword ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-navy px-4 py-3 text-sm font-semibold text-white transition hover:bg-navy-light disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Creating account…
                  </>
                ) : (
                  'Create Account →'
                )}
              </button>

              <p className="text-center text-xs text-gray-500">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setTab('signin')}
                  className="font-semibold text-navy hover:underline"
                >
                  Sign in
                </button>
              </p>

              <p className="text-center text-[11px] leading-relaxed text-gray-400">
                By creating an account you agree to our{' '}
                <Link href="/terms" className="underline hover:text-gray-600">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="underline hover:text-gray-600">
                  Privacy Policy
                </Link>
                .
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
