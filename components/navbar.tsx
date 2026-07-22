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
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
  { href: '/affiliates', label: 'Affiliate' },
]

const TICKER_ITEMS = [
  'Free Shipping on Orders $300+',
  '99%+ Purity — HPLC Verified',
  'Third-Party Tested COA Included',
  'USA Warehouse — Fast Delivery',
  'Research Grade Only',
] as const

function NavbarTickerPeriod({ duplicate }: { duplicate?: boolean }) {
  return (
    <div
      className="flex shrink-0 items-center gap-x-8 pr-8 sm:gap-x-10 sm:pr-10 md:gap-x-12 md:pr-12"
      aria-hidden={duplicate}
    >
      {TICKER_ITEMS.map((text) => (
        <Fragment key={duplicate ? `d-${text}` : text}>
          <span className="whitespace-nowrap text-xs font-medium uppercase tracking-[0.14em] text-black/75 sm:text-[0.8125rem]">
            {text}
          </span>
          <span className="shrink-0 select-none text-black/35" aria-hidden>
            ◆
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
      <div className="fixed top-0 left-0 right-0 z-[100] w-full border-b border-border bg-white/95 backdrop-blur-md">
        <nav className="mx-auto grid h-[3.75rem] max-w-7xl grid-cols-[auto_1fr_auto] items-center px-4 sm:h-16 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center justify-self-start">
            <Image
              src="/images/terrain-logo.png"
              alt="Terrain Peptides"
              width={603}
              height={278}
              className="h-9 w-auto sm:h-10"
              priority
            />
          </Link>

          <div className="hidden items-center justify-self-center gap-0.5 md:flex lg:gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-sm px-4 py-2 text-[0.8rem] font-medium uppercase tracking-[0.1em] text-black transition-colors hover:bg-[#f4f4f5] hover:text-black lg:px-5"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center justify-self-end gap-2 md:flex">
            <Button
              variant="ghost"
              size="icon"
              className="relative text-black hover:bg-[#f4f4f5] hover:text-black"
              asChild
            >
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4.5 w-4.5 min-w-[1.125rem] items-center justify-center rounded-sm bg-terrain text-[10px] font-bold text-white">
                    {totalItems}
                  </span>
                )}
                <span className="sr-only">Cart</span>
              </Link>
            </Button>
            {status === 'loading' ? null : session ? (
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative shrink-0 text-black hover:bg-[#f4f4f5] hover:text-black"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-sm border border-border bg-section-subtle text-xs font-bold text-terrain-deep">
                      {session.user?.name?.[0]?.toUpperCase() ??
                        session.user?.email?.[0]?.toUpperCase() ?? (
                          <User className="h-3.5 w-3.5" />
                        )}
                    </div>
                    <span className="sr-only">Account</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  side="bottom"
                  sideOffset={8}
                  collisionPadding={16}
                  className="z-[200] w-52"
                >
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
              <Button
                variant="ghost"
                size="icon"
                className="text-black hover:bg-[#f4f4f5] hover:text-black"
                asChild
              >
                <Link href="/auth">
                  <CircleUser className="h-5 w-5" />
                  <span className="sr-only">Sign in</span>
                </Link>
              </Button>
            )}
          </div>

          <div className="flex items-center justify-self-end gap-1 md:hidden">
            {status === 'loading' ? null : session ? (
              <Button variant="ghost" size="icon" className="shrink-0 text-black hover:bg-[#f4f4f5]" asChild>
                <Link href="/account">
                  <div className="flex h-7 w-7 items-center justify-center rounded-sm border border-border bg-section-subtle text-xs font-bold text-terrain-deep">
                    {session.user?.name?.[0]?.toUpperCase() ??
                      session.user?.email?.[0]?.toUpperCase() ?? (
                        <User className="h-3.5 w-3.5" />
                      )}
                  </div>
                  <span className="sr-only">Account</span>
                </Link>
              </Button>
            ) : (
              <Button variant="ghost" size="icon" className="text-black hover:bg-[#f4f4f5]" asChild>
                <Link href="/auth">
                  <CircleUser className="h-5 w-5" />
                  <span className="sr-only">Sign in</span>
                </Link>
              </Button>
            )}
            <Button variant="ghost" size="icon" className="relative text-black hover:bg-[#f4f4f5]" asChild>
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4.5 w-4.5 min-w-[1.125rem] items-center justify-center rounded-sm bg-terrain text-[10px] font-bold text-white">
                    {totalItems}
                  </span>
                )}
                <span className="sr-only">Cart</span>
              </Link>
            </Button>
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-black hover:bg-[#f4f4f5]">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] bg-background">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <div className="flex flex-col gap-1 pt-6">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="rounded-sm px-3 py-2.5 text-sm font-medium uppercase tracking-[0.08em] text-black transition-colors hover:bg-[#f4f4f5] hover:text-black"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="mt-4 border-t border-border pt-4">
                    {session ? (
                      <div className="flex flex-col gap-3 px-3">
                        <div>
                          <p className="text-sm font-medium">{session.user?.name}</p>
                          <p className="text-xs text-muted-foreground">{session.user?.email}</p>
                        </div>
                        <Link
                          href="/account"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-2 text-sm font-medium text-black"
                        >
                          <User className="h-4 w-4" />
                          My Account
                        </Link>
                        <button
                          onClick={() => {
                            signOut({ callbackUrl: '/' })
                            setIsOpen(false)
                          }}
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
                        className="block rounded-sm px-3 py-2.5 text-sm font-medium uppercase tracking-[0.08em] text-black hover:bg-[#f4f4f5] hover:text-black"
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
      <div className="h-[3.75rem] shrink-0 sm:h-16" aria-hidden />

      <div
        className="navbar-ticker navbar-ticker--rolling w-full py-2.5"
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
