import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
}

export const StatCard = ({ title, value, change, changeType = 'neutral', icon }: StatCardProps) => {
  const changeColors = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-[#9E9E9E]'
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#D4D4D4]">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-b2 text-[#9E9E9E] mb-1">{title}</div>
          <div className="text-sh2b text-[#141414]">{value}</div>
          {change && (
            <div className={`text-b3 mt-1 ${changeColors[changeType]}`}>
              {change}
            </div>
          )}
        </div>
        {icon && (
          <div className="text-[#0082C9]">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};
