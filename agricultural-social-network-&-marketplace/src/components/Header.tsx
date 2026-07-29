import React from 'react';
import { Search, Globe, UserCheck, ShieldAlert, Sparkles, CheckCircle } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  currentUser: User | null;
  allUsers: User[];
  onUserSwitch: (userId: string) => void;
  language: string;
  onLanguageChange: (lang: string) => void;
  onSearch: (term: string) => void;
}

export default function Header({
  currentUser,
  allUsers,
  onUserSwitch,
  language,
  onLanguageChange,
  onSearch,
}: HeaderProps) {
  const getLanguageLabel = (lang: string) => {
    switch (lang) {
      case 'French': return 'FR';
      case 'Spanish': return 'ES';
      case 'Mandarin': return 'ZH';
      default: return 'EN';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-100 shadow-xs px-4 md:px-6 py-3" id="app-header">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Brand Logo AgriSense Madagascar */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-700 flex items-center justify-center text-white font-black text-xl shadow-md shadow-emerald-100">
            🌱
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight text-gray-900 flex items-center gap-1">
              Agri<span className="text-emerald-600">Sense</span>
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold scale-90">Madagascar 🇲🇬</span>
            </span>
            <span className="text-[10px] text-gray-500 font-mono -mt-1">Social Network & Marketplace</span>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search crops, machinery, trade laws or exporters..."
            className="w-full bg-gray-50 border border-gray-100 rounded-full py-2 pl-10 pr-4 text-sm text-gray-800 placeholder-gray-400 focus:outline-hidden focus:border-red-400 focus:bg-white transition-colors"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>

        {/* Controls: Role Switcher & Language */}
        <div className="flex items-center gap-3">
          
          {/* Quick Language Translator Selector */}
          <div className="relative group">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors text-xs font-semibold text-gray-600">
              <Globe className="w-3.5 h-3.5 text-gray-500" />
              <span>{getLanguageLabel(language)}</span>
            </button>
            <div className="absolute right-0 mt-1.5 w-32 bg-white border border-gray-100 rounded-xl shadow-lg py-1 hidden group-hover:block z-50">
              {['English', 'French', 'Spanish', 'Mandarin'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => onLanguageChange(lang)}
                  className={`w-full text-left px-3 py-1.5 text-xs hover:bg-red-50 transition-colors ${
                    language === lang ? 'text-red-600 font-bold bg-red-50/50' : 'text-gray-600'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* User Profile Switcher */}
          {currentUser && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 border border-gray-100">
              <div className="relative">
                <img
                  src={currentUser.profilePicture}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover border border-white shadow-xs"
                />
                {currentUser.isVerified && (
                  <span className="absolute -bottom-0.5 -right-0.5 bg-blue-500 text-white rounded-full p-0.5 text-[6px] border border-white">
                    ✓
                  </span>
                )}
              </div>
              
              <div className="flex flex-col text-left mr-1">
                <span className="text-xs font-bold text-gray-800 leading-tight flex items-center gap-1">
                  {currentUser.name}
                </span>
                <span className="text-[9px] text-gray-500 uppercase tracking-wider font-semibold font-mono">
                  {currentUser.role}
                </span>
              </div>

              {/* Selector dropdown for other users */}
              <div className="relative group">
                <button className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                  <UserCheck className="w-3.5 h-3.5 text-gray-500 hover:text-red-600" />
                </button>
                <div className="absolute right-0 mt-2.5 w-60 bg-white border border-gray-100 rounded-xl shadow-xl py-1.5 hidden group-hover:block z-50">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase border-b border-gray-50 font-mono">
                    Switch Active Trade Profile:
                  </div>
                  {allUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => onUserSwitch(u.id)}
                      className={`w-full text-left px-3 py-2 flex items-center gap-2.5 hover:bg-gray-50 transition-colors ${
                        u.id === currentUser.id ? 'bg-red-50/30 text-red-600' : 'text-gray-700'
                      }`}
                    >
                      <img src={u.profilePicture} alt={u.name} className="w-6 h-6 rounded-full object-cover" />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold leading-tight">{u.name}</span>
                        <span className="text-[9px] font-mono uppercase text-gray-500">{u.role} · {u.location}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </header>
  );
}
