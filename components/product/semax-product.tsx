'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { ChevronLeft, FileText, FlaskConical, Star } from 'lucide-react'
import { RelatedProducts } from '@/components/product/related-products'
import { ProductNamePanel } from '@/components/product/product-name-panel'
import type { Product, Vouch } from '@/lib/types'

interface SemaxProductProps {
  product: Product
  relatedProducts?: Product[]
  vouches?: Vouch[]
}

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVisible(true)
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return { ref, visible }
}

const GREEN = '#16a34a'

const STAT_CARDS = [
  {
    value: '3x',
    label: 'BRAIN GROWTH FACTOR BOOST',
    subtext:
      'The protein your brain uses to build new connections — tripled after one dose',
  },
  {
    value: '80%',
    label: 'MEMORY IMPROVEMENT',
    subtext: 'Users performed 80% better on memory tasks compared to placebo',
  },
  {
    value: '65%',
    label: 'SHARPER FOCUS',
    subtext:
      'Clinically measured improvement in sustained attention and task performance',
  },
  {
    value: '40%',
    label: 'FASTER MENTAL RECOVERY',
    subtext:
      'Significantly faster cognitive recovery compared to standard treatment alone',
  },
  {
    value: '100%',
    label: 'STRAIGHT TO YOUR BRAIN',
    subtext:
      'Unlike most compounds, Semax crosses the blood brain barrier completely — no dilution, full effect',
  },
]

const MECHANISM_NODES = [
  {
    id: 'bdnf',
    label: 'BDNF Primary',
    title: 'Brain Growth Factor',
    sub: 'BDNF-driven plasticity',
    bullets: [
      'Triggers the protein your brain uses to build new connections',
      'Kicks in within hours of a single dose',
      'Effects last days after the peptide leaves your system',
      'Directly responsible for the memory and focus improvements',
    ],
    color: 'bg-gray-200',
  },
  {
    id: 'acth',
    label: 'ACTH Strongest',
    title: 'Stress & Focus Control',
    sub: 'Neuroendocrine signaling',
    bullets: [
      'Mimics a natural brain signal that sharpens focus under pressure',
      'Resistant to breakdown — stays active longer than most peptides',
      'Reduces mental fatigue without stimulants',
      'Used in Russia for decades to boost mental performance',
    ],
    color: 'bg-[#16a34a]',
  },
  {
    id: 'ngf',
    label: 'NGF Supportive',
    title: 'Nerve Repair & Protection',
    sub: 'Neuroprotective support',
    bullets: [
      'Helps repair and protect existing neurons',
      'Supports long term brain health not just short term performance',
      'Reduces damage from stress and poor sleep',
      'Works alongside BDNF for compounded effect',
    ],
    color: 'bg-[#16a34a]/70',
  },
]

const COMPARISON_ROWS = [
  { label: 'Focus & Attention vs Placebo', value: '+65%', barWidth: 65 },
  { label: 'Memory Recall vs Placebo', value: '+80%', barWidth: 80 },
  { label: 'Mental Recovery vs Standard Care', value: '+40%', barWidth: 40 },
  { label: 'Brain Growth Factor vs Baseline', value: '+200%', barWidth: 100 },
]

const KEY_TRIAL_FINDINGS = [
  {
    stat: '3x',
    label: 'Brain Growth Factor Increase',
    sub: 'Measured after a single dose in hippocampal tissue',
    progress: 100,
  },
  {
    stat: '80%',
    label: 'Performed Better on Memory Tests',
    sub: 'Compared to placebo group across multiple trials',
    progress: 80,
  },
  {
    stat: 'Approved',
    label: 'Prescription Drug in Russia',
    sub: 'One of the only peptides with full government medical approval',
    progress: 100,
  },
]

const BEYOND_FOCUS_HIGHLIGHTS = [
  {
    title: 'Mood',
    label: 'ANXIETY RELIEF',
    desc: 'Reduces anxiety and stress without sedation or dependency',
    highlight: true,
  },
  {
    title: 'Neuro',
    label: 'BRAIN PROTECTION',
    desc: 'Shields neurons from damage caused by stress, poor sleep, and aging',
    highlight: false,
  },
  {
    title: 'Vision',
    label: 'OPTIC NERVE',
    desc: 'Approved in Russia specifically for optic nerve disease and vision deterioration',
    highlight: false,
  },
  {
    title: 'Recovery',
    label: 'STROKE & INJURY',
    desc: 'Clinically used to accelerate cognitive recovery after brain injury and stroke',
    highlight: false,
  },
]

const BEYOND_DETAILED_CARDS = [
  {
    title: 'Anxiety & Stress Relief',
    body: "Semax calms the stress response without touching dopamine or serotonin. No crashes, no dependency, no hormonal side effects. Just a quieter mind that can actually focus.",
    metrics: [
      'Anxiety → ↓ Reduced',
      'Stress Response → ↓ Lowered',
      'Dependency Risk → None',
      'Sedation → None',
    ],
    callout: 'Modulates stress pathways via melanocortin receptors with zero sedative effect',
    calloutBorder: 'border-blue-400',
  },
  {
    title: 'Neuroprotection',
    body: "Most people think about Semax for performance. But the research shows it's equally powerful at protecting what you already have — shielding neurons from oxidative stress, inflammation, and age related decline.",
    metrics: [
      'Oxidative Stress → ↓ Reduced',
      'Neuroinflammation → ↓ Decreased',
      'Neuron Survival → ↑ Increased',
      'Long Term Brain Health → ↑ Supported',
    ],
    callout: 'Significantly reduced neuronal death in ischemic brain injury models',
    calloutBorder: 'border-[#16a34a]',
  },
  {
    title: 'Vision Support',
    body: 'One of the most underrated applications of Semax. Russian medical authorities approved it specifically for optic nerve disease — showing it has regenerative effects beyond just the brain.',
    metrics: [
      'Optic Nerve Health → ↑ Supported',
      'Vision Deterioration → ↓ Slowed',
      'Nerve Regeneration → ↑ Enhanced',
    ],
    callout: 'Officially approved in Russia for treatment of optic nerve disease',
    calloutBorder: 'border-blue-400',
  },
]

const SAFETY_TABLE_ROWS = [
  { effect: 'Nasal Irritation', freq: '8%', severity: 'MILD' },
  { effect: 'Temporary Headache', freq: '5%', severity: 'MILD' },
  { effect: 'Fatigue at High Doses', freq: '3%', severity: 'MILD' },
  { effect: 'Vivid Dreams', freq: '4%', severity: 'MILD' },
]

const SAFETY_ADVANTAGE_CARDS = [
  {
    title: 'Not a Stimulant',
    body: 'Semax sharpens focus and energy without touching your dopamine or adrenaline system. No crash after it wears off. No tolerance buildup. No feeling wired. Just clean mental performance.',
    bullets: [
      'Zero dopamine interference',
      'No adrenal fatigue',
      'No tolerance with repeated use',
      'No crash or comedown',
    ],
  },
  {
    title: 'No Hormonal Effects',
    body: 'Unlike peptides that touch growth hormone or testosterone pathways, Semax operates purely on neurotrophin systems. Your endocrine system stays completely untouched.',
    bullets: [
      'No effect on testosterone',
      'No effect on cortisol',
      'No effect on thyroid',
      'Safe for long term research use',
    ],
  },
  {
    title: 'Decades of Human Data',
    body: "Semax isn't new. It has been prescribed by Russian doctors since the 1980s. That's 40 years of real world human use data — more than most research compounds can claim.",
    bullets: [
      'Approved prescription drug since 1980s',
      'Used in thousands of clinical patients',
      'No long term adverse effects documented',
      'One of the most studied neuropeptides in existence',
    ],
  },
]

const RISK_SEMAX_ROW = {
  label: 'Side effect risk',
  value: '8% LOW',
  barWidth: 8,
  barColor: GREEN,
}

const RISK_ALTERNATIVE_ROWS = [
  { label: 'Modafinil Side Effect Risk', value: '35% MODERATE', barWidth: 35, barColor: '#d97706' },
  { label: 'Adderall Side Effect Risk', value: '60% HIGH', barWidth: 60, barColor: '#dc2626' },
  { label: 'Caffeine Side Effect Risk', value: '25% MODERATE', barWidth: 25, barColor: '#d97706' },
]

function RiskComparisonBarRow({
  label,
  value,
  barWidth,
  barColor,
}: {
  label: string
  value: string
  barWidth: number
  barColor: string
}) {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <span className="w-36 shrink-0 text-xs leading-snug text-[#0A1931]/70 sm:w-48">{label}</span>
      <div className="h-3 min-w-0 flex-1 overflow-hidden rounded-full bg-[#0A1931]/10">
        <div className="h-full rounded-full" style={{ width: `${barWidth}%`, backgroundColor: barColor }} />
      </div>
      <span className="shrink-0 text-xs font-medium" style={{ color: barColor }}>
        {value}
      </span>
    </div>
  )
}

export function SemaxProduct({ product, relatedProducts = [], vouches = [] }: SemaxProductProps) {
  const [activeTab, setActiveTab] = useState('research')
  const section1 = useScrollReveal()
  const section2 = useScrollReveal()

  const productVouches = vouches.filter((v) => v.product_id === product.id || v.product_id === null)
  const imageSrc = product.image_url || null

  return (
    <div className="min-h-screen bg-white text-[#0A1931]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/shop"
          className="mb-6 inline-flex items-center gap-1 text-sm text-[#0A1931]/70 transition-colors hover:text-[#0A1931]"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Shop
        </Link>

        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-12">
          <div
            ref={section1.ref}
            className={`transition-all duration-500 ease-out ${section1.visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
          >
            <Card className="overflow-hidden border-[#0A1931]/10 bg-[#f8f9fa]">
              <CardContent className="flex min-h-[320px] items-center justify-center p-8 sm:min-h-[400px] lg:min-h-[440px]">
                {imageSrc ? (
                  <div className="relative h-[280px] w-full max-w-[280px] transition-transform duration-300 ease-out hover:scale-[1.02] sm:h-[340px] sm:max-w-[340px] lg:h-[380px] lg:max-w-[380px]">
                    <Image
                      src={imageSrc}
                      alt={product.name}
                      fill
                      className="object-contain"
                      sizes="(max-width: 1024px) 340px, 380px"
                      priority
                      unoptimized={imageSrc.startsWith('data:') || imageSrc.startsWith('/')}
                    />
                  </div>
                ) : (
                  <FlaskConical className="h-32 w-32 text-[#0A1931]/20" />
                )}
              </CardContent>
            </Card>
          </div>

          <ProductNamePanel product={product} theme="navy" />
        </div>

        <div
          ref={section2.ref}
          className={`mt-16 transition-all duration-500 ease-out ${section2.visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6 h-14 flex-wrap gap-2 bg-[#0A1931]/5 p-2">
              <TabsTrigger
                value="research"
                className="gap-2 px-6 py-3 text-base data-[state=active]:bg-white data-[state=active]:text-[#0A1931]"
              >
                <FileText className="h-4 w-4" />
                Research
              </TabsTrigger>
              {product.coa_url && (
                <TabsTrigger
                  value="coa"
                  className="gap-2 px-6 py-3 text-base data-[state=active]:bg-white data-[state=active]:text-[#0A1931]"
                >
                  <FileText className="h-4 w-4" />
                  COA
                </TabsTrigger>
              )}
              <TabsTrigger
                value="reviews"
                className="gap-2 px-6 py-3 text-base data-[state=active]:bg-white data-[state=active]:text-[#0A1931]"
              >
                <Star className="h-4 w-4" />
                Reviews
              </TabsTrigger>
            </TabsList>

            <TabsContent value="research" className="mt-0 space-y-12 text-[1.1em]">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#0A1931]/60">
                  ✨ Clinical outcomes
                </p>
                <p className="mt-0.5 text-sm text-[#0A1931]/60">Key research metrics.</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                  {STAT_CARDS.map((s) => (
                    <Card key={s.label} className="border-[#0A1931]/10">
                      <CardContent className="p-6 text-center">
                        <p className="text-2xl font-bold" style={{ color: GREEN }}>
                          {s.value}
                        </p>
                        <p className="mt-1 text-xs font-medium uppercase tracking-wider text-[#0A1931]/80">
                          {s.label}
                        </p>
                        <p className="mt-1 text-xs text-[#0A1931]/60">{s.subtext}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* How it Works — mechanism diagram + Key Discovery (matches GHK-Cu layout) */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#0A1931]/60">
                  🧬 How Semax Works
                </p>
                <p className="mt-0.5 text-sm text-[#0A1931]/60">
                  What&apos;s actually happening in your brain
                </p>
                <div className="mt-4 grid gap-6 lg:grid-cols-5">
                  <Card className="border-[#0A1931]/10 lg:col-span-3">
                    <CardContent className="p-6">
                      <p className="text-xs font-medium uppercase tracking-wider text-[#0A1931]/60">
                        The science, simplified
                      </p>
                      <h3 className="mt-2 font-bold text-[#0A1931]">Multi-Pathway Brain Support</h3>
                      <div className="mt-6 flex flex-wrap items-start justify-between gap-6">
                        {MECHANISM_NODES.map((n) => (
                          <div
                            key={n.id}
                            className="flex min-w-[140px] flex-1 flex-col items-center text-center"
                          >
                            <div
                              className={`flex h-14 w-14 items-center justify-center rounded-full text-xs font-semibold text-[#0A1931] ${n.color}`}
                            >
                              {n.label}
                            </div>
                            <p className="mt-2 font-semibold text-[#0A1931]">{n.title}</p>
                            <p className="text-xs text-[#0A1931]/70">{n.sub}</p>
                            <ul className="mt-2 space-y-0.5 text-left text-xs text-[#0A1931]/70">
                              {n.bullets.map((b) => (
                                <li key={b}>• {b}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                      <p className="mt-6 text-xs text-[#0A1931]/50">Source: Peer-reviewed literature.</p>
                    </CardContent>
                  </Card>
                  <Card className="border-0 bg-[#0A1931] lg:col-span-2">
                    <CardContent className="p-6 text-white">
                      <p className="text-xs font-medium uppercase tracking-wider text-white/70">
                        Key discovery
                      </p>
                      <h3 className="mt-2 font-bold">Why Semax Hits Different</h3>
                      <p className="mt-3 text-sm text-white/80">
                        Most nootropics work on neurotransmitters like dopamine or serotonin — you feel it for a
                        few hours then it wears off. Semax works upstream. It increases the proteins your brain uses
                        to physically build new neural connections. That&apos;s why the effects compound over time
                        instead of fading.
                      </p>
                      <div className="mt-6 rounded-lg bg-white/10 p-4">
                        <p className="text-sm font-medium leading-relaxed text-white" style={{ color: GREEN }}>
                          A single dose tripled brain growth factor levels and the effect persisted for days — not
                          hours
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* What research has shown — matches GHK-Cu two-column layout */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#0A1931]/60">
                  📊 What Research Has Shown
                </p>
                <p className="mt-0.5 text-sm text-[#0A1931]/60">Real results from real studies</p>
                <div className="mt-4 grid gap-6 lg:grid-cols-2">
                  <Card className="border-[#0A1931]/10">
                    <CardContent className="p-6">
                      <span className="rounded-full bg-[#0A1931]/5 px-3 py-1 text-xs text-[#0A1931]/70">
                        🗓️ Russian Clinical Trial — Healthy Volunteers & Stroke Patients
                      </span>
                      <p className="mt-4 text-4xl font-bold" style={{ color: GREEN }}>
                        80%
                      </p>
                      <p className="text-xs font-medium uppercase tracking-wider text-[#0A1931]/70">
                        OF USERS PERFORMED BETTER ON MEMORY AND FOCUS TESTS AFTER 5 DAYS
                      </p>
                      <p className="mt-4 text-sm font-semibold text-[#0A1931]">Clinical comparison</p>
                      <div className="mt-3 space-y-3">
                        {COMPARISON_ROWS.map((row) => (
                          <div key={row.label} className="flex items-center gap-2 sm:gap-3">
                            <span className="w-28 shrink-0 text-xs leading-snug text-[#0A1931]/70 sm:w-40">
                              {row.label}
                            </span>
                            <div className="h-3 min-w-0 flex-1 overflow-hidden rounded-full bg-[#0A1931]/10">
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${row.barWidth}%`, backgroundColor: GREEN }}
                              />
                            </div>
                            <span className="shrink-0 text-xs font-medium" style={{ color: GREEN }}>
                              {row.value}
                            </span>
                          </div>
                        ))}
                      </div>
                      <p className="mt-4 text-sm leading-relaxed text-[#0A1931]/80">
                        In controlled Russian clinical trials, healthy volunteers and stroke recovery patients were
                        given Semax intranasally over 5 to 14 days. Researchers measured memory recall, attention
                        span, cognitive processing speed, and brain growth factor levels. Every group showed
                        significant improvement over placebo. Results were so consistent that Russia approved Semax as
                        a prescription drug for cognitive impairment and stroke recovery — one of the only peptides
                        in the world to achieve that status.
                      </p>
                      <div className="mt-4 rounded-lg bg-[#0A1931]/5 p-3 text-xs text-[#0A1931]/60">
                        💡 Note: Outcomes summarized from published clinical research; approval status refers to
                        Russia.
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-[#0A1931]/10">
                    <CardContent className="p-6">
                      <p className="text-xs font-medium uppercase tracking-wider text-[#0A1931]/60">
                        📝 Key trial results
                      </p>
                      <h3 className="mt-2 font-bold text-[#0A1931]">Key Trial Results</h3>
                      <div className="mt-6 space-y-6">
                        {KEY_TRIAL_FINDINGS.map((t) => (
                          <div key={t.label}>
                            <div className="flex justify-between text-sm">
                              <span className="font-bold text-[#0A1931]">{t.stat}</span>
                              <span className="max-w-[55%] text-right text-[#0A1931]/70">{t.label}</span>
                            </div>
                            <p className="text-sm text-[#0A1931]/80">{t.sub}</p>
                            <Progress
                              value={t.progress}
                              className="progress-green mt-2 h-2 bg-[#0A1931]/10"
                            />
                          </div>
                        ))}
                      </div>
                      <div className="mt-6 rounded-lg bg-[#0A1931]/5 p-3 text-xs text-[#0A1931]/60">
                        💡 Note: Measurement methods vary by study. Outcomes from published clinical and preclinical
                        research.
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Beyond Focus — same pattern as BPC/Retatrutide “Beyond …” + detailed column cards */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#0A1931]/60">
                  ✨ Beyond focus
                </p>
                <p className="mt-0.5 text-sm text-[#0A1931]/60">
                  Other areas Semax has shown results in research
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {BEYOND_FOCUS_HIGHLIGHTS.map((b) => (
                    <Card
                      key={b.title}
                      className={`border-[#0A1931]/10 ${b.highlight ? 'bg-[#16a34a]/5' : ''}`}
                    >
                      <CardContent className="p-6">
                        <p className="text-xs font-medium uppercase tracking-wider text-[#0A1931]/60">
                          {b.label}
                        </p>
                        <h4 className="mt-2 font-bold text-[#0A1931]">{b.title}</h4>
                        <p className="mt-2 text-sm text-[#0A1931]/70">{b.desc}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#0A1931]/60">
                  📋 Detailed findings
                </p>
                <p className="mt-0.5 text-sm text-[#0A1931]/60">Study-specific outcomes.</p>
                <div className="mt-4 grid gap-6 lg:grid-cols-3">
                  {BEYOND_DETAILED_CARDS.map((d) => (
                    <Card key={d.title} className="border-[#0A1931]/10">
                      <CardContent className="p-6">
                        <h4 className="font-bold text-[#0A1931]">{d.title}</h4>
                        <p className="mt-3 text-sm leading-relaxed text-[#0A1931]/80">{d.body}</p>
                        <ul className="mt-4 space-y-2 text-sm text-[#0A1931]/80">
                          {d.metrics.map((m) => (
                            <li key={m}>• {m}</li>
                          ))}
                        </ul>
                        <div
                          className={`mt-4 rounded-lg border-l-4 ${d.calloutBorder} bg-[#0A1931]/5 p-3 text-xs text-[#0A1931]/80`}
                        >
                          {d.callout}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Safety Profile — table + dark callout (DSIP/BPC pattern) */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#0A1931]/60">
                  🛡️ Safety Profile
                </p>
                <p className="mt-0.5 text-sm text-[#0A1931]/60">
                  What the research actually shows about risk
                </p>
                <div className="mt-4 grid gap-6 lg:grid-cols-2">
                  <Card className="border-[#0A1931]/10">
                    <CardContent className="p-6">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-[#0A1931]/10">
                              <th className="pb-3 text-left font-medium text-[#0A1931]/70">Effect</th>
                              <th className="pb-3 text-left font-medium text-[#0A1931]/70">Frequency</th>
                              <th className="pb-3 text-left font-medium text-[#0A1931]/70">Severity</th>
                            </tr>
                          </thead>
                          <tbody>
                            {SAFETY_TABLE_ROWS.map((r) => (
                              <tr key={r.effect} className="border-b border-[#0A1931]/5">
                                <td className="py-3 text-[#0A1931]/80">{r.effect}</td>
                                <td className="py-3 text-[#0A1931]/80">{r.freq}</td>
                                <td className="py-3 text-[#0A1931]/80">{r.severity}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-0 bg-[#0A1931]">
                    <CardContent className="p-6 text-white">
                      <p className="text-xs font-medium uppercase tracking-wider text-white/70">
                        Safety advantage
                      </p>
                      <h4 className="mt-2 font-bold">No Serious Side Effects Reported</h4>
                      <p className="mt-3 text-sm text-white/80">
                        Across decades of Russian clinical use and multiple controlled trials, Semax has never
                        produced a serious adverse event at research doses. No organ toxicity, no hormonal
                        disruption, no dependency, no withdrawal.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Safety advantages — 3 cards */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#0A1931]/60">
                  ✅ Safety advantages
                </p>
                <p className="mt-0.5 text-sm text-[#0A1931]/60">
                  Mechanistic reasons Semax is well tolerated in research.
                </p>
                <div className="mt-4 grid gap-6 lg:grid-cols-3">
                  {SAFETY_ADVANTAGE_CARDS.map((c) => (
                    <Card key={c.title} className="border-[#0A1931]/10">
                      <CardContent className="p-6">
                        <h4 className="font-bold text-[#0A1931]">{c.title}</h4>
                        <p className="mt-3 text-sm leading-relaxed text-[#0A1931]/80">{c.body}</p>
                        <ul className="mt-4 space-y-2 text-sm text-[#0A1931]/80">
                          {c.bullets.map((b) => (
                            <li key={b}>• {b}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Risk vs alternatives — comparison bars */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#0A1931]/60">
                  📊 Side effect risk
                </p>
                <p className="mt-0.5 text-sm font-semibold text-[#0A1931]">
                  How Semax Compares to Common Alternatives
                </p>
                <Card className="mt-4 border-[#0A1931]/10">
                  <CardContent className="p-6">
                    <div className="rounded-xl border border-green-600/25 bg-green-600/[0.06] p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#0A1931]">
                        Semax
                      </p>
                      <p className="mt-0.5 text-xs text-[#0A1931]/60">This product — reported risk in research</p>
                      <div className="mt-4">
                        <RiskComparisonBarRow
                          label={RISK_SEMAX_ROW.label}
                          value={RISK_SEMAX_ROW.value}
                          barWidth={RISK_SEMAX_ROW.barWidth}
                          barColor={RISK_SEMAX_ROW.barColor}
                        />
                      </div>
                    </div>

                    <div className="mt-8 border-t border-[#0A1931]/10 pt-8">
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#0A1931]/70">
                        Common alternatives
                      </p>
                      <p className="mt-0.5 text-xs text-[#0A1931]/60">
                        Typical cognitive enhancers — for context only, not equivalent products
                      </p>
                      <div className="mt-4 space-y-3">
                        {RISK_ALTERNATIVE_ROWS.map((row) => (
                          <RiskComparisonBarRow
                            key={row.label}
                            label={row.label}
                            value={row.value}
                            barWidth={row.barWidth}
                            barColor={row.barColor}
                          />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {product.coa_url && (
              <TabsContent value="coa" className="mt-0">
                <p className="text-xs font-medium uppercase tracking-wider text-[#0A1931]/60">
                  🧪 Certificate of Analysis
                </p>
                <p className="mt-0.5 text-sm text-[#0A1931]/60">Third party tested.</p>
                <Card className="mt-6 max-w-md border-[#0A1931]/10">
                  <CardContent className="p-6">
                    <Button asChild className="w-full gap-2 bg-[#0A1931] text-white hover:bg-[#0A1931]/90">
                      <a href={product.coa_url} target="_blank" rel="noopener noreferrer">
                        <FileText className="h-4 w-4" />
                        View COA
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            <TabsContent value="reviews" className="mt-0">
              <p className="text-xs font-medium uppercase tracking-wider text-[#0A1931]/60">⭐ Reviews</p>
              <p className="mt-0.5 text-sm text-[#0A1931]/60">Customer feedback.</p>
              <div className="mt-4 space-y-4">
                {productVouches.length > 0 ? (
                  productVouches.map((v) => (
                    <Card key={v.id} className="border-[#0A1931]/10">
                      <CardContent className="p-6">
                        <div className="mb-2 flex items-center gap-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i <= v.rating ? 'fill-amber-400 text-amber-400' : 'text-[#0A1931]/20'}`}
                              />
                            ))}
                          </div>
                          <span className="font-medium text-[#0A1931]">{v.author_name}</span>
                          {v.verified && (
                            <span className="text-xs text-[#0A1931]/60">Verified</span>
                          )}
                        </div>
                        <p className="text-sm text-[#0A1931]/80">{v.content}</p>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="border-[#0A1931]/10">
                    <CardContent className="p-6">
                      <p className="text-sm text-[#0A1931]/80">No reviews yet for this product.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <p className="mt-12 text-center text-xs text-[#0A1931]/50">
          For research purposes only. Not for human consumption.
        </p>

        {relatedProducts.length > 0 ? (
          <div className="mt-16 border-t border-[#0A1931]/10 pt-12">
            <RelatedProducts products={relatedProducts} />
          </div>
        ) : null}
      </div>
    </div>
  )
}
