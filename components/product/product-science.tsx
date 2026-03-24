'use client'

import { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Beaker, FlaskConical, Microscope, FileText, Package, Star } from 'lucide-react'
import type { Product, Vouch } from '@/lib/types'

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

const KISSPEPTIN_STAT_CARDS = [
  { value: '2-3x', label: 'LH SURGE', subtext: 'Acute kisspeptin can more than double LH in humans' },
  { value: '29', label: 'INTERVENTIONAL TRIALS', subtext: 'Human kisspeptin trials reviewed up to 2023' },
  { value: '56%', label: 'ERECTILE RESPONSE INCREASE', subtext: 'Penile tumescence up to 56% higher vs placebo' },
  { value: '0 MAJOR', label: 'SAFETY SIGNALS', subtext: 'No serious drug-related events across reviewed clinical studies' },
  { value: '54 aa', label: 'PRIMARY ISOFORM', subtext: 'Kisspeptin-54 is the major circulating reproductive isoform' },
]

const KISSPEPTIN_MECHANISM_NODES = [
  { id: 'gnrh', label: 'GnRH', badge: 'Primary', title: 'Kisspeptin-GnRH-Gonadotropin Axis', bullets: ['Binds KISS1R on hypothalamic GnRH neurons', 'Triggers Ca²⁺ signaling driving GnRH release', 'GnRH pulses stimulate pituitary LH and FSH', 'Upstream master regulator of human reproductive hormone pulsatility'] },
  { id: 'lh', label: 'LH SURGE', badge: 'Strongest', title: 'Acute Gonadotropin Stimulation', bullets: ['IV kisspeptin produces 2-fold rise in LH', 'Can safely trigger oocyte maturation via physiological GnRH/LH release', 'Repeated pulses maintain robust LH responses', 'Physiology-mimicking alternative to exogenous GnRH analogs'] },
  { id: 'brain', label: 'SEXUAL BRAIN', badge: 'Supportive', title: 'Limbic & Sexual Processing Pathways', bullets: ['Modulates limbic and cortical regions during sexual stimuli on fMRI', 'Enhances sexual and bonding brain processing in men with low desire', 'Linked to improved arousal, mood, reduced negative emotional bias', 'No major changes in BP, heart rate, or cortisol at active doses'] },
]

const KISSPEPTIN_BEYOND = [
  { title: 'IVF & Oocyte Trigger', label: 'FERTILITY', desc: 'Used experimentally to trigger oocyte maturation via endogenous GnRH/LH surges', highlight: true },
  { title: 'Puberty & Hypogonadism', label: 'ENDOCRINE REGULATION', desc: 'Explores restoring physiologic GnRH pulses in delayed puberty and hypothalamic hypogonadism', highlight: false },
  { title: 'Sexual Function', label: 'PSYCHOSEXUAL', desc: 'Improves sexual brain processing and arousal in men and women with low desire', highlight: false },
  { title: 'Metastasis Suppression', label: 'ONCOLOGY (FOUNDATIONAL)', desc: 'Originally identified as melanoma and breast cancer metastasis suppressor peptide', highlight: false },
]

const KISSPEPTIN_SAFETY_ROWS = [
  { effect: 'Transient Flushing/Warmth', freq: 'Low-Moderate', severity: 'MILD' },
  { effect: 'Nausea/GI Upset', freq: 'Low', severity: 'MILD' },
  { effect: 'Headache/Dizziness', freq: 'Low', severity: 'MILD' },
  { effect: 'Injection-related Discomfort', freq: 'Procedure-related', severity: 'MILD' },
]

function isKisspeptin(product: Product): boolean {
  return product.slug === 'kisspeptin' || product.name?.toLowerCase()?.includes('kisspeptin') === true
}

interface ProductScienceProps {
  product: Product
  vouches?: Vouch[]
}

export function ProductScience({ product, vouches = [] }: ProductScienceProps) {
  const hasScientificData = product.molecular_weight || product.sequence || product.research_benefits

  if (!hasScientificData && product.category === 'accessory') {
    return null
  }

  const isKiss = isKisspeptin(product)
  const productVouches = vouches.filter((v) => v.product_id === product.id || v.product_id === null)
  const researchReveal = useScrollReveal()

  return (
    <section className="mt-16">
      <h2 className="mb-6 text-2xl font-bold text-foreground">
        Research Information
      </h2>

      <Tabs defaultValue={isKiss ? 'research' : 'overview'} className="w-full">
        {isKiss ? (
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
        ) : (
          <TabsList className="mb-6 grid w-full grid-cols-3 lg:w-auto lg:grid-cols-none lg:flex">
            <TabsTrigger value="overview" className="gap-2">
              <Beaker className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="specifications" className="gap-2">
              <FlaskConical className="h-4 w-4" />
              Specifications
            </TabsTrigger>
            <TabsTrigger value="research" className="gap-2">
              <Microscope className="h-4 w-4" />
              Research
            </TabsTrigger>
          </TabsList>
        )}

        {!isKiss && (
          <>
            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Beaker className="h-5 w-5" />
                    Product Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    {product.description || `${product.name} is a premium research compound available for laboratory use. All products undergo rigorous quality control testing to ensure consistency and purity.`}
                  </p>
                  <div className="rounded-lg bg-muted/50 p-4">
                    <h4 className="mb-2 font-semibold text-foreground">Quality Assurance</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-green-500" />Third-party HPLC purity testing</li>
                      <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-green-500" />Mass spectrometry verification</li>
                      <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-green-500" />Certificate of Analysis included</li>
                      <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-green-500" />Batch-specific documentation</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="specifications">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FlaskConical className="h-5 w-5" />
                    Technical Specifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {product.purity && (<div className="rounded-lg border border-border p-4"><p className="text-sm text-muted-foreground">Purity</p><p className="mt-1 text-lg font-semibold text-foreground">{product.purity}</p></div>)}
                    {product.dosage && (<div className="rounded-lg border border-border p-4"><p className="text-sm text-muted-foreground">Amount</p><p className="mt-1 text-lg font-semibold text-foreground">{product.dosage}</p></div>)}
                    {product.molecular_weight && (<div className="rounded-lg border border-border p-4"><p className="text-sm text-muted-foreground">Molecular Weight</p><p className="mt-1 text-lg font-semibold text-foreground">{product.molecular_weight}</p></div>)}
                    <div className="rounded-lg border border-border p-4"><p className="text-sm text-muted-foreground">Physical Form</p><p className="mt-1 text-lg font-semibold text-foreground">{product.category === 'capsule' ? 'Capsule' : 'Lyophilized Powder'}</p></div>
                  </div>
                  {product.sequence && (<div className="mt-6 rounded-lg border border-border p-4"><p className="mb-2 text-sm text-muted-foreground">Amino Acid Sequence</p><p className="font-mono text-sm text-foreground break-all">{product.sequence}</p></div>)}
                </CardContent>
              </Card>
            </TabsContent>
          </>
        )}

        <TabsContent value="research">
          {isKiss ? (
            <div
              ref={researchReveal.ref}
              className={`space-y-12 text-[1.1em] transition-all duration-500 ease-out ${researchReveal.visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
            >
              {/* Stat cards */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">✨ Clinical outcomes</p>
                <p className="mt-0.5 text-sm text-muted-foreground">Key research metrics.</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  {KISSPEPTIN_STAT_CARDS.map((s) => (
                    <Card key={s.label} className="border-border">
                      <CardContent className="p-6 text-center">
                        <p className="text-2xl font-bold" style={{ color: GREEN }}>{s.value}</p>
                        <p className="mt-1 text-xs font-medium uppercase tracking-wider text-foreground">{s.label}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{s.subtext}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* How it Works + Key Discovery */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">🧬 How it works</p>
                <p className="mt-0.5 text-sm text-muted-foreground">Kisspeptin-GnRH-gonadotropin axis and psychosexual pathways.</p>
                <div className="mt-4 grid gap-6 lg:grid-cols-5">
                  <Card className="border-border lg:col-span-3">
                    <CardContent className="p-6">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">The science, simplified</p>
                      <h3 className="mt-2 font-bold text-foreground">Reproductive Axis & Sexual Brain</h3>
                      <div className="mt-6 flex flex-wrap items-start justify-between gap-6">
                        {KISSPEPTIN_MECHANISM_NODES.map((n) => (
                          <div key={n.id} className="flex flex-1 min-w-[140px] flex-col items-center text-center">
                            <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-foreground">{n.label}</div>
                            <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">{n.badge}</p>
                            <p className="mt-2 font-semibold text-foreground">{n.title}</p>
                            <ul className="mt-2 space-y-0.5 text-left text-xs text-muted-foreground">
                              {n.bullets.map((b) => (
                                <li key={b}>• {b}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-0 bg-[#0A1931] lg:col-span-2 text-white">
                    <CardContent className="p-6">
                      <p className="text-xs font-medium uppercase tracking-wider text-white/70">Key discovery</p>
                      <h3 className="mt-2 font-bold">Master Switch for Human Reproduction</h3>
                      <p className="mt-3 text-sm text-white/80">Kisspeptin was first identified as a metastasis suppressor peptide and later recognized as the key upstream driver of GnRH and gonadotropin release. It is now considered the central gatekeeper of puberty onset, fertility, and reproductive hormone pulsatility in humans.</p>
                      <div className="mt-4 rounded-lg border-l-4 border-[#16a34a] bg-white/10 p-3 text-sm text-white/90">
                        &ldquo;Kisspeptin is the leading upstream regulator of pulsatile GnRH secretion in the hypothalamus, underpinning its pivotal role in reproductive physiology and its emerging clinical applications.&rdquo;
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Clinical Stat + Right Side */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">📊 What research has shown</p>
                <p className="mt-0.5 text-sm text-muted-foreground">Summary of clinical findings.</p>
                <div className="mt-4 grid gap-6 lg:grid-cols-2">
                  <Card className="border-border">
                    <CardContent className="p-6">
                      <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">Randomized Crossover Trial — Men with Low Sexual Desire</span>
                      <p className="mt-4 text-4xl font-bold" style={{ color: GREEN }}>56% ↑</p>
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Penile tumescence vs placebo during sexual stimuli</p>
                      <div className="mt-4 space-y-3">
                        <div className="flex items-center gap-3"><span className="w-40 shrink-0 text-xs text-muted-foreground">Penile tumescence</span><span className="text-xs">Up to 56% higher vs placebo</span></div>
                        <div className="flex items-center gap-3"><span className="w-40 shrink-0 text-xs text-muted-foreground">Sexual brain activity</span><span className="text-xs">Significant modulation of limbic and cortical regions</span></div>
                        <div className="flex items-center gap-3"><span className="w-40 shrink-0 text-xs text-muted-foreground">Negative mood bias</span><span className="text-xs">Improved processing of negative sexual cues</span></div>
                        <div className="flex items-center gap-3"><span className="w-40 shrink-0 text-xs text-muted-foreground">Hemodynamic effects</span><span className="text-xs">No significant change in BP or HR</span></div>
                      </div>
                      <div className="mt-4 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                        32 men with hypoactive sexual desire disorder received IV kisspeptin-54 or placebo. Kisspeptin significantly increased penile tumescence, enhanced sexual brain processing, and improved psychometric measures without adverse hemodynamic effects.
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-border">
                    <CardContent className="p-6">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">📝 Key trial results</p>
                      <h3 className="mt-2 font-bold text-foreground">Key Trial Results</h3>
                      <div className="mt-6 space-y-6">
                        <div><div className="flex justify-between text-sm"><span className="font-bold" style={{ color: GREEN }}>100%</span><span className="text-muted-foreground">Biologically Active Dose</span></div><p className="text-sm text-muted-foreground">All participants showed robust LH rise confirming target engagement</p><Progress value={100} className="mt-2 h-2" /></div>
                        <div><div className="flex justify-between text-sm"><span className="font-bold" style={{ color: GREEN }}>56%</span><span className="text-muted-foreground">Higher Tumescence</span></div><p className="text-sm text-muted-foreground">Peak erectile response increase vs placebo during sexual video</p><Progress value={56} className="mt-2 h-2" /></div>
                        <div><div className="flex justify-between text-sm"><span className="font-bold" style={{ color: GREEN }}>0 SERIOUS</span><span className="text-muted-foreground">Drug-Related Events</span></div><p className="text-sm text-muted-foreground">No serious adverse events attributed to kisspeptin</p></div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Beyond Fertility */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">✨ Beyond fertility</p>
                <p className="mt-0.5 text-sm text-muted-foreground">Additional research applications.</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {KISSPEPTIN_BEYOND.map((b) => (
                    <Card key={b.title} className={`border-border ${b.highlight ? 'bg-green-50 dark:bg-green-950/20' : ''}`}>
                      <CardContent className="p-6">
                        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{b.label}</p>
                        <h4 className="mt-2 font-bold text-foreground">{b.title}</h4>
                        <p className="mt-2 text-sm text-muted-foreground">{b.desc}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* 3 Detailed Cards */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">📋 Detailed findings</p>
                <p className="mt-0.5 text-sm text-muted-foreground">Study-specific outcomes.</p>
                <div className="mt-4 grid gap-6 lg:grid-cols-3">
                  <Card className="border-border">
                    <CardContent className="p-6">
                      <h4 className="font-bold text-foreground">Assisted Reproduction Support</h4>
                      <ul className="mt-4 space-y-2 text-sm text-muted-foreground"><li>• LH response → Robust controlled surge</li><li>• OHSS risk → Potentially reduced vs traditional triggers</li></ul>
                      <div className="mt-4 rounded-lg border-l-4 border-blue-400 bg-muted/50 p-3 text-xs text-muted-foreground">Kisspeptin-triggered IVF cycles showed good oocyte yield and favorable safety in small-to-moderate cohorts.</div>
                    </CardContent>
                  </Card>
                  <Card className="border-border">
                    <CardContent className="p-6">
                      <h4 className="font-bold text-foreground">Reproductive Axis Activation</h4>
                      <ul className="mt-4 space-y-2 text-sm text-muted-foreground"><li>• LH → ↑2-3x from baseline</li><li>• FSH → Mild ↑ or unchanged</li></ul>
                      <div className="mt-4 rounded-lg border-l-4 border-[#16a34a] bg-muted/50 p-3 text-xs text-muted-foreground">Early human work consistently shows gonadotropin stimulation across sexes with good tolerability.</div>
                    </CardContent>
                  </Card>
                  <Card className="border-border">
                    <CardContent className="p-6">
                      <h4 className="font-bold text-foreground">Psychosexual & Mood Modulation</h4>
                      <ul className="mt-4 space-y-2 text-sm text-muted-foreground"><li>• Penile tumescence → ↑ up to 56% vs placebo</li><li>• Anxiety/BP/HR → No significant change</li></ul>
                      <div className="mt-4 rounded-lg border-l-4 border-blue-400 bg-muted/50 p-3 text-xs text-muted-foreground">Randomized crossover trials in men with HSDD demonstrate combined peripheral and central benefits.</div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Safety */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">🛡️ Safety profile</p>
                <p className="mt-0.5 text-sm text-muted-foreground">Reported effects from clinical studies.</p>
                <div className="mt-4 grid gap-6 lg:grid-cols-2">
                  <Card className="border-border">
                    <CardContent className="p-6">
                      <table className="w-full text-sm">
                        <thead><tr className="border-b border-border"><th className="pb-3 text-left font-medium text-muted-foreground">Effect</th><th className="pb-3 text-left font-medium text-muted-foreground">Frequency</th><th className="pb-3 text-left font-medium text-muted-foreground">Severity</th></tr></thead>
                        <tbody>
                          {KISSPEPTIN_SAFETY_ROWS.map((r) => (
                            <tr key={r.effect} className="border-b border-border/50"><td className="py-3 text-muted-foreground">{r.effect}</td><td className="py-3 text-muted-foreground">{r.freq}</td><td className="py-3 text-muted-foreground">{r.severity}</td></tr>
                          ))}
                        </tbody>
                      </table>
                    </CardContent>
                  </Card>
                  <Card className="border-0 bg-[#0A1931] text-white">
                    <CardContent className="p-6">
                      <p className="text-xs font-medium uppercase tracking-wider text-white/70">Safety advantage</p>
                      <h4 className="mt-2 font-bold">Physiology-Mimicking Hormone Control</h4>
                      <p className="mt-3 text-sm text-white/80">Kisspeptin stimulates the native GnRH-LH/FSH axis rather than bypassing it, offering a more natural controllable profile with fewer off-target endocrine effects.</p>
                      <ul className="mt-4 space-y-1 text-sm text-white/80">
                        <li>• No serious adverse events attributed to kisspeptin across reviewed human studies</li>
                        <li>• Active doses do not significantly alter BP, heart rate, or cortisol</li>
                        <li>• Side effects typically mild and transient</li>
                        <li>• Long-term high-frequency dosing insufficiently characterized</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Compound */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">🧪 Compound information</p>
                <p className="mt-0.5 text-sm text-muted-foreground">Technical specifications.</p>
                <div className="mt-4 grid gap-6 lg:grid-cols-3">
                  <Card className="border-border">
                    <CardContent className="p-6">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1"><Beaker className="h-3.5 w-3.5" /> MOLECULAR PROFILE</p>
                      <h4 className="mt-3 font-bold text-foreground">What Is Kisspeptin?</h4>
                      <div className="mt-4 rounded-lg bg-muted/50 p-4 space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span className="font-medium">Neuropeptide / endogenous mammalian peptide (KISS1 gene product)</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">CAS</span><span className="font-medium">374683-28-0 (Kisspeptin-10)</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Formula</span><span className="font-medium">C63H83N15O13 (Kisspeptin-10)</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Weight</span><span className="font-medium">~1302.4 g/mol (Kisspeptin-10)</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Amino acids</span><span className="font-medium">10 (Kisspeptin-10) / 54 (primary circulating isoform)</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Sequence</span><span className="font-mono text-xs">Tyr-Asn-Trp-Asn-Ser-Phe-Gly-Leu-Arg-Phe-NH2 (Kisspeptin-10)</span></div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-border">
                    <CardContent className="p-6">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1"><Package className="h-3.5 w-3.5" /> STORAGE</p>
                      <h4 className="mt-3 font-bold text-foreground">Stability Information</h4>
                      <div className="mt-4 space-y-3">
                        <div className="rounded-lg bg-muted/50 p-3"><span className="text-sm text-muted-foreground">Lyophilized at -20°C</span></div>
                        <div className="rounded-lg bg-muted/50 p-3"><span className="text-sm text-muted-foreground">Reconstituted at 2-8°C</span></div>
                        <div className="rounded-lg bg-muted/50 p-3"><span className="text-sm text-muted-foreground">Avoid repeated freeze-thaw</span></div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-0 bg-[#0A1931] text-white">
                    <CardContent className="p-6">
                      <p className="text-xs font-medium uppercase tracking-wider text-white/70"><FileText className="h-3.5 w-3.5 inline mr-1" /> REGULATORY STATUS</p>
                      <h4 className="mt-3 font-bold">Where It Stands</h4>
                      <div className="mt-4 text-sm text-white/80">No approved therapeutic product / Research use only / Under active clinical investigation for fertility and sexual dysfunction</div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Disclaimer:</strong> This product is intended for laboratory research use only. Not for human or animal consumption. Researchers are responsible for compliance with all applicable regulations.
                </p>
              </div>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Microscope className="h-5 w-5" />
                  Research Applications
                </CardTitle>
              </CardHeader>
              <CardContent>
                {product.research_benefits && product.research_benefits.length > 0 ? (
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      This compound has been studied for the following research applications:
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {product.research_benefits.map((benefit, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 rounded-lg border border-border p-4"
                        >
                          <FileText className="h-5 w-5 text-primary" />
                          <span className="text-foreground">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    Research documentation available upon request. Contact our team for detailed study references and protocol recommendations.
                  </p>
                )}

                <div className="mt-6 rounded-lg bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Disclaimer:</strong> This product is intended for laboratory research use only. Not for human or animal consumption. Researchers are responsible for compliance with all applicable regulations.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {isKiss && product.coa_url && (
          <TabsContent value="coa" className="mt-0">
            <p className="text-xs font-medium uppercase tracking-wider text-[#0A1931]/60">🧪 Certificate of Analysis</p>
            <p className="mt-0.5 text-sm text-[#0A1931]/60">Third party tested.</p>
            <Card className="mt-6 border-[#0A1931]/10 max-w-md">
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

        {isKiss && (
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
                            <Star key={i} className={`h-4 w-4 ${i <= v.rating ? 'fill-amber-400 text-amber-400' : 'text-[#0A1931]/20'}`} />
                          ))}
                        </div>
                        <span className="font-medium text-[#0A1931]">{v.author_name}</span>
                        {v.verified && <span className="text-xs text-[#0A1931]/60">Verified</span>}
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
        )}
      </Tabs>
    </section>
  )
}
