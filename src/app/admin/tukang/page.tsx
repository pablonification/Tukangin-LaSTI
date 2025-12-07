'use client';

import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { DataTable } from '../../components/admin/DataTable';
import { FilterBar } from '../../components/admin/FilterBar';
import { StatCard } from '../../components/admin/StatCard';
import Button from '../../components/Button';
import TukangDetailModal from '../../components/admin/TukangDetailModal';
import TukangJobsModal from '../../components/admin/TukangJobsModal';
import SuspendTukangModal from '../../components/admin/SuspendTukangModal';
import ActivateTukangModal from '../../components/admin/ActivateTukangModal';
import BroadcastTukangModal from '../../components/admin/BroadcastTukangModal';
import ExportTukangModal from '../../components/admin/ExportTukangModal';
import BulkTukangActionModal from '../../components/admin/BulkTukangActionModal';
import { useModal } from '../../components/ModalProvider';
import { useNotification } from '../../components/NotificationProvider';
import { JOB_CATEGORIES } from '@/lib/data';

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

// Mock data for tukang
const mockTukang = [
  {
    id: 'TKG-001',
    name: 'Ahmad Surya',
    phone: '+6281234567890',
    email: 'ahmad.surya@example.com',
    specialization: ['Kelistrikan', 'AC'],
    location: 'Jakarta Pusat',
    joinDate: '2023-08-15',
    status: 'Active',
    rating: 4.8,
    totalJobs: 45,
    completedJobs: 42,
    earnings: 'Rp 15,200,000',
    responseTime: '15 min',
    profileImage: null,
    verified: true,
    lastActive: '2024-01-15 14:30',
  },
  {
    id: 'TKG-002',
    name: 'Budi Santoso',
    phone: '+6281234567891',
    email: 'budi.santoso@example.com',
    specialization: ['Perpipaan', 'Konstruksi'],
    location: 'Jakarta Barat',
    joinDate: '2023-09-20',
    status: 'Active',
    rating: 4.6,
    totalJobs: 38,
    completedJobs: 35,
    earnings: 'Rp 12,800,000',
    responseTime: '20 min',
    profileImage: null,
    verified: true,
    lastActive: '2024-01-15 10:15',
  },
  {
    id: 'TKG-003',
    name: 'Candra Wijaya',
    phone: '+6281234567892',
    email: 'candra.wijaya@example.com',
    specialization: ['Konstruksi', 'Cat'],
    location: 'Jakarta Selatan',
    joinDate: '2023-07-10',
    status: 'Active',
    rating: 4.9,
    totalJobs: 52,
    completedJobs: 50,
    earnings: 'Rp 18,500,000',
    responseTime: '12 min',
    profileImage: null,
    verified: true,
    lastActive: '2024-01-14 16:45',
  },
  {
    id: 'TKG-004',
    name: 'Dedi Kurniawan',
    phone: '+6281234567893',
    email: 'dedi.kurniawan@example.com',
    specialization: ['Atap', 'Konstruksi'],
    location: 'Jakarta Pusat',
    joinDate: '2023-11-05',
    status: 'Active',
    rating: 4.7,
    totalJobs: 28,
    completedJobs: 26,
    earnings: 'Rp 9,600,000',
    responseTime: '25 min',
    profileImage: null,
    verified: true,
    lastActive: '2024-01-13 11:20',
  },
  {
    id: 'TKG-005',
    name: 'Eva Lestari',
    phone: '+6281234567894',
    email: 'eva.lestari@example.com',
    specialization: ['Kelistrikan'],
    location: 'Jakarta Utara',
    joinDate: '2023-10-12',
    status: 'Inactive',
    rating: 4.4,
    totalJobs: 15,
    completedJobs: 13,
    earnings: 'Rp 5,200,000',
    responseTime: '30 min',
    profileImage: null,
    verified: true,
    lastActive: '2024-01-10 09:15',
  },
  {
    id: 'TKG-006',
    name: 'Fajar Rahman',
    phone: '+6281234567895',
    email: 'fajar.rahman@example.com',
    specialization: ['AC', 'Elektronik'],
    location: 'Jakarta Timur',
    joinDate: '2023-12-01',
    status: 'Active',
    rating: 4.5,
    totalJobs: 22,
    completedJobs: 20,
    earnings: 'Rp 7,800,000',
    responseTime: '18 min',
    profileImage: null,
    verified: false,
    lastActive: '2024-01-15 13:45',
  },
];

const statusColors = {
  Active: 'bg-green-50 text-green-700 border border-green-200',
  Inactive: 'bg-red-50 text-red-700 border border-red-200',
  Suspended: 'bg-orange-50 text-orange-700 border border-orange-200',
};

// Modal IDs
const MODAL_IDS = {
  TUKANG_DETAIL: 'tukang-detail',
  TUKANG_JOBS: 'tukang-jobs',
  SUSPEND_TUKANG: 'suspend-tukang',
  ACTIVATE_TUKANG: 'activate-tukang',
  BROADCAST_TUKANG: 'broadcast-tukang',
  EXPORT_TUKANG: 'export-tukang',
  BULK_ACTION: 'bulk-action',
} as const;

export default function AdminTukangPage() {
  const [searchValue, setSearchValue] = useState('');
  const [tukangs, setTukangs] = useState<Tukang[]>([]);
  const [filters, setFilters] = useState({
    status: 'all',
    specialization: 'all',
    rating: 'all',
    verified: 'all',
  });

  const { openModal, closeModal, isModalOpen } = useModal();
  const { showSuccess, showError } = useNotification();
  const [selectedTukang, setSelectedTukang] = useState<Tukang | null>(null);
  const [selectedTukangList, setSelectedTukangList] = useState<Tukang[]>([]);
  const [bulkAction, setBulkAction] = useState<
    'suspend' | 'activate' | 'broadcast'
  >('suspend');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/admin/tukang');
        if (!res.ok) throw new Error('Failed to fetch tukang');

        const data: Tukang[] = await res.json();
        setTukangs(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  const handleFilterChange = (filterKey: string, value: string) => {
    setFilters((prev) => ({ ...prev, [filterKey]: value }));
  };

  // Bulk selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTukangList(filteredTukang);
    } else {
      setSelectedTukangList([]);
    }
  };

  const handleSelectTukang = (tukang: Tukang, checked: boolean) => {
    if (checked) {
      setSelectedTukangList((prev) => [...prev, tukang]);
    } else {
      setSelectedTukangList((prev) => prev.filter((t) => t.id !== tukang.id));
    }
  };

  const handleBulkAction = (action: 'suspend' | 'activate' | 'broadcast') => {
    if (selectedTukangList.length === 0) return;
    setBulkAction(action);
    openModal(MODAL_IDS.BULK_ACTION);
  };

  const filteredTukang = tukangs.filter((tukang) => {
    const matchesSearch =
      searchValue === '' ||
      tukang.id.toLowerCase().includes(searchValue.toLowerCase()) ||
      tukang.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      tukang.email.toLowerCase().includes(searchValue.toLowerCase()) ||
      tukang.phone.includes(searchValue) ||
      tukang.specialization.some((spec) =>
        spec.toLowerCase().includes(searchValue.toLowerCase()),
      );

    const matchesStatus =
      filters.status === 'all' || tukang.status === filters.status;
    const matchesSpecialization =
      filters.specialization === 'all' ||
      tukang.specialization.includes(filters.specialization);
    const matchesVerified =
      filters.verified === 'all' ||
      (filters.verified === 'verified' && tukang.verified) ||
      (filters.verified === 'unverified' && !tukang.verified);

    let matchesRating = true;
    if (filters.rating !== 'all') {
      const rating = parseFloat(filters.rating);
      if (filters.rating.includes('+')) {
        matchesRating = tukang.rating >= rating;
      } else {
        matchesRating = Math.floor(tukang.rating) === rating;
      }
    }

    return (
      matchesSearch &&
      matchesStatus &&
      matchesSpecialization &&
      matchesVerified &&
      matchesRating
    );
  });

  const filterOptions = {
    status: {
      label: 'Status',
      options: [
        { value: 'all', label: 'All Status' },
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' },
        { value: 'Suspended', label: 'Suspended' },
      ],
      value: filters.status,
      onChange: (value: string) => handleFilterChange('status', value),
    },
    specialization: {
      label: 'Specialization',
      options: [
        { value: 'all', label: 'All Specializations' },
        ...JOB_CATEGORIES.map((cat) => ({ value: cat, label: cat })),
      ],
      value: filters.specialization,
      onChange: (value: string) => handleFilterChange('specialization', value),
    },
    verified: {
      label: 'Verification',
      options: [
        { value: 'all', label: 'All' },
        { value: 'verified', label: 'Verified' },
        { value: 'unverified', label: 'Unverified' },
      ],
      value: filters.verified,
      onChange: (value: string) => handleFilterChange('verified', value),
    },
  };

  const tukangColumns = [
    {
      key: 'select',
      label: (
        <input
          type='checkbox'
          checked={
            selectedTukangList.length === filteredTukang.length &&
            filteredTukang.length > 0
          }
          onChange={(e) => handleSelectAll(e.target.checked)}
          onClick={(e) => e.stopPropagation()}
          className='w-4 h-4 text-[#0082C9] border-[#D4D4D4] rounded focus:ring-[#0082C9]'
        />
      ),
      render: (_: string, row: Tukang) => (
        <input
          type='checkbox'
          checked={selectedTukangList.some((tukang) => tukang.id === row.id)}
          onChange={(e) => handleSelectTukang(row, e.target.checked)}
          onClick={(e) => e.stopPropagation()}
          className='w-4 h-4 text-[#0082C9] border-[#D4D4D4] rounded focus:ring-[#0082C9]'
        />
      ),
    },
    { key: 'id', label: 'Tukang ID' },
    {
      key: 'name',
      label: 'Tukang',
      render: (name: string, row: Tukang) => (
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
            <div className='text-b2m text-[#141414] flex items-center'>
              {name}
              {row.verified && (
                <span className='ml-1 px-1 bg-green-50 text-green-700 border border-green-200 text-[10px] rounded-lg'>
                  ✓ Verified
                </span>
              )}
            </div>
            <div className='text-b3 text-[#9E9E9E]'>{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'specialization',
      label: 'Specialization',
      render: (specialization = ['wow']) => (
        <div className='flex flex-wrap gap-1'>
          {specialization.map((spec, index) => (
            <span
              key={index}
              className='px-2 py-1 bg-[#F5F9FC] text-[#0082C9] text-xs rounded'
            >
              {spec}
            </span>
          ))}
        </div>
      ),
    },
    { key: 'location', label: 'Location' },
    {
      key: 'status',
      label: 'Status',
      render: (status: string) => (
        <span
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
            statusColors[status as keyof typeof statusColors] ||
            'bg-gray-50 text-gray-700 border border-gray-200'
          }`}
        >
          {status}
        </span>
      ),
    },
    {
      key: 'rating',
      label: 'Rating',
      render: (rating: number) => (
        <div className='flex items-center'>
          <span className='text-yellow-500 mr-1'>★</span>
          <span className='text-b2m'>{rating}</span>
        </div>
      ),
    },
    { key: 'totalJobs', label: 'Total Jobs' },
    { key: 'earnings', label: 'Earnings' },
    { key: 'responseTime', label: 'Response Time' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: string, row: Tukang) => (
        <div className='flex space-x-2'>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewTukang(row);
            }}
            className='px-3 py-1 bg-[#0082C9] text-white text-xs rounded hover:bg-[#0066A3]'
          >
            View
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewJobs(row);
            }}
            className='px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700'
          >
            Jobs
          </button>
          {row.status === 'Active' ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSuspendTukang(row);
              }}
              className='px-3 py-1 bg-orange-600 text-white text-xs rounded hover:bg-orange-700'
            >
              Suspend
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleActivateTukang(row);
              }}
              className='px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700'
            >
              Activate
            </button>
          )}
        </div>
      ),
    },
  ];

  // Modal handlers
  const handleViewTukang = (tukang: Tukang) => {
    setSelectedTukang(tukang);
    openModal(MODAL_IDS.TUKANG_DETAIL);
  };

  const handleViewJobs = (tukang: Tukang) => {
    setSelectedTukang(tukang);
    openModal(MODAL_IDS.TUKANG_JOBS);
  };

  const handleSuspendTukang = (tukang: Tukang) => {
    setSelectedTukang(tukang);
    openModal(MODAL_IDS.SUSPEND_TUKANG);
  };

  const handleActivateTukang = (tukang: Tukang) => {
    setSelectedTukang(tukang);
    openModal(MODAL_IDS.ACTIVATE_TUKANG);
  };

  const handleExportTukang = () => {
    openModal(MODAL_IDS.EXPORT_TUKANG);
  };

  const handleBroadcastToTukang = () => {
    openModal(MODAL_IDS.BROADCAST_TUKANG);
  };

  // Modal action handlers
  const handleSuspendConfirm = async (
    tukangId: string,
    reason: string,
    duration: string,
  ) => {
    try {
      console.log(
        'Suspending tukang:',
        tukangId,
        'Reason:',
        reason,
        'Duration:',
        duration,
      );
      // TODO: Implement API call to suspend tukang
      showSuccess(
        `Tukang ${tukangId} suspended successfully!`,
        'Tukang Suspended',
      );
    } catch (error) {
      console.error('Error suspending tukang:', error);
      showError(
        'Failed to suspend tukang. Please try again.',
        'Suspension Failed',
      );
    }
  };

  const handleActivateConfirm = async (tukangId: string, reason: string) => {
    try {
      console.log('Activating tukang:', tukangId, 'Reason:', reason);
      // TODO: Implement API call to activate tukang
      showSuccess(
        `Tukang ${tukangId} activated successfully!`,
        'Tukang Activated',
      );
    } catch (error) {
      console.error('Error activating tukang:', error);
      showError(
        'Failed to activate tukang. Please try again.',
        'Activation Failed',
      );
    }
  };

  const handleBroadcastConfirm = async (
    message: string,
    targetAudience: string,
  ) => {
    try {
      console.log('Broadcasting message:', message, 'to:', targetAudience);
      // TODO: Implement API call to broadcast message
      showSuccess(
        `Message broadcasted to ${targetAudience} tukang successfully!`,
        'Message Broadcasted',
      );
    } catch (error) {
      console.error('Error broadcasting message:', error);
      showError(
        'Failed to broadcast message. Please try again.',
        'Broadcast Failed',
      );
    }
  };

  const handleExportConfirm = async (format: string, filters: string[]) => {
    try {
      console.log(
        'Exporting tukang data with format:',
        format,
        'filters:',
        filters,
      );
      // TODO: Implement API call to export tukang data
      showSuccess(
        `Tukang data exported successfully as ${format.toUpperCase()}!`,
        'Export Complete',
      );
    } catch (error) {
      console.error('Error exporting tukang data:', error);
      showError(
        'Failed to export tukang data. Please try again.',
        'Export Failed',
      );
    }
  };

  const handleBulkActionConfirm = async (
    tukangIds: string[],
    action: string,
    options?: { reason?: string; duration?: string; message?: string },
  ) => {
    try {
      console.log(`Bulk ${action} for tukang:`, tukangIds, 'Options:', options);
      // TODO: Implement API call for bulk actions
      const actionText =
        action === 'suspend'
          ? 'suspended'
          : action === 'activate'
            ? 'activated'
            : 'notified';
      showSuccess(
        `${tukangIds.length} tukang${tukangIds.length > 1 ? '' : ''} ${actionText} successfully!`,
        `Bulk ${action.charAt(0).toUpperCase() + action.slice(1)}`,
      );
      setSelectedTukangList([]);
    } catch (error) {
      console.error(`Error performing bulk ${action}:`, error);
      showError(
        `Failed to ${action} tukang. Please try again.`,
        `Bulk ${action.charAt(0).toUpperCase() + action.slice(1)} Failed`,
      );
    }
  };

  // Modal close handlers
  const handleCloseModal = () => {
    closeModal();
    setSelectedTukang(null);
  };

  const handleCloseBulkModal = () => {
    closeModal();
    // Don't clear selectedTukangList here as user might want to perform another action
  };

  // Tukang statistics
  const totalTukang = mockTukang.length;
  const activeTukang = mockTukang.filter((t) => t.status === 'Active').length;
  const verifiedTukang = mockTukang.filter((t) => t.verified).length;
  const averageRating = (
    mockTukang.reduce((sum, tukang) => sum + tukang.rating, 0) /
    mockTukang.length
  ).toFixed(1);
  const totalEarnings = mockTukang.reduce((sum, tukang) => {
    const earnings = parseInt(tukang.earnings.replace(/[^0-9]/g, ''));
    return sum + earnings;
  }, 0);

  return (
    <AdminLayout>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
          <div>
            <h1 className='text-sh1b text-[#141414]'>Tukang Management</h1>
            <p className='text-b2 text-[#9E9E9E]'>
              Manage and monitor all platform tukang
            </p>
          </div>
          <div className='flex gap-4'>
            <Button
              onClick={handleBroadcastToTukang}
              size='custom'
              variant='custom'
              className='w-auto bg-[#0082C9] text-white hover:bg-[#0066A3]'
            >
              Broadcast Message
            </Button>
            <Button
              onClick={handleExportTukang}
              size='lg'
              variant='custom'
              className='w-auto bg-gray-600 text-white hover:bg-gray-700'
            >
              Export Data
            </Button>
          </div>
        </div>

        {/* Tukang Statistics */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6'>
          <StatCard
            title='Total Tukang'
            value={totalTukang.toString()}
            icon={
              <svg
                className='w-8 h-8'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={1.5}
                  d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
                />
              </svg>
            }
          />
          <StatCard
            title='Active Tukang'
            value={activeTukang.toString()}
            change={`${((activeTukang / totalTukang) * 100).toFixed(
              1,
            )}% of total`}
            changeType='neutral'
            icon={
              <svg
                className='w-6 h-6'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
            }
          />
          <StatCard
            title='Verified Tukang'
            value={verifiedTukang.toString()}
            change={`${((verifiedTukang / totalTukang) * 100).toFixed(
              1,
            )}% verified`}
            changeType='neutral'
            icon={
              <svg
                className='w-6 h-6'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
            }
          />
          <StatCard
            title='Avg Rating'
            value={averageRating}
            icon={
              <svg
                className='w-6 h-6'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z'
                />
              </svg>
            }
          />
          <StatCard
            title='Total Earnings'
            value={`Rp ${(totalEarnings / 1000000).toFixed(1)}M`}
            icon={
              <svg
                className='w-6 h-6'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
            }
          />
        </div>

        {/* Filters */}
        <FilterBar
          filters={filterOptions}
          searchPlaceholder='Search tukang by ID, name, email, phone, or specialization...'
          searchValue={searchValue}
          onSearchChange={setSearchValue}
        />

        {/* Tukang Table */}
        <DataTable
          columns={tukangColumns}
          data={filteredTukang}
          onRowClick={handleViewTukang}
          emptyMessage={`No tukang found${
            searchValue ? ` matching "${searchValue}"` : ''
          }`}
        />

        {/* Bulk Actions */}
        <div className='bg-white rounded-2xl p-6 border border-[#D4D4D4]'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-sh2b text-[#141414]'>Bulk Actions</h2>
            {selectedTukangList.length > 0 && (
              <div className='text-b2 text-[#0082C9] font-medium'>
                {selectedTukangList.length} tukang
                {selectedTukangList.length > 1 ? '' : ''} selected
              </div>
            )}
          </div>
          <div className='flex flex-wrap gap-4'>
            <Button
              onClick={() => handleBulkAction('suspend')}
              size='lg'
              disabled={selectedTukangList.length === 0}
              className='w-auto bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              Suspend Selected (
              {selectedTukangList.filter((t) => t.status === 'Active').length})
            </Button>
            <Button
              onClick={() => handleBulkAction('activate')}
              size='lg'
              disabled={selectedTukangList.length === 0}
              className='w-auto bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              Activate Selected (
              {selectedTukangList.filter((t) => t.status !== 'Active').length})
            </Button>
            <Button
              onClick={() => handleBulkAction('broadcast')}
              size='lg'
              disabled={selectedTukangList.length === 0}
              className='w-auto bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              Send Broadcast ({selectedTukangList.length})
            </Button>
          </div>
          {selectedTukangList.length === 0 && (
            <p className='text-b3 text-[#9E9E9E] mt-3'>
              Select tukang from the table above to enable bulk actions
            </p>
          )}
        </div>

        {/* Performance Insights */}
        <div className='bg-white rounded-2xl border border-[#D4D4D4] p-6'>
          <h2 className='text-sh2b text-[#141414] mb-6'>
            Performance Insights
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div>
              <h3 className='text-b1m text-[#141414] mb-3'>Top Performers</h3>
              <div className='space-y-2'>
                {mockTukang
                  .sort((a, b) => b.rating - a.rating)
                  .slice(0, 3)
                  .map((tukang, index) => (
                    <div
                      key={tukang.id}
                      className='flex items-center justify-between'
                    >
                      <div className='flex items-center'>
                        <span className='text-b3 text-[#9E9E9E] mr-3'>
                          #{index + 1}
                        </span>
                        <span className='text-b2m text-[#141414]'>
                          {tukang.name}
                        </span>
                      </div>
                      <div className='flex items-center'>
                        <span className='text-yellow-500 mr-1'>★</span>
                        <span className='text-b2m'>
                          {tukang.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div>
              <h3 className='text-b1m text-[#141414] mb-3'>Most Active</h3>
              <div className='space-y-2'>
                {mockTukang
                  .sort((a, b) => b.totalJobs - a.totalJobs)
                  .slice(0, 3)
                  .map((tukang, index) => (
                    <div
                      key={tukang.id}
                      className='flex items-center justify-between'
                    >
                      <div className='flex items-center'>
                        <span className='text-b3 text-[#9E9E9E] mr-3'>
                          #{index + 1}
                        </span>
                        <span className='text-b2m text-[#141414]'>
                          {tukang.name}
                        </span>
                      </div>
                      <span className='text-b2m text-[#0082C9]'>
                        {tukang.totalJobs} jobs
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            <div>
              <h3 className='text-b1m text-[#141414] mb-3'>Highest Earners</h3>
              <div className='space-y-2'>
                {mockTukang
                  .sort((a, b) => {
                    const aEarnings = parseInt(
                      a.earnings.replace(/[^0-9]/g, ''),
                    );
                    const bEarnings = parseInt(
                      b.earnings.replace(/[^0-9]/g, ''),
                    );
                    return bEarnings - aEarnings;
                  })
                  .slice(0, 3)
                  .map((tukang, index) => (
                    <div
                      key={tukang.id}
                      className='flex items-center justify-between'
                    >
                      <div className='flex items-center'>
                        <span className='text-b3 text-[#9E9E9E] mr-3'>
                          #{index + 1}
                        </span>
                        <span className='text-b2m text-[#141414]'>
                          {tukang.name}
                        </span>
                      </div>
                      <span className='text-b2m text-[#0082C9]'>
                        {tukang.earnings}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        <TukangDetailModal
          isOpen={isModalOpen(MODAL_IDS.TUKANG_DETAIL)}
          onClose={handleCloseModal}
          tukang={selectedTukang}
          onSuspend={handleSuspendTukang}
          onActivate={handleActivateTukang}
          onViewJobs={handleViewJobs}
        />

        <TukangJobsModal
          isOpen={isModalOpen(MODAL_IDS.TUKANG_JOBS)}
          onClose={handleCloseModal}
          tukang={selectedTukang}
        />

        <SuspendTukangModal
          isOpen={isModalOpen(MODAL_IDS.SUSPEND_TUKANG)}
          onClose={handleCloseModal}
          tukang={selectedTukang}
          onConfirm={handleSuspendConfirm}
        />

        <ActivateTukangModal
          isOpen={isModalOpen(MODAL_IDS.ACTIVATE_TUKANG)}
          onClose={handleCloseModal}
          tukang={selectedTukang}
          onConfirm={handleActivateConfirm}
        />

        <BroadcastTukangModal
          isOpen={isModalOpen(MODAL_IDS.BROADCAST_TUKANG)}
          onClose={handleCloseModal}
          onConfirm={handleBroadcastConfirm}
        />

        <ExportTukangModal
          isOpen={isModalOpen(MODAL_IDS.EXPORT_TUKANG)}
          onClose={handleCloseModal}
          onConfirm={handleExportConfirm}
        />

        <BulkTukangActionModal
          isOpen={isModalOpen(MODAL_IDS.BULK_ACTION)}
          onClose={handleCloseBulkModal}
          selectedTukang={selectedTukangList}
          action={bulkAction}
          onConfirm={handleBulkActionConfirm}
        />
      </div>
    </AdminLayout>
  );
}
