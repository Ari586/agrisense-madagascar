import React from 'react';
import { REGIONS } from './legacy-data';

interface MapProps {
  selectedRegion: string;
  onSelectRegion: (r: string) => void;
}

export function MadagascarRegionList({ selectedRegion, onSelectRegion }: MapProps) {
  const groups = [
    {
      title: '🏔️ Hautes Terres',
      regions: ['analamanga', 'bongolava', 'itasy', 'vakinankaratra', 'amoron_i_mania', 'matsiatra_ambony']
    },
    {
      title: '🌊 Côte Est',
      regions: ['atsinanana', 'analanjirofo', 'anosy', 'vatovavy']
    },
    {
      title: '🌿 Nord',
      regions: ['diana', 'sava']
    },
    {
      title: '🏜️ Ouest',
      regions: ['boeny', 'melaky', 'menabe', 'sofia']
    },
    {
      title: '☀️ Sud',
      regions: ['androy', 'atsimo_andrefana', 'atsimo_atsinanana', 'ihorombe']
    }
  ];

  return (
    <div className="w-full h-full flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar" style={{ maxHeight: '600px' }}>
      {groups.map((group, idx) => (
        <div key={idx} className="mb-2">
          <div className="text-[11px] font-black text-white/50 uppercase tracking-widest mb-3 pl-1">
            {group.title}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {group.regions.map(rKey => {
              const regionInfo = (REGIONS as any)[rKey];
              if (!regionInfo) return null;
              const isSelected = selectedRegion === rKey || (selectedRegion === 'vatovavy_fitovinany' && rKey === 'vatovavy');
              
              return (
                <button
                  key={rKey}
                  onClick={() => onSelectRegion(rKey)}
                  className={`
                    p-3 rounded-xl border text-left text-xs sm:text-sm font-semibold transition-all duration-200
                    flex items-center gap-2
                    ${isSelected 
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white hover:border-white/20'
                    }
                  `}
                >
                  <span className="text-base shrink-0">📍</span>
                  <span className="truncate">{regionInfo.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
