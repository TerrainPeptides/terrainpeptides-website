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
  description: 'Frequently asked questions about our research peptides, shipping, quality, and more.',
}

export default async function FAQPage() {
  const faqs = getFaqs()

  const groupedFaqs = faqs.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = []
    }
    acc[faq.category].push(faq)
    return acc
  }, {} as Record<string, FAQ[]>)

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
    <div className="min-h-screen bg-section-subtle">
      <section className="clinical-navy-band relative border-b border-border bg-section-clinical clinical-grid-bg">
        <div className="clinical-strip" aria-hidden />
        <div className="mx-auto max-w-4xl px-4 py-12 text-center sm:px-6 sm:py-16 lg:px-8">
          <p className="clinical-eyebrow">
            Knowledge base
          </p>
          <h1 className="page-title mt-3 text-3xl font-semibold sm:text-4xl">
            Frequently Asked Questions
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Answers about product quality, shipping, payments, and research compliance.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="space-y-6">
          {categoryOrder
            .filter((category) => groupedFaqs[category]?.length)
            .map((category) => {
              const categoryFaqs = groupedFaqs[category]
              return (
                <section
                  key={category}
                  className="overflow-hidden rounded-lg border border-border bg-white shadow-sm"
                >
                  <div className="border-b border-border bg-section-subtle px-5 py-4 sm:px-6">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-primary/15 bg-section-clinical">
                        <Microscope className="h-4 w-4 text-primary" aria-hidden />
                      </div>
                      <div>
                        <h2 className="text-base font-semibold text-navy">
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
                        <AccordionTrigger className="py-4 text-left text-sm font-medium text-navy hover:no-underline sm:text-[15px] [&>svg]:text-muted-foreground [&[data-state=open]>svg]:text-primary">
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

        <div className="mt-12 overflow-hidden rounded-lg border border-primary/20 bg-section-clinical">
          <div className="flex flex-col items-center p-8 text-center sm:p-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-md border border-primary/20 bg-white">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-navy">
              Still have questions?
            </h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Our support team typically responds within 24 hours on business days.
            </p>
            <Button className="mt-6 gap-2 rounded-md" asChild>
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
