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

interface UpdateComplaintStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaint: Complaint | null;
  onConfirm: (complaintId: string, status: string, response?: string, rating?: number) => void;
}

const UpdateComplaintStatusModal = ({
  isOpen,
  onClose,
  complaint,
  onConfirm
}: UpdateComplaintStatusModalProps) => {
  const [status, setStatus] = useState('');
  const [response, setResponse] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  if (!complaint) return null;

  const handleConfirm = async () => {
    if (!status) return;

    setIsLoading(true);
    try {
      await onConfirm(complaint.id, status, response, rating > 0 ? rating : undefined);
      onClose();
      setStatus('');
      setResponse('');
      setRating(0);
    } catch (error) {
      console.error('Error updating complaint status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStatus('');
    setResponse('');
    setRating(0);
    onClose();
  };

  const statusOptions = [
    {
      value: 'Resolved',
      label: 'Resolved',
      description: 'Complaint has been successfully resolved',
      color: 'bg-green-50 text-green-700 border border-green-200'
    },
    {
      value: 'Escalated',
      label: 'Escalated',
      description: 'Complaint requires higher-level attention',
      color: 'bg-red-50 text-red-700 border border-red-200'
    },
    {
      value: 'In Progress',
      label: 'In Progress',
      description: 'Complaint is being actively worked on',
      color: 'bg-blue-50 text-blue-700 border border-blue-200'
    }
  ];

  const availableStatuses = statusOptions.filter(option =>
    option.value !== complaint.status
  );

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Update Complaint Status - ${complaint.id}`} size="lg">
      <div className="space-y-6">
        {/* Complaint Summary */}
        <div className="bg-[#F5F9FC] rounded-xl p-4">
          <h3 className="text-sh2b text-[#141414] mb-3">Complaint Summary</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-b3 text-[#9E9E9E]">Subject:</span>
              <span className="text-b2 text-[#141414]">{complaint.subject}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-b3 text-[#9E9E9E]">Current Status:</span>
              <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                complaint.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                complaint.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                complaint.status === 'Resolved' ? 'bg-green-50 text-green-700 border border-green-200' :
                'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {complaint.status}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-b3 text-[#9E9E9E]">Priority:</span>
              <span className="text-b2 text-[#141414]">{complaint.priority}</span>
            </div>
          </div>
        </div>

        {/* Status Selection */}
        <div>
          <label className="block text-b3 text-[#9E9E9E] mb-3">
            New Status <span className="text-red-500">*</span>
          </label>
          <div className="space-y-3">
            {availableStatuses.map((option) => (
              <label key={option.value} className="flex items-start gap-3 p-3 border border-[#D4D4D4] rounded-xl cursor-pointer hover:bg-[#F5F9FC]">
                <input
                  type="radio"
                  name="status"
                  value={option.value}
                  checked={status === option.value}
                  onChange={(e) => setStatus(e.target.value)}
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

        {/* Resolution Response */}
        <div>
          <label className="block text-b3 text-[#9E9E9E] mb-2">
            Resolution Response {status === 'Resolved' ? <span className="text-red-500">*</span> : <span className="text-gray-500">(Optional)</span>}
          </label>
          <textarea
            placeholder={status === 'Resolved'
              ? "Describe how the complaint was resolved..."
              : "Add any notes or updates about this status change..."
            }
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-[#D4D4D4] rounded-xl text-b2 focus:outline-none focus:ring-2 focus:ring-[#0082C9] focus:border-transparent resize-none"
            required={status === 'Resolved'}
          />
          <div className="text-b3 text-[#9E9E9E] mt-1">
            {status === 'Resolved'
              ? 'This response will be visible to the customer.'
              : 'These notes will be recorded in the complaint history.'
            }
          </div>
        </div>

        {/* Customer Satisfaction Rating (only for resolved complaints) */}
        {status === 'Resolved' && (
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
          </div>
        )}

        {/* Status Update Preview */}
        <div className="bg-[#F5F9FC] rounded-xl p-4">
          <h4 className="text-b2b text-[#141414] mb-3">Status Update Preview</h4>
          <div className="space-y-2 text-b3">
            <div className="flex justify-between">
              <span className="text-[#9E9E9E]">New Status:</span>
              <span className="text-[#141414] font-medium">
                {status || 'Not selected'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#9E9E9E]">Complaint:</span>
              <span className="text-[#141414] font-medium">{complaint.subject}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#9E9E9E]">Response Length:</span>
              <span className="text-[#141414] font-medium">
                {response.length} characters
              </span>
            </div>
            {status === 'Resolved' && rating > 0 && (
              <div className="flex justify-between">
                <span className="text-[#9E9E9E]">Customer Rating:</span>
                <span className="text-[#141414] font-medium">{rating}/5 stars</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            onClick={handleConfirm}
            disabled={isLoading || !status || (status === 'Resolved' && !response.trim())}
            className={`${
              status === 'Resolved' ? 'bg-green-600 text-white hover:bg-green-700' :
              status === 'Escalated' ? 'bg-red-600 text-white hover:bg-red-700' :
              'bg-blue-600 text-white hover:bg-blue-700'
            } disabled:opacity-50`}
          >
            {isLoading ? 'Updating...' : `Mark as ${status}`}
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

export default UpdateComplaintStatusModal;
