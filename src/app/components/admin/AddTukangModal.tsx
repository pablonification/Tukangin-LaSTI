import React, { useState } from 'react';
import Modal from '../Modal';
import Button from '../Button';

interface AddTukangModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (tukangData: TukangData) => void;
}

interface TukangData {
  name: string;
  email: string;
  phone: string;
  specialization: string[];
  address?: string;
  description?: string;
}

const AddTukangModal = ({ isOpen, onClose, onConfirm }: AddTukangModalProps) => {
  const [formData, setFormData] = useState<TukangData>({
    name: '',
    email: '',
    phone: '',
    specialization: [],
    address: '',
    description: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

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

  const handleInputChange = (field: keyof TukangData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear email error when user starts typing
    if (field === 'email' && emailError) {
      setEmailError('');
    }
  };

  const handleSpecializationToggle = (specialization: string) => {
    const currentSpecs = formData.specialization;
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
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      return;
    }

    if (!validateEmail(formData.email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    if (formData.specialization.length === 0) {
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Show success message (you can implement a toast notification here)
      console.log('Tukang account created successfully:', formData);

      // Call the actual confirm handler
      await onConfirm(formData);
      handleClose();
    } catch (error) {
      console.error('Error adding tukang:', error);
      setEmailError('Failed to create tukang account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      specialization: [],
      address: '',
      description: '',
    });
    setEmailError('');
    onClose();
  };

  const isFormValid = formData.name.trim() &&
                     formData.email.trim() &&
                     formData.phone.trim() &&
                     formData.specialization.length > 0 &&
                     validateEmail(formData.email);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Tukang" size="lg">
      <div className="space-y-6">
        {/* Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            <div>
              <h4 className="text-b2b text-blue-800 mb-1">Add New Tukang Account</h4>
              <p className="text-b3 text-blue-700">
                Create a new tukang account. They will receive an email invitation to set up their Google account and join the platform.
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
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-3 border border-[#D4D4D4] rounded-xl text-b2 focus:outline-none focus:ring-2 focus:ring-[#0082C9] focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-b3 text-[#9E9E9E] mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                placeholder="e.g. +6281234567890"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-4 py-3 border border-[#D4D4D4] rounded-xl text-b2 focus:outline-none focus:ring-2 focus:ring-[#0082C9] focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-b3 text-[#9E9E9E] mb-2">
              Google Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              placeholder="tukang@gmail.com"
              value={formData.email}
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
              This email will be used for Google authentication and must be whitelisted first.
            </div>
          </div>

          <div>
            <label className="block text-b3 text-[#9E9E9E] mb-2">
              Address <span className="text-gray-500">(Optional)</span>
            </label>
            <textarea
              placeholder="Service area or home address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-[#D4D4D4] rounded-xl text-b2 focus:outline-none focus:ring-2 focus:ring-[#0082C9] focus:border-transparent resize-none"
            />
          </div>
        </div>

        {/* Specializations */}
        <div>
          <label className="block text-b3 text-[#9E9E9E] mb-3">
            Specializations <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {availableSpecializations.map((specialization) => (
              <label key={specialization} className="flex items-center gap-3 p-3 border border-[#D4D4D4] rounded-xl cursor-pointer hover:bg-[#F5F9FC]">
                <input
                  type="checkbox"
                  checked={formData.specialization.includes(specialization)}
                  onChange={() => handleSpecializationToggle(specialization)}
                  className="text-[#0082C9] border-[#D4D4D4] rounded focus:ring-[#0082C9]"
                />
                <span className="text-b2 text-[#141414]">{specialization}</span>
              </label>
            ))}
          </div>
          <div className="text-b3 text-[#9E9E9E] mt-2">
            Selected: {formData.specialization.length} specialization{formData.specialization.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-b3 text-[#9E9E9E] mb-2">
            Description <span className="text-gray-500">(Optional)</span>
          </label>
          <textarea
            placeholder="Brief description about the tukang's experience, skills, or any additional information..."
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-[#D4D4D4] rounded-xl text-b2 focus:outline-none focus:ring-2 focus:ring-[#0082C9] focus:border-transparent resize-none"
          />
          <div className="text-b3 text-[#9E9E9E] mt-1">
            Characters: {formData.description?.length || 0}/500
          </div>
        </div>

        {/* Form Summary */}
        <div className="bg-[#F5F9FC] rounded-xl p-4">
          <h4 className="text-b2b text-[#141414] mb-3">Account Summary</h4>
          <div className="space-y-2 text-b3">
            <div className="flex justify-between">
              <span className="text-[#9E9E9E]">Name:</span>
              <span className="text-[#141414] font-medium">
                {formData.name || 'Not specified'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#9E9E9E]">Email:</span>
              <span className="text-[#141414] font-medium">
                {formData.email || 'Not specified'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#9E9E9E]">Phone:</span>
              <span className="text-[#141414] font-medium">
                {formData.phone || 'Not specified'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#9E9E9E]">Specializations:</span>
              <span className="text-[#141414] font-medium">
                {formData.specialization.length === 0 ? 'None selected' : formData.specialization.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#9E9E9E]">Status:</span>
              <span className="text-yellow-600 font-medium">Pending Activation</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            onClick={handleConfirm}
            disabled={isLoading || !isFormValid}
            className="bg-[#0082C9] text-white hover:bg-[#0066A3] disabled:opacity-50"
          >
            {isLoading ? 'Creating Account...' : 'Create Tukang Account'}
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

export default AddTukangModal;
