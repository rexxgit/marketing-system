// ============================================
// MARKETING PLAN DISPLAY - PROFESSIONAL CARDS
// ============================================

import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, BarChart3, Zap, Building2, Search, MapPin, Grid3X3, Diamond,
  Route, TrendingUp, Crosshair, Calendar, Paintbrush, ClipboardList,
  Lightbulb, DollarSign, Rocket, User, ArrowRight, Lock, Check,
  Star, Heart, Brain, Settings, Menu, X, Download, Copy,
  Users as UsersIcon, ShoppingBag, Factory, RefreshCw, Swords, Package, Map
} from 'lucide-react';

interface SectionData {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  content: string;
  rawContent: string;
}

// ============================================
// DIRECT PARSING - MATCHES YOUR EXACT FORMAT
// ============================================

const extractSectionContent = (plan: string, sectionName: string): string => {
  if (!plan) return '';
  
  // Your tags look like: [SEGMENTATION OUTPUT]  
  // The regex needs to match exactly that format
  const escapedName = sectionName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`\\[${escapedName}\\]([\\s\\S]*?)(?=\\n\\n---|\\n\\[|$)`, 'i');
  const match = plan.match(regex);
  
  if (match) {
    return match[1].trim();
  }
  
  // Try without the word "OUTPUT"
  const shortName = sectionName.replace(/\s+OUTPUT$/i, '');
  if (shortName !== sectionName) {
    const regex2 = new RegExp(`\\[${shortName}\\]([\\s\\S]*?)(?=\\n\\n---|\\n\\[|$)`, 'i');
    const match2 = plan.match(regex2);
    if (match2) return match2[1].trim();
  }
  
  return '';
};

const parseSections = (plan: string): SectionData[] => {
  const sections = [
    { id: 'segmentation', title: 'Market Segmentation', icon: <Users size={20} />, color: '#4ade80' },
    { id: 'tamsamsom', title: 'Market Sizing (TAM/SAM/SOM)', icon: <BarChart3 size={20} />, color: '#22d3ee' },
    { id: 'pestle', title: 'PESTLE Analysis', icon: <Zap size={20} />, color: '#fbbf24' },
    { id: 'porter', title: "Porter's Five Forces", icon: <Building2 size={20} />, color: '#f472b6' },
    { id: 'competitor', title: 'Competitor Analysis', icon: <Search size={20} />, color: '#a78bfa' },
    { id: 'positioning', title: 'Brand Positioning', icon: <MapPin size={20} />, color: '#f87171' },
    { id: '4ps', title: 'Marketing Mix (4Ps)', icon: <Grid3X3 size={20} />, color: '#34d399' },
    { id: 'swot', title: 'SWOT Analysis', icon: <Diamond size={20} />, color: '#f59e0b' },
    { id: 'journey', title: 'Customer Journey Map', icon: <Route size={20} />, color: '#818cf8' },
    { id: 'kpi', title: 'Key Performance Indicators', icon: <TrendingUp size={20} />, color: '#ec4899' },
    { id: 'okrs', title: 'Objectives & Key Results', icon: <Crosshair size={20} />, color: '#10b981' },
    { id: 'roadmap', title: '30-Day Roadmap', icon: <Calendar size={20} />, color: '#f472b6' },
    { id: 'design', title: 'Design Guidelines', icon: <Paintbrush size={20} />, color: '#8b5cf6' }
  ];

  const results: SectionData[] = [];

  // The exact tag names from your plan
  const tagMap: Record<string, string> = {
    'segmentation': 'SEGMENTATION OUTPUT',
    'tamsamsom': 'TAMSAMSOM OUTPUT',
    'pestle': 'PESTLE OUTPUT',
    'porter': 'PORTER OUTPUT',
    'competitor': 'COMPETITOR OUTPUT',
    'positioning': 'POSITIONING OUTPUT',
    '4ps': '4Ps OUTPUT',
    'swot': 'SWOT OUTPUT',
    'journey': 'CUSTOMER JOURNEY OUTPUT',
    'kpi': 'KPI OUTPUT',
    'okrs': 'OKRS OUTPUT',
    'roadmap': 'ROADMAP OUTPUT',
    'design': 'DESIGN OUTPUT'
  };

  for (const section of sections) {
    const tag = tagMap[section.id] || section.id.toUpperCase() + ' OUTPUT';
    const content = extractSectionContent(plan, tag);

    if (content) {
      results.push({
        id: section.id,
        title: section.title,
        icon: section.icon,
        color: section.color,
        content: formatContent(content),
        rawContent: content
      });
    }
  }

  return results;
};

const formatContent = (content: string): string => {
  let formatted = content;

  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  formatted = formatted.replace(/^[-•*]\s+(.*)$/gm, '<li>$1</li>');
  formatted = formatted.replace(/^\d+\.\s+(.*)$/gm, '<li class="numbered">$1</li>');
  formatted = formatted.replace(/(<li.*?>.*?<\/li>\s*)+/g, (match) => {
    return `<ul>${match}</ul>`;
  });
  formatted = formatted.replace(/\|(.+)\|\n\|[-:| ]+\|\n((?:\|.+\|\n?)+)/g, (match, header, rows) => {
    const headerCells = header.split('|').map(c => c.trim()).filter(c => c);
    const rowCells = rows.split('\n').filter(r => r.trim()).map(r => 
      r.split('|').map(c => c.trim()).filter(c => c)
    );
    
    let tableHtml = '<table><thead><tr>';
    headerCells.forEach(cell => {
      tableHtml += `<th>${cell}</th>`;
    });
    tableHtml += '</tr></thead><tbody>';
    rowCells.forEach(row => {
      tableHtml += '<tr>';
      row.forEach(cell => {
        tableHtml += `<td>${cell}</td>`;
      });
      tableHtml += '</tr>';
    });
    tableHtml += '</tbody></table>';
    return tableHtml;
  });
  formatted = formatted.replace(/\n/g, '<br>');
  
  return formatted;
};

// ============================================
// MAIN COMPONENT
// ============================================

interface MarketingPlanDisplayProps {
  plan: string;
  onSectionVisible?: (sectionId: string) => void;
}

const MarketingPlanDisplay: React.FC<MarketingPlanDisplayProps> = ({ plan, onSectionVisible }) => {
  const [sections, setSections] = useState<SectionData[]>([]);
  const [visibleSections, setVisibleSections] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    if (plan) {
      setIsGenerating(true);
      const parsed = parseSections(plan);
      setSections(parsed);
      
      let delay = 0;
      const interval = 300;
      
      for (const section of parsed) {
        setTimeout(() => {
          setVisibleSections(prev => [...prev, section.id]);
          if (onSectionVisible) onSectionVisible(section.id);
        }, delay);
        delay += interval;
      }
      
      setTimeout(() => {
        setIsGenerating(false);
      }, delay + 500);
    }
  }, [plan, onSectionVisible]);

  if (!plan) {
    return (
      <div className="plan-empty-state">
        <div className="plan-empty-icon">📋</div>
        <h3>No Plan Generated Yet</h3>
        <p>Fill in the customer data and product description, then click "Generate Strategic Plan" to see your professional marketing analysis.</p>
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <div className="plan-empty-state">
        <div className="plan-empty-icon">🔍</div>
        <h3>No Sections Found</h3>
        <p>The generated plan doesn't contain recognizable sections. Please try regenerating.</p>
        <details style={{ marginTop: 12, textAlign: 'left', maxWidth: 500, margin: '12px auto 0', fontSize: 12, color: '#94A3B8' }}>
          <summary>Debug: Show first 500 chars of plan</summary>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', marginTop: 8, background: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 8 }}>
            {plan.substring(0, 500)}
          </pre>
        </details>
      </div>
    );
  }

  return (
    <div className="marketing-plan-display">
      {isGenerating && (
        <div className="plan-generating-banner">
          <div className="plan-generating-spinner"></div>
          <span>Generating your strategic plan...</span>
        </div>
      )}

      <div className="plan-sections-grid">
        {sections.map((section, index) => (
          <div
            key={section.id}
            ref={el => sectionRefs.current[section.id] = el}
            className={`plan-section-card ${visibleSections.includes(section.id) ? 'visible' : 'hidden'}`}
            style={{
              animationDelay: `${index * 150}ms`,
              borderColor: section.color,
              '--glow-color': section.color
            } as React.CSSProperties}
          >
            <div className="plan-section-header">
              <div className="plan-section-icon" style={{ background: `${section.color}20`, color: section.color }}>
                {section.icon}
              </div>
              <h3 className="plan-section-title">{section.title}</h3>
              <span className="plan-section-badge" style={{ background: `${section.color}20`, color: section.color }}>
                {index + 1}/{sections.length}
              </span>
            </div>
            <div 
              className="plan-section-content"
              dangerouslySetInnerHTML={{ __html: section.content }}
            />
          </div>
        ))}
      </div>

      <style>{`
        .marketing-plan-display {
          width: 100%;
          padding: 8px 0;
        }

        .plan-generating-banner {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 24px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
          margin-bottom: 24px;
          color: #CBD5E1;
          font-size: 14px;
          font-weight: 500;
        }

        .plan-generating-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-top-color: #6366f1;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .plan-sections-grid {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .plan-section-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 16px;
          padding: 24px 28px;
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          position: relative;
          overflow: hidden;
          opacity: 0;
          transform: translateY(20px);
        }

        .plan-section-card.visible {
          opacity: 1;
          transform: translateY(0);
          animation: cardPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .plan-section-card.hidden {
          opacity: 0;
          transform: translateY(20px);
        }

        @keyframes cardPop {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .plan-section-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: 16px;
          background: linear-gradient(135deg, transparent 60%, rgba(255, 255, 255, 0.02));
          pointer-events: none;
        }

        .plan-section-card::after {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          border-radius: 18px;
          background: var(--glow-color);
          opacity: 0;
          z-index: -1;
          transition: opacity 0.4s ease;
        }

        .plan-section-card:hover {
          transform: translateY(-4px) scale(1.005);
          border-color: var(--glow-color);
          box-shadow: 
            0 12px 48px rgba(0, 0, 0, 0.4),
            0 0 40px var(--glow-color),
            inset 0 0 40px rgba(255, 255, 255, 0.02);
        }

        .plan-section-card:hover::after {
          opacity: 0.3;
        }

        .plan-section-header {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 16px;
          padding-bottom: 14px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .plan-section-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .plan-section-title {
          flex: 1;
          font-size: 16px;
          font-weight: 600;
          color: #F1F5F9;
          margin: 0;
        }

        .plan-section-badge {
          font-size: 10px;
          font-weight: 600;
          padding: 4px 12px;
          border-radius: 20px;
          flex-shrink: 0;
        }

        .plan-section-content {
          color: #CBD5E1;
          font-size: 14px;
          line-height: 1.8;
        }

        .plan-section-content strong {
          color: #818cf8;
          font-weight: 600;
        }

        .plan-section-content ul {
          margin: 8px 0;
          padding-left: 24px;
          list-style: none;
        }

        .plan-section-content li {
          position: relative;
          padding: 4px 0 4px 20px;
          color: #CBD5E1;
          line-height: 1.6;
        }

        .plan-section-content li::before {
          content: '▸';
          position: absolute;
          left: 0;
          color: #6366f1;
          font-weight: bold;
        }

        .plan-section-content li.numbered::before {
          content: '•';
          color: #818cf8;
        }

        .plan-section-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 12px 0;
          font-size: 13px;
          border-radius: 8px;
          overflow: hidden;
        }

        .plan-section-content table thead {
          background: rgba(99, 102, 241, 0.15);
        }

        .plan-section-content table th {
          padding: 10px 14px;
          text-align: left;
          font-weight: 600;
          color: #818cf8;
          border-bottom: 2px solid rgba(99, 102, 241, 0.2);
        }

        .plan-section-content table td {
          padding: 8px 14px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          color: #CBD5E1;
        }

        .plan-section-content table tr:hover td {
          background: rgba(255, 255, 255, 0.02);
        }

        .plan-section-content br {
          display: block;
          content: '';
          margin: 4px 0;
        }

        .plan-empty-state {
          text-align: center;
          padding: 60px 32px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 16px;
          border: 1px dashed rgba(255, 255, 255, 0.06);
        }

        .plan-empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .plan-empty-state h3 {
          font-size: 20px;
          font-weight: 600;
          color: #94A3B8;
          margin: 0 0 8px;
        }

        .plan-empty-state p {
          font-size: 14px;
          color: #64748B;
          max-width: 400px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .plan-empty-state details {
          text-align: left;
          max-width: 500px;
          margin: 12px auto 0;
          font-size: 12px;
          color: #94A3B8;
        }

        .plan-empty-state details pre {
          white-space: pre-wrap;
          word-break: break-all;
          margin-top: 8px;
          background: rgba(255, 255, 255, 0.05);
          padding: 12px;
          border-radius: 8px;
          font-size: 11px;
          max-height: 200px;
          overflow-y: auto;
        }

        @media (max-width: 768px) {
          .plan-section-card {
            padding: 18px 20px;
          }

          .plan-section-header {
            flex-wrap: wrap;
          }

          .plan-section-title {
            font-size: 14px;
          }

          .plan-section-content {
            font-size: 13px;
          }

          .plan-section-content table {
            font-size: 12px;
          }

          .plan-section-content table th,
          .plan-section-content table td {
            padding: 6px 10px;
          }
        }

        @media (max-width: 480px) {
          .plan-section-card {
            padding: 14px 16px;
          }

          .plan-section-icon {
            width: 30px;
            height: 30px;
          }

          .plan-section-title {
            font-size: 13px;
          }

          .plan-section-badge {
            font-size: 9px;
            padding: 2px 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default MarketingPlanDisplay;
