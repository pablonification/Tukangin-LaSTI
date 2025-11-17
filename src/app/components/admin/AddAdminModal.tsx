import React, { useState } from 'react';
import Modal from '../Modal';
import Button from '../Button';

interface AddAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (adminData: AdminData) => void;
}

interface AdminData {
  name: string;
  email: string;
  phone: string;
  department?: string;
  role: 'super_admin' | 'admin' | 'moderator' | 'developer';
  permissions: string[];
}

const AddAdminModal = ({ isOpen, onClose, onConfirm }: AddAdminModalProps) => {
  const [formData, setFormData] = useState<AdminData>({
    name: '',
    email: '',
    phone: '',
    department: '',
    role: 'admin',
    permissions: ['read'],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  const availablePermissions = [
    { value: 'read', label: 'View Data', description: 'Can view orders, users, and reports' },
    { value: 'write', label: 'Manage Content', description: 'Can create and edit content' },
    { value: 'users', label: 'User Management', description: 'Can manage user accounts and tukang' },
    { value: 'orders', label: 'Order Management', description: 'Can manage orders and assignments' },
    { value: 'complaints', label: 'Complaint Handling', description: 'Can manage and resolve complaints' },
    { value: 'reports', label: 'Reports Access', description: 'Can view and export reports' },
    { value: 'settings', label: 'System Settings', description: 'Can modify system settings' },
  ];

  const roleDescriptions = {
    super_admin: 'Full system access with all permissions',
    admin: 'Standard admin access with most permissions',
    moderator: 'Limited access for content moderation',
    developer: 'Technical access for development and system maintenance',
  };

  const handleInputChange = (field: keyof AdminData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear email error when user starts typing
    if (field === 'email' && emailError) {
      setEmailError('');
    }
  };

  const handlePermissionToggle = (permission: string) => {
    const currentPerms = formData.permissions;
    const newPerms = currentPerms.includes(permission)
      ? currentPerms.filter(perm => perm !== permission)
      : [...currentPerms, permission];

    setFormData(prev => ({ ...prev, permissions: newPerms }));
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

    if (formData.permissions.length === 0) {
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Show success message (you can implement a toast notification here)
      console.log('Admin account created successfully:', formData);

      // Call the actual confirm handler
      await onConfirm(formData);
      handleClose();
    } catch (error) {
      console.error('Error adding admin:', error);
      setEmailError('Failed to create admin account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      department: '',
      role: 'admin',
      permissions: ['read'],
    });
    setEmailError('');
    onClose();
  };

  const isFormValid = formData.name.trim() &&
                     formData.email.trim() &&
                     formData.phone.trim() &&
                     formData.permissions.length > 0 &&
                     validateEmail(formData.email);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Admin" size="lg">
      <div className="space-y-6">
        {/* Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            <div>
              <h4 className="text-b2b text-blue-800 mb-1">Add New Admin Account</h4>
              <p className="text-b3 text-blue-700">
                Create a new administrator account. They will receive an email invitation to set up their Google account and access the admin panel.
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
              placeholder="admin@tukangin.com"
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-b3 text-[#9E9E9E] mb-2">
                Department <span className="text-gray-500">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Customer Service, Operations"
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                className="w-full px-4 py-3 border border-[#D4D4D4] rounded-xl text-b2 focus:outline-none focus:ring-2 focus:ring-[#0082C9] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-b3 text-[#9E9E9E] mb-2">
                Admin Role <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value as AdminData['role'])}
                className="w-full px-4 py-3 border border-[#D4D4D4] rounded-xl text-b2 focus:outline-none focus:ring-2 focus:ring-[#0082C9] focus:border-transparent"
              >
                <option value="super_admin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="developer">Developer</option>
                <option value="moderator">Moderator</option>
              </select>
              <div className="text-b3 text-[#9E9E9E] mt-1">
                {roleDescriptions[formData.role]}
              </div>
            </div>
          </div>
        </div>

        {/* Permissions */}
        <div>
          <label className="block text-b3 text-[#9E9E9E] mb-3">
            Permissions <span className="text-red-500">*</span>
          </label>
          <div className="space-y-3">
            {availablePermissions.map((permission) => (
              <label key={permission.value} className="flex items-start gap-3 p-3 border border-[#D4D4D4] rounded-xl cursor-pointer hover:bg-[#F5F9FC]">
                <input
                  type="checkbox"
                  checked={formData.permissions.includes(permission.value)}
                  onChange={() => handlePermissionToggle(permission.value)}
                  className="mt-1 text-[#0082C9] border-[#D4D4D4] rounded focus:ring-[#0082C9]"
                />
                <div className="flex-1">
                  <div className="text-b2b text-[#141414]">{permission.label}</div>
                  <div className="text-b3 text-[#9E9E9E]">{permission.description}</div>
                </div>
              </label>
            ))}
          </div>
          <div className="text-b3 text-[#9E9E9E] mt-2">
            Selected: {formData.permissions.length} permission{formData.permissions.length !== 1 ? 's' : ''}
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
              <span className="text-[#9E9E9E]">Role:</span>
              <span className="text-[#141414] font-medium capitalize">
                {formData.role.replace('_', ' ')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#9E9E9E]">Permissions:</span>
              <span className="text-[#141414] font-medium">
                {formData.permissions.length === 0 ? 'None selected' : formData.permissions.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#9E9E9E]">Department:</span>
              <span className="text-[#141414] font-medium">
                {formData.department || 'Not specified'}
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
            {isLoading ? 'Creating Account...' : 'Create Admin Account'}
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

export default AddAdminModal;
