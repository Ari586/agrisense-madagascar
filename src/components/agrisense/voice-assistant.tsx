'use client'

import { useState, useRef, useEffect } from 'react'
import { Mic, Send, Loader2, Bot, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { motion } from 'framer-motion'

interface Message {
  role: 'user' | 'assistant'
  text: string
}

export function VoiceAssistant() {
  const [isListening, setIsListening] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: "Salama! Inona no azoko hanampiana anao momba ny fambolena anio?" }
  ])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = 'mg-MG' // Malagasy

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
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
    } else {
      recognitionRef.current?.start()
      setIsListening(true)
    }
  }

  const handleSend = async (text: string = inputText) => {
    if (!text.trim()) return

    const newMessages = [...messages, { role: 'user', text }]
    setMessages(newMessages as Message[])
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
      setMessages([...newMessages, { role: 'assistant', text: data.reply }])
    } catch (error) {
      console.error(error)
      setMessages([...newMessages, { role: 'assistant', text: "Miala tsiny, nisy olana ara-teknika. Andramo indray." }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="flex flex-col h-[500px] bg-black/40 backdrop-blur-xl border-white/10 text-white shadow-xl">
      <CardContent className="flex-1 flex flex-col p-4 overflow-hidden">
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
              <div className={`p-3 rounded-2xl max-w-[80%] ${msg.role === 'user' ? 'bg-green-600 text-white rounded-tr-none' : 'bg-white/10 text-white/90 rounded-tl-none'}`}>
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
          {recognitionRef.current && (
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
            className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-primary/50"
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
  )
}
