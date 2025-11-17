import React, { useState } from 'react';
import Image from 'next/image';
import Modal from '../Modal';
import Button from '../Button';

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

interface ConfirmPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (paymentData: {
    paymentId: string;
    action: 'confirm' | 'reject';
    notes?: string;
    paymentData: Payment;
  }) => void;
}

const ConfirmPaymentModal = ({ isOpen, onClose, onConfirm }: ConfirmPaymentModalProps) => {
  const [selectedPayment, setSelectedPayment] = useState<string>('');
  const [action, setAction] = useState<'confirm' | 'reject'>('confirm');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mock data - replace with real API call
  const pendingPayments: Payment[] = [
    {
      id: 'PAY-001',
      orderId: 'ORD-001',
      customer: 'John Doe',
      amount: 'Rp 150,000',
      paymentMethod: 'Transfer Bank',
      paymentDate: '2024-01-15 14:30',
      status: 'pending',
      proofImage: '/api/placeholder/300/200',
      notes: 'Payment for bathroom repair service',
    },
    {
      id: 'PAY-002',
      orderId: 'ORD-002',
      customer: 'Jane Smith',
      amount: 'Rp 500,000',
      paymentMethod: 'E-Wallet',
      paymentDate: '2024-01-15 16:45',
      status: 'pending',
      proofImage: '/api/placeholder/300/200',
      notes: 'AC installation service payment',
    },
    {
      id: 'PAY-003',
      orderId: 'ORD-003',
      customer: 'Bob Johnson',
      amount: 'Rp 200,000',
      paymentMethod: 'Cash',
      paymentDate: '2024-01-14 10:15',
      status: 'pending',
      notes: 'Electrical repair service',
    },
  ];

  const selectedPaymentData = pendingPayments.find(p => p.id === selectedPayment);

  const handlePaymentSelect = (paymentId: string) => {
    setSelectedPayment(paymentId);
    setErrors({});
    setNotes('');
  };

  const handleActionChange = (newAction: 'confirm' | 'reject') => {
    setAction(newAction);
    if (errors.notes) {
      setErrors(prev => ({ ...prev, notes: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedPayment) {
      newErrors.payment = 'Please select a payment to review';
    }

    if (action === 'reject' && !notes.trim()) {
      newErrors.notes = 'Please provide a reason for rejection';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = async () => {
    if (!validateForm()) {
      return;
    }

    if (!selectedPaymentData) return;

    setIsLoading(true);
    try {
      const paymentData = {
        paymentId: selectedPayment,
        action,
        notes: action === 'reject' ? notes : '',
        paymentData: selectedPaymentData,
      };

      await onConfirm(paymentData);
      handleClose();
    } catch (error) {
      console.error('Error processing payment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedPayment('');
    setAction('confirm');
    setNotes('');
    setErrors({});
    onClose();
  };

  const paymentMethodColors = {
    'Transfer Bank': 'bg-blue-50 text-blue-700 border border-blue-200',
    'E-Wallet': 'bg-green-50 text-green-700 border border-green-200',
    'Cash': 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Review & Confirm Payments" size="lg">
      <div className="space-y-6">
        {/* Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <div>
              <h4 className="text-b2b text-blue-800 mb-1">Payment Confirmation</h4>
              <p className="text-b3 text-blue-700">
                Review customer payments and confirm or reject them. Approved payments will update the order status.
              </p>
            </div>
          </div>
        </div>

        {/* Payment Selection */}
        <div>
          <h3 className="text-sh2b text-[#141414] mb-4">Select Payment to Review</h3>

          {pendingPayments.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-b2 text-[#9E9E9E]">No pending payments to review</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {pendingPayments.map((payment) => (
                <div
                  key={payment.id}
                  className={`border rounded-xl p-4 cursor-pointer transition-all ${
                    selectedPayment === payment.id
                      ? 'border-[#0082C9] bg-[#F0F8FF]'
                      : 'border-[#D4D4D4] hover:border-[#0082C9]/50'
                  }`}
                  onClick={() => handlePaymentSelect(payment.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="radio"
                          checked={selectedPayment === payment.id}
                          onChange={() => handlePaymentSelect(payment.id)}
                          className="w-4 h-4 text-[#0082C9] border-[#D4D4D4] focus:ring-[#0082C9]"
                        />
                        <span className="text-b2b text-[#141414]">{payment.id}</span>
                        <span className="text-b3 text-[#9E9E9E]">&bull; {payment.orderId}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                          paymentMethodColors[payment.paymentMethod as keyof typeof paymentMethodColors] ||
                          'bg-gray-50 text-gray-700 border border-gray-200'
                        }`}>
                          {payment.paymentMethod}
                        </span>
                      </div>
                      <p className="text-b2 text-[#141414] mb-1">{payment.customer}</p>
                      <p className="text-b3 text-[#9E9E9E] mb-2">{payment.notes}</p>
                      <div className="flex items-center gap-4 text-b3">
                        <span className="text-green-600 font-medium">{payment.amount}</span>
                        <span className="text-[#9E9E9E]">{payment.paymentDate}</span>
                      </div>
                    </div>
                    {payment.proofImage && (
                      <div className="ml-4">
                        <Image
                          src={payment.proofImage}
                          alt="Payment Proof"
                          width={64}
                          height={64}
                          className="w-16 h-16 object-cover rounded-lg border border-[#D4D4D4]"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          {errors.payment && (
            <div className="text-b3 text-red-600 mt-2">{errors.payment}</div>
          )}
        </div>

        {/* Action Selection */}
        {selectedPayment && (
          <div className="space-y-4">
            <h3 className="text-sh2b text-[#141414]">Review Action</h3>

            <div className="flex gap-3">
              <button
                onClick={() => handleActionChange('confirm')}
                className={`flex-1 py-3 px-4 rounded-xl border transition-all ${
                  action === 'confirm'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-[#D4D4D4] hover:border-green-500/50 text-[#141414]'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-b2 font-medium">Confirm Payment</span>
                </div>
              </button>

              <button
                onClick={() => handleActionChange('reject')}
                className={`flex-1 py-3 px-4 rounded-xl border transition-all ${
                  action === 'reject'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-[#D4D4D4] hover:border-red-500/50 text-[#141414]'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="text-b2 font-medium">Reject Payment</span>
                </div>
              </button>
            </div>

            {/* Rejection Reason */}
            {action === 'reject' && (
              <div>
                <label className="block text-b3 text-[#9E9E9E] mb-2">
                  Reason for Rejection <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="Please provide a reason for rejecting this payment..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className={`w-full px-4 py-3 border rounded-xl text-b2 focus:outline-none focus:ring-2 focus:ring-[#0082C9] focus:border-transparent resize-none ${
                    errors.notes ? 'border-red-300' : 'border-[#D4D4D4]'
                  }`}
                />
                {errors.notes && (
                  <div className="text-b3 text-red-600 mt-1">{errors.notes}</div>
                )}
                <div className="text-b3 text-[#9E9E9E] mt-1">
                  Characters: {notes.length}/200
                </div>
              </div>
            )}
          </div>
        )}

        {/* Payment Summary */}
        {selectedPaymentData && (
          <div className="bg-[#F5F9FC] rounded-xl p-4">
            <h4 className="text-b2b text-[#141414] mb-3">Payment Summary</h4>
            <div className="space-y-2 text-b3">
              <div className="flex justify-between">
                <span className="text-[#9E9E9E]">Payment ID:</span>
                <span className="text-[#141414] font-medium">{selectedPaymentData.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9E9E9E]">Order ID:</span>
                <span className="text-[#141414] font-medium">{selectedPaymentData.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9E9E9E]">Customer:</span>
                <span className="text-[#141414] font-medium">{selectedPaymentData.customer}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9E9E9E]">Amount:</span>
                <span className="text-green-600 font-medium">{selectedPaymentData.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9E9E9E]">Method:</span>
                <span className="text-[#141414] font-medium">{selectedPaymentData.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9E9E9E]">Date:</span>
                <span className="text-[#141414] font-medium">{selectedPaymentData.paymentDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9E9E9E]">Action:</span>
                <span className={`font-medium ${
                  action === 'confirm' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {action === 'confirm' ? 'Confirm Payment' : 'Reject Payment'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action Notice */}
        {selectedPayment && (
          <div className={`border rounded-xl p-4 ${
            action === 'confirm'
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start gap-3">
              <svg className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                action === 'confirm' ? 'text-green-600' : 'text-red-600'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
                  action === 'confirm'
                    ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    : "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                } />
              </svg>
              <div>
                <h4 className={`text-b2b mb-1 ${
                  action === 'confirm' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {action === 'confirm' ? 'Payment Confirmation' : 'Payment Rejection'}
                </h4>
                <ul className={`text-b3 space-y-1 ${
                  action === 'confirm' ? 'text-green-700' : 'text-red-700'
                }`}>
                  {action === 'confirm' ? (
                    <>
                      <li>&bull; Payment will be marked as confirmed</li>
                      <li>&bull; Order status will be updated to &ldquo;Menunggu Pembayaran&rdquo;</li>
                      <li>&bull; Customer will receive confirmation notification</li>
                      <li>&bull; Order can proceed to the next stage</li>
                    </>
                  ) : (
                    <>
                      <li>&bull; Payment will be marked as rejected</li>
                      <li>&bull; Customer will be notified with the reason</li>
                      <li>&bull; Order will remain in pending payment status</li>
                      <li>&bull; Customer can resubmit payment proof</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            onClick={handleConfirm}
            disabled={isLoading || !selectedPayment || (action === 'reject' && !notes.trim())}
            className={`${
              action === 'confirm'
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-red-600 text-white hover:bg-red-700'
            } disabled:opacity-50`}
          >
            {isLoading ? 'Processing...' : action === 'confirm' ? 'Confirm Payment' : 'Reject Payment'}
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

export default ConfirmPaymentModal;
