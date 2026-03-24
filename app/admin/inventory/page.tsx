'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import type { Product } from '@/lib/types'

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('terrain-admin-token')}`,
        },
      })
      const data = await res.json()
      setProducts(data.products || [])
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  const saveProduct = async (p: Product) => {
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('terrain-admin-token')}`,
        },
        body: JSON.stringify({
          id: p.id,
          in_stock: p.in_stock,
          stock_level: p.stock_level,
        }),
      })
      if (res.ok) {
        toast.success('Inventory updated')
        fetchProducts()
      } else {
        toast.error('Failed to update inventory')
      }
    } catch {
      toast.error('An error occurred')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Inventory</h1>
        <p className="text-muted-foreground">Set stock levels and in-stock status per product.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Products ({products.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {products.map((p) => (
              <div key={p.id} className="rounded-lg border border-border p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-medium text-foreground">{p.name}</p>
                    <p className="text-sm text-muted-foreground">{p.slug}</p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3 sm:items-end">
                    <div className="flex items-center gap-2">
                      <Switch
                        id={`in_stock_${p.id}`}
                        checked={p.in_stock}
                        onCheckedChange={(checked) => {
                          setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, in_stock: checked } : x)))
                        }}
                      />
                      <Label htmlFor={`in_stock_${p.id}`}>In Stock</Label>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor={`stock_${p.id}`}>Stock Level</Label>
                      <Input
                        id={`stock_${p.id}`}
                        type="number"
                        value={p.stock_level ?? ''}
                        onChange={(e) => {
                          const v = e.target.value === '' ? null : Number(e.target.value)
                          setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, stock_level: v } : x)))
                        }}
                        placeholder="Unlimited"
                      />
                    </div>

                    <Button onClick={() => saveProduct(p)}>Save</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

