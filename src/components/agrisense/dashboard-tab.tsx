'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Thermometer,
  Droplets,
  Gauge,
  AlertTriangle,
  RefreshCw,
  CloudSun,
  CloudRain,
  Sun,
  MapPin,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { WeatherAlerts } from './weather-alerts'
import { SmsNotifications } from './sms-notifications'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface SensorData {
  soilMoisture: number
  temperature: number
  humidity: number
  lightLevel: number
  windSpeed: number
  rainfall: number
}

interface WeatherForecast {
  region: string
  temperature: number
  humidity: number
  windSpeed: number
  condition: string
  forecast: Array<{ day: string; temp: number; condition: string; rain: number }>
}

interface Alert {
  id: number
  type: string
  severity: 'critical' | 'warning' | 'info'
  title: string
  message: string
  region: string
  time: string
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

const conditionIcons: Record<string, typeof Sun> = {
  'Ensoleillé': Sun,
  'Partiellement nuageux': CloudSun,
  'Nuageux': CloudSun,
  'Pluie légère': CloudRain,
  'Pluie forte': CloudRain,
  'Orageux': CloudRain,
  'Brouillard': CloudSun,
}

export function DashboardTab() {
  const [sensorData, setSensorData] = useState<SensorData | null>(null)
  const [weather, setWeather] = useState<WeatherForecast | null>(null)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAll = async () => {
    try {
      const [sensorRes, weatherRes, alertsRes] = await Promise.all([
        fetch('/api/sensors'),
        fetch('/api/weather'),
        fetch('/api/alerts'),
      ])

      if (sensorRes.ok) setSensorData(await sensorRes.json())
      if (weatherRes.ok) setWeather(await weatherRes.json())
      if (alertsRes.ok) {
        const data = await alertsRes.json()
        setAlerts(data.alerts ?? [])
      }
    } catch {
      // Keep existing data on error
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
    const interval = setInterval(fetchAll, 60000)
    return () => clearInterval(interval)
  }, [])

  const alertCount = alerts.length

  const metrics = [
    {
      label: 'Température',
      value: sensorData ? `${sensorData.temperature}°C` : '--',
      icon: Thermometer,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
    {
      label: 'Humidité',
      value: sensorData ? `${sensorData.humidity}%` : '--',
      icon: Droplets,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Humidité du Sol',
      value: sensorData ? `${sensorData.soilMoisture}%` : '--',
      icon: Gauge,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'Alertes Actives',
      value: `${alertCount}`,
      icon: AlertTriangle,
      color: 'text-red-500',
      bg: 'bg-red-500/10',
    },
  ]

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
      {/* Hero Metrics */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {metrics.map((m) => (
          <motion.div key={m.label} variants={item}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-6 flex items-center gap-3 sm:gap-4">
                <div className={`flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl ${m.bg}`}>
                  <m.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${m.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">{m.label}</p>
                  <p className="text-xl sm:text-2xl font-bold tracking-tight">{m.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Weather Forecast Card */}
      {weather && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <CloudSun className="h-5 w-5 text-amber-500" />
                  Prévisions Météo
                </CardTitle>
                <CardDescription className="mt-1 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {weather.region} — {weather.condition}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={fetchAll} className="gap-1.5">
                <RefreshCw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Actualiser</span>
              </Button>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              {/* Quick stats */}
              <div className="flex flex-wrap gap-4 mb-5">
                <div className="flex items-center gap-1.5 text-sm">
                  <Thermometer className="h-4 w-4 text-amber-500" />
                  <span className="font-semibold">{weather.temperature}°C</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <Droplets className="h-4 w-4 text-emerald-500" />
                  <span className="font-semibold">{weather.humidity}%</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <CloudSun className="h-4 w-4 text-sky-500" />
                  <span className="font-semibold">Vent {weather.windSpeed} km/h</span>
                </div>
              </div>

              <Separator className="mb-5" />

              {/* Forecast cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {weather.forecast.map((day, i) => {
                  const CondIcon = conditionIcons[day.condition] || CloudSun
                  return (
                    <motion.div
                      key={day.day}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className="rounded-xl border p-4 text-center hover:shadow-sm transition-shadow"
                    >
                      <p className="text-sm font-semibold mb-2">{day.day}</p>
                      <CondIcon className="h-8 w-8 mx-auto mb-2 text-amber-500" />
                      <p className="text-lg font-bold">{day.temp}°C</p>
                      <p className="text-xs text-muted-foreground mt-1">{day.condition}</p>
                      <div className="mt-2 flex items-center justify-center gap-1">
                        <Droplets className="h-3 w-3 text-sky-500" />
                        <span className="text-xs text-muted-foreground">{day.rain}% pluie</span>
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              {/* Chart */}
              <div className="h-[200px] sm:h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weather.forecast} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="oklch(0.75 0.15 80)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="oklch(0.75 0.15 80)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="rainGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="oklch(0.6 0.12 200)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="oklch(0.6 0.12 200)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
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
                      dataKey="temp"
                      stroke="oklch(0.75 0.15 80)"
                      fill="url(#tempGrad)"
                      strokeWidth={2}
                      name="Température (°C)"
                    />
                    <Area
                      type="monotone"
                      dataKey="rain"
                      stroke="oklch(0.6 0.12 200)"
                      fill="url(#rainGrad)"
                      strokeWidth={2}
                      name="Pluie (%)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Alerts + IoT Sensors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WeatherAlerts />
        {sensorData && <IotSensorCard data={sensorData} />}
      </div>

      {/* SMS Notifications */}
      <SmsNotifications />
    </motion.div>
  )
}

function IotSensorCard({ data }: { data: SensorData }) {
  const sensors = [
    { label: 'Humidité du Sol', value: data.soilMoisture, unit: '%', icon: Droplets, color: 'text-emerald-500', barColor: 'data-[slot=progress-indicator]:bg-emerald-500', max: 100 },
    { label: 'Température', value: data.temperature, unit: '°C', icon: Thermometer, color: 'text-amber-500', barColor: 'data-[slot=progress-indicator]:bg-amber-500', max: 50 },
    { label: 'Humidité Air', value: data.humidity, unit: '%', icon: CloudRain, color: 'text-sky-500', barColor: 'data-[slot=progress-indicator]:bg-sky-500', max: 100 },
    { label: 'Lumière', value: data.lightLevel, unit: '%', icon: Sun, color: 'text-yellow-500', barColor: 'data-[slot=progress-indicator]:bg-yellow-500', max: 100 },
    { label: 'Vent', value: data.windSpeed, unit: 'km/h', icon: CloudSun, color: 'text-teal-500', barColor: 'data-[slot=progress-indicator]:bg-teal-500', max: 60 },
    { label: 'Pluviométrie', value: data.rainfall, unit: 'mm', icon: Gauge, color: 'text-primary', barColor: 'data-[slot=progress-indicator]:bg-primary', max: 50 },
  ]

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Gauge className="h-5 w-5 text-primary" />
          Capteurs IoT
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
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
  )
}