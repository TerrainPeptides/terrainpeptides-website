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
import { CoaDocumentPanel } from '@/components/product/coa-document-panel'
import { ProductNamePanel } from '@/components/product/product-name-panel'
import type { Product, Vouch } from '@/lib/types'

interface SelankProductProps {
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
    value: '63%',
    label: 'ANXIETY REDUCTION',
    subtext:
      'Participants reported significantly less anxiety after just 7 days compared to placebo',
  },
  {
    value: '2x',
    label: 'FASTER STRESS RECOVERY',
    subtext: 'Brain returned to calm baseline twice as fast after stressful events',
  },
  {
    value: '28%',
    label: 'BETTER SLEEP QUALITY',
    subtext: 'Deeper sleep and easier time falling asleep reported in clinical trials',
  },
  {
    value: '0',
    label: 'DEPENDENCY OR WITHDRAWAL',
    subtext:
      'Unlike benzodiazepines and SSRIs — no addiction, no withdrawal, no rebound anxiety',
  },
  {
    value: '100%',
    label: 'NATURAL FEELING CALM',
    subtext:
      "Doesn't sedate you or kill your personality — just removes the noise so you can actually think and perform",
  },
]

const MECHANISM_NODES = [
  {
    id: 'gaba',
    label: 'GABA Primary',
    title: 'Calm Without Sedation',
    sub: 'Natural GABA optimization',
    bullets: [
      "Enhances GABA activity — your brain's natural off switch for anxiety",
      "Unlike benzos it doesn't overactivate GABA — just optimizes it",
      'No sedation, no brain fog, no personality suppression',
      'You feel calm and in control not drowsy and checked out',
    ],
    color: 'bg-gray-200',
  },
  {
    id: 'bdnf',
    label: 'BDNF Strongest',
    title: 'Brain Growth & Resilience',
    sub: 'Neurotrophic stress resilience',
    bullets: [
      'Increases BDNF just like Semax — making it a perfect stack partner',
      'Builds long term stress resilience not just short term relief',
      'Protects neurons from stress related damage',
      'Effects compound over time with consistent use',
    ],
    color: 'bg-[#16a34a]',
  },
  {
    id: 'enk',
    label: 'ENK Supportive',
    title: 'Mood & Motivation',
    sub: 'Enkephalin pathway',
    bullets: [
      "Increases enkephalin — your brain's natural mood regulator",
      'Improves baseline mood without artificial highs',
      'Reduces the mental resistance that stops you starting tasks',
      'Works alongside GABA pathway for full anxiety relief',
    ],
    color: 'bg-[#16a34a]/70',
  },
]

const SELANK_KEY_DISCOVERY = {
  title: 'Why Selank Is Different From Everything Else',
  body: "Every anxiety medication on the market works by sedating you or altering your personality. Selank is the only compound that removes anxiety while leaving everything else completely intact. Your focus, your drive, your personality — all untouched. Just the noise removed.",
  quote:
    'Participants reported feeling calm and mentally sharp simultaneously — an effect not observed with any conventional anxiolytic',
}

const SELANK_STUDY_CONTEXT = 'Russian Clinical Trial — Generalized Anxiety Disorder Patients'

const SELANK_COMPARISON_ROWS = [
  { label: 'Anxiety Reduction vs Placebo', value: '+63%', barWidth: 63 },
  { label: 'Sleep Quality vs Placebo', value: '+28%', barWidth: 28 },
  { label: 'Stress Recovery Speed vs Placebo', value: '+100%', barWidth: 100 },
  { label: 'Mood and Motivation vs Baseline', value: '+40%', barWidth: 40 },
]

const SELANK_STUDY_DETAILS =
  'In controlled Russian clinical trials, patients diagnosed with generalized anxiety disorder were given Selank intranasally over 7 to 14 days. Researchers measured anxiety levels, sleep quality, mood, and cognitive performance. Every group showed dramatic improvement over placebo. Most remarkably, patients reported feeling calm and mentally sharp at the same time — something never observed with traditional anxiety medications. Selank was subsequently approved as a prescription anxiolytic in Russia, making it one of the only peptides with full government medical approval for mental health treatment.'

const SELANK_KEY_TRIAL_FINDINGS = [
  {
    stat: '63%',
    label: 'Anxiety Reduction In 7 Days',
    sub: 'Measured against placebo in controlled clinical trial',
    progress: 63,
  },
  {
    stat: 'Zero',
    label: 'Dependency or Withdrawal Cases',
    sub: 'Across all clinical trials and decades of prescription use',
    progress: 100,
  },
  {
    stat: 'Approved',
    label: 'Prescription Anxiolytic in Russia',
    sub: 'Government approved for anxiety and stress treatment',
    progress: 100,
  },
]

const BEYOND_ANXIETY_HIGHLIGHTS = [
  {
    title: 'Focus',
    label: 'COGNITIVE ENHANCEMENT',
    desc: 'Removes the mental noise that kills focus without sedating you or slowing you down',
    highlight: true,
  },
  {
    title: 'Sleep',
    label: 'SLEEP QUALITY',
    desc: 'Deeper sleep and easier time falling asleep without dependency or morning grogginess',
    highlight: false,
  },
  {
    title: 'Immune',
    label: 'IMMUNE MODULATION',
    desc: 'Shown to regulate immune response and reduce inflammation driven by chronic stress',
    highlight: false,
  },
  {
    title: 'Stack',
    label: 'SEMAX SYNERGY',
    desc: 'Pairs perfectly with Semax — Semax gives you the tools to perform, Selank removes everything stopping you',
    highlight: false,
  },
]

const BEYOND_ANXIETY_DETAILED = [
  {
    title: 'Anxiety Free Focus',
    body: "Most people think anxiety and focus are separate problems. They're not. Anxiety is the number one killer of deep focus and productive work. Selank eliminates the anxiety so the focus comes naturally — no stimulants needed.",
    metrics: [
      'Mental Noise → ↓ Eliminated',
      'Task Initiation → ↑ Easier',
      'Deep Focus → ↑ Enhanced',
      'Stimulant Need → ↓ Reduced',
    ],
    callout: 'Patients reported dramatically easier time starting and sustaining cognitively demanding tasks',
    calloutBorder: 'border-blue-400',
  },
  {
    title: 'Sleep Without Grogginess',
    body: 'Selank improves sleep quality through GABA optimization rather than sedation. You fall asleep faster, sleep deeper, and wake up feeling sharp — not groggy like you would with sleep aids or benzos.',
    metrics: [
      'Sleep Onset → ↑ Faster',
      'Sleep Depth → ↑ Improved',
      'Morning Grogginess → None',
      'Dependency Risk → None',
    ],
    callout: '28% improvement in sleep quality scores vs placebo in clinical trials',
    calloutBorder: 'border-[#16a34a]',
  },
  {
    title: 'The Perfect Semax Stack',
    body: "Semax builds the horsepower. Selank clears the road. Semax increases your brain's capacity for memory, focus, and processing. Selank removes the anxiety, stress, and mental resistance that stops you from using it. Together they cover every angle of cognitive performance.",
    metrics: [
      'Cognitive Capacity → ↑ Semax',
      'Anxiety & Resistance → ↓ Selank',
      'Overall Performance → ↑ Maximum',
      'Side Effect Risk → ↓ Minimal',
    ],
    callout: 'Both compounds upregulate BDNF making the combination synergistic not just additive',
    calloutBorder: 'border-blue-400',
  },
]

const SELANK_SAFETY_TABLE_ROWS = [
  { effect: 'Nasal Irritation', freq: '6%', severity: 'MILD' },
  { effect: 'Temporary Sedation', freq: '4%', severity: 'MILD' },
  { effect: 'Mild Headache', freq: '3%', severity: 'MILD' },
  { effect: 'Vivid Dreams', freq: '5%', severity: 'MILD' },
]

const SELANK_SAFETY_ADVANTAGE_CARDS = [
  {
    title: 'Not a Benzodiazepine',
    body: 'Benzos like Xanax and Valium work by aggressively sedating your nervous system. They work fast but destroy your cognition, create physical dependency in weeks, and produce brutal withdrawal when you stop. Selank calms anxiety through optimization not suppression. No dependency, no withdrawal, no cognitive destruction.',
    bullets: [
      'Zero physical dependency',
      'No withdrawal syndrome',
      'No cognitive impairment',
      'No rebound anxiety after stopping',
    ],
  },
  {
    title: 'Not an SSRI',
    body: 'SSRIs take 6 weeks to work, kill your personality, destroy libido, and are extremely difficult to stop taking. Selank works within hours, leaves your personality completely intact, has zero hormonal effects, and can be stopped anytime with no consequences.',
    bullets: [
      'Works within hours not weeks',
      'No personality blunting',
      'No libido effects',
      'Stop anytime with no consequences',
    ],
  },
  {
    title: 'Decades of Human Data',
    body: "Selank has been prescribed by Russian doctors since the 1980s as a legitimate anxiety medication. That's 40 years of real world human use data showing consistent safety across thousands of patients — more than most research compounds can claim.",
    bullets: [
      'Approved prescription drug since 1980s',
      'Thousands of clinical patients treated',
      'No long term adverse effects documented',
      'One of the safest anxiolytics ever studied',
    ],
  },
]

const SELANK_RISK_ROW = {
  label: 'Side effect risk',
  value: '6% LOW',
  barWidth: 6,
  barColor: GREEN,
}

const SELANK_RISK_ALTERNATIVE_ROWS = [
  { label: 'Xanax Side Effect Risk', value: '70% HIGH', barWidth: 70, barColor: '#dc2626' },
  { label: 'SSRIs Side Effect Risk', value: '55% HIGH', barWidth: 55, barColor: '#dc2626' },
  { label: 'Alcohol Side Effect Risk', value: '80% VERY HIGH', barWidth: 80, barColor: '#991b1b' },
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
      <span className="w-36 shrink-0 text-xs leading-snug text-foreground/70 sm:w-48">{label}</span>
      <div className="h-3 min-w-0 flex-1 overflow-hidden rounded-full bg-[#1C3D2A]/10">
        <div className="h-full rounded-full" style={{ width: `${barWidth}%`, backgroundColor: barColor }} />
      </div>
      <span className="shrink-0 text-xs font-medium" style={{ color: barColor }}>
        {value}
      </span>
    </div>
  )
}

export function SelankProduct({ product, relatedProducts = [], vouches = [] }: SelankProductProps) {
  const [activeTab, setActiveTab] = useState('research')
  const section1 = useScrollReveal()
  const section2 = useScrollReveal()

  const productVouches = vouches.filter((v) => v.product_id === product.id || v.product_id === null)
  const imageSrc = product.image_url || '/images/selank-vial.png'

  return (
    <div className="min-h-screen bg-white text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/shop"
          className="mb-6 inline-flex items-center gap-1 text-sm text-foreground/70 transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Shop
        </Link>

        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-12">
          <div
            ref={section1.ref}
            className={`transition-all duration-500 ease-out ${section1.visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
          >
            <Card className="overflow-hidden border-border/10 bg-[#f8f9fa]">
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
                  <FlaskConical className="h-32 w-32 text-foreground/20" />
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
            <TabsList className="mb-6 h-14 flex-wrap gap-2 bg-[#1C3D2A]/5 p-2">
              <TabsTrigger
                value="research"
                className="gap-2 px-6 py-3 text-base data-[state=active]:bg-white data-[state=active]:text-foreground"
              >
                <FileText className="h-4 w-4" />
                Research
              </TabsTrigger>
              {product.coa_url && (
                <TabsTrigger
                  value="coa"
                  className="gap-2 px-6 py-3 text-base data-[state=active]:bg-white data-[state=active]:text-foreground"
                >
                  <FileText className="h-4 w-4" />
                  COA
                </TabsTrigger>
              )}
              <TabsTrigger
                value="reviews"
                className="gap-2 px-6 py-3 text-base data-[state=active]:bg-white data-[state=active]:text-foreground"
              >
                <Star className="h-4 w-4" />
                Reviews
              </TabsTrigger>
            </TabsList>

            <TabsContent value="research" className="mt-0 space-y-12 text-[1.1em]">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-foreground/60">
                  ✨ Clinical outcomes
                </p>
                <p className="mt-0.5 text-sm text-foreground/60">Key research metrics.</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                  {STAT_CARDS.map((s) => (
                    <Card key={s.label} className="border-border/10">
                      <CardContent className="p-6 text-center">
                        <p className="text-2xl font-bold" style={{ color: GREEN }}>
                          {s.value}
                        </p>
                        <p className="mt-1 text-xs font-medium uppercase tracking-wider text-foreground/80">
                          {s.label}
                        </p>
                        <p className="mt-1 text-xs text-foreground/60">{s.subtext}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* How it Works — 3-circle pathways + Key Discovery (matches Semax / GHK-Cu) */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-foreground/60">
                  🧬 How Selank Works
                </p>
                <p className="mt-0.5 text-sm text-foreground/60">
                  What&apos;s actually happening in your brain
                </p>
                <div className="mt-4 grid gap-6 lg:grid-cols-5">
                  <Card className="border-border/10 lg:col-span-3">
                    <CardContent className="p-6">
                      <p className="text-xs font-medium uppercase tracking-wider text-foreground/60">
                        The science, simplified
                      </p>
                      <h3 className="mt-2 font-bold text-foreground">Multi-Pathway Calm Support</h3>
                      <div className="mt-6 flex flex-wrap items-start justify-between gap-6">
                        {MECHANISM_NODES.map((n) => (
                          <div
                            key={n.id}
                            className="flex min-w-[140px] flex-1 flex-col items-center text-center"
                          >
                            <div
                              className={`flex h-14 w-14 items-center justify-center rounded-full text-xs font-semibold text-foreground ${n.color}`}
                            >
                              {n.label}
                            </div>
                            <p className="mt-2 font-semibold text-foreground">{n.title}</p>
                            <p className="text-xs text-foreground/70">{n.sub}</p>
                            <ul className="mt-2 space-y-0.5 text-left text-xs text-foreground/70">
                              {n.bullets.map((b) => (
                                <li key={b}>• {b}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                      <p className="mt-6 text-xs text-foreground/50">Source: Peer-reviewed literature.</p>
                    </CardContent>
                  </Card>
                  <Card className="border-0 bg-[#1C3D2A] lg:col-span-2">
                    <CardContent className="p-6 text-white">
                      <p className="text-xs font-medium uppercase tracking-wider text-white/70">
                        Key discovery
                      </p>
                      <h3 className="mt-2 font-bold">{SELANK_KEY_DISCOVERY.title}</h3>
                      <p className="mt-3 text-sm text-white/80">{SELANK_KEY_DISCOVERY.body}</p>
                      <div className="mt-6 rounded-lg bg-white/10 p-4">
                        <p className="text-sm font-medium leading-relaxed text-white" style={{ color: GREEN }}>
                          {SELANK_KEY_DISCOVERY.quote}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* What research has shown — matches Semax / GHK-Cu two-column layout */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-foreground/60">
                  📊 What Research Has Shown
                </p>
                <p className="mt-0.5 text-sm text-foreground/60">Real results from real studies</p>
                <div className="mt-4 grid gap-6 lg:grid-cols-2">
                  <Card className="border-border/10">
                    <CardContent className="p-6">
                      <span className="rounded-full bg-[#1C3D2A]/5 px-3 py-1 text-xs text-foreground/70">
                        🗓️ {SELANK_STUDY_CONTEXT}
                      </span>
                      <p className="mt-4 text-4xl font-bold" style={{ color: GREEN }}>
                        63%
                      </p>
                      <p className="text-xs font-medium uppercase tracking-wider text-foreground/70">
                        OF PATIENTS REPORTED SIGNIFICANTLY LOWER ANXIETY AFTER 7 DAYS
                      </p>
                      <p className="mt-4 text-sm font-semibold text-foreground">Clinical comparison</p>
                      <div className="mt-3 space-y-3">
                        {SELANK_COMPARISON_ROWS.map((row) => (
                          <div key={row.label} className="flex items-center gap-2 sm:gap-3">
                            <span className="w-28 shrink-0 text-xs leading-snug text-foreground/70 sm:w-44">
                              {row.label}
                            </span>
                            <div className="h-3 min-w-0 flex-1 overflow-hidden rounded-full bg-[#1C3D2A]/10">
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
                      <p className="mt-4 text-sm leading-relaxed text-foreground/80">{SELANK_STUDY_DETAILS}</p>
                      <div className="mt-4 rounded-lg bg-[#1C3D2A]/5 p-3 text-xs text-foreground/60">
                        💡 Note: Outcomes summarized from published clinical research; approval status refers to
                        Russia.
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-border/10">
                    <CardContent className="p-6">
                      <p className="text-xs font-medium uppercase tracking-wider text-foreground/60">
                        📝 Key trial results
                      </p>
                      <h3 className="mt-2 font-bold text-foreground">Key Trial Results</h3>
                      <div className="mt-6 space-y-6">
                        {SELANK_KEY_TRIAL_FINDINGS.map((t) => (
                          <div key={t.label}>
                            <div className="flex justify-between text-sm">
                              <span className="font-bold text-foreground">{t.stat}</span>
                              <span className="max-w-[55%] text-right text-foreground/70">{t.label}</span>
                            </div>
                            <p className="text-sm text-foreground/80">{t.sub}</p>
                            <Progress
                              value={t.progress}
                              className="progress-green mt-2 h-2 bg-[#1C3D2A]/10"
                            />
                          </div>
                        ))}
                      </div>
                      <div className="mt-6 rounded-lg bg-[#1C3D2A]/5 p-3 text-xs text-foreground/60">
                        💡 Note: Measurement methods vary by study. Outcomes from published clinical and preclinical
                        research.
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Beyond Anxiety Relief — same pattern as Semax Beyond focus */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-foreground/60">
                  ✨ Beyond anxiety relief
                </p>
                <p className="mt-0.5 text-sm text-foreground/60">
                  Other areas Selank has shown results in research
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {BEYOND_ANXIETY_HIGHLIGHTS.map((b) => (
                    <Card
                      key={b.title}
                      className={`border-border/10 ${b.highlight ? 'bg-[#16a34a]/5' : ''}`}
                    >
                      <CardContent className="p-6">
                        <p className="text-xs font-medium uppercase tracking-wider text-foreground/60">
                          {b.label}
                        </p>
                        <h4 className="mt-2 font-bold text-foreground">{b.title}</h4>
                        <p className="mt-2 text-sm text-foreground/70">{b.desc}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-foreground/60">
                  📋 Detailed findings
                </p>
                <p className="mt-0.5 text-sm text-foreground/60">Study-specific outcomes.</p>
                <div className="mt-4 grid gap-6 lg:grid-cols-3">
                  {BEYOND_ANXIETY_DETAILED.map((d) => (
                    <Card key={d.title} className="border-border/10">
                      <CardContent className="p-6">
                        <h4 className="font-bold text-foreground">{d.title}</h4>
                        <p className="mt-3 text-sm leading-relaxed text-foreground/80">{d.body}</p>
                        <ul className="mt-4 space-y-2 text-sm text-foreground/80">
                          {d.metrics.map((m) => (
                            <li key={m}>• {m}</li>
                          ))}
                        </ul>
                        <div
                          className={`mt-4 rounded-lg border-l-4 ${d.calloutBorder} bg-[#1C3D2A]/5 p-3 text-xs text-foreground/80`}
                        >
                          {d.callout}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Safety Profile — table + dark callout (Semax pattern) */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-foreground/60">
                  🛡️ Safety Profile
                </p>
                <p className="mt-0.5 text-sm text-foreground/60">
                  What the research actually shows about risk
                </p>
                <div className="mt-4 grid gap-6 lg:grid-cols-2">
                  <Card className="border-border/10">
                    <CardContent className="p-6">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border/10">
                              <th className="pb-3 text-left font-medium text-foreground/70">Effect</th>
                              <th className="pb-3 text-left font-medium text-foreground/70">Frequency</th>
                              <th className="pb-3 text-left font-medium text-foreground/70">Severity</th>
                            </tr>
                          </thead>
                          <tbody>
                            {SELANK_SAFETY_TABLE_ROWS.map((r) => (
                              <tr key={r.effect} className="border-b border-border/5">
                                <td className="py-3 text-foreground/80">{r.effect}</td>
                                <td className="py-3 text-foreground/80">{r.freq}</td>
                                <td className="py-3 text-foreground/80">{r.severity}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-0 bg-[#1C3D2A]">
                    <CardContent className="p-6 text-white">
                      <p className="text-xs font-medium uppercase tracking-wider text-white/70">
                        Safety advantage
                      </p>
                      <h4 className="mt-2 font-bold">No Serious Side Effects Ever Reported</h4>
                      <p className="mt-3 text-sm text-white/80">
                        Across decades of Russian clinical use and multiple controlled trials, Selank has never
                        produced a serious adverse event at research doses. No organ toxicity, no hormonal
                        disruption, no dependency, no withdrawal, no rebound anxiety when stopping.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-foreground/60">
                  ✅ Safety advantages
                </p>
                <p className="mt-0.5 text-sm text-foreground/60">
                  Mechanistic reasons Selank is well tolerated in research.
                </p>
                <div className="mt-4 grid gap-6 lg:grid-cols-3">
                  {SELANK_SAFETY_ADVANTAGE_CARDS.map((c) => (
                    <Card key={c.title} className="border-border/10">
                      <CardContent className="p-6">
                        <h4 className="font-bold text-foreground">{c.title}</h4>
                        <p className="mt-3 text-sm leading-relaxed text-foreground/80">{c.body}</p>
                        <ul className="mt-4 space-y-2 text-sm text-foreground/80">
                          {c.bullets.map((b) => (
                            <li key={b}>• {b}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-foreground/60">
                  📊 Side effect risk
                </p>
                <p className="mt-0.5 text-sm font-semibold text-foreground">
                  How Selank Compares to Common Alternatives
                </p>
                <Card className="mt-4 border-border/10">
                  <CardContent className="p-6">
                    <div className="rounded-xl border border-green-600/25 bg-green-600/[0.06] p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-foreground">Selank</p>
                      <p className="mt-0.5 text-xs text-foreground/60">This product — reported risk in research</p>
                      <div className="mt-4">
                        <RiskComparisonBarRow
                          label={SELANK_RISK_ROW.label}
                          value={SELANK_RISK_ROW.value}
                          barWidth={SELANK_RISK_ROW.barWidth}
                          barColor={SELANK_RISK_ROW.barColor}
                        />
                      </div>
                    </div>

                    <div className="mt-8 border-t border-border/10 pt-8">
                      <p className="text-xs font-semibold uppercase tracking-wider text-foreground/70">
                        Common alternatives
                      </p>
                      <p className="mt-0.5 text-xs text-foreground/60">
                        Typical anxiety treatments — for context only, not equivalent products
                      </p>
                      <div className="mt-4 space-y-3">
                        {SELANK_RISK_ALTERNATIVE_ROWS.map((row) => (
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
                <p className="text-xs font-medium uppercase tracking-wider text-foreground/60">
                  🧪 Certificate of Analysis
                </p>
                <p className="mt-0.5 text-sm text-foreground/60">Third party tested.</p>
                <CoaDocumentPanel coaUrl={product.coa_url} frameClassName="border-border/10" />
              </TabsContent>
            )}

            <TabsContent value="reviews" className="mt-0">
              <p className="text-xs font-medium uppercase tracking-wider text-foreground/60">⭐ Reviews</p>
              <p className="mt-0.5 text-sm text-foreground/60">Customer feedback.</p>
              <div className="mt-4 space-y-4">
                {productVouches.length > 0 ? (
                  productVouches.map((v) => (
                    <Card key={v.id} className="border-border/10">
                      <CardContent className="p-6">
                        <div className="mb-2 flex items-center gap-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i <= v.rating ? 'fill-amber-400 text-amber-400' : 'text-foreground/20'}`}
                              />
                            ))}
                          </div>
                          <span className="font-medium text-foreground">{v.author_name}</span>
                          {v.verified && (
                            <span className="text-xs text-foreground/60">Verified</span>
                          )}
                        </div>
                        <p className="text-sm text-foreground/80">{v.content}</p>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="border-border/10">
                    <CardContent className="p-6">
                      <p className="text-sm text-foreground/80">No reviews yet for this product.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <p className="mt-12 text-center text-xs text-foreground/50">
          For research purposes only. Not for human consumption.
        </p>

        {relatedProducts.length > 0 ? (
          <div className="mt-16 border-t border-border/10 pt-12">
            <RelatedProducts products={relatedProducts} />
          </div>
        ) : null}
      </div>
    </div>
  )
}
