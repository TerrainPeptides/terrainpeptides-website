'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Beaker, Package, FileText, BookOpen, HelpCircle, ExternalLink } from 'lucide-react'
import type { Product, Vouch } from '@/lib/types'

const GREEN = '#16a34a'

const STAT_CARDS = [
  { value: '24-26%', label: 'BODY WEIGHT REDUCTION', subtext: 'Average loss at high dose over ~1 year in obesity trials' },
  { value: '70-80%', label: 'PATIENTS LOST ≥15%', subtext: 'Proportion achieving at least 15% weight loss on higher doses' },
  { value: '1.5-2.0%', label: 'A1C REDUCTION', subtext: 'Improvement in HbA1c in type 2 diabetes subjects' },
  { value: '10-20%', label: 'LIVER FAT REDUCTION', subtext: 'Relative decrease in hepatic steatosis/NAFLD markers' },
  { value: '>90%', label: 'GI SIDE EFFECTS MILD-MODERATE', subtext: 'Most nausea/vomiting events rated non-serious and transient' },
]

const MECHANISM_NODES = [
  { id: 'gipr', label: 'GIPR', badge: 'Primary', title: 'GIP Receptor Pathway', bullets: ['Enhances glucose-dependent insulin secretion', 'Improves insulin sensitivity and post-prandial glucose', 'Contributes to appetite regulation at CNS level', 'Synergizes with GLP-1 signaling'], color: 'bg-gray-200' },
  { id: 'glp1r', label: 'GLP-1R', badge: 'Strongest', title: 'GLP-1 Receptor Pathway', bullets: ['Slows gastric emptying and increases satiety', 'Stimulates glucose-dependent insulin, suppresses glucagon', 'Lowers fasting and post-prandial glucose', 'Acts in hypothalamic centers to reduce hunger'], color: 'bg-[#16a34a]' },
  { id: 'gcgr', label: 'GCGR', badge: 'Supportive', title: 'Glucagon Receptor Pathway', bullets: ['Increases energy expenditure via hepatic glucose output', 'Promotes weight loss by raising basal metabolic rate', 'Reduces liver fat and improves NAFLD markers', 'Must be carefully titrated to avoid hyperglycemia'], color: 'bg-[#16a34a]/70' },
]

const KEY_DISCOVERY_STATS = [
  { label: 'Weight loss', value: 'Larger & faster', green: true },
  { label: 'Appetite suppression', value: 'Strong', green: true },
  { label: 'Energy expenditure', value: 'Increased', green: true },
  { label: 'Triple receptor', value: 'GIP/GLP-1/GCGR', green: true },
]

const COMPARISON_ROWS = [
  { label: 'Placebo', value: '2-3% loss', bar: 12 },
  { label: 'Lower-dose Retatrutide', value: '10-15% loss', bar: 50 },
  { label: 'High-dose Retatrutide', value: '20-26% loss', bar: 100 },
  { label: 'Patients achieving ≥20% loss', value: '~40-60% of high-dose group', bar: 55 },
]

const KEY_TRIAL_RESULTS = [
  { value: '~70-80%', label: 'Achieved ≥15% weight loss', desc: 'High-dose Retatrutide subjects', percent: 85 },
  { value: '≈1.5-2.0%', label: 'HbA1c reduction', desc: 'Type 2 diabetes subgroup vs baseline', percent: 65 },
  { value: '10-20%', label: 'Liver fat reduction', desc: 'Improvement in hepatic steatosis markers', percent: 50 },
  { value: 'Low', label: 'Serious treatment-related AEs', desc: 'Serious events infrequent and similar to other incretin agents', percent: 15 },
]

const BEYOND_WEIGHT_LOSS = [
  { title: 'Glycemic Control', label: 'METABOLIC', desc: 'Improves fasting and post-meal glucose, lowering HbA1c in type 2 diabetes', highlight: true },
  { title: 'Liver Health', label: 'NAFLD/NASH', desc: 'Reduces liver fat and may improve non-invasive markers of steatohepatitis', highlight: false },
  { title: 'Cardiometabolic Risk', label: 'CARDIOVASCULAR', desc: 'Lowers weight, blood pressure, and lipids, potentially reducing long-term CV risk', highlight: false },
  { title: 'Sleep Apnea & Mobility', label: 'FUNCTIONAL QUALITY OF LIFE', desc: 'Weight loss improves sleep apnea, joint pain, and physical function', highlight: false },
]

const DETAILED_CARDS = [
  { title: 'Metabolic Control & Diabetes', metrics: ['HbA1c ↓1.5-2.0%', 'Fasting glucose ↓ meaningful', 'Insulin dose ↓ in many subjects'], callout: 'Phase 2 showed robust HbA1c drops alongside double-digit percentage weight loss in people with type 2 diabetes.', calloutBorder: 'border-blue-400' },
  { title: 'Liver Fat & NAFLD', metrics: ['Liver fat fraction ↓10-20%', 'ALT/AST ↓ modest', 'NAFLD markers improved'], callout: 'Imaging-based assessments showed meaningful reductions in liver fat in Retatrutide-treated participants versus placebo.', calloutBorder: 'border-[#16a34a]' },
  { title: 'Cardiometabolic & Functional Outcomes', metrics: ['Systolic BP ↓ several mmHg', 'Weight loss 20-25% at top dose', 'Mobility/QoL patient-reported improvement'], callout: 'High-dose Retatrutide produced large sustained weight loss with associated improvements in cardiometabolic risk factors in phase 2 studies.', calloutBorder: 'border-blue-400' },
]

const SAFETY_ROWS = [
  { effect: 'Nausea/Vomiting', freq: '~20-30%', severity: 'MILD-MODERATE' },
  { effect: 'Diarrhea', freq: '~10-20%', severity: 'MILD-MODERATE' },
  { effect: 'Injection-site reactions', freq: '<10%', severity: 'MILD' },
]

const SOURCES = [
  { journal: 'NEW ENGLAND JOURNAL OF MEDICINE', title: 'Once-Weekly Retatrutide for Obesity', meta: '2023 • PMID: 37843258', authors: 'Jastreboff AM, Kaplan LM, et al.', url: 'https://pubmed.ncbi.nlm.nih.gov/37843258/' },
  { journal: 'CELL METABOLISM', title: 'Retatrutide, a GIP/GLP-1/Glucagon Receptor Agonist', meta: '2024 • Phase 2', authors: 'Multiple authors', url: null },
  { journal: 'LANCET DIABETES & ENDOCRINOLOGY', title: 'Triple Agonists for Obesity and Type 2 Diabetes', meta: '2023', authors: 'Lean MEJ, et al.', url: null },
  { journal: 'NATURE REVIEWS ENDOCRINOLOGY', title: 'Emerging Pharmacotherapies for Obesity', meta: '2024', authors: 'Müller TD, et al.', url: null },
]

const FAQ_ITEMS = [
  { q: 'How does Retatrutide compare to GLP-1-only agonists?', a: 'Retatrutide co-activates GIP, GLP-1, and glucagon receptors, producing larger weight loss (~24-26% at top dose) than single or dual agonists in phase 2 trials.' },
  { q: 'What is the typical dosing schedule?', a: 'Phase 2 trials used once-weekly subcutaneous administration with gradual dose escalation over several weeks to improve tolerability.' },
  { q: 'When might Retatrutide be approved?', a: 'As of 2026, Retatrutide remains investigational. Phase 2-3 trials are ongoing for obesity and metabolic disease.' },
]


interface Props {
  product: Product
  vouches?: Vouch[]
}

export function RetatrutideResearch({ product, vouches: _vouches }: Props) {
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
        <p className="mt-0.5 text-sm text-foreground/60">Triple incretin-glucagon co-agonism.</p>
        <div className="mt-4 grid gap-6 lg:grid-cols-5">
          <Card className="border-border/10 lg:col-span-3">
            <CardContent className="p-6">
              <p className="text-xs font-medium uppercase tracking-wider text-foreground/60">The science, simplified</p>
              <h3 className="mt-2 font-bold text-foreground">Triple Receptor Co-Agonism</h3>
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
          <Card className="border-0 bg-[#1C3D2A] lg:col-span-2">
            <CardContent className="p-6 text-white">
              <p className="text-xs font-medium uppercase tracking-wider text-white/70">Key discovery</p>
              <h3 className="mt-2 font-bold">Triple Incretin-Glucagon Co-Agonism</h3>
              <p className="mt-3 text-sm text-white/80">
                Retatrutide co-activates GIP, GLP-1, and glucagon receptors in a single peptide, producing larger and faster weight-loss effects than single or dual agonists in early trials. Balanced activation delivers strong appetite suppression plus increased energy expenditure.
              </p>
              <div className="mt-4 rounded-lg border-l-4 border-[#16a34a] bg-white/10 p-3 text-sm text-white/90">
                &ldquo;Once-weekly Retatrutide produced up to ~25% mean weight loss at higher doses over 48-72 weeks in people with obesity, exceeding results typically seen with existing GLP-1 agonists.&rdquo;
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

      {/* What Research Has Shown — obesity trial + key trial results */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-foreground/60">📊 What research has shown</p>
        <p className="mt-0.5 text-sm text-foreground/60">Summary of preclinical and clinical findings.</p>
        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          <Card className="border-border/10">
            <CardContent className="p-6">
              <span className="rounded-full bg-[#1C3D2A]/5 px-3 py-1 text-xs text-foreground/70">🗓️ Phase 2 Obesity Trial — Adults with Overweight/Obesity</span>
              <p className="mt-4 text-4xl font-bold" style={{ color: GREEN }}>≈24-26% reduction</p>
              <p className="text-xs font-medium uppercase tracking-wider text-foreground/70">Mean body weight loss at top dose after ~1 year</p>
              <p className="mt-4 text-sm font-semibold text-foreground">Weight loss comparison</p>
              <div className="mt-3 space-y-3">
                {COMPARISON_ROWS.map((r) => (
                  <div key={r.label} className="flex items-center gap-3">
                    <span className="w-48 shrink-0 text-xs text-foreground/70">{r.label}</span>
                    <div className="h-3 flex-1 overflow-hidden rounded-full bg-[#1C3D2A]/10">
                      <div className="h-full rounded-full" style={{ width: `${r.bar}%`, backgroundColor: r.bar === 100 ? GREEN : r.bar > 50 ? 'rgba(22,163,74,0.8)' : '#1C3D2A' }} />
                    </div>
                    <span className="text-xs font-medium" style={{ color: r.bar === 100 ? GREEN : undefined }}>{r.value}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs font-medium text-foreground/70">Trial details:</p>
              <div className="mt-1 rounded-lg bg-[#1C3D2A]/5 p-3 text-xs text-foreground/60">
                Adults with obesity were randomized to once-weekly Retatrutide at multiple doses or placebo for approximately 48-72 weeks. Retatrutide arms demonstrated dose-dependent reductions in body weight, waist circumference, glycemic markers, blood pressure, and liver fat. Highest doses achieved ~24-26% mean weight loss. GI adverse events occurred mainly during dose escalation with acceptable discontinuation rates.
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
                      <span className="font-bold text-foreground" style={{ color: GREEN }}>{t.value}</span>
                      <span className="text-foreground/70">{t.label}</span>
                    </div>
                    <p className="text-sm text-foreground/80">{t.desc}</p>
                    <Progress value={t.percent} className="progress-green mt-2 h-2 bg-[#1C3D2A]/10" />
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-lg bg-[#1C3D2A]/5 p-3 text-xs text-foreground/60">
                💡 Note: Outcomes from Phase 2 clinical trials. Phase 3 studies ongoing.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Beyond Weight Loss — 4 highlight cards */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-foreground/60">✨ Beyond weight loss</p>
        <p className="mt-0.5 text-sm text-foreground/60">Additional research applications.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BEYOND_WEIGHT_LOSS.map((b) => (
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
        <p className="mt-0.5 text-sm text-foreground/60">Reported effects from clinical trials.</p>
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
              <h4 className="mt-2 font-bold">Glucose-Dependent Mechanism</h4>
              <p className="mt-3 text-sm text-white/80">
                Retatrutide&apos;s insulinotropic effects are glucose-dependent, lowering the risk of severe hypoglycemia compared with agents that stimulate insulin regardless of blood glucose.
              </p>
              <ul className="mt-4 space-y-1 text-sm text-white/80">
                <li>• GI side effects most common, mostly mild-moderate during dose escalation</li>
                <li>• Low intrinsic risk of hypoglycemia when not combined with insulin or sulfonylureas</li>
                <li>• Monitor for pancreatitis, gallbladder disease, GI intolerance</li>
                <li>• Requires gradual dose titration</li>
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
              <h4 className="mt-3 font-bold text-foreground">What Is Retatrutide?</h4>
              <div className="mt-4 rounded-lg bg-[#1C3D2A]/5 p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-foreground/60">Type</span><span className="font-medium">Synthetic peptide triple agonist (GIP/GLP-1/glucagon receptor agonist)</span></div>
                <div className="flex justify-between"><span className="text-foreground/60">CAS</span><span className="font-medium">Not yet publicly standardized — confirm before publishing</span></div>
                <div className="flex justify-between"><span className="text-foreground/60">Formula</span><span className="font-medium">Proprietary large peptide analog</span></div>
                <div className="flex justify-between"><span className="text-foreground/60">Weight</span><span className="font-medium">High-kilodalton peptide — confirm from primary source</span></div>
                <div className="flex justify-between"><span className="text-foreground/60">Amino acids</span><span className="font-medium">Modified sequence engineered for triple receptor affinity and extended half-life</span></div>
                <div className="flex justify-between"><span className="text-foreground/60">Sequence</span><span className="font-medium">Proprietary — not generally reported in clinical trial summaries</span></div>
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
                  <span className="text-sm text-foreground/80">Storage:</span>
                  <span className="text-sm font-medium">Refrigerated sterile solution</span>
                </div>
                <div className="rounded-lg bg-[#1C3D2A]/5 p-3 flex items-center gap-2">
                  <span className="text-sm text-foreground/80">Protect:</span>
                  <span className="text-sm font-medium">From light</span>
                </div>
                <div className="rounded-lg bg-[#1C3D2A]/5 p-3 flex items-center gap-2">
                  <span className="text-sm text-foreground/80">Note:</span>
                  <span className="text-sm font-medium">Do not freeze</span>
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
                <div className="flex justify-between"><span>Regulatory</span><span className="font-medium">Investigational — Phase 2-3 development for obesity and metabolic disease</span></div>
                <div className="flex justify-between"><span>Approval</span><span className="font-medium">Not approved in US, Canada, or EU as of 2026</span></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sources & References */}
      <div>
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-foreground/60" />
          <p className="text-xs font-medium uppercase tracking-wider text-foreground/60">Sources & References</p>
        </div>
        <p className="mt-0.5 text-sm text-foreground/60">Peer-reviewed research.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SOURCES.map((s) => (
            <Card key={s.title} className="border-border/10 transition-transform duration-150 ease-out hover:scale-[1.02]">
              <CardContent className="p-5">
                <p className="text-xs font-medium uppercase tracking-wider" style={{ color: GREEN }}>{s.journal}</p>
                <h4 className="mt-2 font-bold text-foreground">{s.title}</h4>
                <p className="mt-1 text-xs text-foreground/60">{s.meta}</p>
                <p className="mt-1 text-xs italic text-foreground/60">{s.authors}</p>
                {s.url && (
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm font-medium" style={{ color: GREEN }}>
                    <ExternalLink className="h-3.5 w-3.5" />
                    View Source
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div>
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-foreground/60" />
          <p className="text-xs font-medium uppercase tracking-wider text-foreground/60">Frequently Asked Questions</p>
        </div>
        <p className="mt-0.5 text-sm text-foreground/60">Common questions about Retatrutide research.</p>
        <div className="mt-4 space-y-4">
          {FAQ_ITEMS.map((faq) => (
            <Card key={faq.q} className="border-border/10">
              <CardContent className="p-6">
                <h4 className="font-bold text-foreground">{faq.q}</h4>
                <p className="mt-2 text-sm text-foreground/80">{faq.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
