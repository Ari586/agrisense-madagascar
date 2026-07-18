'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CROPS_DATA, CROP_CATEGORIES, getCropImagePath } from '@/components/agrisense/legacy-data'
import { Leaf, BookOpen, Trash2, Plus, ArrowLeft, Droplets, ThermometerSun, AlertCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { EbookViewer } from './ebook-viewer'
import { MadagascarMap } from './madagascar-map'
import { REGION_RECOMMENDATIONS } from './madagascar-map-data'
import { Map as MapIcon } from 'lucide-react'

export function SahakoTab() {
  const [subTab, setSubTab] = useState<'champs' | 'guide'>('guide')
  const [isAddingField, setIsAddingField] = useState(false)
  const [selectedCropKey, setSelectedCropKey] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('Rehetra')
  const [myFields, setMyFields] = useState<any[]>([])
  
  // Map feature states
  const [guideViewMode, setGuideViewMode] = useState<'crop' | 'region'>('region')
  const [selectedMapRegion, setSelectedMapRegion] = useState<string | null>(null)
  
  const [newName, setNewName] = useState('')
  const [newCrop, setNewCrop] = useState('vary')
  const [newArea, setNewArea] = useState('')
  const [newDate, setNewDate] = useState('')

  useEffect(() => {
    const handleOpenCrop = (e: Event) => {
      const customEvent = e as CustomEvent<string>
      setSelectedCropKey(customEvent.detail)
    }
    window.addEventListener('openCrop', handleOpenCrop)
    return () => window.removeEventListener('openCrop', handleOpenCrop)
  }, [])

  const handleAddField = () => {
    if (!newName || !newArea || !newDate) return
    setMyFields([...myFields, {
      name: newName,
      cropKey: newCrop,
      area: newArea,
      date: newDate
    }])
    setIsAddingField(false)
    setNewName('')
    setNewArea('')
    setNewDate('')
  }

  const handleDeleteField = (idx: number) => {
    setMyFields(myFields.filter((_, i) => i !== idx))
  }

  const renderMyFieldsList = () => {
    if (isAddingField) {
      return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-3 mb-6">
            <button 
              onClick={() => setIsAddingField(false)}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-black text-primary">Saha vaovao</h2>
          </div>

          <div className="p-6 flex flex-col gap-5 rounded-xl bg-black/40 backdrop-blur-xl shadow-xl border border-white/10 text-white">
            <div>
              <label className="text-xs font-bold text-white/70 mb-1.5 block">Anaran'ny saha</label>
              <input 
                type="text" 
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Ohatra: Tanimbary an-dohasaha" 
                className="w-full p-3 rounded-xl border border-white/20 bg-white/10 text-white text-sm outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition-all placeholder:text-white/40" 
              />
            </div>
            
            <div>
              <label className="text-xs font-bold text-white/70 mb-1.5 block">Karazana voly</label>
              <select 
                value={newCrop}
                onChange={e => setNewCrop(e.target.value)}
                className="w-full p-3 rounded-xl border border-white/20 bg-white/10 text-white text-sm outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition-all"
              >
                {Object.keys(CROPS_DATA).map(k => (
                  <option key={k} value={k} className="bg-neutral-900 text-white">{CROPS_DATA[k].emoji} {CROPS_DATA[k].name}</option>
                ))}
              </select>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-xs font-bold text-white/70 mb-1.5 block">Velarana (m²)</label>
                <input 
                  type="number" 
                  value={newArea}
                  onChange={e => setNewArea(e.target.value)}
                  placeholder="2000" 
                  className="w-full p-3 rounded-xl border border-white/20 bg-white/10 text-white text-sm outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition-all placeholder:text-white/40" 
                />
              </div>
              <div className="flex-1">
                <label className="text-xs font-bold text-white/70 mb-1.5 block">Daty nambolena</label>
                <input 
                  type="date" 
                  value={newDate}
                  onChange={e => setNewDate(e.target.value)}
                  className="w-full p-3 rounded-xl border border-white/20 bg-white/10 text-white text-sm outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition-all [color-scheme:dark]" 
                />
              </div>
            </div>
            
            <button 
              onClick={handleAddField}
              className="mt-2 w-full py-3.5 rounded-xl bg-green-600 text-white font-bold shadow-sm hover:bg-green-700 transition-all active:scale-[0.98]"
            >
              Hamafiso
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="animate-in fade-in duration-300">
        <div className="mb-6">
          <h2 className="text-2xl font-black text-white flex items-center gap-2 mb-1">
            <Leaf className="h-6 w-6 text-green-400" /> Ny Sahako
          </h2>
          <p className="text-sm text-white/70">Tantano ireo voly rehetra ao amin'ny sahanao</p>
        </div>

        {myFields.length === 0 ? (
          <Card className="p-10 flex flex-col items-center justify-center text-center gap-4 bg-white/5 border-white/20 border-dashed text-white">
            <div className="text-5xl opacity-50">🚜</div>
            <div>
              <h3 className="font-bold text-lg">Mbola tsy misy saha</h3>
              <p className="text-sm text-white/70 mt-1 max-w-[250px]">
                Ampidiro ny sahanao voalohany mba hanarahana ny fivoaran'ny volinao.
              </p>
            </div>
            <button 
              onClick={() => setIsAddingField(true)}
              className="mt-2 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-500/20 text-green-300 font-bold hover:bg-green-500/30 transition-colors"
            >
              <Plus className="h-4 w-4" /> Hampiditra saha
            </button>
          </Card>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myFields.map((f, i) => {
                const crop = CROPS_DATA[f.cropKey]
                const sownDate = new Date(f.date)
                const today = new Date()
                const daysSinceSown = Math.floor((today.getTime() - sownDate.getTime()) / (1000*60*60*24))
                const match = crop.duration.match(/(\d+)-(\d+)/) || [0, 90, 120]
                const maxDays = parseInt(match[2])
                const progress = Math.min(100, Math.max(0, (daysSinceSown / maxDays) * 100))
                
                let status = 'Ao anaty fitomboana'
                let colorClass = 'bg-blue-500'
                let textColorClass = 'text-blue-500'
                
                if (daysSinceSown < 0) { 
                  status = 'Hovoleana'
                  colorClass = 'bg-purple-500'
                  textColorClass = 'text-purple-500'
                } else if (progress >= 100) { 
                  status = 'Vonona ho jinjaina'
                  colorClass = 'bg-emerald-500'
                  textColorClass = 'text-emerald-500'
                }

                return (
                  <Card key={i} className="p-4 flex flex-col gap-4 relative overflow-hidden group">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl bg-secondary/50 h-12 w-12 rounded-xl flex items-center justify-center">
                          {crop.emoji}
                        </div>
                        <div>
                          <h4 className="font-bold text-base leading-none mb-1.5">{f.name}</h4>
                          <p className="text-xs font-semibold text-muted-foreground">{crop.name} · {f.area} m²</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeleteField(i)}
                        className="p-2 bg-red-500/10 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold mb-2">
                        <span className={textColorClass}>{status}</span>
                        <span className="text-muted-foreground">
                          {daysSinceSown > 0 ? `${daysSinceSown} andro` : ''}
                        </span>
                      </div>
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className={`h-full rounded-full ${colorClass}`}
                        />
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
            <button 
              onClick={() => setIsAddingField(true)}
              className="mt-2 w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border-2 border-dashed border-primary/20 text-primary font-bold hover:bg-primary/5 transition-colors"
            >
              <Plus className="h-5 w-5" /> Hampiditra saha
            </button>
          </div>
        )}
      </div>
    )
  }

  const renderGuides = () => {
    if (selectedCropKey) {
      return <EbookViewer cropKey={selectedCropKey} onClose={() => setSelectedCropKey(null)} />
    }

    if (guideViewMode === 'region') {
      const regionCrops = selectedMapRegion ? REGION_RECOMMENDATIONS[selectedMapRegion] || [] : []
      return (
        <div className="animate-in fade-in duration-300 h-full flex flex-col">
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-black text-white flex items-center gap-2 mb-1">
                <MapIcon className="h-6 w-6 text-green-400" /> Sarintanin'i Madagasikara
              </h2>
              <p className="text-sm text-white/70">Safidio ny faritra hahitana ny voly mety aminy</p>
            </div>
            <button 
              onClick={() => setGuideViewMode('crop')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-bold transition-colors shadow-sm"
            >
              Hikaroka isaky ny voly
            </button>
          </div>
          
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[500px]">
             {/* Map on the left */}
             <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden relative shadow-lg">
               <MadagascarMap 
                 selectedRegion={selectedMapRegion} 
                 onRegionSelect={setSelectedMapRegion} 
               />
             </div>
             
             {/* Recommendations on the right */}
             <div className="bg-white/5 rounded-2xl border border-white/10 p-6 overflow-y-auto shadow-lg">
               {selectedMapRegion ? (
                 <>
                   <h3 className="text-xl font-bold text-white mb-4">Voly tsara atao ao {selectedMapRegion}</h3>
                   {regionCrops.length > 0 ? (
                     <div className="grid grid-cols-2 gap-3">
                       {regionCrops.map(key => {
                         const crop = CROPS_DATA[key]
                         if (!crop) return null
                         return (
                         <button
                           key={key}
                           onClick={() => setSelectedCropKey(key)}
                           className="flex flex-col items-center gap-2 p-4 rounded-xl bg-black/20 border border-white/10 hover:bg-white/10 transition-all text-white active:scale-95 group"
                         >
                           <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                             {crop.emoji}
                           </div>
                           <div className="text-center">
                             <div className="font-bold text-sm">{crop.name}</div>
                             <div className="text-[10px] uppercase tracking-wider text-green-400 font-bold mt-1">Torolàlana</div>
                           </div>
                         </button>
                       )})}
                     </div>
                   ) : (
                     <div className="text-center py-10 text-white/50">Tsy misy angon-drakitra ho an'ity faritra ity.</div>
                   )}
                 </>
               ) : (
                 <div className="h-full flex flex-col items-center justify-center text-center text-white/50 space-y-4">
                   <MapIcon className="h-16 w-16 opacity-20" />
                   <p>Mikitika faritra iray eo amin'ny sarintany<br/>hahitana ny voly tsara atao any.</p>
                 </div>
               )}
             </div>
          </div>
        </div>
      )
    }

    const displayedCrops = CROP_CATEGORIES[selectedCategory as keyof typeof CROP_CATEGORIES] || Object.keys(CROPS_DATA)

    return (
      <div className="animate-in fade-in duration-300">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2 mb-1">
              <BookOpen className="h-6 w-6 text-green-400" /> Torolàlana Voly
            </h2>
            <p className="text-sm text-white/70">Fantaro ny fomba fambolena ny vokatra rehetra</p>
          </div>
          <button 
            onClick={() => setGuideViewMode('region')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-bold transition-colors shadow-sm"
          >
            Hikaroka isaky ny faritra (Sarintany)
          </button>
        </div>

        {/* Categories Filter */}
        <div className="flex overflow-x-auto gap-2 pb-4 mb-2 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar">
          {Object.keys(CROP_CATEGORIES).map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-all ${
                selectedCategory === cat 
                  ? 'bg-green-600 text-white shadow-sm' 
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {displayedCrops.map(key => (
            <button
              key={key}
              onClick={() => setSelectedCropKey(key)}
              className="group relative overflow-hidden flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all active:scale-[0.98] shadow-sm hover:shadow-md text-white"
            >
              {/* Background gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative h-16 w-16 mb-1 rounded-full overflow-hidden shadow-sm border border-white/20 group-hover:scale-110 transition-transform duration-300 bg-white/10 flex items-center justify-center">
                <img 
                  src={getCropImagePath(key)} 
                  alt={key}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    // Fallback to emoji if image fails to load
                    (e.target as HTMLElement).style.display = 'none';
                    (e.target as HTMLElement).nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <span className="hidden text-3xl drop-shadow-sm">{CROPS_DATA[key].emoji}</span>
              </div>
              <span className="font-bold text-sm text-center z-10 text-white">{key}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left side: Ny Sahako (Calendar/Fields) - takes 4/12 columns on desktop */}
      <div className="lg:col-span-4 w-full h-full">
        <div className="lg:sticky lg:top-24">
          <div className="p-4 rounded-xl bg-black/40 backdrop-blur-xl border border-white/20 shadow-xl text-white mb-4 lg:mb-0">
            {renderMyFieldsList()}
          </div>
        </div>
      </div>

      {/* Right side: Torolàlana Voly (Guidelines) - takes 8/12 columns on desktop */}
      <div className="lg:col-span-8 w-full p-4 sm:p-6 rounded-xl bg-black/40 backdrop-blur-xl shadow-xl text-white">
        {renderGuides()}
      </div>
    </div>
  )
}

function Badge({ label, icon }: { label: string, icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background border border-border/50 text-[10px] font-bold text-muted-foreground w-fit">
      {icon} {label}
    </div>
  )
}

function StatCard({ label, value }: { label: string, value: string }) {
  return (
    <div className="p-3 bg-secondary/30 rounded-xl border border-border/50">
      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{label}</div>
      <div className="text-xs font-semibold leading-tight">{value}</div>
    </div>
  )
}
