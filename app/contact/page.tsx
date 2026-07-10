'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import {
  Mail,
  Clock,
  Headphones,
  Send,
  ShieldCheck,
  FileText,
  Truck,
  Microscope,
  ChevronRight,
} from 'lucide-react'

const SUPPORT_CHANNELS = [
  {
    icon: Mail,
    title: 'Email Support',
    detail: 'support@terrainpeptides.com',
    note: 'Primary channel for order & product inquiries',
  },
  {
    icon: Clock,
    title: 'Response SLA',
    detail: 'Within 24 hours',
    note: 'Mon–Fri business days, excluding holidays',
  },
  {
    icon: Headphones,
    title: 'Support Hours',
    detail: '9:00 AM – 6:00 PM EST',
    note: 'Monday through Friday',
  },
] as const

const QUICK_TOPICS = [
  { label: 'Order status & tracking', href: '/track', icon: Truck },
  { label: 'Quality & COA questions', href: '/faq', icon: Microscope },
  { label: 'Shipping & packaging', href: '/faq', icon: FileText },
  { label: 'Research disclaimer', href: '/disclaimer', icon: ShieldCheck },
] as const

const SUBJECT_OPTIONS = [
  'General inquiry',
  'Order support',
  'Product / COA question',
  'Shipping issue',
  'Account & billing',
  'Affiliate program',
  'Other',
] as const

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        toast.success('Message sent successfully!')
        setFormData({ name: '', email: '', subject: '', message: '' })
      } else {
        toast.error('Failed to send message. Please try again.')
      }
    } catch {
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-section-subtle">
      {/* Hero */}
      <section className="clinical-navy-band relative border-b border-border bg-section-clinical clinical-grid-bg">
        <div className="clinical-strip" aria-hidden />
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="clinical-eyebrow">
              Customer support
            </p>
            <h1 className="page-title mt-3 text-3xl font-semibold sm:text-4xl">
              Contact Our Support Team
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Questions about orders, certificates of analysis, or research compounds?
              Our team responds within one business day.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-3">
            {SUPPORT_CHANNELS.map((channel) => (
              <div
                key={channel.title}
                className="rounded-md border border-navy/10 bg-white p-5 shadow-sm"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-md border border-navy/15 bg-section-clinical">
                  <channel.icon className="h-4 w-4 text-navy" aria-hidden />
                </div>
                <h2 className="mt-3 text-sm font-semibold text-navy">{channel.title}</h2>
                <p className="mt-1 text-sm font-medium text-navy/80">{channel.detail}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{channel.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_340px] lg:gap-12">
          {/* Form */}
          <div className="overflow-hidden rounded-lg border border-border bg-white shadow-sm">
            <div className="border-b border-border bg-section-subtle px-6 py-4 sm:px-8">
              <h2 className="text-lg font-semibold text-navy">Submit a support request</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Include your order number if applicable for faster resolution.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6 sm:p-8">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Full name
                  </Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Dr. Jane Smith"
                    className="h-11 rounded-md border-border bg-section-subtle/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Email address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@institution.edu"
                    className="h-11 rounded-md border-border bg-section-subtle/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Topic
                </Label>
                <select
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="flex h-11 w-full rounded-md border border-border bg-section-subtle/50 px-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                >
                  <option value="">Select a topic…</option>
                  {SUBJECT_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Message
                </Label>
                <Textarea
                  id="message"
                  required
                  rows={6}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Describe your question or issue in detail…"
                  className="min-h-[140px] resize-y rounded-md border-border bg-section-subtle/50"
                />
              </div>

              <div className="rounded-md border border-clinical-teal/25 bg-clinical-teal/5 px-4 py-3">
                <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                  <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-clinical-teal" aria-hidden />
                  All products are for laboratory research use only. We cannot provide medical,
                  dosing, or human-use guidance.
                </p>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-11 w-full gap-2 rounded-md text-sm font-semibold uppercase tracking-wide"
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? 'Sending…' : 'Send Message'}
              </Button>
            </form>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="rounded-lg border border-border bg-white p-6 shadow-sm">
              <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">
                Self-service
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Many questions are answered in our knowledge base.
              </p>
              <ul className="mt-4 space-y-1">
                {QUICK_TOPICS.map((topic) => (
                  <li key={topic.label}>
                    <Link
                      href={topic.href}
                      className="group flex items-center gap-3 rounded-md px-2 py-2.5 text-sm text-foreground transition hover:bg-section-clinical"
                    >
                      <topic.icon className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                      <span className="flex-1">{topic.label}</span>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-primary/20 bg-section-clinical p-6">
              <h3 className="text-sm font-semibold text-navy">Track an existing order</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Look up status, tracking, and delivery details without waiting for a response.
              </p>
              <Button variant="outline" className="mt-4 w-full border-primary/30 text-primary hover:bg-white" asChild>
                <Link href="/track">Order Lookup</Link>
              </Button>
            </div>

            <div className="rounded-lg border border-border bg-white p-6 shadow-sm">
              <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                Direct email
              </h3>
              <a
                href="mailto:support@terrainpeptides.com"
                className="mt-2 block text-sm font-medium text-primary hover:underline"
              >
                support@terrainpeptides.com
              </a>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                For urgent shipping or quality concerns, include your order number and batch ID
                from your COA.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
