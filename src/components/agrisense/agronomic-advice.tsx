'use client'

import { motion } from 'framer-motion'
import {
  Sprout,
  Sun,
  Wheat,
  Flower2,
  CloudRain,
  Shovel,
  CalendarDays,
  Lightbulb,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { agronomicTips } from './mock-data'
import type { FC } from 'react'

const iconMap: Record<string, FC<{ className?: string }>> = {
  sprout: Sprout,
  sun: Sun,
  wheat: Wheat,
  flower2: Flower2,
  'cloud-rain': CloudRain,
  shovel: Shovel,
}

const seasonColors = [
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
  'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800',
  'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 border-teal-200 dark:border-teal-800',
  'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800',
]

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
}

export function AgronomicAdvice() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col gap-6"
    >
      {/* Seasonal planting calendar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <CalendarDays className="h-5 w-5 text-primary" />
            Tetiandro Fambolena
          </CardTitle>
          <CardDescription>
            Torolàlana momba ny fambolena sy fijinjana ara-potoana
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {agronomicTips.map((tip, i) => {
              const Icon = iconMap[tip.icon] ?? Sprout
              return (
                <motion.div key={tip.season} variants={item}>
                  <div className="rounded-xl border p-4 h-full hover:shadow-sm transition-shadow">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <Badge variant="outline" className={seasonColors[i % seasonColors.length]}>
                          {tip.season}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm font-semibold mb-1">{tip.crop}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {tip.advice}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </CardContent>
      </Card>

      {/* Quick tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            Conseils Rapides
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                title: 'Irrigation optimale',
                text: "Arrosez tôt le matin ou en fin d'après-midi pour réduire l'évaporation de 30%.",
              },
              {
                title: 'Rotation des cultures',
                text: 'Alternez les légumineuses et les céréales pour enrichir naturellement le sol en azote.',
              },
              {
                title: 'Compost maison',
                text: 'Utilisez les résidus de récolte et le fumier pour créer un compost riche.',
              },
              {
                title: 'Lutte biologique',
                text: 'Plantez du neem et du basilic autour de vos cultures pour repousser les ravageurs.',
              },
            ].map((tip, i) => (
              <motion.div
                key={tip.title}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.3 }}
                className="rounded-lg border p-4 hover:shadow-sm transition-shadow"
              >
                <p className="font-semibold text-sm mb-1">{tip.title}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{tip.text}</p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Disease Gallery */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <span className="text-2xl">🦠</span>
            Galerie des Maladies & Ravageurs
          </CardTitle>
          <CardDescription>
            Identifier et traiter les problèmes courants à Madagascar
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { emoji: '🍂', name: 'Pyriculariose', crop: 'Riz', desc: 'Maladie fongique — taches brunes sur les feuilles et les panicules. Traitement au Mancozeb ou Tricyclazole.', prevention: 'Rotation des cultures, variétés résistantes' },
              { emoji: '⚫', name: 'Charbon du maïs', crop: 'Maïs', desc: 'Tumeurs noires sur les épis et les tiges. Causé par le champignon Ustilago maydis.', prevention: 'Nettoyage du sol, élimination des résidus' },
              { emoji: '🐛', name: 'Chenille légionnaire', crop: 'Maïs', desc: 'Chenille vorace qui dévore les cultures entières en quelques jours (Fall Armyworm).', prevention: 'Surveillance précoce, pesticide biologique (Bt)' },
              { emoji: '🌫️', name: 'Mildiou', crop: 'Pomme de terre', desc: 'Oïdium — dépôt blanc poudreux sur les feuilles. Traitement au soufre.', prevention: 'Réduire l\'arrosage, espacement des plants' },
            ].map((d, i) => (
              <motion.div
                key={d.name}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.3 }}
                className="rounded-xl border p-4 hover:shadow-sm transition-shadow flex gap-4"
              >
                <div className="text-4xl">{d.emoji}</div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm text-rose-700 dark:text-rose-400">{d.name}</p>
                    <Badge variant="secondary" className="text-[10px]">{d.crop}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2 leading-relaxed">{d.desc}</p>
                  <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">🛡️ {d.prevention}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}