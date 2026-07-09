'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import {
  ArrowRight,
  Percent,
  Tag,
  FlaskConical,
  TrendingUp,
} from 'lucide-react'

const GOLD = '#C9A84C'
const NAVY = '#0A1931'

const stats = [
  { value: '10%', label: 'Commission Per Sale' },
  { value: 'Instant', label: 'Payouts' },
  { value: '500+', label: 'Active Affiliates' },
]

const steps = [
  {
    n: '01',
    title: 'Sign Up',
    desc: 'Create your Terrain account — it only takes a minute.',
  },
  {
    n: '02',
    title: 'Get Your Code',
    desc: 'Claim your unique referral code from your affiliate dashboard.',
  },
  {
    n: '03',
    title: 'Start Earning',
    desc: 'Share your code and earn 10% commission on every order you refer.',
  },
]

const benefits = [
  {
    icon: Percent,
    title: '10% Commission on Every Sale',
    desc: 'Earn a flat 10% on every order you refer. No minimums, no caps.',
  },
  {
    icon: Tag,
    title: 'Your Own Rep Code',
    desc: 'Get a unique discount code your audience can use — tracked automatically.',
  },
  {
    icon: FlaskConical,
    title: 'Early Product Access',
    desc: 'Be the first to try new compounds before they go live to the public.',
  },
  {
    icon: TrendingUp,
    title: 'Performance Bonuses',
    desc: 'Top affiliates earn monthly bonus payouts based on sales volume.',
  },
]

export default function AffiliatesPage() {
  const { data: session } = useSession()
  const applyHref = session
    ? '/account?tab=affiliate'
    : '/auth?tab=signup&callbackUrl=%2Faccount%3Ftab%3Daffiliate'

  return (
    <div className="flex flex-col font-sans">
      <section
        className="relative overflow-hidden"
        style={{ background: `radial-gradient(ellipse 80% 60% at 50% -10%, #132744 0%, ${NAVY} 60%, #060f1f 100%)` }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-40 -top-40 h-[480px] w-[480px] rounded-full opacity-10 blur-3xl"
          style={{ background: GOLD }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 right-0 h-[360px] w-[360px] rounded-full opacity-10 blur-3xl"
          style={{ background: GOLD }}
        />

        <div className="relative mx-auto max-w-4xl px-4 pb-24 pt-20 text-center sm:px-6 sm:pb-32 sm:pt-28 lg:px-8">
          <span
            className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest"
            style={{ background: `${GOLD}22`, color: GOLD, border: `1px solid ${GOLD}44` }}
          >
            Affiliate Program
          </span>

          <h1 className="text-balance text-5xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
            EARN WITH{' '}
            <span style={{ color: GOLD }}>TERRAIN</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-white/70 sm:text-xl">
            Join our research affiliate program and earn{' '}
            <span className="font-semibold text-white">10% commission</span> on every order
            you refer. No cap on earnings.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href={applyHref}
              className="inline-flex items-center gap-2 rounded-lg px-8 py-3.5 text-base font-semibold text-foreground shadow-lg transition-opacity hover:opacity-90"
              style={{ background: GOLD }}
            >
              Apply Now
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-8 py-3.5 text-base font-semibold text-white transition-colors hover:border-white/40 hover:bg-white/5"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-white dark:bg-card">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className={`flex flex-col items-center gap-1 text-center${
                  i > 0 ? ' border-t border-border pt-8 sm:border-l sm:border-t-0 sm:pt-0' : ''
                }`}
              >
                <span
                  className="text-4xl font-extrabold tracking-tight sm:text-5xl"
                  style={{ color: NAVY }}
                >
                  {s.value}
                </span>
                <span className="text-base font-medium text-muted-foreground">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="bg-background py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-black sm:text-4xl">
              How It Works
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-lg text-muted-foreground">
              Three simple steps to start earning with Terrain Peptides.
            </p>
          </div>

          <div className="relative grid gap-8 sm:grid-cols-3">
            <div
              aria-hidden
              className="absolute left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] top-8 hidden h-px sm:block"
              style={{ background: `linear-gradient(90deg, transparent 0%, ${NAVY}30 20%, ${NAVY}30 80%, transparent 100%)` }}
            />

            {steps.map((step) => (
              <div key={step.n} className="relative flex flex-col items-center gap-4 text-center">
                <div
                  className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-extrabold tracking-tight text-white shadow-lg"
                  style={{ background: NAVY }}
                >
                  {step.n}
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-tight text-black">{step.title}</h3>
                  <p className="mt-2 text-base leading-relaxed text-muted-foreground">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28" style={{ background: NAVY }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Why Partner With Us
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-lg text-white/60">
              Built for creators and researchers who want a premium brand behind them.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="group flex flex-col gap-4 rounded-2xl p-6 transition-colors hover:bg-white/5"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ background: `${GOLD}22` }}
                >
                  <b.icon className="h-6 w-6" style={{ color: GOLD }} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{b.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-14 text-center">
            <Link
              href={applyHref}
              className="inline-flex items-center gap-2 rounded-lg px-8 py-3.5 text-base font-semibold text-foreground shadow-lg transition-opacity hover:opacity-90"
              style={{ background: GOLD }}
            >
              Apply Now
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
