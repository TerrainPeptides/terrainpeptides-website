'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Upload, FileText } from 'lucide-react'
import type { Product } from '@/lib/types'

export default function AdminCOAPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState('')
  const [coaUrl, setCoaUrl] = useState('')

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
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateCOA = async () => {
    if (!selectedProduct || !coaUrl.trim()) {
      toast.error('Please select a product and enter a COA URL')
      return
    }

    try {
      const res = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('terrain-admin-token')}`,
        },
        body: JSON.stringify({ id: selectedProduct, coa_url: coaUrl }),
      })

      if (res.ok) {
        toast.success('COA URL updated')
        setCoaUrl('')
        setSelectedProduct('')
        fetchProducts()
      } else {
        toast.error('Failed to update COA')
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

  const productsWithCOA = products.filter((p) => p.coa_url)
  const productsWithoutCOA = products.filter((p) => !p.coa_url)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">COA Images</h1>
        <p className="text-muted-foreground">
          Manage Certificate of Analysis documents for products.
        </p>
      </div>

      {/* Upload Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Add COA URL
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Product</Label>
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger>
                <SelectValue placeholder="Select a product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>COA URL</Label>
            <Input
              value={coaUrl}
              onChange={(e) => setCoaUrl(e.target.value)}
              placeholder="https://example.com/coa/product-coa.pdf"
            />
          </div>
          <Button onClick={handleUpdateCOA} className="gap-2">
            <Upload className="h-4 w-4" />
            Update COA
          </Button>
        </CardContent>
      </Card>

      {/* Products with COA */}
      <Card>
        <CardHeader>
          <CardTitle className="text-green-600">
            Products with COA ({productsWithCOA.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {productsWithCOA.length > 0 ? (
            <div className="space-y-3">
              {productsWithCOA.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between rounded-lg border border-border p-4"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-foreground">{product.name}</p>
                      <p className="text-sm text-muted-foreground truncate max-w-md">
                        {product.coa_url}
                      </p>
                    </div>
                  </div>
                  <a
                    href={product.coa_url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    View COA
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              No products have COA documents yet.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Products without COA */}
      <Card>
        <CardHeader>
          <CardTitle className="text-yellow-600">
            Products without COA ({productsWithoutCOA.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {productsWithoutCOA.length > 0 ? (
            <div className="space-y-3">
              {productsWithoutCOA.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 rounded-lg border border-border p-4"
                >
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <p className="font-medium text-foreground">{product.name}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              All products have COA documents.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
