/** Reusable COA sample panel — used in quality section & elsewhere */
export function CoaSampleCard({ className = '' }: { className?: string }) {
  return (
    <div className={`overflow-hidden rounded-lg border border-border bg-white shadow-md ${className}`}>
      <div className="border-b border-border bg-section-subtle px-4 py-3 sm:px-5">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Certificate of Analysis — Sample
        </p>
      </div>
      <div className="space-y-5 p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4 border-b border-dashed border-border pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Compound</p>
            <p className="mt-1 text-xl font-semibold text-black">GHK-Cu</p>
          </div>
          <span className="rounded border border-clinical-teal/40 bg-clinical-teal/10 px-3 py-1 text-xs font-bold text-clinical-teal">
            PASS
          </span>
        </div>
        <div className="grid grid-cols-2 gap-5 text-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Purity (HPLC)</p>
            <p className="mt-1 text-base font-bold tabular-nums text-black">99.87%</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mass Spec</p>
            <p className="mt-1 text-base font-bold text-black">Verified</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Batch ID</p>
            <p className="mt-1 font-mono text-sm font-medium text-black">TP-2026-0412</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Testing Lab</p>
            <p className="mt-1 text-base font-bold text-black">US Accredited</p>
          </div>
        </div>
        <p className="text-sm leading-relaxed text-foreground/75">
          Full COA included with every order. Independent third-party verification on all batches.
        </p>
      </div>
    </div>
  )
}
