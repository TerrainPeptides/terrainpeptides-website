'use client'

import { ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function isPdfUrl(url: string): boolean {
  try {
    const path = new URL(url).pathname
    return /\.pdf$/i.test(path)
  } catch {
    return /\.pdf(\?|#|$)/i.test(url)
  }
}

const VIEWER_MAX_H = 'min(75vh, 880px)'

export function CoaDocumentPanel({
  coaUrl,
  className,
  frameClassName,
  hideFooterNote,
}: {
  coaUrl: string
  className?: string
  frameClassName?: string
  /** Omit the helper line (e.g. when shown inside a dialog). */
  hideFooterNote?: boolean
}) {
  const pdf = isPdfUrl(coaUrl)

  return (
    <div className={cn('mt-6 space-y-4', className)}>
      <div className="flex flex-wrap items-center gap-2">
        <Button asChild variant="outline" size="sm" className="gap-2">
          <a href={coaUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" />
            Open in new tab
          </a>
        </Button>
      </div>
      <div
        className={cn(
          'overflow-auto rounded-xl border border-border bg-muted/20',
          frameClassName,
        )}
        style={{ maxHeight: VIEWER_MAX_H }}
      >
        {pdf ? (
          <iframe
            src={coaUrl}
            title="Certificate of Analysis"
            className="block w-full min-h-[420px] border-0"
            style={{ height: VIEWER_MAX_H }}
          />
        ) : (
          <div className="flex max-h-[min(75vh,880px)] justify-center overflow-auto p-2">
            {/* eslint-disable-next-line @next/next/no-img-element -- remote COA dimensions unknown */}
            <img
              src={coaUrl}
              alt="Certificate of Analysis"
              className="h-auto w-full max-w-full object-contain"
            />
          </div>
        )}
      </div>
      {!hideFooterNote && (
        <p className="text-xs text-muted-foreground">
          Use the built-in scrollbar to read the full document. If the preview does not load, use
          &quot;Open in new tab&quot;.
        </p>
      )}
    </div>
  )
}
