'use client'

import { useState, useRef, useCallback, type DragEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Camera,
  Upload,
  X,
  Loader2,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
  Bug,
  Leaf,
  Shield,
  Bot
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { VoiceAssistant } from './voice-assistant'

interface DiagnosisResult {
  disease: string
  confidence: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  symptoms: string
  treatment: string
  prevention: string
  malagasyName: string
}

const severityConfig = {
  low: { label: 'Azo ekena', className: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', icon: CheckCircle2 },
  medium: { label: 'Antonony', className: 'bg-amber-500/20 text-amber-300 border-amber-500/30', icon: ShieldAlert },
  high: { label: 'Avo', className: 'bg-orange-500/20 text-orange-300 border-orange-500/30', icon: Bug },
  critical: { label: 'Tena Loza', className: 'bg-red-500/20 text-red-300 border-red-500/30', icon: ShieldAlert },
} as const

export function AiDiagnosis() {
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<DiagnosisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner un fichier image valide.')
      return
    }
    setError(null)
    setResult(null)

    const img = new Image()
    const objectUrl = URL.createObjectURL(file)
    
    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      
      const canvas = document.createElement('canvas')
      let width = img.width
      let height = img.height
      const maxSize = 800

      if (width > height && width > maxSize) {
        height = Math.round((height * maxSize) / width)
        width = maxSize
      } else if (height > maxSize) {
        width = Math.round((width * maxSize) / height)
        height = maxSize
      }

      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
        setImagePreview(dataUrl)
        setImageBase64(dataUrl.split(',')[1])
      } else {
        setError('Erreur lors du traitement de l\'image.')
      }
    }
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      setError('Impossible de lire l\'image.')
    }
    img.src = objectUrl
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  const handleDiagnose = async () => {
    if (!imageBase64) return
    setIsAnalyzing(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageBase64 }),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => null)
        throw new Error(errData?.error || 'Erreur serveur')
      }
      const data = await res.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de contacter le serveur. Vérifiez votre connexion.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleClear = () => {
    setImagePreview(null)
    setImageBase64(null)
    setResult(null)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col h-full bg-black/40 backdrop-blur-xl rounded-xl shadow-xl text-white">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-green-500/20 text-green-400">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-white">Fizahana aretina IA</CardTitle>
              <CardDescription className="text-white/70">Makà sary ny voly marary hahalalana ny aretiny</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          {!result ? (
            <div className="flex-1 flex flex-col justify-center">
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => !imagePreview && fileInputRef.current?.click()}
                className={`relative flex min-h-[240px] cursor-pointer flex-col items-center justify-center rounded-xl transition-colors ${
                  isDragging
                    ? 'border-primary bg-primary/10'
                    : 'border-white/20 bg-white/5 hover:bg-white/10'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileChange}
                />

                <AnimatePresence mode="wait">
                  {imagePreview ? (
                    <motion.div
                      key="preview"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="relative w-full p-4"
                    >
                      <img
                        src={imagePreview}
                        alt="Aperçu de la plante"
                        className="mx-auto max-h-[240px] rounded-lg object-contain"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute right-4 top-4 h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleClear()
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="upload"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center gap-3 p-6 text-center"
                    >
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                        <Camera className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">Tsindrio na ampidiro sary eto</p>
                        <p className="text-sm text-white/70 mt-1">
                          PNG, JPG hatramin'ny 10 Mo
                        </p>
                      </div>
                      <Button variant="outline" size="sm" className="gap-2 mt-1 bg-white/10 hover:bg-white/20 border-white/20 text-white" onClick={(e) => e.stopPropagation()}>
                        <Upload className="h-4 w-4" />
                        Misafidy
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Action buttons */}
              <div className="mt-4 flex flex-wrap gap-3">
                <Button
                  onClick={handleDiagnose}
                  disabled={!imagePreview || isAnalyzing}
                  className="gap-2 text-white shadow-lg bg-green-600 hover:bg-green-700"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Eo am-pizahana...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Zahao ny voly
                    </>
                  )}
                </Button>
                {imagePreview && (
                  <Button variant="outline" onClick={handleClear} className="gap-2 bg-white/10 hover:bg-white/20 border-white/20 text-white">
                    <X className="h-4 w-4" />
                    Fafao
                  </Button>
                )}
              </div>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 flex items-center gap-2 rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-200"
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </motion.div>
              )}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 flex flex-col"
            >
              {(() => {
                const sev = severityConfig[result.severity]
                const Icon = sev.icon
                return (
                  <>
                    <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    {result.malagasyName || result.disease}
                  </h3>
                  {result.malagasyName && result.malagasyName !== result.disease && (
                    <p className="text-sm text-white/70 italic">({result.disease})</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant="outline" className={`gap-1.5 px-3 py-1 font-medium ${sev?.className}`}>
                    <Icon className="h-3.5 w-3.5" />
                    {sev?.label}
                  </Badge>
                  <span className="text-xs text-white/60 font-medium">
                    {result.confidence}% antoka
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                <div className="rounded-xl bg-white/5 p-4 sm:p-5 h-full">
                  <h4 className="flex items-center gap-2 font-semibold text-white mb-3">
                    <Leaf className="h-4 w-4 text-primary" />
                    Soritr'aretina
                  </h4>
                  <p className="text-sm text-white/80 leading-relaxed">
                    {result.symptoms}
                  </p>
                </div>
                <div className="rounded-xl bg-white/5 p-4 sm:p-5 h-full">
                  <h4 className="flex items-center gap-2 font-semibold text-white mb-3">
                    <Shield className="h-4 w-4 text-emerald-400" />
                    Fitsaboana
                  </h4>
                  <p className="text-sm text-white/80 leading-relaxed mb-4">
                    {result.treatment}
                  </p>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-white/60 mb-2">Fisorohana</h5>
                  <p className="text-sm text-white/80 leading-relaxed">
                    {result.prevention}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button variant="outline" onClick={handleClear} className="gap-2 bg-white/10 hover:bg-white/20 border-white/20 text-white">
                  <Camera className="h-4 w-4" />
                  Haka sary vaovao
                </Button>
              </div>
                  </>
                )
              })()}
            </motion.div>
          )}
        </CardContent>
      </div>

      {/* Voice Assistant Section */}
      <div className="mt-8">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Bot className="h-6 w-6 text-green-400" />
          Mpanolo-tsaina IA (Chat & Feo)
        </h3>
        <VoiceAssistant />
      </div>
    </motion.div>
  )
}