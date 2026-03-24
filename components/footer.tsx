import Link from 'next/link'
import Image from 'next/image'

const footerLinks = {
  shop: [
    { href: '/shop?category=individual', label: 'Individual Peptides' },
    { href: '/shop?category=blend', label: 'Branded Blends' },
    { href: '/shop?category=capsule', label: 'Capsules' },
    { href: '/shop?category=accessory', label: 'Accessories' },
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
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/">
              <Image
                src="/images/terrain-wordmark.png"
                alt="Terrain Peptides"
                width={160}
                height={36}
                className="h-8 w-auto"
              />
            </Link>
            <p className="text-sm text-muted-foreground">
              Premium research peptides for scientific applications. All products are strictly for laboratory research use only.
            </p>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">Shop</h3>
            <ul className="space-y-3">
              {footerLinks.shop.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-muted-foreground">
              {new Date().getFullYear()} Terrain Peptides. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground">
              For research purposes only. Not for human consumption.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
