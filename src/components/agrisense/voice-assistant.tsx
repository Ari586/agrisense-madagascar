'use client'

import { useState, useRef, useEffect } from 'react'
import { Mic, Send, Loader2, Bot, User, X, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { motion, AnimatePresence } from 'framer-motion'

interface Message {
  role: 'user' | 'assistant'
  text: string
}

export function VoiceAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: "Salama! Inona no azoko hanampiana anao momba ny fambolena anio?" }
  ])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const recognitionRef = useRef<any>(null)

  const handleSend = async (text: string = inputText) => {
    if (!text.trim()) return

    const newMessages = [...messages, { role: 'user' as const, text }]
    setMessages(newMessages as any)
    setInputText('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })

      if (!res.ok) throw new Error('Network response was not ok')
      const data = await res.json()
      setMessages([...newMessages, { role: 'assistant' as const, text: data.reply ?? "Miala tsiny, nisy olana ara-teknika." }] as any)
    } catch (error) {
      console.error(error)
      setMessages([...newMessages, { role: 'assistant' as const, text: "Miala tsiny, nisy olana ara-teknika. Andramo indray." }] as any)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const setupRecognition = window.requestAnimationFrame(() => {
      const SpeechRecognitionConstructor =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognitionConstructor) {
        setSpeechSupported(true)
        const recognition = new SpeechRecognitionConstructor()
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = 'mg-MG'

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          setInputText(transcript)
          setIsListening(false)
          handleSend(transcript)
        }

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error', event.error)
          setIsListening(false)
        }

        recognition.onend = () => {
          setIsListening(false)
        }

        recognitionRef.current = recognition
      }

      setSpeechSupported(Boolean(SpeechRecognitionConstructor))
    })

    return () => {
      window.cancelAnimationFrame(setupRecognition)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
    } else {
      recognitionRef.current?.start()
      setIsListening(true)
    }
  }

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-[100] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-4 w-[calc(100vw-2rem)] sm:w-[400px] origin-bottom-right"
          >
            <Card className="flex flex-col h-[500px] sm:h-[600px] bg-black/80 backdrop-blur-2xl border-white/20 text-white shadow-2xl overflow-hidden rounded-2xl">
              <div className="bg-primary/20 p-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-primary p-2 rounded-full text-primary-foreground">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Mpanolo-tsaina IA</h3>
                    <p className="text-xs text-white/70">Mavitrika ankehitriny</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white hover:bg-white/10 rounded-full">
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <CardContent className="flex-1 flex flex-col p-4 overflow-hidden bg-gradient-to-b from-transparent to-black/40">
                <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-white/20">
                  {messages.map((msg, idx) => (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={idx}
                      className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                      <div className={`flex items-center justify-center h-8 w-8 rounded-full shrink-0 ${msg.role === 'user' ? 'bg-green-600' : 'bg-primary/20 text-primary'}`}>
                        {msg.role === 'user' ? <User className="h-4 w-4 text-white" /> : <Bot className="h-4 w-4" />}
                      </div>
                      <div className={`p-3 rounded-2xl max-w-[85%] ${msg.role === 'user' ? 'bg-green-600 text-white rounded-tr-none' : 'bg-white/10 text-white/90 rounded-tl-none'}`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      </div>
                    </motion.div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-3">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/20 text-primary shrink-0">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="p-3 rounded-2xl bg-white/10 rounded-tl-none flex items-center gap-1">
                        <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" />
                        <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="mt-4 pt-4 border-t border-white/10 flex gap-2">
                  {speechSupported && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={toggleListening}
                      className={`shrink-0 border-white/20 hover:bg-white/10 ${isListening ? 'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30' : 'bg-white/5 text-white'}`}
                    >
                      {isListening ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mic className="h-4 w-4" />}
                    </Button>
                  )}
                  <Input
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Anontanio ny IA..."
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-primary/50"
                  />
                  <Button
                    onClick={() => handleSend()}
                    disabled={!inputText.trim() || isLoading}
                    className="bg-green-600 hover:bg-green-700 text-white shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-green-600 text-white shadow-[0_0_20px_rgba(22,163,74,0.5)] flex items-center justify-center hover:bg-green-500 transition-colors"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="h-6 w-6 sm:h-8 sm:w-8" />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageSquare className="h-6 w-6 sm:h-7 sm:w-7" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  )
}
