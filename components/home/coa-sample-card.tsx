/** Reusable COA sample panel — used in quality section & elsewhere */
export function CoaSampleCard({ className = '' }: { className?: string }) {
  return (
    <div className={`overflow-hidden rounded-lg border border-black/10 bg-white ${className}`}>
      <div className="border-b border-black/10 bg-[#fafafa] px-4 py-3 sm:px-5">
        <p className="text-[0.7rem] font-medium uppercase tracking-[0.16em] text-black/50">
          Certificate of Analysis — Sample
        </p>
      </div>
      <div className="space-y-5 p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4 border-b border-dashed border-black/15 pb-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-black/45">Compound</p>
            <p className="mt-1 text-xl font-semibold text-black">GHK-Cu</p>
          </div>
          <span className="rounded border border-black bg-black px-3 py-1 text-xs font-semibold text-white">
            PASS
          </span>
        </div>
        <div className="grid grid-cols-2 gap-5 text-sm">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-black/45">Purity (HPLC)</p>
            <p className="mt-1 text-base font-semibold tabular-nums text-black">99.87%</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-black/45">Mass Spec</p>
            <p className="mt-1 text-base font-semibold text-black">Verified</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-black/45">Batch ID</p>
            <p className="mt-1 font-mono text-sm font-medium text-black">TP-2026-0412</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-black/45">Testing Lab</p>
            <p className="mt-1 text-base font-semibold text-black">US Accredited</p>
          </div>
        </div>
        <p className="text-sm leading-relaxed text-black/65">
          Full COA included with every order. Independent third-party verification on all batches.
        </p>
      </div>
    </div>
  )
}
