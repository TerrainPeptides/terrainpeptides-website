'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { nanoid } from 'nanoid'
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import type { Product } from '@/lib/types'

type VariantFormRow = { id: string; label: string; price_dollars: string }

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category: 'performance',
    description: '',
    overview: '',
    price_cents: 0,
    dosage: '',
    purity: '99%+',
    molecular_weight: '',
    sequence: '',
    research_benefits: '',
    research_studies: '',
    stock_level: '',
    vial_count: 1,
    in_stock: true,
    featured: false,
    hidden: false,
    image_url: '' as string,
    coa_url: '' as string,
    dosage_variants: [] as VariantFormRow[],
  })

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const dosage_variants = formData.dosage_variants
      .filter((v) => v.label.trim())
      .map((v) => ({
        id: v.id.trim() || nanoid(10),
        label: v.label.trim(),
        price_cents: Math.round(parseFloat(v.price_dollars || '0') * 100),
      }))

    if (dosage_variants.some((v) => v.price_cents <= 0)) {
      toast.error('Each dosage variant needs a price greater than $0')
      return
    }

    const { dosage_variants: _rows, ...formRest } = formData

    const payload = {
      ...formRest,
      research_benefits: formData.research_benefits
        .split('\n')
        .filter((b) => b.trim()),
      research_studies: formData.research_studies?.trim() || null,
      stock_level: formData.stock_level === '' ? null : Number(formData.stock_level),
      overview: formData.overview?.trim() || null,
      vial_count: formData.vial_count ?? 1,
      hidden: formData.hidden ?? false,
      image_url: formData.image_url || null,
      coa_url: formData.coa_url || null,
      dosage_variants: dosage_variants.length > 0 ? dosage_variants : null,
    }

    try {
      const res = await fetch('/api/admin/products', {
        method: editingProduct ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('terrain-admin-token')}`,
        },
        body: JSON.stringify(
          editingProduct ? { id: editingProduct.id, ...payload } : payload
        ),
      })

      if (res.ok) {
        toast.success(editingProduct ? 'Product updated' : 'Product created')
        setIsDialogOpen(false)
        setEditingProduct(null)
        resetForm()
        fetchProducts()
      } else {
        const err = await res.json().catch(() => ({}))
        toast.error(err?.error || 'Failed to save product')
      }
    } catch {
      toast.error('An error occurred')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const res = await fetch(`/api/admin/products?id=${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('terrain-admin-token')}`,
        },
      })

      if (res.ok) {
        toast.success('Product deleted')
        fetchProducts()
      } else {
        toast.error('Failed to delete product')
      }
    } catch {
      toast.error('An error occurred')
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      slug: product.slug,
      category: product.category,
      description: product.description || '',
      overview: product.overview || '',
      price_cents: product.price_cents,
      dosage: product.dosage || '',
      purity: product.purity || '99%+',
      molecular_weight: product.molecular_weight || '',
      sequence: product.sequence || '',
      research_benefits: product.research_benefits?.join('\n') || '',
      research_studies: product.research_studies || '',
      stock_level: product.stock_level === null || product.stock_level === undefined ? '' : String(product.stock_level),
      vial_count: product.vial_count ?? 1,
      in_stock: product.in_stock,
      featured: product.featured,
      hidden: product.hidden ?? false,
      image_url: product.image_url || '',
      coa_url: product.coa_url || '',
      dosage_variants:
        product.dosage_variants?.map((v) => ({
          id: v.id,
          label: v.label,
          price_dollars: (v.price_cents / 100).toFixed(2),
        })) ?? [],
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      category: 'performance',
      description: '',
      overview: '',
      price_cents: 0,
      dosage: '',
      purity: '99%+',
      molecular_weight: '',
      sequence: '',
      research_benefits: '',
      research_studies: '',
      stock_level: '',
      vial_count: 1,
    in_stock: true,
    featured: false,
    hidden: false,
    image_url: '',
    coa_url: '',
    dosage_variants: [],
  })
  }

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100)
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog.</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={async () => {
              try {
                const res = await fetch('/api/admin/products', {
                  method: 'PATCH',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('terrain-admin-token')}`,
                  },
                  body: JSON.stringify({ action: 'unhide-all' }),
                })
                const data = await res.json()
                if (res.ok) {
                  toast.success(`Unhidden ${data.unhidden ?? 0} products`)
                  fetchProducts()
                } else {
                  const msg = data?.error || 'Failed'
                  toast.error(msg.length > 100 ? 'Run the migration first (see console)' : msg)
                  if (msg.includes('ALTER TABLE')) console.info('Run this in Supabase SQL Editor:\n', msg)
                }
              } catch {
                toast.error('Failed to unhide products')
              }
            }}
          >
            Unhide all products
          </Button>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) {
            setEditingProduct(null)
            resetForm()
          }
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    required
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fat-loss">Fat Loss</SelectItem>
                      <SelectItem value="skin-collagen">Skin &amp; Collagen</SelectItem>
                      <SelectItem value="sleep">Sleep</SelectItem>
                      <SelectItem value="cognitive">Cognitive</SelectItem>
                      <SelectItem value="performance">Performance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">
                    Price per vial (cents)
                    {formData.dosage_variants.length > 0 && (
                      <span className="ml-1 font-normal text-muted-foreground">
                        (ignored when variants below — uses first variant)
                      </span>
                    )}
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    required={formData.dosage_variants.length === 0}
                    value={formData.price_cents}
                    onChange={(e) =>
                      setFormData({ ...formData, price_cents: Number(e.target.value) })
                    }
                    disabled={formData.dosage_variants.length > 0}
                  />
                </div>
              </div>

              <div className="rounded-lg border border-border p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <Label>Dosage variants</Label>
                    <p className="text-xs text-muted-foreground">
                      Optional: multiple strengths with different prices. Order = display order; first is the default on the shop.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0 gap-1"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        dosage_variants: [
                          ...prev.dosage_variants,
                          { id: nanoid(10), label: '', price_dollars: '' },
                        ],
                      }))
                    }
                  >
                    <Plus className="h-4 w-4" />
                    Add variant
                  </Button>
                </div>
                {formData.dosage_variants.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No variants — single price and dosage field below apply.</p>
                ) : (
                  <ul className="space-y-2">
                    {formData.dosage_variants.map((row, index) => (
                      <li
                        key={row.id}
                        className="flex flex-wrap items-end gap-2 rounded-md border border-border bg-muted/30 p-3"
                      >
                        <div className="min-w-[100px] flex-1 space-y-1">
                          <Label className="text-xs">Label</Label>
                          <Input
                            placeholder="e.g. 5mg"
                            value={row.label}
                            onChange={(e) => {
                              const next = [...formData.dosage_variants]
                              next[index] = { ...row, label: e.target.value }
                              setFormData({ ...formData, dosage_variants: next })
                            }}
                          />
                        </div>
                        <div className="w-28 space-y-1">
                          <Label className="text-xs">Price ($/vial)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min={0}
                            placeholder="0.00"
                            value={row.price_dollars}
                            onChange={(e) => {
                              const next = [...formData.dosage_variants]
                              next[index] = { ...row, price_dollars: e.target.value }
                              setFormData({ ...formData, dosage_variants: next })
                            }}
                          />
                        </div>
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 shrink-0"
                            disabled={index === 0}
                            onClick={() => {
                              const next = [...formData.dosage_variants]
                              ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
                              setFormData({ ...formData, dosage_variants: next })
                            }}
                            aria-label="Move up"
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 shrink-0"
                            disabled={index === formData.dosage_variants.length - 1}
                            onClick={() => {
                              const next = [...formData.dosage_variants]
                              ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
                              setFormData({ ...formData, dosage_variants: next })
                            }}
                            aria-label="Move down"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 shrink-0 text-destructive"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                dosage_variants: formData.dosage_variants.filter((_, i) => i !== index),
                              })
                            }
                            aria-label="Remove variant"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="overview">Overview (shows under product name)</Label>
                <Input
                  id="overview"
                  value={formData.overview}
                  onChange={(e) =>
                    setFormData({ ...formData, overview: e.target.value })
                  }
                  placeholder="e.g. Copper Peptide for Regenerative Research"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="dosage">
                    Dosage
                    {formData.dosage_variants.length > 0 && (
                      <span className="ml-1 font-normal text-muted-foreground">
                        (synced from first variant)
                      </span>
                    )}
                  </Label>
                  <Input
                    id="dosage"
                    value={formData.dosage}
                    onChange={(e) =>
                      setFormData({ ...formData, dosage: e.target.value })
                    }
                    disabled={formData.dosage_variants.length > 0}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purity">Purity</Label>
                  <Input
                    id="purity"
                    value={formData.purity}
                    onChange={(e) =>
                      setFormData({ ...formData, purity: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="molecular_weight">Molecular Weight</Label>
                  <Input
                    id="molecular_weight"
                    value={formData.molecular_weight}
                    onChange={(e) =>
                      setFormData({ ...formData, molecular_weight: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sequence">Amino Acid Sequence</Label>
                <Textarea
                  id="sequence"
                  rows={2}
                  value={formData.sequence}
                  onChange={(e) =>
                    setFormData({ ...formData, sequence: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="research_benefits">Research Benefits (one per line)</Label>
                <Textarea
                  id="research_benefits"
                  rows={3}
                  value={formData.research_benefits}
                  onChange={(e) =>
                    setFormData({ ...formData, research_benefits: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="research_studies">Research Studies (text)</Label>
                <Textarea
                  id="research_studies"
                  rows={4}
                  value={formData.research_studies}
                  onChange={(e) =>
                    setFormData({ ...formData, research_studies: e.target.value })
                  }
                  placeholder="Paste study notes, citations, or summary text..."
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="product_image">Product Image Upload</Label>
                  <Input
                    id="product_image"
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      const reader = new FileReader()
                      reader.onload = () => {
                        setFormData((prev) => ({ ...prev, image_url: String(reader.result || '') }))
                      }
                      reader.readAsDataURL(file)
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coa_image">COA Image Upload</Label>
                  <Input
                    id="coa_image"
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      const reader = new FileReader()
                      reader.onload = () => {
                        setFormData((prev) => ({ ...prev, coa_url: String(reader.result || '') }))
                      }
                      reader.readAsDataURL(file)
                    }}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="stock_level">Inventory Stock Level</Label>
                  <Input
                    id="stock_level"
                    type="number"
                    value={formData.stock_level}
                    onChange={(e) =>
                      setFormData({ ...formData, stock_level: e.target.value })
                    }
                    placeholder="Leave blank for unlimited"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vial_count">Vials per unit (count)</Label>
                  <Input
                    id="vial_count"
                    type="number"
                    min={1}
                    value={formData.vial_count}
                    onChange={(e) =>
                      setFormData({ ...formData, vial_count: Math.max(1, Number(e.target.value) || 1) })
                    }
                    placeholder="1 = 1 vial per unit"
                  />
                  <p className="text-xs text-muted-foreground">Price × quantity × count at checkout</p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    id="in_stock"
                    checked={formData.in_stock}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, in_stock: checked })
                    }
                  />
                  <Label htmlFor="in_stock">In Stock</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, featured: checked })
                    }
                  />
                  <Label htmlFor="featured">Featured</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="hidden"
                    checked={formData.hidden}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, hidden: checked })
                    }
                  />
                  <Label htmlFor="hidden" className="text-muted-foreground" title="Hidden products won't appear in the shop">
                    Hidden from shop
                  </Label>
                </div>
              </div>

              <Button type="submit" className="w-full">
                {editingProduct ? 'Update Product' : 'Create Product'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Products ({products.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between rounded-lg border border-border p-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">{product.name}</p>
                    {product.featured && (
                      <Badge variant="secondary">Featured</Badge>
                    )}
                    {(product as { hidden?: boolean }).hidden && (
                      <Badge variant="outline" className="text-muted-foreground">Hidden</Badge>
                    )}
                    {!product.in_stock && (
                      <Badge variant="destructive">Out of Stock</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {product.category} • {formatPrice(product.price_cents)}
                    {product.dosage_variants && product.dosage_variants.length > 0 && (
                      <span> • {product.dosage_variants.length} dosage variant{product.dosage_variants.length === 1 ? '' : 's'}</span>
                    )}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEdit(product)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-destructive"
                    onClick={() => handleDelete(product.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
