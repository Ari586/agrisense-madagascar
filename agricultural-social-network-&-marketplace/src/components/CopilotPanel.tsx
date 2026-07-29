import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, Send, HelpCircle, FileText, ArrowRight, RefreshCw, 
  Bot, ShieldCheck, Scale, Globe 
} from 'lucide-react';

interface CopilotPanelProps {
  language: string;
}

export default function CopilotPanel({ language }: CopilotPanelProps) {
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; time: string }>>([
    {
      sender: 'bot',
      text: "Hello! I am your AgriRED AI Trade Specialist. Ask me anything about international export laws, customs duties, WTO phytosanitary levels, shipping documents, or bulk pricing trends. I can also translate contracts or captions between English, Spanish, French, and Mandarin!",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    // Append user message
    const userMsg = {
      sender: 'user' as const,
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: textToSend })
      });
      const data = await res.json();
      
      const botMsg = {
        sender: 'bot' as const,
        text: data.answer || "I'm having trouble connecting to the GACC customs server. Please retry in a few seconds.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputText);
  };

  const suggestionPrompts = [
    { title: "Deforestation checks", text: "What GPS coordinate mapping formats do EU import systems require for EUDR deforestation verification?" },
    { title: "Tariffs on ginger", text: "What are the typical customs tariffs and phytosanitary limits on shipping raw sun-dried ginger to Rotterdam port?" },
    { title: "Escrow guarantee", text: "How does the AgriRED escrow guarantee protect agricultural exporters against non-payment?" }
  ];

  return (
    <div className="w-full bg-white border border-gray-150 rounded-2xl overflow-hidden flex flex-col h-[580px] shadow-xs text-left" id="copilot-panel">
      
      {/* Header */}
      <div className="px-6 py-4.5 bg-gradient-to-tr from-rose-500 to-red-600 border-b border-rose-600/20 text-white flex items-center justify-between shadow-sm shadow-rose-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md">
            <Bot className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-black tracking-wide uppercase font-mono">AgriRED AI Co-Pilot</h3>
            <span className="text-[9px] text-red-100 font-bold">Grounded Trade Specialist</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] bg-white/10 px-2.5 py-1 rounded-full border border-white/15">
          <Globe className="w-3.5 h-3.5" />
          <span className="font-bold">Active in: {language}</span>
        </div>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/10">
        {messages.map((msg, idx) => {
          const isUser = msg.sender === 'user';
          return (
            <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xl rounded-2xl p-4 text-xs leading-relaxed ${
                isUser 
                  ? 'bg-red-500 text-white rounded-tr-none' 
                  : 'bg-white border border-gray-150 shadow-xs text-gray-800 rounded-tl-none'
              }`}>
                {/* Parse Markdown-like highlights */}
                {msg.text.split('\n').map((line, lIdx) => {
                  if (line.startsWith('###') || line.startsWith('**')) {
                    return <strong key={lIdx} className="block font-black text-rose-600 mt-1 first:mt-0 font-mono uppercase tracking-wide">{line.replace(/[#*]/g, '').trim()}</strong>;
                  }
                  if (line.trim().startsWith('-') || line.trim().startsWith('1.')) {
                    return <div key={lIdx} className="pl-2.5 py-0.5 font-medium">{line}</div>;
                  }
                  return <p key={lIdx} className="mt-1 font-medium first:mt-0">{line}</p>;
                })}
                <span className={`text-[8px] block mt-2 text-right font-mono ${isUser ? 'text-white/60' : 'text-gray-400'}`}>
                  {msg.time}
                </span>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-150 rounded-2xl p-4 flex items-center gap-2 text-xs text-gray-500 rounded-tl-none shadow-xs">
              <RefreshCw className="w-4 h-4 animate-spin text-red-500" />
              <span className="font-bold">Analyzing regulations & pricing registers...</span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Suggestion Prompts */}
      <div className="px-6 py-2.5 bg-gray-50 border-t border-gray-100/60 flex flex-wrap gap-2">
        {suggestionPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(p.text)}
            className="flex items-center gap-1 px-3 py-1 bg-white hover:bg-red-50 border border-gray-200 hover:border-red-200 text-[10px] font-black text-gray-600 hover:text-red-600 rounded-full cursor-pointer transition-all uppercase font-mono tracking-wider"
          >
            <Sparkles className="w-3 h-3 text-red-500" />
            <span>{p.title}</span>
          </button>
        ))}
      </div>

      {/* Footer Form */}
      <form onSubmit={handleFormSubmit} className="px-6 py-4 border-t border-gray-100 flex items-center gap-3">
        <input
          type="text"
          placeholder="e.g. Translate my trade clauses, or check phytosanitary rules..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-800 placeholder-gray-400 focus:outline-hidden focus:border-red-400 focus:bg-white"
          required
        />
        <button
          type="submit"
          className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-md shadow-rose-100 transition-all cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
}
