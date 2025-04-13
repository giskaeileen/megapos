// components/SubscriptionInfoCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';

interface SubscriptionInfoCardProps {
  startDate: string;
  endDate: string;
  remainingDays: number;
  totalDays: number;
  onAddQuota: () => void;
}

const SubscriptionInfoCard: React.FC<SubscriptionInfoCardProps> = ({
  startDate,
  endDate,
  remainingDays,
  totalDays,
  onAddQuota
}) => {
  const remainingDaysPercentage = ((remainingDays / totalDays) * 100).toFixed(2);

  return (
    <div className="panel p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Package Information</h2>

      <div className="space-y-4">
        <div className="mb-6">
          <table>
            <tbody>
              <tr>
                <td className="!px-0">Start Date</td>
                <td className="!px-0">{new Date(startDate).toLocaleDateString()}</td>
              </tr>
              <tr>
                <td className="!px-0">End Date</td>
                <td className="!px-0">{new Date(endDate).toLocaleDateString()}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <span className="font-medium">Remaining days:</span>
            <span>
              {/* {remainingDays} hari ({remainingDaysPercentage}%) */}
              {remainingDays} days 
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-400 to-blue-600" 
              style={{ width: `${remainingDaysPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-auto pt-6">
        <button onClick={onAddQuota} className="btn btn-info">
          Add Qouota
        </button>
        <Link to="/subs-page" className="btn btn-primary">
          Subscription
        </Link>
      </div>
    </div>
  );
};

export default SubscriptionInfoCard;