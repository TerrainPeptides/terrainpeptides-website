'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Fragment, useState } from 'react'
import { useCart } from '@/lib/cart-context'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { Menu, ShoppingCart } from 'lucide-react'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/affiliates', label: 'Affiliate' },
  { href: '/contact', label: 'Contact' },
  { href: '/faq', label: 'FAQ' },
]

const TICKER_ITEMS = [
  'Free Shipping on Orders $300+',
  '99%+ Purity Guaranteed',
  'Third-Party Tested',
  'Discreet Packaging',
  'USA Warehouse',
  'Research Grade Only',
] as const

/**
 * One marquee cycle: uppercase labels + → after each item; `pr` matches `gap` so two
 * copies tile seamlessly at translateX(-50%) with no dead navy gap.
 */
function NavbarTickerPeriod({ duplicate }: { duplicate?: boolean }) {
  return (
    <div
      className="flex shrink-0 items-center gap-x-6 pr-6 sm:gap-x-8 sm:pr-8 md:gap-x-10 md:pr-10"
      aria-hidden={duplicate}
    >
      {TICKER_ITEMS.map((text) => (
        <Fragment key={duplicate ? `d-${text}` : text}>
          <span className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-800/90 sm:text-xs md:text-[13px]">
            {text}
          </span>
          <span
            className="shrink-0 select-none px-1 text-sm font-medium text-slate-600/75 sm:text-[15px] md:text-base"
            aria-hidden
          >
            →
          </span>
        </Fragment>
      ))}
    </div>
  )
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { totalItems } = useCart()

  return (
    <header className="w-full">
      {/* Fixed Terrain bar stays visible while scrolling; spacer reserves layout height */}
      <div className="fixed top-0 left-0 right-0 z-[100] w-full border-b border-white/10 bg-[#0A1628]">
        <nav className="mx-auto grid h-[3.5rem] max-w-7xl grid-cols-[auto_1fr_auto] items-center px-4 sm:h-[3.75rem] sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center justify-self-start">
            <Image
              src="/images/terrain-wordmark.png"
              alt="Terrain Peptides"
              width={200}
              height={54}
              className="h-9 w-auto brightness-0 invert sm:h-10"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center justify-self-center gap-8 lg:gap-12 md:flex">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-white/90 transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden items-center justify-self-end gap-4 md:flex">
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative text-white hover:bg-white/10 hover:text-white">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-medium text-[#0A1628]">
                    {totalItems}
                  </span>
                )}
                <span className="sr-only">Cart</span>
              </Button>
            </Link>
          </div>

          {/* Mobile Navigation */}
          <div className="flex items-center justify-self-end gap-2 md:hidden">
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative text-white hover:bg-white/10 hover:text-white">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-medium text-[#0A1628]">
                    {totalItems}
                  </span>
                )}
                <span className="sr-only">Cart</span>
              </Button>
            </Link>
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 hover:text-white">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] bg-background">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <div className="flex flex-col gap-6 pt-6">
                  {navLinks.map(link => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="text-lg font-medium text-foreground/80 transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </div>
      <div
        className="h-[3.5rem] shrink-0 sm:h-[3.75rem]"
        aria-hidden
      />

      <div
        className="navbar-ticker navbar-ticker--rolling w-full border-t border-sky-200/80 py-2.5 sm:py-3"
        role="region"
        aria-label="Announcements"
      >
        <div className="overflow-hidden">
          <div className="navbar-ticker__track flex w-max items-center">
            <NavbarTickerPeriod />
            <NavbarTickerPeriod duplicate />
          </div>
        </div>
      </div>
    </header>
  )
}
