import { Card, CardContent } from '@/components/ui/card'
import { Star, CheckCircle } from 'lucide-react'
import type { Vouch } from '@/lib/types'

interface CustomerReviewsProps {
  vouches: Vouch[]
}

export function CustomerReviews({ vouches }: CustomerReviewsProps) {
  return (
    <section className="bg-muted/30 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Trusted by Researchers
          </h2>
          <p className="mt-2 text-muted-foreground">
            See what our customers have to say about their experience.
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {vouches.map((vouch) => (
            <Card key={vouch.id} className="bg-background">
              <CardContent className="p-6">
                {/* Stars */}
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < vouch.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-muted'
                      }`}
                    />
                  ))}
                </div>

                {/* Content */}
                <p className="mt-4 text-sm text-muted-foreground line-clamp-4">
                  {`"${vouch.content}"`}
                </p>

                {/* Author */}
                <div className="mt-4 flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">
                    {vouch.author_name}
                  </p>
                  {vouch.verified && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
