'use client'

import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Store,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { marketPrices } from './mock-data'

const trendConfig = {
  up: { icon: TrendingUp, className: 'text-emerald-600 dark:text-emerald-400', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  down: { icon: TrendingDown, className: 'text-red-600 dark:text-red-400', badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  stable: { icon: Minus, className: 'text-muted-foreground', badge: 'bg-muted text-muted-foreground' },
} as const

export function MarketPrices() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Store className="h-5 w-5 text-primary" />
            Prix du Marché
          </CardTitle>
          <CardDescription>
            Prix actuels des principales cultures à Madagascar (Ariary)
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2 sm:px-6 pb-4 sm:pb-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Culture</TableHead>
                <TableHead className="text-right">Prix</TableHead>
                <TableHead className="text-right hidden sm:table-cell">Unité</TableHead>
                <TableHead className="text-right">Tendance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {marketPrices.map((item, i) => {
                const trend = trendConfig[item.trend]
                const TrendIcon = trend.icon
                return (
                  <motion.tr
                    key={item.crop}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                    className="hover:bg-muted/50 border-b transition-colors"
                  >
                    <TableCell className="font-medium">{item.crop}</TableCell>
                    <TableCell className="text-right font-bold tabular-nums">
                      {item.price.toLocaleString('fr-FR')}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground hidden sm:table-cell">
                      {item.unit}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant="outline"
                        className={`gap-1 ${trend.badge}`}
                      >
                        <TrendIcon className="h-3 w-3" />
                        {item.change}
                      </Badge>
                    </TableCell>
                  </motion.tr>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  )
}