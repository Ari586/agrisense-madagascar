'use client'

import { useState, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { TOMBONY_ANALYZER_DB } from './legacy-data'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Sprout, Calculator, AlertCircle, Sparkles, HandCoins, ActivitySquare, Target, Settings2, BarChart3, TrendingUp, Info, Download } from 'lucide-react'

// Strategy types
const STRATEGIES = [
  { id: 'std', label: '👤 Iray ihany (Standard)', isMix: false },
  { id: 'mix3', label: '🌱 Milpa (Mix 3)', isMix: true },
  { id: 'mix_legumes', label: '🍅 Voatabia + Tongolo', isMix: true },
  { id: 'mix_katsaka', label: '🌽 Katsaka + Voanjo', isMix: true },
  { id: 'mix_rot', label: '🌾 Vary + Tsaramaso', isMix: true },
  { id: 'random', label: '🎲 Mix Aléatoire', isMix: true }
]

export function TombonyAnalyzer() {
  const [budgetStr, setBudgetStr] = useState('1000000')
  const [strategy, setStrategy] = useState('std')
  const [selectedKey, setSelectedKey] = useState(Object.keys(TOMBONY_ANALYZER_DB.fambolena)[0])
  const [laborFactor, setLaborFactor] = useState(1.0)
  const [matType, setMatType] = useState('angady')
  const [isCalculated, setIsCalculated] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const resultRef = useRef<HTMLDivElement>(null)
  
  // Triggers random logic if selected
  const [randomKeys, setRandomKeys] = useState<string[]>([])

  const fKeys = Object.keys(TOMBONY_ANALYZER_DB.fambolena)

  const handleStrategyChange = (val: string) => {
    setStrategy(val)
    setIsCalculated(false)
    if (val === 'random') {
      const k1 = fKeys[Math.floor(Math.random() * fKeys.length)]
      let k2 = fKeys[Math.floor(Math.random() * fKeys.length)]
      if (k1 === k2 && fKeys.length > 1) {
        k2 = fKeys[(fKeys.indexOf(k1) + 1) % fKeys.length]
      }
      setRandomKeys([k1, k2])
    }
  }

  // Cost calculation function translated from Dart
  const getCost = (item: any, laborFact: number, mat: string) => {
    const hardCost = item.cost * (item.ratio[0] + item.ratio[1])
    const laborCost = (item.cost * item.ratio[2]) * laborFact
    const baseVarCost = item.cost * (1 - (item.ratio[0] + item.ratio[1] + item.ratio[2]))
    
    let varAdjust = 0
    let revBonus = 1.0

    if (mat === 'angadinomby') { varAdjust = item.cost * 0.15; revBonus = 1.10 }
    else if (mat === 'kubota') { varAdjust = item.cost * 0.30; revBonus = 1.25 }

    const bk = {
      c1: item.cost * item.ratio[0],
      c2: item.cost * item.ratio[1],
      c3: laborCost,
      c4: baseVarCost + varAdjust
    }

    return {
      total: hardCost + laborCost + baseVarCost + varAdjust,
      bonus: revBonus,
      bk
    }
  }

  const results = useMemo(() => {
    const budget = parseFloat(budgetStr) || 0
    if (budget <= 0) return null

    let totalInvest = 0
    let totalProfit = 0
    let mixTitle = ''
    let tipText = ''
    let qtyText = ''
    const bars: any[] = []

    if (strategy === 'std') {
      const item = TOMBONY_ANALYZER_DB.fambolena[selectedKey]
      if (!item) return null

      const res = getCost(item, laborFactor, matType)
      const qty = Math.floor(budget / res.total)
      totalInvest = qty * res.total
      totalProfit = (qty * item.rev * res.bonus) - totalInvest
      qtyText = `${qty} ${item.cat === 'Champignons' ? 'Harona' : 'm²'}`
      tipText = item.tip

      const isChamp = item.cat === 'Champignons'
      bars.push({ label: 'Masomboly', value: qty * res.bk.c1, color: 'bg-blue-500', icon: isChamp ? '🍄' : '🌱' })
      bars.push({ label: 'Zezika & Fanafody', value: qty * res.bk.c2, color: 'bg-emerald-500', icon: '🧪' })
      bars.push({ label: 'Mpiasa', value: qty * res.bk.c3, color: 'bg-purple-500', icon: '👷‍♂️' })
      bars.push({ label: 'Fitaovana', value: Math.max(0, qty * res.bk.c4), color: 'bg-orange-500', icon: '⚙️' })

    } else {
      // Mix Logic
      let list: any[] = []
      if (strategy === 'mix3') {
        mixTitle = '🌱 Milpa (Katsaka+Tsaramaso+Voatavo)'
        list = [
          { k: 'Katsaka (Maïs)', b: budget / 3 },
          { k: 'Tsaramaso (Haricot)', b: budget / 3 },
          { k: 'Voatavo (Citrouille)', b: budget / 3 }
        ]
      } else if (strategy === 'mix_legumes') {
        mixTitle = '🍅 Voatabia + Tongolo (Fiarovana)'
        list = [
          { k: 'Voatabia (Standard)', b: budget * 0.7 },
          { k: 'Tongolo (Oignon)', b: budget * 0.3 }
        ]
      } else if (strategy === 'mix_katsaka') {
        mixTitle = '🌽 Katsaka + Voanjo'
        list = [
          { k: 'Katsaka (Maïs)', b: budget * 0.6 },
          { k: 'Voanjo (Arachide)', b: budget * 0.4 }
        ]
      } else if (strategy === 'mix_rot') {
        mixTitle = '🌾 Vary + Tsaramaso (Rotation)'
        list = [
          { k: 'Vary Antanety (Pluvial)', b: budget * 0.5 },
          { k: 'Tsaramaso (Haricot)', b: budget * 0.5 }
        ]
      } else if (strategy === 'random' && randomKeys.length === 2) {
        mixTitle = `🎲 Mix Aléatoire: ${randomKeys[0]} + ${randomKeys[1]}`
        list = [
          { k: randomKeys[0], b: budget * 0.5 },
          { k: randomKeys[1], b: budget * 0.5 }
        ]
      }

      const colors = ['bg-emerald-500', 'bg-orange-500', 'bg-blue-500']
      
      list.forEach((obj, idx) => {
        const item = TOMBONY_ANALYZER_DB.fambolena[obj.k]
        if (!item) return
        const res = getCost(item, laborFactor, 'angady') // Mix always uses angady standard
        const qty = Math.floor(obj.b / res.total)
        const invest = qty * res.total
        const profit = (qty * item.rev * res.bonus) - invest

        totalInvest += invest
        totalProfit += profit

        bars.push({
          label: obj.k,
          value: profit,
          color: colors[idx % colors.length],
          icon: '🌱',
          qty: `${qty} m²`
        })
      })

      qtyText = 'MIX'
      tipText = `💡 Mix: ${mixTitle}`
    }

    const roi = totalInvest > 0 ? (totalProfit / totalInvest) * 100 : 0

    return { totalInvest, totalProfit, roi, qtyText, mixTitle, tipText, bars }
  }, [budgetStr, strategy, selectedKey, laborFactor, matType, randomKeys])

  const formatMoney = (val: number) => {
    return val.toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' Ar'
  }

  return (
    <div className="w-full flex flex-col gap-6 font-sans">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Calculator className="w-32 h-32" />
        </div>
        <div className="relative z-10">
          <div className="inline-block px-3 py-1 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full text-xs font-black tracking-widest mb-4 shadow-lg shadow-orange-500/30">
            TOMBONY ANALYZER V2
          </div>
          <h2 className="text-3xl font-black mb-2">Simulateur de Rentabilité</h2>
          <p className="text-slate-300 text-sm max-w-md">
            Ampiasaivo ny volanao amin'ny fomba matotra. Kajio eto ny tombony, ny fandaniana ary ny vokatry ny safidinao (Mix na Mandeha irery).
          </p>
        </div>
      </div>

      {/* Inputs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Form */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border shadow-sm flex flex-col gap-5">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
                <HandCoins className="w-4 h-4" /> Vola ampiasaina (Budget)
              </label>
              <div className="relative">
                <Input 
                  type="number" 
                  value={budgetStr}
                  onChange={e => { setBudgetStr(e.target.value); setIsCalculated(false); }}
                  className="text-2xl font-black h-14 pl-4 pr-12 text-primary"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">Ar</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <Target className="w-4 h-4" /> Paikady (Stratégie)
              </label>
              <div className="flex flex-wrap gap-2">
                {STRATEGIES.map(s => (
                  <button
                    key={s.id}
                    onClick={() => handleStrategyChange(s.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      strategy === s.id 
                        ? 'bg-primary text-primary-foreground shadow-md scale-105' 
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {strategy === 'std' && (
              <AnimatePresence>
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="pt-2 border-t mt-2 overflow-hidden"
                >
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Sprout className="w-4 h-4" /> Safidio ny voly
                  </label>
                  <Select value={selectedKey} onValueChange={(v) => { setSelectedKey(v); setIsCalculated(false); }}>
                    <SelectTrigger className="h-12 font-bold bg-slate-50 dark:bg-slate-800 border-none">
                      <SelectValue placeholder="Safidio..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {fKeys.map(k => (
                        <SelectItem key={k} value={k} className="font-medium">
                          {k}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* Settings (Only for std) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {strategy === 'std' ? (
            <div className="bg-slate-100 dark:bg-slate-800/50 rounded-2xl p-6 border shadow-inner flex flex-col gap-5 h-full">
              <h3 className="font-black flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Settings2 className="w-5 h-5" /> Fanitsiana (Settings)
              </h3>
              
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">👷 Mpiasa (Main d'œuvre)</label>
                <Select value={laborFactor.toString()} onValueChange={v => { setLaborFactor(parseFloat(v)); setIsCalculated(false); }}>
                  <SelectTrigger className="bg-white dark:bg-slate-900 border-none shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Karama (100% Karamaina)</SelectItem>
                    <SelectItem value="0.5">Fanampiana (50%)</SelectItem>
                    <SelectItem value="0">Asa Tena (0% - Izaho irery)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">🚜 Fitaovana (Matériel)</label>
                <Select value={matType} onValueChange={v => { setMatType(v); setIsCalculated(false); }}>
                  <SelectTrigger className="bg-white dark:bg-slate-900 border-none shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="angady">Angady (Manuel)</SelectItem>
                    <SelectItem value="angadinomby">Angadinomby (Traction animale)</SelectItem>
                    <SelectItem value="kubota">Kubota (Motorisé)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex gap-3 items-start text-xs font-medium p-3.5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-900/30 border border-blue-200/50 dark:border-blue-800/50 shadow-inner relative overflow-hidden group transition-all hover:shadow-md">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-blue-400/20 dark:bg-blue-500/20 rounded-full blur-2xl -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-700 ease-out" />
                  <Info className="w-5 h-5 shrink-0 text-blue-600 dark:text-blue-400 relative z-10" />
                  <p className="relative z-10 leading-relaxed text-blue-900/80 dark:text-blue-100/90">
                    Ny fitaovana maoderina dia mampiakatra ny voka-bary nefa mandany solika na hofan'omby.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-900/20 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-900/50 h-full flex flex-col justify-center items-center text-center">
              <ActivitySquare className="w-12 h-12 text-indigo-400 mb-3" />
              <h3 className="font-black text-indigo-900 dark:text-indigo-200 mb-2">Paikady "MIX"</h3>
              <p className="text-sm text-indigo-700/80 dark:text-indigo-300/80 font-medium">
                Ny paikady Mix dia mampiasa ny fitaovana "Angady" mandeha ho azy ary mizara roa na telo ny vola ampiasaina mba hampihenana ny risika.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Action Button */}
      <button 
        onClick={() => setIsCalculated(true)}
        className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl font-black text-lg shadow-lg shadow-emerald-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
      >
        <BarChart3 className="w-5 h-5" /> Kajio ny Tombony (Calculer)
      </button>

      {/* Results Section */}
      {isCalculated && results && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
          ref={resultRef}
        >
          <div className="flex justify-between items-start mb-6 relative z-10">
            <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-400" /> Vokatra (Résultats)
            </h3>
            <button
              onClick={async () => {
                if (!resultRef.current || isExporting) return
                setIsExporting(true)
                try {
                  const canvas = await html2canvas(resultRef.current, { scale: 2, backgroundColor: '#0f172a' })
                  const imgData = canvas.toDataURL('image/png')
                  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
                  const imgProps = pdf.getImageProperties(imgData)
                  const pdfWidth = pdf.internal.pageSize.getWidth()
                  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
                  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
                  pdf.save('Kajy_Tombony_Fambolena.pdf')
                } catch (err) {
                  console.error('PDF Export Error', err)
                } finally {
                  setIsExporting(false)
                }
              }}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
            >
              {isExporting ? <ActivitySquare className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {isExporting ? 'Eo andalam-panatanterahana...' : 'Alao PDF'}
            </button>
          </div>
          
          <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
            <TrendingUp className="w-64 h-64" />
          </div>

          <div className="relative z-10 flex flex-col gap-8">
            {/* Top Result Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-slate-700">
                <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Vola naloa (Investissement)</div>
                <div className="text-2xl sm:text-3xl font-black text-slate-100">{formatMoney(results.totalInvest)}</div>
                <div className="text-slate-500 text-sm font-medium mt-2 flex items-center gap-1.5">
                  Velarana: <span className="text-slate-300">{results.qtyText}</span>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/10 backdrop-blur-md rounded-2xl p-6 border border-emerald-500/30">
                <div className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-1">Tombony Madio (Profit)</div>
                <div className="text-3xl sm:text-4xl font-black text-emerald-400">{formatMoney(results.totalProfit)}</div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-slate-700 flex flex-col justify-center items-center text-center">
                <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">ROI (Zana-bola)</div>
                <div className="flex items-end gap-1 justify-center">
                  <span className="text-4xl sm:text-5xl font-black text-amber-400">{results.roi.toFixed(0)}</span>
                  <span className="text-xl font-bold text-amber-500 mb-1">%</span>
                </div>
              </div>
            </div>

            {/* Tip Banner */}
            <div className="bg-indigo-500/20 border border-indigo-500/30 rounded-xl p-4 flex gap-3 items-start">
              <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <p className="text-indigo-200 text-sm font-medium leading-relaxed">{results.tipText}</p>
            </div>

            {/* Breakdowns */}
            <div>
              <h4 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">
                {strategy === 'std' ? "Fitsinjaram-bola (Répartition des coûts)" : "Tombony isaky ny voly (Profit par culture)"}
              </h4>
              <div className="flex flex-col gap-4">
                {results.bars.map((bar, i) => {
                  const maxVal = Math.max(...results.bars.map(b => b.value))
                  const width = maxVal > 0 ? (bar.value / maxVal) * 100 : 0
                  
                  return (
                    <div key={i} className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-sm font-bold">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{bar.icon}</span> 
                          <span className="text-slate-200">{bar.label}</span>
                          {bar.qty && <span className="text-slate-500 text-xs ml-2">({bar.qty})</span>}
                        </div>
                        <span className="text-slate-300">{formatMoney(bar.value)}</span>
                      </div>
                      <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${width}%` }}
                          transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                          className={`h-full ${bar.color}`}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

          </div>
        </motion.div>
      )}

    </div>
  )
}
