import React, { useState } from 'react';
import Modal from '../Modal';
import Button from '../Button';

interface Complaint {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orderId: string;
  tukangName: string;
  category: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  resolvedAt?: string;
  assignedTo?: string;
  response?: string;
  rating?: number;
  attachments: number;
}

interface BulkResolveComplaintsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedComplaints: Complaint[];
  onConfirm: (complaintIds: string[], response: string, rating?: number) => void;
}

const BulkResolveComplaintsModal = ({
  isOpen,
  onClose,
  selectedComplaints,
  onConfirm
}: BulkResolveComplaintsModalProps) => {
  const [response, setResponse] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen || selectedComplaints.length === 0) return null;

  const handleConfirm = async () => {
    if (!response.trim()) return;

    setIsLoading(true);
    try {
      const complaintIds = selectedComplaints.map(complaint => complaint.id);
      await onConfirm(complaintIds, response, rating > 0 ? rating : undefined);
      onClose();
      setResponse('');
      setRating(0);
    } catch (error) {
      console.error('Error bulk resolving complaints:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setResponse('');
    setRating(0);
    onClose();
  };

  const priorityColors = {
    Low: 'bg-gray-50 text-gray-700 border border-gray-200',
    Medium: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    High: 'bg-orange-50 text-orange-700 border border-orange-200',
    Urgent: 'bg-red-50 text-red-700 border border-red-200',
  };

  const categoryColors = {
    'Kualitas Pekerjaan': 'bg-red-50 text-red-700 border border-red-200',
    'Waktu Tunggu': 'bg-orange-50 text-orange-700 border border-orange-200',
    'Komunikasi': 'bg-blue-50 text-blue-700 border border-blue-200',
    'Lainnya': 'bg-gray-50 text-gray-700 border border-gray-200',
  };

  const getPriorityStats = () => {
    const stats = { Low: 0, Medium: 0, High: 0, Urgent: 0 };
    selectedComplaints.forEach(complaint => {
      stats[complaint.priority as keyof typeof stats]++;
    });
    return stats;
  };

  const getCategoryStats = () => {
    const stats = { 'Kualitas Pekerjaan': 0, 'Waktu Tunggu': 0, 'Komunikasi': 0, 'Lainnya': 0 };
    selectedComplaints.forEach(complaint => {
      if (stats[complaint.category as keyof typeof stats] !== undefined) {
        stats[complaint.category as keyof typeof stats]++;
      }
    });
    return stats;
  };

  const priorityStats = getPriorityStats();
  const categoryStats = getCategoryStats();

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Bulk Resolve ${selectedComplaints.length} Complaint${selectedComplaints.length > 1 ? 's' : ''}`} size="xl">
      <div className="space-y-6">
        {/* Selected Complaints Summary */}
        <div className="bg-[#F5F9FC] rounded-xl p-4">
          <h3 className="text-sh2b text-[#141414] mb-3">Selected Complaints Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#0082C9]">{selectedComplaints.length}</div>
              <div className="text-b3 text-[#9E9E9E]">Total Selected</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Object.entries(priorityStats).filter(([, value]) => value > 0).length}
              </div>
              <div className="text-b3 text-[#9E9E9E]">Priority Types</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Object.entries(categoryStats).filter(([, value]) => value > 0).length}
              </div>
              <div className="text-b3 text-[#9E9E9E]">Categories</div>
            </div>
          </div>

          {/* Priority and Category Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-b2b text-[#141414] mb-2">By Priority</h4>
              <div className="space-y-1">
                {Object.entries(priorityStats).map(([_key, count]) => (
                  count > 0 ? (
                    <div key={_key} className="flex justify-between items-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${priorityColors[_key as keyof typeof priorityColors]}`}>
                        {_key}
                      </span>
                      <span className="text-b3 text-[#9E9E9E]">{count}</span>
                    </div>
                  ) : null
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-b2b text-[#141414] mb-2">By Category</h4>
              <div className="space-y-1">
                {Object.entries(categoryStats).map(([_category, count]) => (
                  count > 0 ? (
                    <div key={_category} className="flex justify-between items-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${categoryColors[_category as keyof typeof categoryColors]}`}>
                        {_category}
                      </span>
                      <span className="text-b3 text-[#9E9E9E]">{count}</span>
                    </div>
                  ) : null
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Selected Complaints List */}
        <div className="bg-[#F5F9FC] rounded-xl p-4">
          <h3 className="text-sh2b text-[#141414] mb-3">Selected Complaints</h3>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {selectedComplaints.map((complaint) => (
              <div key={complaint.id} className="bg-white border border-[#D4D4D4] rounded-lg p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-b2b text-[#141414] font-medium">{complaint.id}</span>
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium whitespace-nowrap ${
                        priorityColors[complaint.priority as keyof typeof priorityColors]
                      }`}>
                        {complaint.priority}
                      </span>
                    </div>
                    <div className="text-b2 text-[#141414] truncate">{complaint.subject}</div>
                    <div className="text-b3 text-[#9E9E9E]">{complaint.customerName} • {complaint.category}</div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                    complaint.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                    complaint.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                    complaint.status === 'Resolved' ? 'bg-green-50 text-green-700 border border-green-200' :
                    'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {complaint.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resolution Response */}
        <div>
          <label className="block text-b3 text-[#9E9E9E] mb-2">
            Bulk Resolution Response <span className="text-red-500">*</span>
          </label>
          <textarea
            placeholder="Enter a resolution response that will be applied to all selected complaints..."
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            rows={5}
            className="w-full px-4 py-3 border border-[#D4D4D4] rounded-xl text-b2 focus:outline-none focus:ring-2 focus:ring-[#0082C9] focus:border-transparent resize-none"
            required
          />
          <div className="flex justify-between items-center mt-2">
            <div className="text-b3 text-[#9E9E9E]">
              Characters: {response.length}/1000
            </div>
            {response.length > 1000 && (
              <div className="text-b3 text-red-600">
                Response too long! Please keep under 1000 characters.
              </div>
            )}
          </div>
          <div className="text-b3 text-[#9E9E9E] mt-1">
            This response will be applied to all {selectedComplaints.length} selected complaints.
          </div>
        </div>

        {/* Customer Satisfaction Rating */}
        <div>
          <label className="block text-b3 text-[#9E9E9E] mb-3">
            Customer Satisfaction Rating <span className="text-gray-500">(Optional)</span>
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`text-2xl transition-colors ${
                  star <= rating ? 'text-yellow-500' : 'text-gray-300'
                } hover:text-yellow-500`}
              >
                ★
              </button>
            ))}
            <span className="ml-2 text-b3 text-[#9E9E9E]">
              {rating > 0 ? `${rating}/5 stars` : 'Rate the resolution'}
            </span>
          </div>
          <div className="text-b3 text-[#9E9E9E] mt-1">
            This rating will be applied to all resolved complaints.
          </div>
        </div>

        {/* Bulk Resolution Preview */}
        <div className="bg-[#F5F9FC] rounded-xl p-4">
          <h4 className="text-b2b text-[#141414] mb-3">Bulk Resolution Preview</h4>
          <div className="space-y-2 text-b3">
            <div className="flex justify-between">
              <span className="text-[#9E9E9E]">Complaints to resolve:</span>
              <span className="text-[#141414] font-medium">{selectedComplaints.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#9E9E9E]">Response length:</span>
              <span className="text-[#141414] font-medium">{response.length} characters</span>
            </div>
            {rating > 0 && (
              <div className="flex justify-between">
                <span className="text-[#9E9E9E]">Customer rating:</span>
                <span className="text-[#141414] font-medium">{rating}/5 stars</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-[#9E9E9E]">New status:</span>
              <span className="text-green-600 font-medium">Resolved</span>
            </div>
          </div>
        </div>

        {/* Warning Message */}
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <h4 className="text-b2b text-orange-800 mb-1">Bulk Resolution Warning</h4>
              <p className="text-b3 text-orange-700">
                You are about to resolve {selectedComplaints.length} complaint{selectedComplaints.length > 1 ? 's' : ''} at once.
                The same response will be applied to all selected complaints. This action cannot be undone.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            onClick={handleConfirm}
            disabled={isLoading || !response.trim() || response.length > 1000}
            className="bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
          >
            {isLoading ? 'Resolving...' : `Resolve ${selectedComplaints.length} Complaint${selectedComplaints.length > 1 ? 's' : ''}`}
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

export default BulkResolveComplaintsModal;
