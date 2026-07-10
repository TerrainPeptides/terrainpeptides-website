'use client'

import Link from 'next/link'
import type { FAQ } from '@/lib/types'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export function FaqSection({ faqs }: { faqs: FAQ[] }) {
  return (
    <section className="border-t border-border bg-section-subtle py-14 sm:py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center sm:mb-10">
          <p className="clinical-eyebrow">
            Support
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-navy sm:text-3xl">
            Frequently asked questions
          </h2>
          <p className="mt-2 text-base text-foreground/80">
            Quick answers about purity, shipping, payments, and more.
          </p>
        </div>

        <div className="overflow-hidden rounded-md border-2 border-border bg-white shadow-sm">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq) => (
              <AccordionItem
                key={faq.id}
                value={faq.id}
                className="border-border px-4 sm:px-6"
              >
                <AccordionTrigger className="py-4 text-left text-base font-semibold text-navy hover:no-underline sm:py-5 [&>svg]:text-foreground/50 [&[data-state=open]>svg]:text-primary">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-base leading-relaxed text-foreground/80">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <p className="mt-6 text-center text-base text-foreground/75">
          <Link
            href="/faq"
            className="font-semibold text-primary underline decoration-primary/30 underline-offset-4 transition hover:decoration-primary"
          >
            View all FAQs
          </Link>
        </p>
      </div>
    </section>
  )
}
