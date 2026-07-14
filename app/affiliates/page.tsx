'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import {
  ArrowRight,
  Percent,
  Tag,
  FlaskConical,
  TrendingUp,
  ShieldCheck,
  BarChart3,
  Users,
  Wallet,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const stats = [
  { value: '10%', label: 'Commission per sale', icon: Percent },
  { value: 'Instant', label: 'Payout processing', icon: Wallet },
  { value: '500+', label: 'Active partners', icon: Users },
]

const steps = [
  {
    n: '01',
    title: 'Create Account',
    desc: 'Register as a verified Terrain member — takes under two minutes.',
  },
  {
    n: '02',
    title: 'Claim Your Code',
    desc: 'Access your affiliate dashboard and generate a unique referral code.',
  },
  {
    n: '03',
    title: 'Earn Commission',
    desc: 'Share your code and earn 10% on every qualified order you refer.',
  },
]

const benefits = [
  {
    icon: Percent,
    title: '10% Flat Commission',
    desc: 'Earn on every referred sale. No tier caps, no minimum volume requirements.',
  },
  {
    icon: Tag,
    title: 'Tracked Referral Codes',
    desc: 'Unique discount codes with automatic attribution and reporting.',
  },
  {
    icon: FlaskConical,
    title: 'Premium Product Line',
    desc: 'Promote lab-verified compounds with 99%+ purity and full COA documentation.',
  },
  {
    icon: TrendingUp,
    title: 'Volume Bonuses',
    desc: 'Top-performing partners qualify for monthly performance incentives.',
  },
  {
    icon: BarChart3,
    title: 'Partner Dashboard',
    desc: 'Real-time referral stats, earnings history, and payout tracking.',
  },
  {
    icon: ShieldCheck,
    title: 'Brand You Can Trust',
    desc: 'US warehouse, third-party tested batches, and research-grade standards.',
  },
]

const requirements = [
  'Must be 21+ with a verified Terrain account',
  'Comply with research-use-only messaging guidelines',
  'No medical claims or human-use promotion permitted',
  'Commissions paid on completed, non-refunded orders',
]

export default function AffiliatesPage() {
  const { data: session } = useSession()
  const applyHref = session
    ? '/account?tab=affiliate'
    : '/auth?tab=signup&callbackUrl=%2Faccount%3Ftab%3Daffiliate'

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="page-hero-dark">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-terrain">
                Partner program
              </p>
              <h1 className="mt-4 text-balance text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-[2.5rem] lg:leading-[1.15]">
                Research Affiliate <span className="orbit-accent">Partnership</span> Program
              </h1>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
                Partner with a premium research peptide supplier. Earn{' '}
                <span className="font-semibold text-ink">10% commission</span> on every order you
                refer — backed by documented quality and US fulfillment.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  size="lg"
                  className="rounded-full bg-terrain px-8 font-semibold text-white hover:bg-terrain-deep"
                  asChild
                >
                  <Link href={applyHref}>
                    Apply Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full border-border bg-white text-ink hover:border-terrain hover:text-terrain-deep"
                  asChild
                >
                  <a href="#how-it-works">How It Works</a>
                </Button>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border bg-section-subtle">
              <div className="border-b border-border px-5 py-3">
                <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Commission structure
                </p>
              </div>
              <div className="p-6 sm:p-8">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold tabular-nums text-terrain-deep">10%</span>
                  <span className="text-sm font-medium text-muted-foreground">per qualified sale</span>
                </div>
                <ul className="mt-6 space-y-3 border-t border-border pt-6">
                  {[
                    'Automatic tracking via unique referral code',
                    'Instant payout processing on completed orders',
                    'No cap on monthly earnings',
                    'Performance bonuses for top partners',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-terrain" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-border">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-2 px-4 text-center sm:py-2">
                <s.icon className="h-5 w-5 text-clinical-teal" aria-hidden />
                <span className="text-3xl font-bold tabular-nums text-primary sm:text-4xl">{s.value}</span>
                <span className="text-sm font-medium text-muted-foreground">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-section-subtle py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <p className="section-index justify-center">Onboarding</p>
            <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
              How It Works
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Three steps to start earning as a Terrain research partner.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.n}
                className="relative flex flex-col rounded-lg border border-border bg-white p-6 shadow-sm"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
                  {step.n}
                </span>
                <h3 className="mt-4 text-base font-semibold text-navy">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="border-y border-border bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary">
              Partner benefits
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-navy sm:text-3xl">
              Why Partner With Terrain
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              A clinical-grade brand built for researchers, educators, and content creators.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="group flex flex-col rounded-md border border-border bg-section-subtle/50 p-6 transition hover:border-primary/20 hover:bg-white hover:shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md border border-primary/15 bg-section-clinical transition group-hover:border-primary/30">
                  <b.icon className="h-5 w-5 text-primary" aria-hidden />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-navy">{b.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements + CTA */}
      <section className="bg-ink py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
            <div>
              <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-terrain-bright">
                Program guidelines
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Partner Requirements
              </h2>
              <ul className="mt-6 space-y-3">
                {requirements.map((req) => (
                  <li key={req} className="flex items-start gap-2.5 text-sm text-white/70">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-terrain-bright" aria-hidden />
                    {req}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-ink-soft p-8">
              <h3 className="text-xl font-semibold text-white">Ready to apply?</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/65">
                Create your account and claim your referral code from the affiliate tab in your dashboard.
              </p>
              <Button
                size="lg"
                className="mt-6 w-full rounded-full bg-terrain font-semibold text-white hover:bg-terrain-deep sm:w-auto"
                asChild
              >
                <Link href={applyHref}>
                  Start Application
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <p className="mt-4 text-xs text-white/45">
                Already a member?{' '}
                <Link href="/account?tab=affiliate" className="text-terrain-bright underline underline-offset-2 hover:text-white">
                  Go to your dashboard
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
