'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sprout,
  Calculator,
  CalendarDays,
  MoreHorizontal,
  Home as HomeIcon,
  CloudSun
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/agrisense/header'
import { SahakoTab } from '@/components/agrisense/sahako-tab'
import { HomeTab } from '@/components/agrisense/home-tab'
import { AiAssistant } from '@/components/agrisense/ai-assistant'
import { SmsNotifications } from '@/components/agrisense/sms-notifications'
import { KajyTab } from '@/components/agrisense/kajy-tab'
import { TetiandroTab } from '@/components/agrisense/tetiandro-tab'
import { SplashScreen } from '@/components/agrisense/splash-screen'
import { DeveloperInfo } from '@/components/agrisense/developer-info'
import { WeatherBackground } from '@/components/agrisense/toetrandro-tab'
import { useBgStore } from '@/lib/bg-store'

const tabs = [
  { value: 'home', label: 'Fandraisana', icon: HomeIcon },
  { value: 'sahako', label: 'Sahako', icon: Sprout },
  { value: 'tetiandro', label: 'Tetiandro', icon: CalendarDays },
  { value: 'kajy', label: 'Kajy', icon: Calculator },
  { value: 'hafa', label: 'Hafa', icon: MoreHorizontal },
] as const

export default function Home() {
  const [showSplash, setShowSplash] = useState(true)
  const [activeTab, setActiveTab] = useState<string>("home")
  const [hasNotifications, setHasNotifications] = useState(false)

  useEffect(() => {
    // Check for active crops in Sahako to show notifications
    const checkNotifications = () => {
      try {
        const saved = localStorage.getItem('agrisense_myfields')
        if (saved) {
          const fields = JSON.parse(saved)
          // Notifications if there are any fields
          setHasNotifications(fields.length > 0)
        } else {
          setHasNotifications(false)
        }
      } catch (e) {
        setHasNotifications(false)
      }
    }
    
    checkNotifications()
    const interval = setInterval(checkNotifications, 3000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Hide splash screen after 2.5 seconds
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 2500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const handleTabChange = (e: Event) => {
      const customEvent = e as CustomEvent<string>
      setActiveTab(customEvent.detail)
    }
    window.addEventListener('changeTab', handleTabChange)
    return () => window.removeEventListener('changeTab', handleTabChange)
  }, [])

  const bgUrl = useBgStore(state => state.bgUrl)
  const weatherType = useBgStore(state => state.weatherType)

  return (
    <div className="min-h-screen flex flex-col bg-transparent transition-colors duration-1000 relative">
      {bgUrl && weatherType && (
        <div className="fixed inset-0 z-[-10] overflow-hidden pointer-events-none">
          <WeatherBackground bgUrl={bgUrl} weatherType={weatherType} />
        </div>
      )}
      
      <AnimatePresence>
        {showSplash && <SplashScreen />}
      </AnimatePresence>

      {!showSplash && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex-1 flex flex-col"
        >
          <Header />

          <main className="flex-1 w-full mx-auto px-2 sm:px-4 py-2 relative z-10">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col gap-4">
              {/* Premium Tab bar - scrollable on mobile */}
              <div className="overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0 pb-4 pt-2 w-full flex justify-center custom-scrollbar">
                <TabsList className="flex gap-2 min-w-max bg-black/40 backdrop-blur-xl border border-white/10 p-2 rounded-2xl sm:rounded-full shadow-2xl h-auto">
                  {tabs.map((tab) => {
                    const isActive = activeTab === tab.value;
                    return (
                      <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        className={`relative flex items-center justify-center gap-2 px-5 py-3 h-auto flex-col sm:flex-row transition-all duration-300 rounded-xl sm:rounded-full min-w-[80px] bg-transparent outline-none
                          ${isActive ? 'text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}
                        `}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="activeTabBackground"
                            className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-400 rounded-xl sm:rounded-full shadow-[0_0_20px_rgba(16,185,129,0.3)] z-0"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                        <span className="relative z-10 flex flex-col sm:flex-row items-center gap-2">
                          <tab.icon className={`h-5 w-5 sm:h-4 sm:w-4 ${isActive ? 'drop-shadow-md' : ''}`} />
                          <span className="font-bold tracking-wide text-[10px] sm:text-sm uppercase sm:capitalize">
                            {tab.label}
                          </span>
                          {/* Notification Badge */}
                          {(tab.value === 'sahako' || tab.value === 'tetiandro') && hasNotifications && (
                            <span className="absolute top-1 right-1 sm:-top-1 sm:-right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-900 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                          )}
                        </span>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </div>

              {/* Tab content with AnimatePresence */}
              <div className="relative flex-1">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full"
                  >
                    {activeTab === 'home' && <HomeTab />}
                    {activeTab === 'sahako' && <SahakoTab />}
                    {activeTab === 'tetiandro' && <TetiandroTab />}
                    {activeTab === 'kajy' && <KajyTab />}
                    {activeTab === 'hafa' && (
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                        <div className="lg:col-span-2">
                          <AiAssistant />
                        </div>
                        <div className="lg:col-span-1 max-w-md w-full mx-auto lg:max-w-none">
                          <SmsNotifications />
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </Tabs>
          </main>

        </motion.div>
      )}
      <DeveloperInfo />
    </div>
  )
}