'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import Image from 'next/image'
import { LEGACY_LOCAL_STORAGE_KEYS } from '@/lib/legacy-brand-storage'
import {
  LS_AGE_VERIFIED,
  dispatchAgeVerifiedEvent,
} from '@/lib/age-verification'

export function AgeVerification() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    let verified = localStorage.getItem(LS_AGE_VERIFIED)
    const legacyVerified = localStorage.getItem(LEGACY_LOCAL_STORAGE_KEYS.ageVerified)
    if (!verified && legacyVerified) {
      localStorage.setItem(LS_AGE_VERIFIED, legacyVerified)
      localStorage.removeItem(LEGACY_LOCAL_STORAGE_KEYS.ageVerified)
      verified = legacyVerified
    }
    if (!verified) {
      setIsOpen(true)
    }
    setIsLoaded(true)
  }, [])

  const handleVerify = () => {
    localStorage.setItem(LS_AGE_VERIFIED, 'true')
    localStorage.removeItem(LEGACY_LOCAL_STORAGE_KEYS.ageVerified)
    setIsOpen(false)
    dispatchAgeVerifiedEvent()
  }

  const handleDecline = () => {
    window.location.href = 'https://google.com'
  }

  if (!isLoaded) return null

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className="overflow-hidden sm:max-w-md border-border bg-background p-0"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="clinical-strip" aria-hidden />
        <div className="p-6 sm:p-8">
        <DialogHeader className="text-center sm:text-center">
          <div className="mx-auto mb-4">
            <Image
              src="/images/terrain-logo.png"
              alt="Terrain Peptides"
              width={603}
              height={278}
              className="h-12 w-auto sm:h-14"
            />
          </div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary">
            Access verification
          </p>
          <DialogTitle className="mt-2 text-xl font-semibold text-navy">
            Age Verification Required
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            You must be 21 years of age or older to access this website. By entering, you confirm that you are of legal age and agree to our terms of service.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-6 space-y-4">
          <div className="rounded-md border border-clinical-teal/25 bg-clinical-teal/5 p-4">
            <p className="text-center text-sm leading-relaxed text-muted-foreground">
              All products on this website are intended for laboratory research purposes only and are not for human or animal consumption.
            </p>
          </div>
          
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              onClick={handleVerify}
              className="flex-1 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
            >
              I am 21 or older
            </Button>
            <Button
              onClick={handleDecline}
              variant="outline"
              className="flex-1 rounded-md"
            >
              Exit
            </Button>
          </div>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
