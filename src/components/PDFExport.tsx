// ============================================
// PDF EXPORT - PROFESSIONAL CONSISTENT FORMATTING
// Dynamic Adaptation with html2pdf.js
// ============================================

import React, { useState } from 'react';
import { FileDown, Loader, Check, X } from 'lucide-react';

interface PDFExportProps {
  content: string;
  title?: string;
  buttonText?: string;
  className?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

const PDFExport: React.FC<PDFExportProps> = ({
  content,
  title = 'Strategic Marketing Plan',
  buttonText = 'Export as PDF',
  className = '',
  onSuccess,
  onError
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatContentForPDF = (text: string): string => {
    if (!text) return '';

    let formatted = text;

    // Headings
    formatted = formatted.replace(/^# (.*$)/gm, '<h1>$1</h1>');
    formatted = formatted.replace(/^## (.*$)/gm, '<h2>$2</h2>');
    formatted = formatted.replace(/^### (.*$)/gm, '<h3>$3</h3>');
    formatted = formatted.replace(/^#### (.*$)/gm, '<h4>$4</h4>');
    
    // Bold
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Italic
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Bullet points
    formatted = formatted.replace(/^[-•*]\s+(.*)$/gm, '<li>$1</li>');
    
    // Numbered lists
    formatted = formatted.replace(/^\d+\.\s+(.*)$/gm, '<li class="numbered">$1</li>');
    
    // Wrap lists
    formatted = formatted.replace(/(<li.*?>.*?<\/li>\s*)+/g, (match) => {
      return `<ul>${match}</ul>`;
    });
    
    // Tables
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

    // Line breaks
    formatted = formatted.replace(/\n/g, '<br>');
    
    return formatted;
  };

  const generatePDF = async () => {
    if (!content) {
      setError('No content to export. Generate a plan first.');
      return;
    }

    setIsExporting(true);
    setError(null);
    setIsSuccess(false);

    try {
      const html2pdf = (await import('html2pdf.js')).default;

      const tempDiv = document.createElement('div');
      tempDiv.style.cssText = `
        padding: 48px 56px;
        background: #ffffff;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        max-width: 1000px;
        margin: 0 auto;
        color: #1a1a2e;
        line-height: 1.6;
      `;

      tempDiv.innerHTML = `
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Inter', sans-serif; color: #1a1a2e; }
          
          h1 { font-size: 28px; font-weight: 700; color: #1a1a2e; margin: 24px 0 16px; padding-bottom: 12px; border-bottom: 3px solid #6366f1; }
          h2 { font-size: 22px; font-weight: 600; color: #1a1a2e; margin: 20px 0 12px; padding-left: 12px; border-left: 4px solid #6366f1; }
          h3 { font-size: 18px; font-weight: 600; color: #2d2d44; margin: 16px 0 10px; }
          h4 { font-size: 15px; font-weight: 600; color: #4a4a6a; margin: 12px 0 8px; text-transform: uppercase; letter-spacing: 0.5px; }
          
          strong { color: #4f46e5; font-weight: 600; }
          em { font-style: italic; }
          
          p { margin: 6px 0; color: #2d2d44; line-height: 1.8; }
          
          ul { margin: 8px 0; padding-left: 24px; list-style: none; }
          li { position: relative; padding: 4px 0 4px 24px; color: #2d2d44; line-height: 1.6; }
          li::before { content: '▸'; position: absolute; left: 0; color: #6366f1; font-weight: bold; }
          li.numbered::before { content: '•'; color: #818cf8; }
          
          table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; border-radius: 8px; overflow: hidden; }
          table thead { background: #eef2ff; }
          table th { padding: 10px 14px; text-align: left; font-weight: 600; color: #4f46e5; border-bottom: 2px solid #c7d2fe; }
          table td { padding: 8px 14px; border-bottom: 1px solid #e5e7eb; color: #2d2d44; }
          table tr:hover td { background: #f8fafc; }
          
          hr { border: none; border-top: 1px solid #e5e7eb; margin: 20px 0; }
          
          .pdf-header { text-align: center; padding-bottom: 24px; border-bottom: 3px solid #6366f1; margin-bottom: 24px; }
          .pdf-header h1 { font-size: 32px; font-weight: 700; color: #1a1a2e; margin: 0; padding: 0; border: none; }
          .pdf-header .subtitle { font-size: 13px; color: #6b7280; margin: 8px 0 0; }
          .pdf-header .meta { font-size: 11px; color: #9ca3af; margin: 4px 0 0; }
          
          .pdf-footer { text-align: center; padding-top: 24px; border-top: 2px solid #e5e7eb; margin-top: 32px; font-size: 11px; color: #9ca3af; }
          
          .pdf-section { margin-bottom: 8px; }
        </style>
        
        <div class="pdf-header">
          <h1>📊 ${title}</h1>
          <p class="subtitle">Strategic Marketing Analysis &amp; Implementation Plan</p>
          <p class="meta">Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} at ${new Date().toLocaleTimeString()}</p>
        </div>
        
        <div class="pdf-section">
          ${formatContentForPDF(content)}
        </div>
        
        <div class="pdf-footer">
          © ${new Date().getFullYear()} StrategicMarketing System · Confidential · AI-Powered Strategy
        </div>
      `;

      tempDiv.style.position = 'fixed';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      tempDiv.style.width = '1000px';
      tempDiv.style.background = '#ffffff';
      document.body.appendChild(tempDiv);

      const opt = {
        margin: [0.5, 0.5, 0.5, 0.5],
        filename: `${title.toLowerCase().replace(/\s+/g, '-')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          logging: false,
          letterRendering: true,
          backgroundColor: '#ffffff',
          width: 1000
        },
        jsPDF: { 
          unit: 'in', 
          format: 'a4', 
          orientation: 'portrait' 
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      await html2pdf().set(opt).from(tempDiv).save();

      document.body.removeChild(tempDiv);

      setIsSuccess(true);
      if (onSuccess) onSuccess();

      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);

    } catch (err: any) {
      console.error('PDF Export Error:', err);
      setError(err.message || 'Failed to generate PDF. Please try again.');
      if (onError) onError(err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={`pdf-export-container ${className}`}>
      <button
        onClick={generatePDF}
        disabled={isExporting || !content}
        className={`pdf-export-btn ${isSuccess ? 'pdf-export-success' : ''}`}
        title={!content ? 'Generate a plan first' : 'Export as PDF'}
      >
        {isExporting ? (
          <>
            <Loader size={18} className="pdf-export-spinner" />
            <span>Generating PDF...</span>
          </>
        ) : isSuccess ? (
          <>
            <Check size={18} />
            <span>PDF Ready!</span>
          </>
        ) : (
          <>
            <FileDown size={18} />
            <span>{buttonText}</span>
          </>
        )}
      </button>

      {error && (
        <div className="pdf-export-error">
          <X size={14} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default PDFExport;
