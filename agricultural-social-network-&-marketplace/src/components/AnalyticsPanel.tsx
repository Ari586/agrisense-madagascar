import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Globe, FileText, Sparkles, Scale, DollarSign, 
  RefreshCw, Info, Database, Layers, ArrowUpRight 
} from 'lucide-react';

export default function AnalyticsPanel() {
  const [selectedCrop, setSelectedCrop] = useState<'Coffee' | 'Ginger' | 'Wheat' | 'Vanilla'>('Coffee');
  const [months, setMonths] = useState<string[]>(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']);
  const [priceData, setPriceData] = useState<{[key: string]: number[]}>({
    Coffee: [5.80, 5.95, 6.10, 6.05, 6.20, 6.35],
    Ginger: [2.50, 2.55, 2.70, 2.65, 2.80, 2.85],
    Wheat: [0.32, 0.35, 0.38, 0.36, 0.39, 0.41],
    Vanilla: [210.0, 215.0, 222.0, 218.0, 228.0, 235.0]
  });

  // AI Compliance Oracle State
  const [targetCrop, setTargetCrop] = useState('Coffee');
  const [targetCountry, setTargetCountry] = useState('European Union');
  const [isConsulting, setIsConsulting] = useState(false);
  const [oracleReport, setOracleReport] = useState<string | null>(null);

  // Load backend prices
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch('/api/analytics/prices');
        const data = await res.json();
        if (data.months && data.priceData) {
          setMonths(data.months);
          setPriceData(data.priceData);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchPrices();
  }, []);

  // Propose AI Consultation
  const handleConsultOracle = async () => {
    setIsConsulting(true);
    setOracleReport(null);

    try {
      const res = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `Generate a comprehensive international trade intelligence audit including demand forecasting, pricing expectation, and import/export regulations for shipping ${targetCrop} to ${targetCountry}.`,
          contextCrop: targetCrop,
          contextCountry: targetCountry
        })
      });
      const data = await res.json();
      setOracleReport(data.answer);
    } catch (err) {
      console.error(err);
    } finally {
      setIsConsulting(false);
    }
  };

  // SVG Chart math helper
  const currentPrices = priceData[selectedCrop] || [0,0,0,0,0,0];
  const minPrice = Math.min(...currentPrices) * 0.95;
  const maxPrice = Math.max(...currentPrices) * 1.05;
  const priceRange = maxPrice - minPrice;

  // Chart coordinates
  const points = currentPrices.map((price, idx) => {
    const x = 40 + (idx * 80); // width mapping
    const y = 160 - ((price - minPrice) / priceRange) * 120; // height mapping (inverted)
    return { x, y, val: price };
  });

  const dPath = points.reduce((acc, p, idx) => {
    return acc + (idx === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`);
  }, '');

  return (
    <div className="w-full text-left" id="analytics-panel">
      
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-1.5">
          📈 Agri-Trade Intelligence & Forecasts
        </h2>
        <p className="text-xs text-gray-500">
          Monitor commodity price trend shifts, analyze country tariff rates, and compile demand forecasts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT: Dynamic Price Trends Custom Chart */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-xs">
            
            {/* Crop selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-50 pb-4 mb-4">
              <div>
                <h3 className="text-xs font-black text-gray-900 flex items-center gap-1 font-mono uppercase">
                  Wholesale Market Index
                </h3>
                <span className="text-[10px] text-gray-400">Past 6 Months Average FOB rates in USD</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {['Coffee', 'Ginger', 'Wheat', 'Vanilla'].map((crop) => (
                  <button
                    key={crop}
                    onClick={() => setSelectedCrop(crop as any)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider font-mono border transition-all cursor-pointer ${
                      selectedCrop === crop
                        ? 'bg-red-500 border-red-500 text-white shadow-xs'
                        : 'bg-gray-50 border-gray-150 text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    {crop}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom SVG Line Chart */}
            <div className="relative pt-4 px-1 bg-gray-50/50 rounded-xl border border-gray-50">
              <svg viewBox="0 0 460 180" className="w-full h-auto overflow-visible">
                {/* Y Axis gridlines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                  const yVal = 160 - ratio * 120;
                  const priceLabel = (minPrice + ratio * priceRange).toFixed(selectedCrop === 'Vanilla' ? 0 : 2);
                  return (
                    <g key={idx}>
                      <line x1="40" y1={yVal} x2="440" y2={yVal} stroke="#e5e7eb" strokeDasharray="2 3" strokeWidth="1" />
                      <text x="35" y={yVal + 3} className="text-[8px] font-mono font-bold text-gray-400 text-right" textAnchor="end">
                        ${priceLabel}
                      </text>
                    </g>
                  );
                })}

                {/* X Axis labels */}
                {months.map((month, idx) => {
                  const xVal = 40 + idx * 80;
                  return (
                    <text key={idx} x={xVal} y="175" className="text-[9px] font-bold font-mono text-gray-400" textAnchor="middle">
                      {month}
                    </text>
                  );
                })}

                {/* Line Path */}
                <path d={dPath} fill="none" stroke="#588157" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                {/* Data Points */}
                {points.map((p, idx) => (
                  <g key={idx} className="group cursor-pointer">
                    <circle cx={p.x} cy={p.y} r="4" fill="#ffffff" stroke="#588157" strokeWidth="2" className="hover:scale-150 transition-transform" />
                    {/* Tooltip on hover */}
                    <g className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <rect x={p.x - 22} y={p.y - 22} width="44" height="15" rx="3" fill="#1e293b" />
                      <text x={p.x} y={p.y - 12} fill="#ffffff" className="text-[8px] font-mono font-bold" textAnchor="middle">
                        ${p.val.toFixed(2)}
                      </text>
                    </g>
                  </g>
                ))}
              </svg>
            </div>

            {/* Explanatory notes */}
            <div className="mt-4 flex gap-2 p-3 bg-red-50/40 border border-red-100/60 rounded-xl">
              <Info className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-gray-500 leading-relaxed font-medium">
                Pricing represents global standard shipping grades. Spot cargo can diverge by up to 15% depending on specific certifications (such as <strong>Organic Fair Trade</strong> or <strong>Rainforest Alliance</strong> status).
              </p>
            </div>

          </div>
        </div>

        {/* RIGHT: Compliance Oracle & Target country demand forecast */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-xs flex flex-col h-full">
            <h3 className="text-xs font-black text-gray-900 flex items-center gap-1.5 font-mono uppercase border-b border-gray-55 pb-3 mb-4">
              <Sparkles className="w-4 h-4 text-red-500 animate-pulse" />
              <span>AI Target Compliance Oracle</span>
            </h3>

            {/* Input selectors */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-extrabold uppercase font-mono text-gray-400 block">Select Crop Lot:</label>
                <select
                  value={targetCrop}
                  onChange={(e) => setTargetCrop(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs text-gray-700 font-bold focus:outline-hidden"
                >
                  <option value="Arabica Coffee">☕ Arabica Coffee</option>
                  <option value="Dried Ginger Rhizomes">🍂 Sun-Dried Ginger</option>
                  <option value="Durum Wheat">🌾 Durum Wheat</option>
                  <option value="Vanilla Pods">🌱 Madagascar Vanilla</option>
                  <option value="Cocoa Beans">🍫 Fine-Flavor Cocoa</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-extrabold uppercase font-mono text-gray-400 block">Importing Country:</label>
                <select
                  value={targetCountry}
                  onChange={(e) => setTargetCountry(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs text-gray-700 font-bold focus:outline-hidden"
                >
                  <option value="European Union">🇪🇺 European Union</option>
                  <option value="United States of America">🇺🇸 United States (FDA)</option>
                  <option value="China">🇨🇳 China (Customs GACC)</option>
                  <option value="Japan">🇯🇵 Japan (MAFF)</option>
                  <option value="United Kingdom">🇬🇧 United Kingdom</option>
                </select>
              </div>
            </div>

            {/* Consult Trigger */}
            <button
              onClick={handleConsultOracle}
              disabled={isConsulting}
              className="w-full py-2.5 bg-red-500 hover:bg-red-600 text-white font-extrabold text-xs rounded-xl shadow-md shadow-red-100 hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isConsulting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Compiling Intelligence Briefing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate AI Market Trade Report</span>
                </>
              )}
            </button>

            {/* Results Area */}
            <div className="mt-4 flex-1">
              {oracleReport ? (
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-xs space-y-2 leading-relaxed text-gray-700 text-left overflow-y-auto max-h-[250px] animate-in fade-in duration-300 shadow-inner">
                  {oracleReport.split('\n').map((paragraph, idx) => {
                    if (paragraph.startsWith('###')) {
                      return <h4 key={idx} className="font-extrabold text-sm text-red-600 mt-3 first:mt-0 font-mono">{paragraph.replace('###', '')}</h4>;
                    }
                    if (paragraph.startsWith('*')) {
                      return <p key={idx} className="italic text-gray-500 font-medium text-[11px] mt-2">{paragraph.replace('*', '')}</p>;
                    }
                    return <p key={idx} className="text-[11px] font-medium">{paragraph}</p>;
                  })}
                </div>
              ) : (
                <div className="border border-dashed border-gray-200 rounded-xl p-6 text-center text-gray-400 h-full flex flex-col justify-center items-center min-h-[150px]">
                  <Database className="w-7 h-7 text-gray-300 mb-1.5" />
                  <p className="text-[10px] uppercase font-mono font-bold">Oracle Ready</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Select variables above and trigger to analyze real-time GACC/FDA limits, tariffs, phytosanitary requirements, and trade barriers.</p>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
