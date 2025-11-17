import React, { useState } from 'react';
import Modal from '../Modal';
import Button from '../Button';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'tukang' | 'admin' | 'developer' | 'super_admin' | 'moderator';
  status: 'active' | 'inactive' | 'pending';
  phone?: string;
  specialization?: string[];
  rating?: number;
  totalJobs?: number;
  createdAt: string;
  lastLogin?: string;
}

interface DeactivateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onConfirm: (userId: string, action: 'activate' | 'deactivate', reason?: string) => void;
}

const DeactivateUserModal = ({ isOpen, onClose, user, onConfirm }: DeactivateUserModalProps) => {
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!user) return null;

  const isActivating = user.status === 'inactive';
  const action = isActivating ? 'activate' : 'deactivate';
  const actionText = isActivating ? 'Activate' : 'Deactivate';

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Call the actual confirm handler
      await onConfirm(user.id, action, reason);

      console.log(`User ${action}d successfully:`, { userId: user.id, reason });
      handleClose();
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  const roleColors = {
    super_admin: 'bg-red-50 text-red-700 border border-red-200',
    admin: 'bg-blue-50 text-blue-700 border border-blue-200',
    moderator: 'bg-orange-50 text-orange-700 border border-orange-200',
    developer: 'bg-green-50 text-green-700 border border-green-200',
    tukang: 'bg-purple-50 text-purple-700 border border-purple-200',
  };

  const statusColors = {
    active: 'bg-green-50 text-green-700 border border-green-200',
    inactive: 'bg-red-50 text-red-700 border border-red-200',
    pending: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`${actionText} Account - ${user.id}`} size="md">
      <div className="space-y-6">
        {/* Warning */}
        <div className={`border rounded-xl p-4 ${
          isActivating
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-start gap-3">
            <svg className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
              isActivating ? 'text-green-600' : 'text-red-600'
            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
                isActivating
                  ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  : "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              } />
            </svg>
            <div>
              <h4 className={`text-b2b mb-1 ${
                isActivating ? 'text-green-800' : 'text-red-800'
              }`}>
                {isActivating ? 'Activate Account' : 'Deactivate Account'}
              </h4>
              <p className={`text-b3 ${
                isActivating ? 'text-green-700' : 'text-red-700'
              }`}>
                {isActivating
                  ? 'This will restore the account and allow the user to log in again.'
                  : 'This will disable the account and prevent the user from logging in.'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-[#F5F9FC] rounded-xl p-4">
          <h3 className="text-sh2b text-[#141414] mb-3">Account Information</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-b3 text-[#9E9E9E]">Name:</span>
              <span className="text-b2 text-[#141414] font-medium">{user.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-b3 text-[#9E9E9E]">Email:</span>
              <span className="text-b2 text-[#141414] font-medium">{user.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-b3 text-[#9E9E9E]">Role:</span>
              <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                roleColors[user.role] || 'bg-gray-50 text-gray-700 border border-gray-200'
              }`}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1).replace('_', ' ')}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-b3 text-[#9E9E9E]">Current Status:</span>
              <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                statusColors[user.status] || 'bg-gray-50 text-gray-700 border border-gray-200'
              }`}>
                {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-b3 text-[#9E9E9E]">Account ID:</span>
              <span className="text-b2 text-[#141414] font-mono">{user.id}</span>
            </div>
          </div>
        </div>

        {/* Reason (Optional) */}
        <div>
          <label className="block text-b3 text-[#9E9E9E] mb-2">
            Reason <span className="text-gray-500">(Optional)</span>
          </label>
          <textarea
            placeholder={
              isActivating
                ? "Provide a reason for reactivating this account..."
                : "Provide a reason for deactivating this account..."
            }
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border border-[#D4D4D4] rounded-xl text-b2 focus:outline-none focus:ring-2 focus:ring-[#0082C9] focus:border-transparent resize-none"
          />
          <div className="text-b3 text-[#9E9E9E] mt-1">
            Characters: {reason.length}/200
          </div>
        </div>

        {/* Impact Notice */}
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="text-b2b text-orange-800 mb-1">Impact Notice</h4>
              <ul className="text-b3 text-orange-700 space-y-1">
                {isActivating ? (
                  <>
                    <li>• User will be able to log in immediately</li>
                    <li>• All previous permissions will be restored</li>
                    <li>• Account will appear in active user lists</li>
                  </>
                ) : (
                  <>
                    <li>• User will lose access to the platform immediately</li>
                    <li>• All active sessions will be terminated</li>
                    <li>• Account will be hidden from active user lists</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`${
              isActivating
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-red-600 text-white hover:bg-red-700'
            } disabled:opacity-50`}
          >
            {isLoading ? `${actionText}ing...` : `${actionText} Account`}
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

export default DeactivateUserModal;
