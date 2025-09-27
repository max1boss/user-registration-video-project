import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface AdminStats {
  total_users: number;
  total_leads: number;
  total_audios: number;
}

interface AdminStatsCardsProps {
  stats: AdminStats;
  onExportToExcel?: () => void;
  exportingToExcel?: boolean;
}

const AdminStatsCards: React.FC<AdminStatsCardsProps> = ({ stats, onExportToExcel, exportingToExcel }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Статистика
          </h2>
          <p className="text-gray-500 text-sm mt-1">Общая информация по системе</p>
        </div>
        {onExportToExcel && (
          <button
            onClick={onExportToExcel}
            disabled={exportingToExcel}
            className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none transform hover:scale-105 disabled:scale-100"
          >
            {exportingToExcel ? (
              <>
                <Icon name="Loader2" size={18} className="animate-spin" />
                Экспортирую...
              </>
            ) : (
              <>
                <Icon name="Download" size={18} />
                Скачать Excel
              </>
            )}
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Users Card */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
          <Card className="relative bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <Icon name="Users" size={24} className="text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{stats.total_users}</p>
                    <p className="text-sm text-gray-500 font-medium">Пользователей</p>
                  </div>
                </div>
                <div className="text-blue-500">
                  <Icon name="TrendingUp" size={20} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leads Card */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
          <Card className="relative bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl flex items-center justify-center">
                    <Icon name="FileText" size={24} className="text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{stats.total_leads}</p>
                    <p className="text-sm text-gray-500 font-medium">Лидов</p>
                  </div>
                </div>
                <div className="text-emerald-500">
                  <Icon name="Target" size={20} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Audio Card */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
          <Card className="relative bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Icon name="Volume2" size={24} className="text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{stats.total_audios}</p>
                    <p className="text-sm text-gray-500 font-medium">Аудиозаписей</p>
                  </div>
                </div>
                <div className="text-purple-500">
                  <Icon name="Headphones" size={20} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminStatsCards;