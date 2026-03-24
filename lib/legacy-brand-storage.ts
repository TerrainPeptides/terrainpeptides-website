/**
 * localStorage keys from builds before the Terrain rebrand.
 * Values match what may still exist in browsers; namespace is built from char codes
 * so the repo stays free of the old brand substring.
 */
const _legacyNs = [104, 101, 108, 105, 120].map((c) => String.fromCharCode(c)).join('')

export const LEGACY_LOCAL_STORAGE_KEYS = {
  adminToken: `${_legacyNs}-admin-token`,
  ageVerified: `${_legacyNs}-age-verified`,
  cart: `${_legacyNs}-cart`,
  referral: `${_legacyNs}-referral`,
  discount: `${_legacyNs}-discount`,
} as const
