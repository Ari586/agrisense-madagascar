'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { TETIANDRO_DB, REGIONS, TOMBONY_DATABASE, CROPS_DATA } from './legacy-data'
import { MadagascarSvgMap } from './madagascar-svg-map'
import { CalendarDays, Calculator, Bug, MapPin, Sprout, ChevronLeft, ChevronRight, CheckCircle2, XCircle, BookOpen, AlertCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'

// Extracted from app.js
const DISEASE_DB = [
  { emoji: '🍂', name: 'Pyriculariose', crop: 'Riz', desc: 'Maladie fongique — taches brunes sur les feuilles et les panicules. Traitement au Mancozeb ou Tricyclazole.', prevention: 'Rotation des cultures, variétés résistantes' },
  { emoji: '⚫', name: 'Charbon du maïs', crop: 'Maïs', desc: 'Tumeurs noires sur les épis et les tiges. Causé par le champignon Ustilago maydis.', prevention: 'Nettoyage du sol, élimination des résidus' },
  { emoji: '🟡', name: 'Mosaïque jaune', crop: 'Tomate', desc: 'Maladie virale — jaunissement des feuilles, arrêt de croissance des fruits.', prevention: 'Lutter contre les insectes vecteurs (pucerons, aleurodes)' },
  { emoji: '🔴', name: 'Rouille rouge', crop: 'Haricot', desc: 'Champignon provoquant des pustules rouges sur les feuilles. Favorisé par l\'humidité excessive.', prevention: 'Bon drainage, traitement fongicide' },
  { emoji: '🌫️', name: 'Mildiou', crop: 'Pomme de terre', desc: 'Oïdium — dépôt blanc poudreux sur les feuilles. Traitement au soufre.', prevention: 'Réduire l\'arrosage, espacement des plants' },
  { emoji: '🐛', name: 'Chenille légionnaire', crop: 'Maïs', desc: 'Chenille vorace qui dévore les cultures entières en quelques jours (Fall Armyworm).', prevention: 'Surveillance précoce, pesticide biologique (Bt)' },
  { emoji: '💧', name: 'Pourriture racinaire', crop: 'Riz', desc: 'Excès d\'eau provoquant la pourriture des racines et le flétrissement des feuilles.', prevention: 'Bon drainage, ne pas sur-irriguer' },
  { emoji: '🟤', name: 'Épuisement du sol', crop: 'Toutes cultures', desc: 'Carence en pH, azote et potassium. Nécessite un amendement du sol.', prevention: 'Analyse du sol et apport d\'engrais organique' },
];

const MONTHS_MG = ['Jan', 'Fev', 'Mar', 'Apr', 'May', 'Jon', 'Jol', 'Aog', 'Sep', 'Okt', 'Nov', 'Des'];

export function TetiandroTab() {
  const [subTab, setSubTab] = useState<'tetiandro' | 'famafazana' | 'kajy' | 'aretina'>('tetiandro')
  
  // Tetiandro States
  const [selectedRegion, setSelectedRegion] = useState('analamanga')
  const [selectedCrop, setSelectedCrop] = useState(Object.keys(TETIANDRO_DB)[0])
  const [sowingDate, setSowingDate] = useState(new Date().toISOString().split('T')[0])
  const [calendarMonth, setCalendarMonth] = useState(new Date(sowingDate))
  
  // Kajy States
  const [kajyArea, setKajyArea] = useState(1000)

  // Aretina States
  const [selectedDisease, setSelectedDisease] = useState<number | null>(null)

  const handlePrevMonth = () => {
    const d = new Date(calendarMonth)
    d.setMonth(d.getMonth() - 1)
    setCalendarMonth(d)
  }

  const handleNextMonth = () => {
    const d = new Date(calendarMonth)
    d.setMonth(d.getMonth() + 1)
    setCalendarMonth(d)
  }

  const renderCalendar = () => {
    const cropData = TETIANDRO_DB[selectedCrop as keyof typeof TETIANDRO_DB] as any
    const regionData = REGIONS[selectedRegion as keyof typeof REGIONS] as any
    
    // Determine if planting month is optimal
    const sownD = new Date(sowingDate)
    const sownMonth = sownD.getMonth() + 1 // 1-12
    const windows = cropData.windows?.[regionData?.type] || cropData.windows?.default || [1,2,3,4,5,6,7,8,9,10,11,12]
    const isOptimal = windows.includes(sownMonth)

    // Generate Calendar Grid for the selected month
    const year = calendarMonth.getFullYear()
    const month = calendarMonth.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    const startingDayOfWeek = firstDay.getDay() // 0 = Sunday
    const totalDays = lastDay.getDate()
    
    const days: (number | null)[] = []
    // Pad empty days at start
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    // Add real days
    for (let i = 1; i <= totalDays; i++) {
      days.push(i)
    }

    // Tasks mapping
    const tasksMap = new Map()
    const tasks = cropData.tasks || (cropData.steps || []).map((step: any, i: number) => {
      let weekNum = 1;
      const match = step.week?.match(/\d+/);
      if (match) weekNum = parseInt(match[0], 10);
      return {
        d: (weekNum - 1) * 7,
        t: step.action,
        c: ['green', 'blue', 'orange', 'red'][i % 4]
      }
    });

    tasks.forEach((task: any) => {
      const taskDate = new Date(sownD)
      taskDate.setDate(taskDate.getDate() + task.d)
      if (taskDate.getFullYear() === year && taskDate.getMonth() === month) {
        tasksMap.set(taskDate.getDate(), task)
      }
    })

    return (
      <div className="animate-in fade-in duration-300 flex flex-col gap-4 mx-auto w-full">
        
        {/* Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-white/70 uppercase flex items-center gap-1.5">
              <Sprout className="h-3.5 w-3.5" /> Voly
            </label>
            <select 
              value={selectedCrop} 
              onChange={e => { setSelectedCrop(e.target.value); setKajyArea(1000); }}
              className="p-3 rounded-xl border border-white/20 bg-white/10 text-white text-sm font-semibold outline-none focus:border-green-500/50"
            >
              {Object.keys(TETIANDRO_DB).map(c => {
                const item = TETIANDRO_DB[c as keyof typeof TETIANDRO_DB] as any;
                if (!item || !item.name) return null;
                return (
                  <option key={c} value={c} className="bg-neutral-900 text-white">
                    {item.emoji} {item.name}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-white/70 uppercase flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" /> Daty Famafazana
            </label>
            <div className="flex gap-2 w-full">
              <select 
                value={sowingDate.split('-')[2]}
                onChange={e => {
                  const parts = sowingDate.split('-');
                  const newDate = `${parts[0]}-${parts[1]}-${e.target.value}`;
                  setSowingDate(newDate);
                  setCalendarMonth(new Date(newDate));
                }}
                className="p-3 rounded-xl border border-white/20 bg-white/10 text-white text-sm font-semibold outline-none focus:border-green-500/50"
              >
                {Array.from({length: 31}, (_, i) => String(i + 1).padStart(2, '0')).map(d => (
                  <option key={d} value={d} className="bg-neutral-900 text-white">{d}</option>
                ))}
              </select>
              
              <select 
                value={sowingDate.split('-')[1]}
                onChange={e => {
                  const parts = sowingDate.split('-');
                  const newDate = `${parts[0]}-${e.target.value}-${parts[2]}`;
                  setSowingDate(newDate);
                  setCalendarMonth(new Date(newDate));
                }}
                className="p-3 rounded-xl border border-white/20 bg-white/10 text-white text-sm font-semibold outline-none focus:border-green-500/50 flex-1"
              >
                {MONTHS_MG.map((m, i) => {
                  const val = String(i + 1).padStart(2, '0');
                  return <option key={val} value={val} className="bg-neutral-900 text-white">{m}</option>
                })}
              </select>
              
              <select 
                value={sowingDate.split('-')[0]}
                onChange={e => {
                  const parts = sowingDate.split('-');
                  const newDate = `${e.target.value}-${parts[1]}-${parts[2]}`;
                  setSowingDate(newDate);
                  setCalendarMonth(new Date(newDate));
                }}
                className="p-3 rounded-xl border border-white/20 bg-white/10 text-white text-sm font-semibold outline-none focus:border-green-500/50"
              >
                {[2024, 2025, 2026, 2027].map(y => (
                  <option key={y} value={y} className="bg-neutral-900 text-white">{y}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4">
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-2">
            <label className="text-xs font-bold text-white/70 uppercase flex items-center gap-1.5 ml-1">
              <MapPin className="h-3.5 w-3.5" /> Fidio eto ny Faritra misy anao
            </label>
            <MadagascarSvgMap selectedRegion={selectedRegion} onSelectRegion={setSelectedRegion} />
          </div>

          <div className="lg:col-span-7 xl:col-span-8">
            <div className="p-4 rounded-xl bg-black/40 backdrop-blur-xl shadow-xl text-white h-full flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <button onClick={handlePrevMonth} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <ChevronLeft className="h-5 w-5 text-white" />
                </button>
                <h3 className="font-black text-lg uppercase tracking-wide text-white">
                  {MONTHS_MG[month]} {year}
                </h3>
                <button onClick={handleNextMonth} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <ChevronRight className="h-5 w-5 text-white" />
                </button>
              </div>

          {!isOptimal && windows.length > 0 && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/30 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-red-100 font-bold text-sm mb-1">Tsy dia tsara loatra raha fafazana amin'io daty io!</h4>
                <p className="text-red-200/80 text-xs font-medium">
                  Ny volana tena tsara fambolena azy amin'ity faritra ity dia: {windows.map((m: number) => MONTHS_MG[m - 1]).join(', ')}
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-center gap-6 mb-6">
            <div className="flex items-center gap-2 text-xs font-bold">
              <div className="w-4 h-4 rounded bg-emerald-100 border border-emerald-300 flex items-center justify-center">
                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
              </div>
              <span>Fotoana tsara</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold">
              <div className="w-4 h-4 rounded bg-rose-100 border border-rose-300 flex items-center justify-center">
                <XCircle className="h-3 w-3 text-rose-600" />
              </div>
              <span>Tsy fotoana</span>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 px-1">
            {['Alah', 'Alat', 'Tal', 'Ala', 'Kam', 'Zom', 'Sab'].map(d => (
              <span key={d} className="text-[10px] sm:text-xs font-bold text-white/70 uppercase tracking-wider text-center">{d}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {days.map((day, i) => {
              if (day === null) return <div key={`empty-${i}`} className="h-12 sm:h-16 lg:h-20" />
              
              const isToday = new Date().toDateString() === new Date(year, month, day).toDateString()
              const isSowingDay = sownD.toDateString() === new Date(year, month, day).toDateString()
              const task = tasksMap.get(day)
              
              let bg = isOptimal ? 'bg-green-500/20 border-green-500/30' : 'bg-red-500/20 border-red-500/30'
              let text = 'text-white/90'

              if (isSowingDay) {
                bg = 'bg-blue-600 border-blue-500 shadow-md'
                text = 'text-white font-black'
              }

              return (
                <button 
                  key={i} 
                  onClick={() => {
                    // Format as YYYY-MM-DD in local time instead of UTC to avoid timezone shifts
                    const localDate = new Date(year, month, day)
                    const yyyy = localDate.getFullYear()
                    const mm = String(localDate.getMonth() + 1).padStart(2, '0')
                    const dd = String(localDate.getDate()).padStart(2, '0')
                    setSowingDate(`${yyyy}-${mm}-${dd}`)
                  }}
                  className={`h-12 sm:h-16 lg:h-20 rounded-xl flex flex-col items-center justify-center relative transition-all hover:-translate-y-0.5 hover:opacity-80 active:scale-95 border cursor-pointer ${bg} ${text}`}
                >
                  <span className={`text-sm sm:text-base ${isSowingDay ? 'font-black' : 'font-semibold'}`}>
                    {day}
                  </span>
                  {task && !isSowingDay && (
                    <div className="absolute bottom-1.5 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-500 shadow-sm" title={task.t} />
                  )}
                  {isToday && !isSowingDay && (
                    <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-orange-500" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Tasks List for the month */}
          {tasksMap.size > 0 && (
            <div className="mt-6 pt-6 border-t border-white/10 flex flex-col gap-3">
              <h4 className="font-bold text-sm text-white/70 uppercase tracking-wider mb-1">Zavatra tokony hatao amin'ity volana ity</h4>
              {Array.from(tasksMap.entries()).map(([day, task]: [number, any]) => (
                <div key={day} className="flex gap-4 items-center p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <div className="bg-blue-600 text-white font-black text-xs px-2.5 py-1 rounded-lg">
                    {day} {MONTHS_MG[month]}
                  </div>
                  <div className="text-sm font-bold text-blue-100">{task.t}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        </div>
      </div>

        {/* Tech Guidelines */}
        {cropData && (cropData.tech || cropData.soil) && (
          <div className="overflow-hidden rounded-xl bg-black/40 backdrop-blur-xl shadow-xl text-white">
            <div className="bg-amber-500/20 border-b border-amber-500/20 p-4 text-amber-300 font-black flex items-center gap-2">
              <BookOpen className="h-5 w-5" /> Torolàlana Teknika - {cropData.name}
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h5 className="font-bold text-amber-400 text-xs uppercase tracking-wider mb-2">🌱 Tany sy Toetrandro</h5>
                <p className="text-sm leading-relaxed text-white/80">{cropData.tech?.tany || `${cropData.soil}\n${cropData.climate}`}</p>
              </div>
              <div>
                <h5 className="font-bold text-amber-400 text-xs uppercase tracking-wider mb-2">✨ Zezika</h5>
                <p className="text-sm leading-relaxed text-white/80">{cropData.tech?.zezika || 'Zezika organika sy komposta'}</p>
              </div>
              <div>
                <h5 className="font-bold text-amber-400 text-xs uppercase tracking-wider mb-2">📏 Fambolena</h5>
                <p className="text-sm leading-relaxed text-white/80">{cropData.tech?.fomba_fambolena || `Elanelana: ${cropData.spacing}`}</p>
              </div>
              <div>
                <h5 className="font-bold text-amber-400 text-xs uppercase tracking-wider mb-2">🌾 Fiavana</h5>
                <p className="text-sm leading-relaxed text-white/80">{cropData.tech?.fomba_fiavana || cropData.waterNeeds}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }


  const renderFamafazana = () => {
    const calendarData = [
      { name: '🌾 Vary', data: ['✓', '~', '—', '—', '—', '—', '—', '—', '—', '~', '✓', '✓'] },
      { name: '🌽 Katsaka', data: ['~', '—', '—', '—', '—', '—', '—', '—', '~', '✓', '✓', '✓'] },
      { name: '🍅 Voatabia', data: ['—', '—', '—', '—', '—', '—', '~', '✓', '✓', '✓', '~', '—'] },
      { name: '🥔 Ovy', data: ['—', '—', '—', '—', '—', '~', '✓', '✓', '✓', '✓', '~', '—'] },
      { name: '🌿 Voanemba', data: ['✓', '~', '—', '—', '—', '—', '—', '—', '—', '~', '✓', '✓'] },
      { name: '🌿 Voanjob.', data: ['~', '—', '—', '—', '—', '—', '—', '—', '~', '✓', '✓', '✓'] },
      { name: '🥬 Anana', data: ['—', '—', '—', '~', '✓', '✓', '✓', '✓', '✓', '~', '—', '—'] },
      { name: '🧅 Tongolo', data: ['—', '—', '—', '—', '~', '✓', '✓', '✓', '✓', '~', '—', '—'] },
      { name: '🍠 Vomanga', data: ['~', '—', '—', '—', '—', '—', '—', '—', '~', '✓', '✓', '✓'] },
      { name: '🥔 Mangaha.', data: ['~', '—', '—', '—', '—', '—', '—', '—', '~', '✓', '✓', '✓'] },
      { name: '🌿 Bele', data: ['~', '—', '—', '—', '—', '—', '—', '—', '~', '✓', '✓', '✓'] },
      { name: '🌾 Orge', data: ['—', '—', '—', '~', '✓', '✓', '✓', '✓', '~', '—', '—', '—'] },
      { name: '🌾 Avoine', data: ['—', '—', '—', '~', '✓', '✓', '✓', '✓', '~', '—', '—', '—'] },
      { name: '🌾 Apemba', data: ['~', '—', '—', '—', '—', '—', '—', '—', '~', '✓', '✓', '✓'] },
    ]

    return (
      <Card className="p-4 sm:p-6 animate-in fade-in duration-300">
        <h3 className="text-lg font-black text-primary mb-4 flex items-center gap-2">
          <Sprout className="h-5 w-5" /> Tetiandro Famafazana
        </h3>
        
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2 text-xs font-bold">
            <div className="w-5 h-5 rounded bg-emerald-500 flex items-center justify-center text-white">✓</div>
            <span>Tsara indrindra</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold">
            <div className="w-5 h-5 rounded bg-amber-400 flex items-center justify-center text-white">~</div>
            <span>Mety</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold">
            <div className="w-5 h-5 rounded bg-rose-200 flex items-center justify-center text-rose-500">—</div>
            <span>Tsy mety</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-secondary/50">
                <th className="p-2 text-left font-black border border-border/50">Voly</th>
                {MONTHS_MG.map(m => (
                  <th key={m} className="p-2 text-center font-bold border border-border/50 min-w-[36px]">{m}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {calendarData.map((row, i) => (
                <tr key={i} className="hover:bg-muted/50 transition-colors">
                  <td className="p-2 font-bold border border-border/50 whitespace-nowrap">{row.name}</td>
                  {row.data.map((cell, j) => {
                    let cellClass = ''
                    if (cell === '✓') cellClass = 'bg-emerald-500 text-white'
                    else if (cell === '~') cellClass = 'bg-amber-400 text-white'
                    else cellClass = 'bg-rose-50 text-rose-300 dark:bg-rose-950/20'
                    
                    return (
                      <td key={j} className="border border-border/50 p-1">
                        <div className={`w-full h-8 flex items-center justify-center rounded font-black ${cellClass}`}>
                          {cell}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    )
  }


  const renderAretina = () => {
    if (selectedDisease !== null) {
      const d = DISEASE_DB[selectedDisease]
      return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300 flex flex-col gap-4">
          <button 
            onClick={() => setSelectedDisease(null)}
            className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors w-fit mb-2"
          >
            <ChevronLeft className="h-4 w-4" /> Hiverina
          </button>
          
          <div className="bg-gradient-to-br from-red-100 to-rose-200 dark:from-red-950 dark:to-rose-900/50 p-8 rounded-2xl text-center border border-red-200 dark:border-red-900 shadow-inner">
            <div className="text-7xl mb-4 drop-shadow-md">{d.emoji}</div>
            <h3 className="text-2xl font-black text-red-900 dark:text-red-100 mb-2">{d.name}</h3>
            <span className="bg-red-500/20 text-red-800 dark:text-red-200 px-3 py-1 rounded-full text-xs font-bold">{d.crop}</span>
          </div>

          <Card className="p-6">
            <h4 className="text-sm font-bold mb-2 flex items-center gap-2"><Bug className="h-4 w-4" /> Famaritana (Description)</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{d.desc}</p>
          </Card>

          <Card className="p-6 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50">
            <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-400 mb-2 flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Fiarovana (Prévention)</h4>
            <p className="text-sm text-emerald-700 dark:text-emerald-500/90 leading-relaxed">{d.prevention}</p>
          </Card>
        </div>
      )
    }

    return (
      <div className="animate-in fade-in duration-300">
        <div className="bg-gradient-to-br from-rose-100 to-red-50 dark:from-rose-950/50 dark:to-red-900/20 p-6 rounded-2xl mb-6 border border-rose-200 dark:border-rose-900/50 flex items-center gap-4">
          <div className="bg-white dark:bg-black/20 w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm">🦠</div>
          <div>
            <h3 className="font-black text-rose-900 dark:text-rose-100 text-lg">Galeria Aretina</h3>
            <p className="text-rose-700 dark:text-rose-300 text-sm font-medium">Tsindrio ny aretina hahitana ny torolalana</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {DISEASE_DB.map((d, i) => (
            <button
              key={i}
              onClick={() => setSelectedDisease(i)}
              className="flex flex-col items-center p-5 bg-card rounded-2xl border hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all active:scale-[0.98]"
            >
              <span className="text-4xl mb-3 drop-shadow-sm">{d.emoji}</span>
              <span className="font-black text-sm text-center leading-tight mb-1">{d.name}</span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase">{d.crop}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Top Navigation */}
      <div className="flex bg-secondary/50 p-1 rounded-xl w-full">
        <button
          onClick={() => setSubTab('tetiandro')}
          className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all ${
            subTab === 'tetiandro' 
              ? 'bg-background shadow-sm text-primary' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <span className="flex items-center justify-center gap-2"><CalendarDays className="h-4 w-4 hidden sm:block"/> Tetiandro</span>
        </button>
        <button
          onClick={() => setSubTab('famafazana')}
          className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all ${
            subTab === 'famafazana' 
              ? 'bg-background shadow-sm text-primary' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <span className="flex items-center justify-center gap-2"><Sprout className="h-4 w-4 hidden sm:block"/> Famafazana</span>
        </button>
        <button
          onClick={() => setSubTab('aretina')}
          className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all ${
            subTab === 'aretina' 
              ? 'bg-background shadow-sm text-primary' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <span className="flex items-center justify-center gap-2"><Bug className="h-4 w-4 hidden sm:block"/> Aretina</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="min-h-[500px]">
        {subTab === 'tetiandro' && renderCalendar()}
        {subTab === 'famafazana' && renderFamafazana()}
        {subTab === 'aretina' && renderAretina()}
      </div>
    </div>
  )
}
