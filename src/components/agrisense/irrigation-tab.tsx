'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Droplets,
  Thermometer,
  CloudRain,
  Sun,
  Wind,
  Gauge,
  CloudSun,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface SensorReading {
  soilMoisture: number
  temperature: number
  humidity: number
  lightLevel: number
  windSpeed: number
  rainfall: number
  timestamp: string
}

interface IrrigationAdvice {
  action: string
  urgency: 'critical' | 'high' | 'medium' | 'low'
  reason: string
  amount?: string
  timing?: string
}

const urgencyConfig = {
  critical: { color: 'bg-red-500', label: 'Critique', badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800' },
  high: { color: 'bg-amber-500', label: 'Urgent', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800' },
  medium: { color: 'bg-yellow-500', label: 'Modéré', badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800' },
  low: { color: 'bg-emerald-500', label: 'Faible', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' },
} as const

function generateIrrigationAdvice(data: SensorReading): IrrigationAdvice[] {
  const advice: IrrigationAdvice[] = []

  if (data.soilMoisture < 25) {
    advice.push({
      action: 'Arrosage immédiat requis',
      urgency: 'critical',
      reason: `L'humidité du sol est à ${data.soilMoisture}% — bien en dessous du seuil critique de 25%. Les racines de vos cultures risquent de se dessécher.`,
      amount: '15-20 litres/m²',
      timing: 'Immédiatement, puis toutes les 6 heures',
    })
  } else if (data.soilMoisture < 40) {
    advice.push({
      action: 'Planifier un arrosage',
      urgency: 'high',
      reason: `L'humidité du sol est à ${data.soilMoisture}%. Approchez du seuil minimal recommandé de 35% pour les cultures de riz.`,
      amount: '10-15 litres/m²',
      timing: "Dans les 4 à 6 heures, de préférence tôt le matin",
    })
  } else if (data.soilMoisture < 55) {
    advice.push({
      action: 'Surveillance normale',
      urgency: 'low',
      reason: `L'humidité du sol est à ${data.soilMoisture}% — dans la plage optimale pour la plupart des cultures.`,
      amount: '5-8 litres/m² si nécessaire',
      timing: 'Vérifiez dans 12 heures',
    })
  } else {
    advice.push({
      action: 'Réduire l\'arrosage',
      urgency: 'low',
      reason: `L'humidité du sol est élevée (${data.soilMoisture}%). Un excès d'eau peut provoquer des maladies fongiques.`,
    })
  }

  if (data.temperature > 35) {
    advice.push({
      action: 'Protection contre la chaleur',
      urgency: 'high',
      reason: `Température élevée de ${data.temperature}°C. Évitez l'arrosage en pleine journée (évaporation rapide). Privilégiez l'arrosage tôt le matin ou en fin d'après-midi.`,
      timing: 'Arrosage recommandé: 5h-7h ou 17h-19h',
    })
  } else if (data.temperature < 15) {
    advice.push({
      action: 'Attention au froid',
      urgency: 'medium',
      reason: `Température basse de ${data.temperature}°C. Réduisez les apports d'eau car l'évaporation est minimale.`,
    })
  }

  if (data.humidity < 40) {
    advice.push({
      action: 'Humidité de l\'air très basse',
      urgency: 'medium',
      reason: `L'humidité de l'air est à ${data.humidity}%. L'évaporation du sol sera accélérée. Augmentez la fréquence d'arrosage de 20%.`,
    })
  } else if (data.humidity > 85) {
    advice.push({
      action: 'Risque de maladie fongique',
      urgency: 'medium',
      reason: `L'humidité de l'air est très élevée (${data.humidity}%). Réduisez l'arrosage et assurez une bonne circulation de l'air entre les plants.`,
    })
  }

  if (data.windSpeed > 25) {
    advice.push({
      action: 'Vent fort — protéger les cultures',
      urgency: 'high',
      reason: `Vent à ${data.windSpeed} km/h. L'évaporation est fortement accélérée. Utilisez le paillage (fameno) pour retenir l'humidité du sol.`,
    })
  }

  if (data.rainfall > 5) {
    advice.push({
      action: 'Pluie récente — pas besoin d\'arroser',
      urgency: 'low',
      reason: `${data.rainfall} mm de pluie enregistrés. Le sol est naturellement alimenté. Vérifiez l'humidité dans 6 heures.`,
    })
  }

  if (data.lightLevel > 90) {
    advice.push({
      action: 'Ensoleillement intense',
      urgency: 'medium',
      reason: `Lumière à ${data.lightLevel}%. L'évapotranspiration est maximale. Assurez un apport d'eau suffisant aux jeunes plants.`,
    })
  }

  return advice
}

function generateHistoricalData(): Array<{ time: string; soilMoisture: number; rainfall: number }> {
  const data: Array<{ time: string; soilMoisture: number; rainfall: number }> = []
  const now = new Date()
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 3600000)
    data.push({
      time: `${d.getHours().toString().padStart(2, '0')}:00`,
      soilMoisture: Math.max(15, Math.min(80, 42 + (Math.random() * 20 - 10) + (i < 3 ? -8 : 0))),
      rainfall: i < 2 ? Math.round(Math.random() * 8 * 10) / 10 : 0,
    })
  }
  return data
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
}

export function IrrigationTab() {
  const [sensorData, setSensorData] = useState<SensorReading | null>(null)
  const [historicalData, setHistoricalData] = useState(generateHistoricalData)
  const [advice, setAdvice] = useState<IrrigationAdvice[]>([])
  const [loading, setLoading] = useState(true)

  const fetchSensors = async () => {
    try {
      const res = await fetch('/api/sensors')
      if (res.ok) {
        const data: SensorReading = await res.json()
        setSensorData(data)
        setAdvice(generateIrrigationAdvice(data))
        setHistoricalData(generateHistoricalData())
      }
    } catch {
      // Keep existing data on error
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSensors()
    const interval = setInterval(fetchSensors, 30000)
    return () => clearInterval(interval)
  }, [])

  const sensors = sensorData ? [
    {
      label: 'Humidité du Sol',
      value: sensorData.soilMoisture,
      unit: '%',
      icon: Droplets,
      color: sensorData.soilMoisture < 25 ? 'text-red-500' : sensorData.soilMoisture < 40 ? 'text-amber-500' : 'text-emerald-500',
      barColor: sensorData.soilMoisture < 25 ? 'data-[slot=progress-indicator]:bg-red-500' : sensorData.soilMoisture < 40 ? 'data-[slot=progress-indicator]:bg-amber-500' : 'data-[slot=progress-indicator]:bg-emerald-500',
      max: 100,
    },
    {
      label: 'Température',
      value: sensorData.temperature,
      unit: '°C',
      icon: Thermometer,
      color: sensorData.temperature > 35 ? 'text-red-500' : sensorData.temperature > 28 ? 'text-amber-500' : 'text-emerald-500',
      barColor: sensorData.temperature > 35 ? 'data-[slot=progress-indicator]:bg-red-500' : sensorData.temperature > 28 ? 'data-[slot=progress-indicator]:bg-amber-500' : 'data-[slot=progress-indicator]:bg-emerald-500',
      max: 50,
    },
    {
      label: 'Humidité de l\'Air',
      value: sensorData.humidity,
      unit: '%',
      icon: CloudRain,
      color: 'text-sky-500',
      barColor: 'data-[slot=progress-indicator]:bg-sky-500',
      max: 100,
    },
    {
      label: 'Vent',
      value: sensorData.windSpeed,
      unit: 'km/h',
      icon: Wind,
      color: sensorData.windSpeed > 25 ? 'text-red-500' : 'text-teal-500',
      barColor: sensorData.windSpeed > 25 ? 'data-[slot=progress-indicator]:bg-red-500' : 'data-[slot=progress-indicator]:bg-teal-500',
      max: 60,
    },
    {
      label: 'Pluviométrie',
      value: sensorData.rainfall,
      unit: 'mm',
      icon: CloudSun,
      color: 'text-primary',
      barColor: 'data-[slot=progress-indicator]:bg-primary',
      max: 50,
    },
    {
      label: 'Lumière',
      value: sensorData.lightLevel,
      unit: '%',
      icon: Sun,
      color: 'text-yellow-500',
      barColor: 'data-[slot=progress-indicator]:bg-yellow-500',
      max: 100,
    },
  ] : []

  const criticalCount = advice.filter(a => a.urgency === 'critical' || a.urgency === 'high').length

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
      {/* Status banner */}
      {criticalCount > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-3 dark:border-red-800 dark:bg-red-900/20"
        >
          <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-700 dark:text-red-400">
              {criticalCount} recommandation{criticalCount > 1 ? 's' : ''} urgente{criticalCount > 1 ? 's' : ''}
            </p>
            <p className="text-sm text-red-600 dark:text-red-400/80 mt-0.5">
              Action immédiate requise pour protéger vos cultures.
            </p>
          </div>
        </motion.div>
      )}

      {/* IoT Sensors Grid */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Gauge className="h-5 w-5 text-primary" />
              Capteurs IoT en Temps Réel
            </CardTitle>
            <CardDescription className="mt-1">
              Données mises à jour toutes les 30 secondes
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={fetchSensors} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" />
            Actualiser
          </Button>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {sensors.map((s) => (
              <motion.div key={s.label} variants={item} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <s.icon className={`h-4 w-4 ${s.color}`} />
                    <span className="text-sm font-medium">{s.label}</span>
                  </div>
                  <span className="text-sm font-bold tabular-nums">
                    {s.value}{s.unit}
                  </span>
                </div>
                <Progress
                  value={(s.value / s.max) * 100}
                  className={`h-2.5 ${s.barColor}`}
                />
              </motion.div>
            ))}
          </motion.div>
        </CardContent>
      </Card>

      {/* Historical Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Droplets className="h-5 w-5 text-primary" />
            Évolution de l&apos;Humidité du Sol (12h)
          </CardTitle>
          <CardDescription>
            Suivi en temps réel de l&apos;humidité et des précipitations
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="h-[240px] sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historicalData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="moistureGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.65 0.17 145)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="oklch(0.65 0.17 145)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="rainGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.6 0.12 200)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="oklch(0.6 0.12 200)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--card)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="soilMoisture"
                  stroke="oklch(0.65 0.17 145)"
                  fill="url(#moistureGrad)"
                  strokeWidth={2}
                  name="Humidité sol (%)"
                />
                <Area
                  type="monotone"
                  dataKey="rainfall"
                  stroke="oklch(0.6 0.12 200)"
                  fill="url(#rainGrad)"
                  strokeWidth={2}
                  name="Pluie (mm)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Irrigation Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Droplets className="h-5 w-5 text-primary" />
            Recommandations d&apos;Irrigation IA
          </CardTitle>
          <CardDescription>
            Conseils personnalisés basés sur les données de vos capteurs
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-3"
          >
            {advice.map((a, i) => {
              const config = urgencyConfig[a.urgency]
              return (
                <motion.div
                  key={i}
                  variants={item}
                  className="rounded-xl border p-4 sm:p-5 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${config.color}/10`}>
                      {a.urgency === 'critical' || a.urgency === 'high' ? (
                        <AlertTriangle className={`h-4 w-4 ${config.color.replace('bg-', 'text-')}`} />
                      ) : (
                        <CheckCircle2 className={`h-4 w-4 ${config.color.replace('bg-', 'text-')}`} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="font-semibold text-sm">{a.action}</span>
                        <Badge variant="outline" className={config.badge}>
                          {config.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{a.reason}</p>
                      {(a.amount || a.timing) && (
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          {a.amount && (
                            <span className="flex items-center gap-1">
                              <Droplets className="h-3 w-3" />
                              {a.amount}
                            </span>
                          )}
                          {a.timing && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {a.timing}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}