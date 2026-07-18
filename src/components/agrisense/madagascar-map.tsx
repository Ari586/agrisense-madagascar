'use client'

import React, { useMemo, useState } from 'react'
import { geoIdentity, geoPath } from 'd3-geo'
import geoData from './madagascar-regions.json'

interface MadagascarMapProps {
  onRegionSelect: (regionName: string) => void
  selectedRegion: string | null
}

export function MadagascarMap({ onRegionSelect, selectedRegion }: MadagascarMapProps) {
  // Setup D3 projection using geoIdentity since Highcharts pre-projects coordinates
  const { path, viewBox } = useMemo(() => {
    // We use fitSize to automatically scale the arbitrary coordinate grid into our 400x600 SVG box
    // Highcharts Y is usually inverted relative to standard SVG
    const projection = geoIdentity()
      .reflectY(true)
      .fitSize([400, 600], geoData as any)

    const pathGenerator = geoPath().projection(projection)
    
    return {
      path: pathGenerator,
      viewBox: "0 0 400 600"
    }
  }, [])

  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null)

  return (
    <div className="w-full h-full min-h-[500px] flex items-center justify-center relative">
      <svg 
        viewBox={viewBox} 
        className="w-full h-full max-h-[600px] drop-shadow-2xl"
        style={{ filter: "drop-shadow(0 0 20px rgba(0,0,0,0.3))" }}
      >
        {(geoData as any).features.map((feature: any) => {
          const regionName = feature.properties.name
          const isSelected = selectedRegion === regionName
          const isHovered = hoveredRegion === regionName
          
          return (
            <path
              key={feature.properties['hc-key']}
              d={path(feature) || ""}
              fill={isSelected ? "rgba(34, 197, 94, 0.4)" : isHovered ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 255, 255, 0.05)"}
              stroke={isSelected ? "rgba(74, 222, 128, 0.8)" : isHovered ? "rgba(255, 255, 255, 0.5)" : "rgba(255, 255, 255, 0.2)"}
              strokeWidth={isSelected ? 1.5 : 0.5}
              className="cursor-pointer transition-all duration-300"
              onClick={() => onRegionSelect(regionName)}
              onMouseEnter={() => setHoveredRegion(regionName)}
              onMouseLeave={() => setHoveredRegion(null)}
            />
          )
        })}
      </svg>
      
      {hoveredRegion && !selectedRegion && (
        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl text-white font-bold text-sm pointer-events-none border border-white/10 shadow-xl animate-in fade-in">
          {hoveredRegion}
        </div>
      )}
    </div>
  )
}
