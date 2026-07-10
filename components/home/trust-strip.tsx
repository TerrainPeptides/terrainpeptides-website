import { Microscope, ShieldCheck, Truck, FileCheck } from 'lucide-react'

const TRUST_ITEMS = [
  { icon: Microscope, label: 'HPLC & Mass Spec Tested' },
  { icon: FileCheck, label: 'COA With Every Batch' },
  { icon: ShieldCheck, label: '99%+ Purity Standard' },
  { icon: Truck, label: 'USA Warehouse Shipping' },
] as const

export function TrustStrip() {
  return (
    <section className="border-y border-border border-t-2 border-t-navy/25 bg-section-subtle py-4" aria-label="Quality guarantees">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {TRUST_ITEMS.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="flex items-center justify-center gap-2 rounded-md border border-navy/10 bg-white px-3 py-2.5 text-center shadow-sm sm:justify-start sm:px-4"
            >
              <Icon className="h-4 w-4 shrink-0 text-navy" aria-hidden />
              <span className="text-xs font-semibold leading-snug text-navy sm:text-sm">{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
