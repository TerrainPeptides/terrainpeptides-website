import Image from 'next/image'
import { CircleHelp } from 'lucide-react'

/** Flat seal + check (matches supplied purity artwork style). */
function PurityIcon() {
  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#e6f4ea]">
      <svg width="38" height="38" viewBox="0 0 48 48" fill="none" aria-hidden>
        <circle cx="24" cy="24" r="17" fill="#6b9f7a" />
        <path
          d="M16 24.5l4.5 4.5L33 17.5"
          stroke="white"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

/** Delivery truck (flat, motion lines). */
function TruckIcon() {
  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#e3f0fb]">
      <svg width="36" height="36" viewBox="0 0 48 48" fill="none" aria-hidden>
        <path
          fill="#2563eb"
          d="M10 14h20v12h-4v-2H12v2h-2V16c0-1.1.9-2 2-2Zm22 10h6l4 4v4h-4v-4h-6v-4Z"
        />
        <rect x="6" y="26" width="4" height="2" rx="0.5" fill="#2563eb" opacity="0.35" />
        <rect x="11" y="26" width="4" height="2" rx="0.5" fill="#2563eb" opacity="0.5" />
        <rect x="16" y="26" width="4" height="2" rx="0.5" fill="#2563eb" opacity="0.65" />
        <circle cx="14" cy="34" r="2.5" fill="#1e40af" />
        <circle cx="28" cy="34" r="2.5" fill="#1e40af" />
        <circle cx="38" cy="34" r="2.5" fill="#1e40af" />
      </svg>
    </div>
  )
}

/** Tilted tube + droplet. */
function LabIcon() {
  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#fef9e7]">
      <svg width="36" height="36" viewBox="0 0 48 48" fill="none" aria-hidden>
        <g transform="rotate(35 24 24)">
          <rect x="19" y="10" width="10" height="22" rx="1" fill="#9a7238" />
          <rect x="21" y="8" width="6" height="3" rx="1" fill="#9a7238" />
          <path d="M21 16h6M21 20h5M21 24h4" stroke="#fef9e7" strokeWidth="1.2" strokeLinecap="round" />
        </g>
        <path
          d="M34 14c1.5 2 2.5 3.5 2.5 5a2.5 2.5 0 11-5 0c0-1.5 1-3 2.5-5z"
          fill="#9a7238"
          transform="translate(2 2)"
        />
      </svg>
    </div>
  )
}

const cards = [
  {
    key: 'purity',
    accent: 'bg-emerald-300',
    icon: <PurityIcon />,
    title: '99% Purity Guaranteed',
    hint: false as const,
    description: 'Every batch verified',
  },
  {
    key: 'ship',
    accent: 'bg-sky-300',
    icon: <TruckIcon />,
    title: 'Shipment Protection',
    hint: true as const,
    description: 'Every order fully covered',
  },
  {
    key: 'coa',
    accent: 'bg-amber-200',
    icon: <LabIcon />,
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
        <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-[#527da3] via-[#2a4568] via-[38%] to-[#0A1628] px-5 py-4 sm:px-8 sm:py-5 md:px-10 md:py-6">
          <div className="flex flex-col items-center gap-6 md:flex-row md:items-center md:justify-between md:gap-6 lg:gap-8">
            {/* Left — vial scaled up visually without growing the section */}
            <div className="relative flex w-full min-w-0 flex-1 items-center justify-center overflow-hidden md:max-w-[48%]">
              <Image
                src="/images/terrain-sticker-9b957e96.png"
                alt="Terrain GHK-Cu research peptide vial sticker"
                width={682}
                height={1024}
                className="h-[300px] w-auto origin-center rotate-[8deg] object-contain sm:h-[340px] md:h-[360px] lg:h-[380px] scale-[1.55] sm:scale-[1.65] md:scale-[1.85] lg:scale-[2]"
              />
            </div>

            {/* Right — guarantee card, matched height alignment */}
            <div className="flex w-full flex-1 items-center justify-center">
              <div className="w-full max-w-xl rounded-2xl bg-white px-6 py-5 shadow-lg sm:rounded-3xl sm:px-8 sm:py-6 md:max-w-none md:px-10 lg:px-12">
                <h2
                  id="terrain-guarantee-heading"
                  className="max-w-xl text-balance text-2xl font-bold tracking-tight text-[#0A1628] sm:text-3xl lg:text-[2rem]"
                >
                  The Terrain Peptides Guarantee
                </h2>
                <p className="mt-2 max-w-lg text-sm leading-relaxed text-[#0A1628]/70 sm:text-base">
                  Documented quality for research and laboratory use. Every batch meets our internal purity standards.
                </p>

                <ul className="mt-5 flex w-full flex-col gap-2.5">
                  {cards.map((c) => (
                    <li
                      key={c.key}
                      className="flex w-full items-stretch overflow-hidden rounded-2xl border border-[#0A1628]/8 bg-[#F8FAFC] shadow-sm"
                    >
                      <div className={`w-1 shrink-0 ${c.accent}`} aria-hidden />
                      <div className="flex flex-1 items-center gap-4 px-4 py-3 sm:px-5">
                        <div className="flex shrink-0 justify-center">{c.icon}</div>
                        <div className="min-w-0 flex-1 text-left">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <p className="text-sm font-bold text-[#0A1628] sm:text-base">{c.title}</p>
                            {c.hint ? (
                              <span className="inline-flex text-[#0A1628]/40" title="More details available at checkout and on product pages">
                                <CircleHelp className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                                <span className="sr-only">More information</span>
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-0.5 text-xs text-[#0A1628]/55 sm:text-sm">{c.description}</p>
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
