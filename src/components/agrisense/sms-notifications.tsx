'use client'

import { motion } from 'framer-motion'
import { MessageSquare, CheckCircle2, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { smsNotifications } from './mock-data'

export function SmsNotifications() {
  return (
    <Card className="hover:shadow-2xl transition-all duration-300 bg-white/5 backdrop-blur-xl border-white/10 shadow-xl overflow-hidden relative text-zinc-100">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5 pointer-events-none" />
      <CardHeader className="relative z-10 border-b border-white/10 pb-4 bg-white/5">
        <CardTitle className="flex items-center gap-3 text-lg sm:text-xl font-bold text-white">
          <div className="p-2 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 shadow-lg">
            <MessageSquare className="h-5 w-5 text-white" />
          </div>
          <span className="drop-shadow-sm">Fampandrenesana SMS</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 py-6 relative z-10">
        <ScrollArea className="max-h-[350px]">
          <div className="flex flex-col gap-4 pr-3">
            {smsNotifications.map((sms, i) => (
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