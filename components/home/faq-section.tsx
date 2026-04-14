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
    <section className="border-t border-gray-200 bg-white py-14 sm:py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center sm:mb-10">
          <h2 className="text-2xl font-bold tracking-tight text-[#0A1931] sm:text-3xl">
            Frequently asked questions
          </h2>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Quick answers about purity, shipping, payments, and more.
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq) => (
              <AccordionItem
                key={faq.id}
                value={faq.id}
                className="border-gray-200 px-4 sm:px-5"
              >
                <AccordionTrigger className="py-4 text-left text-[15px] font-medium text-[#0A1931] hover:no-underline sm:py-5 sm:text-base [&>svg]:text-muted-foreground [&[data-state=open]>svg]:text-[#0A1931]/70">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-[15px] leading-relaxed text-muted-foreground sm:text-base">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link
            href="/faq"
            className="font-medium text-[#0A1931] underline decoration-gray-300 underline-offset-4 transition hover:text-[#0d2040] hover:decoration-gray-400"
          >
            View all FAQs
          </Link>
        </p>
      </div>
    </section>
  )
}
