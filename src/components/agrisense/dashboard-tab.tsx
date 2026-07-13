'use client'

import { DashboardHero } from './dashboard-hero'
import { WeatherAlerts } from './weather-alerts'
import { SensorDashboard } from './sensor-dashboard'
import { SmsNotifications } from './sms-notifications'
import { motion } from 'framer-motion'

export function DashboardTab() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col gap-6"
    >
      <DashboardHero />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WeatherAlerts />
        <SensorDashboard />
      </div>
      <SmsNotifications />
    </motion.div>
  )
}