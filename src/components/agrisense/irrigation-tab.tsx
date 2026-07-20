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
import { apiUrl } from '@/lib/api'
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
  critical: { color: 'bg-red-500', label: 'Tena Loza', badge: 'bg-red-500/20 text-red-300 border-red-500/30' },
  high: { color: 'bg-amber-500', label: 'Maika', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  medium: { color: 'bg-yellow-500', label: 'Antonony', badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
  low: { color: 'bg-emerald-500', label: 'Azo ekena', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
} as const

function generateIrrigationAdvice(data: SensorReading): IrrigationAdvice[] {
  const advice: IrrigationAdvice[] = []

  if (data.soilMoisture < 25) {
    advice.push({
      action: 'Mila rano avy hatrany',
      urgency: 'critical',
      reason: `Ambany loatra ny hamandoana (${data.soilMoisture}%). Ahiana ho maina ny fakan'ny voly.`,
      amount: '15-20 litatra/m²',
      timing: 'Avy hatrany, ary isaky ny 6 ora',
    })
  } else if (data.soilMoisture < 40) {
    advice.push({
      action: 'Omano ny fanondrahana',
      urgency: 'high',
      reason: `Midina ny hamandoana (${data.soilMoisture}%). Manakaiky ny fetra tokony ho izy (35%).`,
      amount: '10-15 litatra/m²',
      timing: "Ato anatin'ny 4 na 6 ora, tsara indrindra rehefa maraina",
    })
  } else if (data.soilMoisture < 55) {
    advice.push({
      action: 'Fanaraha-maso tsotra',
      urgency: 'low',
      reason: `Tsara ny hamandoana (${data.soilMoisture}%) ho an'ny ankamaroan'ny voly.`,
      amount: '5-8 litatra/m² raha ilaina',
      timing: 'Zahao indray afaka 12 ora',
    })
  } else {
    advice.push({
      action: 'Ahenao ny rano',
      urgency: 'low',
      reason: `Be loatra ny rano (${data.soilMoisture}%). Mety hiteraka aretina amin'ny faka izany.`,
    })
  }

  if (data.temperature > 35) {
    advice.push({
      action: 'Fiarovana amin\'ny hafanana',
      urgency: 'high',
      reason: `Mafana be ny andro (${data.temperature}°C). Aza manondraka rano amin'ny antoandro be.`,
      timing: 'Soso-kevitra: 5h-7h na 17h-19h',
    })
  } else if (data.temperature < 15) {
    advice.push({
      action: 'Ahemory ny fanondrahana',
      urgency: 'medium',
      reason: `Mangatsiaka ny andro (${data.temperature}°C). Mety hiteraka fihomboan'ny holatra ny fanondrahana izao.`,
    })
  }

  if (data.humidity < 40) {
    advice.push({
      action: 'Maina loatra ny rivotra',
      urgency: 'medium',
      reason: `Ny hamandoan'ny rivotra dia ${data.humidity}%. Hafainganin'izany ny etona amin'ny tany. Ampitomboy 20% ny fanondrahana.`,
    })
  } else if (data.humidity > 85) {
    advice.push({
      action: 'Atahorana hisy holatra',
      urgency: 'medium',
      reason: `Avo loatra ny hamandoan'ny rivotra (${data.humidity}%). Ahena ny fanondrahana ary avelao hihetsika ny rivotra eo amin'ny voly.`,
    })
  }

  if (data.windSpeed > 25) {
    advice.push({
      action: 'Rivotra mahery — arovy ny voly',
      urgency: 'high',
      reason: `Rivotra ${data.windSpeed} km/h. Mampietona haingana ny rano. Asio molch (fameno) hitazomana ny hamandoana.`,
    })
  }

  if (data.rainfall > 5) {
    advice.push({
      action: 'Ajanony ny fanondrahana',
      urgency: 'low',
      reason: `Misy rotsak'orana vao haingana (${data.rainfall}mm). Tsy mila rano ny voly aloha.`,
    })
  }

  if (data.lightLevel > 90) {
    advice.push({
      action: 'Masoandro mirehitra',
      urgency: 'medium',
      reason: `Hazavana ${data.lightLevel}%. Ambony ny etona. Ataovy azo antoka fa mahazo rano tsara ny voly tanora.`,
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
  const [isIrrigating, setIsIrrigating] = useState(false)

  const fetchSensors = async () => {
    try {
      const res = await fetch(apiUrl('/api/sensors'))
      if (res.ok) {
        const data: SensorReading = await res.json()
        setSensorData(data)
        setAdvice(generateIrrigationAdvice(data))
        setHistoricalData(generateHistoricalData())
      }
    } catch {
    } finally {
      setLoading(false)
    }
  }

  const handleManualIrrigation = () => {
    setIsIrrigating(true)
    setTimeout(() => setIsIrrigating(false), 2000)
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void fetchSensors()
    }, 0)
    const interval = setInterval(() => {
      void fetchSensors()
    }, 30000)
    return () => {
      window.clearTimeout(timeout)
      clearInterval(interval)
    }
  }, [])

  const latestData = sensorData || { soilMoisture: 0, temperature: 0, humidity: 0, lightLevel: 0, windSpeed: 0, rainfall: 0 }
  const status = advice.length > 0 ? advice[0].urgency : 'low'

  const sensors = sensorData ? [
    { label: 'Hamandoan\'ny Tany', value: sensorData.soilMoisture, unit: '%', icon: Droplets, color: 'text-emerald-500', barColor: 'data-[slot=progress-indicator]:bg-emerald-500', max: 100 },
    { label: 'Haizana', value: sensorData.temperature, unit: '°C', icon: Thermometer, color: 'text-orange-500', barColor: 'data-[slot=progress-indicator]:bg-orange-500', max: 50 },
    { label: 'Hamandoan\'ny Rivotra', value: sensorData.humidity, unit: '%', icon: CloudRain, color: 'text-sky-500', barColor: 'data-[slot=progress-indicator]:bg-sky-500', max: 100 },
    { label: 'Rivotra', value: sensorData.windSpeed, unit: 'km/h', icon: Wind, color: 'text-teal-500', barColor: 'data-[slot=progress-indicator]:bg-teal-500', max: 60 },
    { label: 'Rotsak\'orana', value: sensorData.rainfall, unit: 'mm', icon: CloudSun, color: 'text-blue-500', barColor: 'data-[slot=progress-indicator]:bg-blue-500', max: 50 },
    { label: 'Hazavana', value: sensorData.lightLevel, unit: '%', icon: Sun, color: 'text-yellow-500', barColor: 'data-[slot=progress-indicator]:bg-yellow-500', max: 100 },
  ] : []

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-black/40 backdrop-blur-xl rounded-xl shadow-xl text-white">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-500/20 text-blue-400">
              <Droplets className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-white">Fikarakarana Rano</CardTitle>
              <CardDescription className="text-white/70">Tari-dalana manokana</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className={`gap-1.5 rounded-full px-3 py-1 text-sm font-medium border-white/20 ${
            status === 'critical' ? 'bg-red-500/20 text-red-300' :
            status === 'high' ? 'bg-amber-500/20 text-amber-300' :
            status === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
            'bg-emerald-500/20 text-emerald-300'
          }`}>
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${urgencyConfig[status].color}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${urgencyConfig[status].color}`}></span>
            </span>
            {urgencyConfig[status].label}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-2">
            <span className="text-sm font-medium text-white/70">Hamandoan'ny Tany</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">{latestData.soilMoisture}%</span>
              <span className="text-sm text-emerald-400">Tsara</span>
            </div>
            <Progress value={latestData.soilMoisture} className="h-1.5 mt-2 bg-white/10" />
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-2">
            <span className="text-sm font-medium text-white/70">Rano Ilaina</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">
                {status === 'critical' ? '15L' : status === 'high' ? '10L' : '0L'}
              </span>
              <span className="text-sm text-white/50">/m²</span>
            </div>
            <div className="text-sm font-medium mt-2 text-blue-400">
              {status === 'low' ? 'Tsy mila' : 'Ilaina anio'}
            </div>
          </div>
        </div>

        <Button 
          size="lg" 
          className={`w-full text-base font-semibold shadow-lg ${
            status === 'critical' || status === 'high' 
              ? 'bg-blue-600 hover:bg-blue-700 text-white animate-pulse' 
              : 'bg-white/10 hover:bg-white/20 text-white'
          }`}
          onClick={handleManualIrrigation}
          disabled={isIrrigating || status === 'low'}
        >
          {isIrrigating ? (
            <>
              <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
              Manondraka...
            </>
          ) : (
            <>
              <Droplets className="mr-2 h-5 w-5" />
              Omeo Rano ({status === 'low' ? 'Tsy Ilaina' : 'Mandeha'})
            </>
          )}
        </Button>

        <div className="pt-4 mb-2">
          <h4 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-4">Tantaran'ny Hamandoana (12 ora farany)</h4>
          <div className="h-48 w-full bg-white/5 rounded-xl border border-white/10 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historicalData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMoisture" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="rgba(255,255,255,0.3)" fontSize={11} tickMargin={8} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(10,15,30,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                  itemStyle={{ color: '#10b981' }}
                />
                <Area type="monotone" dataKey="soilMoisture" name="Hamandoana (%)" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorMoisture)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="pt-2">
          <h4 className="text-sm font-semibold text-white/80 uppercase tracking-wider">Tari-dalana feno</h4>
          <div className="space-y-3 mt-4">
            {advice.map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`p-4 rounded-lg bg-white/5 relative overflow-hidden`}
              >
                <div className={`absolute top-0 left-0 w-1 h-full ${urgencyConfig[item.urgency].color}`} />
                <div className="pl-3">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-white">{item.action}</span>
                    <Badge variant="outline" className={urgencyConfig[item.urgency].badge}>
                      {urgencyConfig[item.urgency].label}
                    </Badge>
                  </div>
                  <p className="text-sm text-white/70 leading-relaxed mb-3">{item.reason}</p>
                  
                  {(item.amount || item.timing) && (
                    <div className="flex flex-wrap gap-4 mt-2 pt-3 border-t border-white/10 text-xs font-medium text-white/60">
                      {item.amount && (
                        <div className="flex items-center gap-1.5">
                          <Droplets className="h-3.5 w-3.5" />
                          {item.amount}
                        </div>
                      )}
                      {item.timing && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          {item.timing}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>
    </div>
  )
}