import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { Notification } from '@/app/components/NotificationProvider';

interface NotificationModalProps {
  notification: Notification;
  onClose: () => void;
  onAction?: () => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  notification,
  onClose,
  onAction,
}) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'info':
      default:
        return (
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-orange-50 border-orange-200';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getButtonColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-600 text-white hover:bg-green-700';
      case 'error':
        return 'bg-red-600 text-white hover:bg-red-700';
      case 'warning':
        return 'bg-orange-600 text-white hover:bg-orange-700';
      case 'info':
      default:
        return 'bg-blue-600 text-white hover:bg-blue-700';
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title=""
      size="sm"
      showCloseButton={false}
    >
      <div className="text-center">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className={`w-16 h-16 rounded-full ${getBackgroundColor(notification.type)} flex items-center justify-center`}>
            {getIcon(notification.type)}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-sh2b text-[#141414] mb-3">
          {notification.title}
        </h3>

        {/* Message */}
        <p className="text-b2 text-[#9E9E9E] mb-6 whitespace-pre-line">
          {notification.message}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {notification.action ? (
            <>
              <Button
                onClick={onAction}
                className={getButtonColor(notification.type)}
              >
                {notification.action.label}
              </Button>
              <Button
                onClick={onClose}
                variant="secondary"
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button
              onClick={onClose}
              className={getButtonColor(notification.type)}
            >
              OK
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default NotificationModal;
