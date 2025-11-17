import React, { useState } from 'react';
import Modal from '../Modal';
import Button from '../Button';

interface ManageWhitelistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (emails: WhitelistedEmail[]) => void;
}

interface WhitelistedEmail {
  id: string;
  email: string;
  role: 'admin' | 'tukang' | 'developer';
  addedBy: string;
  addedAt: string;
  isActive: boolean;
}

const ManageWhitelistModal = ({ isOpen, onClose, onConfirm }: ManageWhitelistModalProps) => {
  const [emails, setEmails] = useState<WhitelistedEmail[]>([
    {
      id: '1',
      email: 'admin@tukangin.com',
      role: 'admin',
      addedBy: 'System',
      addedAt: '2024-01-10',
      isActive: true,
    },
    {
      id: '2',
      email: 'john.dev@tukangin.com',
      role: 'developer',
      addedBy: 'System',
      addedAt: '2024-01-08',
      isActive: true,
    },
    {
      id: '3',
      email: 'ahmad.surya@gmail.com',
      role: 'tukang',
      addedBy: 'Admin User',
      addedAt: '2024-01-15',
      isActive: true,
    },
    {
      id: '4',
      email: 'budi.santoso@gmail.com',
      role: 'tukang',
      addedBy: 'Admin User',
      addedAt: '2024-01-12',
      isActive: true,
    },
  ]);

  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'tukang' | 'developer'>('tukang');
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAddEmail = () => {
    if (!newEmail.trim()) return;

    if (!validateEmail(newEmail)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    // Check if email already exists
    if (emails.some(e => e.email === newEmail)) {
      setEmailError('This email is already in the whitelist');
      return;
    }

    const newWhitelistedEmail: WhitelistedEmail = {
      id: Date.now().toString(),
      email: newEmail.trim(),
      role: newRole,
      addedBy: 'Current Admin', // This should come from auth context
      addedAt: new Date().toISOString().split('T')[0],
      isActive: true,
    };

    setEmails(prev => [...prev, newWhitelistedEmail]);
    setNewEmail('');
    setNewRole('tukang');
    setEmailError('');
  };

  const handleToggleStatus = (emailId: string) => {
    setEmails(prev => prev.map(email =>
      email.id === emailId
        ? { ...email, isActive: !email.isActive }
        : email
    ));
  };

  const handleRemoveEmail = (emailId: string) => {
    setEmails(prev => prev.filter(email => email.id !== emailId));
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      console.log('Whitelist updated successfully:', emails);
      // TODO: Implement actual API call to update whitelist in backend

      // Show success message
      alert('Whitelist updated successfully!');

      await onConfirm(emails);
      handleClose();
    } catch (error) {
      console.error('Error updating whitelist:', error);
      setEmailError('Failed to update whitelist. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setNewEmail('');
    setNewRole('tukang');
    setEmailError('');
    onClose();
  };

  const activeEmails = emails.filter(e => e.isActive);
  const inactiveEmails = emails.filter(e => !e.isActive);
  const adminEmails = emails.filter(e => e.role === 'admin');
  const tukangEmails = emails.filter(e => e.role === 'tukang');

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Manage Google Email Whitelist" size="xl">
      <div className="space-y-6">
        {/* Information */}
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <div>
              <h4 className="text-b2b text-purple-800 mb-1">Google Email Whitelist</h4>
              <p className="text-b3 text-purple-700">
                Only whitelisted Google email addresses can authenticate and access the platform.
                Manage which emails are allowed to login as admin or tukang.
              </p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#F5F9FC] rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-[#0082C9]">{emails.length}</div>
            <div className="text-b3 text-[#9E9E9E]">Total Emails</div>
          </div>
          <div className="bg-[#F5F9FC] rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{activeEmails.length}</div>
            <div className="text-b3 text-[#9E9E9E]">Active</div>
          </div>
          <div className="bg-[#F5F9FC] rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{adminEmails.length}</div>
            <div className="text-b3 text-[#9E9E9E]">Admins</div>
          </div>
          <div className="bg-[#F5F9FC] rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{tukangEmails.length}</div>
            <div className="text-b3 text-[#9E9E9E]">Tukang</div>
          </div>
        </div>

        {/* Add New Email */}
        <div className="bg-[#F5F9FC] rounded-xl p-4">
          <h3 className="text-sh2b text-[#141414] mb-4">Add New Email</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <input
                type="email"
                placeholder="Enter Google email address"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl text-b2 focus:outline-none focus:ring-2 focus:ring-[#0082C9] focus:border-transparent ${
                  emailError ? 'border-red-300' : 'border-[#D4D4D4]'
                }`}
              />
              {emailError && (
                <div className="text-b3 text-red-600 mt-1">{emailError}</div>
              )}
            </div>
            <div className="flex gap-2">
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as 'admin' | 'tukang' | 'developer')}
                className="px-4 py-3 border border-[#D4D4D4] rounded-xl text-b2 focus:outline-none focus:ring-2 focus:ring-[#0082C9] focus:border-transparent"
              >
                <option value="tukang">Tukang</option>
                <option value="admin">Admin</option>
                <option value="developer">Developer</option>
              </select>
              <Button
                onClick={handleAddEmail}
                disabled={!newEmail.trim() || !validateEmail(newEmail)}
                className="px-6 bg-[#0082C9] text-white hover:bg-[#0066A3] disabled:opacity-50"
              >
                Add
              </Button>
            </div>
          </div>
        </div>

        {/* Email List */}
        <div>
          <h3 className="text-sh2b text-[#141414] mb-4">Whitelisted Emails</h3>

          {/* Active Emails */}
          {activeEmails.length > 0 && (
            <div className="mb-6">
              <h4 className="text-b2b text-green-600 mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Active Emails ({activeEmails.length})
              </h4>
              <div className="space-y-3">
                {activeEmails.map((email) => (
                  <div key={email.id} className="bg-white border border-[#D4D4D4] rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-b2b text-[#141414]">{email.email}</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                            email.role === 'admin'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : email.role === 'developer'
                              ? 'bg-green-50 text-green-700 border border-green-200'
                              : 'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}>
                            {email.role.charAt(0).toUpperCase() + email.role.slice(1)}
                          </span>
                        </div>
                        <div className="text-b3 text-[#9E9E9E]">
                          Added by {email.addedBy} on {new Date(email.addedAt).toLocaleDateString('id-ID')}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleStatus(email.id)}
                          className="px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700"
                        >
                          Deactivate
                        </button>
                        <button
                          onClick={() => handleRemoveEmail(email.id)}
                          className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inactive Emails */}
          {inactiveEmails.length > 0 && (
            <div>
              <h4 className="text-b2b text-red-600 mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                Inactive Emails ({inactiveEmails.length})
              </h4>
              <div className="space-y-3">
                {inactiveEmails.map((email) => (
                  <div key={email.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 opacity-60">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-b2 text-gray-600">{email.email}</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                            email.role === 'admin'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : email.role === 'developer'
                              ? 'bg-green-50 text-green-700 border border-green-200'
                              : 'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}>
                            {email.role.charAt(0).toUpperCase() + email.role.slice(1)}
                          </span>
                        </div>
                        <div className="text-b3 text-gray-500">
                          Added by {email.addedBy} on {new Date(email.addedAt).toLocaleDateString('id-ID')}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleStatus(email.id)}
                          className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                        >
                          Activate
                        </button>
                        <button
                          onClick={() => handleRemoveEmail(email.id)}
                          className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {emails.length === 0 && (
            <div className="text-center py-8 text-[#9E9E9E]">
              No emails in whitelist yet. Add your first email above.
            </div>
          )}
        </div>

        {/* Warning */}
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <h4 className="text-b2b text-orange-800 mb-1">Security Notice</h4>
              <p className="text-b3 text-orange-700">
                Only emails in this whitelist can authenticate using Google. Make sure to keep this list up-to-date and remove access for former employees immediately.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-purple-600 text-white hover:bg-purple-700"
          >
            {isLoading ? 'Saving...' : 'Save Whitelist'}
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

export default ManageWhitelistModal;
