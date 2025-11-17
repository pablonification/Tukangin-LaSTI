'use client';

import React, { useState } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { DataTable } from '../../components/admin/DataTable';
import { FilterBar } from '../../components/admin/FilterBar';
import { StatCard } from '../../components/admin/StatCard';
import Button from '../../components/Button';
import { useModal } from '../../components/ModalProvider';
import { useNotification } from '@/app/components/NotificationProvider';
import AddTukangModal from '../../components/admin/AddTukangModal';
import AddAdminModal from '../../components/admin/AddAdminModal';
import ManageWhitelistModal from '../../components/admin/ManageWhitelistModal';
import AccountDetailModal from '../../components/admin/AccountDetailModal';
import EditUserModal from '../../components/admin/EditUserModal';
import DeactivateUserModal from '../../components/admin/DeactivateUserModal';

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

interface WhitelistedEmail {
  id: string;
  email: string;
  role: 'admin' | 'tukang' | 'developer' | 'super_admin' | 'moderator';
  addedBy: string;
  addedAt: string;
  isActive: boolean;
}

// Modal IDs
const MODAL_IDS = {
  ADD_TUKANG: 'add-tukang',
  ADD_ADMIN: 'add-admin',
  MANAGE_WHITELIST: 'manage-whitelist',
  USER_DETAIL: 'user-detail',
  EDIT_USER: 'edit-user',
  DEACTIVATE_USER: 'deactivate-user',
} as const;

export default function AdminAccountsPage() {
  const { openModal, closeModal, isModalOpen } = useModal();
  const { showSuccess, showError } = useNotification();
  const [searchValue, setSearchValue] = useState('');
  const [filters, setFilters] = useState({
    role: 'all',
    status: 'all',
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleFilterChange = (filterKey: string, value: string) => {
    setFilters((prev) => ({ ...prev, [filterKey]: value }));
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    openModal(MODAL_IDS.USER_DETAIL);
  };

  const handleAddTukang = () => {
    openModal(MODAL_IDS.ADD_TUKANG);
  };

  const handleAddAdmin = () => {
    openModal(MODAL_IDS.ADD_ADMIN);
  };

  const handleManageWhitelist = () => {
    openModal(MODAL_IDS.MANAGE_WHITELIST);
  };

  const handleCloseModal = () => {
    closeModal();
    setSelectedUser(null);
  };

  const handleAddTukangConfirm = async (tukangData: {
    name: string;
    email: string;
    phone: string;
    specialization: string[];
    address?: string;
    description?: string;
  }) => {
    try {
      // Generate new ID
      const newId = `TUK-${String(mockUsers.length + 1).padStart(3, '0')}`;

      // Create new tukang account
      const newTukang: User = {
        id: newId,
        name: tukangData.name,
        email: tukangData.email,
        role: 'tukang',
        status: 'pending',
        phone: tukangData.phone,
        specialization: tukangData.specialization,
        rating: 0,
        totalJobs: 0,
        createdAt: new Date().toISOString().split('T')[0],
        lastLogin: undefined,
      };

      // Add to users list
      setMockUsers(prev => [...prev, newTukang]);

      console.log('Tukang account created successfully:', newTukang);
      // TODO: Implement actual API call to backend

    } catch (error) {
      console.error('Error adding tukang:', error);
      throw error; // Re-throw to let modal handle the error
    }
  };

  const handleAddAdminConfirm = async (adminData: {
    name: string;
    email: string;
    phone: string;
    department?: string;
    role: 'super_admin' | 'admin' | 'moderator' | 'developer';
    permissions: string[];
  }) => {
    try {
      // Generate new ID based on role
      const rolePrefix = adminData.role === 'developer' ? 'DEV' : 'ADM';
      const newId = `${rolePrefix}-${String(mockUsers.filter(u => u.role === adminData.role).length + 1).padStart(3, '0')}`;

      // Create new admin account
      const newAdmin: User = {
        id: newId,
        name: adminData.name,
        email: adminData.email,
        role: adminData.role,
        status: 'pending',
        phone: adminData.phone,
        createdAt: new Date().toISOString().split('T')[0],
        lastLogin: undefined,
      };

      // Add to users list
      setMockUsers(prev => [...prev, newAdmin]);

      console.log('Admin/Developer account created successfully:', newAdmin);
      // TODO: Implement actual API call to backend

    } catch (error) {
      console.error('Error adding admin:', error);
      throw error; // Re-throw to let modal handle the error
    }
  };

  const handleWhitelistUpdate = async (emails: WhitelistedEmail[]) => {
    try {
      console.log('Whitelist updated successfully:', emails);
      // TODO: Implement actual API call to update whitelist in backend

      showSuccess('Whitelist updated successfully!', 'Whitelist Updated');
    } catch (error) {
      console.error('Error updating whitelist:', error);
      showError('Failed to update whitelist. Please try again.', 'Update Failed');
      throw error; // Re-throw to let modal handle the error
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    openModal(MODAL_IDS.EDIT_USER);
  };

  const handleToggleUserStatus = (user: User) => {
    setSelectedUser(user);
    openModal(MODAL_IDS.DEACTIVATE_USER);
  };

  const handleEditUserConfirm = async (userId: string, updates: Partial<User>) => {
    try {
      // Update the user in the mock data
      setMockUsers(prev => prev.map(user =>
        user.id === userId
          ? { ...user, ...updates }
          : user
      ));

      console.log('User updated successfully:', { userId, updates });
      // TODO: Implement actual API call to update user in backend

      showSuccess('User updated successfully!', 'User Updated');

    } catch (error) {
      console.error('Error updating user:', error);
      showError('Failed to update user. Please try again.', 'Update Failed');
      throw error; // Re-throw to let modal handle the error
    }
  };

  const handleToggleStatusConfirm = async (userId: string, action: 'activate' | 'deactivate', reason?: string) => {
    try {
      const newStatus = action === 'activate' ? 'active' : 'inactive';

      // Update the user status in the mock data
      setMockUsers(prev => prev.map(user =>
        user.id === userId
          ? { ...user, status: newStatus }
          : user
      ));

      console.log(`User ${action}d successfully:`, { userId, action, reason });
      // TODO: Implement actual API call to update user status in backend

      showSuccess(`User ${action}d successfully!`, `User ${action === 'activate' ? 'Activated' : 'Deactivated'}`);

    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
      showError(`Failed to ${action} user. Please try again.`, `${action.charAt(0).toUpperCase() + action.slice(1)} Failed`);
      throw error; // Re-throw to let modal handle the error
    }
  };

  // Mock data - replace with real API calls
  const [mockUsers, setMockUsers] = useState<User[]>([
    {
      id: 'TUK-001',
      name: 'Ahmad Surya',
      email: 'ahmad.surya@gmail.com',
      role: 'tukang',
      status: 'active',
      phone: '+6281234567890',
      specialization: ['AC Installation', 'AC Repair'],
      rating: 4.8,
      totalJobs: 45,
      createdAt: '2024-01-15',
      lastLogin: '2024-01-20 14:30',
    },
    {
      id: 'DEV-001',
      name: 'John Developer',
      email: 'john.dev@tukangin.com',
      role: 'developer',
      status: 'active',
      phone: '+6281234567893',
      createdAt: '2024-01-08',
      lastLogin: '2024-01-20 18:20',
    },
    {
      id: 'ADM-001',
      name: 'Admin User',
      email: 'admin@tukangin.com',
      role: 'admin',
      status: 'active',
      phone: '+6281234567891',
      createdAt: '2024-01-10',
      lastLogin: '2024-01-20 16:45',
    },
    {
      id: 'TUK-002',
      name: 'Budi Santoso',
      email: 'budi.santoso@gmail.com',
      role: 'tukang',
      status: 'active',
      phone: '+6281234567892',
      specialization: ['Plumbing', 'Electrical'],
      rating: 4.6,
      totalJobs: 32,
      createdAt: '2024-01-12',
      lastLogin: '2024-01-19 09:15',
    },
  ]);

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      searchValue === '' ||
      user.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      user.email.toLowerCase().includes(searchValue.toLowerCase()) ||
      user.id.toLowerCase().includes(searchValue.toLowerCase());

    const matchesRole = filters.role === 'all' || user.role === filters.role;
    const matchesStatus = filters.status === 'all' || user.status === filters.status;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const filterOptions = {
    role: {
      label: 'Role',
      options: [
        { value: 'all', label: 'All Roles' },
        { value: 'super_admin', label: 'Super Admin' },
        { value: 'admin', label: 'Admin' },
        { value: 'moderator', label: 'Moderator' },
        { value: 'developer', label: 'Developer' },
        { value: 'tukang', label: 'Tukang' },
      ],
      value: filters.role,
      onChange: (value: string) => handleFilterChange('role', value),
    },
    status: {
      label: 'Status',
      options: [
        { value: 'all', label: 'All Status' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'pending', label: 'Pending' },
      ],
      value: filters.status,
      onChange: (value: string) => handleFilterChange('status', value),
    },
  };

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

  const usersColumns = [
    { key: 'id', label: 'User ID' },
    {
      key: 'name',
      label: 'Name',
      render: (name: string, row: User) => (
        <div>
          <div className='text-b2m text-[#141414]'>{name}</div>
          <div className='text-b3 text-[#9E9E9E]'>{row.email}</div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      render: (role: string) => (
        <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
          roleColors[role as keyof typeof roleColors] ||
          'bg-gray-50 text-gray-700 border border-gray-200'
        }`}>
          {role.charAt(0).toUpperCase() + role.slice(1)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (status: string) => (
        <span className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
          statusColors[status as keyof typeof statusColors] ||
          'bg-gray-50 text-gray-700 border border-gray-200'
        }`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      ),
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (phone: string) => phone || '-',
    },
    {
      key: 'specialization',
      label: 'Specialization',
      render: (specialization: string[], row: User) => (
        row.role === 'tukang' ? (
          <div className='max-w-xs'>
            {specialization && specialization.length > 0 ? (
              <div className='flex flex-wrap gap-1'>
                {specialization.slice(0, 2).map((spec, index) => (
                  <span key={index} className='px-1.5 py-0.5 bg-gray-100 text-gray-700 text-xs rounded'>
                    {spec}
                  </span>
                ))}
                {specialization.length > 2 && (
                  <span className='px-1.5 py-0.5 bg-gray-100 text-gray-700 text-xs rounded'>
                    +{specialization.length - 2}
                  </span>
                )}
              </div>
            ) : (
              '-'
            )}
          </div>
        ) : (
          '-'
        )
      ),
    },
    {
      key: 'rating',
      label: 'Rating',
      render: (rating: number, row: User) => (
        row.role === 'tukang' ? (
          <div className='flex items-center'>
            <span className='text-yellow-500 mr-1'>★</span>
            <span className='text-b2 text-[#141414]'>{rating?.toFixed(1) || '-'}</span>
          </div>
        ) : (
          '-'
        )
      ),
    },
    { key: 'createdAt', label: 'Created' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: string, row: User) => (
        <div className='flex space-x-2'>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewUser(row);
            }}
            className='px-3 py-1 bg-[#0082C9] text-white text-xs rounded hover:bg-[#0066A3]'
          >
            View
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEditUser(row);
            }}
            className='px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700'
          >
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleUserStatus(row);
            }}
            className={`px-3 py-1 text-xs rounded ${
              row.status === 'active'
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {row.status === 'active' ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      ),
    },
  ];

  // Statistics
  const totalUsers = mockUsers.length;
  const activeUsers = mockUsers.filter(u => u.status === 'active').length;
  const totalTukang = mockUsers.filter(u => u.role === 'tukang').length;
  const totalAdmins = mockUsers.filter(u => u.role === 'admin' || u.role === 'super_admin').length;
  const totalDevelopers = mockUsers.filter(u => u.role === 'developer').length;
  const totalModerators = mockUsers.filter(u => u.role === 'moderator').length;

  return (
    <AdminLayout>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
          <div>
            <h1 className='text-sh1b text-[#141414]'>Account Management</h1>
            <p className='text-b2 text-[#9E9E9E]'>
              Manage tukang accounts, admin accounts, and Google login whitelist
            </p>
          </div>
          <div className='flex flex-col sm:flex-row gap-3'>
            <Button
              onClick={handleManageWhitelist}
              size="custom"
              className='w-auto py-1 px-4 bg-purple-600 text-white hover:bg-purple-700'
            >
              Manage Whitelist
            </Button>
            <Button
              onClick={handleAddAdmin}
              size="custom"
              variant="custom"
              className='w-auto py-1 px-4 bg-gray-600 text-white hover:bg-gray-700'
            >
              Add Admin
            </Button>
            <Button
              onClick={handleAddTukang}
              size="custom"
              className='w-auto py-1 px-4 bg-[#0082C9] text-white hover:bg-[#0066A3]'
            >
              Add Tukang
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6'>
          <StatCard
            title='Total Accounts'
            value={totalUsers.toString()}
            icon={
              <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z' />
              </svg>
            }
          />
          <StatCard
            title='Active Accounts'
            value={activeUsers.toString()}
            change={`${((activeUsers / totalUsers) * 100).toFixed(1)}% of total`}
            changeType='positive'
            icon={
              <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
              </svg>
            }
          />
          <StatCard
            title='Tukang Accounts'
            value={totalTukang.toString()}
            icon={
              <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 10V3L4 14h7v7l9-11h-7z' />
              </svg>
            }
          />
          <StatCard
            title='Admin Accounts'
            value={totalAdmins.toString()}
            icon={
              <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
              </svg>
            }
          />
          <StatCard
            title='Moderator Accounts'
            value={totalModerators.toString()}
            icon={
              <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
              </svg>
            }
          />
          <StatCard
            title='Developer Accounts'
            value={totalDevelopers.toString()}
            icon={
              <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' />
              </svg>
            }
          />
        </div>

        {/* Filters */}
        <FilterBar
          filters={filterOptions}
          searchPlaceholder='Search by name, email, or user ID...'
          searchValue={searchValue}
          onSearchChange={setSearchValue}
        />

        {/* Users Table */}
        <DataTable
          columns={usersColumns}
          data={filteredUsers}
          onRowClick={handleViewUser}
          emptyMessage={`No accounts found${
            searchValue ? ` matching "${searchValue}"` : ''
          }`}
        />
      </div>

      {/* Modals */}
      <AddTukangModal
        isOpen={isModalOpen(MODAL_IDS.ADD_TUKANG)}
        onClose={handleCloseModal}
        onConfirm={handleAddTukangConfirm}
      />

      <AddAdminModal
        isOpen={isModalOpen(MODAL_IDS.ADD_ADMIN)}
        onClose={handleCloseModal}
        onConfirm={handleAddAdminConfirm}
      />

      <ManageWhitelistModal
        isOpen={isModalOpen(MODAL_IDS.MANAGE_WHITELIST)}
        onClose={closeModal}
        onConfirm={handleWhitelistUpdate}
      />

      <AccountDetailModal
        isOpen={isModalOpen(MODAL_IDS.USER_DETAIL)}
        onClose={handleCloseModal}
        user={selectedUser}
      />

      <EditUserModal
        isOpen={isModalOpen(MODAL_IDS.EDIT_USER)}
        onClose={handleCloseModal}
        user={selectedUser}
        onConfirm={handleEditUserConfirm}
      />

      <DeactivateUserModal
        isOpen={isModalOpen(MODAL_IDS.DEACTIVATE_USER)}
        onClose={handleCloseModal}
        user={selectedUser}
        onConfirm={handleToggleStatusConfirm}
      />
    </AdminLayout>
  );
}
