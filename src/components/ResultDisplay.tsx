// ============================================
// RESULT DISPLAY COMPONENT
// Professional Conscientiousness Formatting
// For Strategic Marketing Results
// ============================================

import React, { useState, useRef } from 'react';
import { Copy, Check, FileDown, FileText } from 'lucide-react';

interface ResultDisplayProps {
  content: string;
  title?: string;
  onCopy?: () => void;
  onPDFExport?: () => void;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ 
  content, 
  title = 'Strategic Marketing Plan',
  onCopy,
  onPDFExport
}) => {
  const [copied, setCopied] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Format the content with proper structure
  const formatContent = (text: string): string => {
    if (!text) return '';

    let formatted = text;

    // Convert markdown-style headings
    formatted = formatted.replace(/^# (.*$)/gm, '<h1 class="result-h1">$1</h1>');
    formatted = formatted.replace(/^## (.*$)/gm, '<h2 class="result-h2">$2</h2>');
    formatted = formatted.replace(/^### (.*$)/gm, '<h3 class="result-h3">$3</h3>');
    formatted = formatted.replace(/^#### (.*$)/gm, '<h4 class="result-h4">$4</h4>');
    
    // Convert bold and italic
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Convert bullet points
    formatted = formatted.replace(/^[-•*]\s+(.*)$/gm, '<li class="result-li">$1</li>');
    
    // Convert numbered lists
    formatted = formatted.replace(/^\d+\.\s+(.*)$/gm, '<li class="result-li result-li-numbered">$1</li>');
    
    // Wrap consecutive list items
    formatted = formatted.replace(/(<li class="result-li".*?>.*?<\/li>\s*)+/g, (match) => {
      return `<ul class="result-ul">${match}</ul>`;
    });
    
    // Convert paragraphs (lines with text)
    formatted = formatted.replace(/^(?!<[hH]|<[uU]l|<l[iI]|<sTr|<em|<st|<div)(.*$)/gm, (match) => {
      if (match.trim() === '') return '';
      return `<p class="result-p">${match}</p>`;
    });

    // Convert markdown tables (basic)
    const tableRegex = /\|(.+)\|\n\|[-:| ]+\|\n((?:\|.+\|\n?)+)/g;
    formatted = formatted.replace(tableRegex, (match, header, rows) => {
      const headerCells = header.split('|').map(c => c.trim()).filter(c => c);
      const rowCells = rows.split('\n').filter(r => r.trim()).map(r => 
        r.split('|').map(c => c.trim()).filter(c => c)
      );
      
      let tableHtml = '<table class="result-table">';
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
      tableHtml += '</tbody></table>';
      return tableHtml;
    });

    // Convert section separators
    formatted = formatted.replace(/---+/g, '<hr class="result-hr" />');
    
    // Clean up extra line breaks
    formatted = formatted.replace(/\n{3,}/g, '\n\n');
    formatted = formatted.replace(/<br\s*\/?>\s*<br\s*\/?>/g, '</p><p class="result-p">');

    return formatted;
  };

  const handleCopy = async () => {
    try {
      // Get plain text for copying
      const plainText = content;
      await navigator.clipboard.writeText(plainText);
      setCopied(true);
      if (onCopy) onCopy();
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handlePDFExport = () => {
    if (onPDFExport) onPDFExport();
  };

  // Check if content exists
  if (!content) {
    return (
      <div className="result-empty-state">
        <div className="result-empty-icon">📋</div>
        <h3 className="result-empty-title">No Results Yet</h3>
        <p className="result-empty-text">
          Fill in the customer data and product description, then click "Generate Strategic Plan" to see your formatted results.
        </p>
      </div>
    );
  }

  return (
    <div className="result-container">
      {/* ===== HEADER ===== */}
      <div className="result-header">
        <div className="result-header-left">
          <span className="result-header-icon">📊</span>
          <div>
            <h2 className="result-header-title">{title}</h2>
            <p className="result-header-subtitle">
              Generated with AI • {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
        <div className="result-actions">
          <button 
            onClick={handleCopy}
            className="result-btn result-btn-copy"
            title="Copy to clipboard"
          >
            {copied ? (
              <>
                <Check size={18} />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy size={18} />
                <span>Copy</span>
              </>
            )}
          </button>
          <button 
            onClick={handlePDFExport}
            className="result-btn result-btn-pdf"
            title="Export as PDF"
          >
            <FileDown size={18} />
            <span>PDF</span>
          </button>
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      <div 
        ref={contentRef}
        className="result-content"
        dangerouslySetInnerHTML={{ __html: formatContent(content) }}
      />

      {/* ===== FOOTER ===== */}
      <div className="result-footer">
        <div className="result-footer-left">
          <span className="result-footer-dot"></span>
          <span className="result-footer-text">
            Generated by StrategicMarketing AI • {new Date().toLocaleTimeString()}
          </span>
        </div>
        <div className="result-footer-right">
          <button 
            onClick={handleCopy}
            className="result-footer-btn"
          >
            {copied ? '✓ Copied' : '📋 Copy All'}
          </button>
          <button 
            onClick={handlePDFExport}
            className="result-footer-btn result-footer-btn-primary"
          >
            <FileText size={14} />
            Save as PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultDisplay;
