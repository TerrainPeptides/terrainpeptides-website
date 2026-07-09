import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, MessageSquare } from 'lucide-react'
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

  // Group FAQs by category
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
    quality: 'Quality & testing',
    shipping: 'Shipping',
    payment: 'Payment',
    legal: 'Legal & compliance',
  }

  return (
    <div className="bg-background">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">
            Frequently Asked Questions
          </h1>
          <p className="mt-2 text-muted-foreground">
            Find answers to common questions about our products and services.
          </p>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-8">
          {categoryOrder
            .filter((category) => groupedFaqs[category]?.length)
            .map((category) => {
              const categoryFaqs = groupedFaqs[category]
              return (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="text-lg text-black">
                  {categoryLabels[category] || category}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {categoryFaqs.map((faq) => (
                    <AccordionItem key={faq.id} value={faq.id}>
                      <AccordionTrigger className="text-left text-black">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
              )
            })}
        </div>

        {/* Contact CTA */}
        <Card className="mt-12">
          <CardContent className="flex flex-col items-center p-8 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground/50" />
            <h2 className="mt-4 text-xl font-semibold text-black">
              Still have questions?
            </h2>
            <p className="mt-2 text-muted-foreground">
              Our support team is here to help with any questions you may have.
            </p>
            <Link href="/contact">
              <Button className="mt-6 gap-2">
                <Mail className="h-4 w-4" />
                Contact Support
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
