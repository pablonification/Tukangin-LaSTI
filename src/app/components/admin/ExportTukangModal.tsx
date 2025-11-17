import React, { useState } from 'react';
import Modal from '../Modal';
import Button from '../Button';

interface ExportTukangModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (format: string, filters: string[]) => void;
}

const ExportTukangModal = ({
  isOpen,
  onClose,
  onConfirm
}: ExportTukangModalProps) => {
  const [format, setFormat] = useState('csv');
  const [includeFilters, setIncludeFilters] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm(format, includeFilters);
      onClose();
      setFormat('csv');
      setIncludeFilters([]);
    } catch (error) {
      console.error('Error exporting tukang data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormat('csv');
    setIncludeFilters([]);
    onClose();
  };

  const handleFilterChange = (filter: string, checked: boolean) => {
    if (checked) {
      setIncludeFilters(prev => [...prev, filter]);
    } else {
      setIncludeFilters(prev => prev.filter(f => f !== filter));
    }
  };

  const formatOptions = [
    { value: 'csv', label: 'CSV (Comma Separated Values)', description: 'Compatible with Excel and most spreadsheet applications' },
    { value: 'xlsx', label: 'Excel (XLSX)', description: 'Native Excel format with formatting and multiple sheets' },
    { value: 'pdf', label: 'PDF Report', description: 'Formatted report suitable for printing and sharing' },
    { value: 'json', label: 'JSON', description: 'Structured data format for developers' }
  ];

  const filterOptions = [
    { value: 'basic_info', label: 'Basic Information', description: 'Name, email, phone, location' },
    { value: 'performance', label: 'Performance Data', description: 'Rating, jobs completed, earnings, response time' },
    { value: 'specialization', label: 'Specialization', description: 'Skills and expertise areas' },
    { value: 'verification', label: 'Verification Status', description: 'Verified/unverified status' },
    { value: 'activity', label: 'Activity History', description: 'Last active, join date, status history' }
  ];

  const getEstimatedRecords = () => {
    // This would normally come from API based on current filters
    return 'All tukang records';
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Export Tukang Data" size="lg">
      <div className="space-y-6">
        {/* Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div>
              <h4 className="text-b2b text-blue-800 mb-1">Export Tukang Data</h4>
              <p className="text-b3 text-blue-700">
                Export tukang information for analysis, reporting, or backup purposes.
                Choose your preferred format and select which data to include.
              </p>
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
                  <div className="text-b2b text-[#141414]">{option.label}</div>
                  <div className="text-b3 text-[#9E9E9E]">{option.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Data to Include */}
        <div>
          <label className="block text-b3 text-[#9E9E9E] mb-3">
            Data to Include <span className="text-red-500">*</span>
          </label>
          <div className="space-y-3">
            {filterOptions.map((option) => (
              <label key={option.value} className="flex items-start gap-3 p-3 border border-[#D4D4D4] rounded-xl cursor-pointer hover:bg-[#F5F9FC]">
                <input
                  type="checkbox"
                  checked={includeFilters.includes(option.value)}
                  onChange={(e) => handleFilterChange(option.value, e.target.checked)}
                  className="mt-1 text-[#0082C9] border-[#D4D4D4] rounded focus:ring-[#0082C9]"
                />
                <div className="flex-1">
                  <div className="text-b2b text-[#141414]">{option.label}</div>
                  <div className="text-b3 text-[#9E9E9E]">{option.description}</div>
                </div>
              </label>
            ))}
          </div>
          {includeFilters.length === 0 && (
            <div className="text-b3 text-red-600 mt-2">
              Please select at least one data category to export.
            </div>
          )}
        </div>

        {/* Export Summary */}
        <div className="bg-[#F5F9FC] rounded-xl p-4">
          <h4 className="text-b2b text-[#141414] mb-3">Export Summary</h4>
          <div className="space-y-2 text-b3">
            <div className="flex justify-between">
              <span className="text-[#9E9E9E]">Records to export:</span>
              <span className="text-[#141414] font-medium">{getEstimatedRecords()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#9E9E9E]">Export format:</span>
              <span className="text-[#141414] font-medium">
                {formatOptions.find(f => f.value === format)?.label}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#9E9E9E]">Data categories:</span>
              <span className="text-[#141414] font-medium">
                {includeFilters.length === 0 ? 'None selected' : `${includeFilters.length} selected`}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            onClick={handleConfirm}
            disabled={isLoading || includeFilters.length === 0}
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

export default ExportTukangModal;
