import type { FAQ } from '@/lib/types'

/** Canonical FAQ copy used site-wide (/faq, homepage, getFaqs). */
export const SITE_FAQ_ENTRIES: Array<{
  q: string
  a: string
  category: FAQ['category']
}> = [
  {
    q: 'What purity levels do your peptides meet?',
    a: 'All Terrain peptides meet a minimum purity of 99%+ verified by third-party HPLC and Mass Spec testing.',
    category: 'quality',
  },
  {
    q: 'Do your products come with a Certificate of Analysis?',
    a: 'Yes. Every order includes a full COA from an accredited US laboratory, available on each product page.',
    category: 'quality',
  },
  {
    q: 'Where are your peptides manufactured?',
    a: 'Our peptides are synthesized in GMP-compliant facilities and shipped from our USA warehouse.',
    category: 'general',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We currently accept major credit cards and USDC cryptocurrency payments via Coinbase Commerce.',
    category: 'payment',
  },
  {
    q: 'Can I cancel or modify my order after placing it?',
    a: 'Orders can be cancelled or modified within 1 hour of placement. Contact us immediately via the Contact page.',
    category: 'general',
  },
  {
    q: 'Where do you ship to?',
    a: 'We ship across the United States. International shipping is available to select countries.',
    category: 'shipping',
  },
  {
    q: 'How long does shipping take?',
    a: 'Standard shipping takes 3-5 business days. Expedited options are available at checkout.',
    category: 'shipping',
  },
  {
    q: 'Do you offer discreet packaging?',
    a: 'Yes. All orders ship in plain, unmarked packaging with no reference to Terrain Peptides on the exterior.',
    category: 'shipping',
  },
  {
    q: 'What happens if my package is lost or damaged?',
    a: 'Every order includes shipment protection. Lost or damaged packages are reshipped at no additional cost.',
    category: 'shipping',
  },
  {
    q: 'Are these products safe for human consumption?',
    a: 'Terrain Peptides products are for research use only and are not intended for human consumption.',
    category: 'legal',
  },
]

const FAQ_CREATED_AT = '2025-01-01T00:00:00.000Z'

export function buildSiteStaticFaqs(): FAQ[] {
  return SITE_FAQ_ENTRIES.map((item, i) => ({
    id: `site-faq-${i + 1}`,
    question: item.q,
    answer: item.a,
    category: item.category,
    sort_order: i + 1,
    created_at: FAQ_CREATED_AT,
  }))
}
