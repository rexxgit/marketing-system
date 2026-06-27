// ============================================
// PDF EXPORT COMPONENT
// Professional PDF Generation with html2pdf.js
// Conscientiousness Style Formatting
// ============================================

import React, { useRef, useState } from 'react';
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
  const contentRef = useRef<HTMLDivElement>(null);

  // Format content for PDF
  const formatContentForPDF = (text: string): string => {
    if (!text) return '';

    let formatted = text;

    // Convert markdown-style headings
    formatted = formatted.replace(/^# (.*$)/gm, '<h1 style="font-size:24px;font-weight:700;color:#1a1a2e;margin:20px 0 12px;padding-bottom:10px;border-bottom:2px solid #6366f1;">$1</h1>');
    formatted = formatted.replace(/^## (.*$)/gm, '<h2 style="font-size:20px;font-weight:600;color:#1a1a2e;margin:16px 0 10px;padding-left:12px;border-left:3px solid #6366f1;">$2</h2>');
    formatted = formatted.replace(/^### (.*$)/gm, '<h3 style="font-size:17px;font-weight:600;color:#2d2d44;margin:14px 0 8px;">$3</h3>');
    formatted = formatted.replace(/^#### (.*$)/gm, '<h4 style="font-size:14px;font-weight:600;color:#4a4a6a;margin:12px 0 6px;text-transform:uppercase;letter-spacing:0.5px;">$4</h4>');
    
    // Convert bold and italic
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#6366f1;">$1</strong>');
    formatted = formatted.replace(/\*(.*?)\*/g, '<em style="font-style:italic;">$1</em>');
    
    // Convert bullet points
    formatted = formatted.replace(/^[-•*]\s+(.*)$/gm, '<li style="padding:4px 0 4px 20px;color:#2d2d44;line-height:1.6;position:relative;list-style:none;">$1</li>');
    
    // Convert numbered lists
    formatted = formatted.replace(/^\d+\.\s+(.*)$/gm, '<li style="padding:4px 0 4px 28px;color:#2d2d44;line-height:1.6;position:relative;list-style:none;">$1</li>');
    
    // Wrap consecutive list items
    formatted = formatted.replace(/(<li.*?>.*?<\/li>\s*)+/g, (match) => {
      return `<ul style="margin:8px 0;padding-left:16px;">${match}</ul>`;
    });
    
    // Convert paragraphs
    formatted = formatted.replace(/^(?!<[hH]|<[uU]l|<l[iI]|<sTr|<em|<st|<div)(.*$)/gm, (match) => {
      if (match.trim() === '') return '';
      return `<p style="margin:6px 0;color:#2d2d44;line-height:1.8;">${match}</p>`;
    });

    // Convert markdown tables
    const tableRegex = /\|(.+)\|\n\|[-:| ]+\|\n((?:\|.+\|\n?)+)/g;
    formatted = formatted.replace(tableRegex, (match, header, rows) => {
      const headerCells = header.split('|').map(c => c.trim()).filter(c => c);
      const rowCells = rows.split('\n').filter(r => r.trim()).map(r => 
        r.split('|').map(c => c.trim()).filter(c => c)
      );
      
      let tableHtml = '<table style="width:100%;border-collapse:collapse;margin:12px 0;font-size:13px;border-radius:6px;overflow:hidden;">';
      tableHtml += '<thead style="background:#6366f1;">';
      tableHtml += '<tr>';
      headerCells.forEach(cell => {
        tableHtml += `<th style="padding:10px 14px;text-align:left;font-weight:600;color:#ffffff;border-bottom:2px solid #4f46e5;">${cell}</th>`;
      });
      tableHtml += '</tr></thead><tbody>';
      rowCells.forEach(row => {
        tableHtml += '<tr style="border-bottom:1px solid #e5e7eb;">';
        row.forEach(cell => {
          tableHtml += `<td style="padding:8px 14px;color:#2d2d44;">${cell}</td>`;
        });
        tableHtml += '</tr>';
      });
      tableHtml += '</tbody></table>';
      return tableHtml;
    });

    // Convert section separators
    formatted = formatted.replace(/---+/g, '<hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />');
    
    // Clean up extra line breaks
    formatted = formatted.replace(/\n{3,}/g, '\n\n');
    formatted = formatted.replace(/<br\s*\/?>\s*<br\s*\/?>/g, '</p><p style="margin:6px 0;color:#2d2d44;line-height:1.8;">');

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
      // Dynamically import html2pdf.js
      const html2pdf = (await import('html2pdf.js')).default;

      // Create a temporary container for PDF content
      const tempDiv = document.createElement('div');
      tempDiv.style.cssText = `
        padding: 40px 48px;
        background: #ffffff;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        max-width: 900px;
        margin: 0 auto;
        color: #1a1a2e;
      `;

      // Build the PDF HTML
      tempDiv.innerHTML = `
        <div style="text-align:center;padding-bottom:24px;border-bottom:3px solid #6366f1;margin-bottom:24px;">
          <h1 style="font-size:28px;font-weight:700;color:#1a1a2e;margin:0;">
            📊 ${title}
          </h1>
          <p style="font-size:13px;color:#6b7280;margin:8px 0 0;">
            Generated on ${new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })} at ${new Date().toLocaleTimeString()}
          </p>
          <p style="font-size:12px;color:#9ca3af;margin:4px 0 0;">
            StrategicMarketing AI • Professional Marketing Analysis
          </p>
        </div>
        <div style="padding:0 4px;">
          ${formatContentForPDF(content)}
        </div>
        <div style="text-align:center;padding-top:24px;border-top:2px solid #e5e7eb;margin-top:24px;font-size:11px;color:#9ca3af;">
          © ${new Date().getFullYear()} StrategicMarketing System · Confidential · AI-Powered Strategy
        </div>
      `;

      // Append temp div to body (hidden)
      tempDiv.style.position = 'fixed';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      tempDiv.style.width = '900px';
      tempDiv.style.background = '#ffffff';
      document.body.appendChild(tempDiv);

      // Generate PDF with html2pdf
      const opt = {
        margin: [0.5, 0.5, 0.5, 0.5],
        filename: `${title.toLowerCase().replace(/\s+/g, '-')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          logging: false,
          letterRendering: true,
          backgroundColor: '#ffffff'
        },
        jsPDF: { 
          unit: 'in', 
          format: 'a4', 
          orientation: 'portrait' 
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      await html2pdf().set(opt).from(tempDiv).save();

      // Clean up
      document.body.removeChild(tempDiv);

      setIsSuccess(true);
      if (onSuccess) onSuccess();

      // Reset success state after 3 seconds
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
