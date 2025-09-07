import { useState } from 'react';
import { exportSalesReport } from '../services/reportService';

const ExportButton = ({ period, className = '' }) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format) => {
    try {
      setIsExporting(true);
      const data = await exportSalesReport(format, period);
      
      if (format === 'json') {
        // Download as JSON file
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `sales-report-${period}days-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => handleExport('json')}
        disabled={isExporting}
        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
      >
        {isExporting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Exporting...</span>
          </>
        ) : (
          <>
            <span>📊</span>
            <span>Export Report</span>
          </>
        )}
      </button>
    </div>
  );
};

export default ExportButton;
