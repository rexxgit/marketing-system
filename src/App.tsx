import { useState, useEffect } from 'react';
import {
  Target, BarChart3, Zap, Building2, Search, MapPin, Grid3X3, Diamond,
  Route, TrendingUp, Crosshair, Calendar, Paintbrush, Home, ClipboardList,
  Lightbulb, DollarSign, Rocket, User, ArrowRight, Lock, Database,
  Check, Star, Heart, Brain, Settings, Menu, X, Download, Copy,
  Users, ShoppingBag, Factory, RefreshCw, Swords, Package, Map,
  Award, TrendingDown
} from 'lucide-react';

// ===== NEW IMPORTS =====
import ResultDisplay from './components/ResultDisplay';
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

// [KEEP ALL YOUR VISUAL COMPONENTS HERE - SegmentationVisual, MarketSizingVennDiagram, 
// KPICards, OKRDiagram, PESTLEVisual, PortersVisual, CompetitorsVisual, 
// PositioningVisual, FourPsVisual, SWOTVisual, CustomerJourneyVisual, RoadmapVisual]
// They remain unchanged - paste them here

// ============================================
// MAIN APP COMPONENT - UPDATED WITH PROFESSIONAL 
// CONSCIENTIOUSNESS LAYOUT
// ============================================

function App() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  
  // ===== AUTH STATE (Sidebar Hidden by Default) =====
  const [panelOpen, setPanelOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const [customerData, setCustomerData] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string>('');
  const [activeRole, setActiveRole] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');

  // ===== NEW STATE FOR PDF EXPORT =====
  const [showResult, setShowResult] = useState(false);

  // ===== AUTH HANDLERS =====
  const handleLogin = () => {
    setIsAuthenticated(true);
    setPanelOpen(true);
    console.log('🔐 User logged in - Unlocking 13 Expert Roles');
  };

  const handleSignIn = () => {
    setIsAuthenticated(true);
    setPanelOpen(true);
    console.log('👤 User signed in - Unlocking 13 Expert Roles');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPanelOpen(false);
    setActiveRole(null);
    setShowResult(false);
    console.log('🚪 User logged out');
  };

  // ===== TOGGLE SIDEBAR =====
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
    setShowResult(false);

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
                  onClick={() => { 
                    setCustomerData(''); 
                    setProductDescription(''); 
                    setCurrentPlan(''); 
                    setActiveRole(null);
                    setShowResult(false);
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

            {/* ===== RESULT DISPLAY ===== */}
            {showResult && currentPlan && (
              <div className="result-wrapper">
                <ResultDisplay 
                  content={currentPlan}
                  title="Strategic Marketing Plan"
                  onCopy={() => {
                    setStatus('📋 Plan copied to clipboard!');
                    setTimeout(() => setStatus(''), 3000);
                  }}
                  onPDFExport={() => {
                    // PDF export is handled by the PDFExport component inside ResultDisplay
                    console.log('PDF export triggered');
                  }}
                />
                
                {/* ===== PDF EXPORT BUTTON ===== */}
                <div className="flex justify-end mt-4">
                  <PDFExport 
                    content={currentPlan}
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
      {/* ===== SIDEBAR: 13 ROLES (Hidden by Default) ===== */}
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

      {/* ===== MAIN CONTENT ===== */}
      <div className={`flex-1 transition-all duration-300 ${panelOpen && isAuthenticated ? 'ml-72' : 'ml-0'}`}>
        {/* ===== GLASS HEADER ===== */}
        <nav className="flex justify-between items-center py-5 px-8 border-b border-white/10 flex-wrap gap-4 bg-[#0a0e1a]/80 backdrop-blur-xl sticky top-0 z-40">
          <div className="flex items-center gap-4">
            {/* Sidebar Toggle - Only visible when authenticated */}
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

          {/* ===== AUTH BUTTONS (Top Right Corner) ===== */}
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

        {/* ===== PAGE CONTENT ===== */}
        <main className="p-8">
          {renderPage()}
        </main>

        {/* ===== FOOTER ===== */}
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
