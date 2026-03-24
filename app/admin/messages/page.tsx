'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Mail, Eye, Trash2, CheckCircle } from 'lucide-react'
import type { ContactSubmission } from '@/lib/types'

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactSubmission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState<ContactSubmission | null>(null)

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/admin/messages', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('terrain-admin-token')}`,
        },
      })
      const data = await res.json()
      setMessages(data.messages || [])
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch('/api/admin/messages', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('terrain-admin-token')}`,
        },
        body: JSON.stringify({ id, read: true }),
      })

      if (res.ok) {
        toast.success('Marked as read')
        fetchMessages()
        if (selectedMessage?.id === id) {
          setSelectedMessage({ ...selectedMessage, read: true })
        }
      }
    } catch {
      toast.error('An error occurred')
    }
  }

  const deleteMessage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return

    try {
      const res = await fetch(`/api/admin/messages?id=${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('terrain-admin-token')}`,
        },
      })

      if (res.ok) {
        toast.success('Message deleted')
        setSelectedMessage(null)
        fetchMessages()
      } else {
        toast.error('Failed to delete message')
      }
    } catch {
      toast.error('An error occurred')
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const unreadCount = messages.filter((m) => !m.read).length

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
        <h1 className="text-2xl font-bold text-foreground">Messages</h1>
        <p className="text-muted-foreground">
          Contact form submissions from customers.
          {unreadCount > 0 && (
            <span className="ml-2 text-primary">({unreadCount} unread)</span>
          )}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Messages ({messages.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {messages.length > 0 ? (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`rounded-lg border p-4 ${
                    message.read ? 'border-border' : 'border-primary bg-primary/5'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{message.name}</p>
                        {!message.read && (
                          <Badge className="bg-primary text-primary-foreground">New</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{message.email}</p>
                      {message.subject && (
                        <p className="mt-1 font-medium text-foreground">
                          {message.subject}
                        </p>
                      )}
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {message.message}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {formatDate(message.created_at)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setSelectedMessage(message)
                          if (!message.read) {
                            markAsRead(message.id)
                          }
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-destructive"
                        onClick={() => deleteMessage(message.id)}
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
              <Mail className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">No messages yet.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Message Detail Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={(open) => !open && setSelectedMessage(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Message from {selectedMessage?.name}</DialogTitle>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">From</p>
                <p className="font-medium text-foreground">{selectedMessage.name}</p>
                <p className="text-sm text-muted-foreground">{selectedMessage.email}</p>
              </div>

              {selectedMessage.subject && (
                <div>
                  <p className="text-sm text-muted-foreground">Subject</p>
                  <p className="font-medium text-foreground">{selectedMessage.subject}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground">Message</p>
                <p className="mt-1 whitespace-pre-wrap text-foreground">
                  {selectedMessage.message}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-4">
                <p className="text-sm text-muted-foreground">
                  {formatDate(selectedMessage.created_at)}
                </p>
                <div className="flex gap-2">
                  {!selectedMessage.read && (
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => markAsRead(selectedMessage.id)}
                    >
                      <CheckCircle className="h-4 w-4" />
                      Mark as Read
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="gap-2 text-destructive"
                    onClick={() => deleteMessage(selectedMessage.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
