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
import { Upload, FileText, Loader2, X } from 'lucide-react'
import type { Product } from '@/lib/types'

const MAX_PDF_BYTES = 15 * 1024 * 1024

export default function AdminCOAPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState('')
  const [coaPayload, setCoaPayload] = useState('')
  const [urlDraft, setUrlDraft] = useState('')
  const [saving, setSaving] = useState(false)

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

  const handlePdfSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (file.type !== 'application/pdf') {
      toast.error('Please choose a PDF file')
      return
    }
    if (file.size > MAX_PDF_BYTES) {
      toast.error('PDF must be 15MB or smaller')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setCoaPayload(String(reader.result || ''))
      setUrlDraft('')
    }
    reader.onerror = () => toast.error('Could not read that file')
    reader.readAsDataURL(file)
  }

  const handleUpdateCOA = async () => {
    const value = coaPayload.trim() || urlDraft.trim()
    if (!selectedProduct || !value) {
      toast.error('Select a product and upload a PDF or enter a COA URL')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('terrain-admin-token')}`,
        },
        body: JSON.stringify({ id: selectedProduct, coa_url: value }),
      })

      if (res.ok) {
        toast.success('COA updated')
        setCoaPayload('')
        setUrlDraft('')
        setSelectedProduct('')
        fetchProducts()
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error(typeof data.error === 'string' ? data.error : 'Failed to update COA')
      }
    } catch {
      toast.error('An error occurred')
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const handleRemoveCOA = async (productId: string) => {
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('terrain-admin-token')}`,
        },
        body: JSON.stringify({ id: productId, coa_url: null }),
      })
      if (res.ok) {
        toast.success('COA removed')
        fetchProducts()
      } else {
        toast.error('Failed to remove COA')
      }
    } catch {
      toast.error('An error occurred')
    }
  }

  const productsWithCOA = products.filter((p) => p.coa_url)
  const productsWithoutCOA = products.filter((p) => !p.coa_url)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">COA documents</h1>
        <p className="text-muted-foreground">
          Upload PDF certificates of analysis or paste a hosted URL. Customers can scroll through PDFs
          on the product page.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Add or replace COA
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
            <Label>Upload PDF</Label>
            <Input
              type="file"
              accept="application/pdf,.pdf"
              className="cursor-pointer"
              onChange={handlePdfSelected}
            />
            <p className="text-xs text-muted-foreground">PDF only, up to 15MB. Stored in your product bucket.</p>
          </div>
          <div className="space-y-2">
            <Label>Or COA URL</Label>
            <Input
              value={urlDraft}
              onChange={(e) => {
                setUrlDraft(e.target.value)
                setCoaPayload('')
              }}
              placeholder="https://example.com/coa/batch.pdf"
            />
            {coaPayload.startsWith('data:application/pdf') && (
              <p className="text-sm text-green-600 dark:text-green-500">
                PDF loaded — save to attach it to the selected product.
              </p>
            )}
          </div>
          <Button onClick={handleUpdateCOA} disabled={saving} className="gap-2">
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Save COA
          </Button>
        </CardContent>
      </Card>

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
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="h-5 w-5 shrink-0 text-green-600" />
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">{product.name}</p>
                      <p className="text-sm text-muted-foreground truncate" title={product.coa_url || ''}>
                        {product.coa_url}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <a
                      href={product.coa_url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      Open
                    </a>
                    <button
                      type="button"
                      onClick={() => handleRemoveCOA(product.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                      title="Remove COA"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
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
