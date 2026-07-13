'use client'

import { AnimatePresence, motion } from 'framer-motion'
import {
  LayoutDashboard,
  ScanLine,
  MessageCircle,
  Store,
  Lightbulb,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/agrisense/header'
import { Footer } from '@/components/agrisense/footer'
import { DashboardTab } from '@/components/agrisense/dashboard-tab'
import { AiDiagnosis } from '@/components/agrisense/ai-diagnosis'
import { AiAssistant } from '@/components/agrisense/ai-assistant'
import { MarketPrices } from '@/components/agrisense/market-prices'
import { AgronomicAdvice } from '@/components/agrisense/agronomic-advice'

const tabs = [
  { value: 'dashboard', label: 'Tableau de Bord', icon: LayoutDashboard },
  { value: 'diagnosis', label: 'Diagnostic IA', icon: ScanLine },
  { value: 'assistant', label: 'Assistant IA', icon: MessageCircle },
  { value: 'market', label: 'Marché', icon: Store },
  { value: 'advice', label: 'Conseils', icon: Lightbulb },
] as const

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-agri">
      <Header />

      <main className="flex-1 w-full mx-auto max-w-7xl px-4 sm:px-6 py-6">
        <Tabs defaultValue="dashboard" className="flex flex-col gap-6">
          {/* Tab bar - scrollable on mobile */}
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <TabsList className="w-full sm:w-auto">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="gap-1.5 text-xs sm:text-sm flex-1 sm:flex-initial px-3 sm:px-4"
                >
                  <tab.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline sm:inline">
                    {tab.label}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Tab content */}
          <AnimatePresence mode="wait">
            <TabsContent value="dashboard">
              <DashboardTab />
            </TabsContent>
            <TabsContent value="diagnosis">
              <AiDiagnosis />
            </TabsContent>
            <TabsContent value="assistant">
              <AiAssistant />
            </TabsContent>
            <TabsContent value="market">
              <MarketPrices />
            </TabsContent>
            <TabsContent value="advice">
              <AgronomicAdvice />
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </main>

      <Footer />
    </div>
  )
}