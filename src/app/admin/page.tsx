'use client';

import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { StatCard } from '../components/admin/StatCard';
import { DataTable } from '../components/admin/DataTable';
import Link from 'next/link';
import { useModal } from '../components/ModalProvider';
import { useNotification } from '@/app/components/NotificationProvider';
import CreateOrderModal from '../components/admin/CreateOrderModal';
import ConfirmPaymentModal from '../components/admin/ConfirmPaymentModal';
import SendWhatsAppModal from '../components/admin/SendWhatsAppModal';

// Interfaces
interface OrderData {
  serviceType: string;
  description: string;
  location: string;
  urgency: string;
  estimatedPrice: string;
  customerPhone: string;
}

interface Payment {
  id: string;
  orderId: string;
  customer: string;
  amount: string;
  paymentMethod: string;
  paymentDate: string;
  status: 'pending' | 'confirmed' | 'rejected';
  proofImage?: string;
  notes?: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  lastOrder?: string;
  status: 'active' | 'inactive';
}

interface PaymentData {
  paymentId: string;
  action: 'confirm' | 'reject';
  notes?: string;
  paymentData: Payment;
}

interface MessageData {
  messageType: 'template' | 'custom';
  templateId?: string;
  customMessage?: string;
  customerIds: string[];
  customerData: Customer[];
}

type DashboardStats = {
  totalOrders: number;
  activeUsers: number;
  revenue: number;
  activeTukang: number;
};

type RecentOrder = {
  id: string;
  customer: string;
  service: string;
  status: string;
  amount: string;
  date: string;
  location: string;
};

interface OrderApiResponse {
  id: string;
  User?: { name?: string };
  service: string;
  status: string;
  total?: number;
  createdAt?: string;
  address?: string;
}

const statusColors = {
  PENDING: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  PROCESSING: 'bg-purple-50 text-purple-700 border border-purple-200',
  WARRANTY: 'bg-orange-50 text-orange-700 border border-orange-200',
  COMPLETED: 'bg-green-50 text-green-700 border border-green-200',
  CANCELLED: 'bg-red-50 text-red-700 border border-red-200',
};

const formatCurrency = (value: number) => `Rp ${value.toLocaleString('id-ID')}`;

// Modal IDs
const MODAL_IDS = {
  CREATE_ORDER: 'create-order',
  CONFIRM_PAYMENT: 'confirm-payment',
  SEND_WHATSAPP: 'send-whatsapp',
} as const;

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    activeUsers: 0,
    revenue: 0,
    activeTukang: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const { openModal, closeModal, isModalOpen } = useModal();
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const [statsRes, ordersRes] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/admin/order'),
        ]);

        if (statsRes.ok) {
          const data: DashboardStats = await statsRes.json();
          setStats(data);
        }

        if (ordersRes.ok) {
          const orders = await ordersRes.json();
          setRecentOrders(
            (orders as OrderApiResponse[]).slice(0, 5).map((o) => ({
              id: o.id,
              customer: o.User?.name ?? 'Unknown',
              service: o.service,
              status: o.status,
              amount: o.total ? formatCurrency(Number(o.total)) : 'Rp 0',
              date: o.createdAt?.split('T')[0] ?? '-',
              location: o.address ?? '-',
            })),
          );
        }
      } catch (error) {
        console.error('Failed to load dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);
  const recentOrdersColumns = [
    { key: 'id', label: 'Order ID' },
    { key: 'customer', label: 'Customer' },
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
    { key: 'date', label: 'Date' },
  ];

  const statCards = [
    {
      title: 'Total Orders',
      value: stats.totalOrders.toString(),
      change: '',
      changeType: 'positive' as const,
      icon: (
        <svg className='w-8 h-8' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
          />
        </svg>
      ),
    },
    {
      title: 'Active Users',
      value: stats.activeUsers.toString(),
      change: '',
      changeType: 'positive' as const,
      icon: (
        <svg className='w-8 h-8' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
          />
        </svg>
      ),
    },
    {
      title: 'Revenue',
      value: formatCurrency(stats.revenue),
      change: '',
      changeType: 'positive' as const,
      icon: (
        <svg className='w-8 h-8' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
          />
        </svg>
      ),
    },
    {
      title: 'Active Tukang',
      value: stats.activeTukang.toString(),
      change: '',
      changeType: 'positive' as const,
      icon: (
        <svg className='w-8 h-8' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
          />
        </svg>
      ),
    },
  ];

  const handleCreateOrder = () => {
    openModal(MODAL_IDS.CREATE_ORDER);
  };

  const handleConfirmPayment = () => {
    openModal(MODAL_IDS.CONFIRM_PAYMENT);
  };

  const handleSendWhatsApp = () => {
    openModal(MODAL_IDS.SEND_WHATSAPP);
  };

  const handleCloseModal = () => {
    closeModal();
  };

  const handleCreateOrderConfirm = async (orderData: OrderData) => {
    try {
      console.log('Creating order:', orderData);
      // TODO: Implement actual API call to create order
      showSuccess('Order created and broadcast successfully!', 'Order Created');
      handleCloseModal();
    } catch (error) {
      console.error('Error creating order:', error);
      showError('Failed to create order. Please try again.', 'Order Creation Failed');
      throw error;
    }
  };

  const handleConfirmPaymentConfirm = async (paymentData: PaymentData) => {
    try {
      console.log('Confirming payment:', paymentData);
      // TODO: Implement actual API call to confirm payment
      showSuccess('Payment confirmed successfully!', 'Payment Confirmed');
      handleCloseModal();
    } catch (error) {
      console.error('Error confirming payment:', error);
      showError('Failed to confirm payment. Please try again.', 'Payment Confirmation Failed');
      throw error;
    }
  };

  const handleSendWhatsAppConfirm = async (messageData: MessageData) => {
    try {
      console.log('Sending WhatsApp message:', messageData);
      // TODO: Implement actual API call to send WhatsApp message
      showSuccess('WhatsApp message sent successfully!', 'Message Sent');
      handleCloseModal();
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      showError('Failed to send WhatsApp message. Please try again.', 'Message Failed');
      throw error;
    }
  };

  return (
    <AdminLayout>
      <div className='space-y-8'>
        {/* Header */}
        <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
          <div>
            <h1 className='text-sh1b text-[#141414]'>Dashboard Overview</h1>
            <p className='text-b2 text-[#9E9E9E]'>
              Welcome back! Here&apos;s what&apos;s happening with your platform
              today.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {statCards.map((stat, index) => (
            <StatCard
              key={index}
              title={stat.title}
              value={stat.value}
              change={stat.change}
              changeType={stat.changeType}
              icon={stat.icon}
            />
          ))}
        </div>

        {/* Recent Activity */}
        <div className='grid grid-cols-1 gap-8'>
          {/* Quick Actions */}
          <div>
            <h2 className='text-sh2b text-[#141414] mb-6'>Quick Actions</h2>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <button
                onClick={handleCreateOrder}
                className='w-full h-full bg-white border border-[#D4D4D4] rounded-2xl p-6 text-left hover:bg-[#F5F9FC] transition-colors cursor-pointer'
              >
                <div className='flex items-start'>
                  <div className='w-12 h-12 bg-[#E0F1FE] rounded-xl flex items-center justify-center mr-4 flex-shrink-0'>
                    <svg
                      className='w-6 h-6 text-[#0082C9]'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M12 6v6m0 0v6m0-6h6m-6 0H6'
                      />
                    </svg>
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div className='text-b1m text-[#141414] leading-tight mb-1'>
                      Broadcast New Order
                    </div>
                    <div className='text-b3 text-[#9E9E9E] leading-relaxed'>
                      Send order notification to available tukang
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={handleConfirmPayment}
                className='w-full h-full bg-white border border-[#D4D4D4] rounded-2xl p-6 text-left hover:bg-[#F5F9FC] transition-colors cursor-pointer'
              >
                <div className='flex items-start'>
                  <div className='w-12 h-12 bg-[#E0F1FE] rounded-xl flex items-center justify-center mr-4 flex-shrink-0'>
                    <svg
                      className='w-6 h-6 text-[#0082C9]'
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
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div className='text-b1m text-[#141414] leading-tight mb-1'>
                      Confirm Payment
                    </div>
                    <div className='text-b3 text-[#9E9E9E] leading-relaxed'>
                      Review and confirm customer payments
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={handleSendWhatsApp}
                className='w-full h-full bg-white border border-[#D4D4D4] rounded-2xl p-6 text-left hover:bg-[#F5F9FC] transition-colors cursor-pointer'
              >
                <div className='flex items-start'>
                  <div className='w-12 h-12 bg-[#E0F1FE] rounded-xl flex items-center justify-center mr-4 flex-shrink-0'>
                    <svg
                      className='w-6 h-6 text-[#0082C9]'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
                      />
                    </svg>
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div className='text-b1m text-[#141414] leading-tight mb-1'>
                      Send WhatsApp Message
                    </div>
                    <div className='text-b3 text-[#9E9E9E] leading-relaxed'>
                      Send template messages to customers
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>
          {/* Recent Orders */}
          <div>
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-sh2b text-[#141414]'>Recent Orders</h2>
              <Link
                href='/admin/orders'
                className='text-b3 text-[#0082C9] font-medium transition-colors duration-150 hover:text-[#0066A3] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0082C9] rounded'
              >
                View All
              </Link>
            </div>
            <DataTable
              columns={recentOrdersColumns}
              data={recentOrders}
              loading={loading}
              onRowClick={(row) => console.log('Row clicked:', row)}
            />
          </div>

          {/* System Status */}
          <div className='bg-white rounded-2xl border border-[#D4D4D4] p-6'>
            <h2 className='text-sh2b text-[#141414] mb-6'>System Status</h2>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              <div className='flex items-center'>
                <div className='w-4 h-4 bg-green-500 rounded-full mr-3'></div>
                <div>
                  <div className='text-b2m text-[#141414]'>WhatsApp API</div>
                  <div className='text-b3 text-[#9E9E9E]'>Operational</div>
                </div>
              </div>
              <div className='flex items-center'>
                <div className='w-4 h-4 bg-green-500 rounded-full mr-3'></div>
                <div>
                  <div className='text-b2m text-[#141414]'>Database</div>
                  <div className='text-b3 text-[#9E9E9E]'>Operational</div>
                </div>
              </div>
              <div className='flex items-center'>
                <div className='w-4 h-4 bg-yellow-500 rounded-full mr-3'></div>
                <div>
                  <div className='text-b2m text-[#141414]'>File Storage</div>
                  <div className='text-b3 text-[#9E9E9E]'>
                    Maintenance in progress
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateOrderModal
        isOpen={isModalOpen(MODAL_IDS.CREATE_ORDER)}
        onClose={handleCloseModal}
        onConfirm={handleCreateOrderConfirm}
      />

      <ConfirmPaymentModal
        isOpen={isModalOpen(MODAL_IDS.CONFIRM_PAYMENT)}
        onClose={handleCloseModal}
        onConfirm={handleConfirmPaymentConfirm}
      />

      <SendWhatsAppModal
        isOpen={isModalOpen(MODAL_IDS.SEND_WHATSAPP)}
        onClose={handleCloseModal}
        onConfirm={handleSendWhatsAppConfirm}
      />
    </AdminLayout>
  );
}
