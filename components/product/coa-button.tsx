'use client'

import { useState } from 'react'
import { FileText, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

interface CoaButtonProps {
  coaUrl?: string | null
  /** Match the theme of the containing panel (navy = dark text/border, default = standard) */
  theme?: 'navy' | 'default'
}

export function CoaButton({ coaUrl, theme = 'default' }: CoaButtonProps) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const isNavy = theme === 'navy'
  const btnClass = isNavy
    ? 'border-[#0A1931]/35 text-[#0A1931] hover:bg-[#0A1931]/5'
    : ''

  if (coaUrl) {
    return (
      <Button variant="outline" size="sm" className={`mt-4 gap-2 ${btnClass}`} asChild>
        <a href={coaUrl} target="_blank" rel="noopener noreferrer">
          <FileText className="h-4 w-4" />
          View Certificate of Analysis
        </a>
      </Button>
    )
  }

  const handleNotify = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 500))
    toast.success("You'll be notified when the COA is ready.")
    setEmail('')
    setOpen(false)
    setSubmitting(false)
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className={`mt-4 gap-2 ${btnClass}`}
      >
        <FileText className="h-4 w-4" />
        View Certificate of Analysis
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="relative w-full max-w-sm rounded-2xl bg-white p-7 shadow-xl dark:bg-card"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#0A1931]/8">
              <FileText className="h-5 w-5 text-[#0A1931]" />
            </div>

            <h3 className="text-lg font-bold tracking-tight text-foreground">
              COA In Progress
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              This batch is currently in testing. Enter your email below to get
              notified when the COA is ready.
            </p>

            <form onSubmit={handleNotify} className="mt-5 space-y-3">
              <Input
                type="email"
                required
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#0A1931] text-white hover:bg-[#0A1931]/90"
              >
                {submitting ? 'Submitting…' : 'Notify Me'}
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
