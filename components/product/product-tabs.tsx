'use client'

import { type ReactNode } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Beaker, FlaskConical, Microscope } from 'lucide-react'
import type { Product } from '@/lib/types'

interface ProductTabsProps {
  product: Product
  researchContent?: ReactNode
  hasFullResearch?: boolean
}

export function ProductTabs({ product, researchContent, hasFullResearch = false }: ProductTabsProps) {
  return (
    <div className="mt-16">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6 h-auto w-full flex-wrap justify-start gap-0 rounded-none border-0 border-b border-border bg-transparent p-0 sm:w-auto">
          <TabsTrigger
            value="overview"
            className="gap-2 rounded-none border-0 border-b-2 border-transparent bg-transparent px-5 py-3 text-sm text-muted-foreground shadow-none data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
          >
            <Beaker className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="research"
            className="gap-2 rounded-none border-0 border-b-2 border-transparent bg-transparent px-5 py-3 text-sm text-muted-foreground shadow-none data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
          >
            <Microscope className="h-4 w-4" />
            Research
          </TabsTrigger>
          <TabsTrigger
            value="specifications"
            className="gap-2 rounded-none border-0 border-b-2 border-transparent bg-transparent px-5 py-3 text-sm text-muted-foreground shadow-none data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
          >
            <FlaskConical className="h-4 w-4" />
            Specifications
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-0">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Beaker className="h-5 w-5" />
                Product Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground/70">
                {product.description ||
                  `${product.name} is a premium research compound available for laboratory use. All products undergo rigorous quality control testing to ensure consistency and purity.`}
              </p>
              {product.overview && (
                <p className="text-foreground/70">{product.overview}</p>
              )}
              <div className="rounded-lg bg-primary/[0.03] p-5">
                <h4 className="mb-3 font-semibold text-foreground">Quality Assurance</h4>
                <ul className="space-y-2.5 text-sm text-foreground/70">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Third-party HPLC purity testing
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Mass spectrometry verification
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Certificate of Analysis included
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Batch-specific documentation
                  </li>
                </ul>
              </div>
              {product.research_benefits && product.research_benefits.length > 0 && (
                <div>
                  <h4 className="mb-3 font-semibold text-foreground">Research Applications</h4>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {product.research_benefits.map((b, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 rounded-lg border border-border px-4 py-3 text-sm text-foreground"
                      >
                        <span className="text-foreground/40">•</span>
                        {b}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Research Tab */}
        <TabsContent value="research" className="mt-0">
          {hasFullResearch && researchContent ? (
            researchContent
          ) : (
            <Card className="border-border">
              <CardContent className="flex flex-col items-center py-16 text-center">
                <Microscope className="h-12 w-12 text-foreground/20" />
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  Research Data Coming Soon
                </h3>
                <p className="mt-2 max-w-md text-sm text-foreground/60">
                  We are actively compiling peer-reviewed studies and clinical data for {product.name}. Detailed research information will be published here shortly.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Specifications Tab */}
        <TabsContent value="specifications" className="mt-0">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <FlaskConical className="h-5 w-5" />
                Technical Specifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {product.purity && (
                  <div className="rounded-lg border border-border p-4">
                    <p className="text-sm text-foreground/60">Purity</p>
                    <p className="mt-1 text-lg font-semibold text-foreground">{product.purity}</p>
                  </div>
                )}
                {product.dosage && (
                  <div className="rounded-lg border border-border p-4">
                    <p className="text-sm text-foreground/60">Amount</p>
                    <p className="mt-1 text-lg font-semibold text-foreground">{product.dosage}</p>
                  </div>
                )}
                {product.molecular_weight && (
                  <div className="rounded-lg border border-border p-4">
                    <p className="text-sm text-foreground/60">Molecular Weight</p>
                    <p className="mt-1 text-lg font-semibold text-foreground">{product.molecular_weight}</p>
                  </div>
                )}
                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm text-foreground/60">Physical Form</p>
                  <p className="mt-1 text-lg font-semibold text-foreground">
                    {product.slug === 'capsule-stack' ? 'Capsule' : 'Lyophilized Powder'}
                  </p>
                </div>
                {(product.vial_count ?? 1) > 1 && (
                  <div className="rounded-lg border border-border p-4">
                    <p className="text-sm text-foreground/60">Vials per Package</p>
                    <p className="mt-1 text-lg font-semibold text-foreground">{product.vial_count}</p>
                  </div>
                )}
              </div>
              {product.sequence && (
                <div className="mt-6 rounded-lg border border-border p-4">
                  <p className="mb-2 text-sm text-foreground/60">Amino Acid Sequence</p>
                  <p className="font-mono text-sm text-foreground break-all">{product.sequence}</p>
                </div>
              )}
              <div className="mt-6 rounded-lg bg-primary/[0.03] p-4">
                <p className="text-sm text-foreground/60">
                  <strong className="text-foreground">Disclaimer:</strong> This product is intended for laboratory research use only. Not for human or animal consumption.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
