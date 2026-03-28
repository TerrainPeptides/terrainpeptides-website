import { Shield, Warehouse, Microscope, Truck } from 'lucide-react'

const trustSignals = [
  { icon: Shield, label: '99%+ Purity' },
  { icon: Warehouse, label: 'USA Warehouse' },
  { icon: Microscope, label: 'Third-Party Tested' },
  { icon: Truck, label: 'Fast Shipping' },
]

export function StatsBar() {
  return (
    <section className="border-y border-[#0A1931]/10 bg-[#0A1931]">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {trustSignals.map((item) => (
            <div key={item.label} className="flex items-center justify-center gap-3">
              <item.icon className="h-5 w-5 shrink-0 text-white/70" />
              <span className="text-sm font-semibold tracking-wide text-white">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
