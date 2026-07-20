'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Droplets, ThermometerSun, Leaf, BookOpen, Clock, AlertCircle, Bug } from 'lucide-react'
import { CROPS_DATA, getCropImagePath } from '@/components/agrisense/legacy-data'

interface EbookViewerProps {
  cropKey: string
  onClose: () => void
}

export function EbookViewer({ cropKey, onClose }: EbookViewerProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const [[page, direction], setPage] = useState([0, 0])
  const crop = CROPS_DATA[cropKey]

  if (!crop) return null

  // Process multiline texts beautifully
  const renderTextBlocks = (text: string) => {
    if (!text) return null
    return text.split('\n').map((line, i) => {
      if (line.startsWith('DINGANA') || line.includes('FATRA ILAINA') || line.includes('HALALINY') || line.includes('HAFANANA') || line.includes('TOROHEVITRA')) {
        return <h4 key={i} className="font-bold text-green-400 mt-4 mb-1 text-sm tracking-wide">{line}</h4>
      }
      if (line.trim() === '') return <div key={i} className="h-2" />
      return <p key={i} className="text-white/80 text-sm leading-relaxed mb-1">{line}</p>
    })
  }

  const pages = [
    // PAGE 0: COVER
    (
      <div className="flex flex-col h-full relative overflow-hidden rounded-xl" key="page-0">
        <div className="absolute top-4 right-4 z-50">
          <button onClick={onClose} className="p-2 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white transition-colors border border-white/10">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="flex-1 relative min-h-[300px]">
          <div className="absolute inset-0 bg-black/20">
            <img 
              src={getCropImagePath(cropKey)} 
              alt={crop.name} 
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col items-center text-center">
            <span className="text-7xl drop-shadow-xl mb-4">{crop.emoji}</span>
            <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 drop-shadow-sm">{crop.name}</h1>
            <div className="flex flex-wrap justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/20 text-green-300 font-medium text-sm border border-green-500/20 backdrop-blur-sm">
                <ThermometerSun className="h-4 w-4" /> {crop.season}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 font-medium text-sm border border-blue-500/20 backdrop-blur-sm">
                <Clock className="h-4 w-4" /> {crop.duration}
              </span>
            </div>
          </div>
        </div>
        <div className="p-4 text-center bg-white/5 border-t border-white/10">
          <p className="text-white/70 font-medium flex items-center justify-center gap-2">
            <BookOpen className="h-5 w-5 text-green-400" /> Fisy tekinika (Fiche technique)
          </p>
        </div>
      </div>
    ),
    // PAGE 1: CONDITIONS
    (
      <div className="flex flex-col h-full relative overflow-y-auto pb-16" key="page-1">
        <div className="absolute top-4 right-4 z-50">
          <button onClick={onClose} className="p-2 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white transition-colors border border-white/10">
            <X className="h-6 w-6" />
          </button>
        </div>
        <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-2 mt-4 sm:mt-0">
          <Leaf className="h-6 w-6 text-green-400" /> Toeram-pambolena
        </h2>
        <div className="grid gap-4">
          <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex gap-4 items-start">
            <ThermometerSun className="h-6 w-6 text-orange-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-orange-300 mb-1">Toetrandro</h3>
              <p className="text-sm text-white/80">{crop.climate}</p>
            </div>
          </div>
          
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex gap-4 items-start">
            <div className="h-6 w-6 shrink-0 mt-0.5 flex items-center justify-center text-amber-400">🪴</div>
            <div>
              <h3 className="font-bold text-amber-300 mb-1">Karazantany</h3>
              <p className="text-sm text-white/80">{crop.soil}</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex gap-4 items-start">
            <Droplets className="h-6 w-6 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-blue-300 mb-1">Rotsakorana / Rano</h3>
              <p className="text-sm text-white/80">{crop.waterNeeds}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-center items-center text-center">
              <span className="text-xs font-bold text-white/60 uppercase tracking-wider mb-1">Elanelam-boly</span>
              <span className="font-bold text-white">{crop.spacing}</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-center items-center text-center">
              <span className="text-xs font-bold text-white/60 uppercase tracking-wider mb-1">Taham-pamokarana</span>
              <span className="font-bold text-white">{crop.yield}</span>
            </div>
          </div>
        </div>
      </div>
    ),
    // PAGE 2: SEED & NURSERY
    (
      <div className="flex flex-col h-full relative overflow-y-auto pb-16" key="page-2">
        <div className="absolute top-4 right-4 z-50">
          <button onClick={onClose} className="p-2 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white transition-colors border border-white/10">
            <X className="h-6 w-6" />
          </button>
        </div>
        <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-2 mt-4 sm:mt-0">
          <span className="text-2xl">🌱</span> Famafazana
        </h2>
        <div className="max-w-none">
          {crop.nursery && crop.nursery !== "Famafazana MIVANTANA - tsy ilaina tanin-ketsa" && crop.nursery !== "Famafazana MIVANTANA - Tsy ilaina tanin-ketsa." && (
            <div className="mb-6 p-5 rounded-2xl bg-green-500/10 border border-green-500/20">
              <h3 className="font-bold text-green-400 mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" /> Fikarakarana ny taninketsa
              </h3>
              <p className="text-sm text-white/80">{crop.nursery}</p>
            </div>
          )}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-sm">
            {renderTextBlocks(crop.seed)}
          </div>
        </div>
      </div>
    ),
    // PAGE 3: GUIDE
    (
      <div className="flex flex-col h-full relative overflow-y-auto pb-16" key="page-3">
        <div className="absolute top-4 right-4 z-50">
          <button onClick={onClose} className="p-2 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white transition-colors border border-white/10">
            <X className="h-6 w-6" />
          </button>
        </div>
        <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-2 mt-4 sm:mt-0">
          <BookOpen className="h-6 w-6 text-blue-400" /> Fikarakarana ny voly
        </h2>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-sm">
          {renderTextBlocks(crop.plantingGuide)}
        </div>
        
        <div className="mt-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex gap-4 items-start">
          <Bug className="h-6 w-6 text-red-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-red-300 mb-1">Aretina sy Bibikely</h3>
            <p className="text-sm text-white/80 mb-2">Raha mahita bibikely na aretina amin'ny ravina ianao, dia ampiasao ny fakan-tsary hahafantarana ny fanafody sahaza.</p>
            <button 
              onClick={() => {
                onClose()
                window.dispatchEvent(new CustomEvent('changeTab', { detail: 'fandraisana' }))
                // Scroll to diagnosis could be added here
              }}
              className="text-xs font-bold text-red-300 hover:text-red-200 underline decoration-red-500/30 underline-offset-4"
            >
              Mampiasa ny fakan-tsary (Diagnostic IA) &rarr;
            </button>
          </div>
        </div>
      </div>
    ),
    (
      <div className="flex flex-col h-full relative overflow-y-auto pb-16" key="page-4">
        <div className="absolute top-4 right-4 z-50">
          <button onClick={onClose} className="p-2 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white transition-colors border border-white/10">
            <X className="h-6 w-6" />
          </button>
        </div>
        <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-2 mt-4 sm:mt-0">
          <Clock className="h-6 w-6 text-purple-400" /> Tsingerim-pitsiriana
        </h2>
        <div className="relative pl-6 space-y-6 before:absolute before:inset-0 before:ml-8 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/20 before:to-transparent">
          {crop.steps.map((step: any, index: number) => (
            <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white bg-black/40 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute -left-3 md:left-1/2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              </div>
              <div className="w-full md:w-[calc(50%-2rem)] bg-white/5 border border-white/10 p-4 rounded-xl shadow-sm">
                <div className="font-bold text-white mb-1">{step.week}</div>
                <div className="text-sm text-white/80">{step.action}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    // PAGE 5: TIPS
    (
      <div className="flex flex-col h-full relative overflow-y-auto pb-16" key="page-5">
        <div className="absolute top-4 right-4 z-50">
          <button onClick={onClose} className="p-2 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white transition-colors border border-white/10">
            <X className="h-6 w-6" />
          </button>
        </div>
        <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-2 mt-4 sm:mt-0">
          <span className="text-2xl">💡</span> Tombontsoa sy Torohevitra
        </h2>
        <div className="grid gap-3">
          {crop.tips.map((tip: string, idx: number) => (
            <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold shrink-0 mt-0.5">
                {idx + 1}
              </div>
              <p className="text-sm font-medium text-white/90">{tip}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center pb-8">
          <p className="text-white/70 mb-4">Mirary fahombiazana amin'ny fambolena!</p>
          <button 
            onClick={onClose}
            className="px-6 py-3 bg-green-600 text-white font-bold rounded-xl shadow-md hover:bg-green-700 transition-all active:scale-95"
          >
            Manakatona
          </button>
        </div>
      </div>
    )
  ]

  const totalPages = pages.length

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.95
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4, ease: [0.32, 0.72, 0, 1] }
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.4, ease: [0.32, 0.72, 0, 1] }
    })
  }

  // To track swipe direction
  const activePage = Math.abs(page % totalPages)

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection])
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full h-[600px] sm:h-[700px] flex flex-col relative z-10"
      >
        <div className="flex-1 w-full h-full bg-black/40 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl overflow-hidden relative flex flex-col text-white">
          {/* Main content container */}
          <div className="flex-1 relative overflow-hidden bg-transparent">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={page}
                custom={direction}
                variants={slideVariants as any}
                initial="enter"
                animate="center"
                exit="exit"
                className="absolute inset-0"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragEnd={(e, { offset, velocity }) => {
                  const swipe = swipePower(offset.x, velocity.x)
                  if (swipe < -swipeConfidenceThreshold && activePage < totalPages - 1) {
                    paginate(1)
                  } else if (swipe > swipeConfidenceThreshold && activePage > 0) {
                    paginate(-1)
                  }
                }}
              >
                {pages[activePage]}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Bar */}
          <div className="h-16 border-t border-white/10 bg-black/20 flex items-center justify-between px-4 sm:px-6 relative z-10">
            <button
              onClick={() => activePage > 0 && paginate(-1)}
              disabled={activePage === 0}
              className={`p-2 rounded-full transition-colors ${activePage === 0 ? 'text-white/20' : 'text-white hover:bg-white/10'}`}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            
            <div className="flex items-center gap-1.5">
              {pages.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`h-2 rounded-full transition-all duration-300 ${activePage === idx ? 'w-6 bg-white' : 'w-2 bg-white/20'}`}
                />
              ))}
            </div>

            <button
              onClick={() => activePage < totalPages - 1 ? paginate(1) : onClose()}
              className={`p-2 rounded-full transition-colors text-white hover:bg-white/10`}
            >
              {activePage < totalPages - 1 ? <ChevronRight className="h-6 w-6" /> : <X className="h-6 w-6" />}
            </button>
          </div>

          {/* Floating Close Button for non-cover pages on Desktop */}
          {activePage !== 0 && (
            <button 
              onClick={onClose} 
              className="absolute top-4 right-4 z-50 p-2 bg-background/50 hover:bg-background border shadow-sm backdrop-blur-md rounded-full text-foreground transition-all hidden sm:block"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

const swipeConfidenceThreshold = 10000
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity
}
