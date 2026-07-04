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
    if (match && match[1]) {
      const trimmed = match[1].trim();
      if (trimmed.length > 5) {
        return trimmed;
      }
    }
    
    // Try bold format: **TAG** (for PESTLE)
    const boldRegex = new RegExp(`\\*\\*${possibleTag}\\*\\*\\s*\\n([\\s\\S]*?)(?=\\n\\n---|\\n\\[|\\n\\*\\*|$)`, 'i');
    const boldMatch = plan.match(boldRegex);
    if (boldMatch && boldMatch[1]) {
      const trimmed = boldMatch[1].trim();
      if (trimmed.length > 5) {
        return trimmed;
      }
    }
  }
  
  // Fallback: Try to find the tag without exact matching
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
// PLACEHOLDER VISUAL COMPONENTS
// ============================================

const SegmentationVisual = ({ plan }: { plan: string }) => {
  return (
    <div className="text-center py-10 text-white/70">
      <p className="text-xl font-semibold">📊 Segmentation Analysis</p>
      <p className="text-sm text-white/50 mt-2">Plan data received: {plan?.length || 0} characters</p>
      <div className="mt-4 p-4 bg-white/5 rounded-lg text-left text-sm text-white/60 max-h-96 overflow-y-auto">
        <pre className="whitespace-pre-wrap">{plan?.substring(0, 300)}...</pre>
      </div>
    </div>
  );
};

const MarketSizingVennDiagram = ({ plan }: { plan: string }) => {
  return (
    <div className="text-center py-10 text-white/70">
      <p className="text-xl font-semibold">📈 Market Sizing (TAM/SAM/SOM)</p>
      <p className="text-sm text-white/50 mt-2">Plan data received: {plan?.length || 0} characters</p>
    </div>
  );
};

const PortersVisual = ({ plan }: { plan: string }) => {
  return (
    <div className="text-center py-10 text-white/70">
      <p className="text-xl font-semibold">🏛️ Porter's Five Forces</p>
      <p className="text-sm text-white/50 mt-2">Plan data received: {plan?.length || 0} characters</p>
    </div>
  );
};

const CompetitorsVisual = ({ plan }: { plan: string }) => {
  return (
    <div className="text-center py-10 text-white/70">
      <p className="text-xl font-semibold">👥 Competitor Analysis</p>
      <p className="text-sm text-white/50 mt-2">Plan data received: {plan?.length || 0} characters</p>
    </div>
  );
};

const PositioningVisual = ({ plan }: { plan: string }) => {
  return (
    <div className="text-center py-10 text-white/70">
      <p className="text-xl font-semibold">🎯 Brand Positioning</p>
      <p className="text-sm text-white/50 mt-2">Plan data received: {plan?.length || 0} characters</p>
    </div>
  );
};

const FourPsVisual = ({ plan }: { plan: string }) => {
  return (
    <div className="text-center py-10 text-white/70">
      <p className="text-xl font-semibold">📦 Marketing Mix (4Ps)</p>
      <p className="text-sm text-white/50 mt-2">Plan data received: {plan?.length || 0} characters</p>
    </div>
  );
};

const SWOTVisual = ({ plan }: { plan: string }) => {
  return (
    <div className="text-center py-10 text-white/70">
      <p className="text-xl font-semibold">⚡ SWOT Analysis</p>
      <p className="text-sm text-white/50 mt-2">Plan data received: {plan?.length || 0} characters</p>
    </div>
  );
};

const CustomerJourneyVisual = ({ plan }: { plan: string }) => {
  return (
    <div className="text-center py-10 text-white/70">
      <p className="text-xl font-semibold">🗺️ Customer Journey Map</p>
      <p className="text-sm text-white/50 mt-2">Plan data received: {plan?.length || 0} characters</p>
    </div>
  );
};

const KPICards = ({ plan }: { plan: string }) => {
  return (
    <div className="text-center py-10 text-white/70">
      <p className="text-xl font-semibold">📊 Key Performance Indicators</p>
      <p className="text-sm text-white/50 mt-2">Plan data received: {plan?.length || 0} characters</p>
    </div>
  );
};

const OKRDiagram = ({ plan }: { plan: string }) => {
  return (
    <div className="text-center py-10 text-white/70">
      <p className="text-xl font-semibold">🎯 Objectives & Key Results</p>
      <p className="text-sm text-white/50 mt-2">Plan data received: {plan?.length || 0} characters</p>
    </div>
  );
};

const RoadmapVisual = ({ plan }: { plan: string }) => {
  return (
    <div className="text-center py-10 text-white/70">
      <p className="text-xl font-semibold">🗓️ 30-Day Roadmap</p>
      <p className="text-sm text-white/50 mt-2">Plan data received: {plan?.length || 0} characters</p>
    </div>
  );
};

// ============================================
// ROLE 4: PESTLE EXPERT (FIXED - CAPTURES BULLET POINTS)
// ============================================

const PESTLEVisual = ({ plan }: { plan: string }) => {
  const parsePESTLE = () => {
    const pestleData: { key: string; icon: string; title: string; insight: string; impact: string }[] = [];
    const categories = [
      { key: 'political', icon: '🏛️', title: 'Political' },
      { key: 'economic', icon: '📈', title: 'Economic' },
      { key: 'social', icon: '👥', title: 'Social' },
      { key: 'technological', icon: '💻', title: 'Technological' },
      { key: 'legal', icon: '⚖️', title: 'Legal' },
      { key: 'environmental', icon: '🌿', title: 'Environmental' }
    ];

    // Get the PESTLE section
    const pestleSection = plan.match(/\[PESTLE\s+OUTPUT\]([\s\S]*?)(?=\n\n---|\n\[|$)/i);
    let searchText = '';
    
    if (pestleSection && pestleSection[1]) {
      searchText = pestleSection[1].trim();
      console.log('✅ Found PESTLE section, length:', searchText.length);
    }
    
    if (!searchText) {
      console.log('❌ No PESTLE section found');
      return [];
    }

    for (const cat of categories) {
      let insight = '';
      let impact = 'medium';
      
      // Pattern: **Economic Drivers:** followed by bullet points
      const pattern = new RegExp(
        `\\*\\*${cat.title}\\s+Drivers\\*\\*[\\s\\n]*([\\s\\S]*?)(?=\\n\\*\\*|\\n\\n|$)`,
        'i'
      );
      
      const match = searchText.match(pattern);
      if (match && match[1]) {
        const content = match[1].trim();
        // Extract bullet points from the content
        const bulletPoints = content.split('\n')
          .filter(line => line.trim().match(/^[-•*]\s+/))
          .map(line => line.replace(/^[-•*]\s+/, '').trim());
        
        if (bulletPoints.length > 0) {
          insight = bulletPoints.join(' ');
          console.log(`✅ Found ${cat.title}:`, insight);
        } else {
          // If no bullet points, take the first sentence
          const firstLine = content.split('\n')[0]?.trim() || '';
          if (firstLine.length > 10) {
            insight = firstLine;
            console.log(`✅ Found ${cat.title} (no bullets):`, insight);
          }
        }
      }
      
      // If still no insight, try a simpler approach
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
            console.log(`✅ Found ${cat.title} via simple pattern:`, insight);
          } else {
            const firstLine = content.split('\n')[0]?.trim() || '';
            if (firstLine.length > 10) {
              insight = firstLine;
              console.log(`✅ Found ${cat.title} via simple pattern (no bullets):`, insight);
            }
          }
        }
      }
      
      // Determine impact based on insight content
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

    console.log('📊 PESTLE data found:', pestleData.length);
    if (pestleData.length > 0) {
      console.log('📊 Sample:', pestleData[0]);
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
          <p className="text-sm mt-2">Try regenerating the plan.</p>
          <details className="mt-4 text-left text-xs text-white/30 max-w-md mx-auto">
            <summary>Debug: Show plan section</summary>
            <pre className="mt-2 p-2 bg-white/5 rounded overflow-auto max-h-40 whitespace-pre-wrap text-xs">
              {plan.substring(0, 1000)}
            </pre>
          </details>
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
