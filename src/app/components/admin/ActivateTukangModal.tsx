import React, { useState } from 'react';
import Modal from '../Modal';
import Button from '../Button';

interface Tukang {
  id: string;
  name: string;
  phone: string;
  email: string;
  specialization: string[];
  location: string;
  joinDate: string;
  status: string;
  rating: number;
  totalJobs: number;
  completedJobs: number;
  earnings: string;
  responseTime: string;
  profileImage: string | null;
  verified: boolean;
  lastActive: string;
}

interface ActivateTukangModalProps {
  isOpen: boolean;
  onClose: () => void;
  tukang: Tukang | null;
  onConfirm: (tukangId: string, reason: string) => void;
}

const ActivateTukangModal = ({
  isOpen,
  onClose,
  tukang,
  onConfirm
}: ActivateTukangModalProps) => {
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!tukang) return null;

  const handleConfirm = async () => {
    if (!reason.trim()) return;

    setIsLoading(true);
    try {
      await onConfirm(tukang.id, reason);
      onClose();
      setReason('');
    } catch (error) {
      console.error('Error activating tukang:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Activate Tukang" size="md">
      <div className="space-y-6">
        {/* Tukang Information */}
        <div className="bg-[#F5F9FC] rounded-xl p-4">
          <h3 className="text-sh2b text-[#141414] mb-3">Tukang Information</h3>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#E0F1FE] rounded-full flex items-center justify-center">
              <span className="text-b2b text-[#0082C9] font-medium">
                {tukang.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </span>
            </div>
            <div>
              <div className="text-b2m text-[#141414]">{tukang.name}</div>
              <div className="text-b3 text-[#9E9E9E]">{tukang.email}</div>
              <div className="text-b3 text-[#9E9E9E]">{tukang.phone}</div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="text-b2b text-green-800 mb-1">Activation Confirmation</h4>
              <p className="text-b3 text-green-700">
                Activating this tukang will restore their access to the platform.
                They will be able to receive new job requests and resume their work.
              </p>
            </div>
          </div>
        </div>

        {/* Activation Reason */}
        <div>
          <label className="block text-b3 text-[#9E9E9E] mb-2">
            Reason for Activation <span className="text-red-500">*</span>
          </label>
          <textarea
            placeholder="Please provide a reason for activating this tukang..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-[#D4D4D4] rounded-xl text-b2 focus:outline-none focus:ring-2 focus:ring-[#0082C9] focus:border-transparent resize-none"
            required
          />
          <div className="text-b3 text-[#9E9E9E] mt-1">
            This reason will be recorded in the tukang&apos;s activity log.
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            onClick={handleConfirm}
            disabled={isLoading || !reason.trim()}
            className="bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
          >
            {isLoading ? 'Activating...' : 'Activate Tukang'}
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

export default ActivateTukangModal;
