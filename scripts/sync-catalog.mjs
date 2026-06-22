#!/usr/bin/env node
/**
 * Sync & repair Supabase product catalog:
 * - Fix image_url from latest file in Storage (when DB path is broken)
 * - Normalize shop categories
 * - Unhide peptide products that have a working image
 *
 * Usage: node --env-file=.env.local scripts/sync-catalog.mjs
 *        node --env-file=.env.local scripts/sync-catalog.mjs --dry-run
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dryRun = process.argv.includes('--dry-run')

function loadEnv() {
  const envPath = resolve(__dirname, '../.env.local')
  if (!existsSync(envPath)) return
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#') || !t.includes('=')) continue
    const i = t.indexOf('=')
    const k = t.slice(0, i).trim()
    const v = t.slice(i + 1).trim()
    if (!process.env[k] && v) process.env[k] = v
  }
}

loadEnv()

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('Missing SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const SHOP_CATEGORIES = new Set(['fat-loss', 'skin-collagen', 'sleep', 'cognitive', 'performance'])

const SLUG_CATEGORY = {
  'aod-9604': 'fat-loss',
  'glp3-rt': 'fat-loss',
  'glp-3-rt': 'fat-loss',
  retatrutide: 'fat-loss',
  'ghk-cu': 'skin-collagen',
  tb500: 'skin-collagen',
  'tb-500': 'skin-collagen',
  Epitalon: 'skin-collagen',
  epitalon: 'skin-collagen',
  'dsip-5mg': 'sleep',
  dsip: 'sleep',
  semax: 'cognitive',
  selank: 'cognitive',
  'bpc-157': 'performance',
  mt2: 'performance',
  'mt-2': 'performance',
  kisspeptin: 'performance',
  NAD: 'performance',
}

/** Hidden from shop — accessories, duplicates, or intentionally delisted products */
const KEEP_HIDDEN = new Set([
  'bacteriostatic-water',
  'nasal-spray',
  'epithalon-10mg', // duplicate of Epitalon (has image)
  'tb-500', // seed-only duplicate of tb500 ($59.99 listing)
  'blend-recovery',
  'capsule-stack',
  'syringe-kit',
  'cagrilintide-10mg',
  'cjc-1295-no-dac',
  'cjc-1295-dac',
  'enclomiphene',
  'glow-70mg',
  'glp2-tz',
  'igf1-lr3',
  'ipamorelin-10mg',
  'klow-80mg',
  'mk-677',
  'rad-140',
  'sermorelin-5mg',
  'tesamorelin-10mg',
  'wolverine-10mg',
])

const IMAGE_EXT = /\.(png|jpe?g|webp|gif|svg)$/i

const supabase = createClient(url, key)

async function latestStorageImage(slug) {
  const folder = `products/${slug}`
  const { data: files, error } = await supabase.storage.from('product-images').list(folder, { limit: 100 })
  if (error || !files?.length) return null
  const images = files
    .filter((f) => f.name && IMAGE_EXT.test(f.name))
    .sort((a, b) => String(b.name).localeCompare(String(a.name)))
  if (!images.length) return null
  const name = images[0].name
  const path = `${folder}/${name}`
  const { data } = supabase.storage.from('product-images').getPublicUrl(path)
  return data.publicUrl
}

async function urlWorks(url) {
  if (!url) return false
  try {
    const r = await fetch(url, { method: 'HEAD' })
    return r.ok
  } catch {
    return false
  }
}

function resolveCategory(slug, raw) {
  const s = String(raw ?? '').trim()
  if (SHOP_CATEGORIES.has(s)) return s
  return SLUG_CATEGORY[slug] ?? SLUG_CATEGORY[slug.toLowerCase()] ?? 'performance'
}

async function main() {
  const { data: rows, error } = await supabase.from('products').select('*').order('name')
  if (error) throw error

  console.log(`Found ${rows.length} products${dryRun ? ' (dry run)' : ''}\n`)
  const updates = []

  for (const row of rows) {
    const patch = { updated_at: new Date().toISOString() }
    let changed = []

    const category = resolveCategory(row.slug, row.category)
    if (category !== row.category) {
      patch.category = category
      changed.push(`category ${row.category} → ${category}`)
    }

    let imageUrl = row.image_url?.trim() || null
    const imageOk = await urlWorks(imageUrl)
    if (!imageOk) {
      const fromStorage = await latestStorageImage(row.slug)
      if (fromStorage && (await urlWorks(fromStorage))) {
        patch.image_url = fromStorage
        changed.push('image_url repaired from storage')
      } else if (imageUrl) {
        changed.push('image_url broken (no storage fallback)')
      }
    }

    if (row.hidden && !KEEP_HIDDEN.has(row.slug)) {
      patch.hidden = false
      changed.push('unhidden')
    }

    if (changed.length === 0) continue

    console.log(`${row.slug}: ${changed.join('; ')}`)
    updates.push({ id: row.id, patch })
  }

  if (dryRun) {
    console.log(`\nWould update ${updates.length} rows. Re-run without --dry-run to apply.`)
    return
  }

  for (const { id, patch } of updates) {
    const { error: upErr } = await supabase.from('products').update(patch).eq('id', id)
    if (upErr) console.error(`Failed ${id}:`, upErr.message)
  }

  console.log(`\nUpdated ${updates.length} products.`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
