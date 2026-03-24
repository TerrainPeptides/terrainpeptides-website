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
import { toast } from 'sonner'
import { Plus, Star, Check, X, Trash2, Pencil } from 'lucide-react'
import type { Vouch } from '@/lib/types'

export default function AdminVouchesPage() {
  const [vouches, setVouches] = useState<Vouch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingVouch, setEditingVouch] = useState<Vouch | null>(null)
  const [formData, setFormData] = useState({
    author_name: '',
    rating: 5,
    content: '',
    verified: false,
    approved: false,
  })

  useEffect(() => {
    fetchVouches()
  }, [])

  const fetchVouches = async () => {
    try {
      const res = await fetch('/api/admin/vouches', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('terrain-admin-token')}`,
        },
      })
      const data = await res.json()
      setVouches(data.vouches || [])
    } catch (error) {
      console.error('Failed to fetch vouches:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const res = await fetch('/api/admin/vouches', {
        method: editingVouch ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('terrain-admin-token')}`,
        },
        body: JSON.stringify(editingVouch ? { id: editingVouch.id, ...formData } : formData),
      })

      if (res.ok) {
        toast.success(editingVouch ? 'Review updated' : 'Review created')
        setIsDialogOpen(false)
        setEditingVouch(null)
        setFormData({
          author_name: '',
          rating: 5,
          content: '',
          verified: false,
          approved: false,
        })
        fetchVouches()
      } else {
        toast.error('Failed to save review')
      }
    } catch {
      toast.error('An error occurred')
    }
  }

  const updateVouch = async (id: string, updates: Partial<Vouch>) => {
    try {
      const res = await fetch('/api/admin/vouches', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('terrain-admin-token')}`,
        },
        body: JSON.stringify({ id, ...updates }),
      })

      if (res.ok) {
        toast.success('Vouch updated')
        fetchVouches()
      } else {
        toast.error('Failed to update vouch')
      }
    } catch {
      toast.error('An error occurred')
    }
  }

  const deleteVouch = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vouch?')) return

    try {
      const res = await fetch(`/api/admin/vouches?id=${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('terrain-admin-token')}`,
        },
      })

      if (res.ok) {
        toast.success('Vouch deleted')
        fetchVouches()
      } else {
        toast.error('Failed to delete vouch')
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reviews</h1>
          <p className="text-muted-foreground">Add, edit, and manage customer reviews.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) {
            setEditingVouch(null)
            setFormData({
              author_name: '',
              rating: 5,
              content: '',
              verified: false,
              approved: false,
            })
          }
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Review
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingVouch ? 'Edit Review' : 'Add New Review'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="author_name">Reviewer Name</Label>
                <Input
                  id="author_name"
                  required
                  value={formData.author_name}
                  onChange={(e) =>
                    setFormData({ ...formData, author_name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rating">Rating (1-5)</Label>
                <Input
                  id="rating"
                  type="number"
                  min={1}
                  max={5}
                  required
                  value={formData.rating}
                  onChange={(e) =>
                    setFormData({ ...formData, rating: Number(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  required
                  rows={4}
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                />
              </div>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    id="verified"
                    checked={formData.verified}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, verified: checked })
                    }
                  />
                  <Label htmlFor="verified">Verified</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="approved"
                    checked={formData.approved}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, approved: checked })
                    }
                  />
                  <Label htmlFor="approved">Approved</Label>
                </div>
              </div>
              <Button type="submit" className="w-full">
                {editingVouch ? 'Update Review' : 'Create Review'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Reviews ({vouches.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {vouches.length > 0 ? (
            <div className="space-y-4">
              {vouches.map((vouch) => (
                <div
                  key={vouch.id}
                  className="rounded-lg border border-border p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">
                          {vouch.author_name}
                        </p>
                        {vouch.verified && (
                          <Badge variant="secondary" className="gap-1">
                            <Check className="h-3 w-3" />
                            Verified
                          </Badge>
                        )}
                        <Badge
                          className={
                            vouch.approved
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }
                        >
                          {vouch.approved ? 'Approved' : 'Pending'}
                        </Badge>
                      </div>
                      <div className="mt-1 flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < vouch.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-muted'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {vouch.content}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setEditingVouch(vouch)
                          setFormData({
                            author_name: vouch.author_name,
                            rating: vouch.rating,
                            content: vouch.content,
                            verified: vouch.verified,
                            approved: vouch.approved,
                          })
                          setIsDialogOpen(true)
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {!vouch.approved && (
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-green-600"
                          onClick={() => updateVouch(vouch.id, { approved: true })}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      {vouch.approved && (
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-yellow-600"
                          onClick={() => updateVouch(vouch.id, { approved: false })}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-destructive"
                        onClick={() => deleteVouch(vouch.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Star className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">No vouches yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
