'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2 } from 'lucide-react'

type DiscountCode = {
  id: string
  code: string
  percent_off: number
  expires_at: string | null
  active: boolean
  created_at: string
}

export default function AdminDiscountsPage() {
  const [codes, setCodes] = useState<DiscountCode[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editing, setEditing] = useState<DiscountCode | null>(null)
  const [formData, setFormData] = useState({
    code: '',
    percent_off: 10,
    expires_at: '',
    active: true,
  })

  useEffect(() => {
    fetchCodes()
  }, [])

  const fetchCodes = async () => {
    try {
      const res = await fetch('/api/admin/discounts', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('terrain-admin-token')}`,
        },
      })
      const data = await res.json()
      setCodes(data.codes || [])
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  const reset = () => {
    setEditing(null)
    setFormData({ code: '', percent_off: 10, expires_at: '', active: true })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        ...formData,
        code: formData.code.trim().toUpperCase(),
        expires_at: formData.expires_at.trim() ? new Date(formData.expires_at).toISOString() : null,
      }

      const res = await fetch('/api/admin/discounts', {
        method: editing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('terrain-admin-token')}`,
        },
        body: JSON.stringify(editing ? { id: editing.id, ...payload } : payload),
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to save')
        return
      }
      toast.success(editing ? 'Discount code updated' : 'Discount code created')
      setIsDialogOpen(false)
      reset()
      fetchCodes()
    } catch {
      toast.error('An error occurred')
    }
  }

  const handleEdit = (c: DiscountCode) => {
    setEditing(c)
    setFormData({
      code: c.code,
      percent_off: c.percent_off,
      expires_at: c.expires_at ? new Date(c.expires_at).toISOString().slice(0, 10) : '',
      active: c.active,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this discount code?')) return
    const res = await fetch(`/api/admin/discounts?id=${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('terrain-admin-token')}` },
    })
    if (res.ok) {
      toast.success('Deleted')
      fetchCodes()
    } else {
      toast.error('Failed to delete')
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Discount Codes</h1>
          <p className="text-muted-foreground">Create and manage discount codes.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) reset()
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Code
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? 'Edit Discount Code' : 'Add Discount Code'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code</Label>
                <Input id="code" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="percent">Percentage Off</Label>
                <Input
                  id="percent"
                  type="number"
                  min={1}
                  max={100}
                  value={formData.percent_off}
                  onChange={(e) => setFormData({ ...formData, percent_off: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expires">Expiry Date</Label>
                <Input
                  id="expires"
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch id="active" checked={formData.active} onCheckedChange={(checked) => setFormData({ ...formData, active: checked })} />
                <Label htmlFor="active">Active</Label>
              </div>
              <Button type="submit" className="w-full">
                {editing ? 'Update Code' : 'Create Code'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Codes ({codes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {codes.length ? (
            <div className="space-y-4">
              {codes.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <p className="font-medium text-foreground">{c.code}</p>
                    <p className="text-sm text-muted-foreground">
                      {c.percent_off}% off{c.expires_at ? ` • expires ${new Date(c.expires_at).toLocaleDateString()}` : ''}{' '}
                      • {c.active ? 'active' : 'inactive'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleEdit(c)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="text-destructive" onClick={() => handleDelete(c.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">No discount codes yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

