'use client'

import { useState } from 'react'
import { useScrollReveal } from '@/hooks/use-scroll-reveal'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { ChevronLeft, FileText, Star, FlaskConical, Beaker, Package } from 'lucide-react'
import { RelatedProducts } from '@/components/product/related-products'
import { CoaDocumentPanel } from '@/components/product/coa-document-panel'
import { ProductNamePanel } from '@/components/product/product-name-panel'
import type { Product, Vouch } from '@/lib/types'

interface Tb500ProductProps {
  product: Product
  relatedProducts?: Product[]
  vouches?: Vouch[]
}

const GREEN = '#16a34a'

const STAT_CARDS = [
  { value: '4,963 Da', label: 'MOLECULAR WEIGHT', subtext: 'One of the larger research peptides — built for serious tissue work' },
  { value: '43 AA', label: 'PEPTIDE LENGTH', subtext: 'Made of 43 amino acids (the building blocks of proteins) — a mid-size repair peptide' },
  { value: '2.5-3.0h', label: 'HALF-LIFE', subtext: 'Stays active in your system for 2.5-3 hours after subcutaneous (under-skin) injection' },
  { value: '99.878%', label: 'PURITY', subtext: 'Nearly perfect purity on batch testing — less than 0.2% impurities' },
]

const MECHANISM_NODES = [
  { id: 'actin', label: 'ACTIN', title: 'The Cell Movement Signal', sub: 'Primary', color: 'bg-gray-200', bullets: ['Binds to actin (the protein that controls how cells move and restructure)', 'Sends repair cells rushing toward the injury site faster than normal', 'Speeds up tissue remodeling — your body rebuilds damaged areas more efficiently', 'This is the core reason TB-500 is linked to faster recovery across muscle, tendon, and skin'] },
  { id: 'angio', label: 'ANGIOGENESIS', title: 'Building New Blood Supply', sub: 'Strong', color: 'bg-[#16a34a]', bullets: ['Pushes endothelial cells (blood vessel wall cells) to form new capillaries at injury sites', 'More blood flow = more oxygen and nutrients delivered to damaged tissue', 'Supports vascular remodeling so the healing environment stays active longer', 'More blood supply at an injury site = dramatically faster repair conditions'] },
  { id: 'survival', label: 'SURVIVAL', title: 'Repair Signaling Amplifier', sub: 'Moderate', color: 'bg-[#16a34a]/70', bullets: ['Activates Akt/PI3K (cell survival pathways that stop damaged cells from dying off prematurely)', 'Boosts ERK and MAPK signals (molecular switches that tell cells to repair and rebuild)', 'Increases HGF expression (a growth factor linked to tissue regeneration)', 'Keeps repair signaling running downstream even after initial healing kicks in'] },
]

const COMPARISON_ROWS = [
  { label: 'Cell migration', value: '↑ Significantly increased toward injury sites', bar: 100 },
  { label: 'Angiogenesis (new blood vessels)', value: '↑ Consistently observed in preclinical models', bar: 100 },
  { label: 'Inflammation', value: '↓ Reduced in multiple animal injury studies', bar: 30 },
  { label: 'Tissue repair speed', value: '↑ Faster closure and remodeling vs control', bar: 100 },
]

const KEY_TRIAL_STATS = [
  { display: '↑', percent: 100, label: 'Cell Migration', desc: 'Repair cells reach the injury site faster — the foundation of TB-500\'s healing effect' },
  { display: '↑', percent: 100, label: 'Vascularization', desc: 'New blood vessels form at the injury site improving oxygen and nutrient delivery' },
  { display: '↓', percent: 100, label: 'Inflammation', desc: 'Inflammatory stress reduced helping limit secondary damage around injuries' },
]

const BEYOND_TISSUE_REPAIR = [
  { title: 'Tissue Repair', label: 'RECOVERY SUPPORT', desc: 'Promotes faster repair of muscle, tendon, ligament, and skin after injury', highlight: true },
  { title: 'Mobility Support', label: 'FLEXIBILITY & MOVEMENT', desc: 'Linked to improved tissue elasticity and reduced post-injury stiffness', highlight: false },
  { title: 'Anti-Inflammatory', label: 'INFLAMMATION CONTROL', desc: 'Reduces swelling and secondary tissue stress around injury sites', highlight: false },
  { title: 'Recovery Environment', label: 'CELLULAR REGENERATION', desc: 'Creates the ideal internal conditions for healing to actually progress', highlight: false },
]

const DETAILED_CARDS = [
  { title: 'Wound & Tissue Repair', metrics: ['Tissue closure speed → ↑ vs control', 'Collagen deposition (the structural protein that rebuilds tissue) → Improved', 'Repair signaling → Activated via multiple pathways'], callout: 'Preclinical models consistently show accelerated healing and improved structural repair with TB-500 treatment.', calloutBorder: 'border-blue-400' },
  { title: 'Soft Tissue & Muscle Recovery', metrics: ['Cell migration into damaged tissue → ↑', 'Tendon/ligament repair → Supported in animal models', 'Local repair environment → Improved'], callout: 'TB-500 is one of the most referenced peptides in soft tissue recovery research due to its consistent cell migration effects.', calloutBorder: 'border-[#16a34a]' },
  { title: 'Inflammation Reduction', metrics: ['Oxidative stress markers → ↓ in animal studies', 'Secondary tissue damage → Reduced', 'Inflammatory environment → Attenuated around injury sites'], callout: 'TB-500 reduced oxidative stress and limited secondary inflammatory damage in multiple rodent injury models.', calloutBorder: 'border-blue-400' },
]

const SAFETY_ROWS = [
  { effect: 'Headache', freq: 'Unknown frequency', severity: 'MILD/POSSIBLE' },
  { effect: 'Fatigue or sedation', freq: 'Unknown frequency', severity: 'MILD/POSSIBLE' },
  { effect: 'Injection-site irritation', freq: 'Unknown frequency', severity: 'MILD/POSSIBLE' },
]

export function Tb500Product({ product, relatedProducts = [], vouches = [] }: Tb500ProductProps) {
  const [activeTab, setActiveTab] = useState('research')
  const section1 = useScrollReveal()
  const section2 = useScrollReveal()

  const productVouches = vouches.filter((v) => v.product_id === product.id || v.product_id === null)
  const imageSrc = product.image_url || '/images/tb-500-vial.png'

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

        {/* Two-column product hero */}
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

        {/* Below the fold: Tabs */}
        <div
          ref={section2.ref}
          className={`mt-16 transition-all duration-500 ease-out ${section2.visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6 h-14 flex-wrap gap-2 bg-[#1C3D2A]/5 p-2">
              <TabsTrigger value="research" className="gap-2 px-6 py-3 text-base data-[state=active]:bg-white data-[state=active]:text-foreground">
                <FileText className="h-4 w-4" />
                Research
              </TabsTrigger>
              {product.coa_url && (
                <TabsTrigger value="coa" className="gap-2 px-6 py-3 text-base data-[state=active]:bg-white data-[state=active]:text-foreground">
                  <FileText className="h-4 w-4" />
                  COA
                </TabsTrigger>
              )}
              <TabsTrigger value="reviews" className="gap-2 px-6 py-3 text-base data-[state=active]:bg-white data-[state=active]:text-foreground">
                <Star className="h-4 w-4" />
                Reviews
              </TabsTrigger>
            </TabsList>

            <TabsContent value="research" className="mt-0 space-y-12 text-[1.1em]">
              {/* Stat cards — 4 cards */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-foreground/60">✨ Clinical outcomes</p>
                <p className="mt-0.5 text-sm text-foreground/60">Key research metrics.</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {STAT_CARDS.map((s) => (
                    <Card key={s.label} className="border-border/10">
                      <CardContent className="p-6 text-center">
                        <p className="text-2xl font-bold" style={{ color: GREEN }}>{s.value}</p>
                        <p className="mt-1 text-xs font-medium uppercase tracking-wider text-foreground/80">{s.label}</p>
                        <p className="mt-1 text-xs text-foreground/60">{s.subtext}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* How it Works — mechanism diagram + Key Discovery (dark navy card) */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-foreground/60">🧬 How it works</p>
                <p className="mt-0.5 text-sm text-foreground/60">Actin binding, angiogenesis, and repair signaling.</p>
                <div className="mt-4 grid gap-6 lg:grid-cols-5">
                  <Card className="border-border/10 lg:col-span-3">
                    <CardContent className="p-6">
                      <p className="text-xs font-medium uppercase tracking-wider text-foreground/60">The science, simplified</p>
                      <h3 className="mt-2 font-bold text-foreground">How TB-500 Drives Tissue Repair</h3>
                      <div className="mt-6 flex flex-wrap items-start justify-between gap-6">
                        {MECHANISM_NODES.map((n) => (
                          <div key={n.id} className="flex flex-1 min-w-[140px] flex-col items-center text-center">
                            <div className={`h-14 w-14 rounded-full ${n.color} flex items-center justify-center text-xs font-semibold text-foreground`}>{n.label}</div>
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
                      <p className="text-xs font-medium uppercase tracking-wider text-white/70">Key discovery</p>
                      <h3 className="mt-2 font-bold">The Peptide That Moves Repair Cells Into Action</h3>
                      <p className="mt-3 text-sm text-white/80">
                        TB-500 works by controlling actin — the protein responsible for how cells move. By manipulating actin dynamics, it essentially fast-tracks your body&apos;s repair crew to wherever the damage is.
                      </p>
                      <div className="mt-4 rounded-lg border-l-4 border-[#16a34a] bg-white/10 p-3 text-sm text-white/90">
                        &ldquo;Thymosin beta-4&apos;s actin-binding role is central to cell migration, stem cell movement, and tissue differentiation — making it one of the most studied repair peptides in preclinical literature.&rdquo;
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Clinical Stat — Preclinical & Translational Research + right side */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-foreground/60">📊 What research has shown</p>
                <p className="mt-0.5 text-sm text-foreground/60">Summary of preclinical findings.</p>
                <div className="mt-4 grid gap-6 lg:grid-cols-2">
                  <Card className="border-border/10">
                    <CardContent className="p-6">
                      <span className="rounded-full bg-[#1C3D2A]/5 px-3 py-1 text-xs text-foreground/70">Preclinical & Translational Research — Thymosin Beta-4 Biology</span>
                      <p className="mt-4 text-4xl font-bold" style={{ color: GREEN }}>↑↑↑</p>
                      <p className="text-xs font-medium uppercase tracking-wider text-foreground/70">CELL MIGRATION, VASCULARIZATION & INFLAMMATION ALL MOVE IN THE RIGHT DIRECTION</p>
                      <div className="mt-4 text-sm font-semibold text-foreground">Comparison rows</div>
                      <div className="mt-3 space-y-3">
                        {COMPARISON_ROWS.map((r) => (
                          <div key={r.label} className="flex items-center gap-3">
                            <span className="w-48 shrink-0 text-xs text-foreground/70">{r.label}</span>
                            <div className="h-3 flex-1 overflow-hidden rounded-full bg-[#1C3D2A]/10">
                              <div className="h-full rounded-full" style={{ width: `${r.bar}%`, backgroundColor: GREEN }} />
                            </div>
                            <span className="shrink-0 text-xs font-medium" style={{ color: GREEN }}>{r.value}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 rounded-lg bg-[#1C3D2A]/5 p-3 text-xs text-foreground/60">
                        Multiple preclinical reviews confirm TB-500&apos;s actin-binding mechanism drives repair cell movement, new vessel formation, and anti-inflammatory activity across muscle, tendon, skin, and cardiac tissue models.
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-border/10">
                    <CardContent className="p-6">
                      <p className="text-xs font-medium uppercase tracking-wider text-foreground/60">📝 Key trial results</p>
                      <h3 className="mt-2 font-bold text-foreground">Key Trial Results</h3>
                      <div className="mt-6 space-y-6">
                        {KEY_TRIAL_STATS.map((t) => (
                          <div key={t.label}>
                            <div className="flex justify-between text-sm">
                              <span className="font-bold text-foreground">{t.display}</span>
                              <span className="text-foreground/70">{t.label}</span>
                            </div>
                            <p className="text-sm text-foreground/80">{t.desc}</p>
                            <Progress value={t.percent} className="progress-green mt-2 h-2 bg-[#1C3D2A]/10" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Beyond Tissue Repair — 4 cards */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-foreground/60">✨ Beyond tissue repair</p>
                <p className="mt-0.5 text-sm text-foreground/60">Additional research applications.</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {BEYOND_TISSUE_REPAIR.map((b) => (
                    <Card key={b.title} className={`border-border/10 ${b.highlight ? 'bg-[#16a34a]/5' : ''}`}>
                      <CardContent className="p-6">
                        <p className="text-xs font-medium uppercase tracking-wider text-foreground/60">{b.label}</p>
                        <h4 className="mt-2 font-bold text-foreground">{b.title}</h4>
                        <p className="mt-2 text-sm text-foreground/70">{b.desc}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* 3 Detailed Cards */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-foreground/60">📋 Detailed findings</p>
                <p className="mt-0.5 text-sm text-foreground/60">Study-specific outcomes.</p>
                <div className="mt-4 grid gap-6 lg:grid-cols-3">
                  {DETAILED_CARDS.map((d) => (
                    <Card key={d.title} className="border-border/10">
                      <CardContent className="p-6">
                        <h4 className="font-bold text-foreground">{d.title}</h4>
                        <ul className="mt-4 space-y-2 text-sm text-foreground/80">
                          {d.metrics.map((m) => (
                            <li key={m}>• {m}</li>
                          ))}
                        </ul>
                        <div className={`mt-4 rounded-lg border-l-4 ${d.calloutBorder} bg-[#1C3D2A]/5 p-3 text-xs text-foreground/80`}>
                          {d.callout}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Safety Profile */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-foreground/60">🛡️ Safety profile</p>
                <p className="mt-0.5 text-sm text-foreground/60">Reported effects from preclinical and observational data.</p>
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
                            {SAFETY_ROWS.map((r) => (
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
                      <p className="text-xs font-medium uppercase tracking-wider text-white/70">Safety advantage</p>
                      <h4 className="mt-2 font-bold">Wide Preclinical Safety Margin</h4>
                      <p className="mt-3 text-sm text-white/80">
                        Animal studies show no obvious acute toxicity signals across a wide range of doses, though human safety data is still limited.
                      </p>
                      <ul className="mt-4 space-y-1 text-sm text-white/80">
                        <li>• No serious acute toxicity signals observed in preclinical research</li>
                        <li>• Human long-term safety data is not yet well defined — use responsibly</li>
                        <li>• Product quality varies significantly outside regulated manufacturing — source carefully</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Compound Information */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-foreground/60">🧪 Compound information</p>
                <p className="mt-0.5 text-sm text-foreground/60">Technical specifications.</p>
                <div className="mt-4 grid gap-6 lg:grid-cols-3">
                  <Card className="border-border/10">
                    <CardContent className="p-6">
                      <p className="text-xs font-medium uppercase tracking-wider text-foreground/60 flex items-center gap-1">
                        <Beaker className="h-3.5 w-3.5" /> MOLECULAR PROFILE
                      </p>
                      <h4 className="mt-3 font-bold text-foreground">What Is TB-500?</h4>
                      <div className="mt-4 rounded-lg bg-[#1C3D2A]/5 p-4 space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-foreground/60">Type</span><span className="font-medium">Synthetic thymosin beta-4 fragment / TB-4 derived peptide</span></div>
                        <div className="flex justify-between"><span className="text-foreground/60">CAS</span><span className="font-medium">77591-33-4</span></div>
                        <div className="flex justify-between"><span className="text-foreground/60">Formula</span><span className="font-medium">Not widely disclosed — confirm from supplier COA</span></div>
                        <div className="flex justify-between"><span className="text-foreground/60">Weight</span><span className="font-medium">4,963 Da</span></div>
                        <div className="flex justify-between"><span className="text-foreground/60">Amino acids</span><span className="font-medium">43</span></div>
                        <div className="flex justify-between"><span className="text-foreground/60">Sequence</span><span className="font-mono text-xs">43-aa TB4-derived construct — full sequence on product COA</span></div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-border/10">
                    <CardContent className="p-6">
                      <p className="text-xs font-medium uppercase tracking-wider text-foreground/60 flex items-center gap-1">
                        <Package className="h-3.5 w-3.5" /> STORAGE REQUIREMENTS
                      </p>
                      <h4 className="mt-3 font-bold text-foreground">Stability Information</h4>
                      <div className="mt-4 space-y-3">
                        <div className="rounded-lg bg-[#1C3D2A]/5 p-3 flex items-center gap-2">
                          <span className="text-sm text-foreground/80">Lyophilized:</span>
                          <span className="text-sm font-medium">Stable at room temp • Protect from light</span>
                        </div>
                        <div className="rounded-lg bg-[#1C3D2A]/5 p-3 flex items-center gap-2">
                          <span className="text-sm text-foreground/80">Reconstituted:</span>
                          <span className="text-sm font-medium">Refrigerate • Protect from light</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-0 bg-[#1C3D2A]">
                    <CardContent className="p-6 text-white">
                      <p className="text-xs font-medium uppercase tracking-wider text-white/70 flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5" /> REGULATORY STATUS
                      </p>
                      <h4 className="mt-3 font-bold">Where It Stands</h4>
                      <div className="mt-4 space-y-2 text-sm text-white/80">
                        <div className="flex justify-between"><span>Regulatory</span><span className="font-medium">Research use only — not FDA approved for human medical use</span></div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {product.coa_url && (
              <TabsContent value="coa" className="mt-0">
                <p className="text-xs font-medium uppercase tracking-wider text-foreground/60">🧪 Certificate of Analysis</p>
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
                        <div className="flex items-center gap-2 mb-2">
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

        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-16 border-t border-border/10 pt-12">
            <RelatedProducts products={relatedProducts} />
          </div>
        )}
      </div>
    </div>
  )
}
