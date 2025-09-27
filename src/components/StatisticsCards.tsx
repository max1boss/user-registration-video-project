import React from 'react';

interface StatisticsCardsProps {
  statistics: {
    total_users: number;
    total_leads: number;
    total_audios: number;
  };
  isLoading: boolean;
}

const StatisticsCards: React.FC<StatisticsCardsProps> = ({ statistics, isLoading }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <div className="flex items-center">
          <div className="text-blue-500 text-2xl mr-4">👥</div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {isLoading ? '...' : statistics.total_users}
            </div>
            <div className="text-gray-600">Пользователей</div>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <div className="flex items-center">
          <div className="text-green-500 text-2xl mr-4">📋</div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {isLoading ? '...' : statistics.total_leads}
            </div>
            <div className="text-gray-600">Лидов</div>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <div className="flex items-center">
          <div className="text-red-500 text-2xl mr-4">🔊</div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {isLoading ? '...' : statistics.total_audios}
            </div>
            <div className="text-gray-600">Аудиозаписей</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsCards;