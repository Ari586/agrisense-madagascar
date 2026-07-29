import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Sparkles, Plus, AlertCircle, Check, X, Shield, 
  HelpCircle, MessageSquare, Briefcase, FileSignature, DollarSign, Scale 
} from 'lucide-react';
import { ChatContact, Message, User } from '../types';

interface ChatPanelProps {
  currentUser: User | null;
  selectedContactId: string | null;
  onSelectContact: (contactId: string) => void;
}

export default function ChatPanel({
  currentUser,
  selectedContactId,
  onSelectContact
}: ChatPanelProps) {
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  
  // Negotiation form state
  const [isProposing, setIsProposing] = useState(false);
  const [proposalPrice, setProposalPrice] = useState('');
  const [proposalQuantity, setProposalQuantity] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  if (!currentUser) return null;

  // Load contacts
  const loadContacts = async () => {
    try {
      const res = await fetch('/api/chat/contacts');
      const data = await res.json();
      setContacts(data);
      
      // Auto select first contact if none selected
      if (!selectedContactId && data.length > 0) {
        onSelectContact(data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Load messages for selected contact
  const loadMessages = async () => {
    if (!selectedContactId) return;
    try {
      const res = await fetch(`/api/chat/messages/${selectedContactId}`);
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadContacts();
  }, [currentUser, selectedContactId]);

  useEffect(() => {
    loadMessages();
  }, [selectedContactId]);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedContactId) return;

    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: selectedContactId,
          content: inputText,
          type: 'text'
        })
      });
      const data = await res.json();
      setMessages(prev => [...prev, data]);
      setInputText('');
      loadContacts(); // update last message snippet
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposalPrice || !proposalQuantity || !selectedContactId) return;

    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: selectedContactId,
          content: `Proposing secure trade offer: ${proposalQuantity} units at $${proposalPrice} per unit.`,
          type: 'negotiation',
          proposalPrice: Number(proposalPrice),
          proposalQuantity: Number(proposalQuantity)
        })
      });
      const data = await res.json();
      setMessages(prev => [...prev, data]);
      setProposalPrice('');
      setProposalQuantity('');
      setIsProposing(false);
      loadContacts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleNegotiationAction = async (messageId: string, action: 'accepted' | 'declined') => {
    try {
      const res = await fetch(`/api/chat/messages/${messageId}/negotiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action })
      });
      const data = await res.json();
      
      // Update local message state
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, proposalStatus: action } : m));
    } catch (err) {
      console.error(err);
    }
  };

  const activeContact = contacts.find(c => c.id === selectedContactId);

  return (
    <div className="w-full bg-white border border-gray-150 rounded-2xl overflow-hidden flex h-[620px] shadow-xs" id="chat-panel">
      
      {/* LEFT: Contacts Rail */}
      <div className="w-1/3 border-r border-gray-100 flex flex-col bg-gray-50/50">
        <div className="px-4.5 py-4 border-b border-gray-100 bg-white text-left">
          <h3 className="text-sm font-black text-gray-900 flex items-center gap-1.5 uppercase font-mono">
            💬 Trade Negotiations
          </h3>
          <span className="text-[10px] text-gray-400">Direct lines with global brokers</span>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-gray-100/60">
          {contacts.map((contact) => {
            const isSelected = contact.id === selectedContactId;
            return (
              <button
                key={contact.id}
                onClick={() => onSelectContact(contact.id)}
                className={`w-full text-left px-4 py-3.5 flex items-start gap-3 transition-colors ${
                  isSelected ? 'bg-white border-l-4 border-red-500' : 'hover:bg-gray-50'
                }`}
              >
                <img
                  src={contact.profilePicture}
                  alt={contact.name}
                  className="w-9 h-9 rounded-full object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-bold text-gray-900 truncate">{contact.name}</span>
                    <span className="text-[8px] font-mono text-gray-400">
                      {contact.role.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500 truncate leading-tight">
                    {contact.lastMessage}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT: Active Chat Room */}
      <div className="flex-1 flex flex-col bg-white">
        
        {/* Chat Room Subheader */}
        {activeContact ? (
          <>
            <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3 text-left">
                <img
                  src={activeContact.profilePicture}
                  alt={activeContact.name}
                  className="w-9 h-9 rounded-full object-cover"
                />
                <div>
                  <h4 className="text-xs font-black text-gray-900 leading-snug">{activeContact.name}</h4>
                  <p className="text-[9px] text-gray-400 font-mono tracking-wider uppercase font-semibold">
                    ROLE: {activeContact.role} · Verified Broker
                  </p>
                </div>
              </div>

              {/* Propose Negotiation Button */}
              <button
                onClick={() => setIsProposing(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 text-[10px] font-black uppercase tracking-wider font-mono cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Propose Offer</span>
              </button>
            </div>

            {/* Conversation Thread */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/20">
              {messages.map((msg) => {
                const isMe = msg.senderId === currentUser.id;

                if (msg.type === 'negotiation') {
                  // Beautiful Custom Price Proposer Offer Card!
                  return (
                    <div 
                      key={msg.id}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className="max-w-sm rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 p-4.5 shadow-xs text-left">
                        <div className="flex items-center gap-1.5 text-amber-700 font-extrabold text-[10px] font-mono uppercase mb-2">
                          <Scale className="w-4 h-4 text-amber-500" />
                          <span>Structured Contract Offer</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 mb-3 bg-white/70 p-3 rounded-lg border border-amber-100/50">
                          <div>
                            <span className="text-[9px] font-bold text-gray-400 block font-mono">PROPOSED RATE</span>
                            <span className="text-sm font-black text-amber-600">${msg.proposalPrice} / kg</span>
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-gray-400 block font-mono">LOT VOLUME</span>
                            <span className="text-sm font-black text-gray-800">{msg.proposalQuantity?.toLocaleString()} kg</span>
                          </div>
                        </div>

                        <div className="text-[11px] text-gray-600 mb-4 font-medium">
                          Estimated Total FOB contract value: <strong className="text-amber-700">${((msg.proposalPrice || 0) * (msg.proposalQuantity || 0)).toLocaleString()} USD</strong>
                        </div>

                        {/* Status elements */}
                        {msg.proposalStatus === 'pending' ? (
                          isMe ? (
                            <span className="text-[10px] text-gray-400 italic block font-mono">⏳ Awaiting buyer response...</span>
                          ) : (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleNegotiationAction(msg.id, 'declined')}
                                className="flex-1 py-1 px-3 border border-red-200 hover:bg-red-50 text-red-600 text-[10px] font-black rounded-lg transition-colors cursor-pointer"
                              >
                                Decline
                              </button>
                              <button
                                onClick={() => handleNegotiationAction(msg.id, 'accepted')}
                                className="flex-1 py-1 px-3 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-black rounded-lg transition-colors cursor-pointer"
                              >
                                Accept Offer
                              </button>
                            </div>
                          )
                        ) : msg.proposalStatus === 'accepted' ? (
                          <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 rounded-lg py-1 px-2.5 border border-emerald-100 uppercase font-mono">
                            <Check className="w-3.5 h-3.5" />
                            <span>Offer Approved! Escrow Contract Active</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-50 rounded-lg py-1 px-2.5 border border-red-100 uppercase font-mono">
                            <X className="w-3.5 h-3.5" />
                            <span>Offer Declined by Partner</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }

                return (
                  <div 
                    key={msg.id}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-md rounded-2xl px-4 py-2.5 text-xs text-left ${
                      isMe 
                        ? 'bg-red-500 text-white shadow-xs rounded-tr-none'
                        : 'bg-gray-100 text-gray-800 rounded-tl-none'
                    }`}>
                      <p className="leading-relaxed">{msg.content}</p>
                      <span className={`text-[8px] block mt-1.5 font-mono text-right ${isMe ? 'text-white/60' : 'text-gray-400'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input bar */}
            <form onSubmit={handleSendMessage} className="px-6 py-4.5 border-t border-gray-100 flex items-center gap-3">
              <input
                type="text"
                placeholder={`Type a secure message to ${activeContact.name}...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-hidden focus:border-red-400 focus:bg-white"
                required
              />
              <button
                type="submit"
                className="p-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-100 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-gray-50/10">
            <MessageSquare className="w-10 h-10 text-gray-300 mb-2" />
            <h4 className="text-sm font-bold text-gray-800">Select a broker discussion</h4>
            <p className="text-xs text-gray-500 mt-1">Initiate a direct line to negotiate prices, FOB terms, or container details.</p>
          </div>
        )}

      </div>

      {/* ----------------- PROPOSE TRADE OFFER MODAL ----------------- */}
      {isProposing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="text-xs font-black text-gray-900 flex items-center gap-1.5 uppercase font-mono text-left">
                💰 Create Secure Trade Offer
              </h3>
              <button onClick={() => setIsProposing(false)} className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-200 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendProposal} className="p-5 space-y-4 text-left">
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Transmit a structured transaction proposal directly in the chat thread. The counterparty can instantly accept to lock the contract!
              </p>

              {/* Proposed Price per unit */}
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase font-mono text-gray-400">Proposed Rate (USD/kg):</label>
                <input
                  type="number"
                  step="0.01"
                  value={proposalPrice}
                  onChange={(e) => setProposalPrice(e.target.value)}
                  placeholder="e.g. 5.80"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-hidden"
                  required
                />
              </div>

              {/* Proposed Quantity lot */}
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase font-mono text-gray-400">Cargo lot Volume (kg):</label>
                <input
                  type="number"
                  value={proposalQuantity}
                  onChange={(e) => setProposalQuantity(e.target.value)}
                  placeholder="e.g. 2000"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-hidden"
                  required
                />
              </div>

              {/* Total estimation snippet */}
              {proposalPrice && proposalQuantity && (
                <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl">
                  <span className="text-[9px] font-bold text-gray-400 block font-mono">ESTIMATED EXPORT FOB VALUE:</span>
                  <span className="text-sm font-black text-gray-800">
                    ${(Number(proposalPrice) * Number(proposalQuantity)).toLocaleString()} USD
                  </span>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProposing(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-xs font-bold text-white shadow-md shadow-amber-100"
                >
                  Propose Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
