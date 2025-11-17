import React, { useState } from 'react';
import Modal from '../Modal';
import Button from '../Button';
import { Order } from '@/app/admin/orders/page';

interface BroadcastOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedOrders: string[]) => void;
  availableOrders: Order[];
}

const BroadcastOrderModal = ({
  isOpen,
  onClose,
  onConfirm,
  availableOrders,
}: BroadcastOrderModalProps) => {
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filter orders that can be broadcasted (pending assignment)
  const broadcastableOrders = availableOrders.filter(
    (order) =>
      !order.tukangId && order.status !== 'Selesai' && order.status !== 'Batal',
  );

  const handleOrderSelect = (orderId: string) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId],
    );
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === broadcastableOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(
        broadcastableOrders.map((order) => order.id.toString()),
      );
    }
  };

  const handleConfirm = async () => {
    if (selectedOrders.length === 0) return;

    setIsLoading(true);
    try {
      await onConfirm(selectedOrders);
      onClose();
      setSelectedOrders([]);
    } catch (error) {
      console.error('Error broadcasting orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedOrders([]);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title='Broadcast Orders to Tukang'
      size='lg'
    >
      <div className='space-y-6'>
        {/* Description */}
        <div className='bg-[#F5F9FC] rounded-xl p-4'>
          <p className='text-b2 text-[#141414]'>
            Select orders you want to broadcast to available tukang. They will
            receive notifications about these job opportunities and can apply to
            work on them.
          </p>
        </div>

        {/* Orders List */}
        <div>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-sh2b text-[#141414]'>
              Available Orders ({broadcastableOrders.length})
            </h3>
            {broadcastableOrders.length > 0 && (
              <Button onClick={handleSelectAll} variant='secondary' size='sm'>
                {selectedOrders.length === broadcastableOrders.length
                  ? 'Deselect All'
                  : 'Select All'}
              </Button>
            )}
          </div>

          {broadcastableOrders.length === 0 ? (
            <div className='text-center py-8'>
              <p className='text-b2 text-[#9E9E9E]'>
                No orders available for broadcasting
              </p>
            </div>
          ) : (
            <div className='space-y-3 max-h-96 overflow-y-auto'>
              {broadcastableOrders.map((order) => (
                <div
                  key={order.id}
                  className={`border rounded-xl p-4 cursor-pointer transition-all ${
                    selectedOrders.includes(order.id.toString())
                      ? 'border-[#0082C9] bg-[#F0F8FF]'
                      : 'border-[#D4D4D4] hover:border-[#0082C9]/50'
                  }`}
                  onClick={() => handleOrderSelect(order.id.toString())}
                >
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <div className='flex items-center gap-2 mb-2'>
                        <input
                          type='checkbox'
                          checked={selectedOrders.includes(order.id.toString())}
                          onChange={() =>
                            handleOrderSelect(order.id.toString())
                          }
                          className='w-4 h-4 text-[#0082C9] border-[#D4D4D4] rounded focus:ring-[#0082C9]'
                        />
                        <span className='text-b2b text-[#141414]'>
                          {order.id}
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${'bg-gray-50 text-gray-700'}`}
                        >
                          {/*// no priority yet*/}
                        </span>
                      </div>
                      <p className='text-b2 text-[#141414] mb-1'>
                        {order.service}
                      </p>
                      <p className='text-b3 text-[#9E9E9E] mb-2'>
                        {order.User.name}
                      </p>
                      <p className='text-b3 text-[#9E9E9E]'>{order.address}</p>
                      {order.total ? (
                        <p className='text-b2b text-green-600 mt-1'>
                          {order.total}
                        </p>
                      ) : (
                        <p className='text-b3 text-orange-600 mt-1'>
                          {order.total}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Count */}
        {selectedOrders.length > 0 && (
          <div className='bg-[#E0F1FE] rounded-xl p-4'>
            <p className='text-b2b text-[#0082C9]'>
              {selectedOrders.length} order(s) selected for broadcasting
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className='flex flex-col sm:flex-row gap-3 pt-4'>
          <Button
            onClick={handleConfirm}
            disabled={selectedOrders.length === 0 || isLoading}
            className='bg-[#0082C9] text-white hover:bg-[#0066A3] disabled:opacity-50'
          >
            {isLoading
              ? 'Broadcasting...'
              : `Broadcast ${selectedOrders.length} Order(s)`}
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

export default BroadcastOrderModal;
