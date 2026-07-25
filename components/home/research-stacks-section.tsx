import Link from 'next/link'
import Image from 'next/image'

const STACKS = [
  {
    title: 'weight & metabolic',
    blurb: 'glp-3 pathways, metabolic panels',
    href: '/shop?category=fat-loss',
    image: '/images/glp-3-rt-vial.png',
    imageAlt: 'GLP-3 RT research peptide vial',
  },
  {
    title: 'recovery & repair',
    blurb: 'tissue, tendon and gut models',
    href: '/shop?category=performance',
    image: '/images/bpc-157-vial.png',
    imageAlt: 'BPC-157 research peptide vial',
  },
  {
    title: 'skin & glow',
    blurb: 'collagen, copper peptides, glow',
    href: '/shop?category=skin-collagen',
    image: '/images/ghk-cu-vial.png',
    imageAlt: 'GHK-Cu research peptide vial',
  },
  {
    title: 'focus & mood',
    blurb: 'the cognitive research trio',
    href: '/shop?category=cognitive',
    image: '/images/semax-vial.png',
    imageAlt: 'Semax research peptide vial',
  },
  {
    title: 'longevity & energy',
    blurb: 'nad+, mitochondrial studies',
    href: '/shop?category=performance',
    image: '/images/nad-vial.png',
    imageAlt: 'NAD+ research peptide vial',
  },
  {
    title: 'sleep & recovery',
    blurb: 'sleep architecture models',
    href: '/shop?category=sleep',
    image: '/images/dsip-vial.png',
    imageAlt: 'DSIP research peptide vial',
  },
] as const

export function ResearchStacksSection() {
  return (
    <section className="border-b border-black/8 bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl">
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.2em] text-black/40">
            Build your stack
          </p>
          <h2 className="mt-3 text-[1.75rem] font-semibold tracking-tight text-black sm:text-[2rem]">
            What are you researching?
          </h2>
          <p className="mt-3 text-[0.925rem] leading-relaxed text-black/50">
            Pick a lane and shop the compounds that belong together — curated by research goal, COA
            included with every batch.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 lg:gap-4">
          {STACKS.map((stack) => (
            <Link
              key={stack.title}
              href={stack.href}
              className="group flex flex-col rounded-2xl border border-[#0e2e1d]/20 bg-white px-4 pb-4 pt-5 transition-[border-color,box-shadow] duration-200 hover:border-[#0e2e1d]/40 hover:shadow-[0_6px_20px_rgba(14,46,29,0.08)] sm:px-5 sm:pb-5 sm:pt-6"
            >
              <div className="relative mx-auto flex h-[120px] w-full items-center justify-center sm:h-[140px]">
                <Image
                  src={stack.image}
                  alt={stack.imageAlt}
                  width={160}
                  height={200}
                  className="h-full w-auto object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                />
              </div>

              <div className="mt-3 sm:mt-4">
                <h3 className="text-[0.95rem] font-semibold tracking-tight text-black sm:text-[1.05rem]">
                  {stack.title}
                </h3>
                <p className="mt-0.5 text-[0.8rem] leading-snug text-black/45">{stack.blurb}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
