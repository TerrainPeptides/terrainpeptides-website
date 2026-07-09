import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service | Terrain Peptides',
  description:
    'Terms of Service for Terrain Peptides — eligibility, research-use policies, orders, shipping, returns, and liability.',
}

type TermsSection = {
  title: string
  body?: string
  bullets?: string[]
}

const sections: TermsSection[] = [
  {
    title: '1. Acceptance of Terms',
    body: 'By accessing or purchasing from terrainpeptides.com, you agree to be bound by these Terms of Service. If you do not agree, do not use this site.',
  },
  {
    title: '2. Eligibility',
    body: 'You must be at least 18 years of age to use this site or place an order. By purchasing, you represent and warrant that you meet this requirement.',
  },
  {
    title: '3. Research Use Only',
    body: 'All products sold by Terrain Peptides are strictly for in-vitro laboratory and research purposes only. They are not intended for human or animal consumption, therapeutic use, or clinical application. By completing a purchase, you confirm you are a legitimate researcher purchasing for lawful research purposes.',
  },
  {
    title: '4. No FDA Approval',
    body: 'Products sold on this site have not been evaluated or approved by the FDA or any regulatory body. Terrain Peptides makes no claims that any product is intended to diagnose, treat, cure, or prevent any disease.',
  },
  {
    title: '5. Buyer Responsibility & Compliance',
    body: 'You are solely responsible for ensuring that the purchase, importation, possession, and use of any product complies with all applicable laws in your jurisdiction. Terrain Peptides is not liable for any legal consequences resulting from your purchase or use.',
  },
  {
    title: '6. Orders & Payment',
    bullets: [
      'All prices are listed in USD',
      'We reserve the right to refuse or cancel any order at our discretion',
      'Payment is processed at the time of order',
      'Crypto payments are final and non-reversible once confirmed on-chain',
      'Stripe payments are subject to standard chargeback policies',
    ],
  },
  {
    title: '7. Shipping & Delivery',
    bullets: [
      'Orders are shipped from our USA warehouse',
      'Free shipping is available on qualifying orders (see current threshold on site)',
      'Terrain Peptides is not responsible for delays caused by carriers, customs, or events outside our control',
      'Risk of loss passes to you upon handoff to the carrier',
    ],
  },
  {
    title: '8. Returns & Refunds',
    body: 'Due to the nature of research compounds, all sales are final. We do not accept returns. If you receive a damaged or incorrect order, contact us within 48 hours of delivery with photo evidence and we will work to resolve the issue.',
  },
  {
    title: '9. Product Accuracy',
    body: 'We make reasonable efforts to ensure product descriptions, purity claims, and COA documentation are accurate. Third-party testing is conducted by independent labs. However, Terrain Peptides makes no warranties beyond what is explicitly stated.',
  },
  {
    title: '10. Intellectual Property',
    body: 'All content on this site — including text, images, branding, and design — is the property of Terrain Peptides and may not be reproduced without written permission.',
  },
  {
    title: '11. Affiliate Program',
    body: 'Participation in the Terrain Peptides affiliate program is subject to separate affiliate terms. We reserve the right to modify commission structures or terminate affiliates at any time.',
  },
  {
    title: '12. Limitation of Liability',
    body: 'To the fullest extent permitted by law, Terrain Peptides shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of our products or site. Our total liability shall not exceed the amount paid for the specific order in question.',
  },
  {
    title: '13. Indemnification',
    body: 'You agree to indemnify and hold harmless Terrain Peptides, its owners, employees, and affiliates from any claims, damages, or expenses arising from your misuse of products or violation of these terms.',
  },
  {
    title: '14. Governing Law',
    body: 'These terms are governed by the laws of the State of Florida, without regard to conflict of law principles.',
  },
  {
    title: '15. Changes to Terms',
    body: 'We reserve the right to update these Terms at any time. Continued use of the site after changes constitutes acceptance of the revised terms.',
  },
  {
    title: '16. Contact',
    body: 'For questions regarding these Terms, contact us via the Contact page at terrainpeptides.com.',
  },
]

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="inline-flex rounded-md border border-[#0A1628]/12 bg-[#0A1628]/[0.04] px-4 py-2 backdrop-blur-sm">
      <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-black">{title}</h2>
    </div>
  )
}

export default function TermsPage() {
  return (
    <div className="bg-background">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <header className="mb-12 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">
            Terms of Service
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-black/60">
            Effective Date: July 4, 2026
          </p>
        </header>

        <div className="space-y-8">
          {sections.map((section) => (
            <article key={section.title} className="space-y-3">
              <SectionHeader title={section.title} />
              {section.body && (
                <p className="text-base leading-relaxed text-foreground/85">
                  {section.title === '16. Contact' ? (
                    <>
                      For questions regarding these Terms, contact us via the{' '}
                      <Link href="/contact" className="font-medium text-[#0A1628] hover:underline">
                        Contact page
                      </Link>{' '}
                      at terrainpeptides.com.
                    </>
                  ) : (
                    section.body
                  )}
                </p>
              )}
              {section.bullets && (
                <ul className="list-disc space-y-2 pl-5 text-base leading-relaxed text-foreground/85">
                  {section.bullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>

        <p className="mt-14 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          Effective July 4, 2026. For questions, visit our{' '}
          <Link href="/contact" className="font-medium text-[#0A1628] hover:underline">
            Contact page
          </Link>{' '}
          or email{' '}
          <a href="mailto:support@terrainpeptides.com" className="font-medium text-[#0A1628] hover:underline">
            support@terrainpeptides.com
          </a>
          .
        </p>
      </div>
    </div>
  )
}
