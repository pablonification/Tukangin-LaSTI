import React, { useState } from 'react';
import Modal from '../Modal';
import Button from '../Button';

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

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onConfirm: (userId: string, updates: Partial<User>) => void;
}

const EditUserModal = ({ isOpen, onClose, user, onConfirm }: EditUserModalProps) => {
  const [formData, setFormData] = useState<Partial<User>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  // Initialize form data when user changes
  React.useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        specialization: user.specialization || [],
      });
      setEmailError('');
    }
  }, [user]);

  if (!user) return null;

  const availableSpecializations = [
    'AC Installation',
    'AC Repair',
    'AC Maintenance',
    'Plumbing',
    'Electrical',
    'Carpentry',
    'Painting',
    'Cleaning',
    'Appliance Repair',
    'Home Renovation',
    'Pest Control',
    'Gardening',
    'Security System',
    'Internet/Cable',
    'Locksmith',
    'Moving Services',
  ];

  const handleInputChange = (field: keyof User, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear email error when user starts typing
    if (field === 'email' && emailError) {
      setEmailError('');
    }
  };

  const handleSpecializationToggle = (specialization: string) => {
    const currentSpecs = formData.specialization || [];
    const newSpecs = currentSpecs.includes(specialization)
      ? currentSpecs.filter(spec => spec !== specialization)
      : [...currentSpecs, specialization];

    setFormData(prev => ({ ...prev, specialization: newSpecs }));
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleConfirm = async () => {
    if (!formData.name?.trim() || !formData.email?.trim()) {
      return;
    }

    if (!validateEmail(formData.email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Call the actual confirm handler
      await onConfirm(user.id, formData);

      console.log('User updated successfully:', { userId: user.id, updates: formData });
      handleClose();
    } catch (error) {
      console.error('Error updating user:', error);
      setEmailError('Failed to update user. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({});
    setEmailError('');
    onClose();
  };

  const isFormValid = formData.name?.trim() && formData.email?.trim() && validateEmail(formData.email);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Edit Account - ${user.id}`} size="lg">
      <div className="space-y-6">
        {/* Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <div>
              <h4 className="text-b2b text-blue-800 mb-1">Edit Account Information</h4>
              <p className="text-b3 text-blue-700">
                Update account details. Changes will take effect immediately.
              </p>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-sh2b text-[#141414]">Basic Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-b3 text-[#9E9E9E] mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter full name"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-3 border border-[#D4D4D4] rounded-xl text-b2 focus:outline-none focus:ring-2 focus:ring-[#0082C9] focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-b3 text-[#9E9E9E] mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="e.g. +6281234567890"
                value={formData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-4 py-3 border border-[#D4D4D4] rounded-xl text-b2 focus:outline-none focus:ring-2 focus:ring-[#0082C9] focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-b3 text-[#9E9E9E] mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              placeholder="user@example.com"
              value={formData.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl text-b2 focus:outline-none focus:ring-2 focus:ring-[#0082C9] focus:border-transparent ${
                emailError ? 'border-red-300' : 'border-[#D4D4D4]'
              }`}
              required
            />
            {emailError && (
              <div className="text-b3 text-red-600 mt-1">{emailError}</div>
            )}
            <div className="text-b3 text-[#9E9E9E] mt-1">
              This email is used for authentication and cannot be changed here.
            </div>
          </div>
        </div>

        {/* Specializations (only for tukang) */}
        {user.role === 'tukang' && (
          <div>
            <label className="block text-b3 text-[#9E9E9E] mb-3">
              Specializations
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {availableSpecializations.map((specialization) => (
                <label key={specialization} className="flex items-center gap-3 p-3 border border-[#D4D4D4] rounded-xl cursor-pointer hover:bg-[#F5F9FC]">
                  <input
                    type="checkbox"
                    checked={formData.specialization?.includes(specialization) || false}
                    onChange={() => handleSpecializationToggle(specialization)}
                    className="text-[#0082C9] border-[#D4D4D4] rounded focus:ring-[#0082C9]"
                  />
                  <span className="text-b2 text-[#141414]">{specialization}</span>
                </label>
              ))}
            </div>
            <div className="text-b3 text-[#9E9E9E] mt-2">
              Selected: {formData.specialization?.length || 0} specialization{(formData.specialization?.length || 0) !== 1 ? 's' : ''}
            </div>
          </div>
        )}

        {/* Account Summary */}
        <div className="bg-[#F5F9FC] rounded-xl p-4">
          <h4 className="text-b2b text-[#141414] mb-3">Account Summary</h4>
          <div className="space-y-2 text-b3">
            <div className="flex justify-between">
              <span className="text-[#9E9E9E]">Account ID:</span>
              <span className="text-[#141414] font-medium">{user.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#9E9E9E]">Role:</span>
              <span className="text-[#141414] font-medium capitalize">
                {user.role.replace('_', ' ')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#9E9E9E]">Status:</span>
              <span className="text-[#141414] font-medium capitalize">{user.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#9E9E9E]">Created:</span>
              <span className="text-[#141414] font-medium">
                {new Date(user.createdAt).toLocaleDateString('id-ID')}
              </span>
            </div>
            {user.role === 'tukang' && (
              <div className="flex justify-between">
                <span className="text-[#9E9E9E]">Specializations:</span>
                <span className="text-[#141414] font-medium">
                  {formData.specialization?.length || 0}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            onClick={handleConfirm}
            disabled={isLoading || !isFormValid}
            className="bg-[#0082C9] text-white hover:bg-[#0066A3] disabled:opacity-50"
          >
            {isLoading ? 'Updating...' : 'Update Account'}
          </Button>
          <Button
            onClick={handleClose}
            variant="secondary"
            className="sm:ml-auto"
          >
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default EditUserModal;
