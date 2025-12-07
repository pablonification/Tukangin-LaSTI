import React, { useState } from 'react';
import Modal from '../Modal';
import Button from '../Button';
import { Order } from '@/app/admin/orders/page';

interface SetPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onConfirm: (orderId: string, price: string) => void;
}

const SetPriceModal = ({
  isOpen,
  onClose,
  order,
  onConfirm,
}: SetPriceModalProps) => {
  const [price, setPrice] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!order) return null;

  const handleConfirm = async () => {
    if (!price.trim()) return;

    setIsLoading(true);
    try {
      onConfirm(order.id.toString(), price);
      onClose();
      setPrice('');
    } catch (error) {
      console.error('Error setting price:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setPrice('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title='Set Order Price'
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
              <span className='text-b2 text-[#141414]'>{order.User?.name || 'Unknown'}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-b3 text-[#9E9E9E]'>Estimated Price:</span>
              <span className='text-b2 text-orange-600'>{order.total}</span>
            </div>
          </div>
        </div>

        {/* Price Input */}
        <div>
          <label className='block text-b3 text-[#9E9E9E] mb-2'>
            Set Final Price <span className='text-red-500'>*</span>
          </label>
          <div className='relative'>
            <span className='absolute left-4 top-1/2 transform -translate-y-1/2 text-b2 text-[#9E9E9E]'>
              Rp
            </span>
            <input
              type='text'
              placeholder='0'
              value={price}
              onChange={(e) => {
                const value = e.target.value.replace(/[^\d]/g, '');
                setPrice(value ? parseInt(value).toLocaleString('id-ID') : '');
              }}
              className='w-full pl-12 pr-4 py-3 border border-[#D4D4D4] rounded-xl text-b2 focus:outline-none focus:ring-2 focus:ring-[#0082C9] focus:border-transparent'
            />
          </div>
          <p className='text-b3 text-[#9E9E9E] mt-2'>
            Enter the final price for this service
          </p>
        </div>

        {/* Action Buttons */}
        <div className='flex flex-col sm:flex-row gap-3 pt-4'>
          <Button
            onClick={handleConfirm}
            disabled={!price.trim() || isLoading}
            className='bg-green-600 text-white hover:bg-green-700 disabled:opacity-50'
          >
            {isLoading ? 'Setting Price...' : 'Set Price & Confirm'}
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

export default SetPriceModal;
