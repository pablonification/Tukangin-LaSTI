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
  tukangList?: Tukang[];
}

const AssignTukangModal = ({
  isOpen,
  onClose,
  order,
  onConfirm,
  tukangList = [],
}: AssignTukangModalProps) => {
  const [selectedTukangId, setSelectedTukangId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Filter tukang based on service category and availability
  const availableTukang = React.useMemo(() => {
    if (!order) return [];
    
    return tukangList.filter((tukang) => {
      // Check if tukang's specialization matches order category
      const specializationLower = tukang.specialization.toLowerCase();
      const categoryLower = (order.category || '').toLowerCase();
      const serviceLower = (order.service || '').toLowerCase();
      
      const isSpecialized =
        specializationLower === categoryLower ||
        specializationLower === serviceLower ||
        tukang.specialization === 'General' ||
        categoryLower.includes(specializationLower) ||
        specializationLower.includes(categoryLower);
      
      return (tukang.isAvailable ?? true) && isSpecialized;
    });
  }, [order, tukangList]);
  
  // Sort by rating and completed orders
  const sortedTukang = React.useMemo(() => {
    return [...availableTukang].sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      return b.completedOrders - a.completedOrders;
    });
  }, [availableTukang]);
  
  // Auto-select best match if only one available
  React.useEffect(() => {
    if (sortedTukang.length === 1 && !selectedTukangId) {
      setSelectedTukangId(sortedTukang[0].id);
    }
  }, [sortedTukang, selectedTukangId]);

  if (!order) return null;

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

  const selectedTukang = tukangList.find((t) => t.id === selectedTukangId);

  // Check if DP is paid
  const isDpPaid = order.status !== 'PENDING' && order.paidAt;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title='Assign Tukang to Order'
      size='lg'
    >
      <div className='space-y-6'>
        {/* DP Payment Warning */}
        {!isDpPaid && (
          <div className='bg-red-50 border border-red-200 rounded-xl p-4'>
            <div className='flex items-start gap-3'>
              <span className='text-red-600 text-xl'>⚠️</span>
              <div>
                <h4 className='text-b2b text-red-900 mb-1'>DP Payment Required</h4>
                <p className='text-b3 text-red-700'>
                  Customer must pay DP (Down Payment) before you can assign a tukang to this order. 
                  Please wait for customer payment confirmation.
                </p>
              </div>
            </div>
          </div>
        )}

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
              <span className='text-b3 text-[#9E9E9E]'>Payment Status:</span>
              <span className={`text-b2 font-medium ${isDpPaid ? 'text-green-600' : 'text-red-600'}`}>
                {isDpPaid ? '✓ DP Paid' : '✗ Waiting DP'}
              </span>
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
            Available Tukang ({sortedTukang.length})
            {sortedTukang.length > 0 && (
              <span className='text-b3 text-[#13BA19] ml-2'>
                ✓ Auto-filtered by category: {order.category}
              </span>
            )}
          </h3>

          {sortedTukang.length === 0 ? (
            <div className='text-center py-8'>
              <p className='text-b2 text-[#9E9E9E] mb-2'>
                No tukang available for this service category
              </p>
              <p className='text-b3 text-[#7D7D7D]'>
                Category: {order.category}
              </p>
            </div>
          ) : (
            <div className='space-y-3 max-h-96 overflow-y-auto'>
              {sortedTukang.map((tukang, index) => (
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
                          {index === 0 && sortedTukang.length > 1 && (
                            <span className='px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium'>
                              ⭐ Best Match
                            </span>
                          )}
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
            disabled={!selectedTukangId || isLoading || !isDpPaid}
            className='bg-[#0082C9] text-white hover:bg-[#0066A3] disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isLoading ? 'Assigning...' : !isDpPaid ? 'Assign (DP Required)' : 'Assign Tukang'}
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
