import type { ProductDosageVariant } from '@/lib/types'
import { parseDosageVariantsField } from '@/lib/dosage-variants'

/** Embedded in `products.research_studies` when the DB has no `dosage_variants` column. */
const META_KEY = '__terrain_dv__' as const

type EmbeddedPayload = {
  [META_KEY]: 1
  v: unknown
  s: string | null
}

function isEmbeddedPayload(x: unknown): x is EmbeddedPayload {
  return (
    !!x &&
    typeof x === 'object' &&
    (x as EmbeddedPayload)[META_KEY] === 1 &&
    'v' in (x as EmbeddedPayload)
  )
}

/** Split DB `research_studies` into user-visible text + optional variants from embed. */
export function parseResearchStudiesField(raw: string | null | undefined): {
  displayText: string | null
  embeddedVariants: ProductDosageVariant[] | undefined
} {
  if (raw == null || String(raw).trim() === '') {
    return { displayText: null, embeddedVariants: undefined }
  }
  const s = String(raw)
  try {
    const parsed: unknown = JSON.parse(s)
    if (isEmbeddedPayload(parsed)) {
      const embeddedVariants = parseDosageVariantsField(parsed.v)
      const displayText =
        parsed.s != null && String(parsed.s).trim() !== '' ? String(parsed.s) : null
      return { displayText, embeddedVariants }
    }
  } catch {
    // not JSON — treat as plain research studies text
  }
  return { displayText: s, embeddedVariants: undefined }
}

/** Persist variants + optional research text in a single column (no `dosage_variants` needed). */
export function encodeResearchStudiesForDb(
  displayText: string | null | undefined,
  variants: ProductDosageVariant[] | null | undefined
): string | null {
  const v = variants && variants.length > 0 ? variants : null
  const s = displayText != null && String(displayText).trim() !== '' ? String(displayText) : null
  if (v) {
    return JSON.stringify({ [META_KEY]: 1, v, s })
  }
  return s
}

/** Variants from row: embedded in research_studies first, else optional `dosage_variants` column. */
export function dosageVariantsFromDbRow(row: Record<string, unknown>): ProductDosageVariant[] | null {
  const { embeddedVariants } = parseResearchStudiesField(row.research_studies as string | null)
  if (embeddedVariants?.length) return embeddedVariants
  const fromColumn = parseDosageVariantsField(row.dosage_variants)
  return fromColumn?.length ? fromColumn : null
}
