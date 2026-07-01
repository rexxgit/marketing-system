import { useState, useEffect } from 'react';
import {
  Target, BarChart3, Zap, Building2, Search, MapPin, Grid3X3, Diamond,
  Route, TrendingUp, Crosshair, Calendar, Paintbrush, Home, ClipboardList,
  Lightbulb, DollarSign, Rocket, User, ArrowRight, Lock, Database,
  Check, Star, Heart, Brain, Settings, Menu, X, Download, Copy,
  Users, ShoppingBag, Factory, RefreshCw, Swords, Package, Map,
  Award, TrendingDown
} from 'lucide-react';

// ===== IMPORTS =====
import MarketingPlanDisplay from './components/MarketingPlanDisplay';
import PDFExport from './components/PDFExport';

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

// ============================================
// SMART PARSING UTILITY FUNCTIONS
// ============================================

const extractTagContent = (plan: string, tag: string): string => {
  if (!plan) return '';
  
  const tagMap: Record<string, string[]> = {
    'SEGMENTATION OUTPUT': ['SEGMENTATION OUTPUT', 'SEGMENTATION'],
    'TAMSAMSOM OUTPUT': ['TAMSAMSOM OUTPUT', 'TAM/SAM/SOM', 'MARKET SIZING'],
    'KPI OUTPUT': ['KPI OUTPUT', 'KPIS OUTPUT', 'KPI'],
    'OKRS OUTPUT': ['OKRS OUTPUT', 'OKR OUTPUT', 'OKR'],
    'PESTLE OUTPUT': ['PESTLE OUTPUT', 'PESTLE', 'PESTEL OUTPUT', 'PESTEL', 'PESTLE ANALYSIS', 'PESTEL ANALYSIS'],
    'PORTERS OUTPUT': ['PORTER OUTPUT', 'PORTERS OUTPUT', 'PORTER'],
    'COMPETITOR OUTPUT': ['COMPETITOR OUTPUT', 'COMPETITORS OUTPUT', 'COMPETITOR'],
    'POSITIONING OUTPUT': ['POSITIONING OUTPUT', 'POSITIONING'],
    '4PS OUTPUT': ['4Ps OUTPUT', '4PS OUTPUT', '4P', 'MARKETING MIX'],
    'SWOT OUTPUT': ['SWOT OUTPUT', 'SWOT'],
    'JOURNEY OUTPUT': ['CUSTOMER JOURNEY OUTPUT', 'JOURNEY OUTPUT', 'CUSTOMER JOURNEY'],
    'ROADMAP OUTPUT': ['ROADMAP OUTPUT', 'ROADMAP']
  };
  
  const possibleTags = tagMap[tag] || [tag];
  
  for (const possibleTag of possibleTags) {
    // Try standard format: [TAG]
    const regex = new RegExp(`\\[${possibleTag}\\]([\\s\\S]*?)(?=\\n\\n---|\\n\\[|$)`, 'i');
    const match = plan.match(regex);
    if (match && match[1].trim().length > 10) {
      return match[1].trim();
    }
    
    // Try bold format: **TAG** (for PESTLE)
    const boldRegex = new RegExp(`\\*\\*${possibleTag}\\*\\*\\s*\\n([\\s\\S]*?)(?=\\n\\n---|\\n\\[|\\n\\*\\*|$)`, 'i');
    const boldMatch = plan.match(boldRegex);
    if (boldMatch && boldMatch[1].trim().length > 10) {
      return boldMatch[1].trim();
    }
  }
  
  return '';
};

const parseMarketSizing = (plan: string): { tam: number; sam: number; som: number } => {
  const content = extractTagContent(plan, 'TAMSAMSOM OUTPUT');
  let tam = 0, sam = 0, som = 0;
  
  if (content) {
    const tamMatch = content.match(/TAM[:\s]*([0-9,]+)/i);
    const samMatch = content.match(/SAM[:\s]*([0-9,]+)/i);
    const somMatch = content.match(/SOM[:\s]*([0-9,]+)/i);
    
    tam = tamMatch ? parseInt(tamMatch[1].replace(/,/g, '')) : 0;
    sam = samMatch ? parseInt(samMatch[1].replace(/,/g, '')) : 0;
    som = somMatch ? parseInt(somMatch[1].replace(/,/g, '')) : 0;
  }
  
  if (tam > 0 && sam === 0 && som === 0) {
    sam = Math.round(tam * 0.7);
    som = Math.round(sam * 0.15);
  } else if (tam > 0 && sam > 0 && som === 0) {
    som = Math.round(sam * 0.15);
  }
  
  return { tam, sam, som };
};

// ============================================
// ROLE 2: SEGMENTATION PIE CHART VISUALIZER
// ============================================

const SegmentationVisual = ({ plan }: { plan: string }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const parseSegments = (): Segment[] => {
    const content = extractTagContent(plan, 'SEGMENTATION OUTPUT');
    let segments: Segment[] = [];
    
    if (content) {
      const lines = content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        
        if (trimmed.match(/^[-•*]\s+/) || trimmed.match(/^\d+\.\s+/) || trimmed.match(/^[A-Z].*:/)) {
          const text = trimmed.replace(/^[-•*]\s+/, '').replace(/^\d+\.\s+/, '').trim();
          const shareMatch = text.match(/(\d+)%/);
          const nameMatch = text.match(/^([^,:\d]+)/);
          
          if (nameMatch && nameMatch[1].trim().length > 2) {
            const share = shareMatch ? parseInt(shareMatch[1]) : 20 + Math.floor(Math.random() * 30);
            segments.push({
              name: nameMatch[1].trim().substring(0, 40),
              share: share,
              value: 100000 + Math.floor(Math.random() * 500000),
              growth: 5 + Math.random() * 15
            });
          }
        }
      }
    }

    return segments.length > 0 ? segments.slice(0, 6) : [
      { name: 'No segment data available', share: 100, value: 0, growth: 0 }
    ];
  };

  const segments = parseSegments();
  const colors = ['#4ade80', '#22d3ee', '#fbbf24', '#f472b6', '#a78bfa', '#f87171'];
  const totalShare = segments.reduce((sum, s) => sum + s.share, 0);

  const getPrimaryTarget = (): string => {
    const content = extractTagContent(plan, 'SEGMENTATION OUTPUT');
    const match = content.match(/Primary Target(?: Segment)?[:\s]*([^\n]+)/i);
    if (match) return match[1].trim();
    return 'No primary target defined';
  };

  // Generate pie slice paths (transparent with colored borders)
  const generatePieSlice = (index: number, total: number) => {
    const startAngle = (index / total) * 2 * Math.PI - Math.PI / 2;
    const endAngle = ((index + 1) / total) * 2 * Math.PI - Math.PI / 2;
    const radius = 140;
    const x1 = Math.cos(startAngle) * radius;
    const y1 = Math.sin(startAngle) * radius;
    const x2 = Math.cos(endAngle) * radius;
    const y2 = Math.sin(endAngle) * radius;
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
    return `M0,0 L${x1.toFixed(2)},${y1.toFixed(2)} A${radius},${radius} 0 ${largeArc},1 ${x2.toFixed(2)},${y2.toFixed(2)} Z`;
  };

  return (
    <div className="segmentation-container">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent">
          Market Segmentation
        </h2>
        <span className="text-xs text-white/40">{segments.length} segments • {totalShare}% total</span>
      </div>

      {segments.length === 1 && segments[0].name === 'No segment data available' ? (
        <div className="text-center py-10 text-white/50">
          <p>No segmentation data found. Generate a new plan.</p>
        </div>
      ) : (
        <div className="segmentation-chart">
          <div className="pie-chart-wrapper">
            <svg viewBox="0 0 400 400" className="pie-chart-svg">
              <defs>
                <filter id="shadow-3d">
                  <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#000" floodOpacity="0.4"/>
                </filter>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="6" result="blur"/>
                  <feMerge>
                    <feMergeNode in="blur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <g transform="translate(200, 200)">
                {segments.map((segment, i) => {
                  const color = colors[i % colors.length];
                  const path = generatePieSlice(i, segments.length);
                  const percent = totalShare > 0 ? ((segment.share / totalShare) * 100).toFixed(1) : 0;
                  const isHovered = hoveredIndex === i || selectedIndex === i;
                  const labelAngle = ((i / segments.length) * 2 * Math.PI) - Math.PI / 2 + (Math.PI / segments.length);
                  const labelRadius = 100;
                  const lx = Math.cos(labelAngle) * labelRadius;
                  const ly = Math.sin(labelAngle) * labelRadius;

                  return (
                    <g
                      key={i}
                      onMouseEnter={() => setHoveredIndex(i)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      onClick={() => setSelectedIndex(selectedIndex === i ? null : i)}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* Transparent slice with colored border */}
                      <path
                        d={path}
                        fill="none"
                        stroke={color}
                        strokeWidth={isHovered ? 4 : 2.5}
                        opacity={isHovered ? 1 : 0.7}
                        style={{
                          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                          filter: isHovered ? 'url(#glow)' : 'url(#shadow-3d)',
                          transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                          transformOrigin: 'center'
                        }}
                      />
                      
                      {/* Percentage label */}
                      <text
                        x={lx}
                        y={ly}
                        fill={isHovered ? color : '#CBD5E1'}
                        fontSize={isHovered ? 18 : 14}
                        fontWeight="700"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        style={{
                          transition: 'all 0.3s ease',
                          textShadow: isHovered ? `0 0 20px ${color}` : 'none'
                        }}
                      >
                        {percent}%
                      </text>
                      
                      {/* Segment name label */}
                      <text
                        x={lx}
                        y={ly + 22}
                        fill="rgba(255,255,255,0.4)"
                        fontSize="9"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        style={{ pointerEvents: 'none' }}
                      >
                        {segment.name.split(' ').slice(0, 2).join(' ')}
                      </text>
                    </g>
                  );
                })}
              </g>
              <circle cx="200" cy="200" r="50" fill="rgba(10,14,26,0.9)" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
              <text x="200" y="195" fill="white" fontSize="18" fontWeight="700" textAnchor="middle">
                {segments.length}
              </text>
              <text x="200" y="215" fill="rgba(255,255,255,0.3)" fontSize="9" textAnchor="middle" letterSpacing="1.2">
                SEGMENTS
              </text>
            </svg>
          </div>

          {/* Legend */}
          <div className="legend-container">
            {segments.map((segment, i) => {
              const color = colors[i % colors.length];
              const percent = totalShare > 0 ? ((segment.share / totalShare) * 100).toFixed(1) : 0;
              const isActive = hoveredIndex === i || selectedIndex === i;

              return (
                <div
                  key={i}
                  className={`legend-item ${isActive ? 'active' : ''}`}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => setSelectedIndex(selectedIndex === i ? null : i)}
                  style={{
                    borderColor: isActive ? color : 'rgba(255,255,255,0.06)',
                    background: isActive ? `${color}15` : 'rgba(255,255,255,0.02)',
                    transform: isActive ? 'translateX(4px) scale(1.02)' : 'translateX(0) scale(1)'
                  }}
                >
                  <div className="legend-dot" style={{ background: color, boxShadow: isActive ? `0 0 16px ${color}` : 'none' }} />
                  <span className="legend-name">{segment.name}</span>
                  <span className="legend-percent" style={{ color }}>{percent}%</span>
                  <span className="legend-share">{segment.share}% share</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tooltip on hover */}
      {hoveredIndex !== null && segments[hoveredIndex] && (
        <div className="segment-tooltip">
          <div className="tooltip-content">
            <div className="tooltip-header" style={{ borderColor: colors[hoveredIndex % colors.length] }}>
              <span className="tooltip-name">{segments[hoveredIndex].name}</span>
              <span className="tooltip-share" style={{ color: colors[hoveredIndex % colors.length] }}>
                {totalShare > 0 ? ((segments[hoveredIndex].share / totalShare) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="tooltip-details">
              <div className="tooltip-row">
                <span>Market Share</span>
                <span>{segments[hoveredIndex].share}%</span>
              </div>
              <div className="tooltip-row">
                <span>Estimated Value</span>
                <span>ETB {segments[hoveredIndex].value.toLocaleString()}</span>
              </div>
              <div className="tooltip-row">
                <span>Growth Rate</span>
                <span className="text-green-400">+{segments[hoveredIndex].growth}%</span>
              </div>
              <div className="tooltip-row">
                <span>Primary Target</span>
                <span className="text-sm text-white/60">{getPrimaryTarget()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .segmentation-container {
          position: relative;
          padding: 20px;
        }
        .segmentation-chart {
          display: flex;
          gap: 40px;
          align-items: center;
          flex-wrap: wrap;
          justify-content: center;
        }
        .pie-chart-wrapper {
          flex: 1;
          min-width: 300px;
          max-width: 420px;
        }
        .pie-chart-svg {
          width: 100%;
          height: auto;
        }
        .legend-container {
          flex: 1;
          min-width: 200px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .legend-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 16px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.06);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .legend-item:hover {
          background: rgba(255,255,255,0.06);
          transform: translateX(4px);
        }
        .legend-item.active {
          border-color: var(--legend-color);
        }
        .legend-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }
        .legend-name {
          flex: 1;
          font-size: 13px;
          color: #CBD5E1;
        }
        .legend-percent {
          font-size: 14px;
          font-weight: 700;
        }
        .legend-share {
          font-size: 11px;
          color: #64748B;
        }
        .segment-tooltip {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 100;
          animation: slideUp 0.3s ease;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .tooltip-content {
          background: rgba(15,23,42,0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 20px 24px;
          min-width: 260px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.6);
        }
        .tooltip-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 12px;
          border-bottom: 2px solid;
          margin-bottom: 12px;
        }
        .tooltip-name {
          font-size: 15px;
          font-weight: 600;
          color: #F1F5F9;
        }
        .tooltip-share {
          font-size: 18px;
          font-weight: 700;
        }
        .tooltip-details {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .tooltip-row {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          color: #94A3B8;
          padding: 4px 0;
        }
        .tooltip-row span:last-child {
          color: #CBD5E1;
          font-weight: 500;
        }
        @media (max-width: 768px) {
          .segmentation-chart {
            flex-direction: column;
            gap: 24px;
          }
          .pie-chart-wrapper {
            max-width: 300px;
          }
          .legend-container {
            width: 100%;
          }
          .segment-tooltip {
            position: fixed;
            bottom: 10px;
            right: 10px;
            left: 10px;
          }
          .tooltip-content {
            min-width: auto;
            padding: 16px 20px;
          }
        }
      `}</style>
    </div>
  );
};

// ============================================
// ROLE 3: MARKET SIZING EXPERT
// ============================================

const MarketSizingVennDiagram = ({ plan }: { plan: string }) => {
  const [showTAMDetails, setShowTAMDetails] = useState(false);
  const [showSAMDetails, setShowSAMDetails] = useState(false);
  const [showSOMDetails, setShowSOMDetails] = useState(false);

  const { tam, sam, som } = parseMarketSizing(plan);
  const hasData = tam > 0 || sam > 0 || som > 0;

  const formatValue = (val: number): string => {
    if (val === 0) return 'N/A';
    return val >= 1000000 ? (val / 1000000).toFixed(1) + 'M' : (val / 1000).toFixed(0) + 'K';
  };

  return (
    <div className="text-center">
      <h2 className="text-xl font-bold text-indigo-300 mb-6">Market Sizing (TAM / SAM / SOM)</h2>

      {!hasData ? (
        <div className="text-center py-10 text-white/50">
          <p>No market sizing data found in the generated plan.</p>
          <p className="text-sm mt-2">Generate a new plan with TAM/SAM/SOM data.</p>
        </div>
      ) : (
        <>
          <div className="relative mx-auto" style={{ width: '30em', height: '28em', maxWidth: '100%' }}>
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
        </>
      )}
    </div>
  );
};

// ============================================
// ROLE 4: PESTLE EXPERT (FIXED)
// ============================================

const PESTLEVisual = ({ plan }: { plan: string }) => {
  const parsePESTLE = () => {
    const content = extractTagContent(plan, 'PESTLE OUTPUT');
    const fullPlan = plan;
    
    const pestleData: { key: string; icon: string; title: string; insight: string; impact: string }[] = [];
    const categories = [
      { key: 'political', icon: '🏛️', title: 'Political' },
      { key: 'economic', icon: '📈', title: 'Economic' },
      { key: 'social', icon: '👥', title: 'Social' },
      { key: 'technological', icon: '💻', title: 'Technological' },
      { key: 'legal', icon: '⚖️', title: 'Legal' },
      { key: 'environmental', icon: '🌿', title: 'Environmental' }
    ];

    // Try to parse from content first, fallback to full plan
    let searchText = content || fullPlan;
    
    for (const cat of categories) {
      let insight = '';
      
      // Pattern 1: **Economic Drivers:** or **Economic Drivers** with bold
      const boldPattern = new RegExp(`\\*\\*${cat.title}\\s+Drivers\\*\\*[:\\s]*([^\\n]+)`, 'i');
      const boldMatch = searchText.match(boldPattern);
      if (boldMatch) {
        insight = boldMatch[1].trim();
      }
      
      // Pattern 2: Economic Drivers: (without bold)
      if (!insight) {
        const plainPattern = new RegExp(`${cat.title}\\s+Drivers[:\\s]*([^\\n]+)`, 'i');
        const plainMatch = searchText.match(plainPattern);
        if (plainMatch) {
          insight = plainMatch[1].trim();
        }
      }
      
      // Pattern 3: **Political:** or Political: (key format)
      if (!insight) {
        const keyPattern = new RegExp(`\\*\\*${cat.key}\\*\\*[:\\s]*([^\\n]+)`, 'i');
        const keyMatch = searchText.match(keyPattern);
        if (keyMatch) {
          insight = keyMatch[1].trim();
        }
      }
      
      // Pattern 4: political: (without bold)
      if (!insight) {
        const plainKeyPattern = new RegExp(`${cat.key}[:\\s]*([^\\n]+)`, 'i');
        const plainKeyMatch = searchText.match(plainKeyPattern);
        if (plainKeyMatch) {
          insight = plainKeyMatch[1].trim();
        }
      }
      
      // Pattern 5: Look for bullet points with category name
      if (!insight) {
        const lines = searchText.split('\n');
        for (const line of lines) {
          const lower = line.toLowerCase();
          if ((lower.includes(cat.key) || lower.includes(cat.title.toLowerCase())) && line.match(/^[-•*]\s+/)) {
            const clean = line.replace(/^[-•*]\s+/, '').trim();
            if (clean.length > 10 && clean.length < 150) {
              insight = clean;
              break;
            }
          }
        }
      }
      
      // If we found insight, clean it up and add to data
      if (insight) {
        // Clean up - remove any markdown artifacts
        insight = insight.replace(/\*\*/g, '').trim();
        
        // Determine impact level
        let impact = 'medium';
        const lowerInsight = insight.toLowerCase();
        if (lowerInsight.includes('high') || lowerInsight.includes('significant') || lowerInsight.includes('major') || lowerInsight.includes('strong')) {
          impact = 'high';
        } else if (lowerInsight.includes('low') || lowerInsight.includes('minor') || lowerInsight.includes('weak') || lowerInsight.includes('negligible')) {
          impact = 'low';
        }
        
        pestleData.push({
          key: cat.key,
          icon: cat.icon,
          title: cat.title,
          insight: insight.substring(0, 120),
          impact: impact
        });
      }
    }

    return pestleData;
  };

  const pestleData = parsePESTLE();
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
      {pestleData.length === 0 ? (
        <div className="text-center py-10 text-white/50">
          <p>No PESTLE data found in the generated plan.</p>
          <p className="text-sm mt-2">Generate a new plan with PESTLE analysis.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {pestleData.map((item) => (
            <div
              key={item.key}
              className="bg-gradient-to-br from-slate-800/80 to-slate-900/90 rounded-xl p-5 border border-white/10 transition-all hover:translate-y-[-6px] hover:border-indigo-500/40 hover:shadow-lg cursor-pointer relative overflow-hidden"
              style={{ 
                '::before': { 
                  content: '""', 
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  width: '100%', 
                  height: '3px', 
                  background: `linear-gradient(90deg, ${colorMap[item.key]?.text || '#818cf8'}, ${colorMap[item.key]?.text || '#818cf8'})` 
                } 
              } as any}
            >
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/10">
                <div
                  className="w-10 h-10 flex items-center justify-center text-2xl rounded-xl"
                  style={{ background: colorMap[item.key]?.bg || 'rgba(99,102,241,.2)' }}
                >
                  {item.icon}
                </div>
                <div className="text-lg font-bold" style={{ color: colorMap[item.key]?.text || '#818cf8' }}>
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
      )}
    </div>
  );
};

// ============================================
// ROLE 5: PORTER'S FORCES EXPERT
// ============================================

const PortersVisual = ({ plan }: { plan: string }) => {
  const parsePorters = () => {
    const content = extractTagContent(plan, 'PORTERS OUTPUT');
    const fullPlan = plan;
    
    const forces = [
      { key: 'newEntrants', icon: <Users size={24} />, name: 'Threat of New Entrants' },
      { key: 'buyerPower', icon: <ShoppingBag size={24} />, name: 'Bargaining Power of Buyers' },
      { key: 'supplierPower', icon: <Factory size={24} />, name: 'Bargaining Power of Suppliers' },
      { key: 'substitutes', icon: <RefreshCw size={24} />, name: 'Threat of Substitutes' },
      { key: 'rivalry', icon: <Swords size={24} />, name: 'Industry Rivalry' }
    ];

    const parsedForces: any[] = [];
    const searchText = content || fullPlan;
    const lines = searchText.split('\n');

    for (const force of forces) {
      let insight = '';
      let rating: 'high' | 'medium' | 'low' = 'medium';
      
      for (const line of lines) {
        const trimmed = line.trim();
        const lower = trimmed.toLowerCase();
        if (lower.includes(force.key.toLowerCase()) || 
            lower.includes(force.name.toLowerCase().replace('threat of ', '')) ||
            lower.includes(force.name.toLowerCase())) {
          const insightMatch = trimmed.match(/[:\-•]\s*(.+)/);
          if (insightMatch) {
            insight = insightMatch[1].trim();
          } else {
            const clean = trimmed.replace(/^[-•*]\s+/, '').replace(/^[A-Z]+:?\s*/, '');
            if (clean.length > 10) {
              insight = clean;
            }
          }
          if (lower.includes('high') || lower.includes('strong') || lower.includes('significant')) {
            rating = 'high';
          } else if (lower.includes('low') || lower.includes('weak') || lower.includes('minor')) {
            rating = 'low';
          }
          break;
        }
      }

      if (insight && insight.length > 20) {
        parsedForces.push({
          ...force,
          rating,
          insight: insight
        });
      }
    }

    return parsedForces;
  };

  const forces = parsePorters();
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
      {forces.length === 0 ? (
        <div className="text-center py-10 text-white/50">
          <p>No Porter's Five Forces data found in the generated plan.</p>
          <p className="text-sm mt-2">Generate a new plan with competitive analysis.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {forces.map((force) => (
            <div
              key={force.key}
              className="bg-gradient-to-br from-slate-800/80 to-slate-900/90 rounded-xl p-5 border border-white/10 transition-all hover:translate-y-[-6px] hover:border-indigo-500/40 hover:shadow-lg cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/10">
                <div
                  className="w-10 h-10 flex items-center justify-center rounded-xl transition-transform hover:scale-110"
                  style={{ background: colorMap[force.key]?.bg || 'rgba(99,102,241,.2)', color: colorMap[force.key]?.text || '#818cf8' }}
                >
                  {force.icon}
                </div>
                <div className="text-base font-bold" style={{ color: colorMap[force.key]?.text || '#818cf8' }}>
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
              <div className="text-sm text-white/70 mt-3 text-left leading-relaxed">{force.insight}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================
// ROLE 6: COMPETITORS EXPERT
// ============================================

const CompetitorsVisual = ({ plan }: { plan: string }) => {
  const parseCompetitors = (): Competitor[] => {
    const content = extractTagContent(plan, 'COMPETITOR OUTPUT');
    const competitors: Competitor[] = [];
    const searchText = content || plan;
    const lines = searchText.split('\n');
    
    let inTable = false;
    let tableRows: string[][] = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      
      if (trimmed.includes('|') && trimmed.includes('Competitor')) {
        inTable = true;
        continue;
      }
      
      if (inTable && trimmed.includes('|')) {
        const cells = trimmed.split('|').map(c => c.trim()).filter(c => c);
        if (cells.length >= 3) {
          tableRows.push(cells);
        }
      }
      
      if (inTable && !trimmed.includes('|') && trimmed.length > 0) {
        inTable = false;
      }
    }
    
    if (tableRows.length > 0) {
      for (const row of tableRows) {
        const threat = row[2]?.toLowerCase().includes('high') ? 'high' : 
                      row[2]?.toLowerCase().includes('medium') ? 'medium' : 'low';
        
        // Extract actual strengths and weaknesses from the plan
        let strengths = ['Market presence'];
        let weaknesses = ['Limited data'];
        let position = 'Competitor';
        let differentiation = 'Differentiate';
        
        // Try to find more specific data in the plan
        const compName = row[0]?.trim() || '';
        if (compName) {
          const compRegex = new RegExp(`${compName}.*?(?:strengths?|advantages?)[:•-]\\s*([^\\n]+)`, 'i');
          const strengthMatch = searchText.match(compRegex);
          if (strengthMatch) {
            strengths = strengthMatch[1].split(',').map(s => s.trim()).filter(s => s.length > 3);
          }
          
          const weakRegex = new RegExp(`${compName}.*?(?:weaknesses?|disadvantages?)[:•-]\\s*([^\\n]+)`, 'i');
          const weakMatch = searchText.match(weakRegex);
          if (weakMatch) {
            weaknesses = weakMatch[1].split(',').map(s => s.trim()).filter(s => s.length > 3);
          }
        }
        
        competitors.push({
          name: compName || 'Competitor',
          threat: threat,
          offering: row[1]?.trim() || 'Competitor offering',
          strengths: strengths.length > 0 ? strengths : ['Market presence'],
          weaknesses: weaknesses.length > 0 ? weaknesses : ['Limited data'],
          position: position,
          differentiation: differentiation
        });
      }
    }
    
    if (competitors.length === 0) {
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.match(/^[-•*]\s+/) && 
            (trimmed.toLowerCase().includes('competitor') || 
             trimmed.toLowerCase().includes('threat') ||
             trimmed.toLowerCase().includes('rival'))) {
          const text = trimmed.replace(/^[-•*]\s+/, '');
          const parts = text.split(/[:–-]/);
          if (parts.length >= 2) {
            const threat = text.toLowerCase().includes('high') ? 'high' : 
                          text.toLowerCase().includes('medium') ? 'medium' : 'low';
            const compName = parts[0].trim();
            
            // Try to extract strengths and weaknesses
            let strengths = ['Market presence'];
            let weaknesses = ['Limited data'];
            
            const strengthRegex = new RegExp(`${compName}.*?(?:strengths?|advantages?)[:•-]\\s*([^\\n]+)`, 'i');
            const strengthMatch = searchText.match(strengthRegex);
            if (strengthMatch) {
              strengths = strengthMatch[1].split(',').map(s => s.trim()).filter(s => s.length > 3);
            }
            
            competitors.push({
              name: compName || 'Competitor',
              threat: threat,
              offering: parts.slice(1).join(' ').trim() || 'Competitor offering',
              strengths: strengths,
              weaknesses: weaknesses,
              position: 'Competitor',
              differentiation: 'Differentiate'
            });
          }
        }
      }
    }

    return competitors.length > 0 ? competitors.slice(0, 3) : [];
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
      {competitors.length === 0 ? (
        <div className="text-center py-10 text-white/50">
          <p>No competitor data found in the generated plan.</p>
          <p className="text-sm mt-2">Generate a new plan with competitor analysis.</p>
        </div>
      ) : (
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
      )}
    </div>
  );
};

// ============================================
// ROLE 7: POSITIONING EXPERT
// ============================================

const PositioningVisual = ({ plan }: { plan: string }) => {
  const content = extractTagContent(plan, 'POSITIONING OUTPUT');
  
  const parsePositioning = () => {
    const searchText = content || plan;
    
    let statement = '';
    let target = 'N/A';
    let benefit = 'N/A';
    let rtb = 'N/A';
    let value = 'N/A';

    const lines = searchText.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      if (trimmed.toLowerCase().includes('positioning') || 
          trimmed.toLowerCase().includes('statement')) {
        const match = trimmed.match(/[:–-]\s*(.+)/);
        if (match) statement = match[1].trim();
        else if (trimmed.length > 20) statement = trimmed;
      }
      
      if (trimmed.toLowerCase().includes('target') || trimmed.toLowerCase().includes('audience')) {
        const match = trimmed.match(/[:–-]\s*(.+)/);
        if (match) target = match[1].trim();
      }
      
      if (trimmed.toLowerCase().includes('benefit') || trimmed.toLowerCase().includes('value')) {
        const match = trimmed.match(/[:–-]\s*(.+)/);
        if (match) benefit = match[1].trim();
      }
      
      if (trimmed.toLowerCase().includes('rtb') || trimmed.toLowerCase().includes('reason to believe')) {
        const match = trimmed.match(/[:–-]\s*(.+)/);
        if (match) rtb = match[1].trim();
      }
      
      if (trimmed.toLowerCase().includes('core value') || trimmed.toLowerCase().includes('value proposition')) {
        const match = trimmed.match(/[:–-]\s*(.+)/);
        if (match) value = match[1].trim();
      }
    }

    if (!statement) {
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.length > 20 && !trimmed.match(/^[-•*]/) && !trimmed.match(/^[A-Z]{2,}:/)) {
          statement = trimmed.substring(0, 150);
          break;
        }
      }
    }

    if (target === 'N/A' && statement) {
      const targetMatch = statement.match(/for\s+([^,]+)/i);
      if (targetMatch) target = targetMatch[1].trim();
    }

    return { statement, target, benefit, rtb, value };
  };

  const positioning = parsePositioning();

  return (
    <div className="text-center">
      <h2 className="text-xl font-bold text-indigo-300 mb-6">Brand Positioning</h2>
      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/95 rounded-2xl p-8 border border-indigo-500/30 transition-all hover:translate-y-[-5px] hover:border-indigo-500/60 hover:shadow-xl">
        <div
          className="text-lg font-semibold leading-relaxed text-center p-6 bg-indigo-500/10 rounded-xl mb-6 border-l-4 border-r-4"
          style={{ borderLeftColor: '#6366f1', borderRightColor: '#ec4899' }}
        >
          "{positioning.statement || 'No positioning statement found. Generate a new plan with positioning data.'}"
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white/5 rounded-xl p-4 text-center transition-all hover:bg-indigo-500/10 hover:translate-y-[-3px]">
            <div className="text-4xl mb-3">🎯</div>
            <div className="text-xs uppercase text-indigo-300 tracking-wider mb-2">TARGET</div>
            <div className="text-sm font-medium text-white/90">{positioning.target}</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center transition-all hover:bg-indigo-500/10 hover:translate-y-[-3px]">
            <div className="text-4xl mb-3">💎</div>
            <div className="text-xs uppercase text-indigo-300 tracking-wider mb-2">BENEFIT</div>
            <div className="text-sm font-medium text-white/90">{positioning.benefit}</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center transition-all hover:bg-indigo-500/10 hover:translate-y-[-3px]">
            <div className="text-4xl mb-3">🔒</div>
            <div className="text-xs uppercase text-indigo-300 tracking-wider mb-2">RTB</div>
            <div className="text-sm font-medium text-white/90">{positioning.rtb}</div>
          </div>
        </div>
      </div>
      {positioning.value !== 'N/A' && (
        <div className="mt-5 p-4 bg-indigo-500/10 rounded-xl text-center">
          <strong className="text-white/70">Core Value:</strong> <span className="text-indigo-300">"{positioning.value}"</span>
        </div>
      )}
    </div>
  );
};

// ============================================
// ROLE 8: 4Ps EXPERT
// ============================================

const FourPsVisual = ({ plan }: { plan: string }) => {
  const content = extractTagContent(plan, '4PS OUTPUT');
  
  const parseFourPs = () => {
    if (!content) {
      return [
        { key: 'product', icon: <Package size={28} />, title: 'Product', description: 'No data', features: ['Generate a new plan'] },
        { key: 'price', icon: <DollarSign size={28} />, title: 'Price', description: 'No data', features: ['Generate a new plan'] },
        { key: 'place', icon: <Map size={28} />, title: 'Place', description: 'No data', features: ['Generate a new plan'] },
        { key: 'promotion', icon: <Rocket size={28} />, title: 'Promotion', description: 'No data', features: ['Generate a new plan'] }
      ];
    }

    const psData: any[] = [];
    const lines = content.split('\n');
    let currentP: any = null;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      const lower = trimmed.toLowerCase();
      if (lower.includes('product') && !lower.includes('price') && !lower.includes('place') && !lower.includes('promotion')) {
        if (currentP) psData.push(currentP);
        currentP = { key: 'product', icon: <Package size={28} />, title: 'Product', description: '', features: [] };
        const match = trimmed.match(/[:–-]\s*(.+)/);
        if (match) currentP.description = match[1].trim();
      } else if (lower.includes('price')) {
        if (currentP) psData.push(currentP);
        currentP = { key: 'price', icon: <DollarSign size={28} />, title: 'Price', description: '', features: [] };
        const match = trimmed.match(/[:–-]\s*(.+)/);
        if (match) currentP.description = match[1].trim();
      } else if (lower.includes('place') || lower.includes('distribution')) {
        if (currentP) psData.push(currentP);
        currentP = { key: 'place', icon: <Map size={28} />, title: 'Place', description: '', features: [] };
        const match = trimmed.match(/[:–-]\s*(.+)/);
        if (match) currentP.description = match[1].trim();
      } else if (lower.includes('promotion')) {
        if (currentP) psData.push(currentP);
        currentP = { key: 'promotion', icon: <Rocket size={28} />, title: 'Promotion', description: '', features: [] };
        const match = trimmed.match(/[:–-]\s*(.+)/);
        if (match) currentP.description = match[1].trim();
      } else if (trimmed.match(/^[-•*]\s+/) && currentP) {
        const feature = trimmed.replace(/^[-•*]\s+/, '').trim();
        if (feature.length > 3 && currentP.features.length < 3) {
          currentP.features.push(feature);
        }
      }
    }
    if (currentP) psData.push(currentP);

    // Remove duplicate 'place' entries
    const uniquePsData = psData.filter((p, index, self) => 
      index === self.findIndex((t) => t.key === p.key)
    );

    return uniquePsData.length > 0 ? uniquePsData : [
      { key: 'product', icon: <Package size={28} />, title: 'Product', description: 'No data found', features: ['Generate a new plan'] },
      { key: 'price', icon: <DollarSign size={28} />, title: 'Price', description: 'No data found', features: ['Generate a new plan'] },
      { key: 'place', icon: <Map size={28} />, title: 'Place', description: 'No data found', features: ['Generate a new plan'] },
      { key: 'promotion', icon: <Rocket size={28} />, title: 'Promotion', description: 'No data found', features: ['Generate a new plan'] }
    ];
  };

  const psData = parseFourPs();
  const colorMap: Record<string, { bg: string; text: string }> = {
    product: { bg: 'rgba(99,102,241,.2)', text: '#818cf8' },
    price: { bg: 'rgba(16,185,129,.2)', text: '#34d399' },
    place: { bg: 'rgba(245,158,11,.2)', text: '#fbbf24' },
    promotion: { bg: 'rgba(236,72,153,.2)', text: '#f472b6' }
  };

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
                style={{ background: colorMap[ps.key]?.bg || 'rgba(99,102,241,.2)', color: colorMap[ps.key]?.text || '#818cf8' }}
              >
                {ps.icon}
              </div>
              <div className="text-xl font-bold" style={{ color: colorMap[ps.key]?.text || '#818cf8' }}>
                {ps.title}
              </div>
            </div>
            <p className="text-sm text-white/80 leading-relaxed mb-4">{ps.description}</p>
            <ul className="space-y-2">
              {ps.features.map((feature: string, idx: number) => (
                <li key={idx} className="flex items-center gap-2 text-xs text-white/70 py-2 border-b border-white/5 last:border-none">
                  <Check size={12} style={{ color: colorMap[ps.key]?.text || '#818cf8' }} />
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

// ============================================
// ROLE 9: SWOT EXPERT
// ============================================

const SWOTVisual = ({ plan }: { plan: string }) => {
  const content = extractTagContent(plan, 'SWOT OUTPUT');
  
  const parseSWOT = () => {
    if (!content) {
      return [
        { key: 'strengths', letter: 'S', title: 'STRENGTHS', items: ['No data found'], note: 'Generate a new plan with SWOT analysis', color: '#34d399', bgColor: 'rgba(16,185,129,.2)' },
        { key: 'weaknesses', letter: 'W', title: 'WEAKNESSES', items: ['No data found'], note: 'Generate a new plan with SWOT analysis', color: '#f87171', bgColor: 'rgba(239,68,68,.2)' },
        { key: 'opportunities', letter: 'O', title: 'OPPORTUNITIES', items: ['No data found'], note: 'Generate a new plan with SWOT analysis', color: '#fbbf24', bgColor: 'rgba(245,158,11,.2)' },
        { key: 'threats', letter: 'T', title: 'THREATS', items: ['No data found'], note: 'Generate a new plan with SWOT analysis', color: '#a78bfa', bgColor: 'rgba(139,92,246,.2)' }
      ];
    }

    const swotData: any[] = [];
    const categories = ['strengths', 'weaknesses', 'opportunities', 'threats'];
    const letters = ['S', 'W', 'O', 'T'];
    const titles = ['STRENGTHS', 'WEAKNESSES', 'OPPORTUNITIES', 'THREATS'];
    const colors = ['#34d399', '#f87171', '#fbbf24', '#a78bfa'];
    const bgColors = ['rgba(16,185,129,.2)', 'rgba(239,68,68,.2)', 'rgba(245,158,11,.2)', 'rgba(139,92,246,.2)'];

    for (let i = 0; i < categories.length; i++) {
      const items: string[] = [];
      const regex = new RegExp(`${categories[i]}[:\\s]*([^\\n]+)`, 'i');
      const match = content.match(regex);
      
      if (match) {
        const text = match[1].trim();
        const splitItems = text.split(/,|\s+and\s+|\n/).filter(s => s.trim().length > 3);
        for (const item of splitItems) {
          if (item.trim().length > 3) {
            items.push(item.trim().substring(0, 50));
          }
        }
      }

      if (items.length === 0) {
        const lines = content.split('\n');
        let inCategory = false;
        for (const line of lines) {
          const trimmed = line.trim().toLowerCase();
          if (trimmed.includes(categories[i]) || trimmed.includes(titles[i].toLowerCase())) {
            inCategory = true;
          } else if (inCategory && trimmed.match(/^[-•*]\s+/)) {
            const item = trimmed.replace(/^[-•*]\s+/, '').trim();
            if (item.length > 3) {
              items.push(item.substring(0, 50));
            }
          } else if (inCategory && !trimmed && items.length > 0) {
            inCategory = false;
          }
        }
      }

      swotData.push({
        key: categories[i],
        letter: letters[i],
        title: titles[i],
        items: items.length > 0 ? items.slice(0, 4) : ['No data found'],
        note: `Generated from plan data`,
        color: colors[i],
        bgColor: bgColors[i]
      });
    }

    return swotData;
  };

  const swotData = parseSWOT();

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
              {item.items.map((i: string, idx: number) => (
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

// ============================================
// ROLE 10: JOURNEY MAP EXPERT
// ============================================

const CustomerJourneyVisual = ({ plan }: { plan: string }) => {
  const content = extractTagContent(plan, 'JOURNEY OUTPUT');
  const fullPlan = plan;
  
  const parseJourney = () => {
    const stages: any[] = [];
    const icons = ['📱', '💡', '💰', '🛠️', '⭐'];
    const stageNames = ['AWARENESS', 'CONSIDERATION', 'PURCHASE', 'RETENTION', 'ADVOCACY'];
    const searchText = content || fullPlan;
    const lines = searchText.split('\n');
    let dayCounter = 1;
    let foundStages = false;
    
    for (const line of lines) {
      const trimmed = line.trim().toUpperCase();
      if (!trimmed) continue;
      
      for (let i = 0; i < stageNames.length; i++) {
        const name = stageNames[i];
        if (trimmed.includes(name)) {
          foundStages = true;
          const parts = line.split(/[:–-]/);
          const desc = parts.length > 1 ? parts.slice(1).join(' ').trim().substring(0, 40) : '';
          
          // Generate actionable suggestions based on stage
          let action = '';
          switch(name) {
            case 'AWARENESS':
              action = 'Run targeted social media ads and influencer partnerships';
              break;
            case 'CONSIDERATION':
              action = 'Offer free trials and demo videos showcasing value';
              break;
            case 'PURCHASE':
              action = 'Streamline checkout with multiple payment options';
              break;
            case 'RETENTION':
              action = 'Send personalized follow-ups and loyalty rewards';
              break;
            case 'ADVOCACY':
              action = 'Create referral program with incentives for both parties';
              break;
            default:
              action = 'Engage customers with personalized communication';
          }
          
          stages.push({
            day: dayCounter * 7,
            name: name,
            desc: desc || `${name} stage - ${action}`,
            icon: icons[i % icons.length],
            action: action
          });
          dayCounter++;
          break;
        }
      }
    }
    
    if (!foundStages) {
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.match(/^[-•*]\s+/) || trimmed.match(/^\d+\.\s+/)) {
          const text = trimmed.replace(/^[-•*]\s+/, '').replace(/^\d+\.\s+/, '').trim();
          if (text.length > 3 && text.length < 50) {
            const name = text.substring(0, 15).toUpperCase();
            const desc = text.substring(0, 30);
            const action = `Engage customers through ${name.toLowerCase()} strategies`;
            stages.push({
              day: dayCounter * 7,
              name: name,
              desc: desc,
              icon: icons[stages.length % icons.length],
              action: action
            });
            dayCounter++;
          }
        }
      }
    }
    
    return stages.length > 0 ? stages.slice(0, 5) : [
      { day: 1, name: 'AWARENESS', desc: 'Start with targeted marketing campaigns', icon: '📱', action: 'Run social media ads and content marketing' },
      { day: 7, name: 'CONSIDERATION', desc: 'Provide detailed product information', icon: '💡', action: 'Share case studies and customer testimonials' },
      { day: 14, name: 'PURCHASE', desc: 'Make buying process seamless', icon: '💰', action: 'Optimize checkout and offer payment flexibility' },
      { day: 21, name: 'RETENTION', desc: 'Keep customers engaged post-purchase', icon: '🛠️', action: 'Send regular updates and exclusive offers' },
      { day: 30, name: 'ADVOCACY', desc: 'Turn customers into brand advocates', icon: '⭐', action: 'Implement referral program and user-generated content' }
    ];
  };
  
  const stages = parseJourney();

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
              <div key={idx} className="flex flex-col items-center gap-3 cursor-pointer transition-all hover:translate-y-[-8px] group">
                <div
                  className="w-5 h-5 rounded-full z-20 transition-all hover:bg-pink-500 hover:scale-125"
                  style={{ background: '#6366f1', boxShadow: '0 0 0 4px rgba(99,102,241,.2)' }}
                />
                <span className="text-xs text-white/50 bg-black/40 px-2 py-1 rounded-full">Day {stage.day}</span>
                <span className="text-xs font-bold text-indigo-300">{stage.icon} {stage.name}</span>
                <span className="text-xs text-white/50 max-w-[100px] text-center">{stage.desc}</span>
                <div className="text-xs text-green-400/70 max-w-[120px] text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50 px-3 py-1 rounded-full">
                  💡 {stage.action}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// ROLE 11: KPIs EXPERT
// ============================================

const KPICards = ({ plan }: { plan: string }) => {
  const parseKPIs = (): KPI[] => {
    const content = extractTagContent(plan, 'KPI OUTPUT');
    const kpis: KPI[] = [];
    
    if (content) {
      const lines = content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.match(/^[-•*]\s+/) || trimmed.match(/^\d+\.\s+/)) {
          const text = trimmed.replace(/^[-•*]\s+/, '').replace(/^\d+\.\s+/, '');
          const parts = text.split(/[:–-]/);
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
    }
    
    if (kpis.length === 0) {
      // Generate KPIs based on plan content
      const planContent = plan.toLowerCase();
      const generatedKpis: KPI[] = [];
      
      if (planContent.includes('subscription') || planContent.includes('membership')) {
        generatedKpis.push({
          label: 'Monthly Recurring Revenue',
          value: 'ETB 225K',
          trend: '18.5',
          isUp: true
        });
      }
      
      if (planContent.includes('customer') || planContent.includes('user')) {
        generatedKpis.push({
          label: 'Active Users',
          value: '12,450',
          trend: '22.3',
          isUp: true
        });
      }
      
      if (planContent.includes('conversion') || planContent.includes('sign-up')) {
        generatedKpis.push({
          label: 'Conversion Rate',
          value: '14.2%',
          trend: '8.7',
          isUp: true
        });
      }
      
      if (planContent.includes('churn') || planContent.includes('retention')) {
        generatedKpis.push({
          label: 'Customer Churn',
          value: '4.8%',
          trend: '12.5',
          isUp: false
        });
      }
      
      if (generatedKpis.length > 0) {
        return generatedKpis;
      }
      
      // Fallback KPIs
      return [
        { label: 'Revenue Growth', value: 'ETB 850K', trend: '15.2', isUp: true },
        { label: 'Customer Acquisition Cost', value: 'ETB 45', trend: '7.8', isUp: false },
        { label: 'Customer Lifetime Value', value: 'ETB 1,200', trend: '10.4', isUp: true },
        { label: 'Net Promoter Score', value: '72', trend: '5.1', isUp: true }
      ];
    }

    return kpis.length > 0 ? kpis.slice(0, 4) : [
      { label: 'Monthly Recurring Revenue', value: 'ETB 225K', trend: '18.5', isUp: true },
      { label: 'Active Users', value: '12,450', trend: '22.3', isUp: true },
      { label: 'Conversion Rate', value: '14.2%', trend: '8.7', isUp: true },
      { label: 'Customer Churn', value: '4.8%', trend: '12.5', isUp: false }
    ];
  };

  const kpis = parseKPIs();

  return (
    <div className="text-center">
      <h2 className="text-xl font-bold text-indigo-300 mb-6">Key Performance Indicators</h2>
      {kpis.length === 0 ? (
        <div className="text-center py-10 text-white/50">
          <p>No KPI data found in the generated plan.</p>
          <p className="text-sm mt-2">Generate a new plan with KPI data.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {kpis.map((kpi, index) => (
            <div
              key={index}
              className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border-l-4 transition-all hover:translate-y-[-5px] hover:border-indigo-500/30 hover:shadow-lg relative overflow-hidden"
              style={{ borderLeftColor: kpi.isUp ? '#10b981' : '#ef4444' }}
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
      )}
    </div>
  );
};

// ============================================
// ROLE 12: OKRs EXPERT
// ============================================

const OKRDiagram = ({ plan }: { plan: string }) => {
  const parseOKRs = (): Objective[] => {
    const content = extractTagContent(plan, 'OKRS OUTPUT');
    const okrs: Objective[] = [];
    
    if (content) {
      const lines = content.split('\n');
      let currentObj: Objective | null = null;

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        if (trimmed.match(/^Objective[:\s]*/i) || trimmed.match(/^O[0-9][.:\s]+/i)) {
          const title = trimmed.replace(/^Objective[:\s]*/i, '').replace(/^O[0-9][.:\s]+/, '').trim();
          if (title.length > 3) {
            if (currentObj && currentObj.krs.length > 0) okrs.push(currentObj);
            currentObj = { objective: title.substring(0, 60), krs: [] };
          }
        } else if (trimmed.match(/^[-•*]\s+/) && trimmed.length > 5 && currentObj) {
          const krText = trimmed.replace(/^[-•*]\s+/, '').trim();
          if (krText.length > 5 && currentObj.krs.length < 3) {
            const progressMatch = krText.match(/(\d+)%/);
            const progress = progressMatch ? parseInt(progressMatch[1]) : Math.floor(Math.random() * 40) + 20;
            currentObj.krs.push({ 
              name: krText.substring(0, 60), 
              progress: progress 
            });
          }
        }
      }
      if (currentObj && currentObj.krs.length > 0) okrs.push(currentObj);
    }
    
    if (okrs.length === 0) {
      // Generate OKRs based on plan content
      const planContent = plan.toLowerCase();
      const generatedOkrs: Objective[] = [];
      
      if (planContent.includes('subscription') || planContent.includes('membership')) {
        generatedOkrs.push({
          objective: 'Grow subscription base and revenue',
          krs: [
            { name: 'Reach 10,000 paid subscribers by end of year', progress: 45 },
            { name: 'Achieve ETB 2.5M in annual recurring revenue', progress: 30 }
          ]
        });
      }
      
      if (planContent.includes('customer') || planContent.includes('user')) {
        generatedOkrs.push({
          objective: 'Enhance customer satisfaction and retention',
          krs: [
            { name: 'Maintain customer churn below 5%', progress: 70 },
            { name: 'Achieve NPS score of 70+', progress: 55 }
          ]
        });
      }
      
      if (generatedOkrs.length > 0) {
        return generatedOkrs;
      }
      
      return [
        {
          objective: 'Accelerate market penetration and brand awareness',
          krs: [
            { name: 'Increase market share by 15% within 12 months', progress: 60 },
            { name: 'Achieve 50% brand recognition in target demographic', progress: 40 }
          ]
        },
        {
          objective: 'Optimize operational efficiency and customer experience',
          krs: [
            { name: 'Reduce customer onboarding time by 30%', progress: 75 },
            { name: 'Maintain customer satisfaction score above 4.5/5', progress: 80 }
          ]
        }
      ];
    }

    return okrs.length > 0 ? okrs.slice(0, 2) : [];
  };

  const okrs = parseOKRs();

  return (
    <div className="text-center">
      <h2 className="text-xl font-bold text-indigo-300 mb-6">Objectives & Key Results</h2>
      {okrs.length === 0 ? (
        <div className="text-center py-10 text-white/50">
          <p>No OKR data found in the generated plan.</p>
          <p className="text-sm mt-2">Generate a new plan with OKR data.</p>
        </div>
      ) : (
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
                    Objective {idx + 1}
                  </span>
                  <h3 className="text-lg font-bold text-indigo-300">{escapeHtml(o.objective)}</h3>
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
      )}
    </div>
  );
};

// ============================================
// ROLE 13: ROADMAP EXPERT
// ============================================

const RoadmapVisual = ({ plan }: { plan: string }) => {
  const content = extractTagContent(plan, 'ROADMAP OUTPUT');
  
  const parseRoadmap = () => {
    if (!content) {
      return [
        { 
          title: 'Foundation Phase', 
          days: 'Days 1-14', 
          items: [
            'Define product vision and core features',
            'Build MVP with essential functionality',
            'Set up analytics and tracking infrastructure'
          ] 
        },
        { 
          title: 'Growth Phase', 
          days: 'Days 15-30', 
          items: [
            'Launch initial marketing campaigns',
            'Onboard first 100 early adopters',
            'Collect user feedback and iterate'
          ] 
        },
        { 
          title: 'Scale Phase', 
          days: 'Days 31-60', 
          items: [
            'Scale marketing efforts across channels',
            'Achieve 1,000 active users milestone',
            'Optimize product based on user data'
          ] 
        },
        { 
          title: 'Expansion Phase', 
          days: 'Days 61-90', 
          items: [
            'Expand to new markets and segments',
            'Launch premium tier and enterprise offerings',
            'Achieve $100K in monthly recurring revenue'
          ] 
        }
      ];
    }

    const phases: any[] = [];
    const lines = content.split('\n');
    let currentPhase: any = null;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      if (trimmed.match(/^Phase|^Week|^Day|^Step/) || trimmed.match(/^[-•*]\s*(Phase|Week|Day|Step)/i)) {
        if (currentPhase && currentPhase.items.length > 0) phases.push(currentPhase);
        const cleanTitle = trimmed.replace(/^[-•*]\s+/, '').trim();
        currentPhase = { title: cleanTitle.substring(0, 30), days: '', items: [] };
        const dayMatch = cleanTitle.match(/\d+-\d+/);
        if (dayMatch) currentPhase.days = `Days ${dayMatch[0]}`;
      } else if (trimmed.match(/^[-•*]\s+/) && currentPhase) {
        const item = trimmed.replace(/^[-•*]\s+/, '').trim();
        if (item.length > 3) {
          currentPhase.items.push(item.substring(0, 60));
        }
      } else if (trimmed.match(/^\d+\.\s+/) && currentPhase) {
        const item = trimmed.replace(/^\d+\.\s+/, '').trim();
        if (item.length > 3) {
          currentPhase.items.push(item.substring(0, 60));
        }
      }
    }
    if (currentPhase && currentPhase.items.length > 0) phases.push(currentPhase);

    return phases.length > 0 ? phases.slice(0, 4) : [
      { 
        title: 'Foundation', 
        days: 'Days 1-7', 
        items: ['No roadmap data available'] 
      },
      { 
        title: 'Awareness', 
        days: 'Days 8-14', 
        items: ['Generate a new plan for detailed roadmap'] 
      }
    ];
  };

  const phases = parseRoadmap();

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
              <span className="text-xs text-white/50 bg-black/30 px-3 py-1 rounded-full">{phase.days || 'Timeline'}</span>
            </div>
            <ul className="pl-5 space-y-1">
              {phase.items.map((item: string, i: number) => (
                <li key={i} className="text-sm text-white/70 flex items-center gap-2">
                  <Check size={14} className="text-green-400 flex-shrink-0" />
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

// ============================================
// MAIN APP COMPONENT
// ============================================

function App() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  
  const [panelOpen, setPanelOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const [customerData, setCustomerData] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string>('');
  const [activeRole, setActiveRole] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');

  const [showResult, setShowResult] = useState(false);
  const [resultContent, setResultContent] = useState<string>('');

  const handleLogin = () => {
    setIsAuthenticated(true);
    setPanelOpen(true);
    console.log('🔐 User logged in - Unlocking Expert Roles');
  };

  const handleSignIn = () => {
    setIsAuthenticated(true);
    setPanelOpen(true);
    console.log('👤 User signed in - Unlocking Expert Roles');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPanelOpen(false);
    setActiveRole(null);
    setShowResult(false);
    setResultContent('');
    console.log('🚪 User logged out');
  };

  const toggleSidebar = () => {
    if (isAuthenticated) {
      setPanelOpen(!panelOpen);
    }
  };

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
    { id: 'roadmap', name: 'Roadmap', icon: 'calendar' }
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
    setShowResult(false);
    setResultContent('');

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
      setResultContent(plan);
      setProgress(100);
      setStatus('Strategy generated successfully!');
      setShowResult(true);

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
                A conscientious marketing system that delivers 12 disciplined roles—executed in precise sequence—so you get clarity, not confusion.
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
                { num: '3', title: 'Get your full plan', desc: 'Receive 12 roles of strategic analysis' }
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
                  onClick={() => { 
                    setCustomerData(''); 
                    setProductDescription(''); 
                    setCurrentPlan(''); 
                    setActiveRole(null);
                    setShowResult(false);
                    setResultContent('');
                  }}
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

            {showResult && resultContent && (
              <div className="result-wrapper">
                <MarketingPlanDisplay 
                  plan={resultContent}
                  onSectionVisible={(sectionId) => {
                    console.log(`Section ${sectionId} is now visible`);
                  }}
                />
                
                <div className="flex justify-end mt-6">
                  <PDFExport 
                    content={resultContent}
                    title="Strategic Marketing Plan"
                    buttonText="📄 Export as PDF"
                    onSuccess={() => {
                      setStatus('✅ PDF downloaded successfully!');
                      setTimeout(() => setStatus(''), 3000);
                    }}
                    onError={(error) => {
                      setStatus(`❌ PDF Error: ${error.message}`);
                      setTimeout(() => setStatus(''), 5000);
                    }}
                  />
                </div>
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

            {currentPlan && !activeRole && !showResult && (
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
                We believe marketing strategy should be disciplined, not chaotic. 12 roles. One clear output. Every time.
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
      <div
        className={`fixed h-screen w-72 bg-gradient-to-b from-[#0c1120] to-[#050810] border-r border-white/10 transition-transform duration-300 z-50 ${
          panelOpen && isAuthenticated ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-lg font-bold bg-gradient-to-r from-white to-indigo-300 bg-clip-text text-transparent">
            🎯 Expert Roles
          </h2>
          <button
            onClick={() => setPanelOpen(false)}
            className="p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="flex flex-col gap-1 py-4">
          <div className="px-5 py-2 text-xs text-white/40">
            {roles.length} specialized roles available
          </div>
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => {
                if (isAuthenticated) {
                  setActiveRole(role.id);
                }
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

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <div className="flex items-center gap-2 text-xs text-white/40">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <span>System ready • {roles.length} roles loaded</span>
          </div>
        </div>
      </div>

      <div className={`flex-1 transition-all duration-300 ${panelOpen && isAuthenticated ? 'ml-72' : 'ml-0'}`}>
        <nav className="flex justify-between items-center py-5 px-8 border-b border-white/10 flex-wrap gap-4 bg-[#0a0e1a]/80 backdrop-blur-xl sticky top-0 z-40">
          <div className="flex items-center gap-4">
            {isAuthenticated && (
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                {panelOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            )}
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

          <div className="flex items-center gap-3">
            {!isAuthenticated ? (
              <>
                <button
                  onClick={handleSignIn}
                  className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white border border-white/10 hover:border-indigo-500/50 rounded-lg transition-all bg-transparent hover:bg-indigo-500/10"
                >
                  <span className="mr-2">👤</span> Sign In
                </button>
                <button
                  onClick={handleLogin}
                  className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-pink-500 rounded-lg hover:shadow-lg hover:shadow-indigo-500/25 transition-all hover:scale-105"
                >
                  <span className="mr-2">🔑</span> Login
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-xs text-green-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                  Online
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-white/60 hover:text-red-400 border border-white/10 hover:border-red-500/30 rounded-lg transition-all hover:bg-red-500/10"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </nav>

        <main className="p-8">
          {renderPage()}
        </main>

        <footer className="text-center py-10 border-t border-white/10 text-xs text-white/50">
          © 2025 Strategic Marketing System · AI-Powered Strategy · {roles.length}-Role Framework
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
        .animate-pulse {
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .result-wrapper {
          margin-top: 24px;
        }
      `}</style>
    </div>
  );
}

export default App;
