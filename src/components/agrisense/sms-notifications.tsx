'use client'

import { motion } from 'framer-motion'
import { MessageSquare, CheckCircle2, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { smsNotifications } from './mock-data'

export function SmsNotifications() {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <MessageSquare className="h-5 w-5 text-primary" />
          Centre de Notifications SMS
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
        <ScrollArea className="max-h-72">
          <div className="flex flex-col gap-3">
            {smsNotifications.map((sms, i) => (
              <motion.div
                key={sms.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.3 }}
                className="rounded-lg border p-3"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="text-xs font-mono text-muted-foreground">{sms.phone}</span>
                  <Badge
                    variant="outline"
                    className={
                      sms.status === 'delivered'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800'
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
                <p className="text-sm leading-relaxed">{sms.message}</p>
                <p className="mt-1.5 text-xs text-muted-foreground">{sms.time}</p>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}