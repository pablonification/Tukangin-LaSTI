import React from 'react';
import Modal from '../Modal';
import Button from '../Button';
import { useModal } from '../ModalProvider';
import { Order } from '@/app/admin/orders/page';

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onSetPrice?: (order: Order) => void;
  onCompleteOrder?: (order: Order) => void;
  onAssignTukang?: (order: Order) => void;
}

// Modal IDs
const MODAL_IDS = {
  ORDER_DETAIL: 'order-detail',
  SET_PRICE: 'set-price',
  COMPLETE_ORDER: 'complete-order',
  ASSIGN_TUKANG: 'assign-tukang',
} as const;

const statusColors = {
  'Pending Harga': 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  'Menunggu Pembayaran': 'bg-blue-50 text-blue-700 border border-blue-200',
  Dikerjakan: 'bg-purple-50 text-purple-700 border border-purple-200',
  'Masa Tunggu': 'bg-orange-50 text-orange-700 border border-orange-200',
  Selesai: 'bg-green-50 text-green-700 border border-green-200',
  Batal: 'bg-red-50 text-red-700 border border-red-200',
};


const OrderDetailModal = ({
  isOpen,
  onClose,
  order,
  onSetPrice,
  onCompleteOrder,
  onAssignTukang,
}: OrderDetailModalProps) => {
  const { openModal } = useModal();

  if (!order) return null;

  const handleSetPrice = () => {
    if (onSetPrice) {
      onSetPrice(order);
    } else {
      openModal(MODAL_IDS.SET_PRICE);
    }
  };

  const handleCompleteOrder = () => {
    if (onCompleteOrder) {
      onCompleteOrder(order);
    } else {
      openModal(MODAL_IDS.COMPLETE_ORDER);
    }
  };

  const handleAssignTukang = () => {
    if (onAssignTukang) {
      onAssignTukang(order);
    } else {
      openModal(MODAL_IDS.ASSIGN_TUKANG);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Order Details - ${order.id}`}
      size='lg'
    >
      <div className='space-y-6'>
        {/* Status and Priority */}
        <div className='flex flex-col sm:flex-row gap-4'>
          <div className='flex-1'>
            <label className='block text-b3 text-[#9E9E9E] mb-2'>Status</label>
            <span
              className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${statusColors[order.status as keyof typeof statusColors] || 'bg-gray-50 text-gray-700 border border-gray-200'}`}
            >
              {order.status}
            </span>
          </div>
          <div className='flex-1'>
            <label className='block text-b3 text-[#9E9E9E] mb-2'>
              Priority
            </label>
            <span
              className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap  || 'bg-gray-50 text-gray-700 border border-gray-200'}`}
            >
              no priority
            </span>
          </div>
        </div>

        {/* Customer Information */}
        <div className='bg-[#F5F9FC] rounded-xl p-4'>
          <h3 className='text-sh2b text-[#141414] mb-4'>
            Customer Information
          </h3>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div>
              <label className='block text-b3 text-[#9E9E9E] mb-1'>Name</label>
              <div className='text-b2 text-[#141414]'>{order.receiverName}</div>
            </div>
            <div>
              <label className='block text-b3 text-[#9E9E9E] mb-1'>Phone</label>
              <div className='text-b2 text-[#141414]'>
                {order.receiverPhone}
              </div>
            </div>
          </div>
        </div>

        {/* Service Information */}
        <div className='bg-[#F5F9FC] rounded-xl p-4'>
          <h3 className='text-sh2b text-[#141414] mb-4'>Service Information</h3>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div>
              <label className='block text-b3 text-[#9E9E9E] mb-1'>
                Service
              </label>
              <div className='text-b2 text-[#141414]'>{order.service}</div>
            </div>
            <div>
              <label className='block text-b3 text-[#9E9E9E] mb-1'>
                Category
              </label>
              <div className='text-b2 text-[#141414]'>no priroty yet</div>
            </div>
            <div className='sm:col-span-2'>
              <label className='block text-b3 text-[#9E9E9E] mb-1'>
                Location
              </label>
              <div className='text-b2 text-[#141414]'>{order.address}</div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className='block text-b3 text-[#9E9E9E] mb-2'>
            Description
          </label>
          <div className='bg-[#F5F9FC] rounded-xl p-4'>
            <p className='text-b2 text-[#141414]'>{order.description}</p>
          </div>
        </div>

        {/* Media Information */}
        <div className='bg-[#F5F9FC] rounded-xl p-4'>
          <h3 className='text-sh2b text-[#141414] mb-4'>Media</h3>
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
            <div>
              <label className='block text-b3 text-[#9E9E9E] mb-1'>
                Images
              </label>
              <div className='text-b2b text-[#141414]'>
                {order.attachments} files
              </div>
            </div>
            <div>
              <label className='block text-b3 text-[#9E9E9E] mb-1'>
                Videos
              </label>
              <div className='text-b2b text-[#141414]'>
                {order.attachments} files
              </div>
            </div>
            <div>
              <label className='block text-b3 text-[#9E9E9E] mb-1'>
                Date Created
              </label>
              <div className='text-b2 text-[#141414]'>{order.createdAt}</div>
            </div>
          </div>
        </div>

        {/* Assignment Information */}
        <div className='bg-[#F5F9FC] rounded-xl p-4'>
          <h3 className='text-sh2b text-[#141414] mb-4'>Assignment</h3>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div>
              <label className='block text-b3 text-[#9E9E9E] mb-1'>
                Assigned Tukang
              </label>
              <div className='text-b2 text-[#141414]'>
                {order.tukangId || 'Not assigned'}
              </div>
            </div>
            <div>
              <label className='block text-b3 text-[#9E9E9E] mb-1'>
                Pricing
              </label>
              <div className='text-b2b text-[#141414]'>
                {order.total ? (
                  <span className='text-green-600'>{order.total}</span>
                ) : (
                  <span className='text-orange-600'>{order.total}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='flex flex-col sm:flex-row gap-3 pt-4'>
          {order.status === 'Pending Harga' && (
            <Button
              onClick={handleSetPrice}
              className='bg-green-600 text-white hover:bg-green-700'
            >
              Set Price
            </Button>
          )}
          {order.status === 'Dikerjakan' && (
            <Button
              onClick={handleCompleteOrder}
              className='bg-blue-600 text-white hover:bg-blue-700'
            >
              Mark as Completed
            </Button>
          )}
          {!order.tukangId && (
            <Button onClick={handleAssignTukang} variant='secondary'>
              Assign Tukang
            </Button>
          )}
          <Button onClick={onClose} variant='secondary' className='sm:ml-auto'>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default OrderDetailModal;
