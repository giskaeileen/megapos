import React from 'react';

interface QuotaProgressBarProps {
  icon: React.ReactNode;
  title: string;
  initial: number;
  used: number;
  current: number;
  color: 'blue' | 'green' | 'purple' | 'yellow' | 'red' | 'indigo'; // Add more colors as needed
}

const QuotaProgressBar: React.FC<QuotaProgressBarProps> = ({ 
  icon, 
  title, 
  initial,
  used,
  current,
  color 
}) => {
  const usagePercentage = current === 0 ? 0 : Math.round((used / current) * 100);

  // Color mapping to Tailwind classes
  const colorClasses = {
    container: {
      blue: 'bg-blue-100 text-blue-500',
      green: 'bg-green-100 text-green-500',
      purple: 'bg-purple-100 text-purple-500',
      yellow: 'bg-yellow-100 text-yellow-500',
      red: 'bg-red-100 text-red-500',
      indigo: 'bg-indigo-100 text-indigo-500',
    },
    progress: {
      blue: 'bg-gradient-to-r from-blue-400 to-blue-600',
      green: 'bg-gradient-to-r from-green-400 to-green-600',
      purple: 'bg-gradient-to-r from-purple-400 to-purple-600',
      yellow: 'bg-gradient-to-r from-yellow-400 to-yellow-600',
      red: 'bg-gradient-to-r from-red-400 to-red-600',
      indigo: 'bg-gradient-to-r from-indigo-400 to-indigo-600',
    }
  };

  return (
    <div className="flex items-center">
      <div className="w-9 h-9 mr-3">
        <div className={`rounded-full w-9 h-9 grid place-content-center ${colorClasses.container[color]}`}>
          {icon}
        </div>
      </div>
      <div className="flex-1">
        <div className="flex font-semibold text-gray-700 mb-1">
          <h6>{title}</h6>
          <p className="ml-auto">
            {used}/{current} 
          </p>
        </div>
        <div className="rounded-full h-2 bg-gray-200 shadow mb-1">
          <div
            className={`${colorClasses.progress[color]} h-full rounded-full`}
            style={{ width: `${usagePercentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default QuotaProgressBar;