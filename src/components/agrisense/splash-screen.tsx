'use client'

import { motion } from 'framer-motion'
import { Sprout } from 'lucide-react'

export function SplashScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-zinc-950 overflow-hidden"
    >
      {/* Background Image: Champ de maïs */}
      <div 
        className="absolute inset-0 z-0 opacity-80 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/assets/katsaka-gasy.jpg')" }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-zinc-950/50 via-zinc-950/20 to-zinc-950/90" />
      
      {/* Animated Background Orbs */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.3, 0.15],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-green-500/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3"
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.5, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-emerald-600/20 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/3"
      />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
        className="relative z-10 flex flex-col items-center gap-10 w-full max-w-sm px-6"
      >
        <div className="text-center space-y-2 relative pt-8">
          {/* Rainbow Shaped Text */}
          <svg viewBox="0 0 300 100" className="w-full max-w-[280px] mx-auto overflow-visible drop-shadow-sm -mb-6">
            <path id="rainbow-curve" d="M 20 90 A 130 130 0 0 1 280 90" fill="transparent" />
            <text fill="white" className="text-[2.5rem] font-black uppercase tracking-widest">
              <textPath href="#rainbow-curve" startOffset="50%" textAnchor="middle">
                Tongasoa
              </textPath>
            </text>
          </svg>
          
          <motion.div 
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.4 }}
            className="w-20 h-20 mx-auto bg-gradient-to-br from-green-400 to-emerald-600 rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(52,211,153,0.3)] mb-4 relative z-10 text-4xl pb-2"
          >
            👨‍🌾
          </motion.div>

          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-[0.25em] pt-4">
            Fambolena eto Madagasikara
          </p>
        </div>


        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="w-full flex flex-col items-center gap-4 mt-2"
        >
          <div className="h-1.5 w-56 bg-white/5 rounded-full overflow-hidden shadow-inner relative">
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: '0%' }}
              transition={{ duration: 2.5, ease: "circOut" }}
              className="absolute top-0 bottom-0 left-0 right-0 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
            />
          </div>
          <span className="text-[10px] font-bold text-zinc-500 animate-pulse uppercase tracking-[0.2em]">
            Manomana ny angona...
          </span>
        </motion.div>
      </motion.div>

      {/* Separated Floating Logos */}
      <motion.div 
        initial={{ opacity: 0, x: -50, scale: 0.8 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.6, type: 'spring', damping: 15 }}
        className="absolute bottom-8 sm:bottom-auto sm:top-1/2 left-4 sm:left-16 sm:-translate-y-1/2 w-32 h-32 sm:w-48 sm:h-48 rounded-full bg-white flex items-center justify-center p-3 sm:p-5 shadow-2xl z-20 overflow-hidden"
      >
        <img src="/assets/DRPMA.png" alt="DRPMA Logo" className="w-full h-full object-contain rounded-full" />
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, x: 50, scale: 0.8 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.6, type: 'spring', damping: 15 }}
        className="absolute bottom-8 sm:bottom-auto sm:top-1/2 right-4 sm:right-16 sm:-translate-y-1/2 w-32 h-32 sm:w-48 sm:h-48 rounded-full bg-white flex items-center justify-center p-3 sm:p-5 shadow-2xl z-20 overflow-hidden"
      >
        <img src="/assets/MiASA.png" alt="MiASA Logo" className="w-full h-full object-contain rounded-full" />
      </motion.div>

    </motion.div>
  )
}
