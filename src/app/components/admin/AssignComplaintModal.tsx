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

interface AssignComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaint: Complaint | null;
  onConfirm: (complaintId: string, assignedTo: string, notes?: string) => void;
}

const AssignComplaintModal = ({
  isOpen,
  onClose,
  complaint,
  onConfirm
}: AssignComplaintModalProps) => {
  const [assignedTo, setAssignedTo] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!complaint) return null;

  const handleConfirm = async () => {
    if (!assignedTo.trim()) return;

    setIsLoading(true);
    try {
      await onConfirm(complaint.id, assignedTo, notes);
      onClose();
      setAssignedTo('');
      setNotes('');
    } catch (error) {
      console.error('Error assigning complaint:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setAssignedTo('');
    setNotes('');
    onClose();
  };

  const teamMembers = [
    { value: 'Admin Support', label: 'Admin Support', description: 'General complaint handling and coordination' },
    { value: 'Customer Service', label: 'Customer Service', description: 'Customer communication and relationship management' },
    { value: 'Quality Control', label: 'Quality Control', description: 'Service quality and technical issues' },
    { value: 'Billing Department', label: 'Billing Department', description: 'Payment and billing related complaints' },
    { value: 'Technical Support', label: 'Technical Support', description: 'Platform and technical support issues' },
  ];

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

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Assign Complaint" size="lg">
      <div className="space-y-6">
        {/* Complaint Summary */}
        <div className="bg-[#F5F9FC] rounded-xl p-4">
          <h3 className="text-sh2b text-[#141414] mb-3">Complaint Summary</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-b3 text-[#9E9E9E]">Complaint ID:</span>
              <span className="text-b2 text-[#141414]">{complaint.id}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-b3 text-[#9E9E9E]">Subject:</span>
              <span className="text-b2 text-[#141414]">{complaint.subject}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-b3 text-[#9E9E9E]">Priority:</span>
              <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                priorityColors[complaint.priority as keyof typeof priorityColors] ||
                'bg-gray-50 text-gray-700 border border-gray-200'
              }`}>
                {complaint.priority}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-b3 text-[#9E9E9E]">Category:</span>
              <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                categoryColors[complaint.category as keyof typeof categoryColors] ||
                'bg-gray-50 text-gray-700 border border-gray-200'
              }`}>
                {complaint.category}
              </span>
            </div>
          </div>
        </div>

        {/* Team Member Selection */}
        <div>
          <label className="block text-b3 text-[#9E9E9E] mb-3">
            Assign To <span className="text-red-500">*</span>
          </label>
          <div className="space-y-3">
            {teamMembers.map((member) => (
              <label key={member.value} className="flex items-start gap-3 p-3 border border-[#D4D4D4] rounded-xl cursor-pointer hover:bg-[#F5F9FC]">
                <input
                  type="radio"
                  name="assignedTo"
                  value={member.value}
                  checked={assignedTo === member.value}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="mt-1 text-[#0082C9] border-[#D4D4D4] focus:ring-[#0082C9]"
                />
                <div className="flex-1">
                  <div className="text-b2b text-[#141414]">{member.label}</div>
                  <div className="text-b3 text-[#9E9E9E]">{member.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Assignment Notes */}
        <div>
          <label className="block text-b3 text-[#9E9E9E] mb-2">
            Assignment Notes <span className="text-gray-500">(Optional)</span>
          </label>
          <textarea
            placeholder="Add any notes or instructions for the assigned team member..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-[#D4D4D4] rounded-xl text-b2 focus:outline-none focus:ring-2 focus:ring-[#0082C9] focus:border-transparent resize-none"
          />
          <div className="text-b3 text-[#9E9E9E] mt-1">
            These notes will be visible to the assigned team member.
          </div>
        </div>

        {/* Assignment Preview */}
        <div className="bg-[#F5F9FC] rounded-xl p-4">
          <h4 className="text-b2b text-[#141414] mb-3">Assignment Preview</h4>
          <div className="space-y-2 text-b3">
            <div className="flex justify-between">
              <span className="text-[#9E9E9E]">Assigned To:</span>
              <span className="text-[#141414] font-medium">
                {assignedTo || 'Not selected'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#9E9E9E]">Complaint:</span>
              <span className="text-[#141414] font-medium">{complaint.subject}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#9E9E9E]">Priority:</span>
              <span className="text-[#141414] font-medium">{complaint.priority}</span>
            </div>
            {notes && (
              <div>
                <span className="text-[#9E9E9E]">Notes:</span>
                <p className="text-[#141414] mt-1 whitespace-pre-wrap">{notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            onClick={handleConfirm}
            disabled={isLoading || !assignedTo.trim()}
            className="bg-[#0082C9] text-white hover:bg-[#0066A3] disabled:opacity-50"
          >
            {isLoading ? 'Assigning...' : 'Assign Complaint'}
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

export default AssignComplaintModal;
