'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Save, Loader2, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'
import { apiUrl } from '@/lib/api'

export default function AdminPage() {
  const [prices, setPrices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    let isActive = true

    void fetch(apiUrl('/api/market/prices'))
      .then((res) => res.json())
      .then((json) => {
        if (isActive && json.success) {
          setPrices(json.data)
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

  const handleChange = (id: string, field: string, value: any) => {
    setPrices(prices.map(p => p.id === id ? { ...p, [field]: value } : p))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(apiUrl('/api/market/prices'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', updates: prices })
      })
      const json = await res.json()
      if (json.success) {
        toast({ title: 'Succès', description: 'Les prix ont été mis à jour avec succès.', className: "bg-emerald-500 text-white" })
      } else {
        toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de sauvegarder.' })
      }
    } catch {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Erreur réseau.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-12 text-white">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="outline" size="icon" className="bg-slate-900 border-slate-800 hover:bg-slate-800 text-white">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Panneau Administrateur</h1>
            <p className="text-slate-400">Gérez les prix du marché et les configurations.</p>
          </div>
        </div>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl text-white">Prix du Marché (Tsena)</CardTitle>
            <Button onClick={handleSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Sauvegarder
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-slate-500" /></div>
            ) : (
              <div className="space-y-6">
                {prices.map(p => (
                  <div key={p.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 items-end">
                    <div>
                      <Label className="text-slate-400 mb-2 block">Produit</Label>
                      <div className="font-semibold text-lg">{p.name}</div>
                      <div className="text-xs text-slate-500">{p.category}</div>
                    </div>
                    <div>
                      <Label className="text-slate-400 mb-2 block">Prix (Ar/kg)</Label>
                      <Input 
                        type="number" 
                        value={p.price} 
                        onChange={(e) => handleChange(p.id, 'price', e.target.value)}
                        className="bg-slate-950 border-slate-700 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-400 mb-2 block">Variation (%)</Label>
                      <Input 
                        type="number" 
                        step="0.1"
                        value={p.percentage} 
                        onChange={(e) => handleChange(p.id, 'percentage', e.target.value)}
                        className="bg-slate-950 border-slate-700 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-400 mb-2 block">Tendance</Label>
                      <select 
                        value={p.trend}
                        onChange={(e) => handleChange(p.id, 'trend', e.target.value)}
                        className="flex h-10 w-full items-center justify-between rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="up">En hausse</option>
                        <option value="down">En baisse</option>
                        <option value="stable">Stable</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
