const STANDARDS = [
  {
    n: '01',
    title: 'Proven purity',
    body: 'Independently verified by accredited labs so identity and potency match the label — every batch.',
  },
  {
    n: '02',
    title: 'Precise dosage',
    body: 'Measured, sealed, and documented for reproducible research outcomes.',
  },
  {
    n: '03',
    title: 'Consistent quality',
    body: 'GMP-aligned sourcing and HPLC confirmation before compounds leave our warehouse.',
  },
  {
    n: '04',
    title: 'Research use only',
    body: 'Labeled and sold strictly for laboratory and analytical applications.',
  },
  {
    n: '05',
    title: 'Full documentation',
    body: 'Certificates of Analysis ship with every order — transparency as standard, not a request.',
  },
] as const

export function QualitySection() {
  return (
    <section className="border-b border-black/8 bg-[#f7f7f8] py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="section-index">02 Standards</p>
        <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-black sm:text-[2.5rem]">
          Five things we get right, every batch.
        </h2>

        <ol className="mt-12 overflow-hidden rounded-2xl border border-black/10 bg-white">
          {STANDARDS.map((item, idx) => (
            <li
              key={item.n}
              className={`grid gap-3 border-l-2 border-l-[#0e2e1d]/20 px-5 py-7 sm:grid-cols-[4rem_minmax(0,12rem)_1fr] sm:items-start sm:gap-8 sm:px-8 ${
                idx !== STANDARDS.length - 1 ? 'border-b border-black/10' : ''
              }`}
            >
              <span className="font-mono text-sm font-medium text-[#0e2e1d]/60">{item.n}</span>
              <h3 className="text-lg font-semibold text-black">{item.title}</h3>
              <p className="text-sm leading-relaxed text-black/55">{item.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
