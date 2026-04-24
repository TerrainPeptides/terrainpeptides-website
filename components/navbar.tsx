'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Fragment, useState } from 'react'
import { useCart } from '@/lib/cart-context'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Menu, ShoppingCart, User, LogOut, CircleUser } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'

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
  const { data: session, status } = useSession()

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
            <Button variant="ghost" size="icon" className="relative text-white hover:bg-white/10 hover:text-white" asChild>
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-medium text-[#0A1628]">
                    {totalItems}
                  </span>
                )}
                <span className="sr-only">Cart</span>
              </Link>
            </Button>
            {status === 'loading' ? null : session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative text-white hover:bg-white/10 hover:text-white">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-xs font-semibold text-white">
                      {session.user?.name?.[0]?.toUpperCase() ?? session.user?.email?.[0]?.toUpperCase() ?? <User className="h-3.5 w-3.5" />}
                    </div>
                    <span className="sr-only">Account</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <div className="px-2 py-1.5">
                    <p className="text-xs font-medium text-foreground">{session.user?.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{session.user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/account" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      My Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 hover:text-white" asChild>
                <Link href="/auth">
                  <CircleUser className="h-5 w-5" />
                  <span className="sr-only">Sign in</span>
                </Link>
              </Button>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="flex items-center justify-self-end gap-2 md:hidden">
            {status === 'loading' ? null : !session ? (
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 hover:text-white" asChild>
                <Link href="/auth">
                  <CircleUser className="h-5 w-5" />
                  <span className="sr-only">Sign in</span>
                </Link>
              </Button>
            ) : null}
            <Button variant="ghost" size="icon" className="relative text-white hover:bg-white/10 hover:text-white" asChild>
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-medium text-[#0A1628]">
                    {totalItems}
                  </span>
                )}
                <span className="sr-only">Cart</span>
              </Link>
            </Button>
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
                  <div className="border-t pt-4">
                    {session ? (
                      <div className="flex flex-col gap-3">
                        <div>
                          <p className="text-sm font-medium">{session.user?.name}</p>
                          <p className="text-xs text-muted-foreground">{session.user?.email}</p>
                        </div>
                        <button
                          onClick={() => { signOut({ callbackUrl: '/' }); setIsOpen(false) }}
                          className="flex items-center gap-2 text-sm text-destructive"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      </div>
                    ) : (
                      <Link
                        href="/auth"
                        onClick={() => setIsOpen(false)}
                        className="text-lg font-medium text-foreground/80 transition-colors hover:text-foreground"
                      >
                        Sign In
                      </Link>
                    )}
                  </div>
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
