'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { 
  Package, 
  ShoppingCart, 
  Star, 
  FileText, 
  Tag, 
  Percent,
  Boxes,
  Mail,
  LogOut,
  Menu
} from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { LEGACY_LOCAL_STORAGE_KEYS } from '@/lib/legacy-brand-storage'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: Package },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/inventory', label: 'Inventory', icon: Boxes },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/vouches', label: 'Reviews', icon: Star },
  { href: '/admin/coa', label: 'COA', icon: FileText },
  { href: '/admin/referrals', label: 'Referral Codes', icon: Tag },
  { href: '/admin/discounts', label: 'Discount Codes', icon: Percent },
  { href: '/admin/messages', label: 'Messages', icon: Mail },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const legacy = localStorage.getItem(LEGACY_LOCAL_STORAGE_KEYS.adminToken)
    let token = localStorage.getItem('terrain-admin-token')
    if (!token && legacy) {
      localStorage.setItem('terrain-admin-token', legacy)
      token = legacy
    }
    if (legacy) localStorage.removeItem(LEGACY_LOCAL_STORAGE_KEYS.adminToken)

    if (!token && pathname !== '/admin/login') {
      router.push('/admin/login')
    } else if (token) {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [pathname, router])

  const handleLogout = () => {
    localStorage.removeItem('terrain-admin-token')
    localStorage.removeItem(LEGACY_LOCAL_STORAGE_KEYS.adminToken)
    router.push('/admin/login')
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-muted/30">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  if (!isAuthenticated) {
    return null
  }

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-border px-4">
        <Link href="/admin">
          <Image
            src="/images/terrain-wordmark.png"
            alt="Terrain Peptides Admin"
            width={220}
            height={60}
            className="h-8 w-auto"
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-border p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-muted/30">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 border-r border-border bg-background lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile Header & Sidebar */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border bg-background px-4 lg:hidden">
          <Link href="/admin">
            <Image
              src="/images/terrain-wordmark.png"
              alt="Terrain Peptides"
              width={200}
              height={50}
              className="h-7 w-auto"
            />
          </Link>
          <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SheetTitle className="sr-only">Admin Navigation</SheetTitle>
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
