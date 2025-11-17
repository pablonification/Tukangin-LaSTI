import React from 'react';
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

interface AccountDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

const AccountDetailModal = ({ isOpen, onClose, user }: AccountDetailModalProps) => {
  if (!user) return null;

  const statusColors = {
    active: 'bg-green-50 text-green-700 border border-green-200',
    inactive: 'bg-red-50 text-red-700 border border-red-200',
    pending: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  };

  const roleColors = {
    super_admin: 'bg-red-50 text-red-700 border border-red-200',
    admin: 'bg-blue-50 text-blue-700 border border-blue-200',
    moderator: 'bg-orange-50 text-orange-700 border border-orange-200',
    developer: 'bg-green-50 text-green-700 border border-green-200',
    tukang: 'bg-purple-50 text-purple-700 border border-purple-200',
  };

  const getTimeSinceCreated = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays < 1) return 'Today';
    if (diffInDays === 1) return '1 day ago';
    if (diffInDays < 30) return `${diffInDays} days ago`;

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths === 1) return '1 month ago';
    return `${diffInMonths} months ago`;
  };

  const getLastLoginStatus = (lastLogin?: string) => {
    if (!lastLogin) return { text: 'Never logged in', color: 'text-gray-500' };

    const login = new Date(lastLogin);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - login.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 24) return { text: `${diffInHours} hours ago`, color: 'text-green-600' };
    if (diffInHours < 24 * 7) return { text: `${Math.floor(diffInHours / 24)} days ago`, color: 'text-yellow-600' };
    return { text: `${Math.floor(diffInHours / 24 / 7)} weeks ago`, color: 'text-red-600' };
  };

  const lastLoginStatus = getLastLoginStatus(user.lastLogin);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Account Details - ${user.id}`} size="lg">
      <div className="space-y-6">
        {/* User Header */}
        <div className="bg-[#F5F9FC] rounded-xl p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-sh2b text-[#141414]">{user.name}</h2>
                <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                  roleColors[user.role] || 'bg-gray-50 text-gray-700 border border-gray-200'
                }`}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-[#9E9E9E]">
                <span>Account #{user.id}</span>
                <span>•</span>
                <span>Joined {getTimeSinceCreated(user.createdAt)}</span>
                {user.lastLogin && (
                  <>
                    <span>•</span>
                    <span className={lastLoginStatus.color}>Last login: {lastLoginStatus.text}</span>
                  </>
                )}
              </div>
            </div>
            <div className="text-right">
              <span className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                statusColors[user.status] || 'bg-gray-50 text-gray-700 border border-gray-200'
              }`}>
                {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-[#F5F9FC] rounded-xl p-4">
          <h3 className="text-sh2b text-[#141414] mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-b3 text-[#9E9E9E] mb-1">Email Address</label>
              <div className="text-b2 text-[#141414]">{user.email}</div>
            </div>
            <div>
              <label className="block text-b3 text-[#9E9E9E] mb-1">Phone Number</label>
              <div className="text-b2 text-[#141414]">{user.phone || 'Not provided'}</div>
            </div>
          </div>
        </div>

        {/* Role-specific Information */}
        {user.role === 'tukang' && (
          <div className="bg-[#F5F9FC] rounded-xl p-4">
            <h3 className="text-sh2b text-[#141414] mb-4">Tukang Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-b3 text-[#9E9E9E] mb-1">Specializations</label>
                <div className="flex flex-wrap gap-2">
                  {user.specialization && user.specialization.length > 0 ? (
                    user.specialization.map((spec, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {spec}
                      </span>
                    ))
                  ) : (
                    <span className="text-b3 text-[#9E9E9E]">No specializations set</span>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-b3 text-[#9E9E9E] mb-1">Performance</label>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500">★</span>
                    <span className="text-b2 text-[#141414]">
                      {user.rating?.toFixed(1) || 'No rating yet'}
                    </span>
                  </div>
                  <div className="text-b3 text-[#9E9E9E]">
                    {user.totalJobs || 0} jobs completed
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Account Information */}
        <div className="bg-[#F5F9FC] rounded-xl p-4">
          <h3 className="text-sh2b text-[#141414] mb-4">Account Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-b3 text-[#9E9E9E] mb-1">Account Created</label>
              <div className="text-b2 text-[#141414]">
                {new Date(user.createdAt).toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
            <div>
              <label className="block text-b3 text-[#9E9E9E] mb-1">Last Login</label>
              <div className={`text-b2 ${lastLoginStatus.color}`}>
                {user.lastLogin
                  ? new Date(user.lastLogin).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : 'Never logged in'
                }
              </div>
            </div>
          </div>
        </div>

        {/* Account Status */}
        <div className="bg-[#F5F9FC] rounded-xl p-4">
          <h3 className="text-sh2b text-[#141414] mb-4">Account Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-b3 text-[#9E9E9E]">Current Status:</span>
              <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                statusColors[user.status] || 'bg-gray-50 text-gray-700 border border-gray-200'
              }`}>
                {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-b3 text-[#9E9E9E]">Account Role:</span>
              <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                roleColors[user.role] || 'bg-gray-50 text-gray-700 border border-gray-200'
              }`}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-b3 text-[#9E9E9E]">Account ID:</span>
              <span className="text-b2 text-[#141414] font-mono">{user.id}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            onClick={() => {
              console.log('Edit user:', user);
              // TODO: Implement edit functionality
            }}
            className="bg-[#0082C9] text-white hover:bg-[#0066A3]"
          >
            Edit Account
          </Button>
          <Button
            onClick={() => {
              console.log('Toggle status:', user);
              // TODO: Implement status toggle
            }}
            variant="secondary"
            className={user.status === 'active' ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-green-600 text-white hover:bg-green-700'}
          >
            {user.status === 'active' ? 'Deactivate Account' : 'Activate Account'}
          </Button>
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

export default AccountDetailModal;
