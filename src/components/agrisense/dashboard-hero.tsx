'use client'

import { motion } from 'framer-motion'
import {
  Thermometer,
  Droplets,
  Gauge,
  AlertTriangle,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { sensorData, weatherAlerts } from './mock-data'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export function DashboardHero() {
  const alertCount = weatherAlerts.length

  const metrics = [
    {
      label: 'Température',
      value: `${sensorData.temperature}°C`,
      icon: Thermometer,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
    {
      label: 'Humidité',
      value: `${sensorData.humidity}%`,
      icon: Droplets,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Humidité du Sol',
      value: `${sensorData.soilMoisture}%`,
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

  return (
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
  )
}