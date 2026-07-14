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
  const items = faqs.slice(0, 6)

  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="section-index justify-center">05 FAQ</p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-ink sm:text-[2.5rem]">
            Frequently asked <span className="orbit-accent">questions</span>
          </h2>
          <p className="mx-auto mt-3 max-w-md text-base text-muted-foreground">
            Purity, shipping, payments, and research compliance — answered clearly.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-white">
          <Accordion type="single" collapsible className="w-full">
            {items.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id} className="border-border px-5 sm:px-7">
                <AccordionTrigger className="py-5 text-left text-[0.95rem] font-semibold text-ink hover:no-underline [&>svg]:text-muted-foreground [&[data-state=open]>svg]:text-terrain">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-base leading-relaxed text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <p className="mt-8 text-center">
          <Link
            href="/faq"
            className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-terrain-deep underline underline-offset-4 transition hover:text-ink"
          >
            View all FAQs
          </Link>
        </p>
      </div>
    </section>
  )
}
