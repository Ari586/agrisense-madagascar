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
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

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
  low: { label: 'Faible', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800', icon: CheckCircle2 },
  medium: { label: 'Modéré', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800', icon: ShieldAlert },
  high: { label: 'Élevé', className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800', icon: Bug },
  critical: { label: 'Critique', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800', icon: ShieldAlert },
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
    if (file.size > 10 * 1024 * 1024) {
      setError('L\'image ne doit pas dépasser 10 Mo.')
      return
    }
    setError(null)
    setResult(null)
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      setImagePreview(dataUrl)
      setImageBase64(dataUrl.split(',')[1])
    }
    reader.readAsDataURL(file)
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            Diagnostic IA des Maladies des Plantes
          </CardTitle>
          <CardDescription>
            Prenez une photo de votre plante malade et laissez l&apos;IA identifier le problème. Maka sary ny vola mba hahafantarana ny aretina.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          {/* Upload area */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => !imagePreview && fileInputRef.current?.click()}
            className={`relative flex min-h-[200px] sm:min-h-[260px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors ${
              isDragging
                ? 'border-primary bg-primary/5'
                : imagePreview
                  ? 'border-border'
                  : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30'
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
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                    <Camera className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Cliquez ou glissez une image</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      PNG, JPG jusqu&apos;à 10 Mo — photo de feuilles, tiges ou fruits
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2 mt-1" onClick={(e) => e.stopPropagation()}>
                    <Upload className="h-4 w-4" />
                    Parcourir
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
              className="gap-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyse en cours...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Analyser la plante
                </>
              )}
            </Button>
            {imagePreview && (
              <Button variant="outline" onClick={handleClear} className="gap-2">
                <X className="h-4 w-4" />
                Effacer
              </Button>
            )}
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </motion.div>
          )}

          {/* Result */}
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 rounded-xl border bg-card p-4 sm:p-6 space-y-5"
            >
              {/* Header: Disease name + severity + confidence */}
              <div className="flex flex-wrap items-start gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold">{result.disease}</h3>
                  {result.malagasyName && (
                    <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Leaf className="h-3.5 w-3.5" />
                      Anarana malagasy: <span className="font-medium text-foreground">{result.malagasyName}</span>
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant="outline"
                    className={
                      result.confidence > 80
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                    }
                  >
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Confiance : {result.confidence}%
                  </Badge>
                  {result.severity && (
                    <Badge variant="outline" className={severityConfig[result.severity].className}>
                      {(() => { const SIcon = severityConfig[result.severity].icon; return <SIcon className="h-3 w-3 mr-1" /> })()}
                      {severityConfig[result.severity].label}
                    </Badge>
                  )}
                </div>
              </div>

              <Separator />

              {/* Symptoms */}
              {result.symptoms && (
                <div>
                  <h4 className="font-semibold text-sm mb-1.5 flex items-center gap-1.5">
                    <Bug className="h-4 w-4 text-amber-500" />
                    Symptômes observés
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{result.symptoms}</p>
                </div>
              )}

              {/* Treatment */}
              {result.treatment && (
                <div>
                  <h4 className="font-semibold text-sm mb-1.5 flex items-center gap-1.5">
                    <Shield className="h-4 w-4 text-emerald-500" />
                    Traitement recommandé
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{result.treatment}</p>
                </div>
              )}

              {/* Prevention */}
              {result.prevention && (
                <div>
                  <h4 className="font-semibold text-sm mb-1.5 flex items-center gap-1.5">
                    <ShieldAlert className="h-4 w-4 text-primary" />
                    Mesures préventives
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{result.prevention}</p>
                </div>
              )}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}