'use client'

import { motion } from 'framer-motion'
import {
  Tornado,
  CloudSun,
  CloudRain,
  MapPin,
  Clock,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { weatherAlerts } from './mock-data'
import type { FC } from 'react'

const severityConfig = {
  critical: { className: 'bg-red-500/20 text-red-300 border-red-500/30', label: 'Tena Loza' },
  warning: { className: 'bg-amber-500/20 text-amber-300 border-amber-500/30', label: 'Tandremo' },
  info: { className: 'bg-teal-500/20 text-teal-300 border-teal-500/30', label: 'Vaovao' },
} as const

const typeIcons: Record<string, FC<{ className?: string }>> = {
  cyclone: Tornado,
  drought: CloudSun,
  rain: CloudRain,
}

export function WeatherAlerts() {
  return (
    <div className="relative overflow-hidden rounded-xl bg-black/40 backdrop-blur-xl shadow-xl p-6 sm:p-8 h-full flex flex-col text-white">
      <div className="flex items-center gap-4 mb-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-500/20">
          <Tornado className="h-6 w-6 text-red-400" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white tracking-tight">Fampitandremana</h3>
          <p className="text-xs text-white/70 mt-1">Toetrandro sy Loza</p>
        </div>
      </div>
      <ScrollArea className="flex-1 -mx-2 px-2">
        <div className="flex flex-col gap-4">
          {weatherAlerts.map((alert, i) => {
            const Icon = typeIcons[alert.type] ?? CloudRain
            const sev = severityConfig[alert.severity]
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1, duration: 0.3 }}
                className="group p-4 sm:p-5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${alert.severity === 'critical' ? 'bg-red-500/20' : alert.severity === 'warning' ? 'bg-amber-500/20' : 'bg-teal-500/20'}`}>
                    <Icon className={`h-5 w-5 ${alert.severity === 'critical' ? 'text-red-400' : alert.severity === 'warning' ? 'text-amber-400' : 'text-teal-400'}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="font-semibold text-sm text-white">{alert.title}</span>
                      <Badge variant="outline" className={`rounded-sm px-2 font-medium ${sev.className}`}>
                        {sev.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-white/80 leading-relaxed mb-3">{alert.message}</p>
                    <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/60 font-medium uppercase tracking-wider">
                      <span className="flex items-center gap-1.5"><MapPin className="h-3 w-3" />{alert.region}</span>
                      <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" />{alert.time}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}