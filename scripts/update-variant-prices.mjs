#!/usr/bin/env node
/**
 * Sync embedded dosage variant prices in research_studies with catalog list prices.
 * Usage: node --env-file=.env.local scripts/update-variant-prices.mjs
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

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
  console.error('Missing Supabase credentials in .env.local')
  process.exit(1)
}

const META_KEY = '__terrain_dv__'

const CATALOG = {
  'aod-9604': { price_cents: 3499, primary: '5mg', prices: { '2mg': 2499, '5mg': 3499 } },
  'glp3-rt': { price_cents: 5499, primary: '5mg', prices: { '5mg': 5499, '10mg': 8499 } },
  Epitalon: { price_cents: 3299, primary: '10mg', prices: { '10mg': 3299 } },
  'ghk-cu': { price_cents: 3499, primary: '50mg', prices: { '50mg': 3499, '100mg': 5499 } },
  tb500: { price_cents: 4499, primary: '5mg', prices: { '5mg': 4499, '10mg': 6999 } },
  'dsip-5mg': { price_cents: 3299, primary: '5mg', prices: { '2mg': 2499, '5mg': 3299 } },
  selank: { price_cents: 3499, primary: '5mg', prices: { '5mg': 3499 } },
  semax: { price_cents: 3499, primary: '5mg', prices: { '5mg': 3499 } },
  'bpc-157': { price_cents: 3999, primary: '5mg', prices: { '5mg': 3999, '10mg': 5999, '20mg': 8999 } },
  kisspeptin: { price_cents: 2799, primary: '5mg', prices: { '5mg': 2799, '10mg': 4499 } },
  mt2: { price_cents: 4499, primary: '10mg', prices: { '10mg': 4499 } },
  NAD: { price_cents: 4999, primary: '500mg', prices: { '500mg': 4999 } },
}

function matchPrice(label, prices) {
  const key = Object.keys(prices).find((k) => label.toLowerCase().includes(k.toLowerCase()))
  return key ? prices[key] : null
}

function reorderVariants(variants, primaryLabel) {
  const primary = variants.find((v) => v.label.toLowerCase().includes(primaryLabel.toLowerCase()))
  if (!primary) return variants
  return [primary, ...variants.filter((v) => v.id !== primary.id)]
}

const supabase = createClient(url, key)

const { data: rows, error } = await supabase
  .from('products')
  .select('id,slug,price_cents,research_studies')
  .eq('hidden', false)

if (error) throw error

for (const row of rows) {
  const cfg = CATALOG[row.slug]
  if (!cfg) continue

  let payload
  try {
    payload = JSON.parse(row.research_studies)
  } catch {
    continue
  }
  if (!payload || payload[META_KEY] !== 1 || !Array.isArray(payload.v)) continue

  const updated = payload.v.map((v) => {
    const next = matchPrice(String(v.label), cfg.prices)
    return next != null ? { ...v, price_cents: next } : v
  })
  const ordered = reorderVariants(updated, cfg.primary)
  const research_studies = JSON.stringify({ [META_KEY]: 1, v: ordered, s: payload.s ?? null })

  const { error: upErr } = await supabase
    .from('products')
    .update({ price_cents: cfg.price_cents, research_studies, updated_at: new Date().toISOString() })
    .eq('id', row.id)

  if (upErr) console.error(row.slug, upErr.message)
  else {
    console.log(
      'Updated',
      row.slug,
      '->',
      ordered.map((v) => `${v.label}:$${(v.price_cents / 100).toFixed(2)}`).join(', ')
    )
  }
}
