import React, { useState } from 'react';
import Modal from '../Modal';
import Button from '../Button';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  joinDate: string;
  totalOrders: number;
  totalSpent: string;
  status: string;
  lastOrder: string;
  rating: number;
  avatar: string | null;
}

interface SuspendUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onConfirm: (userId: string, reason: string, duration?: string) => void;
}

const SuspendUserModal = ({
  isOpen,
  onClose,
  user,
  onConfirm
}: SuspendUserModalProps) => {
  const [reason, setReason] = useState('');
  const [duration, setDuration] = useState('7');
  const [isLoading, setIsLoading] = useState(false);

  if (!user) return null;

  const handleConfirm = async () => {
    if (!reason.trim()) return;

    setIsLoading(true);
    try {
      await onConfirm(user.id, reason, duration);
      onClose();
      setReason('');
      setDuration('7');
    } catch (error) {
      console.error('Error suspending user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setReason('');
    setDuration('7');
    onClose();
  };

  const suspensionOptions = [
    { value: '7', label: '7 days' },
    { value: '30', label: '30 days' },
    { value: '90', label: '90 days' },
    { value: 'permanent', label: 'Permanent' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Suspend User" size="md">
      <div className="space-y-6">
        {/* User Summary */}
        <div className="bg-[#F5F9FC] rounded-xl p-4">
          <h3 className="text-sh2b text-[#141414] mb-3">User Information</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-b3 text-[#9E9E9E]">Name:</span>
              <span className="text-b2 text-[#141414]">{user.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-b3 text-[#9E9E9E]">Email:</span>
              <span className="text-b2 text-[#141414]">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-b3 text-[#9E9E9E]">Phone:</span>
              <span className="text-b2 text-[#141414]">{user.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-b3 text-[#9E9E9E]">Total Orders:</span>
              <span className="text-b2 text-[#141414]">{user.totalOrders}</span>
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
            {suspensionOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Suspension Reason */}
        <div>
          <label className="block text-b3 text-[#9E9E9E] mb-2">
            Reason for Suspension <span className="text-red-500">*</span>
          </label>
          <textarea
            placeholder="Please provide a reason for suspending this user&hellip;"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-[#D4D4D4] rounded-xl text-b2 focus:outline-none focus:ring-2 focus:ring-[#0082C9] focus:border-transparent resize-none"
            required
          />
          <p className="text-b3 text-[#9E9E9E] mt-2">
            This reason will be recorded in the user&apos;s suspension history
          </p>
        </div>

        {/* Warning Message */}
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 text-orange-600 mt-0.5">
              <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h4 className="text-b2b text-orange-800 mb-1">Suspension Warning</h4>
              <p className="text-b3 text-orange-700">
                This action will temporarily restrict the user&apos;s access to the platform.
                The user will not be able to place orders during the suspension period.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            onClick={handleConfirm}
            disabled={!reason.trim() || isLoading}
            className="bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50"
          >
            {isLoading ? 'Suspending...' : `Suspend for ${duration === 'permanent' ? 'Permanent' : `${duration} days`}`}
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

export default SuspendUserModal;
