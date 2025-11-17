import React, { useState } from 'react';
import Modal from '../Modal';
import Button from '../Button';

interface BroadcastTukangModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (message: string, targetAudience: string) => void;
}

const BroadcastTukangModal = ({
  isOpen,
  onClose,
  onConfirm
}: BroadcastTukangModalProps) => {
  const [message, setMessage] = useState('');
  const [targetAudience, setTargetAudience] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (!message.trim()) return;

    setIsLoading(true);
    try {
      await onConfirm(message, targetAudience);
      onClose();
      setMessage('');
      setTargetAudience('all');
    } catch (error) {
      console.error('Error sending broadcast:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setMessage('');
    setTargetAudience('all');
    onClose();
  };

  const getAudienceDescription = (audience: string) => {
    switch (audience) {
      case 'all':
        return 'All registered tukang';
      case 'active':
        return 'Only active tukang';
      case 'verified':
        return 'Only verified tukang';
      case 'inactive':
        return 'Only inactive tukang';
      default:
        return 'All registered tukang';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Broadcast Message to Tukang" size="lg">
      <div className="space-y-6">
        {/* Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <div>
              <h4 className="text-b2b text-blue-800 mb-1">Broadcast Message</h4>
              <p className="text-b3 text-blue-700">
                Send an important message to tukang. This will be delivered as a push notification
                and will also appear in their message inbox.
              </p>
            </div>
          </div>
        </div>

        {/* Target Audience */}
        <div>
          <label className="block text-b3 text-[#9E9E9E] mb-2">
            Target Audience <span className="text-red-500">*</span>
          </label>
          <select
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            className="w-full px-4 py-3 border border-[#D4D4D4] rounded-xl text-b2 focus:outline-none focus:ring-2 focus:ring-[#0082C9] focus:border-transparent"
          >
            <option value="all">All Tukang</option>
            <option value="active">Active Tukang Only</option>
            <option value="verified">Verified Tukang Only</option>
            <option value="inactive">Inactive Tukang Only</option>
          </select>
          <div className="text-b3 text-[#9E9E9E] mt-1">
            Will send to: {getAudienceDescription(targetAudience)}
          </div>
        </div>

        {/* Message Content */}
        <div>
          <label className="block text-b3 text-[#9E9E9E] mb-2">
            Message Content <span className="text-red-500">*</span>
          </label>
          <textarea
            placeholder="Enter your broadcast message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            className="w-full px-4 py-3 border border-[#D4D4D4] rounded-xl text-b2 focus:outline-none focus:ring-2 focus:ring-[#0082C9] focus:border-transparent resize-none"
            required
          />
          <div className="flex justify-between items-center mt-2">
            <div className="text-b3 text-[#9E9E9E]">
              Characters: {message.length}/500
            </div>
            {message.length > 500 && (
              <div className="text-b3 text-red-600">
                Message too long! Please keep under 500 characters.
              </div>
            )}
          </div>
        </div>

        {/* Message Preview */}
        <div className="bg-[#F5F9FC] rounded-xl p-4">
          <h4 className="text-b2b text-[#141414] mb-3">Message Preview</h4>
          <div className="bg-white border border-[#D4D4D4] rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-[#0082C9] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-medium">T</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-b2b text-[#141414]">Tukangin Admin</span>
                  <span className="text-b3 text-[#9E9E9E]">now</span>
                </div>
                <div className="text-b2 text-[#141414] whitespace-pre-wrap">
                  {message || 'Your message will appear here...'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            onClick={handleConfirm}
            disabled={isLoading || !message.trim() || message.length > 500}
            className="bg-[#0082C9] text-white hover:bg-[#0066A3] disabled:opacity-50"
          >
            {isLoading ? 'Sending...' : `Send Broadcast`}
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

export default BroadcastTukangModal;
