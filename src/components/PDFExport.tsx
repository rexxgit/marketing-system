{/* ===== RESULT DISPLAY - PROFESSIONAL CARDS ===== */}
{showResult && resultContent && (
  <div className="result-wrapper">
    <MarketingPlanDisplay 
      plan={resultContent}
      onSectionVisible={(sectionId) => {
        console.log(`Section ${sectionId} is now visible`);
      }}
    />
    
    {/* ===== PDF EXPORT BUTTON ===== */}
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
