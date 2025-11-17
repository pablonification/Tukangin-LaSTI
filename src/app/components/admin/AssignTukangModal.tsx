import React, { useState } from 'react';
import Modal from '../Modal';
import Button from '../Button';
import { Order } from '@/app/admin/orders/page';

interface Tukang {
  id: string;
  name: string;
  phone: string;
  specialization: string;
  rating: number;
  completedOrders: number;
  isAvailable: boolean;
}

interface AssignTukangModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onConfirm: (orderId: string, tukangId: string) => void;
}

// Mock tukang data - in real app this would come from API
const mockTukang: Tukang[] = [
  {
    id: 'TK-001',
    name: 'Ahmad Surya',
    phone: '+6281234567890',
    specialization: 'Perpipaan',
    rating: 4.8,
    completedOrders: 45,
    isAvailable: true,
  },
  {
    id: 'TK-002',
    name: 'Budi Santoso',
    phone: '+6281234567891',
    specialization: 'Kelistrikan',
    rating: 4.6,
    completedOrders: 32,
    isAvailable: true,
  },
  {
    id: 'TK-003',
    name: 'Candra Wijaya',
    phone: '+6281234567892',
    specialization: 'Konstruksi',
    rating: 4.9,
    completedOrders: 67,
    isAvailable: false,
  },
  {
    id: 'TK-004',
    name: 'Dedi Kurniawan',
    phone: '+6281234567893',
    specialization: 'AC',
    rating: 4.7,
    completedOrders: 28,
    isAvailable: true,
  },
  {
    id: 'TK-005',
    name: 'Eko Prasetyo',
    phone: '+6281234567894',
    specialization: 'Perpipaan',
    rating: 4.5,
    completedOrders: 19,
    isAvailable: true,
  },
];

const AssignTukangModal = ({
  isOpen,
  onClose,
  order,
  onConfirm,
}: AssignTukangModalProps) => {
  const [selectedTukangId, setSelectedTukangId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  if (!order) return null;

  // Filter tukang based on service category and availability
  const availableTukang = mockTukang.filter((tukang) => {
    const isSpecialized =
      tukang.specialization === order.service ||
      tukang.specialization === 'General';
    return tukang.isAvailable && isSpecialized;
  });

  const handleConfirm = async () => {
    if (!selectedTukangId) return;

    setIsLoading(true);
    try {
      onConfirm(order.id.toString(), selectedTukangId);
      onClose();
      setSelectedTukangId('');
    } catch (error) {
      console.error('Error assigning tukang:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedTukangId('');
    onClose();
  };

  const selectedTukang = mockTukang.find((t) => t.id === selectedTukangId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title='Assign Tukang to Order'
      size='lg'
    >
      <div className='space-y-6'>
        {/* Order Summary */}
        <div className='bg-[#F5F9FC] rounded-xl p-4'>
          <h3 className='text-sh2b text-[#141414] mb-3'>Order Summary</h3>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div className='flex justify-between'>
              <span className='text-b3 text-[#9E9E9E]'>Order ID:</span>
              <span className='text-b2 text-[#141414]'>{order.id}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-b3 text-[#9E9E9E]'>Service:</span>
              <span className='text-b2 text-[#141414]'>{order.service}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-b3 text-[#9E9E9E]'>Category:</span>
              <span className='text-b2 text-[#141414]'>{order.service}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-b3 text-[#9E9E9E]'>Location:</span>
              <span className='text-b2 text-[#141414]'>{order.address}</span>
            </div>
          </div>
        </div>

        {/* Available Tukang */}
        <div>
          <h3 className='text-sh2b text-[#141414] mb-4'>
            Available Tukang ({availableTukang.length})
          </h3>

          {availableTukang.length === 0 ? (
            <div className='text-center py-8'>
              <p className='text-b2 text-[#9E9E9E]'>
                No tukang available for this service category
              </p>
            </div>
          ) : (
            <div className='space-y-3 max-h-96 overflow-y-auto'>
              {availableTukang.map((tukang) => (
                <div
                  key={tukang.id}
                  className={`border rounded-xl p-4 cursor-pointer transition-all ${
                    selectedTukangId === tukang.id
                      ? 'border-[#0082C9] bg-[#F0F8FF]'
                      : 'border-[#D4D4D4] hover:border-[#0082C9]/50'
                  }`}
                  onClick={() => setSelectedTukangId(tukang.id)}
                >
                  <div className='flex items-start justify-between'>
                    <div className='flex items-start gap-3 flex-1'>
                      <input
                        type='radio'
                        checked={selectedTukangId === tukang.id}
                        onChange={() => setSelectedTukangId(tukang.id)}
                        className='w-4 h-4 text-[#0082C9] border-[#D4D4D4] rounded focus:ring-[#0082C9] mt-1'
                      />
                      <div className='flex-1'>
                        <div className='flex items-center gap-2 mb-2'>
                          <span className='text-b2b text-[#141414]'>
                            {tukang.name}
                          </span>
                          <span className='text-b3 text-[#9E9E9E]'>
                            ({tukang.id})
                          </span>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              tukang.isAvailable
                                ? 'bg-green-50 text-green-700'
                                : 'bg-red-50 text-red-700'
                            }`}
                          >
                            {tukang.isAvailable ? 'Available' : 'Busy'}
                          </span>
                        </div>
                        <p className='text-b3 text-[#9E9E9E] mb-2'>
                          {tukang.phone}
                        </p>
                        <div className='flex items-center gap-4 text-b3 text-[#9E9E9E]'>
                          <span>Specialization: {tukang.specialization}</span>
                          <span>•</span>
                          <span>Rating: {tukang.rating} ⭐</span>
                          <span>•</span>
                          <span>{tukang.completedOrders} orders completed</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Tukang Summary */}
        {selectedTukang && (
          <div className='bg-[#E0F1FE] rounded-xl p-4'>
            <h4 className='text-b2b text-[#0082C9] mb-2'>Selected Tukang</h4>
            <div className='space-y-1'>
              <p className='text-b2 text-[#141414]'>
                <strong>{selectedTukang.name}</strong>
              </p>
              <p className='text-b3 text-[#9E9E9E]'>
                Specialization: {selectedTukang.specialization}
              </p>
              <p className='text-b3 text-[#9E9E9E]'>
                Rating: {selectedTukang.rating} ⭐ •{' '}
                {selectedTukang.completedOrders} completed orders
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className='flex flex-col sm:flex-row gap-3 pt-4'>
          <Button
            onClick={handleConfirm}
            disabled={!selectedTukangId || isLoading}
            className='bg-[#0082C9] text-white hover:bg-[#0066A3] disabled:opacity-50'
          >
            {isLoading ? 'Assigning...' : 'Assign Tukang'}
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

export default AssignTukangModal;
