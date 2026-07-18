'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TETIANDRO_DB } from './legacy-data'

export function KajyFanondrahana() {
  const [selectedCrop, setSelectedCrop] = useState<string>(Object.keys(TETIANDRO_DB)[0])
  const [kajyArea, setKajyArea] = useState<number>(1000) // Default 1000 m2

  const cropData = TETIANDRO_DB[selectedCrop as keyof typeof TETIANDRO_DB] as any

  // Simple rough calculations based on area
  const seedKg = (kajyArea / 10000) * 20 // 20kg per ha average
  const ureaKg = (kajyArea / 10000) * 50
  const waterL = kajyArea * 5 // 5L per m2

  return (
    <div className="animate-in fade-in duration-300 flex flex-col gap-6 font-sans">
      <div className="bg-gradient-to-br from-blue-600 to-cyan-600 p-6 rounded-3xl text-white shadow-xl flex justify-between items-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 text-9xl">💧</div>
        <div className="relative z-10">
          <div className="inline-block px-3 py-1 bg-blue-500/50 rounded-full text-xs font-black tracking-widest mb-2">
            KAJY
          </div>
          <h3 className="text-2xl font-black mb-1">Fanondrahana & Fambolena</h3>
          <p className="text-blue-100 font-medium text-sm">Kajio ny habetsaky ny masomboly, zezika ary rano ilaina amin'ny velaran-taninao.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 flex flex-col gap-4 shadow-sm border-blue-100 dark:border-blue-900">
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
              🌱 Safidio ny voly
            </label>
            <Select value={selectedCrop} onValueChange={setSelectedCrop}>
              <SelectTrigger className="h-14 font-bold bg-slate-50 dark:bg-slate-900 border-none">
                <SelectValue placeholder="Safidio ny voly" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {Object.keys(TETIANDRO_DB).map((key) => {
                  const data = TETIANDRO_DB[key as keyof typeof TETIANDRO_DB] as any
                  return (
                    <SelectItem key={key} value={key} className="font-medium">
                      <span className="flex items-center gap-2">
                        <span>{data.emoji}</span> {data.name}
                      </span>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
        </Card>

        <Card className="p-6 flex flex-col gap-4 shadow-sm border-blue-100 dark:border-blue-900">
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
              📏 Velaran-tany (m²)
            </label>
            <div className="flex gap-4">
              <input 
                type="number" 
                value={kajyArea} 
                onChange={e => setKajyArea(Number(e.target.value) || 0)}
                className="w-full h-14 px-4 text-xl font-black rounded-xl border-none bg-slate-50 dark:bg-slate-900 outline-none text-primary"
              />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="p-6 flex flex-col items-center text-center gap-4 bg-orange-50 dark:bg-orange-950/20 border-orange-100 dark:border-orange-900">
          <div className="w-14 h-14 rounded-2xl bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 flex items-center justify-center text-2xl shadow-sm">🌱</div>
          <div>
            <div className="text-3xl font-black text-orange-700 dark:text-orange-300">{seedKg.toFixed(1)} <span className="text-sm text-orange-600/70 font-bold">kg</span></div>
            <div className="text-xs font-bold text-orange-600/70 uppercase tracking-widest mt-1">Masomboly ilaina</div>
          </div>
        </Card>
        
        <Card className="p-6 flex flex-col items-center text-center gap-4 bg-purple-50 dark:bg-purple-950/20 border-purple-100 dark:border-purple-900">
          <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 flex items-center justify-center text-2xl shadow-sm">✨</div>
          <div>
            <div className="text-3xl font-black text-purple-700 dark:text-purple-300">{ureaKg.toFixed(1)} <span className="text-sm text-purple-600/70 font-bold">kg</span></div>
            <div className="text-xs font-bold text-purple-600/70 uppercase tracking-widest mt-1">Zezika Urea</div>
          </div>
        </Card>
        
        <Card className="p-6 flex flex-col items-center text-center gap-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900 shadow-md">
          <div className="w-16 h-16 rounded-2xl bg-blue-500 text-white flex items-center justify-center text-3xl shadow-lg shadow-blue-500/40">💧</div>
          <div>
            <div className="text-4xl font-black text-blue-700 dark:text-blue-300">{waterL.toLocaleString()} <span className="text-base text-blue-600/70 font-bold">L</span></div>
            <div className="text-xs font-bold text-blue-600 uppercase tracking-widest mt-2">Rano isan-kerinandro</div>
          </div>
        </Card>
      </div>

    </div>
  )
}
