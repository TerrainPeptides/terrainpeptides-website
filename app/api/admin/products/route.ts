import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin-auth'
import { revalidateProductCatalog } from '@/lib/revalidate-catalog'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { maybeUploadImageDataUrl } from '@/lib/supabase/upload'
import { seedProducts } from '@/lib/seed-data'
import { productFromDbRow } from '@/lib/product-from-row'
import { normalizeDosageVariantsPayload } from '@/lib/dosage-variants'
import {
  dosageVariantsFromDbRow,
  encodeResearchStudiesForDb,
  parseResearchStudiesField,
} from '@/lib/dosage-variants-storage'

export async function GET(request: Request) {
  const authResult = await verifyAdmin(request)
  if (!authResult.valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = supabaseAdmin()
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name', { ascending: true })
    if (error) throw error

    if (!data || data.length === 0) {
      const now = new Date().toISOString()
      const seedRows = seedProducts.map((p) => ({
        id: crypto.randomUUID(),
        slug: p.slug,
        name: p.name,
        category: p.category,
        description: p.description,
        overview: p.overview ?? null,
        price_cents: p.price_cents,
        dosage: p.dosage,
        purity: p.purity,
        molecular_weight: p.molecular_weight,
        sequence: p.sequence,
        image_url: p.image_url,
        coa_url: p.coa_url,
        vial_count: p.vial_count ?? 1,
        stock_level: p.stock_level,
        in_stock: p.in_stock,
        featured: p.featured,
        research_studies: p.research_studies,
        research_benefits: p.research_benefits,
        hidden: (p as { hidden?: boolean }).hidden ?? false,
        created_at: p.created_at || now,
        updated_at: p.updated_at || now,
      }))
      const { error: seedErr } = await supabase.from('products').insert(seedRows)
      if (seedErr) {
        console.error('Seed products insert failed:', seedErr)
      }
      const { data: seeded, error: seededErr } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true })
      if (seededErr) throw seededErr
      return NextResponse.json({
        products: (seeded || []).map((row: Record<string, unknown>) => productFromDbRow(row)),
      })
    }

    const products = (data || []).map((row: Record<string, unknown>) => productFromDbRow(row))

    return NextResponse.json({ products })
  } catch (error) {
    // If Supabase isn't configured yet, fall back to seed products so the admin UI doesn't look empty.
    if (error instanceof Error && error.message.startsWith('Missing env var:')) {
      const now = new Date().toISOString()
      const fallback = seedProducts.map((p) => ({
        ...p,
        created_at: p.created_at || now,
        updated_at: p.updated_at || now,
      }))
      return NextResponse.json(
        { products: fallback, warning: 'Supabase env vars missing; serving seed products.' },
        { status: 200, headers: { 'x-admin-warning': 'supabase-env-missing' } }
      )
    }
    console.error('Admin products GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const authResult = await verifyAdmin(request)
  if (!authResult.valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const supabase = supabaseAdmin()
    const now = new Date().toISOString()

    const slug = String(body.slug || '').trim()
    const name = String(body.name || '').trim()
    if (!slug || !name) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 })
    }

    const image_url = await maybeUploadImageDataUrl({
      supabase,
      bucket: 'product-images',
      pathPrefix: `products/${slug}`,
      value: body.image_url,
    })
    const coa_url = await maybeUploadImageDataUrl({
      supabase,
      bucket: 'product-images',
      pathPrefix: `products/${slug}/coa`,
      value: body.coa_url,
    })

    const variants = normalizeDosageVariantsPayload(body.dosage_variants)
    const basePrice = Number(body.price_cents ?? 0)
    const price_cents = variants?.length ? variants[0].price_cents : basePrice
    const dosage =
      variants?.length ? variants[0].label : body.dosage != null ? String(body.dosage) : null

    const research_studies = encodeResearchStudiesForDb(body.research_studies ?? null, variants)

    const insertRow = {
      id: crypto.randomUUID(),
      slug,
      name,
      category: body.category ?? 'performance',
        description: body.description ?? null,
        overview: body.overview ?? null,
        price_cents,
      dosage,
      purity: body.purity ?? null,
      molecular_weight: body.molecular_weight ?? null,
      sequence: body.sequence ?? null,
      research_benefits: Array.isArray(body.research_benefits) ? body.research_benefits : null,
      research_studies,
      stock_level: body.stock_level === null || body.stock_level === undefined || body.stock_level === '' ? null : Number(body.stock_level),
      in_stock: Boolean(body.in_stock ?? true),
      featured: Boolean(body.featured ?? false),
      image_url,
      coa_url,
      vial_count: body.vial_count ?? 1,
      hidden: Boolean(body.hidden ?? false),
      created_at: now,
      updated_at: now,
    }

    const { data, error } = await supabase.from('products').insert(insertRow).select('*').single()
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    revalidateProductCatalog({ productSlug: slug })
    return NextResponse.json({ success: true, product: productFromDbRow(data as Record<string, unknown>) })
  } catch (error) {
    console.error('Admin products POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  const authResult = await verifyAdmin(request)
  if (!authResult.valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const id = String(body.id || '')
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    const supabase = supabaseAdmin()
    const { data: existing, error: existingErr } = await supabase.from('products').select('*').eq('id', id).single()
    if (existingErr) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const nextSlug = body.slug ? String(body.slug).trim() : existing.slug
    const image_url = await maybeUploadImageDataUrl({
      supabase,
      bucket: 'product-images',
      pathPrefix: `products/${nextSlug}`,
      value: body.image_url,
    })
    const coa_url = await maybeUploadImageDataUrl({
      supabase,
      bucket: 'product-images',
      pathPrefix: `products/${nextSlug}/coa`,
      value: body.coa_url,
    })

    const existingPriceCents =
      typeof existing.price_cents === 'number'
        ? existing.price_cents
        : Math.round(Number(existing.price || 0) * 100)

    const variants =
      body.dosage_variants !== undefined
        ? normalizeDosageVariantsPayload(body.dosage_variants)
        : undefined

    const resolvedVariants =
      variants !== undefined
        ? variants
        : dosageVariantsFromDbRow(existing as Record<string, unknown>)

    const nextDisplay =
      body.research_studies !== undefined
        ? body.research_studies === '' || body.research_studies == null
          ? null
          : String(body.research_studies).trim() || null
        : parseResearchStudiesField(String(existing.research_studies ?? '')).displayText

    let nextPriceCents = body.price_cents !== undefined ? Number(body.price_cents) : existingPriceCents
    let nextDosage = body.dosage !== undefined ? body.dosage : existing.dosage
    if (variants !== undefined) {
      if (variants && variants.length > 0) {
        nextPriceCents = variants[0].price_cents
        nextDosage = variants[0].label
      } else if (body.price_cents !== undefined) {
        nextPriceCents = Number(body.price_cents)
      }
    }

    const patch: Record<string, unknown> = {
      slug: nextSlug,
      name: body.name !== undefined ? String(body.name).trim() : existing.name,
      category: body.category ?? existing.category,
      description: body.description ?? existing.description,
      overview: body.overview !== undefined ? (body.overview || null) : existing.overview,
      price_cents: nextPriceCents,
      dosage: nextDosage,
      purity: body.purity ?? existing.purity,
      molecular_weight: body.molecular_weight ?? existing.molecular_weight,
      sequence: body.sequence ?? existing.sequence,
      research_benefits: Array.isArray(body.research_benefits) ? body.research_benefits : existing.research_benefits,
      research_studies: encodeResearchStudiesForDb(nextDisplay, resolvedVariants),
      stock_level: body.stock_level === null || body.stock_level === undefined || body.stock_level === '' ? null : Number(body.stock_level),
      in_stock: body.in_stock !== undefined ? Boolean(body.in_stock) : existing.in_stock,
      featured: body.featured !== undefined ? Boolean(body.featured) : existing.featured,
      hidden: body.hidden !== undefined ? Boolean(body.hidden) : existing.hidden,
      updated_at: new Date().toISOString(),
    }
    if (body.image_url === '' || body.image_url === null) patch.image_url = null
    else if (image_url !== null) patch.image_url = image_url
    if (body.coa_url === '' || body.coa_url === null) patch.coa_url = null
    else if (coa_url !== null) patch.coa_url = coa_url
    if (body.vial_count !== undefined) patch.vial_count = Math.max(1, Number(body.vial_count) || 1)

    const { data, error } = await supabase.from('products').update(patch).eq('id', id).select('*').single()
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const updated = productFromDbRow(data as Record<string, unknown>)
    const oldSlug = String(existing.slug ?? '').trim() || null
    revalidateProductCatalog({
      productSlug: updated.slug ?? nextSlug,
      previousSlug: oldSlug !== nextSlug ? oldSlug : null,
    })
    return NextResponse.json({ success: true, product: updated })
  } catch (error) {
    console.error('Admin products PUT error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  const authResult = await verifyAdmin(request)
  if (!authResult.valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json().catch(() => ({}))
    if (body.action === 'unhide-all') {
      const supabase = supabaseAdmin()
      const { data, error } = await supabase
        .from('products')
        .update({ hidden: false, updated_at: new Date().toISOString() })
        .eq('hidden', true)
        .select('id')
      if (error) {
        if (error.message?.includes('hidden') || error.message?.includes('schema cache')) {
          return NextResponse.json({
            error: "The 'hidden' column doesn't exist yet. Run this SQL in Supabase Dashboard → SQL Editor:\n\nALTER TABLE public.products ADD COLUMN IF NOT EXISTS hidden boolean NOT NULL DEFAULT false;\nUPDATE public.products SET hidden = false;",
          }, { status: 400 })
        }
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
      const count = data?.length ?? 0
      revalidateProductCatalog()
      return NextResponse.json({ success: true, unhidden: count })
    }
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (error) {
    console.error('Admin products PATCH error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  const authResult = await verifyAdmin(request)
  if (!authResult.valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
    const supabase = supabaseAdmin()
    const { data: doomed } = await supabase.from('products').select('slug').eq('id', id).maybeSingle()
    const doomedSlug = doomed?.slug != null ? String(doomed.slug).trim() : null
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    revalidateProductCatalog({ productSlug: doomedSlug || undefined })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin products DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
