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
  hasServiceAccount?: boolean;
  autoExportEnabled?: boolean;
  onToggleAutoExport?: (enabled: boolean) => void;
}

const AdminStatsCards: React.FC<AdminStatsCardsProps> = ({ stats, onExportToSheets, exportingToSheets, hasServiceAccount, autoExportEnabled, onToggleAutoExport }) => {
  return (
    <div className="space-y-4 mb-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Статистика</h2>
        {onExportToSheets && (
          <div className="flex items-center gap-3">
            {!hasServiceAccount && (
              <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-lg">
                <Icon name="AlertTriangle" size={14} />
                <span>Требуется настройка Google Sheets</span>
              </div>
            )}
            {hasServiceAccount && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-lg">
                  <Icon name="CheckCircle" size={14} />
                  <span>Google Sheets настроен</span>
                </div>
                {onToggleAutoExport && (
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={autoExportEnabled || false}
                      onChange={(e) => onToggleAutoExport(e.target.checked)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-gray-700">Автоэкспорт новых лидов</span>
                  </label>
                )}
              </div>
            )}
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
                  {hasServiceAccount ? 'Экспорт в Google Таблицы' : 'Настроить экспорт'}
                </>
              )}
            </button>
          </div>
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