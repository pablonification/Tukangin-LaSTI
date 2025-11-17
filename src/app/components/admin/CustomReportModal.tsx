import React, { useState } from 'react';
import Modal from '../Modal';
import Button from '../Button';

interface CustomReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reportConfig: {
    name: string;
    type: string;
    dateRange: { start: string; end: string };
    filters: string[];
    includeCharts: boolean;
    format: string;
  }) => void;
}

const CustomReportModal = ({
  isOpen,
  onClose,
  onConfirm
}: CustomReportModalProps) => {
  const [reportName, setReportName] = useState('');
  const [reportType, setReportType] = useState('orders');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [includeCharts, setIncludeCharts] = useState(true);
  const [format, setFormat] = useState('pdf');
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (!reportName.trim()) return;

    setIsLoading(true);
    try {
      await onConfirm({
        name: reportName,
        type: reportType,
        dateRange,
        filters: selectedFilters,
        includeCharts,
        format
      });
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error creating custom report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setReportName('');
    setReportType('orders');
    setDateRange({
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    });
    setSelectedFilters([]);
    setIncludeCharts(true);
    setFormat('pdf');
  };

  const handleFilterChange = (filter: string, checked: boolean) => {
    if (checked) {
      setSelectedFilters(prev => [...prev, filter]);
    } else {
      setSelectedFilters(prev => prev.filter(f => f !== filter));
    }
  };

  const reportTypeOptions = [
    { value: 'orders', label: 'Order Analytics', description: 'Analyze order trends, revenue, and performance' },
    { value: 'tukang', label: 'Tukang Performance', description: 'Track tukang ratings, earnings, and activity' },
    { value: 'complaints', label: 'Complaint Analysis', description: 'Monitor customer complaints and resolution rates' },
    { value: 'combined', label: 'Combined Report', description: 'Comprehensive overview of all platform metrics' }
  ];

  const getFilterOptions = () => {
    switch (reportType) {
      case 'orders':
        return [
          { value: 'revenue', label: 'Revenue Analysis', description: 'Monthly and total revenue breakdown' },
          { value: 'categories', label: 'Service Categories', description: 'Orders by service type' },
          { value: 'status', label: 'Order Status', description: 'Order completion and cancellation rates' },
          { value: 'locations', label: 'Location Analysis', description: 'Orders by geographic location' }
        ];
      case 'tukang':
        return [
          { value: 'performance', label: 'Performance Metrics', description: 'Ratings, completion rates, response times' },
          { value: 'earnings', label: 'Earnings Analysis', description: 'Tukang earnings and payment trends' },
          { value: 'specialization', label: 'Specialization Stats', description: 'Job distribution by specialization' },
          { value: 'activity', label: 'Activity Tracking', description: 'Tukang login and job activity' }
        ];
      case 'complaints':
        return [
          { value: 'categories', label: 'Complaint Categories', description: 'Types of customer complaints' },
          { value: 'resolution', label: 'Resolution Times', description: 'Time to resolve complaints' },
          { value: 'trends', label: 'Complaint Trends', description: 'Monthly complaint patterns' },
          { value: 'satisfaction', label: 'Customer Satisfaction', description: 'Post-resolution satisfaction rates' }
        ];
      case 'combined':
        return [
          { value: 'overview', label: 'Platform Overview', description: 'High-level platform statistics' },
          { value: 'trends', label: 'Trend Analysis', description: 'Key metrics trends over time' },
          { value: 'comparison', label: 'Period Comparison', description: 'Compare different time periods' },
          { value: 'forecasting', label: 'Forecasting Data', description: 'Projected growth and trends' }
        ];
      default:
        return [];
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Custom Report" size="xl">
      <div className="space-y-6">
        {/* Report Basic Info */}
        <div className="bg-[#F5F9FC] rounded-xl p-4">
          <h3 className="text-sh2b text-[#141414] mb-4">Report Details</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-b3 text-[#9E9E9E] mb-2">
                Report Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter a name for your custom report..."
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                className="w-full px-4 py-3 border border-[#D4D4D4] rounded-xl text-b2 focus:outline-none focus:ring-2 focus:ring-[#0082C9] focus:border-transparent"
                required
              />
            </div>
          </div>
        </div>

        {/* Report Type */}
        <div>
          <label className="block text-b3 text-[#9E9E9E] mb-3">
            Report Type <span className="text-red-500">*</span>
          </label>
          <div className="space-y-3">
            {reportTypeOptions.map((option) => (
              <label key={option.value} className="flex items-start gap-3 p-3 border border-[#D4D4D4] rounded-xl cursor-pointer hover:bg-[#F5F9FC]">
                <input
                  type="radio"
                  name="reportType"
                  value={option.value}
                  checked={reportType === option.value}
                  onChange={(e) => {
                    setReportType(e.target.value);
                    setSelectedFilters([]);
                  }}
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

        {/* Date Range */}
        <div>
          <label className="block text-b3 text-[#9E9E9E] mb-3">
            Date Range <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-b3 text-[#9E9E9E] mb-2">Start Date</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-full px-4 py-3 border border-[#D4D4D4] rounded-xl text-b2 focus:outline-none focus:ring-2 focus:ring-[#0082C9] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-b3 text-[#9E9E9E] mb-2">End Date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-full px-4 py-3 border border-[#D4D4D4] rounded-xl text-b2 focus:outline-none focus:ring-2 focus:ring-[#0082C9] focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Data Filters */}
        <div>
          <label className="block text-b3 text-[#9E9E9E] mb-3">
            Include Data Sections
          </label>
          <div className="space-y-3">
            {getFilterOptions().map((option) => (
              <label key={option.value} className="flex items-start gap-3 p-3 border border-[#D4D4D4] rounded-xl cursor-pointer hover:bg-[#F5F9FC]">
                <input
                  type="checkbox"
                  checked={selectedFilters.includes(option.value)}
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
        </div>

        {/* Output Options */}
        <div>
          <label className="block text-b3 text-[#9E9E9E] mb-3">
            Output Options
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
                <div className="text-b3 text-[#9E9E9E]">Add charts and graphs to the custom report</div>
              </div>
            </label>

            <div>
              <label className="block text-b3 text-[#9E9E9E] mb-2">Output Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full px-4 py-3 border border-[#D4D4D4] rounded-xl text-b2 focus:outline-none focus:ring-2 focus:ring-[#0082C9] focus:border-transparent"
              >
                <option value="pdf">PDF Report</option>
                <option value="xlsx">Excel Workbook</option>
                <option value="csv">CSV Data</option>
              </select>
            </div>
          </div>
        </div>

        {/* Report Preview */}
        <div className="bg-[#F5F9FC] rounded-xl p-4">
          <h4 className="text-b2b text-[#141414] mb-3">Report Preview</h4>
          <div className="space-y-2 text-b3">
            <div className="flex justify-between">
              <span className="text-[#9E9E9E]">Report Name:</span>
              <span className="text-[#141414] font-medium">{reportName || 'Untitled Report'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#9E9E9E]">Type:</span>
              <span className="text-[#141414] font-medium">
                {reportTypeOptions.find(t => t.value === reportType)?.label}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#9E9E9E]">Date Range:</span>
              <span className="text-[#141414] font-medium">
                {dateRange.start} to {dateRange.end}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#9E9E9E]">Data Sections:</span>
              <span className="text-[#141414] font-medium">
                {selectedFilters.length === 0 ? 'None selected' : `${selectedFilters.length} selected`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#9E9E9E]">Format:</span>
              <span className="text-[#141414] font-medium">{format.toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            onClick={handleConfirm}
            disabled={isLoading || !reportName.trim() || selectedFilters.length === 0}
            className="bg-[#0082C9] text-white hover:bg-[#0066A3] disabled:opacity-50"
          >
            {isLoading ? 'Generating...' : 'Generate Custom Report'}
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

export default CustomReportModal;
