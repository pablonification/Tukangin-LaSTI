import React, { useState, useMemo, useEffect } from 'react';
import Modal from '../Modal';
import Button from '../Button';
import { DataTable } from '../admin/DataTable';

interface Order {
  id: string;
  service: string;
  status: string;
  amount: string;
  date: string;
  location: string;
  tukang: string | null;
}

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

interface UserOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

const statusColors = {
  PENDING: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  PROCESSING: 'bg-blue-50 text-blue-700 border border-blue-200',
  WARRANTY: 'bg-orange-50 text-orange-700 border border-orange-200',
  COMPLETED: 'bg-green-50 text-green-700 border border-green-200',
  CANCELLED: 'bg-red-50 text-red-700 border border-red-200',
};

const UserOrdersModal = ({ isOpen, onClose, user }: UserOrdersModalProps) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // fetch orders tiap kali modal kebuka & user berubah
  useEffect(() => {
    if (!isOpen || !user) return;

    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/admin/users/${user.id.replace('USR-', '')}/orders`,
        );
        const data: Order[] = await res.json();
        setOrders(data);
      } catch (err) {
        console.error('Failed to fetch orders', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isOpen, user]);

  const filteredOrders = useMemo(() => {
    let filtered = orders;

    if (searchValue.trim()) {
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(searchValue.toLowerCase()) ||
          order.service.toLowerCase().includes(searchValue.toLowerCase()),
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    return filtered;
  }, [orders, searchValue, statusFilter]);

  const orderStats = useMemo(() => {
    const totalOrders = filteredOrders.length;
    const totalSpent = filteredOrders.reduce((sum, order) => {
      const amount = parseInt(order.amount.replace(/[^0-9]/g, ''));
      return sum + amount;
    }, 0);
    const completedOrders = filteredOrders.filter(
      (order) => order.status === 'Selesai' || order.status === 'COMPLETED',
    ).length;

    return {
      totalOrders,
      totalSpent: `Rp ${totalSpent.toLocaleString('id-ID')}`,
      completedOrders,
      completionRate:
        totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0,
    };
  }, [filteredOrders]);

  if (!user) return null;

  const orderColumns = [
    { key: 'id', label: 'Order ID' },
    { key: 'service', label: 'Service' },
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
    { key: 'amount', label: 'Amount' },
    { key: 'tukang', label: 'Assigned Tukang' },
    { key: 'date', label: 'Date' },
  ];

  const filterOptions = {
    status: {
      label: 'Status',
      options: [
        { value: 'all', label: 'All Status' },
        { value: 'PENDING', label: 'Pending' },
        { value: 'PROCESSING', label: 'Processing' },
        { value: 'WARRANTY', label: 'Warranty' },
        { value: 'COMPLETED', label: 'Completed' },
        { value: 'CANCELLED', label: 'Cancelled' },
      ],
      value: statusFilter,
      onChange: (value: string) => setStatusFilter(value),
    },
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${user.name}'s Orders`}
      size='xl'
    >
      <div className='space-y-6'>
        {/* User Summary */}
        <div className='bg-[#F5F9FC] rounded-xl p-4'>
          <h3 className='text-sh2b text-[#141414] mb-3'>
            {user.name}s Order History
          </h3>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <div className='text-center'>
              <div className='text-sh2b text-[#0082C9]'>
                {orderStats.totalOrders}
              </div>
              <div className='text-b3 text-[#9E9E9E]'>Total Orders</div>
            </div>
            <div className='text-center'>
              <div className='text-sh2b text-[#0082C9]'>
                {orderStats.totalSpent}
              </div>
              <div className='text-b3 text-[#9E9E9E]'>Total Spent</div>
            </div>
            <div className='text-center'>
              <div className='text-sh2b text-[#0082C9]'>
                {orderStats.completedOrders}
              </div>
              <div className='text-b3 text-[#9E9E9E]'>Completed</div>
            </div>
            <div className='text-center'>
              <div className='text-sh2b text-[#0082C9]'>
                {orderStats.completionRate}%
              </div>
              <div className='text-b3 text-[#9E9E9E]'>Success Rate</div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className='bg-white border border-[#D4D4D4] rounded-xl p-4'>
          <div className='flex flex-col space-y-4'>
            <input
              type='text'
              placeholder='Search orders by ID or service...'
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className='w-full px-4 py-3 border border-[#D4D4D4] rounded-xl text-b2 focus:outline-none focus:ring-2 focus:ring-[#0082C9] focus:border-transparent'
            />

            <div className='flex flex-wrap gap-4'>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className='px-4 py-3 border border-[#D4D4D4] rounded-xl text-b2 bg-white focus:outline-none focus:ring-2 focus:ring-[#0082C9]'
              >
                {filterOptions.status.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <DataTable
          columns={orderColumns}
          data={loading ? [] : filteredOrders}
          emptyMessage={
            loading
              ? 'Loading orders...'
              : `No orders found${
                  searchValue ? ` matching "${searchValue}"` : ''
                }`
          }
        />

        {/* Action Buttons */}
        <div className='flex flex-col sm:flex-row gap-3 pt-4'>
          <Button onClick={onClose} variant='secondary' className='sm:ml-auto'>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default UserOrdersModal;
