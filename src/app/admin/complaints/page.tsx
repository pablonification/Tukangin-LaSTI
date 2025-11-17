'use client';

import React, { useState } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { DataTable } from '../../components/admin/DataTable';
import { FilterBar } from '../../components/admin/FilterBar';
import { StatCard } from '../../components/admin/StatCard';
import Button from '../../components/Button';
import { useModal } from '../../components/ModalProvider';
import ComplaintDetailModal from '../../components/admin/ComplaintDetailModal';
import AssignComplaintModal from '../../components/admin/AssignComplaintModal';
import UpdateComplaintStatusModal from '../../components/admin/UpdateComplaintStatusModal';
import BulkResolveComplaintsModal from '../../components/admin/BulkResolveComplaintsModal';
import ExportComplaintsModal from '../../components/admin/ExportComplaintsModal';

interface Complaint {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orderId: string;
  tukangName: string;
  category: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  resolvedAt?: string;
  assignedTo?: string;
  response?: string;
  rating?: number;
  attachments: number;
}

// Mock data for complaints
const mockComplaints = [
  {
    id: 'CMP-001',
    customerName: 'John Doe',
    customerEmail: 'john.doe@example.com',
    customerPhone: '+6281234567890',
    orderId: 'ORD-001',
    tukangName: 'Ahmad Surya',
    category: 'Kualitas Pekerjaan',
    subject: 'Poor workmanship on AC installation',
    description: 'The AC installation was completed but the technician did not clean up properly and there are scratches on the wall. The AC is also making unusual noises.',
    status: 'Pending',
    priority: 'High',
    createdAt: '2024-01-15 10:30',
    assignedTo: 'Admin Support',
    attachments: 3,
  },
  {
    id: 'CMP-002',
    customerName: 'Jane Smith',
    customerEmail: 'jane.smith@example.com',
    customerPhone: '+6281234567891',
    orderId: 'ORD-002',
    tukangName: 'Budi Santoso',
    category: 'Waktu Tunggu',
    subject: 'Technician arrived 2 hours late',
    description: 'The technician was scheduled to arrive at 9 AM but showed up at 11 AM without any prior notice. This caused significant inconvenience.',
    status: 'Resolved',
    priority: 'Medium',
    createdAt: '2024-01-14 14:20',
    resolvedAt: '2024-01-14 16:45',
    assignedTo: 'Admin Support',
    response: 'We apologize for the inconvenience. The technician has been reminded about punctuality. We have credited your account with Rp 50,000 as compensation.',
    rating: 3,
    attachments: 1,
  },
  {
    id: 'CMP-003',
    customerName: 'Bob Johnson',
    customerEmail: 'bob.johnson@example.com',
    customerPhone: '+6281234567892',
    orderId: 'ORD-003',
    tukangName: 'Candra Wijaya',
    category: 'Komunikasi',
    subject: 'Poor communication from technician',
    description: 'The technician did not respond to calls or messages during the service. Had to contact support to get updates.',
    status: 'In Progress',
    priority: 'Medium',
    createdAt: '2024-01-13 09:15',
    assignedTo: 'Customer Service',
    attachments: 2,
  },
  {
    id: 'CMP-004',
    customerName: 'Alice Brown',
    customerEmail: 'alice.brown@example.com',
    customerPhone: '+6281234567893',
    orderId: 'ORD-004',
    tukangName: 'Dedi Kurniawan',
    category: 'Kualitas Pekerjaan',
    subject: 'Plumbing repair not completed properly',
    description: 'The plumber fixed the leak but the pipe started leaking again after 2 days. Water damage occurred to the floor.',
    status: 'Resolved',
    priority: 'High',
    createdAt: '2024-01-12 16:45',
    resolvedAt: '2024-01-13 11:30',
    assignedTo: 'Quality Control',
    response: 'We have sent a senior technician to fix the issue at no additional cost. The repair has been completed and tested. We apologize for the inconvenience.',
    rating: 4,
    attachments: 5,
  },
  {
    id: 'CMP-005',
    customerName: 'Charlie Wilson',
    customerEmail: 'charlie.wilson@example.com',
    customerPhone: '+6281234567894',
    orderId: 'ORD-005',
    tukangName: 'Eva Lestari',
    category: 'Lainnya',
    subject: 'Billing discrepancy',
    description: 'Charged extra Rp 100,000 for materials that were not used. Request refund for the overcharge.',
    status: 'Resolved',
    priority: 'Low',
    createdAt: '2024-01-10 11:20',
    resolvedAt: '2024-01-10 14:15',
    assignedTo: 'Billing Department',
    response: 'We have reviewed the invoice and confirmed the overcharge. Rp 100,000 has been refunded to your account. Thank you for bringing this to our attention.',
    rating: 5,
    attachments: 1,
  },
];

const statusColors = {
  Pending: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  'In Progress': 'bg-blue-50 text-blue-700 border border-blue-200',
  Resolved: 'bg-green-50 text-green-700 border border-green-200',
  Escalated: 'bg-red-50 text-red-700 border border-red-200',
};

const priorityColors = {
  Low: 'bg-gray-50 text-gray-700 border border-gray-200',
  Medium: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  High: 'bg-orange-50 text-orange-700 border border-orange-200',
  Urgent: 'bg-red-50 text-red-700 border border-red-200',
};

const categoryColors = {
  'Kualitas Pekerjaan': 'bg-red-50 text-red-700 border border-red-200',
  'Waktu Tunggu': 'bg-orange-50 text-orange-700 border border-orange-200',
  'Komunikasi': 'bg-blue-50 text-blue-700 border border-blue-200',
  'Lainnya': 'bg-gray-50 text-gray-700 border border-gray-200',
};

// Modal IDs
const MODAL_IDS = {
  COMPLAINT_DETAIL: 'complaint-detail',
  ASSIGN_COMPLAINT: 'assign-complaint',
  UPDATE_STATUS: 'update-status',
  BULK_RESOLVE: 'bulk-resolve',
  EXPORT_COMPLAINTS: 'export-complaints',
} as const;

export default function AdminComplaintsPage() {
  const { openModal, closeModal, isModalOpen } = useModal();
  const [searchValue, setSearchValue] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    category: 'all',
    assignedTo: 'all',
  });
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [selectedComplaints, setSelectedComplaints] = useState<Complaint[]>([]);

  const handleFilterChange = (filterKey: string, value: string) => {
    setFilters((prev) => ({ ...prev, [filterKey]: value }));
  };

  const filteredComplaints = mockComplaints.filter((complaint) => {
    const matchesSearch =
      searchValue === '' ||
      complaint.id.toLowerCase().includes(searchValue.toLowerCase()) ||
      complaint.customerName.toLowerCase().includes(searchValue.toLowerCase()) ||
      complaint.subject.toLowerCase().includes(searchValue.toLowerCase()) ||
      complaint.orderId.toLowerCase().includes(searchValue.toLowerCase()) ||
      complaint.tukangName.toLowerCase().includes(searchValue.toLowerCase());

    const matchesStatus =
      filters.status === 'all' || complaint.status === filters.status;
    const matchesPriority =
      filters.priority === 'all' || complaint.priority === filters.priority;
    const matchesCategory =
      filters.category === 'all' || complaint.category === filters.category;
    const matchesAssignedTo =
      filters.assignedTo === 'all' || complaint.assignedTo === filters.assignedTo;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesPriority &&
      matchesCategory &&
      matchesAssignedTo
    );
  });

  const filterOptions = {
    status: {
      label: 'Status',
      options: [
        { value: 'all', label: 'All Status' },
        { value: 'Pending', label: 'Pending' },
        { value: 'In Progress', label: 'In Progress' },
        { value: 'Resolved', label: 'Resolved' },
        { value: 'Escalated', label: 'Escalated' },
      ],
      value: filters.status,
      onChange: (value: string) => handleFilterChange('status', value),
    },
    priority: {
      label: 'Priority',
      options: [
        { value: 'all', label: 'All Priorities' },
        { value: 'Low', label: 'Low' },
        { value: 'Medium', label: 'Medium' },
        { value: 'High', label: 'High' },
        { value: 'Urgent', label: 'Urgent' },
      ],
      value: filters.priority,
      onChange: (value: string) => handleFilterChange('priority', value),
    },
    category: {
      label: 'Category',
      options: [
        { value: 'all', label: 'All Categories' },
        { value: 'Kualitas Pekerjaan', label: 'Kualitas Pekerjaan' },
        { value: 'Waktu Tunggu', label: 'Waktu Tunggu' },
        { value: 'Komunikasi', label: 'Komunikasi' },
        { value: 'Lainnya', label: 'Lainnya' },
      ],
      value: filters.category,
      onChange: (value: string) => handleFilterChange('category', value),
    },
    assignedTo: {
      label: 'Assigned To',
      options: [
        { value: 'all', label: 'All Assignees' },
        { value: 'Admin Support', label: 'Admin Support' },
        { value: 'Customer Service', label: 'Customer Service' },
        { value: 'Quality Control', label: 'Quality Control' },
        { value: 'Billing Department', label: 'Billing Department' },
      ],
      value: filters.assignedTo,
      onChange: (value: string) => handleFilterChange('assignedTo', value),
    },
  };

  const complaintsColumns = [
    {
      key: 'select',
      label: (
        <input
          type="checkbox"
          checked={selectedComplaints.length === filteredComplaints.length && filteredComplaints.length > 0}
          onChange={(e) => handleSelectAll(e.target.checked)}
          onClick={(e) => e.stopPropagation()}
          className="w-4 h-4 text-[#0082C9] border-[#D4D4D4] rounded focus:ring-[#0082C9]"
        />
      ),
      render: (_: string, row: Complaint) => (
        <input
          type="checkbox"
          checked={selectedComplaints.some(complaint => complaint.id === row.id)}
          onChange={(e) => handleSelectComplaint(row, e.target.checked)}
          onClick={(e) => e.stopPropagation()}
          className="w-4 h-4 text-[#0082C9] border-[#D4D4D4] rounded focus:ring-[#0082C9]"
        />
      ),
    },
    { key: 'id', label: 'Complaint ID' },
    {
      key: 'customerName',
      label: 'Customer',
      render: (name: string, row: Complaint) => (
        <div>
          <div className='text-b2m text-[#141414]'>{name}</div>
          <div className='text-b3 text-[#9E9E9E]'>{row.customerEmail}</div>
        </div>
      ),
    },
    { key: 'orderId', label: 'Order ID' },
    {
      key: 'category',
      label: 'Category',
      render: (category: string) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
            categoryColors[category as keyof typeof categoryColors] ||
            'bg-gray-50 text-gray-700 border border-gray-200'
          }`}
        >
          {category}
        </span>
      ),
    },
    {
      key: 'subject',
      label: 'Subject',
      render: (subject: string) => (
        <div className='max-w-xs'>
          <div className='text-b2m text-[#141414] truncate'>{subject}</div>
        </div>
      ),
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (priority: string) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
            priorityColors[priority as keyof typeof priorityColors] ||
            'bg-gray-50 text-gray-700 border border-gray-200'
          }`}
        >
          {priority}
        </span>
      ),
    },
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
    { key: 'assignedTo', label: 'Assigned To' },
    { key: 'createdAt', label: 'Created' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: string, row: Complaint) => (
        <div className='flex space-x-2'>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewComplaint(row);
            }}
            className='px-3 py-1 bg-[#0082C9] text-white text-xs rounded hover:bg-[#0066A3]'
          >
            View
          </button>
          {row.status === 'Pending' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAssignComplaint(row);
              }}
              className='px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700'
            >
              Assign
            </button>
          )}
          {row.status !== 'Resolved' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleUpdateStatus(row);
              }}
              className='px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700'
            >
              Resolve
            </button>
          )}
        </div>
      ),
    },
  ];

  const handleViewComplaint = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    openModal(MODAL_IDS.COMPLAINT_DETAIL);
  };

  const handleAssignComplaint = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    openModal(MODAL_IDS.ASSIGN_COMPLAINT);
  };

  const handleUpdateStatus = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    openModal(MODAL_IDS.UPDATE_STATUS);
  };

  const handleExportComplaints = () => {
    openModal(MODAL_IDS.EXPORT_COMPLAINTS);
  };

  const handleBulkResolve = () => {
    if (selectedComplaints.length === 0) return;
    openModal(MODAL_IDS.BULK_RESOLVE);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedComplaints(filteredComplaints);
    } else {
      setSelectedComplaints([]);
    }
  };

  const handleSelectComplaint = (complaint: Complaint, checked: boolean) => {
    if (checked) {
      setSelectedComplaints(prev => [...prev, complaint]);
    } else {
      setSelectedComplaints(prev => prev.filter(c => c.id !== complaint.id));
    }
  };

  const handleCloseModal = () => {
    closeModal();
    setSelectedComplaint(null);
  };

  const handleCloseBulkModal = () => {
    closeModal();
    setSelectedComplaints([]);
  };

  const handleAssignConfirm = async (complaintId: string, assignedTo: string, notes?: string) => {
    console.log('Assigning complaint:', complaintId, assignedTo, notes);
    // TODO: Implement API call to assign complaint
  };

  const handleUpdateStatusConfirm = async (complaintId: string, status: string, response?: string, rating?: number) => {
    console.log('Updating complaint status:', complaintId, status, response, rating);
    // TODO: Implement API call to update complaint status
  };

  const handleBulkResolveConfirm = async (complaintIds: string[], response: string, rating?: number) => {
    console.log('Bulk resolving complaints:', complaintIds, response, rating);
    // TODO: Implement API call for bulk resolve
  };

  const handleExportConfirm = async (format: string, filters: string[], dateRange?: { start: string; end: string }) => {
    console.log('Exporting complaints:', format, filters, dateRange);
    // TODO: Implement API call to export complaints
  };

  // Complaints statistics
  const totalComplaints = mockComplaints.length;
  const pendingComplaints = mockComplaints.filter((c) => c.status === 'Pending').length;
  const resolvedComplaints = mockComplaints.filter((c) => c.status === 'Resolved').length;
  const avgResolutionTime = mockComplaints
    .filter((c) => c.resolvedAt && c.createdAt)
    .reduce((sum, c) => {
      const created = new Date(c.createdAt);
      const resolved = new Date(c.resolvedAt!);
      return sum + (resolved.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
    }, 0) / mockComplaints.filter((c) => c.resolvedAt).length;

  return (
    <AdminLayout>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
          <div>
            <h1 className='text-sh1b text-[#141414]'>Complaints Management</h1>
            <p className='text-b2 text-[#9E9E9E]'>
              Manage and resolve customer complaints
            </p>
          </div>
          <div className='flex flex-col gap-3'>
            <div className='flex gap-4'>
              <Button
                onClick={handleBulkResolve}
                disabled={selectedComplaints.length === 0}
                size="custom"
                variant="custom"
                className='w-auto bg-green-600 text-white hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed py-1 px-4'
              >
                Bulk Resolve {selectedComplaints.length > 0 && `(${selectedComplaints.length})`}
              </Button>
              <Button
                onClick={handleExportComplaints}
                size="custom"
                className='w-auto bg-[#0082C9] text-white hover:bg-[#0066A3] py-1 px-4'
              >
                Export Complaints
              </Button>
            </div>
          </div>
        </div>

        {/* Complaints Statistics */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6'>
          <StatCard
            title='Total Complaints'
            value={totalComplaints.toString()}
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
                  d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
                />
              </svg>
            }
          />
          <StatCard
            title='Pending'
            value={pendingComplaints.toString()}
            change={`${((pendingComplaints / totalComplaints) * 100).toFixed(1)}% of total`}
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
                  d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
            }
          />
          <StatCard
            title='Resolved'
            value={resolvedComplaints.toString()}
            change={`${((resolvedComplaints / totalComplaints) * 100).toFixed(1)}% resolution rate`}
            changeType='positive'
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
            title='Avg Resolution Time'
            value={`${avgResolutionTime.toFixed(1)} days`}
            change='-0.5 days from last month'
            changeType='positive'
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
                  d='M13 10V3L4 14h7v7l9-11h-7z'
                />
              </svg>
            }
          />
          <StatCard
            title='Satisfaction Rate'
            value='87.5%'
            change='+5.2% from last month'
            changeType='positive'
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
                  d='M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
            }
          />
        </div>

        {/* Filters */}
        <FilterBar
          filters={filterOptions}
          searchPlaceholder='Search complaints by ID, customer name, subject, order ID, or tukang name...'
          searchValue={searchValue}
          onSearchChange={setSearchValue}
        />

        {/* Complaints Table */}
        <DataTable
          columns={complaintsColumns}
          data={filteredComplaints}
          onRowClick={handleViewComplaint}
          emptyMessage={`No complaints found${
            searchValue ? ` matching "${searchValue}"` : ''
          }`}
        />
      </div>

      {/* Modals */}
      <ComplaintDetailModal
        isOpen={isModalOpen(MODAL_IDS.COMPLAINT_DETAIL)}
        onClose={handleCloseModal}
        complaint={selectedComplaint}
        onAssign={handleAssignComplaint}
        onUpdateStatus={handleUpdateStatus}
      />

      <AssignComplaintModal
        isOpen={isModalOpen(MODAL_IDS.ASSIGN_COMPLAINT)}
        onClose={handleCloseModal}
        complaint={selectedComplaint}
        onConfirm={handleAssignConfirm}
      />

      <UpdateComplaintStatusModal
        isOpen={isModalOpen(MODAL_IDS.UPDATE_STATUS)}
        onClose={handleCloseModal}
        complaint={selectedComplaint}
        onConfirm={handleUpdateStatusConfirm}
      />

      <BulkResolveComplaintsModal
        isOpen={isModalOpen(MODAL_IDS.BULK_RESOLVE)}
        onClose={handleCloseBulkModal}
        selectedComplaints={selectedComplaints}
        onConfirm={handleBulkResolveConfirm}
      />

      <ExportComplaintsModal
        isOpen={isModalOpen(MODAL_IDS.EXPORT_COMPLAINTS)}
        onClose={closeModal}
        onConfirm={handleExportConfirm}
      />
    </AdminLayout>
  );
}
