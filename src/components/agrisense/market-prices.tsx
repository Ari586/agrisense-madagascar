'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Store,
  RefreshCw,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

interface CropPrice {
  crop: string
  price: number
  unit: string
  trend: 'up' | 'down' | 'stable'
  change: string
}

const trendConfig = {
  up: { icon: TrendingUp, className: 'text-emerald-600 dark:text-emerald-400', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' },
  down: { icon: TrendingDown, className: 'text-red-600 dark:text-red-400', badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800' },
  stable: { icon: Minus, className: 'text-muted-foreground', badge: 'bg-muted text-muted-foreground' },
} as const

const CHART_COLORS = [
  'oklch(0.65 0.17 145)',
  'oklch(0.6 0.2 25)',
  'oklch(0.7 0.15 135)',
  'oklch(0.75 0.15 80)',
  'oklch(0.6 0.12 200)',
  'oklch(0.55 0.2 25)',
  'oklch(0.65 0.17 145)',
  'oklch(0.7 0.15 135)',
]

export function MarketPrices() {
  const [prices, setPrices] = useState<CropPrice[]>([])
  const [lastUpdate, setLastUpdate] = useState<string>('')
  const [loading, setLoading] = useState(true)

  const fetchPrices = async () => {
    try {
      const res = await fetch('/api/market')
      if (res.ok) {
        const data = await res.json()
        setPrices(data.prices ?? [])
        setLastUpdate(data.lastUpdate ?? '')
      }
    } catch {
      // Keep existing data on error
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPrices()
    const interval = setInterval(fetchPrices, 120000)
    return () => clearInterval(interval)
  }, [])

  // Normalize prices for chart (use a scale factor for large prices like vanilla)
  const chartData = prices.map((p) => {
    const normalizedPrice = p.price > 10000 ? Math.round(p.price / 1000) : p.price
    return {
      name: p.crop.replace(/ \(.+\)/, ''),
      price: normalizedPrice,
      unit: p.price > 10000 ? 'k Ar/kg' : 'Ar/kg',
      rawPrice: p.price,
    }
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col gap-6"
    >
      {/* Price Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Store className="h-5 w-5 text-primary" />
              Prix du Marché
            </CardTitle>
            <CardDescription>
              Prix actuels des principales cultures à Madagascar (Ariary)
              {lastUpdate && (
                <span className="ml-2 text-xs">
                  — Mis à jour {new Date(lastUpdate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={fetchPrices} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Actualiser</span>
          </Button>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="h-[280px] sm:h-[320px] mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  angle={-25}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--card)',
                  }}
                  formatter={(value: number, _name: string, props: { payload: { rawPrice: number; unit: string } }) => {
                    return [`${props.payload.rawPrice.toLocaleString('fr-FR')} Ar`, 'Prix']
                  }}
                />
                <Bar dataKey="price" radius={[6, 6, 0, 0]}>
                  {chartData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Table */}
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
              {prices.map((item, i) => {
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