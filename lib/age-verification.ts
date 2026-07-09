export const LS_AGE_VERIFIED = 'terrain-age-verified'

/** Fired when the user explicitly confirms age on the verification modal. */
export const AGE_VERIFIED_EVENT = 'terrain-age-verified'

export function isAgeVerifiedInStorage(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(LS_AGE_VERIFIED) === 'true'
}

export function dispatchAgeVerifiedEvent(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(AGE_VERIFIED_EVENT))
}
