'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Copy, Bitcoin } from 'lucide-react'
import { toast } from 'sonner'
import { Suspense } from 'react'

function CryptoCheckoutContent() {
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get('order')
  const cryptoAddress = searchParams.get('address')
  const totalUsd = searchParams.get('amount')

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  return (
    <div className="bg-background">
      <div className="mx-auto max-w-xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-foreground">
            Order Created
          </h1>
          <p className="mt-2 text-muted-foreground">
            Complete your payment using cryptocurrency.
          </p>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <Bitcoin className="h-5 w-5" />
              Crypto Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <p className="text-sm text-muted-foreground">Order Number</p>
              <p className="mt-1 font-mono font-bold text-foreground">
                {orderNumber}
              </p>
            </div>

            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <p className="text-sm text-muted-foreground">Amount Due</p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                ${totalUsd} USD
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Send equivalent amount in BTC, ETH, or USDC
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Send payment to this address:
              </p>
              <div className="flex items-center gap-2 rounded-lg border border-border bg-background p-3">
                <code className="flex-1 break-all text-sm text-foreground">
                  {cryptoAddress}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(cryptoAddress || '')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800">
              <p className="font-medium">Important:</p>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>Send the exact amount shown above</li>
                <li>Include your order number in the memo/note field if possible</li>
                <li>Payment must be received within 24 hours</li>
                <li>Your order will be processed after 2 network confirmations</li>
              </ul>
            </div>

            <div className="text-center">
              <Link href={`/track`}>
                <Button variant="outline">Track Your Order</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Questions? Contact us at{' '}
          <a href="mailto:support@terrainpeptides.com" className="text-primary hover:underline">
            support@terrainpeptides.com
          </a>
        </p>
      </div>
    </div>
  )
}

export default function CryptoCheckoutPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    }>
      <CryptoCheckoutContent />
    </Suspense>
  )
}
