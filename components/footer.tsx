import Link from 'next/link'
import Image from 'next/image'
import { ShieldCheck } from 'lucide-react'

const footerLinks = {
  shop: [
    { href: '/shop', label: 'All Products' },
    { href: '/shop?category=fat-loss', label: 'Fat Loss' },
    { href: '/shop?category=skin-collagen', label: 'Skin & Collagen' },
    { href: '/shop?category=sleep', label: 'Sleep' },
    { href: '/shop?category=cognitive', label: 'Cognitive' },
    { href: '/shop?category=performance', label: 'Performance' },
  ],
  support: [
    { href: '/faq', label: 'FAQ' },
    { href: '/contact', label: 'Contact Us' },
    { href: '/track', label: 'Track Order' },
  ],
  legal: [
    { href: '/terms', label: 'Terms of Service' },
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/disclaimer', label: 'Research Disclaimer' },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-navy text-white">
      <div className="clinical-strip" aria-hidden />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-wrap items-center gap-3 rounded-md border border-white/10 bg-white/5 px-4 py-3">
          <ShieldCheck className="h-4 w-4 shrink-0 text-sky-300" aria-hidden />
          <p className="text-xs leading-relaxed text-white/75 sm:text-sm">
            All products are strictly for laboratory research use only. Not for human or veterinary consumption.
          </p>
        </div>

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Link href="/">
              <Image
                src="/images/terrain-logo.png"
                alt="Terrain Peptides"
                width={603}
                height={278}
                className="h-9 w-auto brightness-0 invert sm:h-10"
              />
            </Link>
            <p className="text-sm leading-relaxed text-white/60">
              Premium research peptides for scientific applications. Third-party tested with certificate of analysis on every batch.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-white/85">Catalog</h3>
            <ul className="space-y-2.5">
              {footerLinks.shop.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/55 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-white/85">Support</h3>
            <ul className="space-y-2.5">
              {footerLinks.support.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/55 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-white/85">Legal</h3>
            <ul className="space-y-2.5">
              {footerLinks.legal.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/55 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6">
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-xs text-white/40">
              &copy; {new Date().getFullYear()} Terrain Peptides. All rights reserved.
            </p>
            <p className="text-xs text-white/40">
              For research purposes only. Not for human consumption.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
