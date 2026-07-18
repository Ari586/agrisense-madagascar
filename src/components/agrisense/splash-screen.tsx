'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CloudRain, Sprout, Cpu, ChevronRight, Check } from 'lucide-react'

interface SplashScreenProps {
  onFinish?: () => void
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const [step, setStep] = useState(0)

  // Tutorial Steps
  const steps = [
    {
      id: 'welcome',
      title: 'Tongasoa',
      subtitle: 'Fambolena eto Madagasikara',
      description: 'Manatsara ny fambolena malagasy amin\'ny alalan\'ny teknolojia. Araho ny toetrandro, ny voly, ary mahazoa torohevitra isan\'andro.',
      icon: null,
    },
    {
      id: 'weather',
      title: 'Toetrandro & Tany',
      subtitle: 'Fantaro mialoha ny andro',
      description: 'Jereo ny toetrandro, ny rotsakorana ary ny hamandoan\'ny tany amin\'ny faritra 23 eto Madagasikara alohan\'ny hambolena.',
      icon: <CloudRain className="w-12 h-12 text-sky-400" />,
    },
    {
      id: 'crops',
      title: 'Ny Sahako',
      subtitle: 'Tari-dalana ho an\'ny voly',
      description: 'Mianara momba ny voly mihoatra ny 20, ny fomba fambolena azy, ary ny fikarakarana azy mba hahazoana vokatra tsara.',
      icon: <Sprout className="w-12 h-12 text-emerald-400" />,
    },
    {
      id: 'ai',
      title: 'Fitaovana IoT & IA',
      subtitle: 'Hafatra sy fanampiana',
      description: 'Miresaha amin\'ny Mpanampy IA raha misy fanontaniana, ary mahazoa fampitandremana avy hatrany raha misy loza manambana ny volinao.',
      icon: <Cpu className="w-12 h-12 text-purple-400" />,
    }
  ]

  const currentStep = steps[step]

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-zinc-950 overflow-hidden"
    >
      {/* Background Image: Champ de maïs */}
      <div 
        className="absolute inset-0 z-0 opacity-40 bg-cover bg-center bg-no-repeat transition-opacity duration-1000"
        style={{ backgroundImage: "url('/assets/katsaka-gasy.jpg')" }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-zinc-950/80 via-zinc-950/60 to-zinc-950" />
      
      {/* Animated Background Orbs */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.3, 0.15] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-green-500/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none"
      />
      <motion.div 
        animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-emerald-600/20 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/3 pointer-events-none"
      />
      
      {/* 3D Farmer Image (Floats smoothly) */}
      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="relative z-10 w-48 h-48 sm:w-56 sm:h-56 mt-12 mb-8 drop-shadow-[0_20px_30px_rgba(16,185,129,0.3)]"
      >
        <img 
          src="/assets/farmer_3d.png" 
          alt="3D Farmer Mascot" 
          className="w-full h-full object-contain"
        />
      </motion.div>

      <div className="relative z-10 flex flex-col items-center justify-between w-full max-w-md px-6 flex-1 pb-12">
        
        {/* Dynamic Content Area */}
        <div className="w-full relative h-[250px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex flex-col items-center text-center pt-4"
            >
              {currentStep.icon && (
                <div className="mb-6 p-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl">
                  {currentStep.icon}
                </div>
              )}
              {!currentStep.icon && (
                <svg viewBox="0 0 300 100" className="w-full max-w-[280px] mx-auto overflow-visible drop-shadow-sm mb-2">
                  <path id="rainbow-curve" d="M 20 90 A 130 130 0 0 1 280 90" fill="transparent" />
                  <text fill="white" className="text-[2.5rem] font-black uppercase tracking-widest">
                    <textPath href="#rainbow-curve" startOffset="50%" textAnchor="middle">
                      {currentStep.title}
                    </textPath>
                  </text>
                </svg>
              )}
              
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">
                {currentStep.icon ? currentStep.title : currentStep.subtitle}
              </h2>
              <p className="text-sm sm:text-base text-zinc-400 font-medium leading-relaxed max-w-[300px]">
                {currentStep.description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation & Dots */}
        <div className="w-full flex flex-col items-center gap-8 mt-auto">
          {/* Pagination Dots */}
          <div className="flex gap-2">
            {steps.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-emerald-400' : 'w-2 bg-zinc-600'}`}
              />
            ))}
          </div>

          {/* Action Button */}
          <button
            onClick={() => {
              if (step < steps.length - 1) {
                setStep(step + 1)
              } else {
                onFinish && onFinish()
              }
            }}
            className="group relative flex items-center justify-center w-full max-w-[280px] h-14 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 rounded-full text-white font-bold tracking-wide uppercase shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all active:scale-95"
          >
            <span className="relative z-10 flex items-center gap-2">
              {step < steps.length - 1 ? (
                <>Manaraka <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
              ) : (
                <>Hanomboka <Check className="w-5 h-5" /></>
              )}
            </span>
          </button>
        </div>

      </div>

      {/* Floating Logos */}
      <motion.div 
        initial={{ opacity: 0, y: -20, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.3, type: 'spring' }}
        className="absolute top-6 left-6 w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-white p-1.5 shadow-xl z-20 flex items-center justify-center overflow-hidden"
      >
        <img src="/assets/DRPMA.png" alt="DRPMA Logo" className="w-full h-full object-contain rounded-full" />
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: -20, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.4, type: 'spring' }}
        className="absolute top-6 right-6 w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-white p-1.5 shadow-xl z-20 flex items-center justify-center overflow-hidden"
      >
        <img src="/assets/MiASA.png" alt="MiASA Logo" className="w-full h-full object-contain rounded-full" />
      </motion.div>

    </motion.div>
  )
}
