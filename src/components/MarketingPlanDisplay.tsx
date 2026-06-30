// ============================================
// MARKETING PLAN DISPLAY - SIMPLE VERSION
// ============================================

import React, { useState, useEffect } from 'react';

interface SectionData {
  id: string;
  title: string;
  color: string;
  content: string;
}

// ============================================
// PARSE SECTIONS FROM PLAN
// ============================================

const parseSections = (plan: string): SectionData[] => {
  if (!plan) return [];

  const sectionConfigs = [
    { id: 'segmentation', title: 'Market Segmentation', tag: 'SEGMENTATION OUTPUT', color: '#4ade80' },
    { id: 'tamsamsom', title: 'Market Sizing (TAM/SAM/SOM)', tag: 'TAMSAMSOM OUTPUT', color: '#22d3ee' },
    { id: 'pestle', title: 'PESTLE Analysis', tag: 'PESTLE OUTPUT', color: '#fbbf24' },
    { id: 'porter', title: "Porter's Five Forces", tag: 'PORTER OUTPUT', color: '#f472b6' },
    { id: 'competitor', title: 'Competitor Analysis', tag: 'COMPETITOR OUTPUT', color: '#a78bfa' },
    { id: 'positioning', title: 'Brand Positioning', tag: 'POSITIONING OUTPUT', color: '#f87171' },
    { id: '4ps', title: 'Marketing Mix (4Ps)', tag: '4Ps OUTPUT', color: '#34d399' },
    { id: 'swot', title: 'SWOT Analysis', tag: 'SWOT OUTPUT', color: '#f59e0b' },
    { id: 'journey', title: 'Customer Journey Map', tag: 'CUSTOMER JOURNEY OUTPUT', color: '#818cf8' },
    { id: 'kpi', title: 'Key Performance Indicators', tag: 'KPI OUTPUT', color: '#ec4899' },
    { id: 'okrs', title: 'Objectives & Key Results', tag: 'OKRS OUTPUT', color: '#10b981' },
    { id: 'roadmap', title: '30-Day Roadmap', tag: 'ROADMAP OUTPUT', color: '#f472b6' },
    { id: 'design', title: 'Design Guidelines', tag: 'DESIGN OUTPUT', color: '#8b5cf6' }
  ];

  const results: SectionData[] = [];

  for (const config of sectionConfigs) {
    const regex = new RegExp(`\\[${config.tag}\\]([\\s\\S]*?)(?=\\n\\n---|\\n\\[|$)`, 'i');
    const match = plan.match(regex);
    
    if (match && match[1].trim().length > 10) {
      results.push({
        id: config.id,
        title: config.title,
        color: config.color,
        content: formatContent(match[1].trim())
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

  useEffect(() => {
    if (plan) {
      const parsed = parseSections(plan);
      setSections(parsed);
      
      // Animate sections appearing one by one
      let delay = 0;
      const interval = 300;
      
      for (const section of parsed) {
        setTimeout(() => {
          setVisibleSections(prev => [...prev, section.id]);
          if (onSectionVisible) onSectionVisible(section.id);
        }, delay);
        delay += interval;
      }
    }
  }, [plan, onSectionVisible]);

  // Debug
  console.log('📊 Sections found:', sections.length);

  if (!plan) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
        <h3 style={{ color: '#94A3B8' }}>No Plan Generated Yet</h3>
        <p>Fill in the fields and click "Generate Strategic Plan"</p>
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
        <h3 style={{ color: '#94A3B8' }}>No Sections Found</h3>
        <details style={{ marginTop: 12, textAlign: 'left', maxWidth: 500, margin: '12px auto 0', fontSize: 12 }}>
          <summary>Show plan preview</summary>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', marginTop: 8, background: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 8, maxHeight: 200, overflowY: 'auto' }}>
            {plan.substring(0, 500)}
          </pre>
        </details>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', padding: '8px 0' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {sections.map((section, index) => (
          <div
            key={section.id}
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(16px)',
              border: `1px solid ${section.color}`,
              borderRadius: '16px',
              padding: '24px 28px',
              opacity: visibleSections.includes(section.id) ? 1 : 0,
              transform: visibleSections.includes(section.id) ? 'translateY(0)' : 'translateY(20px)',
              transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px', paddingBottom: '14px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ 
                width: '36px', 
                height: '36px', 
                borderRadius: '10px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                background: `${section.color}20`,
                color: section.color,
                fontSize: '18px',
                fontWeight: 'bold'
              }}>
                {index + 1}
              </div>
              <h3 style={{ flex: 1, fontSize: '16px', fontWeight: 600, color: '#F1F5F9', margin: 0 }}>{section.title}</h3>
              <span style={{ 
                fontSize: '10px', 
                fontWeight: 600, 
                padding: '4px 12px', 
                borderRadius: '20px',
                background: `${section.color}20`,
                color: section.color
              }}>
                {index + 1}/{sections.length}
              </span>
            </div>
            <div 
              style={{ color: '#CBD5E1', fontSize: '14px', lineHeight: '1.8' }}
              dangerouslySetInnerHTML={{ __html: section.content }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketingPlanDisplay;
