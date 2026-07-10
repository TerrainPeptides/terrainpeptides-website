'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Beaker, Package, FileText } from 'lucide-react'
import type { Product, Vouch } from '@/lib/types'

const GREEN = '#16a34a'

const STAT_CARDS = [
  { value: '4x', label: 'MELANOCORTIN RECEPTOR AFFINITY', subtext: 'Higher potency vs endogenous α-MSH at MC1/MC4 in vitro' },
  { value: '↑↑', label: 'MELANOGENESIS SIGNALING', subtext: 'Robust activation of MC1R linked to increased eumelanin production' },
  { value: 'MULTI', label: 'RECEPTOR TARGET', subtext: 'Agonist at MC1, MC3, MC4, MC5 receptors' },
  { value: '>1000 Da', label: 'PEPTIDE SIZE', subtext: 'High-molecular-weight cyclic heptapeptide analogue of α-MSH' },
  { value: '0', label: 'FORMAL DRUG APPROVALS', subtext: 'No marketing authorization from major regulators' },
]

const MECHANISM_NODES = [
  { id: 'mc1r', label: 'MC1R', badge: 'Primary', title: 'MC1R Melanogenesis Pathway', sub: 'Melanogenesis & Pigmentation', bullets: ['Binds MC1 receptors on melanocytes as non-selective melanocortin agonist', 'Activates cAMP/PKA signaling mimicking endogenous α-MSH', 'Upregulates eumelanin synthesis leading to darker pigmentation', 'Main driver of the tanning effect'], color: 'bg-gray-200' },
  { id: 'mc4r', label: 'MC4R', badge: 'Strongest', title: 'MC4R Sexual & Central Effects', sub: 'Sexual & Central Signaling', bullets: ['Acts as agonist at hypothalamic MC4 receptors', 'MC4R activation linked to increased sexual arousal and erectile responses', 'Central melanocortin signaling influences appetite and energy balance', 'Pro-sexual effects primarily attributed to MC4R activity'], color: 'bg-[#16a34a]' },
  { id: 'mc3mc5', label: 'MC3/MC5', badge: 'Supportive', title: 'Peripheral Melanocortin Modulation', sub: 'Energy & Peripheral', bullets: ['Non-selective agonism includes MC3 and MC5 receptors', 'MC3R involved in energy homeostasis and autonomic regulation', 'MC5R expressed in exocrine glands modulating sebaceous secretions', 'May contribute to off-target systemic effects beyond tanning'], color: 'bg-[#16a34a]/70' },
]

const KEY_DISCOVERY_BODY = 'MT-2 was developed as a cyclic analogue of α-MSH to achieve higher receptor potency and longer duration than the native hormone. It shows strong agonist activity at MC1 and MC4 receptors, linking it both to pigmentation and centrally mediated sexual effects.'

const KEY_DISCOVERY_QUOTE = 'Melanotan II acts as a non-selective agonist of melanocortin receptors MC1, MC3, MC4, and MC5. Melanogenesis is produced via MC1, whereas its documented sexual effects are thought to be related to MC4 activation.'

const COMPARISON_ROWS = [
  { label: 'Pigmentation response', value: 'Marked ↑ vs baseline in human volunteer and animal studies', bar: 100 },
  { label: 'Latency to erectile response', value: 'Reduced latency reported in early clinical observations', bar: 85 },
  { label: 'Duration of effect', value: 'Prolonged receptor activation vs native α-MSH due to cyclic structure', bar: 75 },
  { label: 'Regulatory acceptance', value: '0% — not approved as therapeutic drug by major agencies', bar: 0 },
]

const RIGHT_SIDE_FINDINGS = [
  { badge: 'Consistent', title: 'Increased Pigmentation', desc: 'Most exposed subjects show visible darkening over time' },
  { badge: 'Observed', title: 'Sexual Arousal Effects', desc: 'Erectile and libido responses reported in early human studies' },
  { badge: 'Unclear', title: 'Long-Term Risk', desc: 'No definitive melanoma link but case reports and theoretical risk remain' },
]

const BEYOND_PIGMENTATION = [
  { title: 'Sexual Function', label: 'CENTRAL MELANOCORTIN', desc: 'MT-2 stimulates MC4R pathways implicated in erectile responses and libido', highlight: true },
  { title: 'Energy & Appetite', label: 'METABOLIC SIGNALING', desc: 'Central melanocortin receptors modulate food intake and energy expenditure', highlight: false },
  { title: 'Photoprotection Potential', label: 'UV DEFENSE (THEORETICAL)', desc: 'Increased eumelanin may improve UV absorption and reduce burning propensity', highlight: false },
  { title: 'Research Tool', label: 'RECEPTOR PROBING', desc: 'Used experimentally to probe melanocortin receptor pharmacology and downstream pathways', highlight: false },
]

const DETAILED_CARDS = [
  { title: 'Nootropic/CNS Effects (Exploratory)', metrics: ['Alertness → Variable anecdotal', 'Mood → Not systematically quantified'], callout: 'Preclinical work with melanocortin agonists shows broad central effects, but MT-2-specific human cognitive trials are lacking.', calloutBorder: 'border-blue-400' },
  { title: 'Sexual Function Modulation', metrics: ['Erectile response → ↑ vs baseline in small studies', 'Dose-response → Not standardized clinically'], callout: 'Early phase work with MT-2-like agonists informed later development of selective MC4R agonists for sexual dysfunction research.', calloutBorder: 'border-[#16a34a]' },
  { title: 'Pigmentation & UV Handling', metrics: ['Skin tone → Noticeable darkening in many users', 'Sunburn threshold → Potential ↑ not quantified in large trials'], callout: 'Reviews note enhanced pigmentation but conclude long-term melanoma risk and photoprotection benefits remain uncertain.', calloutBorder: 'border-blue-400' },
]

const SAFETY_ROWS = [
  { effect: 'Nausea & Flushing', freq: '20-30%', severity: 'MILD-MODERATE' },
  { effect: 'Darkening of Nevi/Focal Pigmentation', freq: 'Unknown%', severity: 'POTENTIALLY CONCERNING' },
  { effect: 'Increased Blood Pressure/Heart Rate', freq: 'Unknown%', severity: 'MODERATE RISK' },
  { effect: 'Injection-site Reactions', freq: 'Common with off-label use', severity: 'MILD' },
]


interface Props {
  product: Product
  vouches?: Vouch[]
}

export function Mt2Research({ product, vouches: _vouches }: Props) {
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

      {/* How it Works — mechanism diagram + Key Discovery */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-foreground/60">🧬 How it works</p>
        <p className="mt-0.5 text-sm text-foreground/60">Non-selective melanocortin receptor agonism.</p>
        <div className="mt-4 grid gap-6 lg:grid-cols-5">
          <Card className="border-border/10 lg:col-span-3">
            <CardContent className="p-6">
              <p className="text-xs font-medium uppercase tracking-wider text-foreground/60">The science, simplified</p>
              <h3 className="mt-2 font-bold text-foreground">Multi-Receptor Melanocortin Agonism</h3>
              <div className="mt-6 flex flex-wrap items-start justify-between gap-6">
                {MECHANISM_NODES.map((n) => (
                  <div key={n.id} className="flex flex-1 min-w-[140px] flex-col items-center text-center">
                    <div className={`h-14 w-14 rounded-full ${n.color} flex items-center justify-center text-xs font-semibold text-foreground`}>{n.label}</div>
                    <p className="mt-1 text-xs font-medium uppercase tracking-wider text-foreground/60">{n.badge}</p>
                    <p className="mt-2 font-semibold text-foreground">{n.title}</p>
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
              <h3 className="mt-2 font-bold">Non-Selective Melanocortin Agonism</h3>
              <p className="mt-3 text-sm text-white/80">
                {KEY_DISCOVERY_BODY}
              </p>
              <div className="mt-4 rounded-lg border-l-4 border-[#16a34a] bg-white/10 p-3 text-sm text-white/90">
                &ldquo;{KEY_DISCOVERY_QUOTE}&rdquo;
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* What Research Has Shown */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-foreground/60">📊 What research has shown</p>
        <p className="mt-0.5 text-sm text-foreground/60">Summary of early human and preclinical melanocortin research.</p>
        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          <Card className="border-border/10">
            <CardContent className="p-6">
              <span className="rounded-full bg-primary/5 px-3 py-1 text-xs text-foreground/70">Early Human and Preclinical Melanocortin Research</span>
              <p className="mt-4 text-4xl font-bold" style={{ color: GREEN }}>Robust activation</p>
              <p className="text-xs font-medium uppercase tracking-wider text-foreground/70">Of MC1/MC4 melanocortin receptors in vitro and in vivo models</p>
              <div className="mt-4 text-sm font-semibold text-foreground">Comparison</div>
              <div className="mt-3 space-y-3">
                {COMPARISON_ROWS.map((r) => (
                  <div key={r.label} className="flex items-center gap-3">
                    <span className="w-48 shrink-0 text-xs text-foreground/70">{r.label}</span>
                    <div className="h-3 flex-1 overflow-hidden rounded-full bg-primary/10">
                      <div className="h-full rounded-full" style={{ width: `${r.bar}%`, backgroundColor: r.bar > 0 ? GREEN : 'primary' }} />
                    </div>
                    <span className="text-xs font-medium text-foreground/80">{r.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-lg bg-primary/5 p-3 text-xs text-foreground/60">
                MT-2 originated from academic programs exploring synthetic α-MSH analogues to increase tanning and investigate centrally mediated sexual responses. Controlled investigations describe increased skin pigmentation and sexual arousal, but trials have been small and heterogeneous, not pursued through full regulatory pathways, so effect sizes and population-level safety are not fully characterized.
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/10">
            <CardContent className="p-6">
              <p className="text-xs font-medium uppercase tracking-wider text-foreground/60">📝 Findings</p>
              <h3 className="mt-2 font-bold text-foreground">Key Findings</h3>
              <div className="mt-6 space-y-6">
                {RIGHT_SIDE_FINDINGS.map((f) => (
                  <div key={f.title}>
                    <div className="flex items-center gap-2">
                      <span className={`rounded px-2 py-0.5 text-xs font-medium ${
                        f.badge === 'Consistent' ? 'bg-[#16a34a]/20 text-[#16a34a]' :
                        f.badge === 'Observed' ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>{f.badge}</span>
                      <span className="font-bold text-foreground">{f.title}</span>
                    </div>
                    <p className="mt-2 text-sm text-foreground/80">{f.desc}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-lg bg-primary/5 p-3 text-xs text-foreground/60">
                💡 Note: Outcomes from early human and preclinical research. Effect sizes not fully characterized.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Beyond Pigmentation — 4 highlight cards */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-foreground/60">✨ Beyond pigmentation</p>
        <p className="mt-0.5 text-sm text-foreground/60">Additional research applications.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BEYOND_PIGMENTATION.map((b) => (
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
        <p className="mt-0.5 text-sm text-foreground/60">Reported effects from early studies and off-label use.</p>
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
              <p className="text-xs font-medium uppercase tracking-wider text-white/70">Safety consideration</p>
              <h4 className="mt-2 font-bold">Non-Hormonal Peptide Mechanism</h4>
              <p className="mt-3 text-sm text-white/80">
                MT-2 acts on melanocortin receptors rather than classical steroid hormone receptors, so it does not behave like an anabolic steroid or sex hormone, but this does not equate to proven long-term safety.
              </p>
              <ul className="mt-4 space-y-1 text-sm text-white/80">
                <li>• Sold as unapproved research peptide — quality and purity highly variable</li>
                <li>• Regulatory agencies have not established standardized dosing or contraindications</li>
                <li>• Case reports describe sudden changes in moles — causality unproven</li>
                <li>• Users frequently report side effects and uncertainty about long-term risks</li>
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
              <h4 className="mt-3 font-bold text-foreground">What Is MT-2?</h4>
              <div className="mt-4 rounded-lg bg-primary/5 p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-foreground/60">Type</span><span className="font-medium">Synthetic cyclic heptapeptide, α-MSH analogue</span></div>
                <div className="flex justify-between"><span className="text-foreground/60">CAS</span><span className="font-medium">121062-08-6</span></div>
                <div className="flex justify-between"><span className="text-foreground/60">Formula</span><span className="font-medium">C52H73N15O11</span></div>
                <div className="flex justify-between"><span className="text-foreground/60">Weight</span><span className="font-medium">≈1084.2 g/mol</span></div>
                <div className="flex justify-between"><span className="text-foreground/60">Amino acids</span><span className="font-medium">Ac-Nle-Asp-His-D-Phe-Arg-Trp-Lys-NH2 (cyclic lactam between Asp and Lys)</span></div>
                <div className="flex justify-between"><span className="text-foreground/60">Sequence</span><span className="font-mono text-xs">Ac-Nle-cyclo[Asp-His-D-Phe-Arg-Trp-Lys]-NH2</span></div>
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
                  <span className="text-sm font-medium">Frozen -20°C</span>
                </div>
                <div className="rounded-lg bg-primary/5 p-3 flex items-center gap-2">
                  <span className="text-sm text-foreground/80">Reconstituted:</span>
                  <span className="text-sm font-medium">Refrigerated after reconstitution</span>
                </div>
                <div className="rounded-lg bg-primary/5 p-3 flex items-center gap-2">
                  <span className="text-sm text-foreground/80">Note:</span>
                  <span className="text-sm font-medium">Follow supplier COA</span>
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
                <div className="flex justify-between"><span>Regulatory</span><span className="font-medium">No MT-2 product has marketing authorization from FDA or EMA — sold as research chemical only</span></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
