'use client'

import { motion } from 'framer-motion'
import {
  Droplets,
  Thermometer,
  CloudRain,
  Sun,
  Wind,
  Gauge,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { sensorData } from './mock-data'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
}

const sensors = [
  {
    label: 'Humidité du Sol',
    value: sensorData.soilMoisture,
    unit: '%',
    icon: Droplets,
    color: 'text-emerald-500',
    barColor: 'data-[slot=progress-indicator]:bg-emerald-500',
    max: 100,
  },
  {
    label: 'Température',
    value: sensorData.temperature,
    unit: '°C',
    icon: Thermometer,
    color: 'text-amber-500',
    barColor: 'data-[slot=progress-indicator]:bg-amber-500',
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
    label: 'Lumière',
    value: sensorData.lightLevel,
    unit: '%',
    icon: Sun,
    color: 'text-yellow-500',
    barColor: 'data-[slot=progress-indicator]:bg-yellow-500',
    max: 100,
  },
  {
    label: 'Vent',
    value: sensorData.windSpeed,
    unit: 'km/h',
    icon: Wind,
    color: 'text-teal-500',
    barColor: 'data-[slot=progress-indicator]:bg-teal-500',
    max: 60,
  },
  {
    label: 'Pluviométrie',
    value: sensorData.rainfall,
    unit: 'mm',
    icon: Gauge,
    color: 'text-primary',
    barColor: 'data-[slot=progress-indicator]:bg-primary',
    max: 50,
  },
]

export function SensorDashboard() {
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
                <span className="text-sm font-bold">
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