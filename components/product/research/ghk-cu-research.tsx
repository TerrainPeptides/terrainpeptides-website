'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { Product, Vouch } from '@/lib/types'

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

interface Props {
  product: Product
  vouches?: Vouch[]
}

export function GhkCuResearch({ product, vouches: _vouches }: Props) {
  return (
    <div
      className="space-y-12 text-[1.1em] text-foreground"
      role="region"
      aria-label={`${product.name} research`}
    >
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
    </div>
  )
}
