'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, CheckCircle2, Clock, Send, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { smsNotifications as initialSmsNotifications } from './mock-data'
import { useToast } from '@/hooks/use-toast'

export function SmsNotifications() {
  const [notifications, setNotifications] = useState(initialSmsNotifications)
  const [isSimulating, setIsSimulating] = useState(false)
  const { toast } = useToast()

  const handleSimulateAlert = async () => {
    setIsSimulating(true)
    try {
      const response = await fetch('/api/iot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: "TEST_SIMULATOR",
          soilMoisture: 20, // Faible humidité pour déclencher le SMS
          temperature: 30
        })
      })

      const data = await response.json()
      
      if (data.smsSent) {
        toast({
          title: "SMS Envoyé",
          description: "Le SMS a été envoyé via Twilio avec succès.",
          className: "bg-emerald-500 text-white border-none",
        })
        
        // Ajouter à la liste visuelle
        setNotifications([{
          id: Date.now(),
          phone: "Mon Téléphone",
          message: data.alertMessage,
          status: "delivered",
          time: "À l'instant"
        }, ...notifications])
      } else {
        toast({
          variant: "destructive",
          title: "Erreur ou Mode Test",
          description: "Alerte déclenchée, mais les identifiants Twilio ne sont pas configurés dans .env.local",
        })
      }
    } catch (err) {
      console.error(err)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de contacter l'API.",
      })
    } finally {
      setIsSimulating(false)
    }
  }

  return (
    <Card className="hover:shadow-2xl transition-all duration-300 bg-white/5 backdrop-blur-xl border-white/10 shadow-xl overflow-hidden relative text-zinc-100 flex flex-col h-full">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5 pointer-events-none" />
      <CardHeader className="relative z-10 border-b border-white/10 pb-4 bg-white/5 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-3 text-lg sm:text-xl font-bold text-white">
          <div className="p-2 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 shadow-lg">
            <MessageSquare className="h-5 w-5 text-white" />
          </div>
          <span className="drop-shadow-sm">Fampandrenesana SMS</span>
        </CardTitle>
        <Button 
          onClick={handleSimulateAlert} 
          disabled={isSimulating}
          size="sm" 
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg transition-all"
        >
          {isSimulating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
          Simuler Alerte
        </Button>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 py-6 relative z-10 flex-grow">
        <ScrollArea className="h-[350px]">
          <div className="flex flex-col gap-4 pr-3">
            {notifications.map((sms, i) => (
              <motion.div
                key={sms.id}
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: i * 0.08, duration: 0.4, type: "spring", stiffness: 100 }}
                className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 hover:bg-white/10 transition-colors shadow-sm"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="text-xs font-mono text-white/60">{sms.phone}</span>
                  <Badge
                    variant="outline"
                    className={
                      sms.status === 'delivered'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }
                  >
                    {sms.status === 'delivered' ? (
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                    ) : (
                      <Clock className="h-3 w-3 mr-1" />
                    )}
                    {sms.status === 'delivered' ? 'Envoyé' : 'En attente'}
                  </Badge>
                </div>
                <p className="text-sm leading-relaxed text-zinc-100">{sms.message}</p>
                <p className="mt-2 text-xs font-medium text-white/50">{sms.time}</p>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}