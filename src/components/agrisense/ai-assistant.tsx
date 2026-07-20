'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bot,
  Send,
  Volume2,
  Loader2,
  User,
  Mic,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { apiUrl } from '@/lib/api'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export function AiAssistant() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const recognitionRef = useRef<any>(null)

  const toggleRecording = () => {
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop()
      setIsRecording(false)
      return
    }

    if (typeof window === 'undefined') return
    const SpeechRecognitionConstructor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognitionConstructor) {
      alert("Votre navigateur ou appareil mobile ne supporte pas la reconnaissance vocale native.")
      return
    }

    try {
      const recognition = new SpeechRecognitionConstructor()
      recognitionRef.current = recognition
      recognition.lang = 'mg-MG'
      recognition.interimResults = false

      recognition.onstart = () => setIsRecording(true)
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInput(prev => prev ? prev + ' ' + transcript : transcript)
      }
      recognition.onerror = (e: any) => {
        console.error("Speech recognition error:", e)
        setIsRecording(false)
      }
      recognition.onend = () => setIsRecording(false)

      recognition.start()
    } catch (err) {
      console.error("Failed to start speech recognition:", err)
      setIsRecording(false)
      alert("Impossible de démarrer le micro. Vérifiez les permissions de votre navigateur.")
    }
  }

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || isLoading) return

    const userMsg: Message = { role: 'user', content: text }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setIsLoading(true)

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    try {
      const res = await fetch(apiUrl('/api/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })
      if (!res.ok) throw new Error('Erreur serveur')
      const data = await res.json()
      const assistantMsg: Message = {
        role: 'assistant',
        content: data.reply ?? 'Miala tsiny, tsy afaka mamaly aho izao.',
      }
      setMessages((prev) => [...prev, assistantMsg])
      
      // Auto-play the voice response
      if (assistantMsg.content) {
        handleTts(assistantMsg.content)
      }
    } catch {
      const errorMsg: Message = {
        role: 'assistant',
        content:
          'Miala tsiny, tsy afaka mifandray amin\'ny server izao. Andramo indray.',
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }

  const handleTts = (text: string) => {
    if (typeof window === 'undefined') return
    if (!('speechSynthesis' in window)) {
      alert("Votre navigateur ne supporte pas la synthèse vocale.")
      return
    }
    
    // Stop any ongoing speech
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    // Try to find a French or Malagasy voice (fr-FR is often a good fallback for Malagasy if mg-MG isn't available)
    const voices = window.speechSynthesis.getVoices()
    const voice = voices.find(v => v.lang.includes('mg')) || voices.find(v => v.lang.includes('fr'))
    if (voice) {
      utterance.voice = voice
    }
    utterance.lang = 'fr-FR' // Fallback accent
    utterance.rate = 0.9 // Slightly slower for better comprehension
    
    window.speechSynthesis.speak(utterance)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    const ta = e.target
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <Card className="flex flex-col h-[65vh] min-h-[500px] max-h-[800px] w-full bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl relative overflow-hidden transition-all duration-300 hover:shadow-emerald-500/10 text-zinc-100">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/10 pointer-events-none" />
        <CardHeader className="pb-4 relative z-10 border-b border-white/10 bg-white/5 shrink-0">
          <CardTitle className="flex items-center gap-3 text-lg sm:text-xl font-bold text-white">
            <div className="p-2 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 shadow-lg">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <span className="drop-shadow-sm">Mpanampy IA Agricole</span>
          </CardTitle>
          <CardDescription className="text-zinc-300 font-medium">
            Mametraha fanontaniana amin'ny teny Malagasy mba hahazoana torohevitra.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col min-h-0 px-4 sm:px-6 py-4 sm:py-6 relative z-10">
          {/* Messages area */}
          <ScrollArea className="flex-1 min-h-0 mb-4">
            <div ref={scrollRef} className="flex flex-col gap-4 pr-3">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center text-zinc-300">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 mb-4 border border-white/10 shadow-inner">
                    <Bot className="h-8 w-8 text-emerald-400 drop-shadow-md" />
                  </div>
                  <p className="font-medium text-white text-lg">Tonga soa eto amin'ny Mpanolotsaina</p>
                  <p className="text-sm mt-2 max-w-sm text-zinc-400">
                    Manontania ahy momba ny fambolena, ny toetrandro, ny aretin-javamaniry, na ny vidim-bokatra.
                  </p>
                  <div className="mt-8 flex flex-wrap justify-center gap-3">
                    {[
                      "Inona avy ireo aretina mety mahazo ny vary?",
                      "Inona ny voly tsara atao amin'izao vanim-potoana izao?",
                      "Ahoana ny fomba fitsaboana ny aretin'ny voanjo?",
                    ].map((q) => (
                      <button
                        key={q}
                        onClick={() => setInput(q)}
                        className="rounded-2xl border border-white/20 bg-white/5 px-4 py-2.5 text-xs hover:bg-white/15 transition-colors text-left w-full sm:w-auto text-zinc-200 shadow-sm whitespace-normal break-words leading-snug"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-4 py-3 shadow-sm border ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-tr-sm border-emerald-400/30'
                          : 'bg-white/10 backdrop-blur-md text-zinc-100 rounded-tl-sm border-white/10'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-4 mb-1">
                        <span className="text-[10px] font-bold tracking-wider uppercase text-white/50">
                          {msg.role === 'user' ? 'Ianao' : 'Mpanampy'}
                        </span>
                        {msg.role === 'assistant' && (
                          <button
                            onClick={() => handleTts(msg.content)}
                            className="text-white/40 hover:text-white transition-colors"
                            title="Henoina"
                          >
                            <Volume2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl rounded-tl-sm px-5 py-4 border border-white/10 shadow-sm flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
                    <span className="text-xs font-medium text-emerald-200/80 animate-pulse uppercase tracking-wider">Mieritreritra...</span>
                  </div>
                </motion.div>
              )}
            </div>
          </ScrollArea>

          <div className="pt-3 border-t border-white/10 mt-auto shrink-0">
            <div className="relative flex items-end gap-2 bg-white/5 p-2 rounded-2xl border border-white/10 shadow-inner">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Hafatra..."
                className="w-full bg-transparent border-0 resize-none max-h-[120px] py-2 px-3 text-sm focus:ring-0 text-zinc-100 placeholder:text-white/30"
                rows={1}
              />
              <div className="flex gap-1.5 pb-1 pr-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleRecording}
                  className={`h-9 w-9 rounded-xl transition-colors ${
                    isRecording 
                      ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-300' 
                      : 'text-white/50 hover:text-white hover:bg-white/10'
                  }`}
                  title="Miteny"
                >
                  <Mic className={`h-4 w-4 ${isRecording ? 'animate-pulse' : ''}`} />
                </Button>
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="h-9 w-9 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 hover:opacity-90 shadow-md text-white border-none disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}