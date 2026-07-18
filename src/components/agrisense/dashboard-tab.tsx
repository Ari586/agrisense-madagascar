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
import { DashboardHero } from './dashboard-hero'
import dynamic from 'next/dynamic'

import { Separator } from '@/components/ui/separator'
import { WeatherAlerts } from './weather-alerts'
import { ToetrandroTab } from './toetrandro-tab'
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
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAll = async () => {
    try {
      const [sensorRes, alertsRes] = await Promise.all([
        fetch('/api/sensors').catch(() => null),
        fetch('/api/alerts').catch(() => null),
      ])

      if (sensorRes && sensorRes.ok) {
        sensorRes.json().then(setSensorData).catch(() => {})
      }
      if (alertsRes && alertsRes.ok) {
        alertsRes.json().then(data => setAlerts(data.alerts ?? [])).catch(() => {})
      }
    } catch (err) {
      console.error(err)
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
      label: 'Maripana',
      value: sensorData ? `${sensorData.temperature}°C` : '--',
      icon: Thermometer,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
    {
      label: 'Hamandoan\'ny Rivotra',
      value: sensorData ? `${sensorData.humidity}%` : '--',
      icon: Droplets,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Hamandoan\'ny Tany',
      value: sensorData ? `${sensorData.soilMoisture}%` : '--',
      icon: Gauge,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'Fampitandremana',
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-6 lg:gap-8 pb-24 lg:pb-8"
    >
      {/* Hero Section */}
      <DashboardHero />
      
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-2"
      >
        <ToetrandroTab />
      </motion.div>

      {/* Hero Metrics */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
      >
        {metrics.map((m) => (
          <motion.div key={m.label} variants={item}>
            <div className="relative overflow-hidden group rounded-xl bg-black/40 backdrop-blur-xl hover:bg-black/50 transition-all shadow-xl hover:shadow-2xl duration-300 h-full text-white">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary/40 group-hover:bg-primary transition-colors duration-300" />
              <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 relative z-10 pl-6 sm:pl-7">
                <div className={`flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-lg ${m.bg} text-primary bg-primary/20 transition-transform group-hover:scale-105 duration-300`}>
                  <m.icon className={`h-5 w-5 sm:h-6 sm:w-6`} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-white/70 font-semibold uppercase tracking-wider truncate mb-1">{m.label}</p>
                  <p className="text-2xl sm:text-3xl font-medium tracking-tight text-white">{m.value}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Alerts + IoT Sensors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WeatherAlerts alerts={alerts} />
        {sensorData && <IotSensorCard data={sensorData} />}
      </div>

    </motion.div>
  )
}

function IotSensorCard({ data }: { data: SensorData }) {
  const sensors = [
    { label: 'Hamandoan\'ny Sol', value: data.soilMoisture, unit: '%', icon: Droplets, color: 'text-emerald-500', bg: 'bg-emerald-500/10', barColor: 'data-[slot=progress-indicator]:bg-emerald-500', max: 100 },
    { label: 'Maripana', value: data.temperature, unit: '°C', icon: Thermometer, color: 'text-amber-500', bg: 'bg-amber-500/10', barColor: 'data-[slot=progress-indicator]:bg-amber-500', max: 50 },
    { label: 'Hamandoan\'ny Rivotra', value: data.humidity, unit: '%', icon: CloudRain, color: 'text-sky-500', bg: 'bg-sky-500/10', barColor: 'data-[slot=progress-indicator]:bg-sky-500', max: 100 },
    { label: 'Fahazavana', value: data.lightLevel, unit: '%', icon: Sun, color: 'text-yellow-500', bg: 'bg-yellow-500/10', barColor: 'data-[slot=progress-indicator]:bg-yellow-500', max: 100 },
    { label: 'Rivotra', value: data.windSpeed, unit: 'km/h', icon: CloudSun, color: 'text-teal-500', bg: 'bg-teal-500/10', barColor: 'data-[slot=progress-indicator]:bg-teal-500', max: 60 },
    { rotsakOrana: 'Rotsak\'orana', value: data.rainfall, unit: 'mm', icon: Gauge, color: 'text-primary', bg: 'bg-primary/10', barColor: 'data-[slot=progress-indicator]:bg-primary', max: 50 },
  ]

  return (
    <div className="relative overflow-hidden rounded-xl bg-black/40 backdrop-blur-xl shadow-xl p-6 sm:p-8 h-full flex flex-col text-white">
      <div className="flex items-center gap-4 mb-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
          <Gauge className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white tracking-tight">Fitaovana IoT</h3>
          <p className="text-xs text-white/70 mt-1">Sata an-tserasera (Zavatra mandeha)</p>
        </div>
      </div>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1"
      >
        {sensors.map((s, idx) => (
          <motion.div key={idx} variants={item} className="group p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-md ${s.bg}`}>
                  <s.icon className={`h-4 w-4 ${s.color}`} />
                </div>
                <span className="text-sm font-medium tracking-wide truncate pr-2 text-white">{s.label || s.rotsakOrana}</span>
              </div>
              <span className="text-lg font-medium tabular-nums whitespace-nowrap text-white">
                {s.value}<span className="text-xs text-white/70 ml-1">{s.unit}</span>
              </span>
            </div>
            <Progress
              value={(s.value / s.max) * 100}
              className={`h-1.5 ${s.barColor} bg-white/10`}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}