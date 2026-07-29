import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Users, Video, Plus, X, ArrowLeft, Send, Calendar, 
  HelpCircle, Tag, Check, Award, BookOpen 
} from 'lucide-react';
import { ForumThread, ForumReply, Webinar, User } from '../types';

interface ForumPanelProps {
  currentUser: User | null;
}

export default function ForumPanel({ currentUser }: ForumPanelProps) {
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  
  // Navigation states
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [activeThread, setActiveThread] = useState<ForumThread | null>(null);
  const [replies, setReplies] = useState<ForumReply[]>([]);
  const [newReplyText, setNewReplyText] = useState('');

  // Creation states
  const [isCreatingThread, setIsCreatingThread] = useState(false);
  const [threadTitle, setThreadTitle] = useState('');
  const [threadContent, setThreadContent] = useState('');
  const [threadTagsText, setThreadTagsText] = useState('');

  if (!currentUser) return null;

  const loadForumAndEvents = async () => {
    try {
      // Load threads
      const resThreads = await fetch('/api/forum');
      const dataThreads = await resThreads.json();
      setThreads(dataThreads);

      // Load webinars
      const resWeb = await fetch('/api/webinars');
      const dataWeb = await resWeb.json();
      setWebinars(dataWeb);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadForumAndEvents();
  }, [currentUser]);

  const handleSelectThread = async (threadId: string) => {
    try {
      const res = await fetch(`/api/forum/${threadId}`);
      const data = await res.json();
      setActiveThread(data.thread);
      setReplies(data.replies);
      setSelectedThreadId(threadId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateThreadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!threadTitle || !threadContent) return;

    try {
      const tags = threadTagsText.split(',').map(t => t.trim()).filter(Boolean);
      const res = await fetch('/api/forum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: threadTitle, content: threadContent, tags })
      });
      const data = await res.json();
      setThreads(prev => [data, ...prev]);

      // Reset
      setThreadTitle('');
      setThreadContent('');
      setThreadTagsText('');
      setIsCreatingThread(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReplyText.trim() || !activeThread) return;

    try {
      const res = await fetch(`/api/forum/${activeThread.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newReplyText })
      });
      const data = await res.json();
      setReplies(prev => [...prev, data]);
      setNewReplyText('');
      
      // Update thread repliesCount locally
      setActiveThread(prev => prev ? { ...prev, repliesCount: prev.repliesCount + 1 } : null);
      setThreads(prev => prev.map(t => t.id === activeThread.id ? { ...t, repliesCount: t.repliesCount + 1 } : t));
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegisterWebinar = async (webinarId: string) => {
    try {
      const res = await fetch(`/api/webinars/${webinarId}/register`, {
        method: 'POST'
      });
      const data = await res.json();
      setWebinars(prev => prev.map(w => w.id === webinarId ? data : w));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full" id="forum-panel">
      
      {/* Detail Thread View (Active conversation) */}
      {selectedThreadId && activeThread ? (
        <div className="space-y-6 text-left">
          {/* Back button */}
          <button
            onClick={() => { setSelectedThreadId(null); setActiveThread(null); }}
            className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-red-500 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Forums</span>
          </button>

          {/* Original Thread Post */}
          <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center gap-3 mb-3.5">
              <img src={activeThread.userAvatar} alt={activeThread.userName} className="w-9 h-9 rounded-full object-cover" />
              <div>
                <span className="text-xs font-bold text-gray-900 block">{activeThread.userName}</span>
                <span className="text-[9px] text-gray-400 font-mono">{new Date(activeThread.createdAt).toLocaleDateString()} · Exporter</span>
              </div>
            </div>

            <h3 className="text-base font-extrabold text-gray-900 mb-2">{activeThread.title}</h3>
            <p className="text-xs text-gray-600 leading-relaxed mb-4">{activeThread.content}</p>

            {/* Tags */}
            {activeThread.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-3 border-t border-gray-55">
                {activeThread.tags.map(tag => (
                  <span key={tag} className="text-[10px] bg-red-50 text-red-600 font-bold px-2 py-0.5 rounded-sm">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Replies Thread */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h4 className="text-xs font-black text-gray-400 font-mono uppercase tracking-wider">
              💬 Responses ({replies.length})
            </h4>

            {replies.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No community responses submitted yet. Share your experience!</p>
            ) : (
              <div className="space-y-3.5">
                {replies.map((reply) => (
                  <div key={reply.id} className="bg-white border border-gray-100 rounded-2xl p-4 flex gap-3">
                    <img src={reply.userAvatar} alt={reply.userName} className="w-7 h-7 rounded-full object-cover mt-0.5 shrink-0" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-800">{reply.userName}</span>
                        <span className="text-[9px] text-gray-400 font-mono">{new Date(reply.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">{reply.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Post Reply Form */}
          <form onSubmit={handleSendReplySubmit} className="bg-white border border-gray-150 rounded-2xl p-4 flex gap-3 items-center">
            <input
              type="text"
              placeholder="Contribute your expertise or answer question..."
              value={newReplyText}
              onChange={(e) => setNewReplyText(e.target.value)}
              className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs text-gray-800 placeholder-gray-400 focus:outline-hidden focus:border-red-400 focus:bg-white"
              required
            />
            <button
              type="submit"
              className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-md shadow-red-100 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
          
          {/* LEFT: Forums Threads List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-gray-900 tracking-tight flex items-center gap-1.5">
                  <MessageSquare className="w-5 h-5 text-red-500" />
                  <span>Q&amp;A Technical Forum</span>
                </h3>
                <p className="text-[10px] text-gray-400 mt-0.5">Solve crop diseases, compliance mapping rules or trade tariffs with peers</p>
              </div>
              <button
                onClick={() => setIsCreatingThread(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 text-[10px] font-black uppercase tracking-wider font-mono cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Thread</span>
              </button>
            </div>

            <div className="bg-white border border-gray-150 rounded-2xl overflow-hidden divide-y divide-gray-100">
              {threads.map((t) => (
                <div
                  key={t.id}
                  onClick={() => handleSelectThread(t.id)}
                  className="p-4.5 hover:bg-gray-50/40 cursor-pointer transition-colors flex items-start justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <h4 className="text-xs font-extrabold text-gray-900 hover:text-red-500 transition-colors leading-snug">
                      {t.title}
                    </h4>
                    <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                      {t.content}
                    </p>

                    {/* Meta info & tags */}
                    <div className="flex flex-wrap items-center gap-2.5 pt-1 text-[10px] text-gray-400">
                      <div className="flex items-center gap-1.5 font-bold text-gray-600">
                        <img src={t.userAvatar} alt={t.userName} className="w-4 h-4 rounded-full object-cover" />
                        <span>{t.userName}</span>
                      </div>
                      <span>•</span>
                      <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                      
                      {t.tags.length > 0 && (
                        <>
                          <span>•</span>
                          <div className="flex gap-1">
                            {t.tags.map(tag => (
                              <span key={tag} className="text-[8px] bg-gray-150 text-gray-500 font-bold px-1 py-0.2 rounded-sm uppercase tracking-wider font-mono">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Replies count indicator */}
                  <div className="flex flex-col items-center bg-gray-50 rounded-xl px-3 py-2 border border-gray-100 shrink-0">
                    <span className="text-sm font-black text-gray-800">{t.repliesCount}</span>
                    <span className="text-[8px] font-black text-gray-400 font-mono uppercase tracking-widest leading-none mt-0.5">Replies</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Webinars / Masterclasses */}
          <div className="lg:col-span-1 space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-gray-900 tracking-tight flex items-center gap-1.5">
                <Video className="w-5 h-5 text-red-500" />
                <span>Expert Webinars</span>
              </h3>
              <p className="text-[10px] text-gray-400 mt-0.5">RSVP for upcoming technical masterclasses & trade briefings</p>
            </div>

            <div className="space-y-4">
              {webinars.map((web) => (
                <div 
                  key={web.id}
                  className="bg-white border border-gray-150 rounded-2xl p-4.5 shadow-xs text-left flex flex-col h-full"
                >
                  <div className="flex items-start gap-3.5 mb-3.5">
                    <div className="p-2 bg-gradient-to-tr from-rose-500 to-red-600 text-white rounded-xl shadow-sm">
                      <Video className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-gray-900 leading-snug line-clamp-2">{web.title}</h4>
                      <span className="text-[9px] font-bold text-gray-400 mt-0.5 block">Host: {web.host}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-500 leading-relaxed mb-4 flex-1">
                    {web.description}
                  </p>

                  <div className="pt-3.5 border-t border-gray-55 flex items-center justify-between mt-auto">
                    <div className="flex flex-col text-[10px] text-gray-500 font-medium">
                      <span className="flex items-center gap-1 font-bold">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>{web.date}</span>
                      </span>
                      <span className="font-mono mt-0.5 text-gray-400">{web.time}</span>
                    </div>

                    <button
                      onClick={() => handleRegisterWebinar(web.id)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer ${
                        web.registeredByMe
                          ? 'bg-emerald-50 border border-emerald-200 text-emerald-600'
                          : 'bg-red-500 hover:bg-red-600 text-white shadow-xs shadow-red-100'
                      }`}
                    >
                      {web.registeredByMe ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Registered</span>
                        </>
                      ) : (
                        <span>Book Seat</span>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ----------------- CREATE THREAD DIALOG ----------------- */}
      {isCreatingThread && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="text-xs font-black text-gray-900 flex items-center gap-1.5 uppercase font-mono text-left">
                📢 Launch Forum Discussion
              </h3>
              <button onClick={() => setIsCreatingThread(false)} className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-200 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateThreadSubmit} className="p-5 space-y-4 text-left">
              {/* Title */}
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase font-mono text-gray-400">Discussion Title:</label>
                <input
                  type="text"
                  value={threadTitle}
                  onChange={(e) => setThreadTitle(e.target.value)}
                  placeholder="e.g. Compliant GIS mapping tools for coffee farm plots?"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-hidden focus:border-red-500"
                  required
                />
              </div>

              {/* Content body */}
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase font-mono text-gray-400">Content / Question detail:</label>
                <textarea
                  value={threadContent}
                  onChange={(e) => setThreadContent(e.target.value)}
                  placeholder="Elaborate on your query, export regulations dilemma, or farming disease issue..."
                  rows={4}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-800 focus:outline-hidden focus:border-red-500 resize-none"
                  required
                />
              </div>

              {/* Tags */}
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase font-mono text-gray-400">Related Tags (separated by comma):</label>
                <input
                  type="text"
                  value={threadTagsText}
                  onChange={(e) => setThreadTagsText(e.target.value)}
                  placeholder="e.g. EUDR, Mapping, CoffeeFarming, Tariffs"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingThread(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-xs font-bold text-white shadow-md shadow-red-100"
                >
                  Launch Thread
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
