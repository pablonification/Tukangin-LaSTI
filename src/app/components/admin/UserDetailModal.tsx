import React from 'react';
import Modal from '../Modal';
import Button from '../Button';
import { useModal } from '../ModalProvider';

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

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSuspend?: (user: User) => void;
  onActivate?: (user: User) => void;
  onViewOrders?: (user: User) => void;
}

// Modal IDs
const MODAL_IDS = {
  USER_DETAIL: 'user-detail',
  SUSPEND_USER: 'suspend-user',
  ACTIVATE_USER: 'activate-user',
  USER_ORDERS: 'user-orders',
} as const;

const statusColors = {
  'Active': 'bg-green-50 text-green-700 border border-green-200',
  'Suspended': 'bg-red-50 text-red-700 border border-red-200',
  'Blocked': 'bg-gray-50 text-gray-700 border border-gray-200'
};

const UserDetailModal = ({
  isOpen,
  onClose,
  user,
  onSuspend,
  onActivate,
  onViewOrders
}: UserDetailModalProps) => {
  const { openModal } = useModal();

  if (!user) return null;

  const handleSuspend = () => {
    if (onSuspend) {
      onSuspend(user);
    } else {
      openModal(MODAL_IDS.SUSPEND_USER);
    }
  };

  const handleActivate = () => {
    if (onActivate) {
      onActivate(user);
    } else {
      openModal(MODAL_IDS.ACTIVATE_USER);
    }
  };

  const handleViewOrders = () => {
    if (onViewOrders) {
      onViewOrders(user);
    } else {
      openModal(MODAL_IDS.USER_ORDERS);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`User Details - ${user.id}`} size="lg">
      <div className="space-y-6">
        {/* User Header */}
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-[#E0F1FE] rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-sh1b text-[#0082C9] font-medium">
              {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-sh1b text-[#141414]">{user.name}</h2>
              <span className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                statusColors[user.status as keyof typeof statusColors] ||
                'bg-gray-50 text-gray-700 border border-gray-200'
              }`}>
                {user.status}
              </span>
            </div>
            <p className="text-b2 text-[#9E9E9E]">{user.email}</p>
          </div>
        </div>

        {/* User Information */}
        <div className="bg-[#F5F9FC] rounded-xl p-4">
          <h3 className="text-sh2b text-[#141414] mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-b3 text-[#9E9E9E] mb-1">Phone</label>
              <div className="text-b2 text-[#141414]">{user.phone}</div>
            </div>
            <div>
              <label className="block text-b3 text-[#9E9E9E] mb-1">Location</label>
              <div className="text-b2 text-[#141414]">{user.location}</div>
            </div>
            <div>
              <label className="block text-b3 text-[#9E9E9E] mb-1">Join Date</label>
              <div className="text-b2 text-[#141414]">{user.joinDate}</div>
            </div>
            <div>
              <label className="block text-b3 text-[#9E9E9E] mb-1">Last Order</label>
              <div className="text-b2 text-[#141414]">{user.lastOrder}</div>
            </div>
          </div>
        </div>

        {/* Activity Statistics */}
        <div className="bg-[#F5F9FC] rounded-xl p-4">
          <h3 className="text-sh2b text-[#141414] mb-4">Activity Statistics</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-sh2b text-[#0082C9]">{user.totalOrders}</div>
              <div className="text-b3 text-[#9E9E9E]">Total Orders</div>
            </div>
            <div className="text-center">
              <div className="text-sh2b text-[#0082C9]">{user.totalSpent}</div>
              <div className="text-b3 text-[#9E9E9E]">Total Spent</div>
            </div>
            <div className="text-center">
              <div className="text-sh2b text-[#0082C9] flex items-center justify-center">
                <span className="text-yellow-500 mr-1">★</span>
                {user.rating.toFixed(1)}
              </div>
              <div className="text-b3 text-[#9E9E9E]">Rating</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            onClick={handleViewOrders}
            className="bg-[#0082C9] text-white hover:bg-[#0066A3]"
          >
            View Orders
          </Button>

          {user.status === 'Active' ? (
            <Button
              onClick={handleSuspend}
              className="bg-orange-600 text-white hover:bg-orange-700"
            >
              Suspend User
            </Button>
          ) : (
            <Button
              onClick={handleActivate}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              Activate User
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

export default UserDetailModal;
