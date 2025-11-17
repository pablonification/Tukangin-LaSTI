'use client';

import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { DataTable } from '../../components/admin/DataTable';
import { FilterBar } from '../../components/admin/FilterBar';
import Button from '../../components/Button';
import OrderDetailModal from '../../components/admin/OrderDetailModal';
import SetPriceModal from '../../components/admin/SetPriceModal';
import BroadcastOrderModal from '../../components/admin/BroadcastOrderModal';
import CompleteOrderModal from '../../components/admin/CompleteOrderModal';
import AssignTukangModal from '../../components/admin/AssignTukangModal';
import { useModal } from '../../components/ModalProvider';
import { useNotification } from '@/app/components/NotificationProvider';

export interface Order {
  id: number;
  receiverName: string;
  receiverPhone: string;
  service: string;
  address: string;
  description: string;
  status: string;
  createdAt: string;
  paidAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  warrantyUntil: string | null;
  subtotal: number | null;
  discount: number | null;
  total: number | null;
  userId: number;
  tukangId: number | null;
  attachments: string[];

  User: {
    id: number;
    email: string;
    name: string;
    role: string;
    image?: string | null;
    isNew: boolean;
    isActive: boolean;
    phone?: string | null;
    joinedAt: string;
  };
}

// Mock data for orders

const statusColors = {
  'Pending Harga': 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  'Menunggu Pembayaran': 'bg-blue-50 text-blue-700 border border-blue-200',
  Dikerjakan: 'bg-purple-50 text-purple-700 border border-purple-200',
  'Masa Tunggu': 'bg-orange-50 text-orange-700 border border-orange-200',
  Selesai: 'bg-green-50 text-green-700 border border-green-200',
  Batal: 'bg-red-50 text-red-700 border border-red-200',
};

const priorityColors = {
  Normal: 'bg-gray-50 text-gray-700 border border-gray-200',
  High: 'bg-orange-50 text-orange-700 border border-orange-200',
  Urgent: 'bg-red-50 text-red-700 border border-red-200',
};

// Modal IDs
const MODAL_IDS = {
  ORDER_DETAIL: 'order-detail',
  SET_PRICE: 'set-price',
  BROADCAST: 'broadcast',
  COMPLETE_ORDER: 'complete-order',
  ASSIGN_TUKANG: 'assign-tukang',
} as const;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    priority: 'all',
    dateRange: 'all',
  });
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/admin/order');
        if (!res.ok) throw new Error('Failed to fetch users');

        const data: Order[] = await res.json();
        setOrders(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);
  const { openModal, closeModal, isModalOpen } = useModal();
  const { showSuccess, showError } = useNotification();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const handleFilterChange = (filterKey: string, value: string) => {
    setFilters((prev) => ({ ...prev, [filterKey]: value }));
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      searchValue === '' ||
      order.id.toString().toLowerCase().includes(searchValue.toLowerCase()) ||
      order.User.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      order.service.toLowerCase().includes(searchValue.toLowerCase());

    const matchesStatus =
      filters.status === 'all' || order.status === filters.status;

    return matchesSearch && matchesStatus;
  });

  const filterOptions = {
    status: {
      label: 'Status',
      options: [
        { value: 'all', label: 'All Status' },
        { value: 'PENDING', label: 'Pending Harga' },
        { value: 'PROCESSING', label: 'Dikerjakan' },
        { value: 'WARRANTY', label: 'Masa Tunggu' },
        { value: 'COMPLETED', label: 'Selesai' },
        { value: 'CANCELLED', label: 'Batal' },
      ],
      value: filters.status,
      onChange: (value: string) => handleFilterChange('status', value),
    },
    category: {
      label: 'Category',
      options: [
        { value: 'all', label: 'All Categories' },
        { value: 'Perpipaan', label: 'Perpipaan' },
        { value: 'Kelistrikan', label: 'Kelistrikan' },
        { value: 'AC', label: 'AC' },
        { value: 'Konstruksi', label: 'Konstruksi' },
      ],
      value: filters.category,
      onChange: (value: string) => handleFilterChange('category', value),
    },
    priority: {
      label: 'Priority',
      options: [
        { value: 'all', label: 'All Priorities' },
        { value: 'Normal', label: 'Normal' },
        { value: 'High', label: 'High' },
        { value: 'Urgent', label: 'Urgent' },
      ],
      value: filters.priority,
      onChange: (value: string) => handleFilterChange('priority', value),
    },
  };

  const ordersColumns = [
    { key: 'id', label: 'Order ID' },
    { key: 'receiverName', label: 'Customer' },
    { key: 'service', label: 'Service' },
    { key: 'category', label: 'Category' },
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
      key: 'priority',
      label: 'Priority',
      render: (priority: string) => (
        <span
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
            priorityColors[priority as keyof typeof priorityColors] ||
            'bg-gray-50 text-gray-700 border border-gray-200'
          }`}
        >
          {priority}
        </span>
      ),
    },
    {
      key: 'total',
      label: 'Amount',
      render: (amount: string | null, row: Order) => (
        <div>
          {amount ? (
            <div className='text-b2m font-medium'>{amount}</div>
          ) : (
            <div className='text-b3 text-[#9E9E9E]'>{row.total}</div>
          )}
        </div>
      ),
    },
    { key: 'createdAt', label: 'Date' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: string | null, row: Order) => (
        <div className='flex flex-wrap gap-1'>
          <button
            onClick={() => handleViewOrder(row)}
            className='px-2 py-1 bg-[#0082C9] text-white text-xs rounded hover:bg-[#0066A3] transition-colors'
            title='View order details'
          >
            View
          </button>

          {row.status === 'Pending Harga' && (
            <button
              onClick={() => handleSetPrice(row)}
              className='px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors'
              title='Set final price'
            >
              Set Price
            </button>
          )}

          {row.status === 'Dikerjakan' && (
            <button
              onClick={() => handleCompleteOrder(row)}
              className='px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors'
              title='Mark as completed'
            >
              Complete
            </button>
          )}

          {!row.tukangId &&
            row.status !== 'Selesai' &&
            row.status !== 'Batal' && (
              <button
                onClick={() => handleAssignTukang(row)}
                className='px-2 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 transition-colors'
                title='Assign tukang'
              >
                Assign
              </button>
            )}

          {row.tukangId && row.status === 'Dikerjakan' && (
            <button
              onClick={() => {
                // TODO: Implement tukang reassignment
                console.log('Reassign tukang for order:', row);
              }}
              className='px-2 py-1 bg-orange-600 text-white text-xs rounded hover:bg-orange-700 transition-colors'
              title='Reassign tukang'
            >
              Reassign
            </button>
          )}

          {row.status !== 'Selesai' && row.status !== 'Batal' && (
            <button
              onClick={() => {
                // TODO: Implement status update modal
                console.log('Update status for order:', row);
              }}
              className='px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors'
              title='Update status'
            >
              Status
            </button>
          )}
        </div>
      ),
    },
  ];

  // Modal handlers
  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    openModal(MODAL_IDS.ORDER_DETAIL);
  };

  const handleSetPrice = (order: Order) => {
    setSelectedOrder(order);
    openModal(MODAL_IDS.SET_PRICE);
  };

  const handleCompleteOrder = (order: Order) => {
    setSelectedOrder(order);
    openModal(MODAL_IDS.COMPLETE_ORDER);
  };

  const handleBroadcastOrder = () => {
    openModal(MODAL_IDS.BROADCAST);
  };

  const handleAssignTukang = (order: Order) => {
    setSelectedOrder(order);
    openModal(MODAL_IDS.ASSIGN_TUKANG);
  };

  // Modal action handlers
  const handleSetPriceConfirm = async (orderId: string, price: string) => {
    try {
      console.log('Setting price for order:', orderId, 'Price:', price);
      // TODO: Implement API call to set price
      // For now, just show success message
      showSuccess(
        `Price set successfully for order ${orderId}: Rp ${price}`,
        'Price Set',
      );
    } catch (error) {
      console.error('Error setting price:', error);
      showError(
        'Failed to set price. Please try again.',
        'Price Setting Failed',
      );
    }
  };

  const handleCompleteOrderConfirm = async (
    orderId: string,
    notes?: string,
  ) => {
    try {
      console.log('Completing order:', orderId, 'Notes:', notes);
      // TODO: Implement API call to complete order
      // For now, just show success message
      showSuccess(
        `Order ${orderId} completed successfully!`,
        'Order Completed',
      );
    } catch (error) {
      console.error('Error completing order:', error);
      showError(
        'Failed to complete order. Please try again.',
        'Order Completion Failed',
      );
    }
  };

  const handleBroadcastConfirm = async (selectedOrderIds: string[]) => {
    try {
      console.log('Broadcasting orders:', selectedOrderIds);
      // TODO: Implement API call to broadcast orders
      // For now, just show success message
      showSuccess(
        `${selectedOrderIds.length} order(s) broadcasted to available tukang!`,
        'Orders Broadcasted',
      );
    } catch (error) {
      console.error('Error broadcasting orders:', error);
      showError(
        'Failed to broadcast orders. Please try again.',
        'Broadcast Failed',
      );
    }
  };

  const handleAssignTukangConfirm = async (
    orderId: string,
    tukangId: string,
  ) => {
    try {
      console.log('Assigning tukang:', tukangId, 'to order:', orderId);
      // TODO: Implement API call to assign tukang
      // For now, just show success message
      showSuccess(
        `Tukang assigned successfully to order ${orderId}!`,
        'Tukang Assigned',
      );
    } catch (error) {
      console.error('Error assigning tukang:', error);
      showError(
        'Failed to assign tukang. Please try again.',
        'Assignment Failed',
      );
    }
  };

  // Modal close handlers
  const handleCloseModal = () => {
    closeModal();
    setSelectedOrder(null);
  };

  return (
    <AdminLayout>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
          <div>
            <h1 className='text-sh1b text-[#141414]'>Order Management</h1>
            <p className='text-b2 text-[#9E9E9E]'>
              Monitor and manage all customer orders
            </p>
          </div>
          <div>
            <Button
              onClick={handleBroadcastOrder}
              size='lg'
              className='w-auto bg-[#0082C9] text-white hover:bg-[#0066A3]'
            >
              Broadcast Order
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
          <div className='bg-white rounded-2xl p-6 border border-[#D4D4D4]'>
            <div className='text-b2 text-[#9E9E9E]'>Total Orders</div>
            <div className='text-sh2b text-[#141414]'>{orders.length}</div>
          </div>
          <div className='bg-white rounded-2xl p-6 border border-[#D4D4D4]'>
            <div className='text-b2 text-[#9E9E9E]'>Pending Price</div>
            <div className='text-sh2b text-[#141414]'>
              {orders.filter((o) => o.status === 'Pending Harga').length}
            </div>
          </div>
          <div className='bg-white rounded-2xl p-6 border border-[#D4D4D4]'>
            <div className='text-b2 text-[#9E9E9E]'>In Progress</div>
            <div className='text-sh2b text-[#141414]'>
              {orders.filter((o) => o.status === 'Dikerjakan').length}
            </div>
          </div>
          <div className='bg-white rounded-2xl p-6 border border-[#D4D4D4]'>
            <div className='text-b2 text-[#9E9E9E]'>Completed</div>
            <div className='text-sh2b text-[#141414]'>
              {orders.filter((o) => o.status === 'Selesai').length}
            </div>
          </div>
        </div>

        {/* Filters */}
        <FilterBar
          filters={filterOptions}
          searchPlaceholder='Search orders by ID, customer, or service...'
          searchValue={searchValue}
          onSearchChange={setSearchValue}
        />

        {/* Orders Table */}
        <DataTable
          columns={ordersColumns}
          data={filteredOrders}
          onRowClick={handleViewOrder}
          emptyMessage={`No orders found${
            searchValue ? ` matching "${searchValue}"` : ''
          }`}
        />
      </div>

      {/* Modals */}
      <OrderDetailModal
        isOpen={isModalOpen(MODAL_IDS.ORDER_DETAIL)}
        onClose={handleCloseModal}
        order={selectedOrder}
        onSetPrice={handleSetPrice}
        onCompleteOrder={handleCompleteOrder}
        onAssignTukang={handleAssignTukang}
      />

      <SetPriceModal
        isOpen={isModalOpen(MODAL_IDS.SET_PRICE)}
        onClose={handleCloseModal}
        order={selectedOrder}
        onConfirm={handleSetPriceConfirm}
      />

      <BroadcastOrderModal
        isOpen={isModalOpen(MODAL_IDS.BROADCAST)}
        onClose={handleCloseModal}
        onConfirm={handleBroadcastConfirm}
        availableOrders={orders}
      />

      <CompleteOrderModal
        isOpen={isModalOpen(MODAL_IDS.COMPLETE_ORDER)}
        onClose={handleCloseModal}
        order={selectedOrder}
        onConfirm={handleCompleteOrderConfirm}
      />

      <AssignTukangModal
        isOpen={isModalOpen(MODAL_IDS.ASSIGN_TUKANG)}
        onClose={handleCloseModal}
        order={selectedOrder}
        onConfirm={handleAssignTukangConfirm}
      />
    </AdminLayout>
  );
}
