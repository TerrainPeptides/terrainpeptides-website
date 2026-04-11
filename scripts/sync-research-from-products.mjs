/**
 * One-off generator: copies const blocks + research tab body from *-product.tsx into *-research.tsx
 */
import fs from 'fs'
import path from 'path'

const root = path.join(process.cwd(), 'components', 'product')

const files = [
  {
    name: 'dsip',
    constFrom: 38,
    constTo: 84,
    bodyFrom: 159,
    bodyTo: 402,
    imports: `import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Beaker, Package, FileText } from 'lucide-react'`,
    component: 'DsipResearch',
  },
  {
    name: 'ghk-cu',
    constFrom: 38,
    constTo: 64,
    bodyFrom: 141,
    bodyTo: 266,
    imports: `import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'`,
    component: 'GhkCuResearch',
  },
  {
    name: 'bpc-157',
    constFrom: 38,
    constTo: 92,
    bodyFrom: 167,
    bodyTo: 427,
    imports: `import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Beaker, Package, FileText } from 'lucide-react'`,
    component: 'Bpc157Research',
  },
  {
    name: 'retatrutide',
    constFrom: 38,
    constTo: 106,
    bodyFrom: 181,
    bodyTo: 488,
    imports: `import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Beaker, Package, FileText, BookOpen, HelpCircle, ExternalLink } from 'lucide-react'`,
    component: 'RetatrutideResearch',
  },
  {
    name: 'mt-2',
    constFrom: 37,
    constTo: 89,
    bodyFrom: 163,
    bodyTo: 417,
    imports: `import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Beaker, Package, FileText } from 'lucide-react'`,
    component: 'Mt2Research',
  },
  {
    name: 'tb-500',
    constFrom: 38,
    constTo: 84,
    bodyFrom: 158,
    bodyTo: 401,
    imports: `import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Beaker, Package, FileText } from 'lucide-react'`,
    component: 'Tb500Research',
  },
  {
    name: 'aod-9604',
    constFrom: 38,
    constTo: 85,
    bodyFrom: 159,
    bodyTo: 402,
    imports: `import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Beaker, Package, FileText } from 'lucide-react'`,
    component: 'Aod9604Research',
  },
  {
    name: 'semax',
    constFrom: 40,
    constTo: 284,
    bodyFrom: 366,
    bodyTo: 704,
    imports: `import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Beaker, Package, FileText } from 'lucide-react'`,
    component: 'SemaxResearch',
  },
  {
    name: 'selank',
    constFrom: 40,
    constTo: 296,
    bodyFrom: 378,
    bodyTo: 699,
    imports: `import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Beaker, Package, FileText } from 'lucide-react'`,
    component: 'SelankResearch',
  },
]

function dedentBlock(lines) {
  const nonempty = lines.filter((l) => l.trim().length > 0)
  if (nonempty.length === 0) return lines
  const indents = nonempty.map((l) => l.match(/^\s*/)[0].length)
  const min = Math.min(...indents)
  return lines.map((l) => (l.length >= min ? l.slice(min) : l))
}

function sliceLines(allLines, from, to) {
  // 1-based inclusive line numbers
  return allLines.slice(from - 1, to)
}

for (const cfg of files) {
  const productPath = path.join(root, `${cfg.name}-product.tsx`)
  const outPath = path.join(root, 'research', `${cfg.name}-research.tsx`)
  const raw = fs.readFileSync(productPath, 'utf8')
  const allLines = raw.split(/\r?\n/)

  const constLines = sliceLines(allLines, cfg.constFrom, cfg.constTo)
  const bodyLines = sliceLines(allLines, cfg.bodyFrom, cfg.bodyTo)

  const constText = dedentBlock(constLines).join('\n')
  const bodyInner = dedentBlock(bodyLines).join('\n')

  const out = `'use client'

${cfg.imports}
import type { Product, Vouch } from '@/lib/types'

${constText}

interface Props {
  product: Product
  vouches?: Vouch[]
}

export function ${cfg.component}({ product, vouches: _vouches }: Props) {
  return (
    <div
      className="space-y-12 text-[1.1em] text-foreground"
      role="region"
      aria-label={\`\${product.name} research\`}
    >
${bodyInner
  .split('\n')
  .map((l) => (l.length ? `      ${l}` : ''))
  .join('\n')}
    </div>
  )
}
`
  fs.writeFileSync(outPath, out, 'utf8')
  console.log('Wrote', outPath)
}
