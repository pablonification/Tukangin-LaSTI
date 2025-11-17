import React, { useState } from 'react';
import Modal from '../Modal';
import Button from '../Button';

interface ExportUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (format: string, filters: string[]) => void;
}

const ExportUsersModal = ({
  isOpen,
  onClose,
  onConfirm
}: ExportUsersModalProps) => {
  const [format, setFormat] = useState('csv');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm(format, selectedFilters);
      onClose();
      setSelectedFilters([]);
    } catch (error) {
      console.error('Error exporting users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedFilters([]);
    onClose();
  };

  const exportFormats = [
    { value: 'csv', label: 'CSV', description: 'Comma-separated values for Excel' },
    { value: 'xlsx', label: 'Excel', description: 'Microsoft Excel format with formatting' },
    { value: 'pdf', label: 'PDF', description: 'Portable document format for reports' },
    { value: 'json', label: 'JSON', description: 'JavaScript Object Notation for APIs' },
  ];

  const filterOptions = [
    { value: 'basic', label: 'Basic Info', description: 'Name, email, phone, location' },
    { value: 'activity', label: 'Activity Data', description: 'Join date, last order, total orders' },
    { value: 'financial', label: 'Financial Data', description: 'Total spent, payment history' },
    { value: 'status', label: 'Status Info', description: 'Account status, rating, verification' },
  ];

  const handleFilterToggle = (filterValue: string) => {
    setSelectedFilters(prev =>
      prev.includes(filterValue)
        ? prev.filter(f => f !== filterValue)
        : [...prev, filterValue]
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Export Users Data" size="md">
      <div className="space-y-6">
        {/* Export Format Selection */}
        <div>
          <h3 className="text-sh2b text-[#141414] mb-4">Choose Export Format</h3>
          <div className="space-y-3">
            {exportFormats.map((fmt) => (
              <label key={fmt.value} className="flex items-start gap-3 p-3 border border-[#D4D4D4] rounded-xl cursor-pointer hover:bg-[#F5F9FC]">
                <input
                  type="radio"
                  name="format"
                  value={fmt.value}
                  checked={format === fmt.value}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-4 h-4 text-[#0082C9] border-[#D4D4D4] rounded focus:ring-[#0082C9] mt-1"
                />
                <div className="flex-1">
                  <div className="text-b2m text-[#141414]">{fmt.label}</div>
                  <div className="text-b3 text-[#9E9E9E]">{fmt.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Data Fields Selection */}
        <div>
          <h3 className="text-sh2b text-[#141414] mb-4">Select Data Fields</h3>
          <p className="text-b3 text-[#9E9E9E] mb-4">
            Choose which user information to include in the export
          </p>
          <div className="space-y-3">
            {filterOptions.map((filter) => (
              <label key={filter.value} className="flex items-start gap-3 p-3 border border-[#D4D4D4] rounded-xl cursor-pointer hover:bg-[#F5F9FC]">
                <input
                  type="checkbox"
                  checked={selectedFilters.includes(filter.value)}
                  onChange={() => handleFilterToggle(filter.value)}
                  className="w-4 h-4 text-[#0082C9] border-[#D4D4D4] rounded focus:ring-[#0082C9] mt-1"
                />
                <div className="flex-1">
                  <div className="text-b2m text-[#141414]">{filter.label}</div>
                  <div className="text-b3 text-[#9E9E9E]">{filter.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Export Summary */}
        <div className="bg-[#F5F9FC] rounded-xl p-4">
          <h4 className="text-b2b text-[#141414] mb-2">Export Summary</h4>
          <div className="space-y-1 text-b3 text-[#9E9E9E]">
            <div>Format: <span className="text-[#141414] font-medium">{exportFormats.find(f => f.value === format)?.label}</span></div>
            <div>Fields: <span className="text-[#141414] font-medium">{selectedFilters.length > 0 ? selectedFilters.join(', ') : 'None selected'}</span></div>
            <div>Estimated Records: <span className="text-[#141414] font-medium">6 users</span></div>
          </div>
        </div>

        {/* Warning Message */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 text-blue-600 mt-0.5">
              <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="text-b2b text-blue-800 mb-1">Export Information</h4>
              <p className="text-b3 text-blue-700">
                The exported file will contain sensitive user information. Ensure you store it securely and only share with authorized personnel.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            onClick={handleConfirm}
            disabled={selectedFilters.length === 0 || isLoading}
            className="bg-[#0082C9] text-white hover:bg-[#0066A3] disabled:opacity-50"
          >
            {isLoading ? 'Exporting...' : `Export as ${exportFormats.find(f => f.value === format)?.label}`}
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

export default ExportUsersModal;
