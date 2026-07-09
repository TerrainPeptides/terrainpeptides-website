'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { Check, Loader2, MapPin, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export interface AddressFields {
  address1: string
  address2: string
  city: string
  state: string
  zip: string
  country: string
}

interface Suggestion {
  id: string
  label: string
  sublabel: string
  address1: string
  city: string
  state: string
  zip: string
  country: string
}

interface AddressAutocompleteProps {
  value: AddressFields
  onChange: (fields: Partial<AddressFields>) => void
  verified: boolean
  onVerifiedChange: (verified: boolean) => void
  className?: string
}

export function AddressAutocomplete({
  value,
  onChange,
  verified,
  onVerifiedChange,
  className,
}: AddressAutocompleteProps) {
  const listId = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(0)

  const fetchSuggestions = useCallback(async (text: string) => {
    if (text.trim().length < 3) {
      setSuggestions([])
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/address/autocomplete?q=${encodeURIComponent(text.trim())}`)
      const data = (await res.json()) as { suggestions?: Suggestion[] }
      setSuggestions(data.suggestions ?? [])
      setHighlight(0)
    } catch {
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    const t = setTimeout(() => fetchSuggestions(query), 280)
    return () => clearTimeout(t)
  }, [query, open, fetchSuggestions])

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  function selectSuggestion(s: Suggestion) {
    onChange({
      address1: s.address1,
      city: s.city,
      state: s.state,
      zip: s.zip,
      country: s.country,
    })
    onVerifiedChange(true)
    setQuery(s.label)
    setOpen(false)
    setSuggestions([])
  }

  function handleQueryChange(text: string) {
    setQuery(text)
    onVerifiedChange(false)
    setOpen(true)
    if (!text.trim()) {
      onChange({ address1: '', city: '', state: '', zip: '' })
    }
  }

  useEffect(() => {
    if (verified && value.address1) {
      const composed = [value.address1, value.city, value.state, value.zip]
        .filter(Boolean)
        .join(', ')
      if (composed && !query) setQuery(composed)
    }
  }, [verified, value.address1, value.city, value.state, value.zip, query])

  return (
    <div ref={containerRef} className={cn('space-y-3', className)}>
      <div className="relative">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
          role="combobox"
          aria-expanded={open && suggestions.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          placeholder="Search for your address…"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (!open || suggestions.length === 0) return
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setHighlight((h) => (h + 1) % suggestions.length)
            } else if (e.key === 'ArrowUp') {
              e.preventDefault()
              setHighlight((h) => (h - 1 + suggestions.length) % suggestions.length)
            } else if (e.key === 'Enter' && suggestions[highlight]) {
              e.preventDefault()
              selectSuggestion(suggestions[highlight])
            } else if (e.key === 'Escape') {
              setOpen(false)
            }
          }}
          className={cn(
            'pl-9 pr-10',
            verified && 'border-green-500/50 bg-green-50/40 dark:bg-green-950/20'
          )}
        />
        <div className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
          {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          {verified && !loading && <Check className="h-4 w-4 text-green-600" />}
        </div>
        </div>

        {open && query.trim().length >= 3 && (
          <div
            id={listId}
            role="listbox"
            className="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-auto rounded-lg border border-border bg-popover shadow-lg"
          >
          {loading && suggestions.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">Searching addresses…</p>
          ) : suggestions.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">
              No matches found. Try including city or ZIP code.
            </p>
          ) : (
            suggestions.map((s, i) => (
              <button
                key={s.id}
                type="button"
                role="option"
                aria-selected={i === highlight}
                onMouseEnter={() => setHighlight(i)}
                onClick={() => selectSuggestion(s)}
                className={cn(
                  'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors',
                  i === highlight ? 'bg-muted/80' : 'hover:bg-muted/50'
                )}
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#0A1628]/60" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-foreground">{s.label}</span>
                  <span className="block text-xs text-muted-foreground">{s.sublabel}</span>
                </span>
              </button>
            ))
          )}
        </div>
        )}
      </div>

      {verified && value.address1 && (
        <div className="rounded-lg border border-green-500/30 bg-green-50/50 px-4 py-3 dark:bg-green-950/15">
          <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-green-700 dark:text-green-400">
            <Check className="h-3.5 w-3.5" />
            Verified address
          </p>
          <p className="text-sm text-foreground">{value.address1}</p>
          <p className="text-sm text-muted-foreground">
            {value.city}, {value.state} {value.zip}
            {value.country === 'CA' ? ' · Canada' : value.country === 'US' ? ' · United States' : ''}
          </p>
        </div>
      )}
    </div>
  )
}

/** Returns true when the address looks valid (selected or matches autocomplete). */
export async function validateShippingAddress(fields: AddressFields): Promise<boolean> {
  const q = [fields.address1, fields.city, fields.state, fields.zip].filter(Boolean).join(', ')
  if (!q || q.length < 5) return false
  try {
    const res = await fetch(`/api/address/autocomplete?q=${encodeURIComponent(q)}`)
    const data = (await res.json()) as { suggestions?: Suggestion[] }
    const list = data.suggestions ?? []
    if (list.length === 0) return false
    const norm = (s: string) => s.trim().toLowerCase()
    return list.some(
      (s) =>
        norm(s.address1) === norm(fields.address1) &&
        norm(s.city) === norm(fields.city) &&
        norm(s.state) === norm(fields.state) &&
        norm(s.zip).slice(0, 5) === norm(fields.zip).slice(0, 5)
    )
  } catch {
    return false
  }
}
