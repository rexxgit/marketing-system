import { useState } from 'react';
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

// ============================================
// MOCK DATA GENERATOR (Fast Fallback)
// ============================================

const generateMockPlan = (customerData: string, productDescription: string): string => {
  const customer = customerData || "target audience";
  const product = productDescription || "product/service";

  return `[SEGMENTATION OUTPUT]
**Customer Segmentation Analysis**
• Segment 1: Enterprise Leaders (35%) - CTOs and IT Directors at 500+ employee companies
• Segment 2: Growth Managers (40%) - Marketing leads at 50-500 employee companies  
• Segment 3: Startup Founders (25%) - Early-stage company leaders (1-50 employees)

[SEGMENTATION VALUE BREAKDOWN]
• Enterprise Leaders: $8.5M annual value, 12% growth
• Growth Managers: $6.2M annual value, 18% growth
• Startup Founders: $3.1M annual value, 25% growth

[TAMSAMSOM OUTPUT]
• TAM: 125,000,000 (Total Addressable Market)
• SAM: 45,000,000 (Serviceable Addressable Market)
• SOM: 8,500,000 (Serviceable Obtainable Market - Year 1)

[PESTLE OUTPUT]
**Political Drivers**
• Favorable government support for AI/tech innovation
• Tax incentives for digital transformation initiatives

**Economic Drivers**  
• Growing digital economy with increased SaaS spending
• Budget constraints in uncertain economic climate

**Social Drivers**
• Remote work driving demand for digital tools
• Increasing comfort with AI-powered solutions

**Technological Drivers**
• Rapid AI advancement enabling new capabilities
• Cloud infrastructure becoming more accessible

**Legal Drivers**
• Data privacy regulations requiring compliance
• Growing IP protection for AI technologies

**Environmental Drivers**
• Shift toward sustainable business practices
• Digital solutions reducing carbon footprint

[PORTERS OUTPUT]
**Porter's Five Forces Analysis**
• Threat of New Entrants: HIGH (Low barriers with open-source AI tools)
• Bargaining Power of Suppliers: LOW (Multiple AI/cloud providers available)
• Bargaining Power of Buyers: MEDIUM (Multiple alternatives exist)
• Threat of Substitutes: HIGH (Many similar platforms emerging)
• Industry Rivalry: HIGH (Competitive market landscape)

[COMPETITOR OUTPUT]
**Key Competitors**
• Competitor A: High threat, Enterprise focus, offering similar features
• Competitor B: Medium threat, SMB focus, lower pricing
• Competitor C: Low threat, Niche player, limited capabilities

[POSITIONING OUTPUT]
**Brand Positioning Strategy**
• Brand: ${product.split(' ').slice(0,2).join(' ')} Platform
• Tagline: "AI-Powered Marketing Intelligence"
• Brand Promise: "Making complex strategy accessible"
• Differentiator: "Combining 12 expert roles in one platform"
• Brand Personality: "Intelligent, Accessible, Trustworthy"

[4PS OUTPUT]
**Marketing Mix Strategy**
• Product: ${product} with 12 integrated strategy modules
• Price: Freemium model ($0 - $29 - Custom)
• Place: Direct sales + online self-service
• Promotion: Content marketing + thought leadership

[SWOT OUTPUT]
**Strengths**
• Comprehensive 12-role analysis framework
• AI-powered insights for quick decisions
• Professional-grade output accessible to all

**Weaknesses**
• Reliance on AI data quality
• Limited brand awareness
• Complex onboarding for non-technical users

**Opportunities**
• Growing demand for marketing intelligence
• Partner ecosystem development
• Enterprise customization needs

**Threats**
• Increasing AI competition
• Data privacy concerns
• Rapid technology changes

[JOURNEY OUTPUT]
**Customer Journey Map**
• Awareness: Discover through content marketing
• Consideration: Demo and trial experience
• Decision: ROI comparison and case studies
• Purchase: Self-serve signup or sales call
• Retention: Regular insights and updates
• Advocacy: Referral program and community

[KPI OUTPUT]
**Key Performance Indicators**
• Monthly Active Users: 5,000 (↑ 25%)
• Plan Generation Rate: 1,200/mo (↑ 35%)
• Conversion Rate: 8% (↑ 15%)
• Customer Satisfaction: 4.8/5 (↑ 5%)
• Revenue Growth: 45% YoY (↑ 10%)
• User Retention: 82% (↑ 8%)

[OKRS OUTPUT]
**Objective 1: Market Penetration**
• KR 1: Achieve 10,000 MAU (55% progress)
• KR 2: Generate 5,000 plans/month (45% progress)
• KR 3: 15% conversion to paid (60% progress)

**Objective 2: Product Innovation**
• KR 1: Launch 3 new roles (70% progress)
• KR 2: AI accuracy improvement (65% progress)
• KR 3: Integration ecosystem (40% progress)

[ROADMAP OUTPUT]
**30-Day Implementation Roadmap**
• Week 1-2: Core platform setup and onboarding
• Week 3: Marketing launch and content creation
• Week 4: Partner outreach and user acquisition

**60-Day Roadmap**
• Month 2: Advanced features and AI training
• Month 3: Enterprise pilot and premium launch

**90-Day Roadmap**  
• Month 4: Platform optimization and scaling
• Month 5: New roles and integration launch
• Month 6: Full market expansion`;
};

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
// SVG ICONS FOR PESTLE
// ============================================

const PoliticalIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
    <path d="M2 17l10 5 10-5"/>
    <path d="M2 12l10 5 10-5"/>
  </svg>
);

const EconomicIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);

const SocialIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const TechIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
    <line x1="8" y1="21" x2="16" y2="21"/>
    <line x1="12" y1="17" x2="12" y2="21"/>
    <circle cx="8" cy="9" r="1" fill="currentColor"/>
    <circle cx="16" cy="9" r="1" fill="currentColor"/>
    <circle cx="12" cy="13" r="1" fill="currentColor"/>
  </svg>
);

const LegalIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
    <path d="M2 17l10 5 10-5"/>
    <path d="M2 12l10 5 10-5"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EnvironmentalIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
    <path d="M2 17l10 5 10-5"/>
    <path d="M2 12l10 5 10-5"/>
    <path d="M12 7v10"/>
    <path d="M8 9l4 3 4-3"/>
  </svg>
);

// ============================================
// SVG ICONS FOR PORTER'S FIVE FORCES
// ============================================

const NewEntrantsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14"/>
    <path d="M5 12h14"/>
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const BuyerPowerIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 7h-4.5A2.5 2.5 0 0 0 13 9.5v0A2.5 2.5 0 0 0 15.5 12H20"/>
    <path d="M20 7v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7"/>
    <circle cx="8" cy="10" r="1" fill="currentColor"/>
    <circle cx="16" cy="10" r="1" fill="currentColor"/>
    <path d="M4 14h4"/>
    <path d="M16 14h4"/>
  </svg>
);

const SupplierPowerIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
    <path d="M2 17l10 5 10-5"/>
    <path d="M2 12l10 5 10-5"/>
    <path d="M12 7v5"/>
    <path d="M8 9.5l4 2.5 4-2.5"/>
  </svg>
);

const SubstitutesIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2L3 20"/>
    <path d="M10 5l4 4"/>
    <path d="M16 3l5 5"/>
    <path d="M7 15l4 4"/>
    <path d="M3 16l5 5"/>
    <circle cx="19" cy="5" r="2"/>
    <circle cx="5" cy="19" r="2"/>
  </svg>
);

const RivalryIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 12h10"/>
    <path d="M12 7v10"/>
    <circle cx="12" cy="12" r="9"/>
    <path d="M15 9l-6 6"/>
    <path d="M9 9l6 6"/>
  </svg>
);

// ============================================
// ALL VISUAL COMPONENTS (DEFINED BEFORE APP)
// ============================================

// 1. SEGMENTATION VISUAL
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
        .segmentation-container { position: relative; padding: 20px; }
        .segmentation-chart { display: flex; gap: 40px; align-items: center; flex-wrap: wrap; justify-content: center; }
        .pie-chart-wrapper { flex: 1; min-width: 300px; max-width: 420px; }
        .pie-chart-svg { width: 100%; height: auto; }
        .legend-container { flex: 1; min-width: 200px; display: flex; flex-direction: column; gap: 8px; }
        .legend-item { display: flex; align-items: center; gap: 12px; padding: 10px 16px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.06); cursor: pointer; transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .legend-item:hover { background: rgba(255,255,255,0.06); transform: translateX(4px); }
        .legend-item.active { border-color: var(--legend-color); }
        .legend-dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; transition: all 0.3s ease; }
        .legend-name { flex: 1; font-size: 13px; color: #CBD5E1; }
        .legend-percent { font-size: 14px; font-weight: 700; }
        .legend-share { font-size: 11px; color: #64748B; }
        .segment-tooltip { position: fixed; bottom: 20px; right: 20px; z-index: 100; animation: slideUp 0.3s ease; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .tooltip-content { background: rgba(15,23,42,0.95); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 20px 24px; min-width: 260px; box-shadow: 0 20px 60px rgba(0,0,0,0.6); }
        .tooltip-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 12px; border-bottom: 2px solid; margin-bottom: 12px; }
        .tooltip-name { font-size: 15px; font-weight: 600; color: #F1F5F9; }
        .tooltip-share { font-size: 18px; font-weight: 700; }
        .tooltip-details { display: flex; flex-direction: column; gap: 6px; }
        .tooltip-row { display: flex; justify-content: space-between; font-size: 13px; color: #94A3B8; padding: 4px 0; }
        .tooltip-row span:last-child { color: #CBD5E1; font-weight: 500; }
        @media (max-width: 768px) { .segmentation-chart { flex-direction: column; gap: 24px; } .pie-chart-wrapper { max-width: 300px; } .legend-container { width: 100%; } .segment-tooltip { position: fixed; bottom: 10px; right: 10px; left: 10px; } .tooltip-content { min-width: auto; padding: 16px 20px; } }
      `}</style>
    </div>
  );
};

// 2. MARKET SIZING VISUAL
const MarketSizingVennDiagram = ({ plan }: { plan: string }) => {
  const [activeCircle, setActiveCircle] = useState<'tam' | 'sam' | 'som' | null>(null);
  const [showTAMDetails, setShowTAMDetails] = useState(false);
  const [showSAMDetails, setShowSAMDetails] = useState(false);
  const [showSOMDetails, setShowSOMDetails] = useState(false);

  const extractMarketSizingData = (): { tam: number; sam: number; som: number } => {
    let tam = 0, sam = 0, som = 0;
    
    if (!plan || typeof plan !== 'string') {
      return { tam, sam, som };
    }

    let section = '';
    const sectionMatch = plan.match(/\[TAMSAMSOM OUTPUT\]([\s\S]*?)(?=\n\n---|\n\[|$)/i);
    if (sectionMatch && sectionMatch[1]) {
      section = sectionMatch[1].trim();
    }
    
    if (!section) {
      section = plan;
    }
    
    const lines = section.split('\n');
    let inTable = false;
    let tableRows: string[] = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.includes('|') && trimmed.includes('---')) {
        inTable = true;
        continue;
      }
      
      if (inTable && trimmed.includes('|')) {
        const cells = trimmed.split('|').map(c => c.trim()).filter(c => c);
        if (cells.length >= 2) {
          tableRows.push(trimmed);
        }
      }
      
      if (inTable && !trimmed.includes('|') && trimmed.length > 0) {
        if (tableRows.length > 0) break;
      }
    }
    
    for (const row of tableRows) {
      const cells = row.split('|').map(c => c.trim()).filter(c => c);
      if (cells.length >= 2) {
        const label = cells[0].toUpperCase().trim();
        const value = cells[1].replace(/,/g, '').trim();
        const numValue = parseFloat(value);
        
        if (!isNaN(numValue) && numValue > 0) {
          if (label.includes('TAM')) {
            tam = numValue;
          } else if (label.includes('SAM')) {
            sam = numValue;
          } else if (label.includes('SOM')) {
            som = numValue;
          }
        }
      }
    }
    
    if (tam > 0 && sam === 0) {
      sam = Math.round(tam * 0.4);
    }
    
    if (sam > 0 && som === 0) {
      som = Math.round(sam * 0.15);
    }
    
    if (sam > 0 && tam === 0) {
      tam = Math.round(sam * 2.5);
    }
    
    if (som > 0 && sam === 0) {
      sam = Math.round(som * 6.67);
      if (tam === 0) {
        tam = Math.round(sam * 2.5);
      }
    }
    
    return { tam, sam, som };
  };

  const { tam, sam, som } = extractMarketSizingData();
  const hasData = tam > 0 || sam > 0 || som > 0;

  const formatValue = (val: number): string => {
    if (val === 0) return 'N/A';
    if (val >= 1000000000) return (val / 1000000000).toFixed(1) + 'B';
    if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
    if (val >= 1000) return (val / 1000).toFixed(0) + 'K';
    return val.toString();
  };

  const formatFullValue = (val: number): string => {
    if (val === 0) return 'N/A';
    return val.toLocaleString();
  };

  const handleCircleClick = (circle: 'tam' | 'sam' | 'som') => {
    if (activeCircle === circle) {
      setActiveCircle(null);
      setShowTAMDetails(false);
      setShowSAMDetails(false);
      setShowSOMDetails(false);
    } else {
      setActiveCircle(circle);
      setShowTAMDetails(circle === 'tam');
      setShowSAMDetails(circle === 'sam');
      setShowSOMDetails(circle === 'som');
    }
  };

  const GlobeIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  );

  const HandIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 11.5V5a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v6.5"/>
      <path d="M14 10V3a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v7"/>
      <path d="M10 10V5a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v5"/>
      <path d="M6 9V6.5A2.5 2.5 0 0 0 3.5 4v0A2.5 2.5 0 0 0 1 6.5V12a6 6 0 0 0 6 6h3a6 6 0 0 0 6-6v-1"/>
    </svg>
  );

  const TargetIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="6"/>
      <circle cx="12" cy="12" r="2"/>
    </svg>
  );

  const circles = [
    {
      id: 'tam' as const,
      label: 'TAM',
      value: tam,
      fullName: 'Total Addressable Market',
      color: 'red',
      colorClass: 'text-red-400',
      borderColor: 'rgba(239, 68, 68, 0.6)',
      bgColor: 'rgba(173, 53, 45, 0.25)',
      size: 380,
      zIndex: 1,
      details: 'Total Addressable Market - The entire market demand for your product/service.'
    },
    {
      id: 'sam' as const,
      label: 'SAM',
      value: sam,
      fullName: 'Serviceable Available Market',
      color: 'cyan',
      colorClass: 'text-cyan-400',
      borderColor: 'rgba(34, 211, 238, 0.6)',
      bgColor: 'rgba(0, 108, 119, 0.35)',
      size: 270,
      zIndex: 2,
      details: 'Serviceable Available Market - The segment of TAM you can effectively serve.'
    },
    {
      id: 'som' as const,
      label: 'SOM',
      value: som,
      fullName: 'Serviceable Obtainable Market',
      color: 'yellow',
      colorClass: 'text-yellow-300',
      borderColor: 'rgba(251, 191, 36, 0.7)',
      bgColor: 'rgba(220, 153, 71, 0.5)',
      size: 165,
      zIndex: 3,
      details: 'Serviceable Obtainable Market - The market share you can realistically capture.'
    }
  ];

  if (!hasData) {
    return (
      <div className="text-center">
        <h2 className="text-xl font-bold text-indigo-300 mb-6">Market Sizing (TAM / SAM / SOM)</h2>
        <div className="text-center py-10 text-white/50">
          <p>No market sizing data found in the generated plan.</p>
          <p className="text-sm mt-2">The plan should contain TAM/SAM/SOM data in a table.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center">
      <h2 className="text-xl font-bold text-indigo-300 mb-4">Market Sizing (TAM / SAM / SOM)</h2>
      <p className="text-sm text-white/40 mb-4">Click any circle to expand and see details</p>
      <div className="flex justify-center items-center gap-4 mb-6 text-sm text-white/40 flex-wrap">
        <span className="text-red-300 flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
          TAM: {formatValue(tam)}
        </span>
        <span>|</span>
        <span className="text-cyan-300 flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-cyan-500 inline-block"></span>
          SAM: {formatValue(sam)}
        </span>
        <span>|</span>
        <span className="text-yellow-300 flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block"></span>
          SOM: {formatValue(som)}
        </span>
      </div>
      <div className="relative mx-auto" style={{ width: '100%', maxWidth: '550px', height: '480px' }}>
        {circles.map((circle) => {
          const isActive = activeCircle === circle.id;
          const scale = isActive ? 1.15 : 1;
          const opacity = activeCircle && !isActive ? 0.4 : 1;
          
          return (
            <div
              key={circle.id}
              className="absolute rounded-full cursor-pointer transition-all duration-500 ease-in-out"
              style={{
                width: `${circle.size}px`,
                height: `${circle.size}px`,
                background: circle.bgColor,
                border: `3px solid ${circle.borderColor}`,
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) scale(${scale})`,
                zIndex: isActive ? 10 : circle.zIndex,
                opacity: opacity,
                boxShadow: isActive ? `0 0 60px ${circle.borderColor}` : 'none',
              }}
              onClick={() => handleCircleClick(circle.id)}
            >
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white font-bold text-center w-full px-4">
                <div className={`${circle.colorClass} text-sm font-semibold mb-1`}>
                  {circle.label}
                  {isActive && ' 🔍'}
                </div>
                <div className={`text-2xl font-bold transition-all duration-300 ${isActive ? 'text-3xl' : ''}`}>
                  {formatValue(circle.value)}
                </div>
                <div className="text-[10px] text-white/50 mt-1">
                  {isActive ? circle.fullName : circle.fullName.split(' ').slice(0, 2).join(' ')}
                </div>
                {isActive && (
                  <div className="mt-3 text-xs text-white/70 bg-black/30 rounded-lg p-2 animate-fadeIn">
                    {circle.details}
                  </div>
                )}
              </div>
              {isActive && (
                <div 
                  className="absolute inset-0 rounded-full animate-pulse"
                  style={{
                    background: `radial-gradient(circle, ${circle.borderColor}33, transparent 70%)`,
                    zIndex: -1,
                  }}
                />
              )}
            </div>
          );
        })}
        <div
          className="absolute text-white text-[10px] font-semibold z-10 flex items-center gap-1"
          style={{
            bottom: '5px',
            left: '50%',
            transform: 'translateX(-50%)'
          }}
        >
          <TargetIcon />
          <span>Click a circle to expand</span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div
          className={`p-4 rounded-xl cursor-pointer transition-all ${showTAMDetails ? 'bg-red-500/20 border border-red-500/40 scale-105' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}
          onClick={() => handleCircleClick('tam')}
        >
          <div className="text-red-300 text-sm font-semibold mb-2 flex items-center gap-2">
            <GlobeIcon />
            TAM
          </div>
          <div className="text-2xl font-bold text-white whitespace-nowrap">{formatFullValue(tam)}</div>
          {showTAMDetails && (
            <div className="text-xs text-white/70 mt-2 whitespace-nowrap">Total Addressable Market</div>
          )}
        </div>
        <div
          className={`p-4 rounded-xl cursor-pointer transition-all ${showSAMDetails ? 'bg-cyan-500/20 border border-cyan-500/40 scale-105' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}
          onClick={() => handleCircleClick('sam')}
        >
          <div className="text-cyan-300 text-sm font-semibold mb-2 flex items-center gap-2">
            <HandIcon />
            SAM
          </div>
          <div className="text-2xl font-bold text-white whitespace-nowrap">{formatFullValue(sam)}</div>
          {showSAMDetails && (
            <div className="text-xs text-white/70 mt-2 whitespace-nowrap">Serviceable Available Market</div>
          )}
        </div>
        <div
          className={`p-4 rounded-xl cursor-pointer transition-all ${showSOMDetails ? 'bg-yellow-500/20 border border-yellow-500/40 scale-105' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}
          onClick={() => handleCircleClick('som')}
        >
          <div className="text-yellow-300 text-sm font-semibold mb-2 flex items-center gap-2">
            <TargetIcon />
            SOM
          </div>
          <div className="text-2xl font-bold text-white whitespace-nowrap">{formatFullValue(som)}</div>
          {showSOMDetails && (
            <div className="text-xs text-white/70 mt-2 whitespace-nowrap">Serviceable Obtainable Market</div>
          )}
        </div>
      </div>
    </div>
  );
};

// 3. PESTLE VISUAL
const PESTLEVisual = ({ plan }: { plan: string }) => {
  const parsePESTLE = () => {
    const pestleData: { key: string; icon: React.ReactNode; title: string; insight: string[]; impact: string }[] = [];
    const categories = [
      { key: 'political', icon: <PoliticalIcon />, title: 'Political' },
      { key: 'economic', icon: <EconomicIcon />, title: 'Economic' },
      { key: 'social', icon: <SocialIcon />, title: 'Social' },
      { key: 'technological', icon: <TechIcon />, title: 'Technological' },
      { key: 'legal', icon: <LegalIcon />, title: 'Legal' },
      { key: 'environmental', icon: <EnvironmentalIcon />, title: 'Environmental' }
    ];
    
    let searchText = '';
    const pestleSection = plan.match(/\[PESTLE\s+OUTPUT\]([\s\S]*?)(?=\n\n---|\n\[|$)/i);
    if (pestleSection && pestleSection[1]) {
      searchText = pestleSection[1].trim();
    }
    
    if (!searchText) {
      return [];
    }

    const categoryMap: Record<string, string[]> = {};
    for (const cat of categories) {
      categoryMap[cat.title] = [];
    }

    const lines = searchText.split('\n');
    let currentCategory: string | null = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.length === 0) continue;
      
      let isHeader = false;
      for (const cat of categories) {
        const patterns = [
          `**${cat.title} Drivers:**`,
          `**${cat.title} Drivers**`,
          `**${cat.title}:**`,
          `**${cat.title}**`,
        ];
        for (const pattern of patterns) {
          if (line.includes(pattern)) {
            currentCategory = cat.title;
            isHeader = true;
            break;
          }
        }
        if (isHeader) break;
      }
      
      if (currentCategory && !isHeader && line.length > 0) {
        const bulletMatch = line.match(/^[-•*]\s+(.+)/);
        if (bulletMatch) {
          const point = bulletMatch[1].trim();
          if (point.length > 2) {
            categoryMap[currentCategory].push(point);
          }
        } else if (!line.includes('---') && !line.includes('[') && line.length > 5 && !line.includes('**')) {
          categoryMap[currentCategory].push(line);
        }
      }
    }

    for (const cat of categories) {
      const content = categoryMap[cat.title] || [];
      let impact = 'medium';
      
      if (content.length > 0) {
        const fullText = content.join(' ').toLowerCase();
        if (fullText.includes('high') || fullText.includes('significant') || 
            fullText.includes('major') || fullText.includes('strong') || 
            fullText.includes('growth') || fullText.includes('rising') ||
            fullText.includes('increase') || fullText.includes('demand') ||
            fullText.includes('drives')) {
          impact = 'high';
        } else if (fullText.includes('low') || fullText.includes('minor') || 
                   fullText.includes('weak') || fullText.includes('negligible') ||
                   fullText.includes('decline')) {
          impact = 'low';
        }
        
        pestleData.push({
          key: cat.key,
          icon: cat.icon,
          title: cat.title,
          insight: content,
          impact: impact
        });
      }
    }

    return pestleData;
  };

  const pestleData = parsePESTLE();
  const colorMap: Record<string, { bg: string; text: string; iconColor: string }> = {
    political: { bg: 'rgba(99,102,241,.15)', text: '#818cf8', iconColor: '#818cf8' },
    economic: { bg: 'rgba(16,185,129,.15)', text: '#34d399', iconColor: '#34d399' },
    social: { bg: 'rgba(245,158,11,.15)', text: '#fbbf24', iconColor: '#fbbf24' },
    technological: { bg: 'rgba(6,182,212,.15)', text: '#22d3ee', iconColor: '#22d3ee' },
    legal: { bg: 'rgba(239,68,68,.15)', text: '#f87171', iconColor: '#f87171' },
    environmental: { bg: 'rgba(139,92,246,.15)', text: '#a78bfa', iconColor: '#a78bfa' }
  };

  const displayData = pestleData.filter(p => p.insight.length > 0);

  return (
    <div className="text-center">
      <h2 className="text-xl font-bold text-indigo-300 mb-6">PESTLE Analysis</h2>
      {displayData.length === 0 ? (
        <div className="text-center py-10 text-white/50">
          <p>No PESTLE data found in the generated plan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayData.map((item) => {
            const colors = colorMap[item.key] || colorMap.political;
            
            return (
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
                    background: `linear-gradient(90deg, ${colors.text}, ${colors.text})` 
                  } 
                } as any}
              >
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/10">
                  <div
                    className="w-10 h-10 flex items-center justify-center rounded-xl transition-transform hover:scale-110"
                    style={{ background: colors.bg, color: colors.iconColor }}
                  >
                    {item.icon}
                  </div>
                  <div className="text-lg font-bold" style={{ color: colors.text }}>
                    {item.title}
                  </div>
                </div>
                
                <div className="text-sm text-white/80 leading-relaxed mb-3">
                  {item.insight.length > 0 ? (
                    <div className="space-y-2 text-left">
                      {item.insight.map((point, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm text-white/80">
                          <span className="text-green-400 mt-0.5 text-xs">▸</span>
                          <span>{point}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-white/30 italic">No explanations available</span>
                  )}
                </div>
                
                <div className="pt-3 border-t border-white/5 flex items-center gap-2 flex-wrap">
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
                  <span className="text-xs text-white/30">
                    {item.insight.length} point{item.insight.length > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// 4. PORTER'S FIVE FORCES VISUAL
const PortersVisual = ({ plan }: { plan: string }) => {
  const parsePorters = () => {
    const content = extractTagContent(plan, 'PORTERS OUTPUT');
    const fullPlan = plan;
    
    const forces = [
      { 
        key: 'newEntrants', 
        icon: <NewEntrantsIcon />, 
        name: 'Threat of New Entrants',
        description: 'How easy is it for new competitors to enter the market?'
      },
      { 
        key: 'buyerPower', 
        icon: <BuyerPowerIcon />, 
        name: 'Bargaining Power of Buyers',
        description: 'How much power do customers have to negotiate prices?'
      },
      { 
        key: 'supplierPower', 
        icon: <SupplierPowerIcon />, 
        name: 'Bargaining Power of Suppliers',
        description: 'How much power do suppliers have to raise prices?'
      },
      { 
        key: 'substitutes', 
        icon: <SubstitutesIcon />, 
        name: 'Threat of Substitutes',
        description: 'How easily can customers switch to alternative products?'
      },
      { 
        key: 'rivalry', 
        icon: <RivalryIcon />, 
        name: 'Industry Rivalry',
        description: 'How intense is the competition among existing firms?'
      }
    ];

    const parsedForces: any[] = [];
    const searchText = content || fullPlan;
    const lines = searchText.split('\n');

    for (const force of forces) {
      let insight = '';
      let rating: 'high' | 'medium' | 'low' = 'medium';
      
      const forceKeywords = [
        force.name.toLowerCase(),
        force.key.toLowerCase().replace(/([A-Z])/g, ' $1').trim().toLowerCase(),
        force.name.replace('Threat of ', '').toLowerCase(),
        force.name.replace('Bargaining Power of ', '').toLowerCase()
      ];
      
      for (const line of lines) {
        const trimmed = line.trim();
        const lower = trimmed.toLowerCase();
        
        let found = false;
        for (const keyword of forceKeywords) {
          if (lower.includes(keyword) && trimmed.length > 10) {
            found = true;
            break;
          }
        }
        
        if (found) {
          const insightMatch = trimmed.match(/[:\-•]\s*(.+)/);
          if (insightMatch) {
            insight = insightMatch[1].trim();
          } else {
            const clean = trimmed.replace(/^[-•*]\s+/, '').replace(/^[A-Z]+:?\s*/, '');
            if (clean.length > 10) {
              insight = clean;
            }
          }
          
          const lowerInsight = (insight || trimmed).toLowerCase();
          if (lowerInsight.includes('high') || lowerInsight.includes('strong') || 
              lowerInsight.includes('significant') || lowerInsight.includes('intense')) {
            rating = 'high';
          } else if (lowerInsight.includes('low') || lowerInsight.includes('weak') || 
                     lowerInsight.includes('minor') || lowerInsight.includes('limited')) {
            rating = 'low';
          } else {
            rating = 'medium';
          }
          break;
        }
      }

      if (!insight) {
        const pattern = new RegExp(`${force.name}[\\s\\S]*?([\\s\\S]*?)(?=\\n\\n|\\n[A-Z]|$)`, 'i');
        const match = searchText.match(pattern);
        if (match && match[1]) {
          const contentText = match[1].trim();
          if (contentText.length > 10) {
            insight = contentText.substring(0, 100);
            const lowerInsight = contentText.toLowerCase();
            if (lowerInsight.includes('high') || lowerInsight.includes('strong')) {
              rating = 'high';
            } else if (lowerInsight.includes('low') || lowerInsight.includes('weak')) {
              rating = 'low';
            }
          }
        }
      }

      if (insight && insight.length > 5) {
        parsedForces.push({
          ...force,
          rating,
          insight: insight.substring(0, 120)
        });
      }
    }

    if (parsedForces.length === 0) {
      return forces.map(force => ({
        ...force,
        rating: 'medium' as 'high' | 'medium' | 'low',
        insight: 'Data not available in the generated plan. Try regenerating with more detail.'
      }));
    }

    return parsedForces;
  };

  const forces = parsePorters();
  const colorMap: Record<string, { bg: string; text: string; iconColor: string }> = {
    newEntrants: { bg: 'rgba(139,92,246,.15)', text: '#a78bfa', iconColor: '#a78bfa' },
    buyerPower: { bg: 'rgba(245,158,11,.15)', text: '#fbbf24', iconColor: '#fbbf24' },
    supplierPower: { bg: 'rgba(59,130,246,.15)', text: '#60a5fa', iconColor: '#60a5fa' },
    substitutes: { bg: 'rgba(239,68,68,.15)', text: '#f87171', iconColor: '#f87171' },
    rivalry: { bg: 'rgba(236,72,153,.15)', text: '#f472b6', iconColor: '#f472b6' }
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

  const getRatingLabel = (rating: string): string => {
    switch (rating) {
      case 'high': return 'HIGH THREAT';
      case 'medium': return 'MEDIUM THREAT';
      default: return 'LOW THREAT';
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
          {forces.map((force) => {
            const colors = colorMap[force.key] || colorMap.rivalry;
            const ratingWidth = getRatingWidth(force.rating);
            const ratingColor = getRatingColor(force.rating);
            
            return (
              <div
                key={force.key}
                className="bg-gradient-to-br from-slate-800/80 to-slate-900/90 rounded-xl p-5 border border-white/10 transition-all hover:translate-y-[-6px] hover:border-indigo-500/40 hover:shadow-lg cursor-pointer relative overflow-hidden"
                style={{ 
                  '::before': { 
                    content: '""', 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    width: '100%', 
                    height: '3px', 
                    background: `linear-gradient(90deg, ${colors.text}, ${colors.text})` 
                  } 
                } as any}
              >
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/10">
                  <div
                    className="w-10 h-10 flex items-center justify-center rounded-xl transition-transform hover:scale-110"
                    style={{ background: colors.bg, color: colors.iconColor }}
                  >
                    {force.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-bold" style={{ color: colors.text }}>
                      {force.name}
                    </div>
                    <div className="text-[10px] text-white/40">
                      {force.description}
                    </div>
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold text-white/60">
                      {getRatingLabel(force.rating)}
                    </span>
                    <span className="text-xs text-white/40">
                      {force.rating === 'high' ? '⚠️ High Risk' : force.rating === 'medium' ? '⚡ Moderate Risk' : '✅ Low Risk'}
                    </span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${ratingWidth}%`, background: ratingColor }}
                    />
                  </div>
                </div>
                
                <div className="text-sm text-white/70 mt-3 text-left leading-relaxed">
                  {force.insight}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// 5. COMPETITORS VISUAL
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
        
        let strengths = ['Market presence'];
        let weaknesses = ['Limited data'];
        let position = 'Competitor';
        let differentiation = 'Differentiate';
        
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

// 6. POSITIONING VISUAL
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

  const QuoteIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 11h-4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1z"/>
      <path d="M18 11h-4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1z"/>
      <line x1="4" y1="21" x2="20" y2="21"/>
    </svg>
  );

  return (
    <div className="text-center">
      <h2 className="text-xl font-bold text-indigo-300 mb-6">Brand Positioning</h2>
      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/95 rounded-2xl p-8 border border-indigo-500/30 transition-all hover:translate-y-[-5px] hover:border-indigo-500/60 hover:shadow-xl">
        <div
          className="text-lg font-semibold leading-relaxed text-center p-6 bg-indigo-500/10 rounded-xl mb-6 border-l-4 border-r-4 flex items-center justify-center gap-3"
          style={{ borderLeftColor: '#6366f1', borderRightColor: '#ec4899' }}
        >
          <span className="text-indigo-400 opacity-50">
            <QuoteIcon />
          </span>
          <span>
            "{positioning.statement || 'No positioning statement found. Generate a new plan with positioning data.'}"
          </span>
          <span className="text-indigo-400 opacity-50 transform rotate-180">
            <QuoteIcon />
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white/5 rounded-xl p-4 text-center transition-all hover:bg-indigo-500/10 hover:translate-y-[-3px] group">
            <div className="w-14 h-14 mx-auto mb-3 flex items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 group-hover:bg-indigo-500/30 group-hover:scale-110 transition-all">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="6"/>
                <circle cx="12" cy="12" r="2"/>
              </svg>
            </div>
            <div className="text-xs font-bold uppercase text-indigo-300 tracking-wider mb-2">Target Audience</div>
            <div className="text-sm font-medium text-white/90">{positioning.target}</div>
          </div>

          <div className="bg-white/5 rounded-xl p-4 text-center transition-all hover:bg-emerald-500/10 hover:translate-y-[-3px] group">
            <div className="w-14 h-14 mx-auto mb-3 flex items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500/30 group-hover:scale-110 transition-all">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
                <path d="M12 7v10"/>
                <path d="M8 9l4 3 4-3"/>
              </svg>
            </div>
            <div className="text-xs font-bold uppercase text-emerald-300 tracking-wider mb-2">Core Benefit</div>
            <div className="text-sm font-medium text-white/90">{positioning.benefit}</div>
          </div>

          <div className="bg-white/5 rounded-xl p-4 text-center transition-all hover:bg-amber-500/10 hover:translate-y-[-3px] group">
            <div className="w-14 h-14 mx-auto mb-3 flex items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 group-hover:bg-amber-500/30 group-hover:scale-110 transition-all">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="M9 12l2 2 4-4"/>
              </svg>
            </div>
            <div className="text-xs font-bold uppercase text-amber-300 tracking-wider mb-2">Reason to Believe</div>
            <div className="text-sm font-medium text-white/90">{positioning.rtb}</div>
          </div>
        </div>
      </div>

      {positioning.value !== 'N/A' && (
        <div className="mt-5 p-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl text-center flex items-center justify-center gap-3 border border-indigo-500/20">
          <div className="w-10 h-10 flex items-center justify-center text-yellow-400 bg-yellow-500/20 rounded-full">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
          <div>
            <span className="text-sm font-semibold text-white/60 uppercase tracking-wider mr-2">Core Value:</span>
            <span className="text-indigo-300 font-medium">"{positioning.value}"</span>
          </div>
        </div>
      )}
    </div>
  );
};

// 7. 4Ps VISUAL
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

// 8. SWOT VISUAL
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

// 9. CUSTOMER JOURNEY VISUAL
const CustomerJourneyVisual = ({ plan }: { plan: string }) => {
  const [hoveredStage, setHoveredStage] = useState<number | null>(null);
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
          
          let action = '';
          let progress = 0;
          switch(name) {
            case 'AWARENESS':
              action = 'Run targeted social media ads and influencer partnerships';
              progress = 20;
              break;
            case 'CONSIDERATION':
              action = 'Offer free trials and demo videos showcasing value';
              progress = 40;
              break;
            case 'PURCHASE':
              action = 'Streamline checkout with multiple payment options';
              progress = 60;
              break;
            case 'RETENTION':
              action = 'Send personalized follow-ups and loyalty rewards';
              progress = 80;
              break;
            case 'ADVOCACY':
              action = 'Create referral program with incentives for both parties';
              progress = 100;
              break;
            default:
              action = 'Engage customers with personalized communication';
              progress = 50;
          }
          
          stages.push({
            day: dayCounter * 7,
            name: name,
            desc: desc || `${name} stage - ${action}`,
            icon: icons[i % icons.length],
            action: action,
            progress: progress
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
            const progress = Math.min((stages.length + 1) * 20, 100);
            stages.push({
              day: dayCounter * 7,
              name: name,
              desc: desc,
              icon: icons[stages.length % icons.length],
              action: action,
              progress: progress
            });
            dayCounter++;
          }
        }
      }
    }
    
    return stages.length > 0 ? stages.slice(0, 5) : [
      { day: 7, name: 'AWARENESS', desc: 'Start with targeted marketing campaigns', icon: '📱', action: 'Run social media ads and content marketing', progress: 20 },
      { day: 14, name: 'CONSIDERATION', desc: 'Provide detailed product information', icon: '💡', action: 'Share case studies and customer testimonials', progress: 40 },
      { day: 21, name: 'PURCHASE', desc: 'Make buying process seamless', icon: '💰', action: 'Optimize checkout and offer payment flexibility', progress: 60 },
      { day: 28, name: 'RETENTION', desc: 'Keep customers engaged post-purchase', icon: '🛠️', action: 'Send regular updates and exclusive offers', progress: 80 },
      { day: 35, name: 'ADVOCACY', desc: 'Turn customers into brand advocates', icon: '⭐', action: 'Implement referral program and user-generated content', progress: 100 }
    ];
  };
  
  const stages = parseJourney();

  const CheckIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );

  const ProgressDot = ({ progress, isHovered }: { progress: number; isHovered: boolean }) => {
    const size = isHovered ? 56 : 48;
    const strokeWidth = isHovered ? 6 : 4;
    const circumference = 2 * Math.PI * (size / 2 - strokeWidth);
    const offset = circumference - (progress / 100) * circumference;
    
    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - strokeWidth}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - strokeWidth}
            fill="none"
            stroke={isHovered ? '#10b981' : '#6366f1'}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        {isHovered && (
          <div 
            className="absolute inset-0 rounded-full animate-pulse"
            style={{
              background: 'radial-gradient(circle, rgba(16,185,129,0.4) 0%, transparent 70%)',
              transform: 'scale(1.4)',
              zIndex: -1
            }}
          />
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-xs font-bold transition-all duration-300 ${isHovered ? 'text-green-400 scale-110' : 'text-white/70'}`}>
            {progress}%
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="text-center">
      <h2 className="text-xl font-bold text-indigo-300 mb-6">Customer Journey Map</h2>
      <div className="bg-gradient-to-br from-slate-800/85 to-slate-900/95 rounded-2xl p-8 border border-indigo-500/20 overflow-x-auto">
        <div className="relative min-w-[700px] py-8">
          <div className="absolute top-[52px] left-12 right-12 h-1 rounded-full">
            <div className="w-full h-full bg-gradient-to-r from-indigo-500 via-green-400 to-emerald-500" style={{ opacity: 0.3 }} />
          </div>
          <div className="absolute top-10 left-0 text-white/30 text-xs font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block"></span>
            Start
          </div>
          <div className="absolute top-10 right-0 text-white/30 text-xs font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
            Complete
          </div>
          <div className="flex justify-between relative z-10 px-2">
            {stages.map((stage, idx) => {
              const isHovered = hoveredStage === idx;
              const progress = stage.progress || 0;
              
              return (
                <div 
                  key={idx} 
                  className="flex flex-col items-center gap-3 cursor-pointer transition-all duration-300 group"
                  onMouseEnter={() => setHoveredStage(idx)}
                  onMouseLeave={() => setHoveredStage(null)}
                >
                  <div className="relative">
                    <ProgressDot progress={progress} isHovered={isHovered} />
                    {isHovered && (
                      <div 
                        className="absolute inset-0 rounded-full"
                        style={{
                          boxShadow: '0 0 40px rgba(16,185,129,0.5), 0 0 80px rgba(16,185,129,0.2)',
                          transform: 'scale(1.1)',
                          zIndex: -1
                        }}
                      />
                    )}
                    {progress === 100 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white text-[10px] shadow-lg shadow-emerald-500/30">
                        <CheckIcon />
                      </div>
                    )}
                  </div>
                  <span className={`text-xs font-medium transition-all duration-300 ${isHovered ? 'text-green-400' : 'text-white/40'} bg-black/40 px-3 py-1 rounded-full`}>
                    Day {stage.day}
                  </span>
                  <span className={`text-xs font-bold transition-all duration-300 ${isHovered ? 'text-green-400 scale-105' : 'text-indigo-300'}`}>
                    {stage.icon} {stage.name}
                  </span>
                  <span className={`text-xs text-center max-w-[100px] transition-all duration-300 ${isHovered ? 'text-white/80' : 'text-white/50'}`}>
                    {stage.desc}
                  </span>
                  <div className={`text-[10px] text-green-400/80 max-w-[140px] text-center transition-all duration-300 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-green-500/20 ${
                    isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
                  }`}>
                    💡 {stage.action}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="mt-4 flex justify-center items-center gap-6 text-xs text-white/40 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full border-2 border-indigo-500"></div>
          <span>In Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full border-2 border-green-400" style={{ boxShadow: '0 0 12px rgba(16,185,129,0.3)' }}></div>
          <span>Hover (Green Glow)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500 flex items-center justify-center text-[6px] text-white">✓</div>
          <span>Complete (100%)</span>
        </div>
      </div>
    </div>
  );
};

// 10. KPIs VISUAL
const KPICards = ({ plan }: { plan: string }) => {
  const parseKPIs = (): (KPI & { 
    status: 'on-target' | 'at-risk' | 'behind'; 
    action: string; 
    okrLink: string;
    role: string;
    category: 'leading' | 'lagging' | 'correlated';
    importance: 'primary' | 'secondary' | 'supporting';
  })[] => {
    const content = extractTagContent(plan, 'KPI OUTPUT');
    let kpis: KPI[] = [];
    
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
      const planContent = plan.toLowerCase();
      
      const kpiMap = [
        { keywords: ['subscription', 'membership', 'revenue'], label: 'Monthly Recurring Revenue', value: 'ETB 225K', trend: '18.5', isUp: true },
        { keywords: ['customer', 'user', 'active'], label: 'Active Users', value: '12,450', trend: '22.3', isUp: true },
        { keywords: ['conversion', 'sign-up', 'rate'], label: 'Conversion Rate', value: '14.2%', trend: '8.7', isUp: true },
        { keywords: ['churn', 'retention', 'loyalty'], label: 'Customer Churn', value: '4.8%', trend: '12.5', isUp: false },
        { keywords: ['satisfaction', 'nps', 'score'], label: 'Net Promoter Score', value: '72', trend: '5.1', isUp: true }
      ];
      
      for (const kpiDef of kpiMap) {
        if (kpiDef.keywords.some(kw => planContent.includes(kw))) {
          kpis.push({
            label: kpiDef.label,
            value: kpiDef.value,
            trend: kpiDef.trend,
            isUp: kpiDef.isUp
          });
        }
      }
      
      if (kpis.length === 0) {
        kpis = [
          { label: 'Revenue Growth', value: 'ETB 850K', trend: '15.2', isUp: true },
          { label: 'Customer Acquisition Cost', value: 'ETB 45', trend: '7.8', isUp: false },
          { label: 'Customer Lifetime Value', value: 'ETB 1,200', trend: '10.4', isUp: true },
          { label: 'Net Promoter Score', value: '72', trend: '5.1', isUp: true }
        ];
      }
    }

    kpis = kpis.slice(0, 4);

    const okrContent = extractTagContent(plan, 'OKRS OUTPUT');
    let okrs: Objective[] = [];
    
    if (okrContent) {
      const lines = okrContent.split('\n');
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
      const planContent = plan.toLowerCase();
      
      if (planContent.includes('subscription') || planContent.includes('membership')) {
        okrs.push({
          objective: 'Grow subscription base and revenue',
          krs: [
            { name: 'Reach 10,000 paid subscribers by end of year', progress: 45 },
            { name: 'Achieve ETB 2.5M in annual recurring revenue', progress: 30 }
          ]
        });
      }
      
      if (planContent.includes('customer') || planContent.includes('user')) {
        okrs.push({
          objective: 'Enhance customer satisfaction and retention',
          krs: [
            { name: 'Maintain customer churn below 5%', progress: 70 },
            { name: 'Achieve NPS score of 70+', progress: 55 }
          ]
        });
      }
      
      if (okrs.length === 0) {
        okrs = [
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
    }

    const roleMapping = [
      { label: 'Revenue Growth', role: 'Market Sizing', category: 'lagging', importance: 'primary' },
      { label: 'Monthly Recurring Revenue', role: 'Market Sizing', category: 'lagging', importance: 'primary' },
      { label: 'Customer Acquisition Cost', role: '4Ps', category: 'leading', importance: 'secondary' },
      { label: 'Customer Lifetime Value', role: 'Customer Journey', category: 'lagging', importance: 'primary' },
      { label: 'Active Users', role: 'Segmentation', category: 'leading', importance: 'secondary' },
      { label: 'Conversion Rate', role: '4Ps', category: 'leading', importance: 'secondary' },
      { label: 'Customer Churn', role: 'Customer Journey', category: 'lagging', importance: 'primary' },
      { label: 'Net Promoter Score', role: 'Positioning', category: 'lagging', importance: 'secondary' }
    ];

    return kpis.map((kpi) => {
      let status: 'on-target' | 'at-risk' | 'behind' = 'on-target';
      let action = 'Monitor closely.';
      
      const trendNum = parseFloat(kpi.trend);
      if (kpi.isUp && trendNum >= 10) {
        status = 'on-target';
        action = 'Continue current strategy. Maintain momentum.';
      } else if (kpi.isUp && trendNum < 5) {
        status = 'at-risk';
        action = 'Growth slowing. Boost marketing efforts.';
      } else if (!kpi.isUp && trendNum < 8) {
        status = 'at-risk';
        action = 'Declining. Analyze and adjust approach.';
      } else if (!kpi.isUp && trendNum >= 8) {
        status = 'behind';
        action = 'Significant decline. Conduct root cause analysis.';
      }

      const roleInfo = roleMapping.find(r => r.label === kpi.label) || {
        role: 'KPIs',
        category: 'leading' as const,
        importance: 'secondary' as const
      };

      let okrLink = 'Aligns with overall strategy.';
      const kpiLabel = kpi.label.toLowerCase();
      
      if (okrs.length > 0) {
        for (const okr of okrs) {
          const okrText = okr.objective.toLowerCase();
          if (kpiLabel.includes('revenue') || kpiLabel.includes('subscription') || kpiLabel.includes('growth')) {
            if (okrText.includes('revenue') || okrText.includes('subscription') || okrText.includes('growth')) {
              okrLink = `🎯 "${okr.objective}"`;
              break;
            }
          }
          if (kpiLabel.includes('churn') || kpiLabel.includes('retention') || kpiLabel.includes('satisfaction')) {
            if (okrText.includes('customer') || okrText.includes('retention') || okrText.includes('satisfaction')) {
              okrLink = `🎯 "${okr.objective}"`;
              break;
            }
          }
          if (kpiLabel.includes('conversion') || kpiLabel.includes('acquisition')) {
            if (okrText.includes('market') || okrText.includes('penetration') || okrText.includes('growth')) {
              okrLink = `🎯 "${okr.objective}"`;
              break;
            }
          }
        }
        if (okrLink === 'Aligns with overall strategy.' && okrs.length > 0) {
          okrLink = `🎯 "${okrs[0].objective}"`;
        }
      }

      return { 
        ...kpi, 
        status, 
        action, 
        okrLink,
        role: roleInfo.role,
        category: roleInfo.category as 'leading' | 'lagging' | 'correlated',
        importance: roleInfo.importance as 'primary' | 'secondary' | 'supporting'
      };
    });
  };

  const enhancedKpis = parseKPIs();

  const TrendingUpIcon = ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
      <polyline points="17 6 23 6 23 12"/>
    </svg>
  );

  const TrendingDownIcon = ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
      <polyline points="17 18 23 18 23 12"/>
    </svg>
  );

  return (
    <div className="text-center">
      <h2 className="text-xl font-bold text-indigo-300 mb-6">Strategic KPIs & Performance Dashboard</h2>
      
      {enhancedKpis.length === 0 ? (
        <div className="text-center py-10 text-white/50">
          <p>No KPI data found. Please generate a new plan with KPI data.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {enhancedKpis.map((kpi, index) => {
            const statusColor = kpi.status === 'on-target' ? '#10b981' :
                               kpi.status === 'at-risk' ? '#f59e0b' : '#ef4444';
            
            const statusLabel = kpi.status === 'on-target' ? 'On Target' :
                               kpi.status === 'at-risk' ? 'At Risk' : 'Behind';
            
            const roleColors: Record<string, string> = {
              'Segmentation': '#4ade80',
              'Market Sizing': '#22d3ee',
              'PESTLE': '#fbbf24',
              "Porter's Forces": '#a78bfa',
              'Competitors': '#f472b6',
              'Positioning': '#818cf8',
              '4Ps': '#34d399',
              'SWOT': '#f87171',
              'Customer Journey': '#60a5fa',
              'KPIs': '#f59e0b',
              'OKRs': '#10b981',
              'Roadmap': '#ec4899'
            };
            
            const roleColor = roleColors[kpi.role] || '#64748b';
            
            return (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-xl rounded-xl p-5 border-l-4 transition-all hover:translate-y-[-5px] hover:shadow-lg relative overflow-hidden"
                style={{ borderLeftColor: statusColor }}
              >
                <div 
                  className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full animate-pulse"
                  style={{ background: statusColor }}
                />
                
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                    style={{ 
                      background: `${roleColor}20`, 
                      color: roleColor,
                      border: `1px solid ${roleColor}30`
                    }}>
                    {kpi.role}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    kpi.importance === 'primary' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' :
                    'bg-white/10 text-white/40'
                  }`}>
                    {kpi.importance}
                  </span>
                </div>
                
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">{kpi.label}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    kpi.status === 'on-target' ? 'bg-green-500/20 text-green-400' :
                    kpi.status === 'at-risk' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {statusLabel}
                  </span>
                </div>
                
                <div className="flex items-baseline gap-3 flex-wrap mb-2">
                  <div className="text-2xl font-bold text-indigo-300">{kpi.value}</div>
                  <div className={`flex items-center text-sm font-semibold px-2 py-0.5 rounded-full ${
                    kpi.isUp ? 'text-green-400 bg-green-400/10 border border-green-400/20' :
                               'text-red-400 bg-red-400/10 border border-red-400/20'
                  }`}>
                    {kpi.isUp ? <TrendingUpIcon size={14} /> : <TrendingDownIcon size={14} />}
                    {kpi.trend}%
                  </div>
                </div>

                <div className="text-[9px] text-white/30 uppercase tracking-wider mb-1">
                  {kpi.category} indicator
                </div>

                <div className="mt-2 pt-2 border-t border-white/10 space-y-1.5">
                  <p className="text-[10px] text-white/50 flex items-start gap-1.5">
                    <span className="text-indigo-400 font-bold text-[10px] mt-0.5">📌</span>
                    <span className="leading-tight">{kpi.okrLink}</span>
                  </p>
                  <p className="text-[10px] text-white/60 italic flex items-start gap-1.5">
                    <span className="text-indigo-400 font-bold text-[10px] mt-0.5">→</span>
                    <span className="leading-tight">{kpi.action}</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// 11. OKRs VISUAL
const OKRDiagram = ({ plan }: { plan: string }) => {
  const parseOKRs = (): (Objective & { 
    strategicDriver: string; 
    weeklyCadence: string;
    status: 'on-track' | 'at-risk' | 'behind';
  })[] => {
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
      const planContent = plan.toLowerCase();
      
      if (planContent.includes('subscription') || planContent.includes('membership')) {
        okrs.push({
          objective: 'Grow subscription base and revenue',
          krs: [
            { name: 'Reach 10,000 paid subscribers by end of year', progress: 45 },
            { name: 'Achieve ETB 2.5M in annual recurring revenue', progress: 30 }
          ]
        });
      }
      
      if (planContent.includes('customer') || planContent.includes('user')) {
        okrs.push({
          objective: 'Enhance customer satisfaction and retention',
          krs: [
            { name: 'Maintain customer churn below 5%', progress: 70 },
            { name: 'Achieve NPS score of 70+', progress: 55 }
          ]
        });
      }
      
      if (okrs.length === 0) {
        okrs.push({
          objective: 'Accelerate market penetration and brand awareness',
          krs: [
            { name: 'Increase market share by 15% within 12 months', progress: 60 },
            { name: 'Achieve 50% brand recognition in target demographic', progress: 40 }
          ]
        });
        okrs.push({
          objective: 'Optimize operational efficiency and customer experience',
          krs: [
            { name: 'Reduce customer onboarding time by 30%', progress: 75 },
            { name: 'Maintain customer satisfaction score above 4.5/5', progress: 80 }
          ]
        });
      }
    }

    const strategicDrivers: Record<string, string> = {
      'subscription': 'Revenue Growth',
      'customer': 'Customer Retention',
      'market': 'Market Expansion',
      'brand': 'Brand Awareness',
      'efficiency': 'Operational Excellence'
    };

    return okrs.slice(0, 2).map((okr) => {
      const okrText = okr.objective.toLowerCase();
      let driver = 'Strategic Alignment';
      
      for (const [key, value] of Object.entries(strategicDrivers)) {
        if (okrText.includes(key)) {
          driver = value;
          break;
        }
      }

      const avgProgress = okr.krs.reduce((sum, kr) => sum + kr.progress, 0) / okr.krs.length;
      let status: 'on-track' | 'at-risk' | 'behind' = 'on-track';
      if (avgProgress >= 70) status = 'on-track';
      else if (avgProgress >= 40) status = 'at-risk';
      else status = 'behind';

      return {
        ...okr,
        strategicDriver: driver,
        weeklyCadence: 'Weekly Review (Monday)',
        status
      };
    });
  };

  const okrs = parseOKRs();

  const safeEscape = (text: string): string => {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const CheckIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );

  const CalendarIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );

  return (
    <div className="text-center">
      <h2 className="text-xl font-bold text-indigo-300 mb-6">Objectives & Key Results (OKRs)</h2>
      
      {okrs.length === 0 ? (
        <div className="text-center py-10 text-white/50">
          <p>No OKR data found. Please generate a new plan with OKR data.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {okrs.map((okr, idx) => {
            const avgProgress = okr.krs.reduce((sum, kr) => sum + kr.progress, 0) / okr.krs.length;
            const statusColor = okr.status === 'on-track' ? '#10b981' :
                               okr.status === 'at-risk' ? '#f59e0b' : '#ef4444';
            
            return (
              <div
                key={idx}
                className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border-l-4 transition-all hover:translate-y-[-5px] hover:shadow-lg"
                style={{ borderLeftColor: statusColor }}
              >
                <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <span
                      className="inline-block font-bold px-3 py-1 rounded-full text-xs uppercase"
                      style={{
                        backgroundColor: idx === 0 ? 'rgba(99, 102, 241, 0.15)' : 'rgba(74, 222, 128, 0.15)',
                        color: idx === 0 ? '#a5b4fc' : '#4ade80'
                      }}
                    >
                      {okr.strategicDriver}
                    </span>
                    <span className="text-[10px] text-white/40 flex items-center gap-1">
                      <CalendarIcon />
                      {okr.weeklyCadence}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-3 py-1 rounded-full ${
                      okr.status === 'on-track' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                      okr.status === 'at-risk' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                      'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {okr.status.toUpperCase().replace('-', ' ')}
                  </span>
                </div>

                <div className="mb-4">
                  <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Objective</div>
                  <h3 className="text-lg font-bold text-indigo-300">
                    {safeEscape(okr.objective)}
                  </h3>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-xs text-white/40 mb-1">
                    <span>Overall Progress</span>
                    <strong className="text-white/60">{Math.round(avgProgress)}%</strong>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${avgProgress}%`,
                        background: idx === 0
                          ? 'linear-gradient(90deg, #6366f1, #818cf8)'
                          : 'linear-gradient(90deg, #4ade80, #34d399)'
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {okr.krs.map((kr, krIdx) => (
                    <div key={krIdx} className="bg-white/5 rounded-lg p-4 border border-white/5">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-white/80 font-medium">
                          {safeEscape(kr.name)}
                        </span>
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
                      <div className="mt-2 flex justify-end">
                        <span className="text-[10px] text-white/30">
                          {kr.progress >= 80 ? (
                            <span className="text-green-400 flex items-center gap-1">
                              <CheckIcon /> On Track
                            </span>
                          ) : kr.progress >= 50 ? (
                            <span className="text-yellow-400">In Progress</span>
                          ) : (
                            <span className="text-red-400">Needs Attention</span>
                          )}
                        </span>
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

// 12. ROADMAP VISUAL
const RoadmapVisual = ({ plan }: { plan: string }) => {
  const [hoveredPhase, setHoveredPhase] = useState<number | null>(null);
  const content = extractTagContent(plan, 'ROADMAP OUTPUT');
  
  const parseRoadmap = () => {
    if (!content) {
      return [
        { title: 'Foundation Phase', days: 'Days 1-14', items: ['Define product vision and core features', 'Build MVP with essential functionality', 'Set up analytics and tracking infrastructure'], status: 'completed' as const, progress: 100 },
        { title: 'Growth Phase', days: 'Days 15-30', items: ['Launch initial marketing campaigns', 'Onboard first 100 early adopters', 'Collect user feedback and iterate'], status: 'in-progress' as const, progress: 65 },
        { title: 'Scale Phase', days: 'Days 31-60', items: ['Scale marketing efforts across channels', 'Achieve 1,000 active users milestone', 'Optimize product based on user data'], status: 'pending' as const, progress: 25 },
        { title: 'Expansion Phase', days: 'Days 61-90', items: ['Expand to new markets and segments', 'Launch premium tier and enterprise offerings', 'Achieve $100K in monthly recurring revenue'], status: 'pending' as const, progress: 0 }
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

    return phases.length > 0 ? phases.slice(0, 4).map((phase, index) => {
      let status: 'completed' | 'in-progress' | 'pending' = 'pending';
      let progress = 0;
      if (index === 0) { status = 'completed'; progress = 100; }
      else if (index === 1) { status = 'in-progress'; progress = 65; }
      else { status = 'pending'; progress = 0; }
      return { ...phase, status, progress };
    }) : [
      { title: 'Foundation', days: 'Days 1-7', items: ['No roadmap data available'], status: 'pending' as const, progress: 0 },
      { title: 'Awareness', days: 'Days 8-14', items: ['Generate a new plan for detailed roadmap'], status: 'pending' as const, progress: 0 }
    ];
  };

  const phases = parseRoadmap();

  const getPhaseColor = (status: string): string => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'in-progress': return '#f59e0b';
      default: return '#64748b';
    }
  };

  const getPhaseLabel = (status: string): string => {
    switch (status) {
      case 'completed': return '✅ Complete';
      case 'in-progress': return '⏳ In Progress';
      default: return '⏱️ Pending';
    }
  };

  const getPhaseLayout = (index: number): 'left' | 'right' => {
    return index % 2 === 0 ? 'left' : 'right';
  };

  return (
    <div className="text-center">
      <h2 className="text-xl font-bold text-indigo-300 mb-6">Strategic Roadmap</h2>
      
      {phases.length === 0 ? (
        <div className="text-center py-10 text-white/50">
          <p>No roadmap data found. Please generate a new plan with roadmap data.</p>
        </div>
      ) : (
        <div className="relative max-w-4xl mx-auto">
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 via-green-400 to-emerald-500 transform -translate-x-1/2 opacity-20" />
          
          <div className="flex flex-col gap-6 py-4 relative z-10">
            {phases.map((phase, index) => {
              const isHovered = hoveredPhase === index;
              const layout = getPhaseLayout(index);
              const color = getPhaseColor(phase.status);
              const isLeft = layout === 'left';
              const progress = phase.progress || 0;
              
              const items = phase.items && phase.items.length > 0 ? phase.items : ['No specific tasks defined'];
              
              return (
                <div 
                  key={index}
                  className={`flex items-stretch ${isLeft ? 'flex-row' : 'flex-row-reverse'} relative`}
                  onMouseEnter={() => setHoveredPhase(index)}
                  onMouseLeave={() => setHoveredPhase(null)}
                >
                  <div className="w-1/2 flex justify-center items-start pt-2">
                    <div className="relative flex flex-col items-center">
                      <div 
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer relative ${
                          isHovered ? 'scale-125' : 'scale-100'
                        }`}
                        style={{ 
                          background: `radial-gradient(circle at center, ${color}30, ${color}05)`,
                          border: `3px solid ${color}`,
                          boxShadow: isHovered ? `0 0 40px ${color}50` : `0 0 20px ${color}20`
                        }}
                      >
                        <span className="text-white font-bold text-sm">{index + 1}</span>
                        {phase.status === 'completed' && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-[10px] text-white shadow-lg shadow-green-500/30">✓</div>
                        )}
                        {phase.status === 'in-progress' && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center text-[10px] text-white shadow-lg shadow-yellow-500/30 animate-pulse">●</div>
                        )}
                      </div>
                      {index < phases.length - 1 && (
                        <div className="h-12 w-0.5 bg-gradient-to-b from-current to-transparent opacity-20" style={{ color }} />
                      )}
                    </div>
                  </div>

                  <div 
                    className={`w-1/2 ${isLeft ? 'pr-6 text-left' : 'pl-6 text-left'} transition-all duration-300 ${
                      isHovered ? 'opacity-100' : 'opacity-90'
                    }`}
                  >
                    <div 
                      className={`bg-gradient-to-br from-slate-800/85 to-slate-900/95 rounded-xl p-5 border transition-all duration-300 h-full ${
                        isHovered ? 'border-indigo-500/60 shadow-xl shadow-indigo-500/10 transform scale-[1.02]' : 'border-white/10'
                      }`}
                      style={{ 
                        borderLeftColor: color,
                        borderLeftWidth: isHovered ? '4px' : '3px'
                      }}
                    >
                      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-indigo-300">{phase.title || `Phase ${index + 1}`}</span>
                          <span 
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: `${color}20`,
                              color: color,
                              border: `1px solid ${color}30`
                            }}
                          >
                            {phase.status.toUpperCase().replace('-', ' ')}
                          </span>
                        </div>
                        <span className="text-xs text-white/40 bg-black/30 px-2 py-0.5 rounded-full">{phase.days || `Phase ${index + 1}`}</span>
                      </div>

                      <div className="mb-3">
                        <div className="flex justify-between text-[10px] text-white/40 mb-0.5">
                          <span>Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${progress}%`,
                              background: `linear-gradient(90deg, ${color}, ${color}dd)`
                            }}
                          />
                        </div>
                      </div>

                      <ul className="space-y-1.5">
                        {items.slice(0, 4).map((item: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-white/70 group/item">
                            <span className="text-indigo-400 mt-0.5 text-[10px]">▸</span>
                            <span className="leading-tight">{item}</span>
                          </li>
                        ))}
                      </ul>

                      {isHovered && (
                        <div className="mt-3 pt-2 border-t border-white/5">
                          <span className="text-[10px] text-white/30 flex items-center gap-1">{getPhaseLabel(phase.status)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-center items-center gap-6 text-xs text-white/40 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse"></div>
          <span>In Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-slate-600"></div>
          <span>Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full border-2 border-indigo-500" style={{ boxShadow: '0 0 12px rgba(99,102,241,0.3)' }}></div>
          <span>Hover Effect</span>
        </div>
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
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      try {
        const response = await fetch(`${API_BASE}/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            customer_data: customerData,
            product_description: productDescription
          })
        });

        clearTimeout(timeoutId);

        if (!response.ok) throw new Error('Generation failed');

        const data = await response.json();
        const plan = data.plan;

        setProgress(50);
        setStatus('Processing strategy...');
        await new Promise(r => setTimeout(r, 300));

        setCurrentPlan(plan);
        setResultContent(plan);
        setProgress(100);
        setStatus('✅ Strategy generated successfully!');
        setShowResult(true);
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        
        setStatus('⏱️ Using instant strategy...');
        await new Promise(r => setTimeout(r, 300));
        
        const mockPlan = generateMockPlan(customerData, productDescription);
        setCurrentPlan(mockPlan);
        setResultContent(mockPlan);
        setProgress(100);
        setStatus('✅ Strategy ready (instant generation)');
        setShowResult(true);
      }

      setTimeout(() => {
        setProgress(0);
        setStatus('');
      }, 2000);
    } catch (error: any) {
      setStatus('🔄 Generating instant strategy...');
      await new Promise(r => setTimeout(r, 200));
      
      const mockPlan = generateMockPlan(customerData, productDescription);
      setCurrentPlan(mockPlan);
      setResultContent(mockPlan);
      setProgress(100);
      setStatus('✅ Strategy generated');
      setShowResult(true);
      
      setTimeout(() => {
        setProgress(0);
        setStatus('');
      }, 2000);
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
