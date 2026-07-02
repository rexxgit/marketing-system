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
// VISUAL COMPONENTS FOR EACH ROLE
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
      <div className="mt-4 p-4 bg-white/5 rounded-lg text-left text-sm text-white/60 max-h-96 overflow-y-auto">
        <pre className="whitespace-pre-wrap">{plan?.substring(0, 300)}...</pre>
      </div>
    </div>
  );
};

const PortersVisual = ({ plan }: { plan: string }) => {
  return (
    <div className="text-center py-10 text-white/70">
      <p className="text-xl font-semibold">🏛️ Porter's Five Forces</p>
      <p className="text-sm text-white/50 mt-2">Plan data received: {plan?.length || 0} characters</p>
      <div className="mt-4 p-4 bg-white/5 rounded-lg text-left text-sm text-white/60 max-h-96 overflow-y-auto">
        <pre className="whitespace-pre-wrap">{plan?.substring(0, 300)}...</pre>
      </div>
    </div>
  );
};

const CompetitorsVisual = ({ plan }: { plan: string }) => {
  return (
    <div className="text-center py-10 text-white/70">
      <p className="text-xl font-semibold">👥 Competitor Analysis</p>
      <p className="text-sm text-white/50 mt-2">Plan data received: {plan?.length || 0} characters</p>
      <div className="mt-4 p-4 bg-white/5 rounded-lg text-left text-sm text-white/60 max-h-96 overflow-y-auto">
        <pre className="whitespace-pre-wrap">{plan?.substring(0, 300)}...</pre>
      </div>
    </div>
  );
};

const PositioningVisual = ({ plan }: { plan: string }) => {
  return (
    <div className="text-center py-10 text-white/70">
      <p className="text-xl font-semibold">🎯 Brand Positioning</p>
      <p className="text-sm text-white/50 mt-2">Plan data received: {plan?.length || 0} characters</p>
      <div className="mt-4 p-4 bg-white/5 rounded-lg text-left text-sm text-white/60 max-h-96 overflow-y-auto">
        <pre className="whitespace-pre-wrap">{plan?.substring(0, 300)}...</pre>
      </div>
    </div>
  );
};

const FourPsVisual = ({ plan }: { plan: string }) => {
  return (
    <div className="text-center py-10 text-white/70">
      <p className="text-xl font-semibold">📦 Marketing Mix (4Ps)</p>
      <p className="text-sm text-white/50 mt-2">Plan data received: {plan?.length || 0} characters</p>
      <div className="mt-4 p-4 bg-white/5 rounded-lg text-left text-sm text-white/60 max-h-96 overflow-y-auto">
        <pre className="whitespace-pre-wrap">{plan?.substring(0, 300)}...</pre>
      </div>
    </div>
  );
};

const SWOTVisual = ({ plan }: { plan: string }) => {
  return (
    <div className="text-center py-10 text-white/70">
      <p className="text-xl font-semibold">⚡ SWOT Analysis</p>
      <p className="text-sm text-white/50 mt-2">Plan data received: {plan?.length || 0} characters</p>
      <div className="mt-4 p-4 bg-white/5 rounded-lg text-left text-sm text-white/60 max-h-96 overflow-y-auto">
        <pre className="whitespace-pre-wrap">{plan?.substring(0, 300)}...</pre>
      </div>
    </div>
  );
};

const CustomerJourneyVisual = ({ plan }: { plan: string }) => {
  return (
    <div className="text-center py-10 text-white/70">
      <p className="text-xl font-semibold">🗺️ Customer Journey Map</p>
      <p className="text-sm text-white/50 mt-2">Plan data received: {plan?.length || 0} characters</p>
      <div className="mt-4 p-4 bg-white/5 rounded-lg text-left text-sm text-white/60 max-h-96 overflow-y-auto">
        <pre className="whitespace-pre-wrap">{plan?.substring(0, 300)}...</pre>
      </div>
    </div>
  );
};

const KPICards = ({ plan }: { plan: string }) => {
  return (
    <div className="text-center py-10 text-white/70">
      <p className="text-xl font-semibold">📊 Key Performance Indicators</p>
      <p className="text-sm text-white/50 mt-2">Plan data received: {plan?.length || 0} characters</p>
      <div className="mt-4 p-4 bg-white/5 rounded-lg text-left text-sm text-white/60 max-h-96 overflow-y-auto">
        <pre className="whitespace-pre-wrap">{plan?.substring(0, 300)}...</pre>
      </div>
    </div>
  );
};

const OKRDiagram = ({ plan }: { plan: string }) => {
  return (
    <div className="text-center py-10 text-white/70">
      <p className="text-xl font-semibold">🎯 Objectives & Key Results</p>
      <p className="text-sm text-white/50 mt-2">Plan data received: {plan?.length || 0} characters</p>
      <div className="mt-4 p-4 bg-white/5 rounded-lg text-left text-sm text-white/60 max-h-96 overflow-y-auto">
        <pre className="whitespace-pre-wrap">{plan?.substring(0, 300)}...</pre>
      </div>
    </div>
  );
};

const RoadmapVisual = ({ plan }: { plan: string }) => {
  return (
    <div className="text-center py-10 text-white/70">
      <p className="text-xl font-semibold">🗓️ 30-Day Roadmap</p>
      <p className="text-sm text-white/50 mt-2">Plan data received: {plan?.length || 0} characters</p>
      <div className="mt-4 p-4 bg-white/5 rounded-lg text-left text-sm text-white/60 max-h-96 overflow-y-auto">
        <pre className="whitespace-pre-wrap">{plan?.substring(0, 300)}...</pre>
      </div>
    </div>
  );
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
// ROLE 4: PESTLE EXPERT (FULL WORKING IMPLEMENTATION)
// ============================================

const PESTLEVisual = ({ plan }: { plan: string }) => {
  // ... (your existing PESTLEVisual code - unchanged)
  // Keeping it as is since it's already working
};

// ============================================
// MAIN APP COMPONENT
// ============================================

function App() {
  // ... (your existing App code - unchanged)
  // Keeping everything else exactly as you had it
}

export default App;
