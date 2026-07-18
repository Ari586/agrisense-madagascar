import React from 'react';
import { REGIONS } from './legacy-data';

interface MapProps {
  selectedRegion: string;
  onSelectRegion: (r: string) => void;
}

export function MadagascarGridMap({ selectedRegion, onSelectRegion }: MapProps) {
  // 9 rows simulating Madagascar's shape
  const grid = [
    [null, 'diana', 'sava', null],
    ['boeny', 'sofia', 'analanjirofo', null],
    ['melaky', 'betsiboka', 'alaotra_mangoro', 'atsinanana'],
    [null, 'bongolava', 'analamanga', null],
    [null, 'itasy', 'vakinankaratra', null],
    ['menabe', 'amoron_i_mania', 'vatovavy', null],
    [null, 'matsiatra_ambony', 'fitovinany', null],
    ['atsimo_andrefana', 'ihorombe', null, null],
    [null, 'androy', 'anosy', null]
  ];

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-black/20 rounded-xl backdrop-blur-md border border-white/10 w-full h-full min-h-[400px]">
      <div className="flex flex-col gap-1.5 sm:gap-2">
        {grid.map((row, rIdx) => (
          <div key={rIdx} className="flex justify-center gap-1.5 sm:gap-2">
            {row.map((cell, cIdx) => {
              if (!cell) {
                return <div key={cIdx} className="w-12 h-12 sm:w-16 sm:h-16 bg-transparent" />;
              }
              const isSelected = selectedRegion === cell;
              const regionName = (REGIONS as any)[cell]?.name || cell;
              const shortName = regionName.substring(0, 4).toUpperCase();
              
              // Colors based on region type (like the calendar markers)
              const type = (REGIONS as any)[cell]?.type;
              let bgClass = "bg-white/5 border-white/10 text-white/70 hover:bg-white/20";
              if (isSelected) {
                bgClass = "bg-emerald-500 text-white border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)] z-10 scale-110";
              } else if (type === 'highland') {
                bgClass = "bg-blue-500/20 border-blue-500/30 text-blue-100 hover:bg-blue-500/40";
              } else if (type === 'east') {
                bgClass = "bg-green-500/20 border-green-500/30 text-green-100 hover:bg-green-500/40";
              } else if (type === 'south') {
                bgClass = "bg-orange-500/20 border-orange-500/30 text-orange-100 hover:bg-orange-500/40";
              } else if (type === 'north') {
                bgClass = "bg-yellow-500/20 border-yellow-500/30 text-yellow-100 hover:bg-yellow-500/40";
              }

              return (
                <button
                  key={cIdx}
                  onClick={() => onSelectRegion(cell)}
                  title={regionName}
                  className={`
                    relative w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center 
                    rounded-lg sm:rounded-xl border transition-all duration-300
                    cursor-pointer text-[10px] sm:text-xs font-black tracking-tighter
                    ${bgClass}
                  `}
                >
                  {shortName}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-3 text-[10px] font-bold uppercase text-white/50">
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-blue-500/40"></div> Afovoany</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-green-500/40"></div> Atsinanana</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-yellow-500/40"></div> Avaratra/Andrefana</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-orange-500/40"></div> Atsimo</div>
      </div>
    </div>
  );
}
