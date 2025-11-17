import React from 'react';
import Modal from '../Modal';
import Button from '../Button';
import { useModal } from '../ModalProvider';

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

interface TukangDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  tukang: Tukang | null;
  onSuspend?: (tukang: Tukang) => void;
  onActivate?: (tukang: Tukang) => void;
  onViewJobs?: (tukang: Tukang) => void;
}

// Modal IDs
const MODAL_IDS = {
  TUKANG_DETAIL: 'tukang-detail',
  SUSPEND_TUKANG: 'suspend-tukang',
  ACTIVATE_TUKANG: 'activate-tukang',
  TUKANG_JOBS: 'tukang-jobs',
} as const;

const statusColors = {
  Active: 'bg-green-50 text-green-700 border border-green-200',
  Inactive: 'bg-red-50 text-red-700 border border-red-200',
  Suspended: 'bg-orange-50 text-orange-700 border border-orange-200',
};

const TukangDetailModal = ({
  isOpen,
  onClose,
  tukang,
  onSuspend,
  onActivate,
  onViewJobs
}: TukangDetailModalProps) => {
  const { openModal } = useModal();

  if (!tukang) return null;

  const handleSuspend = () => {
    if (onSuspend) {
      onSuspend(tukang);
    } else {
      openModal(MODAL_IDS.SUSPEND_TUKANG);
    }
  };

  const handleActivate = () => {
    if (onActivate) {
      onActivate(tukang);
    } else {
      openModal(MODAL_IDS.ACTIVATE_TUKANG);
    }
  };

  const handleViewJobs = () => {
    if (onViewJobs) {
      onViewJobs(tukang);
    } else {
      openModal(MODAL_IDS.TUKANG_JOBS);
    }
  };

  const completionRate = tukang.totalJobs > 0
    ? ((tukang.completedJobs / tukang.totalJobs) * 100).toFixed(1)
    : '0';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Tukang Details - ${tukang.id}`} size="lg">
      <div className="space-y-6">
        {/* Profile Header */}
        <div className="bg-[#F5F9FC] rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-[#E0F1FE] rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-h3b text-[#0082C9] font-medium">
                {tukang.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-sh2b text-[#141414]">{tukang.name}</h2>
                {tukang.verified && (
                  <span className="px-2 py-1 bg-green-50 text-green-700 border border-green-200 text-xs rounded-lg font-medium">
                    ✓ Verified
                  </span>
                )}
              </div>
              <div className="text-b2 text-[#9E9E9E] mb-2">{tukang.email}</div>
              <div className="text-b2 text-[#9E9E9E]">{tukang.phone}</div>
            </div>
            <div className="text-right">
              <span className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                statusColors[tukang.status as keyof typeof statusColors] ||
                'bg-gray-50 text-gray-700 border border-gray-200'
              }`}>
                {tukang.status}
              </span>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#F5F9FC] rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-[#0082C9] mb-1">{tukang.rating.toFixed(1)}</div>
            <div className="text-b3 text-[#9E9E9E] flex items-center justify-center">
              <span className="text-yellow-500 mr-1">★</span>
              Rating
            </div>
          </div>
          <div className="bg-[#F5F9FC] rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-[#0082C9] mb-1">{tukang.totalJobs}</div>
            <div className="text-b3 text-[#9E9E9E]">Total Jobs</div>
          </div>
          <div className="bg-[#F5F9FC] rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">{completionRate}%</div>
            <div className="text-b3 text-[#9E9E9E]">Completion Rate</div>
          </div>
          <div className="bg-[#F5F9FC] rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-[#0082C9] mb-1">{tukang.responseTime}</div>
            <div className="text-b3 text-[#9E9E9E]">Response Time</div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="bg-[#F5F9FC] rounded-xl p-4">
          <h3 className="text-sh2b text-[#141414] mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-b3 text-[#9E9E9E] mb-1">Full Name</label>
              <div className="text-b2 text-[#141414]">{tukang.name}</div>
            </div>
            <div>
              <label className="block text-b3 text-[#9E9E9E] mb-1">Phone Number</label>
              <div className="text-b2 text-[#141414]">{tukang.phone}</div>
            </div>
            <div>
              <label className="block text-b3 text-[#9E9E9E] mb-1">Email Address</label>
              <div className="text-b2 text-[#141414]">{tukang.email}</div>
            </div>
            <div>
              <label className="block text-b3 text-[#9E9E9E] mb-1">Location</label>
              <div className="text-b2 text-[#141414]">{tukang.location}</div>
            </div>
            <div>
              <label className="block text-b3 text-[#9E9E9E] mb-1">Join Date</label>
              <div className="text-b2 text-[#141414]">{tukang.joinDate}</div>
            </div>
            <div>
              <label className="block text-b3 text-[#9E9E9E] mb-1">Last Active</label>
              <div className="text-b2 text-[#141414]">{tukang.lastActive}</div>
            </div>
          </div>
        </div>

        {/* Specialization */}
        <div className="bg-[#F5F9FC] rounded-xl p-4">
          <h3 className="text-sh2b text-[#141414] mb-4">Specialization</h3>
          <div className="flex flex-wrap gap-2">
            {tukang.specialization.map((spec, index) => (
              <span
                key={index}
                className="px-3 py-2 bg-[#0082C9] text-white text-sm rounded-lg font-medium"
              >
                {spec}
              </span>
            ))}
          </div>
        </div>

        {/* Performance Stats */}
        <div className="bg-[#F5F9FC] rounded-xl p-4">
          <h3 className="text-sh2b text-[#141414] mb-4">Performance Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#0082C9] mb-2">{tukang.completedJobs}</div>
              <div className="text-b3 text-[#9E9E9E]">Completed Jobs</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{tukang.earnings}</div>
              <div className="text-b3 text-[#9E9E9E]">Total Earnings</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#0082C9] mb-2">{tukang.responseTime}</div>
              <div className="text-b3 text-[#9E9E9E]">Avg Response Time</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            onClick={handleViewJobs}
            className="bg-[#0082C9] text-white hover:bg-[#0066A3]"
          >
            View Job History
          </Button>
          {tukang.status === 'Active' ? (
            <Button
              onClick={handleSuspend}
              variant="secondary"
              className="bg-orange-600 text-white hover:bg-orange-700"
            >
              Suspend Tukang
            </Button>
          ) : (
            <Button
              onClick={handleActivate}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              Activate Tukang
            </Button>
          )}
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

export default TukangDetailModal;
