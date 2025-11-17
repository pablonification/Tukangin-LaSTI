import React, { useState } from 'react';
import Modal from '../Modal';
import Button from '../Button';
import { Order } from '@/app/admin/orders/page';

interface CompleteOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onConfirm: (orderId: string, notes?: string) => void;
}

const CompleteOrderModal = ({
  isOpen,
  onClose,
  order,
  onConfirm,
}: CompleteOrderModalProps) => {
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!order) return null;

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      onConfirm(order.id.toString(), notes);
      onClose();
      setNotes('');
    } catch (error) {
      console.error('Error completing order:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setNotes('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title='Complete Order'
      size='md'
    >
      <div className='space-y-6'>
        {/* Order Summary */}
        <div className='bg-[#F5F9FC] rounded-xl p-4'>
          <h3 className='text-sh2b text-[#141414] mb-3'>Order Summary</h3>
          <div className='space-y-2'>
            <div className='flex justify-between'>
              <span className='text-b3 text-[#9E9E9E]'>Order ID:</span>
              <span className='text-b2 text-[#141414]'>{order.id}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-b3 text-[#9E9E9E]'>Service:</span>
              <span className='text-b2 text-[#141414]'>{order.service}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-b3 text-[#9E9E9E]'>Customer:</span>
              <span className='text-b2 text-[#141414]'>{order.User.name}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-b3 text-[#9E9E9E]'>Assigned Tukang:</span>
              <span className='text-b2 text-[#141414]'>{order.tukangId}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-b3 text-[#9E9E9E]'>Final Price:</span>
              <span className='text-b2b text-green-600'>{order.total}</span>
            </div>
          </div>
        </div>

        {/* Completion Notes */}
        <div>
          <label className='block text-b3 text-[#9E9E9E] mb-2'>
            Completion Notes (Optional)
          </label>
          <textarea
            placeholder='Add any notes about the completed work...'
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className='w-full px-4 py-3 border border-[#D4D4D4] rounded-xl text-b2 focus:outline-none focus:ring-2 focus:ring-[#0082C9] focus:border-transparent resize-none'
          />
          <p className='text-b3 text-[#9E9E9E] mt-2'>
            These notes will be visible to both customer and tukang
          </p>
        </div>

        {/* Confirmation Message */}
        <div className='bg-green-50 border border-green-200 rounded-xl p-4'>
          <div className='flex items-start gap-3'>
            <div className='w-5 h-5 text-green-600 mt-0.5'>
              <svg
                className='w-full h-full'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M5 13l4 4L19 7'
                />
              </svg>
            </div>
            <div>
              <h4 className='text-b2b text-green-800 mb-1'>
                Ready to Complete
              </h4>
              <p className='text-b3 text-green-700'>
                This action will mark the order as completed. The customer will
                be notified and payment will be processed.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='flex flex-col sm:flex-row gap-3 pt-4'>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className='bg-green-600 text-white hover:bg-green-700 disabled:opacity-50'
          >
            {isLoading ? 'Completing...' : 'Complete Order'}
          </Button>
          <Button
            onClick={handleClose}
            variant='secondary'
            className='sm:ml-auto'
          >
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CompleteOrderModal;
