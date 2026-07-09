import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface NominatimAddress {
  house_number?: string
  road?: string
  city?: string
  town?: string
  village?: string
  municipality?: string
  county?: string
  state?: string
  postcode?: string
  country_code?: string
}

interface NominatimResult {
  display_name: string
  address?: NominatimAddress
}

export interface AddressSuggestion {
  id: string
  label: string
  sublabel: string
  address1: string
  city: string
  state: string
  zip: string
  country: string
}

function lineFromAddress(addr: NominatimAddress): string {
  const parts = [addr.house_number, addr.road].filter(Boolean)
  return parts.join(' ').trim()
}

function cityFromAddress(addr: NominatimAddress): string {
  return (
    addr.city ||
    addr.town ||
    addr.village ||
    addr.municipality ||
    addr.county ||
    ''
  )
}

function countryFromCode(code?: string): string {
  if (!code) return 'US'
  const upper = code.toUpperCase()
  if (upper === 'US') return 'US'
  if (upper === 'CA') return 'CA'
  return upper
}

function mapResult(item: NominatimResult, index: number): AddressSuggestion | null {
  const addr = item.address
  if (!addr) return null

  const address1 = lineFromAddress(addr)
  const city = cityFromAddress(addr)
  const state = addr.state ?? ''
  const zip = addr.postcode ?? ''
  const country = countryFromCode(addr.country_code)

  if (!address1 || !city || !state || !zip) return null

  const label = [address1, city, state, zip].filter(Boolean).join(', ')
  const sublabel = country === 'CA' ? 'Canada' : country === 'US' ? 'United States' : country

  return {
    id: `${index}-${label}`,
    label,
    sublabel,
    address1,
    city,
    state,
    zip,
    country,
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim()

  if (!q || q.length < 3) {
    return NextResponse.json({ suggestions: [] as AddressSuggestion[] })
  }

  try {
    const url = new URL('https://nominatim.openstreetmap.org/search')
    url.searchParams.set('q', q)
    url.searchParams.set('format', 'json')
    url.searchParams.set('addressdetails', '1')
    url.searchParams.set('limit', '8')
    url.searchParams.set('countrycodes', 'us,ca')

    const res = await fetch(url.toString(), {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'TerrainPeptides/1.0 (checkout; contact@terrainpeptides.com)',
      },
      cache: 'no-store',
    })

    if (!res.ok) {
      return NextResponse.json({ suggestions: [] as AddressSuggestion[] })
    }

    const data = (await res.json()) as NominatimResult[]
    const suggestions = data
      .map((item, i) => mapResult(item, i))
      .filter((s): s is AddressSuggestion => s != null)

    return NextResponse.json(
      { suggestions },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch {
    return NextResponse.json({ suggestions: [] as AddressSuggestion[] })
  }
}
