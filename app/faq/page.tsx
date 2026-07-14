import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Mail, MessageSquare, Microscope } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getFaqs } from '@/lib/data'
import type { FAQ } from '@/lib/types'

export const metadata = {
  title: 'FAQ | Terrain Peptides',
  description:
    'Frequently asked questions about our research peptides, shipping, quality, and more.',
}

export default async function FAQPage() {
  const faqs = getFaqs()

  const groupedFaqs = faqs.reduce(
    (acc, faq) => {
      if (!acc[faq.category]) acc[faq.category] = []
      acc[faq.category].push(faq)
      return acc
    },
    {} as Record<string, FAQ[]>,
  )

  const categoryOrder = ['quality', 'general', 'payment', 'shipping', 'legal'] as const

  const categoryLabels: Record<string, string> = {
    general: 'General',
    quality: 'Quality & Testing',
    shipping: 'Shipping & Fulfillment',
    payment: 'Payment & Orders',
    legal: 'Legal & Compliance',
  }

  const categoryDescriptions: Record<string, string> = {
    general: 'Account, catalog, and general research inquiries',
    quality: 'Purity standards, COA documentation, and lab verification',
    shipping: 'Delivery times, packaging, and order tracking',
    payment: 'Checkout, discounts, and billing questions',
    legal: 'Research-use disclaimers and regulatory compliance',
  }

  return (
    <div className="min-h-screen bg-white">
      <section className="page-hero-dark">
        <div className="mx-auto max-w-4xl px-4 py-12 text-center sm:px-6 sm:py-14 lg:px-8">
          <p className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-terrain">
            Knowledge base
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Frequently asked <span className="orbit-accent">questions</span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Answers about product quality, shipping, payments, and research compliance.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="space-y-5">
          {categoryOrder
            .filter((category) => groupedFaqs[category]?.length)
            .map((category) => {
              const categoryFaqs = groupedFaqs[category]
              return (
                <section key={category} className="overflow-hidden border border-border bg-white">
                  <div className="border-b border-border bg-section-subtle px-5 py-4 sm:px-6">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-terrain/25 bg-terrain/10">
                        <Microscope className="h-4 w-4 text-terrain-deep" aria-hidden />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-ink">
                          {categoryLabels[category] || category}
                        </h2>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {categoryDescriptions[category]}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Accordion type="single" collapsible className="w-full px-2 sm:px-3">
                    {categoryFaqs.map((faq) => (
                      <AccordionItem key={faq.id} value={faq.id} className="border-border px-3 sm:px-4">
                        <AccordionTrigger className="py-4 text-left text-sm font-semibold text-ink hover:no-underline sm:text-[15px] [&>svg]:text-muted-foreground [&[data-state=open]>svg]:text-terrain">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </section>
              )
            })}
        </div>

        <div className="mt-12 overflow-hidden rounded-2xl border border-border bg-ink text-white">
          <div className="flex flex-col items-center p-10 text-center sm:p-12">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-terrain/30 bg-terrain/10">
              <MessageSquare className="h-6 w-6 text-terrain-bright" />
            </div>
            <h2 className="mt-5 text-xl font-bold text-white">Still have questions?</h2>
            <p className="mt-2 max-w-md text-sm text-white/50">
              Our support team typically responds within 24 hours on business days.
            </p>
            <Button
              className="mt-7 gap-2 rounded-full bg-terrain font-semibold text-white hover:bg-terrain-deep"
              asChild
            >
              <Link href="/contact">
                <Mail className="h-4 w-4" />
                Contact Support
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
