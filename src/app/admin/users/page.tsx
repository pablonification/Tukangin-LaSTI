'use client';

import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { DataTable } from '../../components/admin/DataTable';
import { FilterBar } from '../../components/admin/FilterBar';
import Button from '../../components/Button';
import UserDetailModal from '../../components/admin/UserDetailModal';
import SuspendUserModal from '../../components/admin/SuspendUserModal';
import ActivateUserModal from '../../components/admin/ActivateUserModal';
import UserOrdersModal from '../../components/admin/UserOrdersModal';
import ExportUsersModal from '../../components/admin/ExportUsersModal';
import BulkUserActionModal from '../../components/admin/BulkUserActionModal';
import { useModal } from '../../components/ModalProvider';
import { useNotification } from '@/app/components/NotificationProvider';

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

const statusColors = {
  Active: 'bg-green-50 text-green-700 border border-green-200',
  Suspended: 'bg-red-50 text-red-700 border border-red-200',
  Blocked: 'bg-gray-50 text-gray-700 border border-gray-200',
};

// Modal IDs
const MODAL_IDS = {
  USER_DETAIL: 'user-detail',
  SUSPEND_USER: 'suspend-user',
  ACTIVATE_USER: 'activate-user',
  USER_ORDERS: 'user-orders',
  EXPORT_USERS: 'export-users',
  BULK_ACTION: 'bulk-action',
} as const;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    joinDate: 'all',
    orderCount: 'all',
  });
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/admin/users');
        if (!res.ok) throw new Error('Failed to fetch users');

        const data: User[] = await res.json();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);
  const { openModal, closeModal, isModalOpen } = useModal();
  const { showSuccess, showError } = useNotification();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [bulkAction, setBulkAction] = useState<
    'suspend' | 'activate' | 'notify'
  >('suspend');

  const handleFilterChange = (filterKey: string, value: string) => {
    setFilters((prev) => ({ ...prev, [filterKey]: value }));
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      searchValue === '' ||
      user.id.toLowerCase().includes(searchValue.toLowerCase()) ||
      user.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      user.email.toLowerCase().includes(searchValue.toLowerCase()) ||
      user.phone.includes(searchValue);

    const matchesStatus =
      filters.status === 'all' || user.status === filters.status;

    return matchesSearch && matchesStatus;
  });

  const filterOptions = {
    status: {
      label: 'Status',
      options: [
        { value: 'all', label: 'All Status' },
        { value: 'Active', label: 'Active' },
        { value: 'Suspended', label: 'Suspended' },
        { value: 'Blocked', label: 'Blocked' },
      ],
      value: filters.status,
      onChange: (value: string) => handleFilterChange('status', value),
    },
  };

  const usersColumns = [
    {
      key: 'select',
      label: (
        <input
          type='checkbox'
          checked={
            selectedUsers.length === filteredUsers.length &&
            filteredUsers.length > 0
          }
          onChange={(e) => handleSelectAll(e.target.checked)}
          onClick={(e) => e.stopPropagation()}
          className='w-4 h-4 text-[#0082C9] border-[#D4D4D4] rounded focus:ring-[#0082C9]'
        />
      ),
      render: (_: string, row: User) => (
        <input
          type='checkbox'
          checked={selectedUsers.some((user) => user.id === row.id)}
          onChange={(e) => handleSelectUser(row, e.target.checked)}
          onClick={(e) => e.stopPropagation()}
          className='w-4 h-4 text-[#0082C9] border-[#D4D4D4] rounded focus:ring-[#0082C9]'
        />
      ),
    },
    { key: 'id', label: 'User ID' },
    {
      key: 'name',
      label: 'User',
      render: (name: string, row: User) => (
        <div className='flex items-center'>
          <div className='w-10 h-10 bg-[#E0F1FE] rounded-full flex items-center justify-center mr-3'>
            <span className='text-b2b text-[#0082C9] font-medium'>
              {name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()}
            </span>
          </div>
          <div>
            <div className='text-b2m text-[#141414]'>{name}</div>
            <div className='text-b3 text-[#9E9E9E]'>{row.email}</div>
          </div>
        </div>
      ),
    },
    { key: 'phone', label: 'Phone' },
    { key: 'location', label: 'Location' },
    {
      key: 'status',
      label: 'Status',
      render: (status: string) => (
        <span
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${statusColors[status as keyof typeof statusColors] || 'bg-gray-50 text-gray-700 border border-gray-200'}`}
        >
          {status}
        </span>
      ),
    },
    { key: 'totalOrders', label: 'Total Orders' },
    { key: 'totalSpent', label: 'Total Spent' },
    {
      key: 'rating',
      label: 'Rating',
      render: (rating: number) => (
        <div className='flex items-center'>
          <span className='text-yellow-500 mr-1'>★</span>
          <span className='text-b2m'>{rating.toFixed(1)}</span>
        </div>
      ),
    },
    { key: 'joinDate', label: 'Join Date' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: string, row: User) => (
        <div className='flex space-x-2'>
          <button
            onClick={() => handleViewUser(row)}
            className='px-3 py-1 bg-[#0082C9] text-white text-xs rounded hover:bg-[#0066A3]'
          >
            View
          </button>
          {row.status === 'Active' ? (
            <button
              onClick={() => handleSuspendUser(row)}
              className='px-3 py-1 bg-orange-600 text-white text-xs rounded hover:bg-orange-700'
            >
              Suspend
            </button>
          ) : (
            <button
              onClick={() => handleActivateUser(row)}
              className='px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700'
            >
              Activate
            </button>
          )}
          <button
            onClick={() => handleViewOrders(row)}
            className='px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700'
          >
            Orders
          </button>
        </div>
      ),
    },
  ];

  // Bulk selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(filteredUsers);
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (user: User, checked: boolean) => {
    if (checked) {
      setSelectedUsers((prev) => [...prev, user]);
    } else {
      setSelectedUsers((prev) => prev.filter((u) => u.id !== user.id));
    }
  };

  const handleBulkAction = (action: 'suspend' | 'activate' | 'notify') => {
    if (selectedUsers.length === 0) return;
    setBulkAction(action);
    openModal(MODAL_IDS.BULK_ACTION);
  };

  // Modal handlers
  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    openModal(MODAL_IDS.USER_DETAIL);
  };

  const handleSuspendUser = (user: User) => {
    setSelectedUser(user);
    openModal(MODAL_IDS.SUSPEND_USER);
  };

  const handleActivateUser = (user: User) => {
    setSelectedUser(user);
    openModal(MODAL_IDS.ACTIVATE_USER);
  };

  const handleViewOrders = (user: User) => {
    setSelectedUser(user);
    openModal(MODAL_IDS.USER_ORDERS);
  };

  const handleExportUsers = () => {
    openModal(MODAL_IDS.EXPORT_USERS);
  };

  // Modal action handlers
  const handleSuspendConfirm = async (
    userId: string,
    reason: string,
    duration?: string,
  ) => {
    try {
      console.log(
        'Suspending user:',
        userId,
        'Reason:',
        reason,
        'Duration:',
        duration,
      );
      // TODO: Implement API call to suspend user
      showSuccess(`User ${userId} suspended successfully!`, 'User Suspended');
    } catch (error) {
      console.error('Error suspending user:', error);
      showError(
        'Failed to suspend user. Please try again.',
        'Suspension Failed',
      );
    }
  };

  const handleActivateConfirm = async (userId: string, reason: string) => {
    try {
      console.log('Activating user:', userId, 'Reason:', reason);
      // TODO: Implement API call to activate user
      showSuccess(`User ${userId} activated successfully!`, 'User Activated');
    } catch (error) {
      console.error('Error activating user:', error);
      showError(
        'Failed to activate user. Please try again.',
        'Activation Failed',
      );
    }
  };

  const handleExportConfirm = async (format: string, filters: string[]) => {
    try {
      console.log('Exporting users with format:', format, 'Filters:', filters);
      // TODO: Implement API call to export users
      showSuccess(
        `Users exported successfully as ${format.toUpperCase()}!`,
        'Export Complete',
      );
    } catch (error) {
      console.error('Error exporting users:', error);
      showError('Failed to export users. Please try again.', 'Export Failed');
    }
  };

  const handleBulkActionConfirm = async (
    userIds: string[],
    action: string,
    options?: { reason?: string; duration?: string; message?: string },
  ) => {
    try {
      console.log(`Bulk ${action} for users:`, userIds, 'Options:', options);
      // TODO: Implement API call for bulk actions
      const actionText =
        action === 'suspend'
          ? 'suspended'
          : action === 'activate'
            ? 'activated'
            : 'notified';
      showSuccess(
        `${userIds.length} user${userIds.length > 1 ? 's' : ''} ${actionText} successfully!`,
        `Bulk ${action.charAt(0).toUpperCase() + action.slice(1)}`,
      );
      setSelectedUsers([]);
    } catch (error) {
      console.error(`Error performing bulk ${action}:`, error);
      showError(
        `Failed to ${action} users. Please try again.`,
        `Bulk ${action.charAt(0).toUpperCase() + action.slice(1)} Failed`,
      );
    }
  };

  // Modal close handlers
  const handleCloseModal = () => {
    closeModal();
    setSelectedUser(null);
  };

  const handleCloseBulkModal = () => {
    closeModal();
    // Don't clear selectedUsers here as user might want to perform another action
  };

  // User statistics
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === 'Active').length;
  const suspendedUsers = users.filter((u) => u.status === 'Suspended').length;
  const averageRating = (
    users.reduce((sum, user) => sum + user.rating, 0) / users.length
  ).toFixed(1);

  return (
    <AdminLayout>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
          <div>
            <h1 className='text-sh1b text-[#141414]'>User Management</h1>
            <p className='text-b2 text-[#9E9E9E]'>
              Manage and monitor all platform users
            </p>
          </div>
          <div>
            <Button
              onClick={handleExportUsers}
              size='lg'
              className='w-auto bg-[#0082C9] text-white hover:bg-[#0066A3]'
            >
              Export Users
            </Button>
          </div>
        </div>

        {/* User Statistics */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
          <div className='bg-white rounded-2xl p-6 border border-[#D4D4D4]'>
            <div className='text-b2 text-[#9E9E9E]'>Total Users</div>
            <div className='text-sh2b text-[#141414]'>{totalUsers}</div>
          </div>
          <div className='bg-white rounded-2xl p-6 border border-[#D4D4D4]'>
            <div className='text-b2 text-[#9E9E9E]'>Active Users</div>
            <div className='text-sh2b text-[#141414]'>{activeUsers}</div>
          </div>
          <div className='bg-white rounded-2xl p-6 border border-[#D4D4D4]'>
            <div className='text-b2 text-[#9E9E9E]'>Suspended Users</div>
            <div className='text-sh2b text-[#141414]'>{suspendedUsers}</div>
          </div>
          <div className='bg-white rounded-2xl p-6 border border-[#D4D4D4]'>
            <div className='text-b2 text-[#9E9E9E]'>Avg Rating</div>
            <div className='text-sh2b text-[#141414] flex items-center'>
              <span className='text-yellow-500 mr-1'>★</span>
              {averageRating}
            </div>
          </div>
        </div>

        {/* Filters */}
        <FilterBar
          filters={filterOptions}
          searchPlaceholder='Search users by ID, name, email, or phone...'
          searchValue={searchValue}
          onSearchChange={setSearchValue}
        />

        {/* Users Table */}
        <DataTable
          columns={usersColumns}
          data={filteredUsers}
          onRowClick={handleViewUser}
          emptyMessage={`No users found${searchValue ? ` matching "${searchValue}"` : ''}`}
        />

        {/* Bulk Actions */}
        <div className='bg-white rounded-2xl p-6 border border-[#D4D4D4]'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-sh2b text-[#141414]'>Bulk Actions</h2>
            {selectedUsers.length > 0 && (
              <div className='text-b2 text-[#0082C9] font-medium'>
                {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''}{' '}
                selected
              </div>
            )}
          </div>
          <div className='flex flex-wrap gap-4'>
            <Button
              onClick={() => handleBulkAction('suspend')}
              size='lg'
              disabled={selectedUsers.length === 0}
              className='w-auto bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              Suspend Selected (
              {selectedUsers.filter((u) => u.status === 'Active').length})
            </Button>
            <Button
              onClick={() => handleBulkAction('activate')}
              size='lg'
              disabled={selectedUsers.length === 0}
              className='w-auto bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              Activate Selected (
              {selectedUsers.filter((u) => u.status !== 'Active').length})
            </Button>
            <Button
              onClick={() => handleBulkAction('notify')}
              size='lg'
              disabled={selectedUsers.length === 0}
              className='w-auto bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              Send Notification ({selectedUsers.length})
            </Button>
          </div>
          {selectedUsers.length === 0 && (
            <p className='text-b3 text-[#9E9E9E] mt-3'>
              Select users from the table above to enable bulk actions
            </p>
          )}
        </div>
      </div>

      {/* Modals */}
      <UserDetailModal
        isOpen={isModalOpen(MODAL_IDS.USER_DETAIL)}
        onClose={handleCloseModal}
        user={selectedUser}
        onSuspend={handleSuspendUser}
        onActivate={handleActivateUser}
        onViewOrders={handleViewOrders}
      />

      <SuspendUserModal
        isOpen={isModalOpen(MODAL_IDS.SUSPEND_USER)}
        onClose={handleCloseModal}
        user={selectedUser}
        onConfirm={handleSuspendConfirm}
      />

      <ActivateUserModal
        isOpen={isModalOpen(MODAL_IDS.ACTIVATE_USER)}
        onClose={handleCloseModal}
        user={selectedUser}
        onConfirm={handleActivateConfirm}
      />

      <UserOrdersModal
        isOpen={isModalOpen(MODAL_IDS.USER_ORDERS)}
        onClose={handleCloseModal}
        user={selectedUser}
      />

      <ExportUsersModal
        isOpen={isModalOpen(MODAL_IDS.EXPORT_USERS)}
        onClose={handleCloseModal}
        onConfirm={handleExportConfirm}
      />

      <BulkUserActionModal
        isOpen={isModalOpen(MODAL_IDS.BULK_ACTION)}
        onClose={handleCloseBulkModal}
        selectedUsers={selectedUsers}
        action={bulkAction}
        onConfirm={handleBulkActionConfirm}
      />
    </AdminLayout>
  );
}
