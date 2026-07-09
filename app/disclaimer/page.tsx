import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Research Disclaimer | Terrain Peptides',
  description:
    'Important research-use-only disclaimers, age requirements, and liability limitations for Terrain Peptides products.',
}

const sections = [
  {
    title: 'Research Use Only',
    body: 'All products sold by Terrain Peptides are intended strictly for laboratory and in-vitro research purposes. These products are not intended for human or animal consumption, therapeutic use, or clinical application of any kind.',
  },
  {
    title: 'Not FDA Evaluated',
    body: 'These products have not been evaluated or approved by the U.S. Food and Drug Administration (FDA) or any other regulatory authority. They are not intended to diagnose, treat, cure, or prevent any disease or medical condition.',
  },
  {
    title: 'Not for Human Consumption',
    body: 'By purchasing from Terrain Peptides, you confirm that you are a qualified researcher or professional purchasing these compounds solely for scientific research. These products must not be used on or administered to humans or animals.',
  },
  {
    title: 'Age Requirement',
    body: 'You must be 18 years of age or older to purchase from this site.',
  },
  {
    title: 'Compliance with Local Laws',
    body: 'You are solely responsible for ensuring that the purchase, possession, and use of any product complies with all applicable federal, state, and local laws and regulations in your jurisdiction.',
  },
  {
    title: 'Limitation of Liability',
    body: 'Terrain Peptides shall not be held liable for any misuse, injury, or damage arising from the purchase or use of any product sold on this site. All sales are final and made with the understanding that the buyer assumes full responsibility.',
  },
  {
    title: 'No Medical Advice',
    body: 'Nothing on this website constitutes medical advice. Always consult a licensed healthcare professional before making any health-related decisions.',
  },
] as const

export default function DisclaimerPage() {
  return (
    <div className="bg-background">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <header className="mb-12 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">
            Research Disclaimer
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-black/60">
            Please read carefully before purchasing. By placing an order, you acknowledge and agree to
            the terms below.
          </p>
        </header>

        <div className="space-y-8">
          {sections.map((section) => (
            <article key={section.title} className="space-y-3">
              <div className="inline-flex rounded-md border border-[#0A1628]/12 bg-[#0A1628]/[0.04] px-4 py-2 backdrop-blur-sm">
                <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-black">
                  {section.title}
                </h2>
              </div>
              <p className="text-base leading-relaxed text-foreground/85">{section.body}</p>
            </article>
          ))}
        </div>

        <p className="mt-14 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          Last updated {new Date().getFullYear()}. For questions, contact{' '}
          <a href="mailto:support@terrainpeptides.com" className="font-medium text-[#0A1628] hover:underline">
            support@terrainpeptides.com
          </a>
          .
        </p>
      </div>
    </div>
  )
}
