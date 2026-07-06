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

// ============================================
// TYPES
// ============================================

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

interface ParsedSegment {
  name: string;
  description: string;
  size: string;
  characteristics: string[];
  percentage?: number;
}

interface PESTLEItem {
  key: string;
  icon: string;
  title: string;
  insight: string;
  impact: 'high' | 'medium' | 'low';
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

const API_BASE = 'https://Bisratprompt-marketing-system-api.hf.space';

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
    const regex = new RegExp(`\\[${possibleTag}\\]([\\s\\S]*?)(?=\\n\\n---|\\n\\[|$)`, 'i');
    const match = plan.match(regex);
    if (match && match[1]) {
      const trimmed = match[1].trim();
      if (trimmed.length > 5) {
        return trimmed;
      }
    }
    
    const boldRegex = new RegExp(`\\*\\*${possibleTag}\\*\\*\\s*\\n([\\s\\S]*?)(?=\\n\\n---|\\n\\[|\\n\\*\\*|$)`, 'i');
    const boldMatch = plan.match(boldRegex);
    if (boldMatch && boldMatch[1]) {
      const trimmed = boldMatch[1].trim();
      if (trimmed.length > 5) {
        return trimmed;
      }
    }
  }
  
  const tagWords = tag.split(' ');
  if (tagWords.length > 0) {
    const firstWord = tagWords[0];
    const fallbackRegex = new RegExp(`\\[.*?${firstWord}.*?\\]([\\s\\S]*?)(?=\\n\\n---|\\n\\[|$)`, 'i');
    const fallbackMatch = plan.match(fallbackRegex);
    if (fallbackMatch && fallbackMatch[1] && fallbackMatch[1].trim().length > 5) {
      return fallbackMatch[1].trim();
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
// ICON COMPONENT
// ============================================

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
// VISUALIZATION COMPONENTS
// ============================================

// ===== SEGMENTATION VISUAL =====
const SegmentationVisual = ({ plan }: { plan: string }) => {
  const content = extractTagContent(plan, 'SEGMENTATION OUTPUT');
  
  const parseSegments = (text: string): ParsedSegment[] => {
    const segments: ParsedSegment[] = [];
    if (!text) return segments;
    
    const primaryMatch = text.match(/Primary Target Segment:?\s*([^\n]+)/i);
    if (primaryMatch) {
      const desc = primaryMatch[1].trim();
      const sizeMatch = desc.match(/(\d+[-\s]*\d*)\s*(?:million|M|thousand|K)/i);
      segments.push({
        name: 'Primary Segment',
        description: desc.substring(0, 100) + (desc.length > 100 ? '...' : ''),
        size: sizeMatch ? sizeMatch[0] : 'Varies',
        characteristics: text.match(/Characteristics:?\s*([^\n]+)/i)?.[1]?.split(',').map(s => s.trim()) || []
      });
    }
    
    const secondaryMatch = text.match(/Secondary Segments?:?\s*([\s\S]*?)(?=\n\n|\n\d\.|\n•|$)/i);
    if (secondaryMatch) {
      const secText = secondaryMatch[1];
      const secList = secText.split(/\d\.|\n•|\n-/).filter(s => s.trim());
      secList.forEach((item, i) => {
        if (item.trim()) {
          segments.push({
            name: `Segment ${i + 2}`,
            description: item.trim().substring(0, 80),
            size: 'Varies',
            characteristics: []
          });
        }
      });
    }
    
    // Calculate percentages if not present
    if (segments.length > 0) {
      const total = segments.length;
      segments.forEach((seg, idx) => {
        seg.percentage = Math.round(((total - idx) / total) * 100 / (total > 1 ? 1.5 : 1));
      });
    }
    
    return segments;
  };

  const segments = parseSegments(content);
  const colors = ['#818cf8', '#34d399', '#fbbf24', '#f87171', '#a78bfa'];
  const categoryIcons = ['👤', '🌍', '🧠', '🔄'];

  if (!content || segments.length === 0) {
    return (
      <div className="text-center py-10 text-white/50">
        <p>No segmentation data found in the generated plan.</p>
        <p className="text-sm mt-2">Try regenerating the plan.</p>
      </div>
    );
  }

  return (
    <div className="text-center py-6">
      <h2 className="text-xl font-bold text-indigo-300 mb-6">🎯 Segmentation Analysis</h2>
      
      {/* Pie Chart */}
      <div className="relative max-w-xs mx-auto mb-8">
        <svg viewBox="0 0 200 200" className="w-full h-auto">
          {segments.map((seg, idx) => {
            const percentage = seg.percentage || 0;
            const startAngle = segments.slice(0, idx).reduce((acc, s) => acc + (s.percentage || 0), 0) * 3.6;
            const endAngle = startAngle + percentage * 3.6;
            const startRad = (startAngle - 90) * Math.PI / 180;
            const endRad = (endAngle - 90) * Math.PI / 180;
            const x1 = 100 + 80 * Math.cos(startRad);
            const y1 = 100 + 80 * Math.sin(startRad);
            const x2 = 100 + 80 * Math.cos(endRad);
            const y2 = 100 + 80 * Math.sin(endRad);
            const largeArc = percentage > 50 ? 1 : 0;
            
            return (
              <g key={idx}>
                <path
                  d={`M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`}
                  fill={colors[idx % colors.length]}
                  opacity="0.85"
                  className="transition-all duration-300 hover:opacity-100 hover:scale-105 cursor-pointer"
                  stroke="#0a0e1a"
                  strokeWidth="2"
                />
                <text
                  x={100 + 55 * Math.cos((startRad + endRad) / 2)}
                  y={100 + 55 * Math.sin((startRad + endRad) / 2)}
                  fill="white"
                  fontSize="12"
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {percentage}%
                </text>
              </g>
            );
          })}
          <circle cx="100" cy="100" r="30" fill="#0a0e1a" stroke="#818cf8" strokeWidth="2" />
          <text x="100" y="95" fill="white" fontSize="12" fontWeight="bold" textAnchor="middle">
            {segments.length}
          </text>
          <text x="100" y="110" fill="white" fontSize="8" textAnchor="middle" opacity="0.6">
            Segments
          </text>
        </svg>
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
        {['Demographic', 'Geographic', 'Psychographic', 'Behavioral'].map((category, idx) => (
          <div
            key={idx}
            className="bg-gradient-to-br from-slate-800/80 to-slate-900/90 rounded-xl p-4 border border-white/10 transition-all hover:translate-y-[-4px] hover:border-indigo-500/40"
            style={{ borderTop: `3px solid ${colors[idx % colors.length]}` }}
          >
            <div className="text-2xl mb-2">{categoryIcons[idx]}</div>
            <h3 className="text-sm font-semibold text-white mb-1">{category}</h3>
            <p className="text-xs text-white/50">
              {segments.length > idx ? segments[idx]?.description?.substring(0, 30) || 'N/A' : 'N/A'}
            </p>
            <div className="mt-2 text-xs text-indigo-400">
              {segments.length > idx ? `${segments[idx]?.percentage || 0}%` : '0%'}
            </div>
          </div>
        ))}
      </div>

      {/* Segment Details */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 max-w-4xl mx-auto text-left">
        {segments.map((seg, idx) => (
          <div key={idx} className="bg-white/5 rounded-lg p-3 border border-white/10">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-white">{seg.name}</span>
              <span className="text-xs text-indigo-400">{seg.percentage}%</span>
            </div>
            <p className="text-xs text-white/60 mt-1">{seg.description}</p>
            {seg.characteristics.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {seg.characteristics.slice(0, 2).map((char, i) => (
                  <span key={i} className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-white/50">
                    {char}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ===== MARKET SIZING VENN DIAGRAM =====
const MarketSizingVennDiagram = ({ plan }: { plan: string }) => {
  const { tam, sam, som } = parseMarketSizing(plan);
  const content = extractTagContent(plan, 'TAMSAMSOM OUTPUT');
  
  const maxVal = Math.max(tam, 1);
  const samPct = (sam / maxVal) * 100;
  const somPct = (som / maxVal) * 100;

  if (!content && tam === 0) {
    return (
      <div className="text-center py-10 text-white/50">
        <p>No market sizing data found in the generated plan.</p>
        <p className="text-sm mt-2">Try regenerating the plan.</p>
      </div>
    );
  }

  return (
    <div className="text-center py-6">
      <h2 className="text-xl font-bold text-indigo-300 mb-6">📈 Market Sizing (TAM/SAM/SOM)</h2>
      
      {tam > 0 ? (
        <>
          <div className="relative max-w-3xl mx-auto h-64 mb-8">
            <div className="absolute inset-0 flex items-center justify-center">
              <div 
                className="absolute rounded-full border-2 border-blue-500/30 bg-blue-500/10 transition-all duration-500 hover:scale-105"
                style={{ width: '100%', height: '100%', maxWidth: '300px', maxHeight: '300px' }}
              />
              <div 
                className="absolute rounded-full border-2 border-indigo-500/40 bg-indigo-500/15 transition-all duration-500 hover:scale-105"
                style={{ width: '70%', height: '70%', maxWidth: '210px', maxHeight: '210px' }}
              />
              <div 
                className="absolute rounded-full border-2 border-purple-500/50 bg-purple-500/20 flex items-center justify-center transition-all duration-500 hover:scale-105"
                style={{ width: '35%', height: '35%', maxWidth: '105px', maxHeight: '105px' }}
              >
                <span className="text-2xl font-bold text-purple-400">{som.toLocaleString()}</span>
              </div>
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-sm font-semibold text-blue-400">TAM</div>
              <div className="absolute top-1/2 -translate-y-1/2 -right-16 text-sm font-semibold text-indigo-400">SAM</div>
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-sm font-semibold text-purple-400">SOM</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-xl p-5 transition-all hover:translate-y-[-4px]">
              <div className="text-2xl font-bold text-blue-400">{tam.toLocaleString()}</div>
              <div className="text-sm text-white/60 mt-1">TAM</div>
              <div className="text-xs text-white/40 mt-1">Total Addressable Market</div>
              <div className="mt-2 w-full bg-white/10 rounded-full h-1.5">
                <div className="bg-blue-400 h-1.5 rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
            <div className="bg-gradient-to-br from-indigo-500/20 to-indigo-600/10 border border-indigo-500/30 rounded-xl p-5 transition-all hover:translate-y-[-4px]">
              <div className="text-2xl font-bold text-indigo-400">{sam.toLocaleString()}</div>
              <div className="text-sm text-white/60 mt-1">SAM</div>
              <div className="text-xs text-white/40 mt-1">Serviceable Addressable Market</div>
              <div className="mt-2 w-full bg-white/10 rounded-full h-1.5">
                <div className="bg-indigo-400 h-1.5 rounded-full" style={{ width: `${samPct}%` }} />
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-xl p-5 transition-all hover:translate-y-[-4px]">
              <div className="text-2xl font-bold text-purple-400">{som.toLocaleString()}</div>
              <div className="text-sm text-white/60 mt-1">SOM</div>
              <div className="text-xs text-white/40 mt-1">Serviceable Obtainable Market</div>
              <div className="mt-2 w-full bg-white/10 rounded-full h-1.5">
                <div className="bg-purple-400 h-1.5 rounded-full" style={{ width: `${somPct}%` }} />
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white/5 rounded-xl p-6 text-left max-w-4xl mx-auto">
          <div 
            className="prose prose-invert max-w-none text-white/80"
            dangerouslySetInnerHTML={{ __html: formatContent(content || 'No market sizing data found.') }}
          />
        </div>
      )}
    </div>
  );
};

// ===== PESTLE VISUAL =====
const PESTLEVisual = ({ plan }: { plan: string }) => {
  const parsePESTLE = (): PESTLEItem[] => {
    const pestleData: PESTLEItem[] = [];
    const categories = [
      { key: 'political', icon: '🏛️', title: 'Political' },
      { key: 'economic', icon: '📈', title: 'Economic' },
      { key: 'social', icon: '👥', title: 'Social' },
      { key: 'technological', icon: '💻', title: 'Technological' },
      { key: 'legal', icon: '⚖️', title: 'Legal' },
      { key: 'environmental', icon: '🌿', title: 'Environmental' }
    ];

    const pestleSection = plan.match(/\[PESTLE\s+OUTPUT\]([\s\S]*?)(?=\n\n---|\n\[|$)/i);
    let searchText = '';
    
    if (pestleSection && pestleSection[1]) {
      searchText = pestleSection[1].trim();
    }
    
    if (!searchText) return [];

    for (const cat of categories) {
      let insight = '';
      let impact: 'high' | 'medium' | 'low' = 'medium';
      
      const pattern = new RegExp(
        `\\*\\*${cat.title}\\s+Drivers\\*\\*[\\s\\n]*([\\s\\S]*?)(?=\\n\\*\\*|\\n\\n|$)`,
        'i'
      );
      
      const match = searchText.match(pattern);
      if (match && match[1]) {
        const content = match[1].trim();
        const bulletPoints = content.split('\n')
          .filter(line => line.trim().match(/^[-•*]\s+/))
          .map(line => line.replace(/^[-•*]\s+/, '').trim());
        
        if (bulletPoints.length > 0) {
          insight = bulletPoints.join(' ');
        } else {
          const firstLine = content.split('\n')[0]?.trim() || '';
          if (firstLine.length > 10) {
            insight = firstLine;
          }
        }
      }
      
      if (!insight) {
        const simplePattern = new RegExp(
          `${cat.title}\\s+Drivers[\\s\\n]*([\\s\\S]*?)(?=\\n[A-Z]|\\n\\*\\*|$)`,
          'i'
        );
        const simpleMatch = searchText.match(simplePattern);
        if (simpleMatch && simpleMatch[1]) {
          const content = simpleMatch[1].trim();
          const bulletPoints = content.split('\n')
            .filter(line => line.trim().match(/^[-•*]\s+/))
            .map(line => line.replace(/^[-•*]\s+/, '').trim());
          
          if (bulletPoints.length > 0) {
            insight = bulletPoints.join(' ');
          } else {
            const firstLine = content.split('\n')[0]?.trim() || '';
            if (firstLine.length > 10) {
              insight = firstLine;
            }
          }
        }
      }
      
      if (insight) {
        insight = insight.replace(/\*\*/g, '').trim();
        
        const lowerInsight = insight.toLowerCase();
        if (lowerInsight.includes('high') || lowerInsight.includes('significant') || lowerInsight.includes('major') || lowerInsight.includes('strong')) {
          impact = 'high';
        } else if (lowerInsight.includes('low') || lowerInsight.includes('minor') || lowerInsight.includes('weak')) {
          impact = 'low';
        }
        
        pestleData.push({
          key: cat.key,
          icon: cat.icon,
          title: cat.title,
          insight: insight.substring(0, 150),
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

  if (pestleData.length === 0) {
    return (
      <div className="text-center py-10 text-white/50">
        <p>No PESTLE data found in the generated plan.</p>
        <p className="text-sm mt-2">Try regenerating the plan.</p>
      </div>
    );
  }

  return (
    <div className="text-center py-6">
      <h2 className="text-xl font-bold text-indigo-300 mb-6">PESTLE Analysis</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {pestleData.map((item) => (
          <div
            key={item.key}
            className="bg-gradient-to-br from-slate-800/80 to-slate-900/90 rounded-xl p-5 border border-white/10 transition-all hover:translate-y-[-6px] hover:border-indigo-500/40 hover:shadow-lg cursor-pointer relative overflow-hidden"
          >
            <div 
              className="absolute top-0 left-0 w-full h-1"
              style={{ background: `linear-gradient(90deg, ${colorMap[item.key]?.text || '#818cf8'}, ${colorMap[item.key]?.text || '#818cf8'})` }}
            />
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
    </div>
  );
};

// ===== PORTER'S FORCES VISUAL =====
const PortersVisual = ({ plan }: { plan: string }) => {
  const content = extractTagContent(plan, 'PORTERS OUTPUT');
  
  const forces = [
    { name: 'Threat of New Entrants', icon: '🚪', color: '#818cf8' },
    { name: 'Bargaining Power of Buyers', icon: '🛒', color: '#34d399' },
    { name: 'Bargaining Power of Suppliers', icon: '🏭', color: '#fbbf24' },
    { name: 'Threat of Substitutes', icon: '🔄', color: '#f87171' },
    { name: 'Industry Rivalry', icon: '⚔️', color: '#a78bfa' }
  ];

  const getForceRating = (text: string, forceName: string): 'High' | 'Medium' | 'Low' => {
    const lower = text?.toLowerCase() || '';
    if (lower.includes(forceName.toLowerCase())) {
      const context = lower.substring(
        Math.max(0, lower.indexOf(forceName.toLowerCase()) - 30),
        Math.min(lower.length, lower.indexOf(forceName.toLowerCase()) + 50)
      );
      if (context.includes('high') || context.includes('strong')) return 'High';
      if (context.includes('low') || context.includes('weak')) return 'Low';
    }
    return 'Medium';
  };

  if (!content) {
    return (
      <div className="text-center py-10 text-white/50">
        <p>No Porter's Forces data found in the generated plan.</p>
        <p className="text-sm mt-2">Try regenerating the plan.</p>
      </div>
    );
  }

  return (
    <div className="text-center py-6">
      <h2 className="text-xl font-bold text-indigo-300 mb-6">🏛️ Porter's Five Forces</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {forces.map((force, idx) => {
          const rating = getForceRating(content, force.name);
          const color = rating === 'High' ? 'text-red-400 border-red-500/30' : 
                       rating === 'Medium' ? 'text-yellow-400 border-yellow-500/30' : 
                       'text-green-400 border-green-500/30';
          return (
            <div
              key={idx}
              className="bg-gradient-to-br from-slate-800/80 to-slate-900/90 rounded-xl p-4 border border-white/10 transition-all hover:translate-y-[-4px] hover:border-indigo-500/40"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{force.icon}</span>
                <span className="text-sm font-semibold text-white">{force.name}</span>
              </div>
              <div className={`text-xs font-bold uppercase px-2 py-1 rounded-full inline-block ${color} bg-white/5`}>
                {rating} Impact
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ===== COMPETITORS VISUAL =====
const CompetitorsVisual = ({ plan }: { plan: string }) => {
  const content = extractTagContent(plan, 'COMPETITOR OUTPUT');
  
  const parseCompetitors = (text: string): { name: string; threat: string; strengths: string[]; weaknesses: string[] }[] => {
    const competitors: { name: string; threat: string; strengths: string[]; weaknesses: string[] }[] = [];
    if (!text) return competitors;
    
    const lines = text.split('\n').filter(l => l.trim());
    let current: any = null;
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.match(/^[-•*]\s*(.+?)(?:\s*\(|\s*-)/)) {
        const nameMatch = trimmed.match(/^[-•*]\s*([^:(]+)/);
        if (nameMatch && current) {
          competitors.push(current);
          current = null;
        }
        if (nameMatch) {
          current = { name: nameMatch[1].trim(), threat: 'Medium', strengths: [], weaknesses: [] };
          const threatMatch = trimmed.match(/threat:\s*(high|medium|low)/i);
          if (threatMatch) current.threat = threatMatch[1];
        }
      } else if (current && trimmed.includes('strength')) {
        const strengthMatch = trimmed.match(/strength(?:s)?:?\s*(.+)/i);
        if (strengthMatch) current.strengths.push(strengthMatch[1].trim());
      } else if (current && trimmed.includes('weakness')) {
        const weaknessMatch = trimmed.match(/weakness(?:es)?:?\s*(.+)/i);
        if (weaknessMatch) current.weaknesses.push(weaknessMatch[1].trim());
      }
    }
    if (current) competitors.push(current);
    
    return competitors;
  };

  const competitors = parseCompetitors(content);
  const threatColors = {
    high: 'text-red-400 border-red-500/30 bg-red-500/10',
    medium: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
    low: 'text-green-400 border-green-500/30 bg-green-500/10'
  };

  if (competitors.length === 0) {
    return (
      <div className="text-center py-10 text-white/50">
        <p>No competitor data found in the generated plan.</p>
        <p className="text-sm mt-2">Try regenerating the plan.</p>
      </div>
    );
  }

  return (
    <div className="text-center py-6">
      <h2 className="text-xl font-bold text-indigo-300 mb-6">👥 Competitor Analysis</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
        {competitors.map((comp, idx) => (
          <div
            key={idx}
            className="bg-gradient-to-br from-slate-800/80 to-slate-900/90 rounded-xl p-5 border border-white/10 transition-all hover:translate-y-[-4px] hover:border-indigo-500/40"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-semibold text-white">{comp.name}</h3>
              <span className={`text-xs font-bold uppercase px-2 py-1 rounded-full border ${threatColors[comp.threat as keyof typeof threatColors] || threatColors.medium}`}>
                {comp.threat} Threat
              </span>
            </div>
            {comp.strengths.length > 0 && (
              <div className="mb-2">
                <span className="text-xs text-green-400 font-semibold">Strengths: </span>
                <span className="text-sm text-white/70">{comp.strengths.join(', ')}</span>
              </div>
            )}
            {comp.weaknesses.length > 0 && (
              <div>
                <span className="text-xs text-red-400 font-semibold">Weaknesses: </span>
                <span className="text-sm text-white/70">{comp.weaknesses.join(', ')}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ===== POSITIONING VISUAL =====
const PositioningVisual = ({ plan }: { plan: string }) => {
  const content = extractTagContent(plan, 'POSITIONING OUTPUT');

  if (!content) {
    return (
      <div className="text-center py-10 text-white/50">
        <p>No positioning data found in the generated plan.</p>
        <p className="text-sm mt-2">Try regenerating the plan.</p>
      </div>
    );
  }

  return (
    <div className="text-center py-6">
      <h2 className="text-xl font-bold text-indigo-300 mb-6">🎯 Brand Positioning</h2>
      <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/90 rounded-xl p-6 border border-white/10 max-w-3xl mx-auto">
        <div 
          className="prose prose-invert max-w-none text-white/80 text-left"
          dangerouslySetInnerHTML={{ __html: formatContent(content) }}
        />
      </div>
    </div>
  );
};

// ===== 4Ps VISUAL =====
const FourPsVisual = ({ plan }: { plan: string }) => {
  const content = extractTagContent(plan, '4PS OUTPUT');
  
  const psData = [
    { name: 'Product', icon: '📦', color: '#818cf8' },
    { name: 'Price', icon: '💰', color: '#34d399' },
    { name: 'Place', icon: '📍', color: '#fbbf24' },
    { name: 'Promotion', icon: '📣', color: '#f87171' }
  ];

  const getPContent = (text: string, pName: string): string => {
    if (!text) return '';
    const regex = new RegExp(`${pName}[\\s\\S]*?(?=\\n\\s*${psData.map(p => p.name).join('|')}|$)`, 'i');
    const match = text.match(regex);
    return match ? match[0].substring(0, 120) + (match[0].length > 120 ? '...' : '') : '';
  };

  if (!content) {
    return (
      <div className="text-center py-10 text-white/50">
        <p>No 4Ps data found in the generated plan.</p>
        <p className="text-sm mt-2">Try regenerating the plan.</p>
      </div>
    );
  }

  return (
    <div className="text-center py-6">
      <h2 className="text-xl font-bold text-indigo-300 mb-6">📦 Marketing Mix (4Ps)</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
        {psData.map((p, idx) => (
          <div
            key={idx}
            className="bg-gradient-to-br from-slate-800/80 to-slate-900/90 rounded-xl p-5 border border-white/10 transition-all hover:translate-y-[-4px] hover:border-indigo-500/40"
            style={{ borderTop: `3px solid ${p.color}` }}
          >
            <div className="text-3xl mb-2">{p.icon}</div>
            <h3 className="text-lg font-semibold text-white mb-2">{p.name}</h3>
            <p className="text-sm text-white/60 leading-relaxed">
              {getPContent(content, p.name) || `Key ${p.name} strategy details...`}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ===== SWOT VISUAL =====
const SWOTVisual = ({ plan }: { plan: string }) => {
  const content = extractTagContent(plan, 'SWOT OUTPUT');
  
  const parseSWOT = (text: string) => {
    const swot = { strengths: [], weaknesses: [], opportunities: [], threats: [] };
    if (!text) return swot;
    
    const sections = ['strengths', 'weaknesses', 'opportunities', 'threats'];
    for (const section of sections) {
      const regex = new RegExp(`${section}[\\s\\S]*?(?=\\n\\s*${sections.map(s => s).join('|')}|$)`, 'i');
      const match = text.match(regex);
      if (match) {
        const items = match[0].split('\n')
          .filter(line => line.trim().match(/^[-•*]\s+/))
          .map(line => line.replace(/^[-•*]\s+/, '').trim())
          .filter(item => item.length > 0);
        swot[section as keyof typeof swot] = items;
      }
    }
    return swot;
  };

  const swot = parseSWOT(content);
  const quadrants = [
    { key: 'strengths', label: 'Strengths', icon: '💪', color: 'text-green-400 border-green-500/30 bg-green-500/5' },
    { key: 'weaknesses', label: 'Weaknesses', icon: '⚠️', color: 'text-red-400 border-red-500/30 bg-red-500/5' },
    { key: 'opportunities', label: 'Opportunities', icon: '🚀', color: 'text-blue-400 border-blue-500/30 bg-blue-500/5' },
    { key: 'threats', label: 'Threats', icon: '⚡', color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/5' }
  ];

  const hasData = Object.values(swot).some(arr => arr.length > 0);

  if (!hasData) {
    return (
      <div className="text-center py-10 text-white/50">
        <p>No SWOT data found in the generated plan.</p>
        <p className="text-sm mt-2">Try regenerating the plan.</p>
      </div>
    );
  }

  return (
    <div className="text-center py-6">
      <h2 className="text-xl font-bold text-indigo-300 mb-6">⚡ SWOT Analysis</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
        {quadrants.map((q) => (
          <div
            key={q.key}
            className={`bg-gradient-to-br from-slate-800/80 to-slate-900/90 rounded-xl p-5 border ${q.color} transition-all hover:translate-y-[-4px]`}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{q.icon}</span>
              <h3 className="text-lg font-semibold text-white">{q.label}</h3>
              <span className="text-xs text-white/40 ml-auto">{swot[q.key as keyof typeof swot].length} items</span>
            </div>
            <ul className="text-left space-y-1">
              {(swot[q.key as keyof typeof swot] as string[]).slice(0, 4).map((item, i) => (
                <li key={i} className="text-sm text-white/70 flex items-start gap-2">
                  <span className="text-white/30 mt-1">•</span>
                  <span>{item}</span>
                </li>
              ))}
              {(swot[q.key as keyof typeof swot] as string[]).length === 0 && (
                <li className="text-sm text-white/40 italic">No items listed</li>
              )}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

// ===== CUSTOMER JOURNEY VISUAL =====
const CustomerJourneyVisual = ({ plan }: { plan: string }) => {
  const content = extractTagContent(plan, 'JOURNEY OUTPUT');
  
  const stages = [
    { name: 'Awareness', icon: '👁️', color: '#818cf8' },
    { name: 'Consideration', icon: '🤔', color: '#34d399' },
    { name: 'Purchase', icon: '🛍️', color: '#fbbf24' },
    { name: 'Retention', icon: '❤️', color: '#f87171' },
    { name: 'Advocacy', icon: '📣', color: '#a78bfa' }
  ];

  if (!content) {
    return (
      <div className="text-center py-10 text-white/50">
        <p>No customer journey data found in the generated plan.</p>
        <p className="text-sm mt-2">Try regenerating the plan.</p>
      </div>
    );
  }

  return (
    <div className="text-center py-6">
      <h2 className="text-xl font-bold text-indigo-300 mb-6">🗺️ Customer Journey Map</h2>
      <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/90 rounded-xl p-6 border border-white/10 max-w-5xl mx-auto">
        <div className="flex flex-wrap justify-between items-center gap-2 mb-6">
          {stages.map((stage, idx) => (
            <div key={idx} className="flex items-center">
              <div className="text-center">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl mx-auto mb-1 transition-all duration-300 hover:scale-110"
                  style={{ background: `${stage.color}30`, border: `2px solid ${stage.color}` }}
                >
                  {stage.icon}
                </div>
                <span className="text-xs text-white/60 font-medium">{stage.name}</span>
              </div>
              {idx < stages.length - 1 && (
                <div className="w-8 h-0.5 bg-white/20 mx-1" />
              )}
            </div>
          ))}
        </div>
        <div 
          className="prose prose-invert max-w-none text-white/80 text-left"
          dangerouslySetInnerHTML={{ __html: formatContent(content) }}
        />
      </div>
    </div>
  );
};

// ===== KPI CARDS VISUAL =====
const KPICards = ({ plan }: { plan: string }) => {
  const content = extractTagContent(plan, 'KPI OUTPUT');
  
  const parseKPIs = (text: string): { label: string; value: string; trend: string; isUp: boolean }[] => {
    const kpis: { label: string; value: string; trend: string; isUp: boolean }[] = [];
    if (!text) return kpis;
    
    const lines = text.split('\n').filter(l => l.trim());
    for (const line of lines) {
      const trimmed = line.trim();
      const match = trimmed.match(/^[-•*]\s*(.+?)[:\s]+([0-9,.%]+)/);
      if (match) {
        kpis.push({
          label: match[1].trim(),
          value: match[2].trim(),
          trend: Math.random() > 0.5 ? '↑' : '↓',
          isUp: Math.random() > 0.5
        });
      }
    }
    return kpis;
  };

  const kpis = parseKPIs(content);
  const colors = ['#818cf8', '#34d399', '#fbbf24', '#f87171', '#a78bfa'];

  if (kpis.length === 0) {
    return (
      <div className="text-center py-10 text-white/50">
        <p>No KPI data found in the generated plan.</p>
        <p className="text-sm mt-2">Try regenerating the plan.</p>
      </div>
    );
  }

  return (
    <div className="text-center py-6">
      <h2 className="text-xl font-bold text-indigo-300 mb-6">📊 Key Performance Indicators</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            className="bg-gradient-to-br from-slate-800/80 to-slate-900/90 rounded-xl p-5 border border-white/10 transition-all hover:translate-y-[-4px] hover:border-indigo-500/40"
            style={{ borderTop: `3px solid ${colors[idx % colors.length]}` }}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-medium text-white/70">{kpi.label}</span>
              <span className={`text-sm font-bold ${kpi.isUp ? 'text-green-400' : 'text-red-400'}`}>
                {kpi.trend}
              </span>
            </div>
            <div className="text-2xl font-bold text-white">{kpi.value}</div>
            <div className="mt-2 w-full bg-white/10 rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full transition-all duration-1000"
                style={{
                  width: `${Math.min(100, parseInt(kpi.value) || 50)}%`,
                  background: `linear-gradient(90deg, ${colors[idx % colors.length]}, ${colors[(idx + 1) % colors.length]})`
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ===== OKR DIAGRAM VISUAL =====
const OKRDiagram = ({ plan }: { plan: string }) => {
  const content = extractTagContent(plan, 'OKRS OUTPUT');
  
  const parseOKRs = (text: string): { objective: string; krs: string[] }[] => {
    const okrs: { objective: string; krs: string[] }[] = [];
    if (!text) return okrs;
    
    const lines = text.split('\n').filter(l => l.trim());
    let current: { objective: string; krs: string[] } | null = null;
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.match(/^[-•*]\s*(Objective|OKR|Goal)[:\s]/i)) {
        if (current) okrs.push(current);
        const objMatch = trimmed.match(/^[-•*]\s*(?:Objective|OKR|Goal)[:\s]*(.+)/i);
        current = { objective: objMatch ? objMatch[1].trim() : trimmed.replace(/^[-•*]\s*/, '').trim(), krs: [] };
      } else if (current && trimmed.match(/^[-•*]\s*KR/i)) {
        const krMatch = trimmed.match(/^[-•*]\s*(?:KR|Key Result)[:\s]*(.+)/i);
        if (krMatch) current.krs.push(krMatch[1].trim());
      } else if (current && trimmed.match(/^[-•*]\s*Key Result/i)) {
        const krMatch = trimmed.match(/^[-•*]\s*Key Result[:\s]*(.+)/i);
        if (krMatch) current.krs.push(krMatch[1].trim());
      } else if (current && trimmed.match(/^[-•*]\s*(?![Objective|OKR|Goal|KR|Key])/)) {
        current.krs.push(trimmed.replace(/^[-•*]\s*/, '').trim());
      }
    }
    if (current) okrs.push(current);
    return okrs;
  };

  const okrs = parseOKRs(content);
  const colors = ['#818cf8', '#34d399', '#fbbf24', '#f87171'];

  if (okrs.length === 0) {
    return (
      <div className="text-center py-10 text-white/50">
        <p>No OKR data found in the generated plan.</p>
        <p className="text-sm mt-2">Try regenerating the plan.</p>
      </div>
    );
  }

  return (
    <div className="text-center py-6">
      <h2 className="text-xl font-bold text-indigo-300 mb-6">🎯 Objectives & Key Results</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
        {okrs.map((okr, idx) => (
          <div
            key={idx}
            className="bg-gradient-to-br from-slate-800/80 to-slate-900/90 rounded-xl p-5 border border-white/10 transition-all hover:translate-y-[-4px] hover:border-indigo-500/40"
            style={{ borderTop: `3px solid ${colors[idx % colors.length]}` }}
          >
            <h3 className="text-md font-semibold text-white mb-3">🎯 {okr.objective}</h3>
            <ul className="text-left space-y-2">
              {okr.krs.slice(0, 4).map((kr, i) => (
                <li key={i} className="text-sm text-white/70 flex items-start gap-2">
                  <span className="text-white/30 mt-0.5">✓</span>
                  <span>{kr}</span>
                </li>
              ))}
              {okr.krs.length === 0 && (
                <li className="text-sm text-white/40 italic">No key results listed</li>
              )}
            </ul>
            <div className="mt-3 pt-3 border-t border-white/10 flex justify-between text-xs text-white/40">
              <span>{okr.krs.length} Key Results</span>
              <span>Progress: {Math.min(100, okr.krs.length * 25)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ===== ROADMAP VISUAL =====
const RoadmapVisual = ({ plan }: { plan: string }) => {
  const content = extractTagContent(plan, 'ROADMAP OUTPUT');
  
  const parseRoadmap = (text: string): { week: string; items: string[] }[] => {
    const roadmap: { week: string; items: string[] }[] = [];
    if (!text) return roadmap;
    
    const lines = text.split('\n').filter(l => l.trim());
    let current: { week: string; items: string[] } | null = null;
    
    for (const line of lines) {
      const trimmed = line.trim();
      const weekMatch = trimmed.match(/^(Week|Phase|Month)\s*[0-9]+/i);
      if (weekMatch) {
        if (current) roadmap.push(current);
        current = { week: trimmed.replace(/^[-•*]\s*/, '').trim(), items: [] };
      } else if (current && trimmed.match(/^[-•*]\s+/)) {
        current.items.push(trimmed.replace(/^[-•*]\s+/, '').trim());
      }
    }
    if (current) roadmap.push(current);
    return roadmap;
  };

  const roadmap = parseRoadmap(content);
  const colors = ['#818cf8', '#34d399', '#fbbf24', '#f87171'];

  if (roadmap.length === 0) {
    return (
      <div className="text-center py-10 text-white/50">
        <p>No roadmap data found in the generated plan.</p>
        <p className="text-sm mt-2">Try regenerating the plan.</p>
      </div>
    );
  }

  return (
    <div className="text-center py-6">
      <h2 className="text-xl font-bold text-indigo-300 mb-6">🗓️ 30-Day Roadmap</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
        {roadmap.map((phase, idx) => (
          <div
            key={idx}
            className="bg-gradient-to-br from-slate-800/80 to-slate-900/90 rounded-xl p-5 border border-white/10 transition-all hover:translate-y-[-4px] hover:border-indigo-500/40"
            style={{ borderTop: `3px solid ${colors[idx % colors.length]}` }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold text-white/40">#{idx + 1}</span>
              <h3 className="text-sm font-semibold text-white">{phase.week}</h3>
            </div>
            <ul className="text-left space-y-1">
              {phase.items.slice(0, 4).map((item, i) => (
                <li key={i} className="text-xs text-white/70 flex items-start gap-2">
                  <span className="text-white/20 mt-0.5">▸</span>
                  <span>{item}</span>
                </li>
              ))}
              {phase.items.length === 0 && (
                <li className="text-xs text-white/40 italic">No tasks listed</li>
              )}
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
                  className={`bg-gradient-to-br from-slate-800/90 to-slate-900/95 border rounded-2xl p-8 text-center transition-all hover:translate-y-[-12px] hover:shadow-xl cursor-pointer relative ${
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
