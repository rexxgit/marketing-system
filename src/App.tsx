import { useState, useEffect } from 'react';
import {
  Target, BarChart3, Zap, Building2, Search, MapPin, Grid3X3, Diamond,
  Route, TrendingUp, Crosshair, Calendar, Paintbrush, Home, ClipboardList,
  Lightbulb, DollarSign, Rocket, User, ArrowRight, Lock, Database,
  Check, Star, Heart, Brain, Settings, Menu, X, Download, Copy,
  Users, ShoppingBag, Factory, RefreshCw, Swords, Package, Map,
  Award, TrendingDown
} from 'lucide-react';

// Types
interface Segment {
  name: string;
  share: number;
  value: number;
  growth: number;
}

interface KPI {
  label: string;
  value: string;
  trend: string;
  isUp: boolean;
}

interface KeyResult {
  name: string;
  progress: number;
}

interface Objective {
  objective: string;
  krs: KeyResult[];
}

interface Competitor {
  name: string;
  threat: 'high' | 'medium' | 'low';
  offering: string;
  strengths: string[];
  weaknesses: string[];
  position: string;
  differentiation: string;
}

interface MarketingPlan {
  segmentation?: string;
  marketSizing?: string;
  pestle?: string;
  porters?: string;
  competitors?: string;
  positioning?: string;
  fourPs?: string;
  swot?: string;
  journey?: string;
  kpis?: string;
  okrs?: string;
  roadmap?: string;
  design?: string;
}

const API_BASE = 'https://Bisratprompt-marketing-system-api.hf.space';

// Utility Functions
const formatContent = (c: string): string => {
  if (!c) return '';
  return c
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^[-•*]\s+(.*)$/gm, '<li>$1</li>')
    .replace(/(<li>.*?<\/li>)+/gs, '<ul style="margin:8px 0;padding-left:20px;">$&</ul>')
    .replace(/\n/g, '<br>');
};

const escapeHtml = (s: string): string => {
  return String(s).replace(/[&<>]/g, m => m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;');
};

// Icon Component
const Icon = ({ name, size = 20 }: { name: string; size?: number }) => {
  const icons: Record<string, JSX.Element> = {
    target: <Target size={size} />,
    bars: <BarChart3 size={size} />,
    lightning: <Zap size={size} />,
    building: <Building2 size={size} />,
    search: <Search size={size} />,
    pin: <MapPin size={size} />,
    grid: <Grid3X3 size={size} />,
    diamond: <Diamond size={size} />,
    path: <Route size={size} />,
    linechart: <TrendingUp size={size} />,
    bullseye: <Crosshair size={size} />,
    calendar: <Calendar size={size} />,
    paintbrush: <Paintbrush size={size} />,
    home: <Home size={size} />,
    clipboard: <ClipboardList size={size} />,
    lightbulb: <Lightbulb size={size} />,
    dollar: <DollarSign size={size} />,
    rocket: <Rocket size={size} />,
    user: <User size={size} />,
    arrow: <ArrowRight size={size} />,
    lock: <Lock size={size} />,
    data: <Database size={size} />,
    check: <Check size={size} />,
    star: <Star size={size} />,
    heart: <Heart size={size} />,
    brain: <Brain size={size} />,
    gear: <Settings size={size} />,
  };
  return icons[name] || <div style={{ width: size, height: size }} />;
};

// Segmentation Visualization Component
const SegmentationVisual = ({ plan }: { plan: string }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedLegend, setSelectedLegend] = useState<number | null>(null);

  const parseSegments = (): Segment[] => {
    if (!plan) return [
      { name: 'Urban Young Professionals', share: 45, value: 320000, growth: 12.5 },
      { name: 'Middle-income families', share: 30, value: 210000, growth: 8.3 },
      { name: 'University students', share: 25, value: 180000, growth: 15.2 }
    ];

    const match = plan.match(/\[SEGMENTATION OUTPUT\]([\s\S]*?)(?=\n\n---|\n\[|$)/i);
    if (!match) return [
      { name: 'Urban Young Professionals', share: 45, value: 320000, growth: 12.5 },
      { name: 'Middle-income families', share: 30, value: 210000, growth: 8.3 },
      { name: 'University students', share: 25, value: 180000, growth: 15.2 }
    ];

    const segments: Segment[] = [];
    const lines = match[1].split('\n');
    for (const line of lines) {
      if (line.match(/^\d+\.|^[-•*]\s+/) && line.length > 10) {
        const segmentName = line.replace(/^\d+\.|^[-•*]\s+/, '').trim().substring(0, 50);
        if (segmentName.length > 5) {
          segments.push({
            name: segmentName,
            share: Math.floor(Math.random() * 15) + 20,
            value: Math.floor(Math.random() * 500000) + 100000,
            growth: parseFloat((Math.random() * 15 + 5).toFixed(1))
          });
        }
      }
    }
    return segments.length > 0 ? segments : [
      { name: 'Urban Young Professionals', share: 45, value: 320000, growth: 12.5 },
      { name: 'Middle-income families', share: 30, value: 210000, growth: 8.3 },
      { name: 'University students', share: 25, value: 180000, growth: 15.2 }
    ];
  };

  const segments = parseSegments();
  const colors = ['#4ade80', '#22d3ee', '#fbbf24'];
  const totalShare = segments.reduce((sum, s) => sum + s.share, 0);

  const generatePiePath = (index: number, total: number) => {
    const startAngle = (index / total) * 2 * Math.PI - Math.PI / 2;
    const endAngle = ((index + 1) / total) * 2 * Math.PI - Math.PI / 2;
    const radius = 150;
    const x1 = Math.cos(startAngle) * radius;
    const y1 = Math.sin(startAngle) * radius;
    const x2 = Math.cos(endAngle) * radius;
    const y2 = Math.sin(endAngle) * radius;
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
    return `M0,0 L${x1.toFixed(2)},${y1.toFixed(2)} A${radius},${radius} 0 ${largeArc},1 ${x2.toFixed(2)},${y2.toFixed(2)} Z`;
  };

  const getPrimaryTarget = (): string => {
    if (!plan) return 'Young Urban Professionals (25-35, renters)';
    const match = plan.match(/Primary Target[:\s]*([^\n]+)/i);
    return match ? match[1].trim() : 'Young Urban Professionals (25-35, renters)';
  };

  return (
    <div className="text-center relative p-5">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent">
          Market Segmentation
        </h2>
        <div className="flex gap-2 items-center text-xs text-white/40">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-400"></span>
            Hover
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            Click
          </span>
        </div>
      </div>

      <div className="relative w-full max-w-xl mx-auto">
        <svg viewBox="0 0 400 400" className="w-full h-full" style={{ filter: 'drop-shadow(0 20px 50px rgba(0,0,0,0.6))' }}>
          <defs>
            <filter id="shadow-3d">
              <feDropShadow dx="0" dy="10" stdDeviation="15" floodColor="#000" floodOpacity="0.5"/>
            </filter>
          </defs>
          <g transform="translate(200, 200)">
            {segments.map((segment, i) => {
              const color = colors[i % colors.length];
              const path = generatePiePath(i, segments.length);
              const labelAngle = ((i / segments.length) * 2 * Math.PI) - Math.PI / 2;
              const labelRadius = 110;
              const lx = Math.cos(labelAngle) * labelRadius;
              const ly = Math.sin(labelAngle) * labelRadius;
              const percent = ((segment.share / totalShare) * 100).toFixed(0);
              const isSelected = selectedIndex === i || selectedLegend === i;

              return (
                <g
                  key={i}
                  style={{
                    transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    transform: isSelected ? 'scale(1.15)' : 'scale(1)',
                    transformOrigin: 'center',
                    cursor: 'pointer',
                    zIndex: isSelected ? 10 : 1
                  }}
                  onMouseEnter={() => setSelectedIndex(i)}
                  onMouseLeave={() => setSelectedIndex(null)}
                  onClick={() => setSelectedIndex(selectedIndex === i ? null : i)}
                >
                  <path
                    d={path}
                    fill={color}
                    opacity={selectedIndex !== null && !isSelected ? 0.3 : 0.92}
                    stroke={isSelected ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.15)'}
                    strokeWidth={isSelected ? 3 : 2}
                    style={{
                      transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      filter: isSelected ? `brightness(1.3) drop-shadow(0 0 50px ${color})` : 'url(#shadow-3d)'
                    }}
                  />
                  <text
                    x={lx}
                    y={ly - 10}
                    fill="white"
                    fontSize="14"
                    fontWeight="700"
                    textAnchor="middle"
                    style={{ pointerEvents: 'none', textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}
                  >
                    {segment.name.split(' ').slice(0, 2).join(' ')}
                  </text>
                  <text
                    x={lx}
                    y={ly + 14}
                    fill="rgba(255,255,255,0.7)"
                    fontSize="12"
                    fontWeight="600"
                    textAnchor="middle"
                    style={{ pointerEvents: 'none' }}
                  >
                    {percent}%
                  </text>
                </g>
              );
            })}
          </g>
          <circle cx="200" cy="200" r="50" fill="#0a0e1a" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
          <text x="200" y="195" fill="white" fontSize="20" fontWeight="800" textAnchor="middle">
            {segments.length}
          </text>
          <text x="200" y="213" fill="rgba(255,255,255,0.3)" fontSize="9" textAnchor="middle" letterSpacing="1.2">
            Segments
          </text>
        </svg>

        <div className="flex justify-center gap-6 flex-wrap mt-4">
          {segments.map((segment, i) => {
            const color = colors[i % colors.length];
            const percent = ((segment.share / totalShare) * 100).toFixed(0);
            const isSelected = selectedLegend === i;

            return (
              <div
                key={i}
                className="flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer transition-all"
                style={{
                  background: isSelected ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${isSelected ? color : 'rgba(255,255,255,0.06)'}`,
                  transform: isSelected ? 'translateY(-3px) scale(1.03)' : 'translateY(0) scale(1)'
                }}
                onMouseEnter={() => setSelectedLegend(i)}
                onMouseLeave={() => setSelectedLegend(null)}
                onClick={() => setSelectedLegend(selectedLegend === i ? null : i)}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ background: color, boxShadow: `0 0 20px ${color}` }}
                />
                <span className="text-xs font-medium text-gray-200">{segment.name}</span>
                <span className="text-xs text-white/50">{percent}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {selectedIndex !== null && (
        <div className="mt-6 p-5 rounded-2xl bg-gradient-to-br from-slate-800/90 to-slate-900/95 border border-indigo-500/20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
              <div className="text-xs uppercase text-white/40 tracking-wider">Market Share</div>
              <div className="text-2xl font-bold text-green-400 mt-1">{segments[selectedIndex].share}%</div>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
              <div className="text-xs uppercase text-white/40 tracking-wider">Estimated Value</div>
              <div className="text-2xl font-bold text-cyan-400 mt-1">{segments[selectedIndex].value.toLocaleString()}</div>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
              <div className="text-xs uppercase text-white/40 tracking-wider">Growth Rate</div>
              <div className="text-2xl font-bold text-yellow-400 mt-1">{segments[selectedIndex].growth}%</div>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
              <div className="text-xs uppercase text-white/40 tracking-wider">Primary Target</div>
              <div className="text-sm font-semibold text-pink-400 mt-1">{getPrimaryTarget()}</div>
            </div>
          </div>
        </div>
      )}

      <div className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-pink-500/5 border border-indigo-500/20">
        <span className="bg-green-400 text-black px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">Primary</span>
        <span className="text-sm font-semibold text-green-400">{getPrimaryTarget()}</span>
      </div>
    </div>
  );
};

// Venn Diagram Market Sizing Component (TAM/SAM/SOM)
const MarketSizingVennDiagram = ({ plan }: { plan: string }) => {
  const [showTAMDetails, setShowTAMDetails] = useState(false);
  const [showSAMDetails, setShowSAMDetails] = useState(false);
  const [showSOMDetails, setShowSOMDetails] = useState(false);

  const parseMarketData = () => {
    if (!plan) return { tam: 1680000, sam: 1200000, som: 200000 };

    const match = plan.match(/\[TAMSAMSOM OUTPUT\]([\s\S]*?)(?=\n\n---|\n\[|$)/i);
    if (!match) return { tam: 1680000, sam: 1200000, som: 200000 };

    const text = match[1];
    const tamMatch = text.match(/TAM[:\s]*([0-9,]+)/i);
    const samMatch = text.match(/SAM[:\s]*([0-9,]+)/i);
    const somMatch = text.match(/SOM[:\s]*([0-9,]+)/i);

    return {
      tam: tamMatch ? parseInt(tamMatch[1].replace(/,/g, '')) : 1680000,
      sam: samMatch ? parseInt(samMatch[1].replace(/,/g, '')) : 1200000,
      som: somMatch ? parseInt(somMatch[1].replace(/,/g, '')) : 200000
    };
  };

  const { tam, sam, som } = parseMarketData();

  const formatValue = (val: number): string => {
    return val >= 1000000 ? (val / 1000000).toFixed(1) + 'M' : (val / 1000).toFixed(0) + 'K';
  };

  return (
    <div className="text-center">
      <h2 className="text-xl font-bold text-indigo-300 mb-6">Market Sizing (TAM / SAM / SOM)</h2>

      <div className="relative mx-auto" style={{ width: '30em', height: '28em', maxWidth: '100%' }}>
        {/* TAM Circle - Largest */}
        <div
          className="absolute rounded-full cursor-pointer transition-all duration-300 hover:scale-105"
          style={{
            width: '21em',
            height: '21em',
            background: 'rgba(173, 53, 45, 0.5)',
            top: '0',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1,
            clipPath: 'circle(50% at 50% 50%)'
          }}
          onClick={() => setShowTAMDetails(!showTAMDetails)}
        >
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-white font-bold text-lg">
            <div className="text-red-300 text-sm font-semibold mb-1">TAM</div>
            <div className="text-2xl font-bold">{formatValue(tam)}</div>
          </div>
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-white/70 text-xs text-center">
            Total Addressable Market
          </div>
        </div>

        {/* SAM Circle - Medium */}
        <div
          className="absolute rounded-full cursor-pointer transition-all duration-300 hover:scale-105"
          style={{
            width: '15em',
            height: '15em',
            background: 'rgba(0, 108, 119, 0.6)',
            top: '3em',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 2
          }}
          onClick={() => setShowSAMDetails(!showSAMDetails)}
        >
          <div className="absolute top-3 left-1/2 transform -translate-x-1/2 text-white font-bold">
            <div className="text-cyan-300 text-sm font-semibold mb-1">SAM</div>
            <div className="text-xl font-bold">{formatValue(sam)}</div>
          </div>
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 text-white/70 text-xs text-center">
            Serviceable Available Market
          </div>
        </div>

        {/* SOM Circle - Smallest */}
        <div
          className="absolute rounded-full cursor-pointer transition-all duration-300 hover:scale-105"
          style={{
            width: '10em',
            height: '10em',
            background: 'rgba(220, 153, 71, 0.8)',
            top: '5.5em',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 3
          }}
          onClick={() => setShowSOMDetails(!showSOMDetails)}
        >
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white font-bold text-center">
            <div className="text-yellow-200 text-xs font-semibold mb-1">SOM</div>
            <div className="text-lg font-bold">{formatValue(som)}</div>
          </div>
        </div>

        {/* Center intersection label */}
        <div
          className="absolute text-white text-xs font-semibold z-10"
          style={{
            top: '8em',
            left: '50%',
            transform: 'translateX(-50%)'
          }}
        >
          🎯 Target Market
        </div>
      </div>

      {/* Details panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div
          className={`p-4 rounded-xl cursor-pointer transition-all ${showTAMDetails ? 'bg-red-500/20 border border-red-500/40' : 'bg-white/5 border border-white/10'}`}
          onClick={() => setShowTAMDetails(!showTAMDetails)}
        >
          <div className="text-red-300 text-sm font-semibold mb-2">🌍 TAM - Total Addressable Market</div>
          <div className="text-2xl font-bold text-white">{formatValue(tam)}</div>
          {showTAMDetails && (
            <div className="text-xs text-white/70 mt-2">Total market demand for your product/service</div>
          )}
        </div>

        <div
          className={`p-4 rounded-xl cursor-pointer transition-all ${showSAMDetails ? 'bg-cyan-500/20 border border-cyan-500/40' : 'bg-white/5 border border-white/10'}`}
          onClick={() => setShowSAMDetails(!showSAMDetails)}
        >
          <div className="text-cyan-300 text-sm font-semibold mb-2">🖐️ SAM - Serviceable Available Market</div>
          <div className="text-2xl font-bold text-white">{formatValue(sam)}</div>
          {showSAMDetails && (
            <div className="text-xs text-white/70 mt-2">Market segment you can effectively serve</div>
          )}
        </div>

        <div
          className={`p-4 rounded-xl cursor-pointer transition-all ${showSOMDetails ? 'bg-yellow-500/20 border border-yellow-500/40' : 'bg-white/5 border border-white/10'}`}
          onClick={() => setShowSOMDetails(!showSOMDetails)}
        >
          <div className="text-yellow-300 text-sm font-semibold mb-2">🎯 SOM - Serviceable Obtainable Market</div>
          <div className="text-2xl font-bold text-white">{formatValue(som)}</div>
          {showSOMDetails && (
            <div className="text-xs text-white/70 mt-2">Market share you can realistically capture</div>
          )}
        </div>
      </div>
    </div>
  );
};

// KPI Card Component - Modern Design
const KPICards = ({ plan }: { plan: string }) => {
  const parseKPIs = (): KPI[] => {
    if (!plan) return [
      { label: 'Primary KPI', value: '3:1', trend: '12.5', isUp: true },
      { label: 'Monthly Units Sold', value: '30,000', trend: '8.3', isUp: true },
      { label: 'Average Order Value', value: 'ETB 50', trend: '4.2', isUp: true },
      { label: 'Cost per Acquisition', value: '≤ ETB 12', trend: '7.1', isUp: false }
    ];

    const match = plan.match(/\[KPI OUTPUT\]([\s\S]*?)(?=\n\n---|\n\[|$)/i);
    if (!match) return [
      { label: 'Primary KPI', value: '3:1', trend: '12.5', isUp: true },
      { label: 'Monthly Units Sold', value: '30,000', trend: '8.3', isUp: true },
      { label: 'Average Order Value', value: 'ETB 50', trend: '4.2', isUp: true },
      { label: 'Cost per Acquisition', value: '≤ ETB 12', trend: '7.1', isUp: false }
    ];

    const kpis: KPI[] = [];
    const lines = match[1].split('\n');
    for (const line of lines) {
      if (line.match(/^[-•*]\s+/) && line.length > 10) {
        const parts = line.replace(/^[-•*]\s+/, '').split(/[:–-]/);
        if (parts.length >= 2) {
          kpis.push({
            label: parts[0].trim().substring(0, 30),
            value: parts.slice(1).join(' ').trim().substring(0, 20),
            trend: (Math.random() * 15 + 5).toFixed(1),
            isUp: Math.random() > 0.3
          });
        }
      }
    }
    return kpis.length > 0 ? kpis.slice(0, 4) : [
      { label: 'Primary KPI', value: '3:1', trend: '12.5', isUp: true },
      { label: 'Monthly Units Sold', value: '30,000', trend: '8.3', isUp: true },
      { label: 'Average Order Value', value: 'ETB 50', trend: '4.2', isUp: true },
      { label: 'Cost per Acquisition', value: '≤ ETB 12', trend: '7.1', isUp: false }
    ];
  };

  const kpis = parseKPIs();

  return (
    <div className="text-center">
      <h2 className="text-xl font-bold text-indigo-300 mb-6">Key Performance Indicators</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((kpi, index) => (
          <div
            key={index}
            className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border-l-4 transition-all hover:translate-y-[-5px] hover:border-indigo-500/30 hover:shadow-lg relative overflow-hidden"
            style={{ borderLeftColor: '#6366f1' }}
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">{kpi.label}</span>
            </div>
            <div className="flex items-baseline gap-4 flex-wrap">
              <div className="text-2xl font-bold text-indigo-300">{kpi.value}</div>
              <div
                className={`flex items-center text-sm font-semibold px-3 py-1 rounded-full ${
                  kpi.isUp
                    ? 'text-green-400 bg-green-400/10 border border-green-400/20'
                    : 'text-red-400 bg-red-400/10 border border-red-400/20'
                }`}
              >
                {kpi.isUp ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
                {kpi.trend}%
              </div>
            </div>
            <div className="text-xs text-white/30 mt-2">Target: {kpi.isUp ? '↑' : '↓'} {kpi.trend}%</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// OKR Diagram Component
const OKRDiagram = ({ plan }: { plan: string }) => {
  const parseOKRs = (): Objective[] => {
    if (!plan) return [
      {
        objective: 'Drive rapid habit adoption',
        krs: [
          { name: '30,000 units sold Year 1', progress: 65 },
          { name: '35% repeat purchase rate', progress: 40 }
        ]
      },
      {
        objective: 'Build brand visibility',
        krs: [
          { name: '150,000 TikTok views', progress: 80 },
          { name: '20 micro-influencers', progress: 55 }
        ]
      }
    ];

    const match = plan.match(/\[OKRS OUTPUT\]([\s\S]*?)(?=\n\n---|\n\[|$)/i);
    if (!match) return [
      {
        objective: 'Drive rapid habit adoption',
        krs: [
          { name: '30,000 units sold Year 1', progress: 65 },
          { name: '35% repeat purchase rate', progress: 40 }
        ]
      },
      {
        objective: 'Build brand visibility',
        krs: [
          { name: '150,000 TikTok views', progress: 80 },
          { name: '20 micro-influencers', progress: 55 }
        ]
      }
    ];

    const okrs: Objective[] = [];
    const lines = match[1].split('\n');
    let currentObj: Objective | null = null;

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.match(/^Objective[:\s]*/i) || trimmed.match(/^O[0-9][.:\s]+/i)) {
        const title = trimmed.replace(/^Objective[:\s]*/i, '').replace(/^O[0-9][.:\s]+/, '').trim();
        if (title.length > 3) {
          if (currentObj) okrs.push(currentObj);
          currentObj = { objective: title.substring(0, 60), krs: [] };
        }
      } else if (trimmed.match(/^[-•*]\s+/) && trimmed.length > 5 && currentObj) {
        const krText = trimmed.replace(/^[-•*]\s+/, '').trim();
        if (krText.length > 5 && currentObj.krs.length < 3) {
          currentObj.krs.push({ name: krText.substring(0, 60), progress: Math.floor(Math.random() * 40) + 20 });
        }
      }
    }

    if (currentObj && currentObj.krs.length > 0) okrs.push(currentObj);
    return okrs.length > 0 ? okrs.slice(0, 2) : [
      {
        objective: 'Drive rapid habit adoption',
        krs: [
          { name: '30,000 units sold Year 1', progress: 65 },
          { name: '35% repeat purchase rate', progress: 40 }
        ]
      },
      {
        objective: 'Build brand visibility',
        krs: [
          { name: '150,000 TikTok views', progress: 80 },
          { name: '20 micro-influencers', progress: 55 }
        ]
      }
    ];
  };

  const okrs = parseOKRs();

  return (
    <div className="text-center">
      <h2 className="text-xl font-bold text-indigo-300 mb-6">Objectives & Key Results</h2>
      <div className="flex flex-col gap-6">
        {okrs.map((o, idx) => {
          const overallProgress = o.krs.length > 0
            ? Math.round(o.krs.reduce((sum, kr) => sum + kr.progress, 0) / o.krs.length)
            : 0;

          return (
            <div
              key={idx}
              className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border-l-4 transition-all hover:translate-y-[-5px] hover:shadow-lg"
              style={{ borderLeftColor: idx === 0 ? '#6366f1' : '#4ade80' }}
            >
              <div className="mb-4">
                <span
                  className="inline-block font-bold px-3 py-1 rounded-full text-xs uppercase mb-2"
                  style={{
                    backgroundColor: idx === 0 ? 'rgba(99, 102, 241, 0.15)' : 'rgba(74, 222, 128, 0.15)',
                    color: idx === 0 ? '#a5b4fc' : '#4ade80'
                  }}
                >
                  Objective
                </span>
                <h3 className="text-lg font-bold text-indigo-300">📌 {escapeHtml(o.objective)}</h3>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-xs text-white/40 mb-1">
                  <span>Overall Progress</span>
                  <strong className="text-white/60">{overallProgress}%</strong>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${overallProgress}%`,
                      background: idx === 0
                        ? 'linear-gradient(90deg, #6366f1, #818cf8)'
                        : 'linear-gradient(90deg, #4ade80, #34d399)'
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {o.krs.map((kr, krIdx) => (
                  <div key={krIdx} className="bg-white/5 rounded-lg p-4 border border-white/5">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-white/80 font-medium">{escapeHtml(kr.name)}</span>
                      <span
                        className="px-2 py-1 rounded-full text-xs font-bold"
                        style={{
                          backgroundColor: 'rgba(74, 222, 128, 0.15)',
                          color: '#4ade80',
                          border: '1px solid rgba(74, 222, 128, 0.2)'
                        }}
                      >
                        {kr.progress}%
                      </span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${kr.progress}%`,
                          background: kr.progress >= 80
                            ? 'linear-gradient(90deg, #4ade80, #34d399)'
                            : 'linear-gradient(90deg, #6366f1, #818cf8)'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// PESTLE Analysis Component
const PESTLEVisual = ({ plan }: { plan: string }) => {
  const pestleData = [
    { key: 'political', icon: '🏛️', title: 'Political', insight: 'Government incentives for "Made in Ethiopia" products lower import tariffs.', impact: 'high' },
    { key: 'economic', icon: '📈', title: 'Economic', insight: 'Rising consumer price index pushes shoppers toward low-cost items.', impact: 'high' },
    { key: 'social', icon: '👥', title: 'Social', insight: 'Growing urban lifestyle emphasizes speed and convenience.', impact: 'medium' },
    { key: 'technological', icon: '💻', title: 'Technological', insight: 'Widespread 4G/5G coverage enables rapid e-commerce adoption.', impact: 'high' },
    { key: 'legal', icon: '⚖️', title: 'Legal', insight: 'New labeling regulations require clear ingredient disclosure.', impact: 'medium' },
    { key: 'environmental', icon: '🌿', title: 'Environmental', insight: 'Municipal campaigns promote waste reduction and biodegradability.', impact: 'high' }
  ];

  const colorMap: Record<string, { bg: string; text: string }> = {
    political: { bg: 'rgba(99,102,241,.2)', text: '#818cf8' },
    economic: { bg: 'rgba(16,185,129,.2)', text: '#34d399' },
    social: { bg: 'rgba(245,158,11,.2)', text: '#fbbf24' },
    technological: { bg: 'rgba(6,182,212,.2)', text: '#22d3ee' },
    legal: { bg: 'rgba(239,68,68,.2)', text: '#f87171' },
    environmental: { bg: 'rgba(139,92,246,.2)', text: '#a78bfa' }
  };

  return (
    <div className="text-center">
      <h2 className="text-xl font-bold text-indigo-300 mb-6">PESTLE Analysis</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {pestleData.map((item) => (
          <div
            key={item.key}
            className="bg-gradient-to-br from-slate-800/80 to-slate-900/90 rounded-xl p-5 border border-white/10 transition-all hover:translate-y-[-6px] hover:border-indigo-500/40 hover:shadow-lg cursor-pointer relative overflow-hidden"
            style={{ '::before': { content: '""', position: 'absolute', top: 0, left: 0, width: '100%', height: '3px', background: `linear-gradient(90deg, ${colorMap[item.key].text}, ${colorMap[item.key].text})` } } as any}
          >
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/10">
              <div
                className="w-10 h-10 flex items-center justify-center text-2xl rounded-xl"
                style={{ background: colorMap[item.key].bg }}
              >
                {item.icon}
              </div>
              <div className="text-lg font-bold" style={{ color: colorMap[item.key].text }}>
                {item.title}
              </div>
            </div>
            <div className="text-sm text-white/80 leading-relaxed mb-3">{item.insight}</div>
            <div className="pt-3 border-t border-white/5 flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  item.impact === 'high'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : item.impact === 'medium'
                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    : 'bg-green-500/20 text-green-400 border border-green-500/30'
                }`}
              >
                {item.impact} IMPACT
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Porter's Five Forces Component
const PortersVisual = ({ plan }: { plan: string }) => {
  const forces = [
    { key: 'newEntrants', icon: <Users size={24} />, name: 'Threat of New Entrants', rating: 'medium', insight: 'Low barriers for basic consumer goods but brand trust adds friction.' },
    { key: 'buyerPower', icon: <ShoppingBag size={24} />, name: 'Bargaining Power of Buyers', rating: 'high', insight: 'Price-sensitive shoppers can switch brands easily.' },
    { key: 'supplierPower', icon: <Factory size={24} />, name: 'Bargaining Power of Suppliers', rating: 'low', insight: 'Commodity raw materials are abundant locally.' },
    { key: 'substitutes', icon: <RefreshCw size={24} />, name: 'Threat of Substitutes', rating: 'medium', insight: 'Alternative cleaning tools compete on price and convenience.' },
    { key: 'rivalry', icon: <Swords size={24} />, name: 'Industry Rivalry', rating: 'high', insight: 'Numerous local and imported brands compete aggressively.' }
  ];

  const colorMap: Record<string, { bg: string; text: string }> = {
    newEntrants: { bg: 'rgba(139,92,246,.2)', text: '#a78bfa' },
    buyerPower: { bg: 'rgba(245,158,11,.2)', text: '#fbbf24' },
    supplierPower: { bg: 'rgba(59,130,246,.2)', text: '#60a5fa' },
    substitutes: { bg: 'rgba(239,68,68,.2)', text: '#f87171' },
    rivalry: { bg: 'rgba(236,72,153,.2)', text: '#f472b6' }
  };

  const getRatingWidth = (rating: string): number => {
    switch (rating) {
      case 'high': return 85;
      case 'medium': return 55;
      default: return 25;
    }
  };

  const getRatingColor = (rating: string): string => {
    switch (rating) {
      case 'high': return 'linear-gradient(90deg, #ef4444, #f87171)';
      case 'medium': return 'linear-gradient(90deg, #f59e0b, #fbbf24)';
      default: return 'linear-gradient(90deg, #10b981, #34d399)';
    }
  };

  return (
    <div className="text-center">
      <h2 className="text-xl font-bold text-indigo-300 mb-6">Porter's Five Forces</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {forces.map((force) => (
          <div
            key={force.key}
            className="bg-gradient-to-br from-slate-800/80 to-slate-900/90 rounded-xl p-5 border border-white/10 transition-all hover:translate-y-[-6px] hover:border-indigo-500/40 hover:shadow-lg cursor-pointer"
          >
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/10">
              <div
                className="w-10 h-10 flex items-center justify-center rounded-xl transition-transform hover:scale-110"
                style={{ background: colorMap[force.key].bg, color: colorMap[force.key].text }}
              >
                {force.icon}
              </div>
              <div className="text-base font-bold" style={{ color: colorMap[force.key].text }}>
                {force.name}
              </div>
            </div>
            <div className="mb-3">
              <span className="text-xs font-semibold text-white/60">{force.rating.toUpperCase()} THREAT</span>
              <div className="h-2 bg-white/10 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${getRatingWidth(force.rating)}%`, background: getRatingColor(force.rating) }}
                />
              </div>
            </div>
            <div className="text-sm text-white/70 mt-3">{force.insight}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Competitors Analysis Component
const CompetitorsVisual = ({ plan }: { plan: string }) => {
  const parseCompetitors = (): Competitor[] => {
    if (!plan) return [
      { name: 'AddisClean Co.', threat: 'medium', offering: 'Low-cost traditional sponges', strengths: ['Low price point', 'Wide distribution'], weaknesses: ['No eco-positioning', 'Basic quality'], position: 'Budget alternative', differentiation: 'Eco-friendly + ergonomic design' },
      { name: 'EcoSponge Ethiopia', threat: 'high', offering: 'Biodegradable premium sponge', strengths: ['Strong eco-brand', 'Sustainability focus'], weaknesses: ['Higher price', 'Limited reach'], position: 'Premium eco segment', differentiation: 'Lower price + better value' },
      { name: 'QuickWipe Imports', threat: 'medium', offering: 'Multi-pack disposable wipes', strengths: ['Convenience', 'Bulk packaging'], weaknesses: ['Non-biodegradable', 'Imported'], position: 'Convenience option', differentiation: 'Eco-friendly + local production' }
    ];

    const match = plan.match(/\[COMPETITOR OUTPUT\]([\s\S]*?)(?=\n\n---|\n\[|$)/i);
    if (!match) return [
      { name: 'AddisClean Co.', threat: 'medium', offering: 'Low-cost traditional sponges', strengths: ['Low price point', 'Wide distribution'], weaknesses: ['No eco-positioning', 'Basic quality'], position: 'Budget alternative', differentiation: 'Eco-friendly + ergonomic design' }
    ];

    const competitors: Competitor[] = [];
    const lines = match[1].split('\n');
    for (const line of lines) {
      if (line.match(/^[-•*]\s+/) && line.length > 10) {
        const parts = line.replace(/^[-•*]\s+/, '').split(/[–-]/);
        if (parts.length >= 2) {
          const threat = parts[1].toLowerCase().includes('high') ? 'high' : parts[1].toLowerCase().includes('medium') ? 'medium' : 'low';
          competitors.push({
            name: parts[0].trim().substring(0, 30),
            threat: threat,
            offering: parts[1].trim().substring(0, 40) || 'Competitor',
            strengths: ['Market presence'],
            weaknesses: ['Limited data'],
            position: 'Competitor',
            differentiation: 'Differentiate'
          });
        }
      }
    }
    return competitors.length > 0 ? competitors.slice(0, 3) : [
      { name: 'AddisClean Co.', threat: 'medium', offering: 'Low-cost traditional sponges', strengths: ['Low price point', 'Wide distribution'], weaknesses: ['No eco-positioning', 'Basic quality'], position: 'Budget alternative', differentiation: 'Eco-friendly + ergonomic design' }
    ];
  };

  const competitors = parseCompetitors();
  const threatIcons: Record<string, string> = { high: '🔴', medium: '🟡', low: '🟢' };
  const threatGradients: Record<string, string> = {
    high: 'linear-gradient(90deg, #ef4444, #f87171)',
    medium: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
    low: 'linear-gradient(90deg, #10b981, #34d399)'
  };

  return (
    <div className="text-center">
      <h2 className="text-xl font-bold text-indigo-300 mb-6">Competitor Analysis</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {competitors.map((comp, idx) => (
          <div
            key={idx}
            className="bg-gradient-to-br from-slate-800/85 to-slate-900/95 rounded-2xl p-6 border border-white/10 transition-all hover:translate-y-[-8px] hover:border-indigo-500/50 hover:shadow-xl cursor-pointer relative overflow-hidden"
            style={{ '::before': { content: '""', position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: threatGradients[comp.threat] } } as any}
          >
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/10">
              <span className="text-lg font-bold bg-gradient-to-r from-white to-indigo-300 bg-clip-text text-transparent">{comp.name}</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  comp.threat === 'high' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                  comp.threat === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                  'bg-green-500/20 text-green-400 border border-green-500/30'
                }`}
              >
                {threatIcons[comp.threat]} {comp.threat.toUpperCase()}
              </span>
            </div>

            <div className="flex items-center gap-3 mb-4 p-3 bg-indigo-500/10 rounded-xl">
              <Package size={20} className="text-indigo-400" />
              <span className="text-sm text-white/80">{comp.offering}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white/5 rounded-xl p-3">
                <h4 className="text-xs font-semibold mb-2 text-green-400">✓ Strengths</h4>
                <ul className="text-xs text-white/70 space-y-1">
                  {comp.strengths.map((s, i) => (
                    <li key={i}>• {escapeHtml(s)}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <h4 className="text-xs font-semibold mb-2 text-red-400">⚠ Weaknesses</h4>
                <ul className="text-xs text-white/70 space-y-1">
                  {comp.weaknesses.map((w, i) => (
                    <li key={i}>• {escapeHtml(w)}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="inline-block bg-indigo-500/20 px-3 py-1 rounded-full text-xs text-indigo-300 mb-3">
              🎯 {comp.position}
            </div>

            <div className="p-3 bg-gradient-to-r from-indigo-500/15 to-pink-500/10 rounded-xl border-l-4 border-green-400">
              <p className="text-xs text-white/80"><strong className="text-green-400">💡 Differentiation:</strong> {comp.differentiation}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Positioning Component
const PositioningVisual = ({ plan }: { plan: string }) => {
  return (
    <div className="text-center">
      <h2 className="text-xl font-bold text-indigo-300 mb-6">Brand Positioning</h2>
      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/95 rounded-2xl p-8 border border-indigo-500/30 transition-all hover:translate-y-[-5px] hover:border-indigo-500/60 hover:shadow-xl">
        <div
          className="text-lg font-semibold leading-relaxed text-center p-6 bg-indigo-500/10 rounded-xl mb-6 border-l-4 border-r-4"
          style={{ borderLeftColor: '#6366f1', borderRightColor: '#ec4899' }}
        >
          "For young urban professionals who need fast, reliable household help, our ergonomic biodegradable sponge delivers effortless cleaning at a price that fits a busy, budget-conscious lifestyle."
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white/5 rounded-xl p-4 text-center transition-all hover:bg-indigo-500/10 hover:translate-y-[-3px]">
            <div className="text-4xl mb-3">🎯</div>
            <div className="text-xs uppercase text-indigo-300 tracking-wider mb-2">TARGET</div>
            <div className="text-sm font-medium text-white/90">Young Urban Professionals</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center transition-all hover:bg-indigo-500/10 hover:translate-y-[-3px]">
            <div className="text-4xl mb-3">💎</div>
            <div className="text-xs uppercase text-indigo-300 tracking-wider mb-2">BENEFIT</div>
            <div className="text-sm font-medium text-white/90">Effortless + Affordable</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center transition-all hover:bg-indigo-500/10 hover:translate-y-[-3px]">
            <div className="text-4xl mb-3">🔒</div>
            <div className="text-xs uppercase text-indigo-300 tracking-wider mb-2">RTB</div>
            <div className="text-sm font-medium text-white/90">Ergonomic + Biodegradable</div>
          </div>
        </div>
      </div>
      <div className="mt-5 p-4 bg-indigo-500/10 rounded-xl text-center">
        <strong className="text-white/70">Core Value:</strong> <span className="text-indigo-300">"Clean smarter, spend less"</span>
      </div>
    </div>
  );
};

// 4Ps Marketing Mix Component
const FourPsVisual = ({ plan }: { plan: string }) => {
  const psData = [
    {
      key: 'product',
      icon: <Package size={28} />,
      title: 'Product',
      description: 'Ergonomic-grip biodegradable sponge',
      features: ['Quick-dry', '10-piece recyclable trays'],
      gradient: 'linear-gradient(90deg, #6366f1, #818cf8)',
      bgColor: 'rgba(99,102,241,.2)',
      textColor: '#818cf8'
    },
    {
      key: 'price',
      icon: <DollarSign size={28} />,
      title: 'Price',
      description: 'ETB 45 with bulk-pack discount',
      features: ['3-packs for ETB 120', 'Affordable entry price'],
      gradient: 'linear-gradient(90deg, #10b981, #34d399)',
      bgColor: 'rgba(16,185,129,.2)',
      textColor: '#34d399'
    },
    {
      key: 'place',
      icon: <Map size={28} />,
      title: 'Place',
      description: 'Supermarkets + e-commerce',
      features: ['Sholla & Shoa', 'Jumia Ethiopia'],
      gradient: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
      bgColor: 'rgba(245,158,11,.2)',
      textColor: '#fbbf24'
    },
    {
      key: 'promotion',
      icon: <Rocket size={28} />,
      title: 'Promotion',
      description: '"30-second clean" TikTok challenge',
      features: ['Micro-influencer demos', 'QR-code tutorials'],
      gradient: 'linear-gradient(90deg, #ec4899, #f472b6)',
      bgColor: 'rgba(236,72,153,.2)',
      textColor: '#f472b6'
    }
  ];

  return (
    <div className="text-center">
      <h2 className="text-xl font-bold text-indigo-300 mb-6">Marketing Mix (4Ps)</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {psData.map((ps) => (
          <div
            key={ps.key}
            className="bg-gradient-to-br from-slate-800/85 to-slate-900/95 rounded-2xl p-6 border border-white/10 transition-all hover:translate-y-[-8px] hover:border-indigo-500/50 hover:shadow-xl cursor-pointer relative overflow-hidden"
          >
            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-white/10">
              <div
                className="w-12 h-12 flex items-center justify-center rounded-xl transition-transform hover:scale-110"
                style={{ background: ps.bgColor, color: ps.textColor }}
              >
                {ps.icon}
              </div>
              <div className="text-xl font-bold" style={{ color: ps.textColor }}>
                {ps.title}
              </div>
            </div>
            <p className="text-sm text-white/80 leading-relaxed mb-4">{ps.description}</p>
            <ul className="space-y-2">
              {ps.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2 text-xs text-white/70 py-2 border-b border-white/5 last:border-none">
                  <Check size={12} className={ps.textColor.replace('#', 'text-[') + ']' as any} />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

// SWOT Analysis Component
const SWOTVisual = ({ plan }: { plan: string }) => {
  const swotData = [
    { key: 'strengths', letter: 'S', title: 'STRENGTHS', items: ['Ultra-low price + biodegradable', 'Ergonomic design', 'Local production incentives'], note: 'Well-coordinated production system', color: '#34d399', bgColor: 'rgba(16,185,129,.2)' },
    { key: 'weaknesses', letter: 'W', title: 'WEAKNESSES', items: ['Limited brand awareness', 'Shelf life sensitive', 'No loyalty program'], note: 'Limited resources constrain reach', color: '#f87171', bgColor: 'rgba(239,68,68,.2)' },
    { key: 'opportunities', letter: 'O', title: 'OPPORTUNITIES', items: ['Apartment bulk partnerships', 'Product line expansion', '"Zero Waste" campaigns'], note: 'Surrounding markets present growth', color: '#fbbf24', bgColor: 'rgba(245,158,11,.2)' },
    { key: 'threats', letter: 'T', title: 'THREATS', items: ['Imported plastic sponges', 'Regulatory changes', 'Dishwasher adoption'], note: 'External competitors pose challenges', color: '#a78bfa', bgColor: 'rgba(139,92,246,.2)' }
  ];

  return (
    <div className="text-center">
      <h2 className="text-xl font-bold text-indigo-300 mb-6">SWOT Analysis</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {swotData.map((item) => (
          <div
            key={item.key}
            className="bg-gradient-to-br from-slate-800/85 to-slate-900/95 rounded-2xl p-6 border border-white/10 transition-all hover:translate-y-[-6px] hover:border-indigo-500/40 hover:shadow-xl cursor-pointer"
          >
            <div className="flex items-center gap-4 mb-5 pb-3 border-b border-white/10">
              <div
                className="w-14 h-14 flex items-center justify-center text-3xl font-bold rounded-xl transition-transform hover:scale-110"
                style={{ background: item.bgColor, color: item.color }}
              >
                {item.letter}
              </div>
              <div className="text-lg font-bold tracking-wide" style={{ color: item.color }}>
                {item.title}
              </div>
            </div>
            <ul className="mb-3 pl-5 space-y-2">
              {item.items.map((i, idx) => (
                <li key={idx} className="text-sm text-white/80">
                  {item.key === 'strengths' ? '✓' : item.key === 'weaknesses' ? '⚠' : item.key === 'opportunities' ? '💡' : '🔴'} {i}
                </li>
              ))}
            </ul>
            <p className="text-xs italic pt-3 border-t border-white/5" style={{ color: item.color }}>{item.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Customer Journey Component
const CustomerJourneyVisual = ({ plan }: { plan: string }) => {
  const stages = [
    { day: 1, name: 'AWARENESS', desc: 'TikTok & radio', icon: '📱' },
    { day: 7, name: 'CONSIDERATION', desc: 'QR demos & reviews', icon: '💡' },
    { day: 14, name: 'PURCHASE', desc: 'Jumia or checkout', icon: '💰' },
    { day: 21, name: 'RETENTION', desc: 'SMS tips & codes', icon: '🛠️' },
    { day: 30, name: 'ADVOCACY', desc: 'Referral rewards', icon: '⭐' }
  ];

  return (
    <div className="text-center">
      <h2 className="text-xl font-bold text-indigo-300 mb-6">Customer Journey Map</h2>
      <div className="bg-gradient-to-br from-slate-800/85 to-slate-900/95 rounded-2xl p-8 border border-indigo-500/20 overflow-x-auto">
        <div className="relative min-w-[600px] py-5">
          <div className="absolute top-[30px] left-10 right-10 h-1 bg-gradient-to-r from-indigo-500 to-pink-500" style={{ background: 'repeating-linear-gradient(90deg, #6366f1, #6366f1 12px, transparent 12px, transparent 24px)' }} />
          <div className="absolute top-6 left-0 text-2xl">🏁</div>
          <div className="absolute top-6 right-0 text-2xl">🎯</div>
          <div className="flex justify-between relative z-10">
            {stages.map((stage, idx) => (
              <div key={idx} className="flex flex-col items-center gap-3 cursor-pointer transition-all hover:translate-y-[-8px]">
                <div
                  className="w-5 h-5 rounded-full z-20 transition-all hover:bg-pink-500 hover:scale-125"
                  style={{ background: '#6366f1', boxShadow: '0 0 0 4px rgba(99,102,241,.2)' }}
                />
                <span className="text-xs text-white/50 bg-black/40 px-2 py-1 rounded-full">Day {stage.day}</span>
                <span className="text-xs font-bold text-indigo-300">{stage.icon} {stage.name}</span>
                <span className="text-xs text-white/50 max-w-[100px] text-center">{stage.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Roadmap Component
const RoadmapVisual = ({ plan }: { plan: string }) => {
  const phases = [
    { title: 'Foundation', days: 'Days 1-7', items: ['Finalize formula', 'Secure manufacturing'] },
    { title: 'Awareness', days: 'Days 8-14', items: ['TikTok video', 'Launch radio spots'] },
    { title: 'Conversion', days: 'Days 15-21', items: ['E-commerce listings', 'Shelf placement'] },
    { title: 'Retention', days: 'Days 22-30', items: ['SMS workflow', 'Instagram Q&A'] }
  ];

  return (
    <div className="text-center">
      <h2 className="text-xl font-bold text-indigo-300 mb-6">30-Day Roadmap</h2>
      <div className="flex flex-col gap-4">
        {phases.map((phase, idx) => (
          <div
            key={idx}
            className="bg-gradient-to-br from-slate-800/85 to-slate-900/95 rounded-xl p-5 border-l-4 border-indigo-500 transition-all hover:translate-x-2 hover:border-pink-500"
          >
            <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
              <span className="text-base font-bold text-indigo-300">📋 {phase.title}</span>
              <span className="text-xs text-white/50 bg-black/30 px-3 py-1 rounded-full">{phase.days}</span>
            </div>
            <ul className="pl-5 space-y-1">
              {phase.items.map((item, i) => (
                <li key={i} className="text-sm text-white/70 flex items-center gap-2">
                  <Check size={14} className="text-green-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main App Component
function App() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [panelOpen, setPanelOpen] = useState(false);
  const [customerData, setCustomerData] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string>('');
  const [activeRole, setActiveRole] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');

  const roles = [
    { id: 'segmentation', name: 'Segmentation', icon: 'target' },
    { id: 'marketsizing', name: 'Market Sizing', icon: 'bars' },
    { id: 'pestle', name: 'PESTLE', icon: 'lightning' },
    { id: 'porter', name: "Porter's Forces", icon: 'building' },
    { id: 'competitors', name: 'Competitors', icon: 'search' },
    { id: 'positioning', name: 'Positioning', icon: 'pin' },
    { id: '4ps', name: '4Ps', icon: 'grid' },
    { id: 'swot', name: 'SWOT', icon: 'diamond' },
    { id: 'journey', name: 'Journey Map', icon: 'path' },
    { id: 'kpi', name: 'KPIs', icon: 'linechart' },
    { id: 'okrs', name: 'OKRs', icon: 'bullseye' },
    { id: 'roadmap', name: 'Roadmap', icon: 'calendar' },
    { id: 'design', name: 'Design', icon: 'paintbrush' }
  ];

  const generatePlan = async () => {
    if (!customerData.trim() || !productDescription.trim()) {
      setStatus('Please fill in both fields');
      return;
    }

    setIsGenerating(true);
    setProgress(5);
    setStatus('AI analyzing market data...');
    setCurrentPlan('');
    setActiveRole(null);

    try {
      const response = await fetch(`${API_BASE}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_data: customerData,
          product_description: productDescription
        })
      });

      if (!response.ok) throw new Error('Generation failed');

      const data = await response.json();
      const plan = data.plan;

      setProgress(50);
      setStatus('Processing strategy...');
      await new Promise(r => setTimeout(r, 500));

      setCurrentPlan(plan);
      setProgress(100);
      setStatus('Strategy generated successfully!');

      setTimeout(() => {
        setProgress(0);
        setStatus('');
      }, 2000);
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
      setProgress(0);
    } finally {
      setIsGenerating(false);
    }
  };

  const renderRoleContent = () => {
    if (!currentPlan) {
      return (
        <div className="text-center py-10 text-white/40">
          Generate a plan first to see {activeRole} analysis.
        </div>
      );
    }

    switch (activeRole) {
      case 'segmentation':
        return <SegmentationVisual plan={currentPlan} />;
      case 'marketsizing':
        return <MarketSizingVennDiagram plan={currentPlan} />;
      case 'pestle':
        return <PESTLEVisual plan={currentPlan} />;
      case 'porter':
        return <PortersVisual plan={currentPlan} />;
      case 'competitors':
        return <CompetitorsVisual plan={currentPlan} />;
      case 'positioning':
        return <PositioningVisual plan={currentPlan} />;
      case '4ps':
        return <FourPsVisual plan={currentPlan} />;
      case 'swot':
        return <SWOTVisual plan={currentPlan} />;
      case 'journey':
        return <CustomerJourneyVisual plan={currentPlan} />;
      case 'kpi':
        return <KPICards plan={currentPlan} />;
      case 'okrs':
        return <OKRDiagram plan={currentPlan} />;
      case 'roadmap':
        return <RoadmapVisual plan={currentPlan} />;
      case 'design':
        return <div className="text-center py-10 text-white/60">Design guidelines coming soon...</div>;
      default:
        return null;
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <div className="page-fade-in">
            <div className="text-center py-16">
              <h1 className="text-5xl font-bold mb-5 bg-gradient-to-r from-white via-indigo-300 to-pink-400 bg-clip-text text-transparent">
                Stop second-guessing.<br />Start executing.
              </h1>
              <p className="text-lg text-white/70 max-w-2xl mx-auto mb-8">
                A conscientious marketing system that delivers 13 disciplined roles—executed in precise sequence—so you get clarity, not confusion.
              </p>
              <button
                onClick={() => setCurrentPage('app')}
                className="btn-primary"
              >
                <Icon name="rocket" size={18} /> Start Your Free Plan
              </button>
            </div>

            <h2 className="text-center text-2xl font-bold mb-8 text-white/80">How it works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { num: '1', title: 'Describe your audience', desc: 'Tell us who you want to sell to' },
                { num: '2', title: 'Describe your product', desc: 'Tell us what you\'re selling' },
                { num: '3', title: 'Get your full plan', desc: 'Receive 13 roles of strategic analysis' }
              ].map((step) => (
                <div key={step.num} className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center transition-all hover:translate-y-[-5px] hover:border-indigo-500/30">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-5 font-bold text-lg">
                    {step.num}
                  </div>
                  <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                  <p className="text-white/60 text-sm">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'app':
        return (
          <div className="page-fade-in">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8">
              <label className="block text-sm font-medium mb-2 text-white/80">Customer Data / Target Audience</label>
              <textarea
                value={customerData}
                onChange={(e) => setCustomerData(e.target.value)}
                rows={3}
                placeholder="Example: Enterprise CTOs at mid-sized tech companies..."
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-white/30 resize-none focus:outline-none focus:border-indigo-500 transition-all"
              />

              <label className="block text-sm font-medium mb-2 mt-4 text-white/80">Product Description / Service</label>
              <textarea
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                rows={5}
                placeholder="Example: An AI-powered marketing analytics platform..."
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-white/30 resize-none focus:outline-none focus:border-indigo-500 transition-all"
              />

              <div className="flex gap-3 mt-5 flex-wrap">
                <button
                  onClick={generatePlan}
                  disabled={isGenerating}
                  className="btn-primary disabled:opacity-50"
                >
                  <Icon name="rocket" size={18} />
                  {isGenerating ? 'Generating...' : 'Generate Strategic Plan'}
                </button>
                <button
                  onClick={() => { setCustomerData(''); setProductDescription(''); setCurrentPlan(''); setActiveRole(null); }}
                  className="btn-outline"
                >
                  Clear All
                </button>
              </div>
            </div>

            {progress > 0 && (
              <div className="bg-white/5 rounded-full h-1 mb-4 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            {status && (
              <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl px-5 py-3 mb-6 text-sm text-white/80">
                {isGenerating && <span className="loader mr-2"></span>}
                {status}
              </div>
            )}

            {currentPlan && activeRole && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mt-6">
                <div className="flex justify-between items-center mb-5 flex-wrap gap-3">
                  <h3 className="text-xl font-bold text-indigo-300">{roles.find(r => r.id === activeRole)?.name}</h3>
                  <button
                    onClick={() => setActiveRole(null)}
                    className="px-4 py-2 text-xs bg-indigo-500/20 border border-indigo-500/40 rounded-full text-indigo-300 hover:bg-indigo-500/30 transition-all"
                  >
                    Close
                  </button>
                </div>
                {renderRoleContent()}
              </div>
            )}

            {currentPlan && !activeRole && (
              <div className="text-center py-10 text-white/50">
                👈 Click a role in the sidebar to explore the analysis
              </div>
            )}
          </div>
        );

      case 'about':
        return (
          <div className="page-fade-in">
            <div className="text-center py-12">
              <h1 className="text-4xl font-bold mb-4">
                Built on <span className="text-indigo-500">Conscientiousness</span>
              </h1>
              <p className="text-lg text-white/70 max-w-2xl mx-auto">
                We believe marketing strategy should be disciplined, not chaotic. 13 roles. One clear output. Every time.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-10">
              {[
                { icon: 'gear', title: 'Autonomy', desc: 'System works independently. No need to instruct next steps.' },
                { icon: 'brain', title: 'Intelligence', desc: 'Smart analysis that learns and adapts to your business.' },
                { icon: 'heart', title: 'Goodness', desc: 'Ethical strategies benefiting everyone, not just bottom line.' }
              ].map((item) => (
                <div key={item.title} className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-indigo-500/20 rounded-2xl p-8 text-center transition-all hover:translate-y-[-8px] hover:border-indigo-500/50 hover:shadow-xl cursor-pointer">
                  <div className="w-16 h-16 mx-auto mb-5 bg-indigo-500/15 rounded-2xl flex items-center justify-center">
                    <Icon name={item.icon} size={32} />
                  </div>
                  <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-white to-indigo-300 bg-clip-text text-transparent">{item.title}</h3>
                  <p className="text-sm text-white/70">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-8 text-center">
              <h3 className="text-xl font-bold mb-3">Our Mission</h3>
              <p className="text-white/70 max-w-2xl mx-auto">
                To democratize strategic marketing by making professional-grade planning accessible, understandable, and actionable for everyone.
              </p>
            </div>
          </div>
        );

      case 'pricing':
        return (
          <div className="page-fade-in">
            <div className="text-center py-12">
              <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
              <p className="text-lg text-white/60">No hidden fees. Cancel anytime.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { name: 'Free', price: '$0', period: '/month', desc: 'Perfect for getting started', features: ['5 plans/month', 'PDF export', 'Save to history'], popular: false },
                { name: 'Pro', price: '$29', period: '/month', desc: 'For growing teams', features: ['Unlimited plans', 'Priority support', 'Advanced analytics'], popular: true },
                { name: 'Enterprise', price: 'Custom', period: '', desc: 'For large organizations', features: ['Unlimited everything', 'API access', 'Dedicated support'], popular: false }
              ].map((plan) => (
                <div
                  key={plan.name}
                  className={`bg-gradient-to-br from-slate-800/90 to-slate-900/95 border rounded-2xl p-8 text-center transition-all hover:translate-y-[-12px] hover:shadow-xl cursor-pointer ${
                    plan.popular ? 'border-indigo-500/60 scale-[1.02]' : 'border-white/10 hover:border-indigo-500/50'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute top-5 right-5 bg-gradient-to-r from-indigo-500 to-pink-500 px-3 py-1 rounded-full text-xs font-bold">
                      ⭐ MOST POPULAR
                    </div>
                  )}
                  <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-white to-indigo-300 bg-clip-text text-transparent">{plan.name}</h3>
                  <div className="text-5xl font-bold text-indigo-300 mb-2">
                    {plan.price}
                    {plan.period && <span className="text-lg text-white/50">{plan.period}</span>}
                  </div>
                  <p className="text-sm text-white/40 mb-6">{plan.desc}</p>
                  <ul className="text-left mb-8 space-y-3">
                    {plan.features.map((f, i) => (
                      <li key={i} className="text-sm text-white/80 flex items-center gap-2 border-b border-white/5 last:border-none pb-3 last:pb-0">
                        <Check size={16} className="text-green-400" /> {f}
                      </li>
                    ))}
                  </ul>
                  <button className={plan.popular ? 'btn-primary w-full justify-center' : 'btn-outline w-full justify-center'}>
                    {plan.name === 'Enterprise' ? 'Contact Sales →' : 'Get Started →'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white flex">
      {/* Left Panel */}
      <div
        className={`fixed h-screen w-72 bg-gradient-to-b from-[#0c1120] to-[#050810] border-r border-white/10 transition-transform duration-300 z-50 ${
          panelOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 border-b border-white/10">
          <h2 className="text-lg font-bold bg-gradient-to-r from-white to-indigo-300 bg-clip-text text-transparent">
            StratMark AI
          </h2>
        </div>
        <div className="flex flex-col gap-1 py-4">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => {
                setActiveRole(role.id);
                if (!panelOpen) setPanelOpen(true);
              }}
              className={`flex items-center gap-3 px-5 py-3 mx-2 rounded-xl text-sm transition-all ${
                activeRole === role.id
                  ? 'bg-gradient-to-r from-indigo-500/15 to-pink-500/10 text-indigo-300 border-l-2 border-indigo-500'
                  : 'text-white/60 hover:bg-indigo-500/10 hover:text-indigo-300 hover:translate-x-1'
              }`}
            >
              <Icon name={role.icon} size={18} />
              <span className="flex-1 text-left">{role.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${panelOpen ? 'ml-72' : 'ml-0'}`}>
        {/* Header */}
        <nav className="flex justify-between items-center py-5 px-8 border-b border-white/10 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setPanelOpen(!panelOpen)}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              {panelOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h1
              onClick={() => { setCurrentPage('home'); setActiveRole(null); }}
              className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent cursor-pointer"
            >
              StrategicMarketing
            </h1>
          </div>

          <div className="flex items-center gap-6 flex-wrap">
            {[
              { id: 'home', label: 'Home', icon: 'home' },
              { id: 'app', label: 'Launch App', icon: 'rocket' },
              { id: 'about', label: 'About', icon: 'lightbulb' },
              { id: 'pricing', label: 'Pricing', icon: 'dollar' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`flex items-center gap-2 text-sm transition-colors ${
                  currentPage === item.id ? 'text-indigo-500' : 'text-white/70 hover:text-indigo-400'
                }`}
              >
                <Icon name={item.icon} size={16} />
                {item.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Page Content */}
        <main className="p-8">
          {renderPage()}
        </main>

        {/* Footer */}
        <footer className="text-center py-10 border-t border-white/10 text-xs text-white/50">
          © 2025 Strategic Marketing System · AI-Powered Strategy · 13-Role Framework
        </footer>
      </div>

      <style>{`
        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #6366f1, #ec4899);
          border: none;
          border-radius: 50px;
          padding: 12px 28px;
          color: white;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(99,102,241,0.3);
        }
        .btn-outline {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          border: 1px solid rgba(99,102,241,0.5);
          border-radius: 50px;
          padding: 12px 28px;
          color: #a5b4fc;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-outline:hover {
          background: rgba(99,102,241,0.1);
          transform: translateY(-2px);
        }
        .loader {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #6366f1;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .page-fade-in {
          animation: fadeIn 0.4s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default App;
