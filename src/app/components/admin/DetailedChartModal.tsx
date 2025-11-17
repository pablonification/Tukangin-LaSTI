import React from 'react';
import Modal from '../Modal';
import Button from '../Button';

interface BarChartData {
  name?: string;
  month?: string;
  revenue?: number;
  orders?: number;
  percentage?: number;
}

interface PieChartData {
  name?: string;
  status?: string;
  category?: string;
  count?: number;
  percentage?: number;
}

interface DetailedChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  chartData: BarChartData[] | PieChartData[];
  chartType: 'bar' | 'pie';
}

// Simple chart components (same as in reports page)
const DetailedBarChart = ({ data, title }: { data: BarChartData[]; title: string }) => (
  <div className="bg-white rounded-2xl border border-[#D4D4D4] p-8">
    <h3 className="text-sh2b text-[#141414] mb-8 text-center">{title}</h3>
    <div className="space-y-6">
      {data.map((item, index) => (
        <div key={index}>
          <div className="flex justify-between mb-3">
            <span className="text-b2 text-[#141414]">
              {item.name || item.month}
            </span>
            <span className="text-b2m text-[#0082C9]">
              {item.revenue
                ? `Rp ${(item.revenue / 1000000).toFixed(1)}M`
                : item.orders}
            </span>
          </div>
          <div className="w-full bg-[#F5F9FC] rounded-full h-4">
            <div
              className="bg-[#0082C9] h-4 rounded-full transition-all duration-500"
              style={{
                width: item.percentage
                  ? `${item.percentage}%`
                  : item.revenue
                  ? `${(item.revenue / 6100000) * 100}%`
                  : item.orders
                  ? `${(item.orders / 234) * 100}%`
                  : '0%',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const DetailedPieChart = ({ data, title }: { data: PieChartData[]; title: string }) => (
  <div className="bg-white rounded-2xl border border-[#D4D4D4] p-8">
    <h3 className="text-sh2b text-[#141414] mb-8 text-center">{title}</h3>
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={index} className="flex items-center justify-between p-4 bg-[#F5F9FC] rounded-xl">
          <div className="flex items-center">
            <div
              className="w-5 h-5 rounded-full mr-4"
              style={{
                backgroundColor: [
                  '#0082C9',
                  '#0CA2EB',
                  '#4FC3F7',
                  '#81D4FA',
                  '#B3E5FC',
                ][index % 5],
              }}
            />
            <span className="text-b2 text-[#141414]">
              {item.name || item.status || item.category}
            </span>
          </div>
          <div className="text-right">
            <div className="text-b2m text-[#0082C9]">
              {item.count || item.percentage}%
            </div>
            {item.percentage && (
              <div className="text-b3 text-[#9E9E9E]">{item.percentage}%</div>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const DetailedChartModal = ({
  isOpen,
  onClose,
  title,
  chartData,
  chartType
}: DetailedChartModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="xl">
      <div className="py-4">
        {chartType === 'bar' ? (
          <DetailedBarChart data={chartData as BarChartData[]} title={title} />
        ) : (
          <DetailedPieChart data={chartData as PieChartData[]} title={title} />
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6">
          <Button
            onClick={onClose}
            variant="secondary"
            className="sm:ml-auto"
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DetailedChartModal;
