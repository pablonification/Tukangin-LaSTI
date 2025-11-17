'use client';

import React, { useState } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { StatCard } from '../../components/admin/StatCard';
import Button from '../../components/Button';
import ExportReportModal from '../../components/admin/ExportReportModal';
import DetailedChartModal from '../../components/admin/DetailedChartModal';
import CustomReportModal from '../../components/admin/CustomReportModal';
import { useModal } from '../../components/ModalProvider';
import { useNotification } from '@/app/components/NotificationProvider';

// Mock data for reports
const mockOrderStats = {
  totalOrders: 1234,
  completedOrders: 1189,
  cancelledOrders: 45,
  revenue: 45678000,
  avgOrderValue: 37000,
  topCategories: [
    { name: 'Perpipaan', orders: 234, percentage: 19 },
    { name: 'Kelistrikan', orders: 198, percentage: 16 },
    { name: 'Konstruksi', orders: 167, percentage: 14 },
    { name: 'AC', orders: 145, percentage: 12 },
    { name: 'Lainnya', orders: 490, percentage: 39 },
  ],
  monthlyRevenue: [
    { month: 'Jan', revenue: 3200000 },
    { month: 'Feb', revenue: 4100000 },
    { month: 'Mar', revenue: 3800000 },
    { month: 'Apr', revenue: 5200000 },
    { month: 'May', revenue: 4800000 },
    { month: 'Jun', revenue: 6100000 },
  ],
  orderStatusDistribution: [
    { status: 'Completed', count: 1189, percentage: 96.3 },
    { status: 'In Progress', count: 34, percentage: 2.8 },
    { status: 'Pending Price', count: 11, percentage: 0.9 },
  ],
};

const mockTukangStats = {
  totalTukang: 89,
  activeTukang: 76,
  avgRating: 4.6,
  totalEarnings: 157500000,
  topPerformers: [
    { name: 'Ahmad Surya', jobs: 45, rating: 4.8, earnings: 15200000 },
    { name: 'Candra Wijaya', jobs: 52, rating: 4.9, earnings: 18500000 },
    { name: 'Budi Santoso', jobs: 38, rating: 4.6, earnings: 12800000 },
  ],
  specializationStats: [
    { specialization: 'Kelistrikan', tukang: 23, jobs: 156 },
    { specialization: 'Perpipaan', tukang: 18, jobs: 134 },
    { specialization: 'Konstruksi', tukang: 15, jobs: 98 },
    { specialization: 'AC', tukang: 12, jobs: 87 },
  ],
};

const mockComplaintStats = {
  totalComplaints: 23,
  resolvedComplaints: 21,
  pendingComplaints: 2,
  avgResolutionTime: 2.3,
  complaintCategories: [
    { category: 'Kualitas Pekerjaan', count: 12, percentage: 52 },
    { category: 'Waktu Tunggu', count: 6, percentage: 26 },
    { category: 'Komunikasi', count: 3, percentage: 13 },
    { category: 'Lainnya', count: 2, percentage: 9 },
  ],
};

// Order Analytics Icon (replacing 📊)
const OrderAnalyticsIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

// Tukang Performance Icon (replacing 👷)
const TukangPerformanceIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

// Complaint Analysis Icon (replacing ⚠️)
const ComplaintAnalysisIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

// Chart data types
interface BarChartData {
  name?: string;
  month?: string;
  revenue?: number;
  orders?: number;
  percentage?: number;
}

interface PieChartData {
  name?: string;
  status?: string;
  category?: string;
  count?: number;
  percentage?: number;
}

// Simple chart components
const BarChart = ({ data, title, onViewDetail }: { data: BarChartData[]; title: string; onViewDetail: (title: string, data: BarChartData[], type: 'bar') => void }) => (
  <div
    className='bg-white rounded-2xl border border-[#D4D4D4] p-6 cursor-pointer hover:bg-[#F5F9FC] transition-colors'
    onClick={() => onViewDetail(title, data, 'bar')}
  >
    <h3 className='text-sh2b text-[#141414] mb-6'>{title}</h3>
    <div className='space-y-4'>
      {data.map((item, index) => (
        <div key={index}>
          <div className='flex justify-between mb-2'>
            <span className='text-b2 text-[#141414]'>
              {item.name || item.month}
            </span>
            <span className='text-b2m text-[#0082C9]'>
              {item.revenue
                ? `Rp ${(item.revenue / 1000000).toFixed(1)}M`
                : item.orders}
            </span>
          </div>
          <div className='w-full bg-[#F5F9FC] rounded-full h-3'>
            <div
              className='bg-[#0082C9] h-3 rounded-full transition-all duration-300'
              style={{
                width: item.percentage
                  ? `${item.percentage}%`
                  : item.revenue
                  ? `${(item.revenue / 6100000) * 100}%`
                  : item.orders
                  ? `${(item.orders / 234) * 100}%`
                  : '0%',
              }}
            />
          </div>
        </div>
      ))}
    </div>
    <div className="mt-4 text-b3 text-[#9E9E9E] text-center">
      Click to view detailed chart
    </div>
  </div>
);

const PieChart = ({ data, title, onViewDetail }: { data: PieChartData[]; title: string; onViewDetail: (title: string, data: PieChartData[], type: 'pie') => void }) => (
  <div
    className='bg-white rounded-2xl border border-[#D4D4D4] p-6 cursor-pointer hover:bg-[#F5F9FC] transition-colors'
    onClick={() => onViewDetail(title, data, 'pie')}
  >
    <h3 className='text-sh2b text-[#141414] mb-6'>{title}</h3>
    <div className='space-y-3'>
      {data.map((item, index) => (
        <div key={index} className='flex items-center justify-between'>
          <div className='flex items-center'>
            <div
              className='w-4 h-4 rounded-full mr-3'
              style={{
                backgroundColor: [
                  '#0082C9',
                  '#0CA2EB',
                  '#4FC3F7',
                  '#81D4FA',
                  '#B3E5FC',
                ][index % 5],
              }}
            />
            <span className='text-b2 text-[#141414]'>
              {item.name || item.status || item.category}
            </span>
          </div>
          <div className='text-right'>
            <div className='text-b2m text-[#0082C9]'>
              {item.count || item.percentage}%
            </div>
            {item.percentage && (
              <div className='text-b3 text-[#9E9E9E]'>{item.percentage}%</div>
            )}
          </div>
        </div>
      ))}
    </div>
    <div className="mt-4 text-b3 text-[#9E9E9E] text-center">
      Click to view detailed chart
    </div>
  </div>
);

// Modal IDs
const MODAL_IDS = {
  EXPORT_REPORT: 'export-report',
  DETAILED_CHART: 'detailed-chart',
  CUSTOM_REPORT: 'custom-report',
} as const;

export default function AdminReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedReport, setSelectedReport] = useState('orders');

  const { openModal, closeModal, isModalOpen } = useModal();
  const { showSuccess, showError } = useNotification();
  const [chartModalData, setChartModalData] = useState<{
    title: string;
    data: BarChartData[] | PieChartData[];
    type: 'bar' | 'pie';
  } | null>(null);

  const handleExportReport = () => {
    openModal(MODAL_IDS.EXPORT_REPORT);
  };

  const handleCustomReport = () => {
    openModal(MODAL_IDS.CUSTOM_REPORT);
  };

  const handleViewDetailedChart = (title: string, data: BarChartData[] | PieChartData[], type: 'bar' | 'pie') => {
    setChartModalData({ title, data, type });
    openModal(MODAL_IDS.DETAILED_CHART);
  };

  // Modal action handlers
  const handleExportConfirm = async (format: string, reportType: string, period: string, includeCharts: boolean) => {
    try {
      console.log('Exporting report:', { format, reportType, period, includeCharts });
      // TODO: Implement API call to export report
      showSuccess(`Report exported successfully as ${format.toUpperCase()}!`, 'Export Complete');
    } catch (error) {
      console.error('Error exporting report:', error);
      showError('Failed to export report. Please try again.', 'Export Failed');
    }
  };

  const handleCustomReportConfirm = async (reportConfig: {
    name: string;
    type: string;
    dateRange: { start: string; end: string };
    filters: string[];
    includeCharts: boolean;
    format: string;
  }) => {
    try {
      console.log('Creating custom report:', reportConfig);
      // TODO: Implement API call to create custom report
      showSuccess(`Custom report "${reportConfig.name}" generated successfully!`, 'Report Generated');
    } catch (error) {
      console.error('Error generating custom report:', error);
      showError('Failed to generate custom report. Please try again.', 'Generation Failed');
    }
  };

  // Modal close handlers
  const handleCloseModal = () => {
    closeModal();
    setChartModalData(null);
  };

  return (
    <AdminLayout>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
          <div>
            <h1 className='text-sh1b text-[#141414]'>Reports & Analytics</h1>
            <p className='text-b2 text-[#9E9E9E]'>
              Comprehensive insights into platform performance
            </p>
          </div>
          <div className='flex gap-4'>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className='px-4 py-3 border border-[#D4D4D4] rounded-xl text-b2 bg-white focus:outline-none focus:ring-2 focus:ring-[#0082C9]'
            >
              <option value='weekly'>Weekly</option>
              <option value='monthly'>Monthly</option>
              <option value='quarterly'>Quarterly</option>
              <option value='yearly'>Yearly</option>
            </select>
            <Button
              onClick={handleCustomReport}
              size="custom"
              variant="custom"
              className='w-auto bg-green-600 text-white hover:bg-green-700'
            >
              Create Custom Report
            </Button>
            <Button
              onClick={handleExportReport}
              size="lg"
              className='w-auto bg-[#0082C9] text-white hover:bg-[#0066A3]'
            >
              Export Report
            </Button>
          </div>
        </div>

        {/* Report Type Selector */}
        <div className='bg-white rounded-2xl border border-[#D4D4D4] p-6'>
          <div className='flex space-x-6'>
            {[
              { key: 'orders', label: 'Order Analytics', icon: <OrderAnalyticsIcon /> },
              { key: 'tukang', label: 'Tukang Performance', icon: <TukangPerformanceIcon /> },
              { key: 'complaints', label: 'Complaint Analysis', icon: <ComplaintAnalysisIcon /> },
            ].map((report) => (
              <button
                key={report.key}
                onClick={() => setSelectedReport(report.key)}
                className={`flex items-center px-6 py-3 rounded-xl transition-colors ${
                  selectedReport === report.key
                    ? 'bg-[#0082C9] text-white'
                    : 'text-[#141414] hover:bg-[#F5F9FC]'
                }`}
              >
                <span className='mr-3'>{report.icon}</span>
                <span className='text-b1m'>{report.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Order Analytics */}
        {selectedReport === 'orders' && (
          <>
            {/* Order Overview Stats */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6'>
              <StatCard
                title='Total Orders'
                value={mockOrderStats.totalOrders.toString()}
                change='+12% from last month'
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
                      d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                    />
                  </svg>
                }
              />
              <StatCard
                title='Completed Orders'
                value={mockOrderStats.completedOrders.toString()}
                change={`${(
                  (mockOrderStats.completedOrders /
                    mockOrderStats.totalOrders) *
                  100
                ).toFixed(1)}% completion rate`}
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
                title='Revenue'
                value={`Rp ${(mockOrderStats.revenue / 1000000).toFixed(1)}M`}
                change='+23% from last month'
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
                      d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                }
              />
              <StatCard
                title='Avg Order Value'
                value={`Rp ${mockOrderStats.avgOrderValue.toLocaleString()}`}
                change='+8% from last month'
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
                      d='M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z'
                    />
                  </svg>
                }
              />
              <StatCard
                title='Cancellation Rate'
                value={`${(
                  (mockOrderStats.cancelledOrders /
                    mockOrderStats.totalOrders) *
                  100
                ).toFixed(1)}%`}
                change='-2% from last month'
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
                      d='M6 18L18 6M6 6l12 12'
                    />
                  </svg>
                }
              />
            </div>

            {/* Charts */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
              <BarChart
                data={mockOrderStats.topCategories}
                title='Orders by Category'
                onViewDetail={handleViewDetailedChart}
              />
              <BarChart
                data={mockOrderStats.monthlyRevenue}
                title='Monthly Revenue'
                onViewDetail={handleViewDetailedChart}
              />
            </div>

            <PieChart
              data={mockOrderStats.orderStatusDistribution}
              title='Order Status Distribution'
              onViewDetail={handleViewDetailedChart}
            />
          </>
        )}

        {/* Tukang Analytics */}
        {selectedReport === 'tukang' && (
          <>
            {/* Tukang Overview Stats */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6'>
              <StatCard
                title='Total Tukang'
                value={mockTukangStats.totalTukang.toString()}
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
                value={mockTukangStats.activeTukang.toString()}
                change={`${(
                  (mockTukangStats.activeTukang / mockTukangStats.totalTukang) *
                  100
                ).toFixed(1)}% active`}
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
                value={mockTukangStats.avgRating.toString()}
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
                value={`Rp ${(mockTukangStats.totalEarnings / 1000000).toFixed(
                  1,
                )}M`}
                change='+18% from last month'
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
                      d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                }
              />
              <StatCard
                title='Jobs Completed'
                value='742'
                change='+15% from last month'
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
            </div>

            {/* Tukang Performance Tables */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
              <div className='bg-white rounded-2xl border border-[#D4D4D4] p-6'>
                <h3 className='text-sh2b text-[#141414] mb-6'>
                  Top Performers
                </h3>
                <div className='space-y-4'>
                  {mockTukangStats.topPerformers.map((tukang, index) => (
                    <div
                      key={index}
                      className='flex items-center justify-between p-4 bg-[#F5F9FC] rounded-xl'
                    >
                      <div className='flex items-center'>
                        <div className='w-10 h-10 bg-[#0082C9] rounded-full flex items-center justify-center mr-4'>
                          <span className='text-white font-medium'>
                            #{index + 1}
                          </span>
                        </div>
                        <div>
                          <div className='text-b2m text-[#141414]'>
                            {tukang.name}
                          </div>
                          <div className='text-b3 text-[#9E9E9E]'>
                            {tukang.jobs} jobs
                          </div>
                        </div>
                      </div>
                      <div className='text-right'>
                        <div className='text-b2m text-[#0082C9]'>
                          ★ {tukang.rating}
                        </div>
                        <div className='text-b3 text-[#141414]'>
                          Rp {(tukang.earnings / 1000000).toFixed(1)}M
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className='bg-white rounded-2xl border border-[#D4D4D4] p-6'>
                <h3 className='text-sh2b text-[#141414] mb-6'>
                  Specialization Stats
                </h3>
                <div className='space-y-4'>
                  {mockTukangStats.specializationStats.map((spec, index) => (
                    <div
                      key={index}
                      className='flex items-center justify-between'
                    >
                      <div>
                        <div className='text-b2m text-[#141414]'>
                          {spec.specialization}
                        </div>
                        <div className='text-b3 text-[#9E9E9E]'>
                          {spec.tukang} tukang
                        </div>
                      </div>
                      <div className='text-right'>
                        <div className='text-b2m text-[#0082C9]'>
                          {spec.jobs} jobs
                        </div>
                        <div className='w-full bg-[#F5F9FC] rounded-full h-2 mt-1'>
                          <div
                            className='bg-[#0082C9] h-2 rounded-full'
                            style={{ width: `${(spec.jobs / 156) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Complaint Analytics */}
        {selectedReport === 'complaints' && (
          <>
            {/* Complaint Overview Stats */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6'>
              <StatCard
                title='Total Complaints'
                value={mockComplaintStats.totalComplaints.toString()}
                change='+5 from last month'
                changeType='negative'
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
                title='Resolved'
                value={mockComplaintStats.resolvedComplaints.toString()}
                change={`${(
                  (mockComplaintStats.resolvedComplaints /
                    mockComplaintStats.totalComplaints) *
                  100
                ).toFixed(1)}% resolution rate`}
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
                title='Pending'
                value={mockComplaintStats.pendingComplaints.toString()}
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
                title='Avg Resolution Time'
                value={`${mockComplaintStats.avgResolutionTime} days`}
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
                value='91.3%'
                change='+3.2% from last month'
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

            {/* Complaint Charts */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
              <PieChart
                data={mockComplaintStats.complaintCategories}
                title='Complaints by Category'
                onViewDetail={handleViewDetailedChart}
              />

              <div className='bg-white rounded-2xl border border-[#D4D4D4] p-6'>
                <h3 className='text-sh2b text-[#141414] mb-6'>
                  Recent Complaints
                </h3>
                <div className='space-y-4'>
                  {[
                    {
                      id: 'CMP-001',
                      category: 'Kualitas Pekerjaan',
                      status: 'Resolved',
                      date: '2024-01-15',
                    },
                    {
                      id: 'CMP-002',
                      category: 'Waktu Tunggu',
                      status: 'In Progress',
                      date: '2024-01-14',
                    },
                    {
                      id: 'CMP-003',
                      category: 'Komunikasi',
                      status: 'Resolved',
                      date: '2024-01-13',
                    },
                  ].map((complaint, index) => (
                    <div
                      key={index}
                      className='flex items-center justify-between p-3 bg-[#F5F9FC] rounded-xl'
                    >
                      <div>
                        <div className='text-b2m text-[#141414]'>
                          {complaint.id}
                        </div>
                        <div className='text-b3 text-[#9E9E9E]'>
                          {complaint.category}
                        </div>
                      </div>
                      <div className='text-right'>
                        <span
                          className={`px-2 py-1 rounded-lg text-xs ${
                            complaint.status === 'Resolved'
                              ? 'bg-green-50 text-green-700 border border-green-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {complaint.status}
                        </span>
                        <div className='text-b3 text-[#9E9E9E] mt-1'>
                          {complaint.date}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Modals */}
        <ExportReportModal
          isOpen={isModalOpen(MODAL_IDS.EXPORT_REPORT)}
          onClose={handleCloseModal}
          selectedReport={selectedReport}
          selectedPeriod={selectedPeriod}
          onConfirm={handleExportConfirm}
        />

        <DetailedChartModal
          isOpen={isModalOpen(MODAL_IDS.DETAILED_CHART)}
          onClose={handleCloseModal}
          title={chartModalData?.title || ''}
          chartData={chartModalData?.data || []}
          chartType={chartModalData?.type || 'bar'}
        />

        <CustomReportModal
          isOpen={isModalOpen(MODAL_IDS.CUSTOM_REPORT)}
          onClose={handleCloseModal}
          onConfirm={handleCustomReportConfirm}
        />
      </div>
    </AdminLayout>
  );
}
