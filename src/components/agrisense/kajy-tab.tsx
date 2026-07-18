'use client'

import { useState } from 'react'
import { Calculator, Store } from 'lucide-react'
import { TombonyAnalyzer } from './tombony-analyzer'
import { MarketPrices } from './market-prices'
import { KajyFanondrahana } from './kajy-fanondrahana'
import { Droplets } from 'lucide-react'

export function KajyTab() {
  const [subTab, setSubTab] = useState<'analyzer' | 'fanondrahana' | 'market'>('analyzer')

  return (
    <div className="flex flex-col gap-6 animate-in fade-in-50 duration-500">
      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row bg-secondary/50 p-1 rounded-xl w-full max-w-2xl mx-auto gap-1">
        <button
          onClick={() => setSubTab('analyzer')}
          className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all ${
            subTab === 'analyzer' 
              ? 'bg-background shadow-sm text-primary' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            <Calculator className="h-4 w-4 hidden sm:block"/> Tombony Analyzer
          </span>
        </button>
        <button
          onClick={() => setSubTab('fanondrahana')}
          className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all ${
            subTab === 'fanondrahana' 
              ? 'bg-background shadow-sm text-primary' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            <Droplets className="h-4 w-4 hidden sm:block"/> Fanondrahana
          </span>
        </button>
        <button
          onClick={() => setSubTab('market')}
          className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all ${
            subTab === 'market' 
              ? 'bg-background shadow-sm text-primary' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            <Store className="h-4 w-4 hidden sm:block"/> Vidimbokatra
          </span>
        </button>
      </div>

      {/* Main Content Area */}
      <div>
        {subTab === 'analyzer' && <TombonyAnalyzer />}
        {subTab === 'fanondrahana' && <KajyFanondrahana />}
        {subTab === 'market' && <MarketPrices />}
      </div>
    </div>
  )
}
