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

interface ActivateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onConfirm: (userId: string, reason: string) => void;
}

const ActivateUserModal = ({
  isOpen,
  onClose,
  user,
  onConfirm
}: ActivateUserModalProps) => {
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!user) return null;

  const handleConfirm = async () => {
    if (!reason.trim()) return;

    setIsLoading(true);
    try {
      await onConfirm(user.id, reason);
      onClose();
      setReason('');
    } catch (error) {
      console.error('Error activating user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Activate User" size="md">
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
              <span className="text-b3 text-[#9E9E9E]">Current Status:</span>
              <span className="text-b2 text-red-600">{user.status}</span>
            </div>
          </div>
        </div>

        {/* Activation Reason */}
        <div>
          <label className="block text-b3 text-[#9E9E9E] mb-2">
            Reason for Activation <span className="text-red-500">*</span>
          </label>
          <textarea
            placeholder="Please provide a reason for reactivating this user&hellip;"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-[#D4D4D4] rounded-xl text-b2 focus:outline-none focus:ring-2 focus:ring-[#0082C9] focus:border-transparent resize-none"
            required
          />
          <p className="text-b3 text-[#9E9E9E] mt-2">
            This reason will be recorded in the user&apos;s activation history
          </p>
        </div>

        {/* Success Message */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 text-green-600 mt-0.5">
              <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="text-b2b text-green-800 mb-1">Ready to Activate</h4>
              <p className="text-b3 text-green-700">
                This action will restore the user&apos;s access to the platform.
                They will be able to place orders and use all platform features immediately.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            onClick={handleConfirm}
            disabled={!reason.trim() || isLoading}
            className="bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
          >
            {isLoading ? 'Activating...' : 'Activate User'}
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

export default ActivateUserModal;
