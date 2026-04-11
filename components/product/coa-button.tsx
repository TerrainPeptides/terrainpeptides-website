'use client'

import { useState } from 'react'
import { FileText, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { CoaDocumentPanel } from '@/components/product/coa-document-panel'

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
    ? 'border-border/35 text-foreground hover:bg-[#1C3D2A]/5'
    : ''

  if (coaUrl) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className={`mt-4 gap-2 ${btnClass}`}>
            <FileText className="h-4 w-4" />
            View Certificate of Analysis
          </Button>
        </DialogTrigger>
        <DialogContent
          showCloseButton
          className="flex max-h-[92vh] w-[calc(100%-1rem)] max-w-5xl flex-col gap-0 overflow-hidden p-0 sm:max-w-5xl"
        >
          <DialogHeader className="shrink-0 border-b px-6 py-4 pr-14 text-left">
            <DialogTitle>Certificate of Analysis</DialogTitle>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <CoaDocumentPanel coaUrl={coaUrl} className="mt-0" hideFooterNote />
          </div>
        </DialogContent>
      </Dialog>
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

            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#1C3D2A]/8">
              <FileText className="h-5 w-5 text-foreground" />
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
                className="w-full bg-[#1C3D2A] text-white hover:bg-[#1C3D2A]/90"
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
