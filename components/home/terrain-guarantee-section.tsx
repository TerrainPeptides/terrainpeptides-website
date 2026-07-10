import Image from 'next/image'
import { CircleHelp, ShieldCheck, Truck, FileCheck } from 'lucide-react'

const cards = [
  {
    key: 'purity',
    accent: 'bg-clinical-teal',
    icon: ShieldCheck,
    title: '99% Purity Guaranteed',
    hint: false as const,
    description: 'Every batch verified by HPLC',
  },
  {
    key: 'ship',
    accent: 'bg-primary',
    icon: Truck,
    title: 'Shipment Protection',
    hint: true as const,
    description: 'Every order fully covered',
  },
  {
    key: 'coa',
    accent: 'bg-sky-400',
    icon: FileCheck,
    title: 'CoA with Every Batch',
    hint: true as const,
    description: 'Third party tested in America',
  },
] as const

export function TerrainGuaranteeSection() {
  return (
    <section
      className="bg-white py-14 sm:py-20 lg:py-24"
      aria-labelledby="terrain-guarantee-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-lg border border-border bg-gradient-to-br from-navy via-primary to-navy">
          <div className="flex flex-col items-center gap-6 px-5 py-6 sm:px-8 md:flex-row md:items-center md:justify-between md:gap-8 lg:px-10">
            <div className="relative flex w-full min-w-0 flex-1 items-center justify-center overflow-hidden md:max-w-[42%]">
              <Image
                src="/images/terrain-sticker-9b957e96.png"
                alt="Terrain GHK-Cu research peptide vial sticker"
                width={682}
                height={1024}
                className="h-[260px] w-auto origin-center rotate-[6deg] object-contain sm:h-[300px] md:h-[320px] lg:h-[340px] scale-[1.4] sm:scale-[1.5] md:scale-[1.65]"
              />
            </div>

            <div className="flex w-full flex-1 items-center justify-center">
              <div className="w-full max-w-xl rounded-lg border border-white/10 bg-white px-6 py-5 shadow-lg sm:px-8 sm:py-6 md:max-w-none lg:px-10">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary">
                  Our guarantee
                </p>
                <h2
                  id="terrain-guarantee-heading"
                  className="mt-2 max-w-xl text-balance text-2xl font-semibold tracking-tight text-navy sm:text-3xl"
                >
                  The Terrain Peptides Guarantee
                </h2>
                <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
                  Documented quality for research and laboratory use. Every batch meets our internal purity standards.
                </p>

                <ul className="mt-5 flex w-full flex-col gap-2">
                  {cards.map((c) => (
                    <li
                      key={c.key}
                      className="flex w-full items-stretch overflow-hidden rounded-md border border-border bg-section-subtle"
                    >
                      <div className={`w-1 shrink-0 ${c.accent}`} aria-hidden />
                      <div className="flex flex-1 items-center gap-3 px-4 py-3 sm:px-5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-primary/15 bg-section-clinical">
                          <c.icon className="h-4 w-4 text-primary" aria-hidden />
                        </div>
                        <div className="min-w-0 flex-1 text-left">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <p className="text-sm font-semibold text-navy sm:text-base">{c.title}</p>
                            {c.hint ? (
                              <span className="inline-flex text-muted-foreground" title="More details available at checkout and on product pages">
                                <CircleHelp className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                                <span className="sr-only">More information</span>
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">{c.description}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
