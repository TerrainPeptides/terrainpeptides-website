'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Beaker, Package, FileText } from 'lucide-react'
import type { Product, Vouch } from '@/lib/types'

const GREEN = '#16a34a'

const STAT_CARDS = [
  { value: '2.6 kg', label: 'AVERAGE WEIGHT LOSS', subtext: 'Real human trial, 12 weeks — vs only 0.8 kg on placebo' },
  { value: 'No IGF-1 Rise', label: 'FAT LOSS WITHOUT HORMONE SPILLOVER', subtext: 'Burns fat without triggering the broad hormone effects of regular growth hormone' },
  { value: '6 RCTs', label: 'HUMAN TRIALS COMPLETED', subtext: 'Actually tested on real humans — not just animals' },
  { value: 'Placebo-Like', label: 'TOLERABILITY', subtext: 'Side effect profile in trials was nearly identical to a fake injection' },
  { value: '15 AA', label: 'PEPTIDE LENGTH', subtext: 'A short, targeted 15 amino acid fragment — built specifically for fat metabolism' },
]

const MECHANISM_NODES = [
  { id: 'lipolysis', label: 'LIPOLYSIS', title: 'Direct Fat Breakdown Signal', sub: 'Primary', color: 'bg-gray-200', bullets: ['Activates the pathways that tell your fat cells to release stored fat as energy', 'Targets adipose tissue (body fat) directly without broad anabolic (muscle-building hormone) effects', 'Creates a leaner metabolic environment — your body starts burning stored fat more readily', 'More targeted than full growth hormone — does one job and does it cleanly'] },
  { id: 'beta3', label: 'BETA-3', title: 'Fat Oxidation Pathway', sub: 'Strong', color: 'bg-[#16a34a]', bullets: ['Modulates β3-adrenergic receptors (the molecular switches on fat cells that control fat burning)', 'Increases fat oxidation — stored fat gets converted to fuel instead of sitting there', 'May support higher energy expenditure (calories burned at rest) in preclinical models', 'This is the main reason AOD-9604 has a reputation as a fat-loss peptide'] },
  { id: 'igf1spare', label: 'IGF1-SPARE', title: 'Selective GH Fragment Action', sub: 'Moderate', color: 'bg-[#16a34a]/70', bullets: ['Acts without raising IGF-1 (insulin-like growth factor — the hormone that drives growth and can cause side effects at high levels)', 'Avoids the broad endocrine (hormonal system) effects of full growth hormone', 'Keeps the fat-loss signal without triggering a whole-body hormone response', 'That selectivity is the main thing that separates it from other GH-related compounds'] },
]

const COMPARISON_ROWS = [
  { label: 'AOD-9604 group', value: '2.6 kg average weight loss', bar: 100 },
  { label: 'Placebo group', value: '0.8 kg average weight loss', bar: 31 },
  { label: 'IGF-1 change', value: 'No meaningful increase', bar: 100 },
  { label: 'Tolerability', value: 'Placebo-like across all trial arms', bar: 100 },
]

const KEY_TRIAL_STATS = [
  { display: '2.6 kg', percent: 100, label: 'Real Weight Loss', desc: 'More than 3x the result of placebo in the same 12-week window' },
  { display: 'No IGF-1 Rise', percent: 100, label: 'Clean Hormone Profile', desc: 'Fat-loss benefits without the broad hormonal effects of full GH' },
  { display: 'Placebo-Like', percent: 100, label: 'Safety Profile', desc: 'Side effects in human trials were nearly identical to a fake injection' },
]

const BEYOND_FAT_LOSS = [
  { title: 'Body Recomposition', label: 'BODY COMPOSITION', desc: 'Supports a leaner look when combined with training and nutrition', highlight: true },
  { title: 'Metabolic Cleanliness', label: 'SELECTIVE SIGNALING', desc: 'No meaningful IGF-1 response — cleaner than full GH compounds', highlight: false },
  { title: 'Practical Tolerability', label: 'HUMAN SAFETY DATA', desc: 'One of the better-tolerated research peptides with actual human trial data', highlight: false },
  { title: 'Recovery Support', label: 'TISSUE SUPPORT', desc: 'Some summaries suggest secondary tissue-supportive effects — weaker evidence but worth noting', highlight: false },
]

const DETAILED_CARDS = [
  { title: 'Real Weight Loss in Human Trials', metrics: ['Weight loss → 2.6 kg average over 12 weeks', 'vs Placebo → 0.8 kg in same period', 'Trial length → 12 weeks randomized'], callout: 'AOD-9604 outperformed placebo by more than 3x in a 12-week human obesity trial.', calloutBorder: 'border-blue-400' },
  { title: 'Lean Physique Support', metrics: ['Fat mobilization → ↑ via lipolysis activation', 'Body composition → Improved trend in trial summaries', 'Best use case → Gradual recomposition support'], callout: 'Most useful for people chasing a tighter, leaner look over weeks — not overnight results.', calloutBorder: 'border-[#16a34a]' },
  { title: 'Selective Hormone Profile', metrics: ['IGF-1 response → No meaningful rise', 'Endocrine disruption → Not observed in trials', 'vs Full GH compounds → Significantly cleaner profile'], callout: 'No IGF-1 rise confirmed across human trials — AOD-9604 delivers targeted fat-loss signaling without hormonal spillover.', calloutBorder: 'border-blue-400' },
]

const SAFETY_ROWS = [
  { effect: 'Headache', freq: 'Mild', severity: 'MILD' },
  { effect: 'Minor GI upset', freq: 'Mild', severity: 'MILD' },
  { effect: 'Injection-site discomfort', freq: 'Mild', severity: 'MILD' },
]


interface Props {
  product: Product
  vouches?: Vouch[]
}

export function Aod9604Research({ product, vouches: _vouches }: Props) {
  return (
    <div
      className="space-y-12 text-[1.1em] text-foreground"
      role="region"
      aria-label={`${product.name} research`}
    >
      {/* Stat cards — 5 cards */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-foreground/60">✨ Clinical outcomes</p>
        <p className="mt-0.5 text-sm text-foreground/60">Key research metrics.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
        <p className="mt-0.5 text-sm text-foreground/60">Lipolysis, beta-3 receptors, and selective GH signaling.</p>
        <div className="mt-4 grid gap-6 lg:grid-cols-5">
          <Card className="border-border/10 lg:col-span-3">
            <CardContent className="p-6">
              <p className="text-xs font-medium uppercase tracking-wider text-foreground/60">The science, simplified</p>
              <h3 className="mt-2 font-bold text-foreground">How AOD-9604 Drives Fat Loss</h3>
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
          <Card className="border-0 bg-[primary] lg:col-span-2">
            <CardContent className="p-6 text-white">
              <p className="text-xs font-medium uppercase tracking-wider text-white/70">Key discovery</p>
              <h3 className="mt-2 font-bold">Fat Loss Signal. Nothing Else.</h3>
              <p className="mt-3 text-sm text-white/80">
                AOD-9604 is a fragment of growth hormone — specifically the part responsible for fat breakdown. It activates fat-burning pathways directly without raising IGF-1 or triggering broad hormonal effects.
              </p>
              <div className="mt-4 rounded-lg border-l-4 border-[#16a34a] bg-white/10 p-3 text-sm text-white/90">
                &ldquo;AOD-9604 produced measurable fat loss in human trials with a tolerability profile nearly identical to placebo — no serious endocrine disruption observed.&rdquo;
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Clinical Stat — 12-Week Human Obesity Trial + right side */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-foreground/60">📊 What research has shown</p>
        <p className="mt-0.5 text-sm text-foreground/60">Summary of clinical findings.</p>
        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          <Card className="border-border/10">
            <CardContent className="p-6">
              <span className="rounded-full bg-primary/5 px-3 py-1 text-xs text-foreground/70">12-Week Randomized Human Obesity Trial</span>
              <p className="mt-4 text-4xl font-bold" style={{ color: GREEN }}>2.6 kg</p>
              <p className="text-xs font-medium uppercase tracking-wider text-foreground/70">AVERAGE WEIGHT LOSS VS 0.8 KG ON PLACEBO</p>
              <div className="mt-4 text-sm font-semibold text-foreground">Comparison rows</div>
              <div className="mt-3 space-y-3">
                {COMPARISON_ROWS.map((r) => (
                  <div key={r.label} className="flex items-center gap-3">
                    <span className="w-40 shrink-0 text-xs text-foreground/70">{r.label}</span>
                    <div className="h-3 flex-1 overflow-hidden rounded-full bg-primary/10">
                      <div className="h-full rounded-full" style={{ width: `${r.bar}%`, backgroundColor: GREEN }} />
                    </div>
                    <span className="shrink-0 text-xs font-medium" style={{ color: GREEN }}>{r.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-lg bg-primary/5 p-3 text-xs text-foreground/60">
                In a 12-week human obesity trial, AOD-9604 produced more than 3x the weight loss of placebo with a clean safety profile. No significant IGF-1 rise was detected — confirming its selective fat-loss mechanism.
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
                    <Progress value={t.percent} className="progress-green mt-2 h-2 bg-primary/10" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Beyond Fat Loss — 4 cards */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-foreground/60">✨ Beyond fat loss</p>
        <p className="mt-0.5 text-sm text-foreground/60">Additional research applications.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BEYOND_FAT_LOSS.map((b) => (
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
                <div className={`mt-4 rounded-lg border-l-4 ${d.calloutBorder} bg-primary/5 p-3 text-xs text-foreground/80`}>
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
        <p className="mt-0.5 text-sm text-foreground/60">Reported effects from human trials.</p>
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
          <Card className="border-0 bg-[primary]">
            <CardContent className="p-6 text-white">
              <p className="text-xs font-medium uppercase tracking-wider text-white/70">Safety advantage</p>
              <h4 className="mt-2 font-bold">Placebo-Like Tolerability in Human Trials</h4>
              <p className="mt-3 text-sm text-white/80">
                Clinical summaries show side effects nearly identical to placebo — one of the cleaner safety profiles in research peptides.
              </p>
              <ul className="mt-4 space-y-1 text-sm text-white/80">
                <li>• No meaningful IGF-1 rise — avoids the main hormonal risk of GH-related compounds</li>
                <li>• No serious safety signals across 6 randomized controlled trials</li>
                <li>• Human data still limited compared to approved drugs — use responsibly</li>
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
              <h4 className="mt-3 font-bold text-foreground">What Is AOD-9604?</h4>
              <div className="mt-4 rounded-lg bg-primary/5 p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-foreground/60">Type</span><span className="font-medium">Synthetic HGH fragment peptide (residues 177-191 of human growth hormone)</span></div>
                <div className="flex justify-between"><span className="text-foreground/60">CAS</span><span className="font-medium">221231-10-3</span></div>
                <div className="flex justify-between"><span className="text-foreground/60">Formula</span><span className="font-medium">Not widely disclosed — confirm from supplier COA</span></div>
                <div className="flex justify-between"><span className="text-foreground/60">Weight</span><span className="font-medium">1769.1 Da</span></div>
                <div className="flex justify-between"><span className="text-foreground/60">Amino acids</span><span className="font-medium">15</span></div>
                <div className="flex justify-between"><span className="text-foreground/60">Sequence</span><span className="font-mono text-xs">hGH residues 177-191</span></div>
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
                <div className="rounded-lg bg-primary/5 p-3 flex items-center gap-2">
                  <span className="text-sm text-foreground/80">Lyophilized:</span>
                  <span className="text-sm font-medium">Stable at room temp • Protect from light</span>
                </div>
                <div className="rounded-lg bg-primary/5 p-3 flex items-center gap-2">
                  <span className="text-sm text-foreground/80">Reconstituted:</span>
                  <span className="text-sm font-medium">Refrigerate • Protect from light</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-[primary]">
            <CardContent className="p-6 text-white">
              <p className="text-xs font-medium uppercase tracking-wider text-white/70 flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" /> REGULATORY STATUS
              </p>
              <h4 className="mt-3 font-bold">Where It Stands</h4>
              <div className="mt-4 space-y-2 text-sm text-white/80">
                <div className="flex justify-between"><span>Regulatory</span><span className="font-medium">Research use only — not approved as a treatment</span></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
