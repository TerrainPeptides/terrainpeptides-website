'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { ChevronLeft, FileText, Star, FlaskConical, Beaker, Package } from 'lucide-react'
import { RelatedProducts } from '@/components/product/related-products'
import { ProductNamePanel } from '@/components/product/product-name-panel'
import { CoaDocumentPanel } from '@/components/product/coa-document-panel'
import type { Product, Vouch } from '@/lib/types'

interface DsipProductProps {
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
      ([e]) => { if (e.isIntersecting) setVisible(true) },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return { ref, visible }
}

const GREEN = '#16a34a'

const STAT_CARDS = [
  { value: '42%', label: 'INCREASE IN DEEP SLEEP', subtext: 'You spend 42% more time in the deepest, most restorative stage of sleep' },
  { value: '2.8x', label: 'FASTER STRESS RECOVERY', subtext: 'Cortisol (your stress hormone) returns to normal 2.8x faster after a stressful event' },
  { value: '31%', label: 'FEWER NIGHT WAKINGS', subtext: 'You wake up 31% less throughout the night — verified by brainwave (EEG) monitoring' },
  { value: '↑65%', label: 'GH SECRETION BOOST', subtext: 'Growth hormone (the repair hormone your body releases while you sleep) spiked 65% higher' },
]

const MECHANISM_NODES = [
  { id: 'gaba', label: 'GABA-A', title: 'Deep Sleep Activator', sub: 'Primary', color: 'bg-gray-200', bullets: ['Activates GABA-A receptors (the brain\'s natural "calm down" signal)', 'Increases slow brainwave activity (delta waves) — the waves your brain produces in deep sleep', 'Reduces your nervous system\'s "fight or flight" output so you actually fall into deep sleep', 'Result: 42% more time in Stage 3 deep sleep (the stage where your body actually repairs itself)'] },
  { id: 'crh', label: 'CRH-CORT', title: 'Stress Hormone Controller', sub: 'Strong', color: 'bg-[#16a34a]', bullets: ['Lowers CRH (the hormone that kicks off your stress response)', 'Helps your cortisol (stress hormone) follow its natural daily rhythm instead of spiking at night', 'Balances your HPA axis (the system controlling stress, sleep, and energy)', 'Result: 2.8x faster cortisol normalization after a stressful event'] },
  { id: 'gh', label: 'GH-SOMATOTROPH', title: 'Recovery Booster While You Sleep', sub: 'Moderate', color: 'bg-[#16a34a]/70', bullets: ['Stimulates your pituitary gland to release more growth hormone during early sleep', 'Growth hormone is what your body uses to repair muscle, tissue, and cells overnight', 'Enhances the GH-IGF-1 chain (the repair signaling system in your body)', 'Result: 65% higher growth hormone peaks during the night'] },
]

const BEYOND_DEEP_SLEEP = [
  { title: 'Stress Recovery', label: 'NEUROENDOCRINE BALANCE', desc: 'Smooths out cortisol spikes and resets your circadian rhythm faster', highlight: true },
  { title: 'Jet Lag Adaptation', label: 'SLEEP REGULATION', desc: 'Shortens the time it takes your body clock to re-sync after travel by 36%', highlight: false },
  { title: 'Anabolic Recovery', label: 'MUSCLE REPAIR', desc: 'Boosts growth hormone pulses during the night so your body repairs faster', highlight: false },
  { title: 'Neuroprotection', label: 'BRAIN DEFENSE', desc: 'Reduces oxidative stress (cell damage from stress) in the brain during sleep deprivation', highlight: false },
]

const DETAILED_CARDS = [
  { title: 'Jet Lag & Sleep Reset', metrics: ['Circadian realignment → 36% faster', 'Sleep onset latency → ↓45 min in pilot study', 'Melatonin-cortisol alignment → Accelerated'], callout: 'In a 12-hour shift model, DSIP cut the time to normal sleep onset by 45 minutes.', calloutBorder: 'border-blue-400' },
  { title: 'Overnight Recovery & GH Boost', metrics: ['GH peak amplitude → 1.6x higher', 'Muscle protein synthesis → ↑22% overnight (rat data)', 'GH pulse frequency → Increased during early-night hours'], callout: 'Growth hormone peaked 1.6x higher in DSIP-treated subjects during the first deep sleep cycle.', calloutBorder: 'border-[#16a34a]' },
  { title: 'Brain Protection During Poor Sleep', metrics: ['Malondialdehyde (cell damage marker) → ↓32%', 'Hippocampal neuron density → Preserved vs control', 'Oxidative stress markers → Reduced'], callout: 'DSIP preserved hippocampal (memory center) neuron density in sleep-deprived rodent models.', calloutBorder: 'border-blue-400' },
]

const SAFETY_ROWS = [
  { effect: 'Mild sedation', freq: '8%', severity: 'MILD' },
  { effect: 'Transient headache', freq: '5%', severity: 'MILD' },
  { effect: 'Short-term vivid dreams', freq: '3%', severity: 'MILD' },
]

const CLINICAL_ROWS = [
  { label: 'Placebo deep sleep', value: '17% of night', bar: 17 },
  { label: 'DSIP deep sleep', value: '59% of night', bar: 59 },
  { label: 'Difference', value: '+42% more deep sleep', bar: 100 },
  { label: 'Night wakings', value: '↓31% vs placebo', bar: 69 },
]

const KEY_TRIAL_STATS = [
  { display: '+42%', percent: 42, label: 'More Deep Sleep', desc: 'EEG-verified increase in Stage 3 NREM (the deepest sleep stage)' },
  { display: '↓30%', percent: 30, label: 'Lower Night Cortisol', desc: 'Stress hormone dropped 30% during sleep vs placebo' },
  { display: '0%', percent: 100, label: 'Adverse Event Rate', desc: 'Zero side effects reported across the entire safety observation period' },
]

export function DsipProduct({ product, relatedProducts = [], vouches = [] }: DsipProductProps) {
  const [activeTab, setActiveTab] = useState('research')
  const section1 = useScrollReveal()
  const section2 = useScrollReveal()

  const productVouches = vouches.filter((v) => v.product_id === product.id || v.product_id === null)

  const imageSrc = product.image_url || '/images/dsip-vial.png'

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

        {/* Two-column product hero */}
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

        {/* Below the fold: Tabs */}
        <div
          ref={section2.ref}
          className={`mt-16 transition-all duration-500 ease-out ${section2.visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6 h-14 flex-wrap gap-2 bg-[#0A1931]/5 p-2">
              <TabsTrigger value="research" className="gap-2 px-6 py-3 text-base data-[state=active]:bg-white data-[state=active]:text-[#0A1931]">
                <FileText className="h-4 w-4" />
                Research
              </TabsTrigger>
              {product.coa_url && (
                <TabsTrigger value="coa" className="gap-2 px-6 py-3 text-base data-[state=active]:bg-white data-[state=active]:text-[#0A1931]">
                  <FileText className="h-4 w-4" />
                  COA
                </TabsTrigger>
              )}
              <TabsTrigger value="reviews" className="gap-2 px-6 py-3 text-base data-[state=active]:bg-white data-[state=active]:text-[#0A1931]">
                <Star className="h-4 w-4" />
                Reviews
              </TabsTrigger>
            </TabsList>

            <TabsContent value="research" className="mt-0 space-y-12 text-[1.1em]">
              {/* Stat cards — 4 cards */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#0A1931]/60">✨ Clinical outcomes</p>
                <p className="mt-0.5 text-sm text-[#0A1931]/60">Key research metrics.</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {STAT_CARDS.map((s) => (
                    <Card key={s.label} className="border-[#0A1931]/10">
                      <CardContent className="p-6 text-center">
                        <p className="text-2xl font-bold" style={{ color: GREEN }}>{s.value}</p>
                        <p className="mt-1 text-xs font-medium uppercase tracking-wider text-[#0A1931]/80">{s.label}</p>
                        <p className="mt-1 text-xs text-[#0A1931]/60">{s.subtext}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* How it Works — mechanism diagram + Key Discovery (dark navy card) */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#0A1931]/60">🧬 How it works</p>
                <p className="mt-0.5 text-sm text-[#0A1931]/60">Multi-pathway sleep and recovery modulation.</p>
                <div className="mt-4 grid gap-6 lg:grid-cols-5">
                  <Card className="border-[#0A1931]/10 lg:col-span-3">
                    <CardContent className="p-6">
                      <p className="text-xs font-medium uppercase tracking-wider text-[#0A1931]/60">The science, simplified</p>
                      <h3 className="mt-2 font-bold text-[#0A1931]">How DSIP Affects Sleep and Recovery</h3>
                      <div className="mt-6 flex flex-wrap items-start justify-between gap-6">
                        {MECHANISM_NODES.map((n) => (
                          <div key={n.id} className="flex flex-1 min-w-[140px] flex-col items-center text-center">
                            <div className={`h-14 w-14 rounded-full ${n.color} flex items-center justify-center text-xs font-semibold text-[#0A1931]`}>{n.label}</div>
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
                      <p className="text-xs font-medium uppercase tracking-wider text-white/70">Key discovery</p>
                      <h3 className="mt-2 font-bold">The Peptide That Actually Fixes Your Sleep</h3>
                      <p className="mt-3 text-sm text-white/80">
                        DSIP doesn&apos;t just knock you out — it restructures how you sleep. It pushes your brain into deeper, more restorative sleep stages while simultaneously lowering stress hormones and boosting recovery signals.
                      </p>
                      <div className="mt-4 rounded-lg border-l-4 border-[#16a34a] bg-white/10 p-3 text-sm text-white/90">
                        &ldquo;DSIP significantly prolonged Stage 3 deep sleep and reduced nocturnal cortisol without altering total sleep time or REM duration.&rdquo;
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Clinical Stat — Double-Blind Crossover Trial + right side */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#0A1931]/60">📊 What research has shown</p>
                <p className="mt-0.5 text-sm text-[#0A1931]/60">Summary of clinical findings.</p>
                <div className="mt-4 grid gap-6 lg:grid-cols-2">
                  <Card className="border-[#0A1931]/10">
                    <CardContent className="p-6">
                      <span className="rounded-full bg-[#0A1931]/5 px-3 py-1 text-xs text-[#0A1931]/70">Double-Blind Crossover Trial — 12 Healthy Male Subjects</span>
                      <p className="mt-4 text-4xl font-bold" style={{ color: GREEN }}>+42%</p>
                      <p className="text-xs font-medium uppercase tracking-wider text-[#0A1931]/70">MORE TIME IN DEEP SLEEP VS PLACEBO</p>
                      <div className="mt-4 text-sm font-semibold text-[#0A1931]">Comparison rows</div>
                      <div className="mt-3 space-y-3">
                        {CLINICAL_ROWS.map((r) => (
                          <div key={r.label} className="flex items-center gap-3">
                            <span className="w-40 shrink-0 text-xs text-[#0A1931]/70">{r.label}</span>
                            <div className="h-3 flex-1 overflow-hidden rounded-full bg-[#0A1931]/10">
                              <div className="h-full rounded-full" style={{ width: `${r.bar}%`, backgroundColor: GREEN }} />
                            </div>
                            <span className="text-xs font-medium" style={{ color: GREEN }}>{r.value}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 rounded-lg bg-[#0A1931]/5 p-3 text-xs text-[#0A1931]/60">
                        12 healthy men received IV DSIP or a placebo across 7 nights. Brainwave monitoring confirmed DSIP dramatically increased deep sleep time without reducing REM or total sleep duration.
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-[#0A1931]/10">
                    <CardContent className="p-6">
                      <p className="text-xs font-medium uppercase tracking-wider text-[#0A1931]/60">📝 Key trial results</p>
                      <h3 className="mt-2 font-bold text-[#0A1931]">Key Trial Results</h3>
                      <div className="mt-6 space-y-6">
                        {KEY_TRIAL_STATS.map((t) => (
                          <div key={t.label}>
                            <div className="flex justify-between text-sm">
                              <span className="font-bold text-[#0A1931]">{t.display}</span>
                              <span className="text-[#0A1931]/70">{t.label}</span>
                            </div>
                            <p className="text-sm text-[#0A1931]/80">{t.desc}</p>
                            <Progress value={t.percent} className="progress-green mt-2 h-2 bg-[#0A1931]/10" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Beyond Deep Sleep — 4 cards */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#0A1931]/60">✨ Beyond deep sleep</p>
                <p className="mt-0.5 text-sm text-[#0A1931]/60">Additional research applications.</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {BEYOND_DEEP_SLEEP.map((b) => (
                    <Card key={b.title} className={`border-[#0A1931]/10 ${b.highlight ? 'bg-[#16a34a]/5' : ''}`}>
                      <CardContent className="p-6">
                        <p className="text-xs font-medium uppercase tracking-wider text-[#0A1931]/60">{b.label}</p>
                        <h4 className="mt-2 font-bold text-[#0A1931]">{b.title}</h4>
                        <p className="mt-2 text-sm text-[#0A1931]/70">{b.desc}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* 3 Detailed Cards */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#0A1931]/60">📋 Detailed findings</p>
                <p className="mt-0.5 text-sm text-[#0A1931]/60">Study-specific outcomes.</p>
                <div className="mt-4 grid gap-6 lg:grid-cols-3">
                  {DETAILED_CARDS.map((d) => (
                    <Card key={d.title} className="border-[#0A1931]/10">
                      <CardContent className="p-6">
                        <h4 className="font-bold text-[#0A1931]">{d.title}</h4>
                        <ul className="mt-4 space-y-2 text-sm text-[#0A1931]/80">
                          {d.metrics.map((m) => (
                            <li key={m}>• {m}</li>
                          ))}
                        </ul>
                        <div className={`mt-4 rounded-lg border-l-4 ${d.calloutBorder} bg-[#0A1931]/5 p-3 text-xs text-[#0A1931]/80`}>
                          {d.callout}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Safety Profile */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#0A1931]/60">🛡️ Safety profile</p>
                <p className="mt-0.5 text-sm text-[#0A1931]/60">Reported effects from preclinical studies.</p>
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
                            {SAFETY_ROWS.map((r) => (
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
                      <p className="text-xs font-medium uppercase tracking-wider text-white/70">Safety advantage</p>
                      <h4 className="mt-2 font-bold">No Dependency or Hormonal Suppression</h4>
                      <p className="mt-3 text-sm text-white/80">
                        Unlike sleeping pills (benzodiazepines), DSIP doesn&apos;t create addiction or suppress your natural hormone production.
                      </p>
                      <ul className="mt-4 space-y-1 text-sm text-white/80">
                        <li>• Non-addictive — no withdrawal or dependency observed in repeat-dose studies</li>
                        <li>• Clears your system fast — half-life under 5 minutes, metabolized rapidly</li>
                        <li>• Repeat dosing shows stable hormone levels — nothing gets suppressed long-term</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Compound Information */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#0A1931]/60">🧪 Compound information</p>
                <p className="mt-0.5 text-sm text-[#0A1931]/60">Technical specifications.</p>
                <div className="mt-4 grid gap-6 lg:grid-cols-3">
                  <Card className="border-[#0A1931]/10">
                    <CardContent className="p-6">
                      <p className="text-xs font-medium uppercase tracking-wider text-[#0A1931]/60 flex items-center gap-1">
                        <Beaker className="h-3.5 w-3.5" /> MOLECULAR PROFILE
                      </p>
                      <h4 className="mt-3 font-bold text-[#0A1931]">What Is DSIP?</h4>
                      <div className="mt-4 rounded-lg bg-[#0A1931]/5 p-4 space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-[#0A1931]/60">Type</span><span className="font-medium">Neuropeptide (non-opioid sleep modulator)</span></div>
                        <div className="flex justify-between"><span className="text-[#0A1931]/60">CAS</span><span className="font-medium">62568-57-4</span></div>
                        <div className="flex justify-between"><span className="text-[#0A1931]/60">Formula</span><span className="font-medium">Not widely disclosed — confirm from supplier COA</span></div>
                        <div className="flex justify-between"><span className="text-[#0A1931]/60">Weight</span><span className="font-medium">849.8 Da</span></div>
                        <div className="flex justify-between"><span className="text-[#0A1931]/60">Amino acids</span><span className="font-medium">9</span></div>
                        <div className="flex justify-between"><span className="text-[#0A1931]/60">Sequence</span><span className="font-mono text-xs">Trp-Ala-Gly-Gly-Asp-Ala-Ser-Gly-Glu</span></div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-[#0A1931]/10">
                    <CardContent className="p-6">
                      <p className="text-xs font-medium uppercase tracking-wider text-[#0A1931]/60 flex items-center gap-1">
                        <Package className="h-3.5 w-3.5" /> STORAGE REQUIREMENTS
                      </p>
                      <h4 className="mt-3 font-bold text-[#0A1931]">Stability Information</h4>
                      <div className="mt-4 space-y-3">
                        <div className="rounded-lg bg-[#0A1931]/5 p-3 flex items-center gap-2">
                          <span className="text-sm text-[#0A1931]/80">Lyophilized:</span>
                          <span className="text-sm font-medium">-20°C • protect from light and moisture</span>
                        </div>
                        <div className="rounded-lg bg-[#0A1931]/5 p-3 flex items-center gap-2">
                          <span className="text-sm text-[#0A1931]/80">Reconstituted:</span>
                          <span className="text-sm font-medium">Refrigerate • protect from light and moisture</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-0 bg-[#0A1931]">
                    <CardContent className="p-6 text-white">
                      <p className="text-xs font-medium uppercase tracking-wider text-white/70 flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5" /> REGULATORY STATUS
                      </p>
                      <h4 className="mt-3 font-bold">Where It Stands</h4>
                      <div className="mt-4 space-y-2 text-sm text-white/80">
                        <div className="flex justify-between"><span>Regulatory</span><span className="font-medium">Research use only — not FDA approved</span></div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {product.coa_url && (
              <TabsContent value="coa" className="mt-0">
                <p className="text-xs font-medium uppercase tracking-wider text-[#0A1931]/60">🧪 Certificate of Analysis</p>
                <p className="mt-0.5 text-sm text-[#0A1931]/60">Third party tested.</p>
                <CoaDocumentPanel coaUrl={product.coa_url} frameClassName="border-[#0A1931]/10" />
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
                        <div className="flex items-center gap-2 mb-2">
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

        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-16 border-t border-[#0A1931]/10 pt-12">
            <RelatedProducts products={relatedProducts} />
          </div>
        )}
      </div>
    </div>
  )
}
