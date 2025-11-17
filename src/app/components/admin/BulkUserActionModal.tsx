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

interface BulkUserActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUsers: User[];
  action: 'suspend' | 'activate' | 'notify';
  onConfirm: (userIds: string[], action: string, options?: { reason?: string; duration?: string; message?: string }) => void;
}

const BulkUserActionModal = ({
  isOpen,
  onClose,
  selectedUsers,
  action,
  onConfirm
}: BulkUserActionModalProps) => {
  const [reason, setReason] = useState('');
  const [duration, setDuration] = useState('7');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen || selectedUsers.length === 0) return null;

  const handleConfirm = async () => {
    if (action === 'suspend' && !reason.trim()) return;
    if (action === 'notify' && !message.trim()) return;

    setIsLoading(true);
    try {
      const userIds = selectedUsers.map(user => user.id);
      const options = action === 'suspend'
        ? { reason, duration }
        : action === 'notify'
        ? { message }
        : {};

      await onConfirm(userIds, action, options as { reason?: string; duration?: string; message?: string });
      onClose();
      setReason('');
      setDuration('7');
      setMessage('');
    } catch (error) {
      console.error(`Error performing bulk ${action}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setReason('');
    setDuration('7');
    setMessage('');
    onClose();
  };

  const getModalTitle = () => {
    switch (action) {
      case 'suspend':
        return `Suspend ${selectedUsers.length} User${selectedUsers.length > 1 ? 's' : ''}`;
      case 'activate':
        return `Activate ${selectedUsers.length} User${selectedUsers.length > 1 ? 's' : ''}`;
      case 'notify':
        return `Send Notification to ${selectedUsers.length} User${selectedUsers.length > 1 ? 's' : ''}`;
      default:
        return 'Bulk Action';
    }
  };

  const getModalDescription = () => {
    switch (action) {
      case 'suspend':
        return `You are about to suspend ${selectedUsers.length} user${selectedUsers.length > 1 ? 's' : ''}. This action will temporarily restrict their access to the platform.`;
      case 'activate':
        return `You are about to activate ${selectedUsers.length} user${selectedUsers.length > 1 ? 's' : ''}. This will restore their access to the platform.`;
      case 'notify':
        return `You are about to send a notification to ${selectedUsers.length} user${selectedUsers.length > 1 ? 's' : ''}.`;
      default:
        return '';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={getModalTitle()} size="md">
      <div className="space-y-6">
        {/* Selected Users Summary */}
        <div className="bg-[#F5F9FC] rounded-xl p-4">
          <h3 className="text-sh2b text-[#141414] mb-3">Selected Users</h3>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {selectedUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#E0F1FE] rounded-full flex items-center justify-center">
                    <span className="text-b3b text-[#0082C9] font-medium">
                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="text-b2m text-[#141414]">{user.name}</div>
                    <div className="text-b3 text-[#9E9E9E]">{user.email}</div>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  user.status === 'Active'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {user.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-b3 text-blue-700">
            {getModalDescription()}
          </p>
        </div>

        {/* Action-specific fields */}
        {action === 'suspend' && (
          <>
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
                <option value="7">7 days</option>
                <option value="30">30 days</option>
                <option value="90">90 days</option>
                <option value="permanent">Permanent</option>
              </select>
            </div>

            {/* Suspension Reason */}
            <div>
              <label className="block text-b3 text-[#9E9E9E] mb-2">
                Reason for Suspension <span className="text-red-500">*</span>
              </label>
              <textarea
                placeholder="Please provide a reason for suspending these users..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-[#D4D4D4] rounded-xl text-b2 focus:outline-none focus:ring-2 focus:ring-[#0082C9] focus:border-transparent resize-none"
                required
              />
            </div>
          </>
        )}

        {action === 'notify' && (
          <div>
            <label className="block text-b3 text-[#9E9E9E] mb-2">
              Notification Message <span className="text-red-500">*</span>
            </label>
            <textarea
              placeholder="Enter the notification message to send to selected users..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-[#D4D4D4] rounded-xl text-b2 focus:outline-none focus:ring-2 focus:ring-[#0082C9] focus:border-transparent resize-none"
              required
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            onClick={handleConfirm}
            disabled={
              isLoading ||
              (action === 'suspend' && !reason.trim()) ||
              (action === 'notify' && !message.trim())
            }
            className={
              action === 'suspend'
                ? 'bg-orange-600 text-white hover:bg-orange-700'
                : action === 'activate'
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }
          >
            {isLoading
              ? `${action === 'suspend' ? 'Suspending' : action === 'activate' ? 'Activating' : 'Sending'}...`
              : `${action === 'suspend' ? 'Suspend' : action === 'activate' ? 'Activate' : 'Send'} ${selectedUsers.length} User${selectedUsers.length > 1 ? 's' : ''}`
            }
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

export default BulkUserActionModal;
