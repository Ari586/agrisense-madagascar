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
  
  // Profit Calculator State
  const [calcCrop, setCalcCrop] = useState<string>('Riz (Vary)')
  const [calcSurface, setCalcSurface] = useState<number>(1000)

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

  // Profit Calculator Logic
  const selectedCropObj = prices.find((p) => p.crop === calcCrop)
  const currentPricePerKg = selectedCropObj?.price || 0
  
  // Base yields in kg/m2
  const yieldPerM2: Record<string, number> = {
    'Riz (Vary)': 0.5,
    'Maïs': 0.4,
    'Manioc': 2.0,
    'Pois du cap': 0.3,
    'Tomate': 1.5,
  }
  const estimatedYield = (yieldPerM2[calcCrop] || 0.5) * calcSurface
  const grossRevenue = estimatedYield * currentPricePerKg
  const estimatedCost = calcSurface * 250 // Base cost 250 Ar/m2
  const netProfit = grossRevenue - estimatedCost

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
                  formatter={(value: number, _name: string, props: any) => {
                    return [`${props.payload?.rawPrice?.toLocaleString('fr-FR') || value} Ar`, 'Prix']
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

      {/* Profit Calculator (Kajy Tombony) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <span className="text-2xl">💰</span>
            Kajy Tombony (Simulateur de Revenus)
          </CardTitle>
          <CardDescription>
            Estimez vos bénéfices nets en fonction de la culture et de la surface
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">🌾 Karazana Voly (Culture)</label>
              <select value={calcCrop} onChange={(e) => setCalcCrop(e.target.value)} className="w-full p-2 rounded-md border bg-background text-sm">
                {prices.map(p => (
                  <option key={p.crop} value={p.crop}>{p.crop}</option>
                ))}
                {prices.length === 0 && <option value="Vary">Riz (Vary)</option>}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">📐 Velaran-tany (Surface m²)</label>
              <input type="number" value={calcSurface} onChange={(e) => setCalcSurface(Number(e.target.value) || 0)} className="w-full p-2 rounded-md border bg-background text-sm" />
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border p-4 bg-muted/30">
              <p className="text-xs text-muted-foreground mb-1">Coût estimé (Masomboly, Zezika)</p>
              <p className="text-lg font-bold text-red-600 dark:text-red-400">- {estimatedCost.toLocaleString('fr-FR')} Ar</p>
            </div>
            <div className="rounded-xl border p-4 bg-muted/30">
              <p className="text-xs text-muted-foreground mb-1">Revenu brut (Vidio tsena)</p>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">+ {grossRevenue.toLocaleString('fr-FR')} Ar</p>
              <p className="text-[10px] text-muted-foreground mt-1">Basé sur {estimatedYield.toLocaleString('fr-FR')} kg</p>
            </div>
            <div className="rounded-xl border p-4 bg-primary/10 border-primary/20">
              <p className="text-xs font-semibold text-primary mb-1">Tombony madio (Bénéfice Net)</p>
              <p className="text-xl font-black text-primary">{netProfit > 0 ? '+' : ''}{netProfit.toLocaleString('fr-FR')} Ar</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}