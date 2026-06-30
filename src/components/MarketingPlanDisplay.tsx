// ============================================
// MARKETING PLAN DISPLAY - WITH COPY & IMPROVED FORMATTING
// ============================================

import React, { useState, useEffect } from 'react';
import { Copy, Check, FileText } from 'lucide-react';

interface SectionData {
  id: string;
  title: string;
  color: string;
  content: string;
  rawContent: string;
}

// ============================================
// PARSE SECTIONS FROM PLAN
// ============================================

const parseSections = (plan: string): SectionData[] => {
  if (!plan) return [];

  // DESIGN section removed
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
    { id: 'roadmap', title: '30-Day Roadmap', tag: 'ROADMAP OUTPUT', color: '#f472b6' }
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
        content: formatContent(match[1].trim(), config.id),
        rawContent: match[1].trim()
      });
    }
  }

  return results;
};

const formatContent = (content: string, sectionId: string): string => {
  let formatted = content;

  // Bold
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Bullet points
  formatted = formatted.replace(/^[-•*]\s+(.*)$/gm, '<li>$1</li>');
  
  // Numbered lists
  formatted = formatted.replace(/^\d+\.\s+(.*)$/gm, '<li class="numbered">$1</li>');
  
  // Wrap list items in ul
  formatted = formatted.replace(/(<li.*?>.*?<\/li>\s*)+/g, (match) => {
    return `<ul>${match}</ul>`;
  });
  
  // ===== IMPROVED TABLE FORMATTING =====
  formatted = formatted.replace(/\|(.+)\|\n\|[-:| ]+\|\n((?:\|.+\|\n?)+)/g, (match, header, rows) => {
    const headerCells = header.split('|').map(c => c.trim()).filter(c => c);
    const rowCells = rows.split('\n').filter(r => r.trim()).map(r => 
      r.split('|').map(c => c.trim()).filter(c => c)
    );
    
    let tableHtml = '<div class="table-wrapper"><table>';
    tableHtml += '<thead><tr>';
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
    tableHtml += '</tbody></table></div>';
    return tableHtml;
  });

  // ===== IMPROVED PESTLE FORMATTING =====
  if (sectionId === 'pestle') {
    formatted = formatted.replace(/\*\*(.*?)Drivers:\*\*/g, '<h4>$1 Drivers</h4>');
    formatted = formatted.replace(/^([A-Z][a-z]+) Drivers:/gm, '<h4>$1 Drivers</h4>');
  }

  // ===== IMPROVED TAM/SAM/SOM FORMATTING =====
  if (sectionId === 'tamsamsom') {
    formatted = formatted.replace(/\|\s*(TAM|SAM|SOM)\s*\|/g, '|<strong>$1</strong>|');
    formatted = formatted.replace(/\*\*Growth Targets:\*\*/g, '<h4>📈 Growth Targets</h4>');
    formatted = formatted.replace(/\*Validation:\*/g, '<span class="validation-badge">✅ Validation</span>');
  }

  // ===== IMPROVED KPI FORMATTING =====
  if (sectionId === 'kpi') {
    formatted = formatted.replace(/\|\s*Objective\s*\|/g, '|<strong>Objective</strong>|');
    formatted = formatted.replace(/\|\s*Target\s*\|/g, '|<strong>Target</strong>|');
  }

  // ===== IMPROVED COMPETITOR FORMATTING =====
  if (sectionId === 'competitor') {
    formatted = formatted.replace(/\|\s*(High|Medium|Low)\s*\|/g, (match, level) => {
      const colors: Record<string, string> = {
        'High': '#ef4444',
        'Medium': '#f59e0b',
        'Low': '#10b981'
      };
      return `|<span class="threat-badge" style="background:${colors[level]}20;color:${colors[level]};padding:2px 10px;border-radius:12px;font-size:12px;font-weight:600;">${level}</span>|`;
    });
  }

  // Line breaks
  formatted = formatted.replace(/\n/g, '<br>');
  
  return formatted;
};

// ============================================
// COPY TO CLIPBOARD FUNCTION
// ============================================

const copyToClipboard = async (text: string, setCopied: (state: boolean) => void) => {
  try {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
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
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  useEffect(() => {
    if (plan) {
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
    }
  }, [plan, onSectionVisible]);

  const handleCopySection = async (section: SectionData) => {
    await copyToClipboard(section.rawContent, (state) => {
      setCopiedSection(state ? section.id : null);
    });
  };

  const handleCopyAll = async () => {
    const allContent = sections.map(s => 
      `=== ${s.title.toUpperCase()} ===\n${s.rawContent}\n`
    ).join('\n---\n\n');
    await copyToClipboard(allContent, setCopiedAll);
  };

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
      {/* Copy All Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <button
          onClick={handleCopyAll}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 20px',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.05)',
            color: '#CBD5E1',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
            e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
          }}
        >
          {copiedAll ? <Check size={18} color="#10b981" /> : <FileText size={18} />}
          {copiedAll ? 'Copied All!' : 'Copy All Sections'}
        </button>
      </div>

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
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '14px', 
              marginBottom: '16px', 
              paddingBottom: '14px', 
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)' 
            }}>
              <div style={{ 
                width: '36px', 
                height: '36px', 
                borderRadius: '10px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                background: `${section.color}20`,
                color: section.color,
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                {index + 1}
              </div>
              <h3 style={{ flex: 1, fontSize: '16px', fontWeight: 600, color: '#F1F5F9', margin: 0 }}>{section.title}</h3>
              
              {/* Copy Section Button */}
              <button
                onClick={() => handleCopySection(section)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.03)',
                  color: '#94A3B8',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.color = '#CBD5E1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  e.currentTarget.style.color = '#94A3B8';
                }}
              >
                {copiedSection === section.id ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                {copiedSection === section.id ? 'Copied!' : 'Copy'}
              </button>
              
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

      <style>{`
        .table-wrapper {
          overflow-x: auto;
          margin: 12px 0;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.06);
        }
        .table-wrapper table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }
        .table-wrapper table thead {
          background: rgba(99, 102, 241, 0.12);
        }
        .table-wrapper table th {
          padding: 10px 14px;
          text-align: left;
          font-weight: 600;
          color: #818cf8;
          border-bottom: 2px solid rgba(99, 102, 241, 0.2);
        }
        .table-wrapper table td {
          padding: 8px 14px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          color: #CBD5E1;
        }
        .table-wrapper table tr:hover td {
          background: rgba(255, 255, 255, 0.02);
        }
        .validation-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
          font-size: 12px;
          font-weight: 600;
          margin: 8px 0;
        }
        h4 {
          font-size: 15px;
          font-weight: 600;
          color: #818cf8;
          margin: 16px 0 8px;
        }
        strong {
          color: #818cf8;
        }
        ul {
          margin: 8px 0;
          padding-left: 24px;
          list-style: none;
        }
        li {
          position: relative;
          padding: 4px 0 4px 20px;
          color: #CBD5E1;
          line-height: 1.6;
        }
        li::before {
          content: '▸';
          position: absolute;
          left: 0;
          color: #6366f1;
          font-weight: bold;
        }
        li.numbered::before {
          content: '•';
          color: #818cf8;
        }
        .threat-badge {
          display: inline-block;
          padding: 2px 10px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default MarketingPlanDisplay;
