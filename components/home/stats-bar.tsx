const stats = [
  { value: '99%+', label: 'Purity Standard' },
  { value: '50K+', label: 'Orders Fulfilled' },
  { value: '4.9/5', label: 'Customer Rating' },
  { value: '24/7', label: 'Support Available' },
]

export function StatsBar() {
  return (
    <section className="border-b border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-bold text-foreground sm:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
