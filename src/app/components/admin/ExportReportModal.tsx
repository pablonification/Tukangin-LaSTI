import React, { useState } from 'react';
import Modal from '../Modal';
import Button from '../Button';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedReport: string;
  selectedPeriod: string;
  onConfirm: (format: string, reportType: string, period: string, includeCharts: boolean) => void;
}

const ExportReportModal = ({
  isOpen,
  onClose,
  selectedReport,
  selectedPeriod,
  onConfirm
}: ExportReportModalProps) => {
  const [format, setFormat] = useState('pdf');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm(format, selectedReport, selectedPeriod, includeCharts);
      onClose();
      setFormat('pdf');
      setIncludeCharts(true);
    } catch (error) {
      console.error('Error exporting report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormat('pdf');
    setIncludeCharts(true);
    onClose();
  };

  const getReportTypeLabel = (type: string) => {
    switch (type) {
      case 'orders':
        return 'Order Analytics';
      case 'tukang':
        return 'Tukang Performance';
      case 'complaints':
        return 'Complaint Analysis';
      default:
        return 'Report';
    }
  };

  const formatOptions = [
    {
      value: 'pdf',
      label: 'PDF Report',
      description: 'Formatted report with charts and tables, perfect for presentations',
    },
    {
      value: 'xlsx',
      label: 'Excel Workbook',
      description: 'Raw data with multiple sheets for detailed analysis',
    },
    {
      value: 'csv',
      label: 'CSV Data',
      description: 'Simple data format compatible with most applications',
    },
    {
      value: 'json',
      label: 'JSON Data',
      description: 'Structured data format for developers',
    }
  ];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Export Report" size="lg">
      <div className="space-y-6">
        {/* Report Information */}
        <div className="bg-[#F5F9FC] rounded-xl p-4">
          <h3 className="text-sh2b text-[#141414] mb-3">Report Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-[#9E9E9E]">Report Type:</span>
              <span className="ml-2 text-[#141414] font-medium">{getReportTypeLabel(selectedReport)}</span>
            </div>
            <div>
              <span className="text-[#9E9E9E]">Time Period:</span>
              <span className="ml-2 text-[#141414] font-medium capitalize">{selectedPeriod}</span>
            </div>
          </div>
        </div>

        {/* Export Format */}
        <div>
          <label className="block text-b3 text-[#9E9E9E] mb-3">
            Export Format <span className="text-red-500">*</span>
          </label>
          <div className="space-y-3">
            {formatOptions.map((option) => (
              <label key={option.value} className="flex items-start gap-3 p-3 border border-[#D4D4D4] rounded-xl cursor-pointer hover:bg-[#F5F9FC]">
                <input
                  type="radio"
                  name="format"
                  value={option.value}
                  checked={format === option.value}
                  onChange={(e) => setFormat(e.target.value)}
                  className="mt-1 text-[#0082C9] border-[#D4D4D4] focus:ring-[#0082C9]"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-b2b text-[#141414]">{option.label}</span>
                  </div>
                  <div className="text-b3 text-[#9E9E9E]">{option.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Additional Options */}
        <div>
          <label className="block text-b3 text-[#9E9E9E] mb-3">
            Additional Options
          </label>
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 border border-[#D4D4D4] rounded-xl cursor-pointer hover:bg-[#F5F9FC]">
              <input
                type="checkbox"
                checked={includeCharts}
                onChange={(e) => setIncludeCharts(e.target.checked)}
                className="text-[#0082C9] border-[#D4D4D4] rounded focus:ring-[#0082C9]"
              />
              <div className="flex-1">
                <div className="text-b2b text-[#141414]">Include Charts and Visualizations</div>
                <div className="text-b3 text-[#9E9E9E]">Add charts and graphs to the exported report</div>
              </div>
            </label>
          </div>
        </div>

        {/* Export Preview */}
        <div className="bg-[#F5F9FC] rounded-xl p-4">
          <h4 className="text-b2b text-[#141414] mb-3">Export Preview</h4>
          <div className="space-y-2 text-b3">
            <div className="flex justify-between">
              <span className="text-[#9E9E9E]">Report Type:</span>
              <span className="text-[#141414] font-medium">{getReportTypeLabel(selectedReport)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#9E9E9E]">Time Period:</span>
              <span className="text-[#141414] font-medium capitalize">{selectedPeriod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#9E9E9E]">Format:</span>
              <span className="text-[#141414] font-medium">
                {formatOptions.find(f => f.value === format)?.label}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#9E9E9E]">Includes Charts:</span>
              <span className="text-[#141414] font-medium">{includeCharts ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-[#0082C9] text-white hover:bg-[#0066A3] disabled:opacity-50"
          >
            {isLoading ? 'Exporting...' : `Export as ${format.toUpperCase()}`}
          </Button>
          <Button
            onClick={handleClose}
            variant="secondary"
            className="sm:ml-auto"
          >
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ExportReportModal;
