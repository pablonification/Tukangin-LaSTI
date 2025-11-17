import React, { useState } from 'react';
import Modal from '../Modal';
import Button from '../Button';

interface Customer {
  id: string;
  name: string;
  phone: string;
  lastOrder?: string;
  status: 'active' | 'inactive';
}

interface TemplateMessage {
  id: string;
  name: string;
  category: 'order' | 'payment' | 'service' | 'general';
  content: string;
  variables: string[];
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  lastOrder?: string;
  status: 'active' | 'inactive';
}

interface MessageData {
  messageType: 'template' | 'custom';
  templateId?: string;
  customMessage?: string;
  customerIds: string[];
  customerData: Customer[];
}

interface SendWhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (messageData: MessageData) => void;
}

const SendWhatsAppModal = ({ isOpen, onClose, onConfirm }: SendWhatsAppModalProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [customMessage, setCustomMessage] = useState('');
  const [messageType, setMessageType] = useState<'template' | 'custom'>('template');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectAll, setSelectAll] = useState(false);

  // Mock data - replace with real API calls
  const templateMessages: TemplateMessage[] = [
    {
      id: 'welcome',
      name: 'Welcome Message',
      category: 'general',
      content: 'Selamat datang di TukangIn! Kami siap membantu Anda dengan semua kebutuhan perbaikan dan perawatan rumah.',
      variables: [],
    },
    {
      id: 'order-confirmation',
      name: 'Order Confirmation',
      category: 'order',
      content: 'Halo {customer_name}! Pesanan Anda dengan ID {order_id} telah dikonfirmasi. Tukang kami akan segera menghubungi Anda.',
      variables: ['customer_name', 'order_id'],
    },
    {
      id: 'payment-reminder',
      name: 'Payment Reminder',
      category: 'payment',
      content: 'Halo {customer_name}! Mohon segera melunasi pembayaran untuk pesanan {order_id} sebesar {amount}.',
      variables: ['customer_name', 'order_id', 'amount'],
    },
    {
      id: 'service-completed',
      name: 'Service Completed',
      category: 'service',
      content: 'Halo {customer_name}! Layanan {service_type} untuk pesanan {order_id} telah selesai. Terima kasih telah menggunakan TukangIn!',
      variables: ['customer_name', 'service_type', 'order_id'],
    },
    {
      id: 'follow-up',
      name: 'Follow-up Message',
      category: 'general',
      content: 'Halo {customer_name}! Bagaimana kualitas layanan TukangIn? Kami sangat menghargai feedback Anda.',
      variables: ['customer_name'],
    },
  ];

  const customers: Customer[] = [
    {
      id: 'CUST-001',
      name: 'John Doe',
      phone: '+6281234567890',
      lastOrder: 'ORD-001',
      status: 'active',
    },
    {
      id: 'CUST-002',
      name: 'Jane Smith',
      phone: '+6281234567891',
      lastOrder: 'ORD-002',
      status: 'active',
    },
    {
      id: 'CUST-003',
      name: 'Bob Johnson',
      phone: '+6281234567892',
      lastOrder: 'ORD-003',
      status: 'inactive',
    },
    {
      id: 'CUST-004',
      name: 'Alice Brown',
      phone: '+6281234567893',
      lastOrder: 'ORD-004',
      status: 'active',
    },
    {
      id: 'CUST-005',
      name: 'Charlie Wilson',
      phone: '+6281234567894',
      status: 'active',
    },
  ];

  const selectedTemplateData = templateMessages.find(t => t.id === selectedTemplate);

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    setErrors(prev => ({ ...prev, template: '' }));
  };

  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomers(prev => {
      const newSelection = prev.includes(customerId)
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId];

      setSelectAll(newSelection.length === customers.length);
      return newSelection;
    });
  };

  const handleSelectAllCustomers = () => {
    if (selectAll) {
      setSelectedCustomers([]);
      setSelectAll(false);
    } else {
      setSelectedCustomers(customers.map(c => c.id));
      setSelectAll(true);
    }
  };

  const handleMessageTypeChange = (type: 'template' | 'custom') => {
    setMessageType(type);
    setSelectedTemplate('');
    setCustomMessage('');
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (messageType === 'template' && !selectedTemplate) {
      newErrors.template = 'Please select a template message';
    }

    if (messageType === 'custom' && !customMessage.trim()) {
      newErrors.customMessage = 'Please enter a custom message';
    }

    if (selectedCustomers.length === 0) {
      newErrors.customers = 'Please select at least one customer';
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
      const messageData = {
        messageType,
        templateId: messageType === 'template' ? selectedTemplate : undefined,
        customMessage: messageType === 'custom' ? customMessage : undefined,
        customerIds: selectedCustomers,
        customerData: customers.filter(c => selectedCustomers.includes(c.id)),
      };

      await onConfirm(messageData);
      handleClose();
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedTemplate('');
    setSelectedCustomers([]);
    setCustomMessage('');
    setMessageType('template');
    setSelectAll(false);
    setErrors({});
    onClose();
  };

  const categoryColors = {
    order: 'bg-blue-50 text-blue-700 border border-blue-200',
    payment: 'bg-green-50 text-green-700 border border-green-200',
    service: 'bg-purple-50 text-purple-700 border border-purple-200',
    general: 'bg-gray-50 text-gray-700 border border-gray-200',
  };

  const statusColors = {
    active: 'bg-green-50 text-green-700 border border-green-200',
    inactive: 'bg-red-50 text-red-700 border border-red-200',
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Send WhatsApp Message" size="lg">
      <div className="space-y-6">
        {/* Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <div>
              <h4 className="text-b2b text-blue-800 mb-1">WhatsApp Messaging</h4>
              <p className="text-b3 text-blue-700">
                Send template messages or custom messages to selected customers. Messages will be sent instantly via WhatsApp.
              </p>
            </div>
          </div>
        </div>

        {/* Message Type Selection */}
        <div>
          <h3 className="text-sh2b text-[#141414] mb-4">Message Type</h3>
          <div className="flex gap-3">
            <button
              onClick={() => handleMessageTypeChange('template')}
              className={`flex-1 py-3 px-4 rounded-xl border transition-all ${
                messageType === 'template'
                  ? 'border-[#0082C9] bg-[#E0F1FE] text-[#0082C9]'
                  : 'border-[#D4D4D4] hover:border-[#0082C9]/50 text-[#141414]'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-b2 font-medium">Template Message</span>
              </div>
            </button>

            <button
              onClick={() => handleMessageTypeChange('custom')}
              className={`flex-1 py-3 px-4 rounded-xl border transition-all ${
                messageType === 'custom'
                  ? 'border-[#0082C9] bg-[#E0F1FE] text-[#0082C9]'
                  : 'border-[#D4D4D4] hover:border-[#0082C9]/50 text-[#141414]'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span className="text-b2 font-medium">Custom Message</span>
              </div>
            </button>
          </div>
        </div>

        {/* Template Selection */}
        {messageType === 'template' && (
          <div>
            <h3 className="text-sh2b text-[#141414] mb-4">Select Template</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {templateMessages.map((template) => (
                <div
                  key={template.id}
                  className={`border rounded-xl p-4 cursor-pointer transition-all ${
                    selectedTemplate === template.id
                      ? 'border-[#0082C9] bg-[#F0F8FF]'
                      : 'border-[#D4D4D4] hover:border-[#0082C9]/50'
                  }`}
                  onClick={() => handleTemplateChange(template.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="radio"
                          checked={selectedTemplate === template.id}
                          onChange={() => handleTemplateChange(template.id)}
                          className="w-4 h-4 text-[#0082C9] border-[#D4D4D4] focus:ring-[#0082C9]"
                        />
                        <span className="text-b2b text-[#141414]">{template.name}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                          categoryColors[template.category] || 'bg-gray-50 text-gray-700 border border-gray-200'
                        }`}>
                          {template.category}
                        </span>
                      </div>
                      <p className="text-b3 text-[#9E9E9E] mb-2">{template.content}</p>
                      {template.variables.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-b3 text-[#9E9E9E]">Variables:</span>
                          <div className="flex gap-1">
                            {template.variables.map((variable) => (
                              <span key={variable} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                                {variable}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {errors.template && (
              <div className="text-b3 text-red-600 mt-2">{errors.template}</div>
            )}
          </div>
        )}

        {/* Custom Message */}
        {messageType === 'custom' && (
          <div>
            <label className="block text-b3 text-[#9E9E9E] mb-2">
              Custom Message <span className="text-red-500">*</span>
            </label>
            <textarea
              placeholder="Type your custom message here..."
              value={customMessage}
              onChange={(e) => {
                setCustomMessage(e.target.value);
                if (errors.customMessage) {
                  setErrors(prev => ({ ...prev, customMessage: '' }));
                }
              }}
              rows={5}
              className={`w-full px-4 py-3 border rounded-xl text-b2 focus:outline-none focus:ring-2 focus:ring-[#0082C9] focus:border-transparent resize-none ${
                errors.customMessage ? 'border-red-300' : 'border-[#D4D4D4]'
              }`}
            />
            {errors.customMessage && (
              <div className="text-b3 text-red-600 mt-1">{errors.customMessage}</div>
            )}
            <div className="text-b3 text-[#9E9E9E] mt-1">
              Characters: {customMessage.length}/500
            </div>
          </div>
        )}

        {/* Customer Selection */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sh2b text-[#141414]">Select Recipients ({customers.length})</h3>
            <Button
              onClick={handleSelectAllCustomers}
              variant="secondary"
              size="sm"
            >
              {selectAll ? 'Deselect All' : 'Select All'}
            </Button>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto">
            {customers.map((customer) => (
              <div
                key={customer.id}
                className={`border rounded-xl p-4 cursor-pointer transition-all ${
                  selectedCustomers.includes(customer.id)
                    ? 'border-[#0082C9] bg-[#F0F8FF]'
                    : 'border-[#D4D4D4] hover:border-[#0082C9]/50'
                }`}
                onClick={() => handleCustomerSelect(customer.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        checked={selectedCustomers.includes(customer.id)}
                        onChange={() => handleCustomerSelect(customer.id)}
                        className="w-4 h-4 text-[#0082C9] border-[#D4D4D4] rounded focus:ring-[#0082C9]"
                      />
                      <span className="text-b2b text-[#141414]">{customer.name}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                        statusColors[customer.status] || 'bg-gray-50 text-gray-700 border border-gray-200'
                      }`}>
                        {customer.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-b3">
                      <span className="text-[#9E9E9E]">{customer.phone}</span>
                      {customer.lastOrder && (
                        <span className="text-[#9E9E9E]">Last order: {customer.lastOrder}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {errors.customers && (
            <div className="text-b3 text-red-600 mt-2">{errors.customers}</div>
          )}
        </div>

        {/* Message Summary */}
        {(selectedTemplate || customMessage) && selectedCustomers.length > 0 && (
          <div className="bg-[#F5F9FC] rounded-xl p-4">
            <h4 className="text-b2b text-[#141414] mb-3">Message Summary</h4>
            <div className="space-y-2 text-b3">
              <div className="flex justify-between">
                <span className="text-[#9E9E9E]">Message Type:</span>
                <span className="text-[#141414] font-medium capitalize">{messageType}</span>
              </div>
              {messageType === 'template' && selectedTemplateData && (
                <div className="flex justify-between">
                  <span className="text-[#9E9E9E]">Template:</span>
                  <span className="text-[#141414] font-medium">{selectedTemplateData.name}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[#9E9E9E]">Recipients:</span>
                <span className="text-[#141414] font-medium">
                  {selectedCustomers.length} customer(s)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Send Notice */}
        {(selectedTemplate || customMessage) && selectedCustomers.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <div>
                <h4 className="text-b2b text-orange-800 mb-1">Message Sending</h4>
                <ul className="text-b3 text-orange-700 space-y-1">
                  <li>• Messages will be sent instantly via WhatsApp</li>
                  <li>• Each customer will receive a personalized message</li>
                  <li>• Message delivery status will be tracked</li>
                  <li>• Failed deliveries will be reported</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            onClick={handleConfirm}
            disabled={isLoading || (messageType === 'template' && !selectedTemplate) || (messageType === 'custom' && !customMessage.trim()) || selectedCustomers.length === 0}
            className="bg-[#0082C9] text-white hover:bg-[#0066A3] disabled:opacity-50"
          >
            {isLoading ? 'Sending...' : `Send Message (${selectedCustomers.length})`}
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

export default SendWhatsAppModal;
