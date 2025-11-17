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

interface SuspendTukangModalProps {
  isOpen: boolean;
  onClose: () => void;
  tukang: Tukang | null;
  onConfirm: (tukangId: string, reason: string, duration: string) => void;
}

const SuspendTukangModal = ({
  isOpen,
  onClose,
  tukang,
  onConfirm
}: SuspendTukangModalProps) => {
  const [reason, setReason] = useState('');
  const [duration, setDuration] = useState('7');
  const [isLoading, setIsLoading] = useState(false);

  if (!tukang) return null;

  const handleConfirm = async () => {
    if (!reason.trim()) return;

    setIsLoading(true);
    try {
      await onConfirm(tukang.id, reason, duration);
      onClose();
      setReason('');
      setDuration('7');
    } catch (error) {
      console.error('Error suspending tukang:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setReason('');
    setDuration('7');
    onClose();
  };

  const getDurationText = (days: string) => {
    if (days === 'permanent') return 'Permanent';
    return `${days} days`;
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Suspend Tukang" size="md">
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

        {/* Warning Message */}
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <h4 className="text-b2b text-orange-800 mb-1">Suspension Warning</h4>
              <p className="text-b3 text-orange-700">
                Suspending this tukang will temporarily restrict their access to the platform.
                They will not be able to receive new job requests during the suspension period.
              </p>
            </div>
          </div>
        </div>

        {/* Suspension Duration */}
        <div>
          <label className="block text-b3 text-[#9E9E9E] mb-2">
            Suspension Duration <span className="text-red-500">*</span>
          </label>
          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full px-4 py-3 border border-[#D4D4D4] rounded-xl text-b2 focus:outline-none focus:ring-2 focus:ring-[#0082C9] focus:border-transparent"
          >
            <option value="7">7 days - Minor violation</option>
            <option value="30">30 days - Moderate violation</option>
            <option value="90">90 days - Serious violation</option>
            <option value="permanent">Permanent - Severe violation</option>
          </select>
          <div className="text-b3 text-[#9E9E9E] mt-1">
            Selected: {getDurationText(duration)}
          </div>
        </div>

        {/* Suspension Reason */}
        <div>
          <label className="block text-b3 text-[#9E9E9E] mb-2">
            Reason for Suspension <span className="text-red-500">*</span>
          </label>
          <textarea
            placeholder="Please provide a detailed reason for suspending this tukang..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-[#D4D4D4] rounded-xl text-b2 focus:outline-none focus:ring-2 focus:ring-[#0082C9] focus:border-transparent resize-none"
            required
          />
          <div className="text-b3 text-[#9E9E9E] mt-1">
            This reason will be visible to the tukang and kept in their record.
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            onClick={handleConfirm}
            disabled={isLoading || !reason.trim()}
            className="bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50"
          >
            {isLoading ? 'Suspending...' : `Suspend for ${getDurationText(duration)}`}
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

export default SuspendTukangModal;
