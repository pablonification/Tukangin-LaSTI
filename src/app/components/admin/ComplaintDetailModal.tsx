import React from 'react';
import Modal from '../Modal';
import Button from '../Button';
import { useModal } from '../ModalProvider';

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

interface ComplaintDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaint: Complaint | null;
  onAssign?: (complaint: Complaint) => void;
  onUpdateStatus?: (complaint: Complaint, status: string) => void;
}

// Modal IDs
const MODAL_IDS = {
  COMPLAINT_DETAIL: 'complaint-detail',
  ASSIGN_COMPLAINT: 'assign-complaint',
  UPDATE_STATUS: 'update-status',
} as const;

const statusColors = {
  Pending: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  'In Progress': 'bg-blue-50 text-blue-700 border border-blue-200',
  Resolved: 'bg-green-50 text-green-700 border border-green-200',
  Escalated: 'bg-red-50 text-red-700 border border-red-200',
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

const ComplaintDetailModal = ({
  isOpen,
  onClose,
  complaint,
  onAssign,
  onUpdateStatus
}: ComplaintDetailModalProps) => {
  const { openModal } = useModal();

  if (!complaint) return null;

  const handleAssign = () => {
    if (onAssign) {
      onAssign(complaint);
    } else {
      openModal(MODAL_IDS.ASSIGN_COMPLAINT);
    }
  };

  const handleUpdateStatus = (status: string) => {
    if (onUpdateStatus) {
      onUpdateStatus(complaint, status);
    } else {
      openModal(MODAL_IDS.UPDATE_STATUS);
    }
  };

  const getTimeSinceCreated = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} days ago`;
    }
  };

  const getResolutionTime = (createdAt: string, resolvedAt?: string) => {
    if (!resolvedAt) return null;
    const created = new Date(createdAt);
    const resolved = new Date(resolvedAt);
    const diffInHours = Math.floor((resolved.getTime() - created.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 24) {
      return `${diffInHours} hours`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      const remainingHours = diffInHours % 24;
      return `${diffInDays} days ${remainingHours} hours`;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Complaint Details - ${complaint.id}`} size="xl">
      <div className="space-y-6">
        {/* Complaint Header */}
        <div className="bg-[#F5F9FC] rounded-xl p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-sh2b text-[#141414]">{complaint.subject}</h2>
                <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                  priorityColors[complaint.priority as keyof typeof priorityColors] ||
                  'bg-gray-50 text-gray-700 border border-gray-200'
                }`}>
                  {complaint.priority}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-[#9E9E9E]">
                <span>Complaint #{complaint.id}</span>
                <span>•</span>
                <span>{getTimeSinceCreated(complaint.createdAt)}</span>
                {complaint.resolvedAt && (
                  <>
                    <span>•</span>
                    <span className="text-green-600">Resolved in {getResolutionTime(complaint.createdAt, complaint.resolvedAt)}</span>
                  </>
                )}
              </div>
            </div>
            <div className="text-right">
              <span className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                statusColors[complaint.status as keyof typeof statusColors] ||
                'bg-gray-50 text-gray-700 border border-gray-200'
              }`}>
                {complaint.status}
              </span>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="bg-[#F5F9FC] rounded-xl p-4">
          <h3 className="text-sh2b text-[#141414] mb-4">Customer Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-b3 text-[#9E9E9E] mb-1">Customer Name</label>
              <div className="text-b2 text-[#141414]">{complaint.customerName}</div>
            </div>
            <div>
              <label className="block text-b3 text-[#9E9E9E] mb-1">Email Address</label>
              <div className="text-b2 text-[#141414]">{complaint.customerEmail}</div>
            </div>
            <div>
              <label className="block text-b3 text-[#9E9E9E] mb-1">Phone Number</label>
              <div className="text-b2 text-[#141414]">{complaint.customerPhone}</div>
            </div>
            <div>
              <label className="block text-b3 text-[#9E9E9E] mb-1">Order ID</label>
              <div className="text-b2 text-[#141414]">{complaint.orderId}</div>
            </div>
          </div>
        </div>

        {/* Service Information */}
        <div className="bg-[#F5F9FC] rounded-xl p-4">
          <h3 className="text-sh2b text-[#141414] mb-4">Service Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-b3 text-[#9E9E9E] mb-1">Assigned Tukang</label>
              <div className="text-b2 text-[#141414]">{complaint.tukangName}</div>
            </div>
            <div>
              <label className="block text-b3 text-[#9E9E9E] mb-1">Category</label>
              <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                categoryColors[complaint.category as keyof typeof categoryColors] ||
                'bg-gray-50 text-gray-700 border border-gray-200'
              }`}>
                {complaint.category}
              </span>
            </div>
          </div>
        </div>

        {/* Complaint Description */}
        <div className="bg-[#F5F9FC] rounded-xl p-4">
          <h3 className="text-sh2b text-[#141414] mb-4">Complaint Description</h3>
          <div className="bg-white border border-[#D4D4D4] rounded-lg p-4">
            <p className="text-b2 text-[#141414] whitespace-pre-wrap">{complaint.description}</p>
          </div>
          {complaint.attachments > 0 && (
            <div className="mt-3 text-b3 text-[#9E9E9E]">
              📎 {complaint.attachments} attachment{complaint.attachments > 1 ? 's' : ''} included
            </div>
          )}
        </div>

        {/* Assignment Information */}
        <div className="bg-[#F5F9FC] rounded-xl p-4">
          <h3 className="text-sh2b text-[#141414] mb-4">Assignment & Resolution</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-b3 text-[#9E9E9E] mb-1">Assigned To</label>
              <div className="text-b2 text-[#141414]">{complaint.assignedTo || 'Unassigned'}</div>
            </div>
            <div>
              <label className="block text-b3 text-[#9E9E9E] mb-1">Created At</label>
              <div className="text-b2 text-[#141414]">{new Date(complaint.createdAt).toLocaleString('id-ID')}</div>
            </div>
            {complaint.resolvedAt && (
              <div>
                <label className="block text-b3 text-[#9E9E9E] mb-1">Resolved At</label>
                <div className="text-b2 text-[#141414]">{new Date(complaint.resolvedAt).toLocaleString('id-ID')}</div>
              </div>
            )}
            {complaint.rating && (
              <div>
                <label className="block text-b3 text-[#9E9E9E] mb-1">Customer Rating</label>
                <div className="flex items-center">
                  <span className="text-yellow-500 mr-1">★</span>
                  <span className="text-b2 text-[#141414]">{complaint.rating}/5</span>
                </div>
              </div>
            )}
          </div>
          {complaint.response && (
            <div className="mt-4">
              <label className="block text-b3 text-[#9E9E9E] mb-2">Resolution Response</label>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-b2 text-green-800 whitespace-pre-wrap">{complaint.response}</p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          {complaint.status === 'Pending' && (
            <Button
              onClick={handleAssign}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Assign Complaint
            </Button>
          )}
          {complaint.status !== 'Resolved' && (
            <Button
              onClick={() => handleUpdateStatus('Resolved')}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              Mark as Resolved
            </Button>
          )}
          {complaint.status === 'Pending' && (
            <Button
              onClick={() => handleUpdateStatus('Escalated')}
              variant="secondary"
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Escalate
            </Button>
          )}
          <Button
            onClick={onClose}
            variant="secondary"
            className="sm:ml-auto"
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ComplaintDetailModal;
