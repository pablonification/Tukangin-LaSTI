import React, { useState, useMemo } from 'react';
import Modal from '../Modal';
import Button from '../Button';

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

interface Job {
  id: string;
  customerName: string;
  service: string;
  location: string;
  amount: string;
  status: string;
  date: string;
  rating: number;
  review: string;
}

interface TukangJobsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tukang: Tukang | null;
}

// Mock job data - in real app this would come from API
const generateMockJobs = (tukangId: string): Job[] => {
  const services = ['AC Installation', 'Electrical Repair', 'Plumbing', 'Construction', 'Painting'];
  const locations = ['Jakarta Pusat', 'Jakarta Barat', 'Jakarta Selatan', 'Jakarta Utara', 'Jakarta Timur'];
  const statuses = ['Completed', 'In Progress', 'Cancelled'];

  return Array.from({ length: Math.floor(Math.random() * 15) + 5 }, (_, i) => ({
    id: `JOB-${tukangId}-${String(i + 1).padStart(3, '0')}`,
    customerName: ['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Brown', 'Charlie Wilson'][Math.floor(Math.random() * 5)],
    service: services[Math.floor(Math.random() * services.length)],
    location: locations[Math.floor(Math.random() * locations.length)],
    amount: `Rp ${(Math.floor(Math.random() * 500) + 50) * 10000}`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('id-ID'),
    rating: Math.floor(Math.random() * 5) + 1,
    review: ['Great service!', 'Very professional', 'Completed on time', 'Highly recommended', 'Excellent work'][Math.floor(Math.random() * 5)]
  }));
};

const statusColors = {
  Completed: 'bg-green-50 text-green-700 border border-green-200',
  'In Progress': 'bg-blue-50 text-blue-700 border border-blue-200',
  Cancelled: 'bg-red-50 text-red-700 border border-red-200',
};

const TukangJobsModal = ({
  isOpen,
  onClose,
  tukang
}: TukangJobsModalProps) => {
  const [filterStatus, setFilterStatus] = useState('all');

  const jobs = useMemo(() => {
    if (!tukang) return [];
    return generateMockJobs(tukang.id);
  }, [tukang]);

  const filteredJobs = useMemo(() => {
    if (filterStatus === 'all') return jobs;
    return jobs.filter(job => job.status === filterStatus);
  }, [jobs, filterStatus]);

  const jobStats = useMemo(() => {
    const total = jobs.length;
    const completed = jobs.filter(job => job.status === 'Completed').length;
    const inProgress = jobs.filter(job => job.status === 'In Progress').length;
    const cancelled = jobs.filter(job => job.status === 'Cancelled').length;
    const averageRating = jobs.filter(job => job.status === 'Completed').length > 0
      ? (jobs.filter(job => job.status === 'Completed').reduce((sum, job) => sum + job.rating, 0) / jobs.filter(job => job.status === 'Completed').length).toFixed(1)
      : '0';
    const totalEarnings = jobs
      .filter(job => job.status === 'Completed')
      .reduce((sum, job) => sum + parseInt(job.amount.replace(/[^0-9]/g, '')), 0);

    return { total, completed, inProgress, cancelled, averageRating, totalEarnings };
  }, [jobs]);

  if (!tukang) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Job History - ${tukang.name}`} size="xl">
      <div className="space-y-6">
        {/* Job Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#F5F9FC] rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-[#0082C9] mb-1">{jobStats.total}</div>
            <div className="text-b3 text-[#9E9E9E]">Total Jobs</div>
          </div>
          <div className="bg-[#F5F9FC] rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">{jobStats.completed}</div>
            <div className="text-b3 text-[#9E9E9E]">Completed</div>
          </div>
          <div className="bg-[#F5F9FC] rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-yellow-500 mb-1">{jobStats.averageRating}</div>
            <div className="text-b3 text-[#9E9E9E]">Avg Rating</div>
          </div>
          <div className="bg-[#F5F9FC] rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">Rp {(jobStats.totalEarnings / 1000000).toFixed(1)}M</div>
            <div className="text-b3 text-[#9E9E9E]">Total Earnings</div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === 'all'
                ? 'bg-[#0082C9] text-white'
                : 'bg-[#F5F9FC] text-[#141414] hover:bg-[#E0F1FE]'
            }`}
          >
            All Jobs ({jobStats.total})
          </button>
          <button
            onClick={() => setFilterStatus('Completed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === 'Completed'
                ? 'bg-green-600 text-white'
                : 'bg-[#F5F9FC] text-[#141414] hover:bg-[#E0F1FE]'
            }`}
          >
            Completed ({jobStats.completed})
          </button>
          <button
            onClick={() => setFilterStatus('In Progress')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === 'In Progress'
                ? 'bg-blue-600 text-white'
                : 'bg-[#F5F9FC] text-[#141414] hover:bg-[#E0F1FE]'
            }`}
          >
            In Progress ({jobStats.inProgress})
          </button>
          <button
            onClick={() => setFilterStatus('Cancelled')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === 'Cancelled'
                ? 'bg-red-600 text-white'
                : 'bg-[#F5F9FC] text-[#141414] hover:bg-[#E0F1FE]'
            }`}
          >
            Cancelled ({jobStats.cancelled})
          </button>
        </div>

        {/* Jobs List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredJobs.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-b2 text-[#9E9E9E]">No jobs found</div>
            </div>
          ) : (
            filteredJobs.map((job) => (
              <div key={job.id} className="bg-[#F5F9FC] rounded-xl p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-b2b text-[#141414]">{job.id}</div>
                      <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                        statusColors[job.status as keyof typeof statusColors] ||
                        'bg-gray-50 text-gray-700 border border-gray-200'
                      }`}>
                        {job.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <div className="text-b3 text-[#9E9E9E]">
                        <span className="font-medium">Customer:</span> {job.customerName}
                      </div>
                      <div className="text-b3 text-[#9E9E9E]">
                        <span className="font-medium">Service:</span> {job.service}
                      </div>
                      <div className="text-b3 text-[#9E9E9E]">
                        <span className="font-medium">Location:</span> {job.location}
                      </div>
                      <div className="text-b3 text-[#9E9E9E]">
                        <span className="font-medium">Date:</span> {job.date}
                      </div>
                    </div>
                    {job.status === 'Completed' && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center">
                          <span className="text-yellow-500 mr-1">★</span>
                          <span className="text-b3 text-[#141414]">{job.rating}/5</span>
                        </div>
                        <span className="text-b3 text-[#9E9E9E]">•</span>
                        <span className="text-b3 text-[#9E9E9E] italic">&ldquo;{job.review}&rdquo;</span>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-b2b text-green-600 mb-1">{job.amount}</div>
                    <div className="text-b3 text-[#9E9E9E]">{job.date}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
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

export default TukangJobsModal;
