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

interface BulkTukangActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTukang: Tukang[];
  action: 'suspend' | 'activate' | 'broadcast';
  onConfirm: (tukangIds: string[], action: string, options?: { reason?: string; duration?: string; message?: string }) => void;
}

const BulkTukangActionModal = ({
  isOpen,
  onClose,
  selectedTukang,
  action,
  onConfirm
}: BulkTukangActionModalProps) => {
  const [reason, setReason] = useState('');
  const [duration, setDuration] = useState('7');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen || selectedTukang.length === 0) return null;

  const handleConfirm = async () => {
    if (action === 'suspend' && !reason.trim()) return;
    if (action === 'broadcast' && !message.trim()) return;

    setIsLoading(true);
    try {
      const tukangIds = selectedTukang.map(tukang => tukang.id);
      const options = action === 'suspend'
        ? { reason, duration }
        : action === 'broadcast'
        ? { message }
        : {};

      await onConfirm(tukangIds, action, options);
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
        return `Suspend ${selectedTukang.length} Tukang${selectedTukang.length > 1 ? '' : ''}`;
      case 'activate':
        return `Activate ${selectedTukang.length} Tukang${selectedTukang.length > 1 ? '' : ''}`;
      case 'broadcast':
        return `Send Broadcast to ${selectedTukang.length} Tukang${selectedTukang.length > 1 ? '' : ''}`;
      default:
        return 'Bulk Action';
    }
  };

  const getModalDescription = () => {
    switch (action) {
      case 'suspend':
        return `You are about to suspend ${selectedTukang.length} tukang${selectedTukang.length > 1 ? '' : ''}. This action will temporarily restrict their access to receive new job requests.`;
      case 'activate':
        return `You are about to activate ${selectedTukang.length} tukang${selectedTukang.length > 1 ? '' : ''}. This will restore their access to receive job requests.`;
      case 'broadcast':
        return `You are about to send a broadcast message to ${selectedTukang.length} tukang${selectedTukang.length > 1 ? '' : ''}.`;
      default:
        return '';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={getModalTitle()} size="md">
      <div className="space-y-6">
        {/* Selected Tukang Summary */}
        <div className="bg-[#F5F9FC] rounded-xl p-4">
          <h3 className="text-sh2b text-[#141414] mb-3">Selected Tukang</h3>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {selectedTukang.map((tukang) => (
              <div key={tukang.id} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#E0F1FE] rounded-full flex items-center justify-center">
                    <span className="text-b3b text-[#0082C9] font-medium">
                      {tukang.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="text-b2m text-[#141414]">{tukang.name}</div>
                    <div className="text-b3 text-[#9E9E9E]">{tukang.email}</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    tukang.status === 'Active'
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {tukang.status}
                  </span>
                  {tukang.verified && (
                    <div className="text-xs text-green-600 mt-1">✓ Verified</div>
                  )}
                </div>
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
                <option value="7">7 days - Minor violation</option>
                <option value="30">30 days - Moderate violation</option>
                <option value="90">90 days - Serious violation</option>
                <option value="permanent">Permanent - Severe violation</option>
              </select>
            </div>

            {/* Suspension Reason */}
            <div>
              <label className="block text-b3 text-[#9E9E9E] mb-2">
                Reason for Suspension <span className="text-red-500">*</span>
              </label>
              <textarea
                placeholder="Please provide a reason for suspending these tukang..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-[#D4D4D4] rounded-xl text-b2 focus:outline-none focus:ring-2 focus:ring-[#0082C9] focus:border-transparent resize-none"
                required
              />
            </div>
          </>
        )}

        {action === 'broadcast' && (
          <div>
            <label className="block text-b3 text-[#9E9E9E] mb-2">
              Broadcast Message <span className="text-red-500">*</span>
            </label>
            <textarea
              placeholder="Enter the broadcast message to send to selected tukang..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-[#D4D4D4] rounded-xl text-b2 focus:outline-none focus:ring-2 focus:ring-[#0082C9] focus:border-transparent resize-none"
              required
            />
            <div className="text-b3 text-[#9E9E9E] mt-1">
              This message will be sent as both a push notification and in-app message.
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            onClick={handleConfirm}
            disabled={
              isLoading ||
              (action === 'suspend' && !reason.trim()) ||
              (action === 'broadcast' && !message.trim())
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
              : `${action === 'suspend' ? 'Suspend' : action === 'activate' ? 'Activate' : 'Send to'} ${selectedTukang.length} Tukang${selectedTukang.length > 1 ? '' : ''}`
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

export default BulkTukangActionModal;
