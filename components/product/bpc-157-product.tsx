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
import { CoaDocumentPanel } from '@/components/product/coa-document-panel'
import { ProductNamePanel } from '@/components/product/product-name-panel'
import type { Product, Vouch } from '@/lib/types'

interface Bpc157ProductProps {
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
  { value: '2-3x', label: 'ANGIOGENESIS MARKERS', subtext: 'VEGFR2, CD34 expression in injured tissue' },
  { value: '~50-70%', label: 'ULCER SIZE REDUCTION', subtext: 'Gastric lesions vs control in rats' },
  { value: '2x faster', label: 'TENDON HEALING', subtext: 'Biomechanical recovery vs control' },
  { value: '~40-60%', label: 'EDEMA REDUCTION', subtext: 'Inflammatory swelling decrease vs control' },
  { value: '30-50%', label: 'VASCULAR PATENCY', subtext: 'Improved blood vessel integrity after injury' },
]

const MECHANISM_NODES = [
  { id: 'no', label: 'NO/VEGF', title: 'Nitric Oxide-VEGF Angiogenic Pathway', sub: 'Primary', bullets: ['Enhances endothelial nitric oxide signaling', 'Upregulates VEGF promoting new capillary formation', 'Improves microvascular integrity', 'Supports re-endothelialization of injured vessels'], color: 'bg-gray-200' },
  { id: 'fak', label: 'FAK/AKT', title: 'Cytoprotection and Tissue Repair Pathway', sub: 'Strongest', bullets: ['Activates FAK and AKT signaling supporting cell survival', 'Reduces apoptotic signaling in injured tissue', 'Enhances fibroblast and endothelial cell migration', 'Modulates extracellular matrix remodeling'], color: 'bg-[#16a34a]' },
  { id: 'gut', label: 'GUT/NEURO', title: 'Gut Barrier and Neuro-Inflammatory Modulation', sub: 'Moderate', bullets: ['Stabilizes gastric and intestinal mucosal barrier', 'Modulates inflammatory mediators in the gut', 'Shows neuroprotective effects in some models', 'May influence neurotrophic signaling via reduced systemic inflammation'], color: 'bg-[#16a34a]/70' },
]

const KEY_DISCOVERY_STATS = [
  { label: 'Tissue repair', value: 'Gastric to tendon', green: true },
  { label: 'Microvascular integrity', value: 'Preserved', green: true },
  { label: 'Lesion size', value: 'Reduced vs control', green: true },
  { label: 'Vascular integrity', value: 'Maintained', green: true },
]

const COMPARISON_ROWS = [
  { label: 'Tendon rupture force', value: '+80-100% vs control', bar: 100 },
  { label: 'Histologic organization score', value: '~2x higher vs control', bar: 100 },
  { label: 'Vascular density in injury zone', value: '+50-70% vs control', bar: 70 },
  { label: 'Time to functional recovery', value: '~40-50% faster vs control', bar: 50 },
]

const KEY_TRIAL_RESULTS = [
  { percent: 100, label: 'Showed improved tendon strength', desc: 'All treated animals vs variable recovery in controls', sub: 'Tendon mechanical strength' },
  { percent: 70, label: 'Greater vascular density', desc: 'Injury zone microvasculature vs control', sub: 'Microvascularization' },
  { percent: 45, label: 'Faster functional recovery', desc: 'Earlier return to weight-bearing vs control', sub: 'Functional recovery' },
]

const BEYOND_TISSUE_HEALING = [
  { title: 'Gut Mucosa', label: 'GASTROPROTECTION', desc: 'Reduces formation and accelerates healing of gastric and intestinal lesions', highlight: true },
  { title: 'Tendon & Ligament', label: 'MUSCULOSKELETAL REPAIR', desc: 'Improves mechanical strength and organization of injured tendons', highlight: false },
  { title: 'CNS & Nerves', label: 'NEUROPROTECTION', desc: 'Shows protective effects in brain and nerve injury models', highlight: false },
  { title: 'Vasculature & Organs', label: 'MICROVASCULAR SUPPORT', desc: 'Preserves blood vessel integrity and mitigates organ damage', highlight: false },
]

const DETAILED_CARDS = [
  { title: 'Gastroprotective Effects', metrics: ['Gastric lesion area ↓50-70%', 'Ulcer count ↓40-60%', 'Mucosal blood flow ↑'], callout: 'In indomethacin-induced gastric ulcer model, BPC-157 significantly reduced ulcer area and improved mucosal integrity vs vehicle.', calloutBorder: 'border-blue-400' },
  { title: 'Tendon and Ligament Healing', metrics: ['Ultimate tensile strength ↑80-100%', 'Collagen fiber alignment ↑', 'Time to recovery ↓40-50%'], callout: 'Treated rats exhibited significantly higher breaking strength and superior histologic repair vs untreated animals.', calloutBorder: 'border-[#16a34a]' },
  { title: 'Neuroprotective & Organ-Protective Actions', metrics: ['Lesion volume ↓ vs control', 'Neurologic deficit scores improved', 'Survival ↑ in severe models'], callout: 'BPC-157 reduced edema and improved neurologic outcome scores relative to vehicle-treated animals.', calloutBorder: 'border-blue-400' },
]

const SAFETY_ROWS = [
  { effect: 'Local irritation injection site', freq: '<10%', severity: 'MILD' },
  { effect: 'Transient behavioral changes at high doses', freq: 'LOW', severity: 'MILD' },
  { effect: 'GI upset high-dose oral', freq: 'LOW', severity: 'MILD' },
]

export function Bpc157Product({ product, relatedProducts = [], vouches = [] }: Bpc157ProductProps) {
  const [activeTab, setActiveTab] = useState('research')
  const section1 = useScrollReveal()
  const section2 = useScrollReveal()

  const productVouches = vouches.filter((v) => v.product_id === product.id || v.product_id === null)

  const imageSrc = product.image_url || '/images/bpc-157-vial.png'

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
              {/* Stat cards — 5 cards */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#0A1931]/60">✨ Clinical outcomes</p>
                <p className="mt-0.5 text-sm text-[#0A1931]/60">Key research metrics.</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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

              {/* How it Works — mechanism diagram + Key Discovery */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#0A1931]/60">🧬 How it works</p>
                <p className="mt-0.5 text-sm text-[#0A1931]/60">Multi-pathway cytoprotection and repair.</p>
                <div className="mt-4 grid gap-6 lg:grid-cols-5">
                  <Card className="border-[#0A1931]/10 lg:col-span-3">
                    <CardContent className="p-6">
                      <p className="text-xs font-medium uppercase tracking-wider text-[#0A1931]/60">The science, simplified</p>
                      <h3 className="mt-2 font-bold text-[#0A1931]">Multi-Pathway Regeneration</h3>
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
                      <h3 className="mt-2 font-bold">Cytoprotective Angiogenic Repair With BPC-157</h3>
                      <p className="mt-3 text-sm text-white/80">
                        Across multiple rodent models, BPC-157 consistently supports rapid repair of diverse tissues — from gastric mucosa to tendon, muscle, and nerve — while preserving microvascular integrity.
                      </p>
                      <div className="mt-4 rounded-lg border-l-4 border-[#16a34a] bg-white/10 p-3 text-sm text-white/90">
                        &ldquo;BPC-157 markedly accelerated healing of transected tendon and muscle, preserved vascular integrity, and reduced gross lesion size compared with controls in rodent models.&rdquo;
                      </div>
                      <div className="mt-6 space-y-3 rounded-lg bg-white/10 p-4">
                        {KEY_DISCOVERY_STATS.map((k) => (
                          <div key={k.label} className="flex justify-between text-sm">
                            <span className="text-white/80">{k.label}</span>
                            <span className="font-semibold" style={{ color: GREEN }}>{k.value}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* What Research Has Shown — tendon study + key trial results */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#0A1931]/60">📊 What research has shown</p>
                <p className="mt-0.5 text-sm text-[#0A1931]/60">Summary of preclinical findings.</p>
                <div className="mt-4 grid gap-6 lg:grid-cols-2">
                  <Card className="border-[#0A1931]/10">
                    <CardContent className="p-6">
                      <span className="rounded-full bg-[#0A1931]/5 px-3 py-1 text-xs text-[#0A1931]/70">🗓️ Preclinical Research — Rodent Tendon Injury Models</span>
                      <p className="mt-4 text-4xl font-bold" style={{ color: GREEN }}>~2x improvement</p>
                      <p className="text-xs font-medium uppercase tracking-wider text-[#0A1931]/70">Tendon mechanical strength at healing</p>
                      <div className="mt-4 text-sm font-semibold text-[#0A1931]">Comparison rows</div>
                      <div className="mt-3 space-y-3">
                        {COMPARISON_ROWS.map((r) => (
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
                        ⚠️ In a rat Achilles tendon transection model, animals receiving BPC-157 showed faster functional recovery, significantly higher ultimate tensile strength, and better collagen fiber alignment on histology. Enhanced microvascularization and reduced peritendinous edema were observed.
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-[#0A1931]/10">
                    <CardContent className="p-6">
                      <p className="text-xs font-medium uppercase tracking-wider text-[#0A1931]/60">📝 Key trial results</p>
                      <h3 className="mt-2 font-bold text-[#0A1931]">Key Trial Results</h3>
                      <div className="mt-6 space-y-6">
                        {KEY_TRIAL_RESULTS.map((t) => (
                          <div key={t.label}>
                            <div className="flex justify-between text-sm">
                              <span className="font-bold text-[#0A1931]">~{t.percent}%</span>
                              <span className="text-[#0A1931]/70">{t.label}</span>
                            </div>
                            <p className="text-sm text-[#0A1931]/80">{t.desc}</p>
                            <p className="text-xs text-[#0A1931]/60">{t.sub}</p>
                            <Progress value={t.percent} className="progress-green mt-2 h-2 bg-[#0A1931]/10" />
                          </div>
                        ))}
                      </div>
                      <div className="mt-6 rounded-lg bg-[#0A1931]/5 p-3 text-xs text-[#0A1931]/60">
                        💡 Note: Measurement methods vary by study. Outcomes from published preclinical research.
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Beyond Tissue Healing — 4 highlight cards */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#0A1931]/60">✨ Beyond tissue healing</p>
                <p className="mt-0.5 text-sm text-[#0A1931]/60">Additional research applications.</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {BEYOND_TISSUE_HEALING.map((b) => (
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
                      <h4 className="mt-2 font-bold">Non-Hormonal, Non-Growth Factor Peptide</h4>
                      <p className="mt-3 text-sm text-white/80">
                        BPC-157 is a short peptide fragment without known direct endocrine receptor agonism. No clear signal of carcinogenicity or organ toxicity in short-term animal models, though robust human safety data are lacking.
                      </p>
                      <ul className="mt-4 space-y-1 text-sm text-white/80">
                        <li>• Short stable peptide without anabolic hormone receptor activity</li>
                        <li>• No carcinogenicity signal in short-term animal models</li>
                        <li>• Wide range of tolerated doses in rodents</li>
                        <li>• Not approved as a drug — human use is experimental</li>
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
                      <h4 className="mt-3 font-bold text-[#0A1931]">What Is BPC-157?</h4>
                      <div className="mt-4 rounded-lg bg-[#0A1931]/5 p-4 space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-[#0A1931]/60">Type</span><span className="font-medium">Synthetic pentadecapeptide (gastric peptide fragment)</span></div>
                        <div className="flex justify-between"><span className="text-[#0A1931]/60">CAS</span><span className="font-medium">137525-51-0</span></div>
                        <div className="flex justify-between"><span className="text-[#0A1931]/60">Formula</span><span className="font-medium">C62H98N16O22</span></div>
                        <div className="flex justify-between"><span className="text-[#0A1931]/60">Weight</span><span className="font-medium">~1419.5 g/mol</span></div>
                        <div className="flex justify-between"><span className="text-[#0A1931]/60">Amino acids</span><span className="font-medium">15</span></div>
                        <div className="flex justify-between"><span className="text-[#0A1931]/60">Sequence</span><span className="font-mono text-xs">Gly-Glu-Pro-Pro-Pro-Gly-Lys-Pro-Ala-Asp-Asp-Ala-Gly-Leu</span></div>
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
                          <span className="text-sm font-medium">-20°C • up to 2 years</span>
                        </div>
                        <div className="rounded-lg bg-[#0A1931]/5 p-3 flex items-center gap-2">
                          <span className="text-sm text-[#0A1931]/80">Reconstituted:</span>
                          <span className="text-sm font-medium">2-8°C • up to 30 days</span>
                        </div>
                        <div className="rounded-lg bg-[#0A1931]/5 p-3 flex items-center gap-2">
                          <span className="text-sm text-[#0A1931]/80">Note:</span>
                          <span className="text-sm font-medium">Avoid repeated freeze-thaw</span>
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
                        <div className="flex justify-between"><span>Regulatory</span><span className="font-medium">Not approved by FDA or EMA — research use only</span></div>
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

        {relatedProducts.length > 0 && (
          <div className="mt-16 border-t border-[#0A1931]/10 pt-12">
            <RelatedProducts products={relatedProducts} />
          </div>
        )}
      </div>
    </div>
  )
}
