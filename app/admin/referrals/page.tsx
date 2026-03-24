'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Plus, Tag, Trash2 } from 'lucide-react'
import type { ReferralCode } from '@/lib/types'

export default function AdminReferralsPage() {
  const [codes, setCodes] = useState<ReferralCode[]>([])
  const [ordersByCode, setOrdersByCode] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    code: '',
    discount_percent: 10,
    max_uses: '',
    expires_at: '',
    active: true,
  })

  useEffect(() => {
    fetchCodes()
  }, [])

  const fetchCodes = async () => {
    try {
      const res = await fetch('/api/admin/referrals', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('terrain-admin-token')}`,
        },
      })
      const data = await res.json()
      setCodes(data.codes || [])

      const ordersRes = await fetch('/api/admin/orders', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('terrain-admin-token')}`,
        },
      })
      const ordersData = await ordersRes.json()
      const counts: Record<string, number> = {}
      for (const o of (ordersData.orders || []) as Array<{ referral_code: string | null }>) {
        if (!o.referral_code) continue
        const c = String(o.referral_code).toUpperCase()
        counts[c] = (counts[c] || 0) + 1
      }
      setOrdersByCode(counts)
    } catch (error) {
      console.error('Failed to fetch codes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const res = await fetch('/api/admin/referrals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('terrain-admin-token')}`,
        },
        body: JSON.stringify({
          ...formData,
          code: formData.code.toUpperCase(),
          max_uses: formData.max_uses ? Number(formData.max_uses) : null,
          expires_at: formData.expires_at || null,
        }),
      })

      if (res.ok) {
        toast.success('Referral code created')
        setIsDialogOpen(false)
        setFormData({
          code: '',
          discount_percent: 10,
          max_uses: '',
          expires_at: '',
          active: true,
        })
        fetchCodes()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to create code')
      }
    } catch {
      toast.error('An error occurred')
    }
  }

  const toggleActive = async (id: string, active: boolean) => {
    try {
      const res = await fetch('/api/admin/referrals', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('terrain-admin-token')}`,
        },
        body: JSON.stringify({ id, active }),
      })

      if (res.ok) {
        toast.success('Referral code updated')
        fetchCodes()
      } else {
        toast.error('Failed to update code')
      }
    } catch {
      toast.error('An error occurred')
    }
  }

  const deleteCode = async (id: string) => {
    if (!confirm('Are you sure you want to delete this referral code?')) return

    try {
      const res = await fetch(`/api/admin/referrals?id=${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('terrain-admin-token')}`,
        },
      })

      if (res.ok) {
        toast.success('Referral code deleted')
        fetchCodes()
      } else {
        toast.error('Failed to delete code')
      }
    } catch {
      toast.error('An error occurred')
    }
  }

  const formatDate = (date: string | null) => {
    if (!date) return 'Never'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
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
          <h1 className="text-2xl font-bold text-foreground">Referral Codes</h1>
          <p className="text-muted-foreground">Manage discount codes for customers.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Code
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Referral Code</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code</Label>
                <Input
                  id="code"
                  required
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                  }
                  placeholder="SAVE10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount_percent">Discount Percentage</Label>
                <Input
                  id="discount_percent"
                  type="number"
                  min={1}
                  max={100}
                  required
                  value={formData.discount_percent}
                  onChange={(e) =>
                    setFormData({ ...formData, discount_percent: Number(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_uses">Max Uses (leave empty for unlimited)</Label>
                <Input
                  id="max_uses"
                  type="number"
                  min={1}
                  value={formData.max_uses}
                  onChange={(e) =>
                    setFormData({ ...formData, max_uses: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expires_at">Expiration Date (optional)</Label>
                <Input
                  id="expires_at"
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) =>
                    setFormData({ ...formData, expires_at: e.target.value })
                  }
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, active: checked })
                  }
                />
                <Label htmlFor="active">Active</Label>
              </div>
              <Button type="submit" className="w-full">
                Create Code
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
          {codes.length > 0 ? (
            <div className="space-y-4">
              {codes.map((code) => (
                <div
                  key={code.id}
                  className="flex items-center justify-between rounded-lg border border-border p-4"
                >
                  <div className="flex items-center gap-4">
                    <Tag className="h-5 w-5 text-primary" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-mono font-bold text-foreground">
                          {code.code}
                        </p>
                        <Badge
                          className={
                            code.active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }
                        >
                          {code.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {code.discount_percent}% off • {code.current_uses}
                        {code.max_uses ? `/${code.max_uses}` : ''} uses • Expires:{' '}
                        {formatDate(code.expires_at)} • Orders: {ordersByCode[code.code] || 0}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={code.active}
                      onCheckedChange={(checked) => toggleActive(code.id, checked)}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-destructive"
                      onClick={() => deleteCode(code.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Tag className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">No referral codes yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
