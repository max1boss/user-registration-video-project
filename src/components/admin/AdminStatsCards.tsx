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
  onExportToSheets?: () => void;
  exportingToSheets?: boolean;
}

const AdminStatsCards: React.FC<AdminStatsCardsProps> = ({ stats, onExportToSheets, exportingToSheets }) => {
  return (
    <div className="space-y-4 mb-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Статистика</h2>
        {onExportToSheets && (
          <button
            onClick={onExportToSheets}
            disabled={exportingToSheets}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            {exportingToSheets ? (
              <>
                <Icon name="Loader2" size={16} className="animate-spin" />
                Экспортирую...
              </>
            ) : (
              <>
                <Icon name="FileSpreadsheet" size={16} />
                Экспорт в Google Таблицы
              </>
            )}
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Icon name="Users" size={24} className="text-blue-500 mr-3" />
            <div>
              <p className="text-2xl font-bold">{stats.total_users}</p>
              <p className="text-sm text-muted-foreground">Пользователей</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Icon name="FileText" size={24} className="text-green-500 mr-3" />
            <div>
              <p className="text-2xl font-bold">{stats.total_leads}</p>
              <p className="text-sm text-muted-foreground">Лидов</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Icon name="Volume2" size={24} className="text-red-500 mr-3" />
            <div>
              <p className="text-2xl font-bold">{stats.total_audios}</p>
              <p className="text-sm text-muted-foreground">Аудиозаписей</p>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default AdminStatsCards;