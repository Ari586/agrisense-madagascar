'use client'

import { motion } from 'framer-motion'
import {
  Cyclone,
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
  critical: { className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800', label: 'Critique' },
  warning: { className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800', label: 'Attention' },
  info: { className: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 border-teal-200 dark:border-teal-800', label: 'Info' },
} as const

const typeIcons: Record<string, FC<{ className?: string }>> = {
  cyclone: Cyclone,
  drought: CloudSun,
  rain: CloudRain,
}

export function WeatherAlerts() {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Cyclone className="h-5 w-5 text-red-500" />
          Alertes Climatiques
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
        <ScrollArea className="max-h-72">
          <div className="flex flex-col gap-3">
            {weatherAlerts.map((alert, i) => {
              const Icon = typeIcons[alert.type] ?? CloudRain
              const sev = severityConfig[alert.severity]
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.3 }}
                  className="rounded-lg border p-3 sm:p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${alert.severity === 'critical' ? 'bg-red-500/10' : alert.severity === 'warning' ? 'bg-amber-500/10' : 'bg-teal-500/10'}`}>
                      <Icon className={`h-4 w-4 ${alert.severity === 'critical' ? 'text-red-500' : alert.severity === 'warning' ? 'text-amber-500' : 'text-teal-500'}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">{alert.title}</span>
                        <Badge variant="outline" className={sev.className}>
                          {sev.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{alert.message}</p>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{alert.region}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{alert.time}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}