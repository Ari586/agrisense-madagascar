'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus, Info, Search, RefreshCw } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { apiUrl } from '@/lib/api'

interface MarketItem {
  id: string
  name: string
  malagasyName: string
  price: number
  unit: string
  trend: 'up' | 'down' | 'stable'
  changePercent: number
  region: string
  category: 'Rente' | 'Base' | 'Legume'
}



export function TsenaTab() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<string>('All')
  const [marketData, setMarketData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isActive = true

    void fetch(apiUrl('/api/market/prices'))
      .then((res) => res.json())
      .then((json) => {
        if (isActive && json.success) {
          setMarketData(json.data)
        }
      })
      .catch((error) => {
        console.error(error)
      })
      .finally(() => {
        if (isActive) {
          setLoading(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [])
  
  const filteredData = marketData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || (item.cropId && item.cropId.toLowerCase().includes(search.toLowerCase()))
    const matchesFilter = filter === 'All' || item.category === filter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full pb-20">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          Tsena <span className="text-sm font-normal text-white/50 bg-white/10 px-2 py-1 rounded-full">Vidiny isan'andro</span>
        </h2>
        <p className="text-white/70">Diniho ny vidim-bokatra manerana an'i Madagasikara</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
          <Input 
            placeholder="Tadiavo ny vokatra (oh: Lavany)..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-primary"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          {['All', 'Base', 'Rente', 'Legume'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === cat ? 'bg-primary text-primary-foreground' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
              {cat === 'All' ? 'Rehetra' : cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-white/60">Mitady ny vidiny farany...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredData.map((item, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={item.id}
            >
              <Card className="bg-black/40 backdrop-blur-xl border-white/10 overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">{item.name}</h3>
                      <p className="text-sm text-white/60">{item.category}</p>
                    </div>
                    <Badge variant="outline" className="bg-white/5 border-white/10 text-white/80">
                      Madagascar
                    </Badge>
                  </div>

                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-3xl font-black tracking-tight text-white">
                      {item.price.toLocaleString('fr-MG')}
                    </span>
                    <span className="text-white/60 font-medium">Ar/kg</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
                      item.trend === 'up' ? 'bg-emerald-500/20 text-emerald-400' :
                      item.trend === 'down' ? 'bg-red-500/20 text-red-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {item.trend === 'up' ? <TrendingUp className="h-3 w-3" /> :
                       item.trend === 'down' ? <TrendingDown className="h-3 w-3" /> :
                       <Minus className="h-3 w-3" />}
                      {item.trend !== 'stable' ? `${item.percentage}%` : 'Mijadona'}
                    </div>
                    <span className="text-xs text-white/50">Raha oharina omaly</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-200 mt-4">
        <Info className="h-5 w-5 shrink-0 mt-0.5" />
        <p className="text-sm leading-relaxed">
          Salan'isa ihany ireo vidiny ireo ary mety hiovaova arakaraka ny kalitao sy ny toerana misy anao marina.
        </p>
      </div>
    </div>
  )
}
