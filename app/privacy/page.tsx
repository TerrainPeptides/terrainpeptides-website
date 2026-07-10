import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy | Terrain Peptides',
  description:
    'Privacy Policy for Terrain Peptides — what data we collect, how we use it, cookies, your rights, and contact information.',
}

type BulletGroup = {
  label?: string
  items: string[]
}

type PrivacySection = {
  title: string
  body?: string
  intro?: string
  bullets?: string[]
  groups?: BulletGroup[]
  footnotes?: string[]
}

const sections: PrivacySection[] = [
  {
    title: '1. Overview',
    body: 'Terrain Peptides ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains what information we collect, how we use it, and your rights regarding your data when you visit terrainpeptides.com.',
  },
  {
    title: '2. Information We Collect',
    groups: [
      {
        label: 'Information you provide directly:',
        items: [
          'Full name and email address',
          'Shipping and billing address',
          'Payment information (processed securely via Stripe — we never store raw card data)',
          'Crypto wallet address (for crypto transactions)',
          'Account credentials if you create an account',
          'Messages sent via our Contact page',
        ],
      },
      {
        label: 'Information collected automatically:',
        items: [
          'IP address and approximate location',
          'Browser type, device type, and operating system',
          'Pages visited, time on site, and referral source',
          'Cookies and session data',
        ],
      },
      {
        label: 'Information from third parties:',
        items: [
          'Payment processors (Stripe) may share transaction confirmations',
          'Analytics providers may share aggregated usage data',
        ],
      },
    ],
  },
  {
    title: '3. How We Use Your Information',
    intro: 'We use collected information to:',
    bullets: [
      'Process and fulfill your orders',
      'Send order confirmations and shipping updates',
      'Respond to customer service inquiries',
      'Verify eligibility and compliance with our Research Use Only policy',
      'Improve site functionality and user experience',
      'Detect and prevent fraud or unauthorized activity',
      'Send marketing communications (only with your consent)',
      'Comply with legal obligations',
    ],
  },
  {
    title: '4. Cookies',
    intro: 'We use cookies to:',
    bullets: [
      'Maintain your shopping cart session',
      'Remember login state',
      'Analyze site traffic (via analytics tools)',
      'Improve site performance',
    ],
    footnotes: [
      'You can disable cookies in your browser settings, though some site functionality may be affected. We do not use cookies to sell your data to advertisers.',
    ],
  },
  {
    title: '5. How We Share Your Information',
    intro: 'We do not sell your personal information. We may share data with:',
    bullets: [
      'Payment processors (Stripe) to complete transactions',
      'Shipping carriers to fulfill and deliver orders',
      'Analytics providers for aggregate site performance data',
      'Legal authorities if required by law, court order, or to protect our rights',
      'Affiliate tracking systems to attribute referrals (no personal data beyond click/conversion events)',
    ],
    footnotes: [
      'All third-party service providers are contractually obligated to handle your data securely and only for the stated purpose.',
    ],
  },
  {
    title: '6. Data Retention',
    intro: 'We retain your data for as long as necessary to:',
    bullets: [
      'Fulfill the purposes outlined in this policy',
      'Comply with legal and tax obligations (typically 7 years for financial records)',
      'Resolve disputes or enforce our agreements',
    ],
    footnotes: [
      'You may request deletion of your account and associated data at any time (see Section 9).',
    ],
  },
  {
    title: '7. Data Security',
    intro: 'We take reasonable technical and organizational measures to protect your data, including:',
    bullets: [
      'SSL/TLS encryption on all pages',
      'Secure data storage via Supabase with access controls',
      'Payment processing handled entirely by Stripe (PCI-DSS compliant)',
      'We never store raw credit card numbers or CVV codes',
    ],
    footnotes: [
      'No method of transmission over the internet is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.',
    ],
  },
  {
    title: "8. Children's Privacy",
    body: 'Our site is not directed at individuals under the age of 18. We do not knowingly collect personal information from minors. If we become aware that a minor has provided personal data, we will delete it promptly.',
  },
  {
    title: '9. Your Rights',
    intro: 'Depending on your jurisdiction, you may have the right to:',
    bullets: [
      'Access the personal data we hold about you',
      'Correct inaccurate information',
      'Request deletion of your data',
      'Opt out of marketing communications at any time',
      'Data portability — receive your data in a structured format',
    ],
    footnotes: [
      'To exercise any of these rights, contact us via the Contact page at terrainpeptides.com. We will respond within 30 days.',
      'To unsubscribe from marketing emails: use the unsubscribe link in any email we send, or contact us directly.',
    ],
  },
  {
    title: '10. California Residents (CCPA)',
    intro: 'If you are a California resident, you have additional rights under the California Consumer Privacy Act:',
    bullets: [
      'The right to know what personal information is collected and how it is used',
      'The right to delete personal information',
      'The right to opt out of the sale of personal information (we do not sell personal information)',
      'The right to non-discrimination for exercising your privacy rights',
    ],
    footnotes: ['To submit a CCPA request, contact us via the Contact page.'],
  },
  {
    title: '11. International Users',
    body: 'Terrain Peptides operates from the United States. If you are accessing our site from outside the US, your data will be transferred to and processed in the United States. By using our site, you consent to this transfer.',
  },
  {
    title: '12. Third-Party Links',
    body: 'Our site may contain links to third-party websites (e.g. lab resources, affiliate partners). We are not responsible for the privacy practices of those sites and encourage you to review their policies independently.',
  },
  {
    title: '13. Changes to This Policy',
    body: 'We may update this Privacy Policy periodically. When we do, we will update the effective date at the top of this page. Continued use of the site after changes constitutes acceptance of the revised policy. Significant changes will be communicated via email if you have an account.',
  },
  {
    title: '14. Contact Us',
    body: 'If you have questions or concerns about this Privacy Policy, reach out through the Contact page at terrainpeptides.com.',
  },
]

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="inline-flex rounded-md border border-primary/12 bg-primary/[0.04] px-4 py-2 backdrop-blur-sm">
      <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-black">{title}</h2>
    </div>
  )
}

function ContactLink() {
  return (
    <Link href="/contact" className="font-medium text-primary hover:underline">
      Contact page
    </Link>
  )
}

function renderBodyWithContactLinks(text: string) {
  if (!text.includes('Contact page')) {
    return text
  }
  const parts = text.split('Contact page')
  return (
    <>
      {parts[0]}
      <ContactLink />
      {parts.slice(1).join('Contact page')}
    </>
  )
}

export default function PrivacyPage() {
  return (
    <div className="bg-background">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <header className="mb-12 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">
            Privacy Policy
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
                  {renderBodyWithContactLinks(section.body)}
                </p>
              )}

              {section.intro && (
                <p className="text-base leading-relaxed text-foreground/85">{section.intro}</p>
              )}

              {section.groups?.map((group) => (
                <div key={group.label ?? group.items[0]} className="space-y-2">
                  {group.label && (
                    <p className="text-sm font-medium text-black">{group.label}</p>
                  )}
                  <ul className="list-disc space-y-2 pl-5 text-base leading-relaxed text-foreground/85">
                    {group.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}

              {section.bullets && (
                <ul className="list-disc space-y-2 pl-5 text-base leading-relaxed text-foreground/85">
                  {section.bullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}

              {section.footnotes?.map((note) => (
                <p key={note} className="text-base leading-relaxed text-foreground/85">
                  {renderBodyWithContactLinks(note)}
                </p>
              ))}
            </article>
          ))}
        </div>

        <p className="mt-14 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          Effective July 4, 2026. For questions, visit our <ContactLink /> or email{' '}
          <a href="mailto:support@terrainpeptides.com" className="font-medium text-primary hover:underline">
            support@terrainpeptides.com
          </a>
          .
        </p>
      </div>
    </div>
  )
}
