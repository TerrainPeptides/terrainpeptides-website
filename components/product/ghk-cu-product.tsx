'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { ChevronLeft, FileText, Star } from 'lucide-react'
import { RelatedProducts } from '@/components/product/related-products'
import { ProductNamePanel } from '@/components/product/product-name-panel'
import { CoaDocumentPanel } from '@/components/product/coa-document-panel'
import type { Product, Vouch } from '@/lib/types'

interface GhkCuProductProps {
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
  { value: '70%', label: 'COLLAGEN INCREASE', subtext: 'vs 50% vitamin C, 40% retinoic acid' },
  { value: '31.2%', label: 'GENES MODULATED', subtext: '4,000+ human genes affected' },
  { value: '30-50%', label: 'HAIR GROWTH', subtext: 'Follicle size increase' },
  { value: '12 weeks', label: 'VISIBLE RESULTS', subtext: 'Clinical facial study duration' },
]

const MECHANISM_NODES = [
  { id: 'ge', label: 'GE Primary', title: 'Gene Expression', sub: 'Epigenetic Modulation', bullets: ['DNA repair genes', 'Antioxidant genes', '4,000+ genes affected'], color: 'bg-gray-200' },
  { id: 'col', label: 'COL Strongest', title: 'Collagen Pathway', sub: 'Collagen & ECM Synthesis', bullets: ['Type I & III collagen', 'Elastin support', 'Wrinkle reduction'], color: 'bg-[#16a34a]' },
  { id: 'cu', label: 'Cu²⁺ Supportive', title: 'Copper Delivery', sub: 'Copper Ion Transport', bullets: ['Bioavailability', 'Cellular uptake', 'Cofactor support'], color: 'bg-[#16a34a]/70' },
]

const KEY_DISCOVERY_STATS = [
  { label: 'Genes Upregulated', value: '1,942', green: true },
  { label: 'Genes Downregulated', value: '762', green: false },
  { label: 'DNA Repair Genes', value: '↑ 47 genes', green: true },
  { label: 'Antioxidant Genes', value: '↑ 14 genes', green: true },
]

const KEY_TRIAL_RESULTS = [
  { percent: 70, label: 'Research Participants', desc: 'Improved collagen production', sub: 'vs 50% vitamin C' },
  { percent: 55, label: 'Wrinkle Reduction', desc: 'Visible improvement', sub: '12-week study' },
  { percent: 40, label: 'Follicle Size', desc: 'Hair growth support', sub: 'Anagen phase' },
]

const COA_CARDS = [
  { purity: '99.76', variant: 'GHK-Cu 50mg', lot: '81111', labeled: '50mg', actual: '59.26mg', tested: 'Feb 4, 2026' },
  { purity: '99.82', variant: 'GHK-Cu 100mg', lot: '81112', labeled: '100mg', actual: '98.14mg', tested: 'Feb 4, 2026' },
]

export function GhkCuProduct({ product, relatedProducts = [], vouches = [] }: GhkCuProductProps) {
  const [activeTab, setActiveTab] = useState('research')
  const section1 = useScrollReveal()
  const section2 = useScrollReveal()

  const imageSrc = product.image_url || '/images/ghk-cu-vial.png'

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
          {/* Left: large product image on card */}
          <div
            ref={section1.ref}
            className={`transition-all duration-500 ease-out ${section1.visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
          >
            <Card className="overflow-hidden border-border/10 bg-[#f8f9fa]">
              <CardContent className="flex min-h-[320px] items-center justify-center p-8 sm:min-h-[400px] lg:min-h-[440px]">
                <div className="relative h-[280px] w-full max-w-[280px] transition-transform duration-300 ease-out hover:scale-[1.02] sm:h-[340px] sm:max-w-[340px] lg:h-[380px] lg:max-w-[380px]">
                  <Image
                    src={imageSrc}
                    alt={product.name}
                    fill
                    className="object-contain"
                    sizes="(max-width: 1024px) 340px, 380px"
                    priority
                    unoptimized={imageSrc.startsWith('data:')}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: name panel */}
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
              {/* Stat cards — real numeric stats */}
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

              {/* How it Works — mechanism diagram + Key Discovery */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-foreground/60">🧬 How it works</p>
                <p className="mt-0.5 text-sm text-foreground/60">Multi-pathway regeneration.</p>
                <div className="mt-4 grid gap-6 lg:grid-cols-5">
                  <Card className="border-border/10 lg:col-span-3">
                    <CardContent className="p-6">
                      <p className="text-xs font-medium uppercase tracking-wider text-foreground/60">The science, simplified</p>
                      <h3 className="mt-2 font-bold text-foreground">Multi-Pathway Regeneration</h3>
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
                      <h3 className="mt-2 font-bold">Unprecedented Gene Influence</h3>
                      <p className="mt-3 text-sm text-white/80">
                        GHK-Cu modulates thousands of genes linked to repair, antioxidant response, and collagen synthesis.
                      </p>
                      <div className="mt-6 space-y-3 rounded-lg bg-white/10 p-4">
                        {KEY_DISCOVERY_STATS.map((k) => (
                          <div key={k.label} className="flex justify-between text-sm">
                            <span className="text-white/80">{k.label}</span>
                            <span className="font-semibold" style={k.green ? { color: GREEN } : undefined}>{k.value}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Two-column: clinical trial stat + comparison bars | Key Trial Results */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-foreground/60">📊 What research has shown</p>
                <p className="mt-0.5 text-sm text-foreground/60">Summary of clinical and preclinical findings.</p>
                <div className="mt-4 grid gap-6 lg:grid-cols-2">
                  <Card className="border-border/10">
                    <CardContent className="p-6">
                      <span className="rounded-full bg-[#1C3D2A]/5 px-3 py-1 text-xs text-foreground/70">🗓️ 12-Week Facial Study — 71 Women</span>
                      <p className="mt-4 text-4xl font-bold" style={{ color: GREEN }}>55.8%</p>
                      <p className="text-xs font-medium uppercase tracking-wider text-foreground/70">Wrinkle volume reduction</p>
                      <p className="mt-4 text-sm font-semibold text-foreground">Wrinkle reduction comparison</p>
                      <div className="mt-3 space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="w-32 shrink-0 text-xs text-foreground/70">GHK-Cu vs Control</span>
                          <div className="h-3 flex-1 overflow-hidden rounded-full bg-[#1C3D2A]/10">
                            <div className="h-full rounded-full" style={{ width: '100%', backgroundColor: GREEN }} />
                          </div>
                          <span className="text-xs font-medium" style={{ color: GREEN }}>-55.8%</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="w-32 shrink-0 text-xs text-foreground/70">GHK-Cu vs Matrixyl</span>
                          <div className="h-3 flex-1 overflow-hidden rounded-full bg-[#1C3D2A]/10">
                            <div className="h-full rounded-full bg-[#1C3D2A]/40" style={{ width: '57%' }} />
                          </div>
                          <span className="text-xs text-foreground/70">-31.6%</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="w-32 shrink-0 text-xs text-foreground/70">Placebo</span>
                          <div className="h-3 flex-1 overflow-hidden rounded-full bg-[#1C3D2A]/10">
                            <div className="h-full rounded-full bg-[#1C3D2A]/20" style={{ width: '4%' }} />
                          </div>
                          <span className="text-xs text-foreground/70">-0%</span>
                        </div>
                      </div>
                      <div className="mt-4 rounded-lg bg-[#1C3D2A]/5 p-3 text-xs text-foreground/60">
                        ⚠️ Based on thigh skin biopsy studies measuring collagen production after 1 month of treatment.
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-border/10">
                    <CardContent className="p-6">
                      <p className="text-xs font-medium uppercase tracking-wider text-foreground/60">📝 Key trial results</p>
                      <h3 className="mt-2 font-bold text-foreground">Key Trial Results</h3>
                      <div className="mt-6 space-y-6">
                        {KEY_TRIAL_RESULTS.map((t) => (
                          <div key={t.label}>
                            <div className="flex justify-between text-sm">
                              <span className="font-bold text-foreground">{t.percent}%</span>
                              <span className="text-foreground/70">{t.label}</span>
                            </div>
                            <p className="text-sm text-foreground/80">{t.desc}</p>
                            <p className="text-xs text-foreground/60">{t.sub}</p>
                            <Progress value={t.percent} className="progress-green mt-2 h-2 bg-[#1C3D2A]/10" />
                          </div>
                        ))}
                      </div>
                      <div className="mt-6 rounded-lg bg-[#1C3D2A]/5 p-3 text-xs text-foreground/60">
                        💡 Note: Measurement methods vary by study. Outcomes from published clinical and preclinical research.
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {product.coa_url && (
            <TabsContent value="coa" className="mt-0">
              <p className="text-xs font-medium uppercase tracking-wider text-foreground/60">🧪 Certificate of Analysis</p>
              <p className="mt-0.5 text-sm text-foreground/60">Third party tested by Freedom Diagnostics.</p>
              <div className="mt-6 flex flex-wrap gap-6">
                {COA_CARDS.map((coa) => (
                  <Card key={coa.lot} className="w-full min-w-[280px] max-w-[340px] border-border/10">
                    <CardContent className="p-6">
                      <span className="rounded bg-[#1C3D2A] px-2 py-0.5 text-xs font-medium text-white">LATEST</span>
                      <p className="mt-4 text-4xl font-bold" style={{ color: GREEN }}>{coa.purity}%</p>
                      <p className="text-xs font-medium uppercase tracking-wider text-foreground/60">Purity</p>
                      <dl className="mt-6 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-foreground/60">Variant</dt>
                          <dd className="font-medium text-foreground">{coa.variant}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-foreground/60">Lot #</dt>
                          <dd className="font-medium text-foreground">{coa.lot}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-foreground/60">Labeled</dt>
                          <dd className="font-medium text-foreground">{coa.labeled}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-foreground/60">Actual</dt>
                          <dd className="font-medium" style={{ color: GREEN }}>{coa.actual}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-foreground/60">Tested</dt>
                          <dd className="font-medium text-foreground">{coa.tested}</dd>
                        </div>
                      </dl>
                      <Button
                        asChild
                        className="mt-6 w-full gap-2 bg-[#1C3D2A] text-white hover:bg-[#1C3D2A]/90"
                      >
                        <a href={product.coa_url || '/contact'} target={product.coa_url ? '_blank' : undefined} rel={product.coa_url ? 'noopener noreferrer' : undefined}>
                          <FileText className="h-4 w-4" />
                          View COA
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <CoaDocumentPanel coaUrl={product.coa_url} frameClassName="border-border/10" />
            </TabsContent>
            )}

            <TabsContent value="reviews" className="mt-0">
              <p className="text-xs font-medium uppercase tracking-wider text-foreground/60">⭐ Reviews</p>
              <p className="mt-0.5 text-sm text-foreground/60">Customer feedback.</p>
              <div className="mt-4 space-y-4">
                {vouches.filter((v) => v.product_id === product.id || v.product_id === null).length > 0 ? (
                  vouches
                    .filter((v) => v.product_id === product.id || v.product_id === null)
                    .map((v) => (
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

        {/* Disclaimer */}
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
