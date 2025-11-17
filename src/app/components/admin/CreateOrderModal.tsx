import React, { useState } from 'react';
import Modal from '../Modal';
import Button from '../Button';

interface OrderData {
  serviceType: string;
  description: string;
  location: string;
  urgency: string;
  estimatedPrice: string;
  customerPhone: string;
}

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (orderData: OrderData) => void;
}

const CreateOrderModal = ({ isOpen, onClose, onConfirm }: CreateOrderModalProps) => {
  const [formData, setFormData] = useState({
    serviceType: '',
    description: '',
    location: '',
    urgency: 'normal',
    estimatedPrice: '',
    customerPhone: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const serviceTypes = [
    'Perbaikan Kamar Mandi',
    'Instalasi AC',
    'Perbaikan Listrik',
    'Perbaikan Pintu',
    'Perbaikan Atap',
    'Perbaikan AC',
    'Plumbing',
    'Electrical',
    'Carpentry',
    'Painting',
    'Home Renovation',
  ];

  const urgencyLevels = [
    { value: 'low', label: 'Low Priority', color: 'bg-green-50 text-green-700 border border-green-200' },
    { value: 'normal', label: 'Normal Priority', color: 'bg-blue-50 text-blue-700 border border-blue-200' },
    { value: 'high', label: 'High Priority', color: 'bg-orange-50 text-orange-700 border border-orange-200' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-50 text-red-700 border border-red-200' },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.serviceType.trim()) {
      newErrors.serviceType = 'Service type is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = 'Customer phone number is required';
    } else if (!/^(\+62|62|0)[8-9][0-9]{7,11}$/.test(formData.customerPhone)) {
      newErrors.customerPhone = 'Please enter a valid Indonesian phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await onConfirm(formData);
      handleClose();
    } catch (error) {
      console.error('Error creating order:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      serviceType: '',
      description: '',
      location: '',
      urgency: 'normal',
      estimatedPrice: '',
      customerPhone: '',
    });
    setErrors({});
    onClose();
  };

  const selectedUrgency = urgencyLevels.find(level => level.value === formData.urgency);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create & Broadcast New Order" size="lg">
      <div className="space-y-6">
        {/* Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <div>
              <h4 className="text-b2b text-blue-800 mb-1">Create & Broadcast New Order</h4>
              <p className="text-b3 text-blue-700">
                Create a new order and automatically broadcast it to all available tukang in the selected location area.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-b3 text-[#9E9E9E] mb-2">
                Service Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.serviceType}
                onChange={(e) => handleInputChange('serviceType', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl text-b2 focus:outline-none focus:ring-2 focus:ring-[#0082C9] focus:border-transparent ${
                  errors.serviceType ? 'border-red-300' : 'border-[#D4D4D4]'
                }`}
              >
                <option value="">Select service type</option>
                {serviceTypes.map((service) => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
              </select>
              {errors.serviceType && (
                <div className="text-b3 text-red-600 mt-1">{errors.serviceType}</div>
              )}
            </div>

            <div>
              <label className="block text-b3 text-[#9E9E9E] mb-2">
                Urgency Level
              </label>
              <select
                value={formData.urgency}
                onChange={(e) => handleInputChange('urgency', e.target.value)}
                className="w-full px-4 py-3 border border-[#D4D4D4] rounded-xl text-b2 focus:outline-none focus:ring-2 focus:ring-[#0082C9] focus:border-transparent"
              >
                {urgencyLevels.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-b3 text-[#9E9E9E] mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              placeholder="Describe the work that needs to be done..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className={`w-full px-4 py-3 border rounded-xl text-b2 focus:outline-none focus:ring-2 focus:ring-[#0082C9] focus:border-transparent resize-none ${
                errors.description ? 'border-red-300' : 'border-[#D4D4D4]'
              }`}
            />
            {errors.description && (
              <div className="text-b3 text-red-600 mt-1">{errors.description}</div>
            )}
            <div className="text-b3 text-[#9E9E9E] mt-1">
              Characters: {formData.description.length}/500
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-b3 text-[#9E9E9E] mb-2">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Jakarta Selatan, Jl. Sudirman No. 123"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl text-b2 focus:outline-none focus:ring-2 focus:ring-[#0082C9] focus:border-transparent ${
                  errors.location ? 'border-red-300' : 'border-[#D4D4D4]'
                }`}
              />
              {errors.location && (
                <div className="text-b3 text-red-600 mt-1">{errors.location}</div>
              )}
            </div>

            <div>
              <label className="block text-b3 text-[#9E9E9E] mb-2">
                Customer Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                placeholder="e.g. +6281234567890"
                value={formData.customerPhone}
                onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl text-b2 focus:outline-none focus:ring-2 focus:ring-[#0082C9] focus:border-transparent ${
                  errors.customerPhone ? 'border-red-300' : 'border-[#D4D4D4]'
                }`}
              />
              {errors.customerPhone && (
                <div className="text-b3 text-red-600 mt-1">{errors.customerPhone}</div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-b3 text-[#9E9E9E] mb-2">
              Estimated Price (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Rp 150,000 - Rp 300,000"
              value={formData.estimatedPrice}
              onChange={(e) => handleInputChange('estimatedPrice', e.target.value)}
              className="w-full px-4 py-3 border border-[#D4D4D4] rounded-xl text-b2 focus:outline-none focus:ring-2 focus:ring-[#0082C9] focus:border-transparent"
            />
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-[#F5F9FC] rounded-xl p-4">
          <h4 className="text-b2b text-[#141414] mb-3">Order Summary</h4>
          <div className="space-y-2 text-b3">
            <div className="flex justify-between">
              <span className="text-[#9E9E9E]">Service:</span>
              <span className="text-[#141414] font-medium">
                {formData.serviceType || 'Not selected'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#9E9E9E]">Urgency:</span>
              <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                selectedUrgency?.color || 'bg-gray-50 text-gray-700 border border-gray-200'
              }`}>
                {selectedUrgency?.label || 'Normal Priority'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#9E9E9E]">Location:</span>
              <span className="text-[#141414] font-medium">
                {formData.location || 'Not specified'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#9E9E9E]">Customer Phone:</span>
              <span className="text-[#141414] font-medium">
                {formData.customerPhone || 'Not provided'}
              </span>
            </div>
            {formData.estimatedPrice && (
              <div className="flex justify-between">
                <span className="text-[#9E9E9E]">Estimated Price:</span>
                <span className="text-[#141414] font-medium">{formData.estimatedPrice}</span>
              </div>
            )}
          </div>
        </div>

        {/* Broadcast Notice */}
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <div>
              <h4 className="text-b2b text-orange-800 mb-1">Broadcast Details</h4>
              <ul className="text-b3 text-orange-700 space-y-1">
                <li>• This order will be created and immediately broadcast to available tukang</li>
                <li>• Tukang will receive a WhatsApp notification with order details</li>
                <li>• First tukang to respond will be automatically assigned to this order</li>
                <li>• You can track this order in the Orders section</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            onClick={handleConfirm}
            disabled={isLoading || Object.keys(errors).length > 0}
            className="bg-[#0082C9] text-white hover:bg-[#0066A3] disabled:opacity-50"
          >
            {isLoading ? 'Creating & Broadcasting...' : 'Create & Broadcast Order'}
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

export default CreateOrderModal;
