'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Beaker, Package, FileText } from 'lucide-react'
import type { Product, Vouch } from '@/lib/types'

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
      <span className="w-36 shrink-0 text-xs leading-snug text-foreground/70 sm:w-48">{label}</span>
      <div className="h-3 min-w-0 flex-1 overflow-hidden rounded-full bg-primary/10">
        <div className="h-full rounded-full" style={{ width: `${barWidth}%`, backgroundColor: barColor }} />
      </div>
      <span className="shrink-0 text-xs font-medium" style={{ color: barColor }}>
        {value}
      </span>
    </div>
  )
}

interface Props {
  product: Product
  vouches?: Vouch[]
}

export function SemaxResearch({ product, vouches: _vouches }: Props) {
  return (
    <div
      className="space-y-12 text-[1.1em] text-foreground"
      role="region"
      aria-label={`${product.name} research`}
    >
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

      {/* How it Works — mechanism diagram + Key Discovery (matches GHK-Cu layout) */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-foreground/60">
          🧬 How Semax Works
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
              <h3 className="mt-2 font-bold text-foreground">Multi-Pathway Brain Support</h3>
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
          <Card className="border-0 bg-[primary] lg:col-span-2">
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
        <p className="text-xs font-medium uppercase tracking-wider text-foreground/60">
          📊 What Research Has Shown
        </p>
        <p className="mt-0.5 text-sm text-foreground/60">Real results from real studies</p>
        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          <Card className="border-border/10">
            <CardContent className="p-6">
              <span className="rounded-full bg-primary/5 px-3 py-1 text-xs text-foreground/70">
                🗓️ Russian Clinical Trial — Healthy Volunteers & Stroke Patients
              </span>
              <p className="mt-4 text-4xl font-bold" style={{ color: GREEN }}>
                80%
              </p>
              <p className="text-xs font-medium uppercase tracking-wider text-foreground/70">
                OF USERS PERFORMED BETTER ON MEMORY AND FOCUS TESTS AFTER 5 DAYS
              </p>
              <p className="mt-4 text-sm font-semibold text-foreground">Clinical comparison</p>
              <div className="mt-3 space-y-3">
                {COMPARISON_ROWS.map((row) => (
                  <div key={row.label} className="flex items-center gap-2 sm:gap-3">
                    <span className="w-28 shrink-0 text-xs leading-snug text-foreground/70 sm:w-40">
                      {row.label}
                    </span>
                    <div className="h-3 min-w-0 flex-1 overflow-hidden rounded-full bg-primary/10">
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
              <p className="mt-4 text-sm leading-relaxed text-foreground/80">
                In controlled Russian clinical trials, healthy volunteers and stroke recovery patients were
                given Semax intranasally over 5 to 14 days. Researchers measured memory recall, attention
                span, cognitive processing speed, and brain growth factor levels. Every group showed
                significant improvement over placebo. Results were so consistent that Russia approved Semax as
                a prescription drug for cognitive impairment and stroke recovery — one of the only peptides
                in the world to achieve that status.
              </p>
              <div className="mt-4 rounded-lg bg-primary/5 p-3 text-xs text-foreground/60">
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
                {KEY_TRIAL_FINDINGS.map((t) => (
                  <div key={t.label}>
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-foreground">{t.stat}</span>
                      <span className="max-w-[55%] text-right text-foreground/70">{t.label}</span>
                    </div>
                    <p className="text-sm text-foreground/80">{t.sub}</p>
                    <Progress
                      value={t.progress}
                      className="progress-green mt-2 h-2 bg-primary/10"
                    />
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-lg bg-primary/5 p-3 text-xs text-foreground/60">
                💡 Note: Measurement methods vary by study. Outcomes from published clinical and preclinical
                research.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Beyond Focus — same pattern as BPC/Retatrutide “Beyond …” + detailed column cards */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-foreground/60">
          ✨ Beyond focus
        </p>
        <p className="mt-0.5 text-sm text-foreground/60">
          Other areas Semax has shown results in research
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BEYOND_FOCUS_HIGHLIGHTS.map((b) => (
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
          {BEYOND_DETAILED_CARDS.map((d) => (
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
                  className={`mt-4 rounded-lg border-l-4 ${d.calloutBorder} bg-primary/5 p-3 text-xs text-foreground/80`}
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
                    {SAFETY_TABLE_ROWS.map((r) => (
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
        <p className="text-xs font-medium uppercase tracking-wider text-foreground/60">
          ✅ Safety advantages
        </p>
        <p className="mt-0.5 text-sm text-foreground/60">
          Mechanistic reasons Semax is well tolerated in research.
        </p>
        <div className="mt-4 grid gap-6 lg:grid-cols-3">
          {SAFETY_ADVANTAGE_CARDS.map((c) => (
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

      {/* Risk vs alternatives — comparison bars */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-foreground/60">
          📊 Side effect risk
        </p>
        <p className="mt-0.5 text-sm font-semibold text-foreground">
          How Semax Compares to Common Alternatives
        </p>
        <Card className="mt-4 border-border/10">
          <CardContent className="p-6">
            <div className="rounded-xl border border-green-600/25 bg-green-600/[0.06] p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Semax
              </p>
              <p className="mt-0.5 text-xs text-foreground/60">This product — reported risk in research</p>
              <div className="mt-4">
                <RiskComparisonBarRow
                  label={RISK_SEMAX_ROW.label}
                  value={RISK_SEMAX_ROW.value}
                  barWidth={RISK_SEMAX_ROW.barWidth}
                  barColor={RISK_SEMAX_ROW.barColor}
                />
              </div>
            </div>

            <div className="mt-8 border-t border-border/10 pt-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-foreground/70">
                Common alternatives
              </p>
              <p className="mt-0.5 text-xs text-foreground/60">
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
    </div>
  )
}
