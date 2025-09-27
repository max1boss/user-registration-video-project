import React from 'react';
import Icon from '@/components/ui/icon';
import AdminStatsCards from './admin/AdminStatsCards';
import UsersList from './admin/UsersList';
import UserDetails from './admin/UserDetails';
import { useAdminData } from '@/hooks/useAdminData';
import { useAdminActions } from '@/hooks/useAdminActions';
import { useExcelExport } from '@/hooks/useExcelExport';

// Updated: replaced Google Sheets with Excel export

interface AdminPanelProps {
  token: string;
  adminApiUrl: string;
  videoApiUrl: string;
  deleteUserApiUrl: string;
  editUserApiUrl: string;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  token, 
  adminApiUrl, 
  videoApiUrl, 
  deleteUserApiUrl, 
  editUserApiUrl 
}) => {
  // Data management
  const {
    users,
    stats,
    loading,
    selectedUser,
    setSelectedUser,
    loadAdminData,
    formatDate
  } = useAdminData({ token, adminApiUrl });

  // Actions management
  const {
    audioUrl,
    loadingAudio,
    deletingLeadId,
    deletingUserId,
    editingUserId,
    loadAudio,
    closeAudio,
    downloadAudio,
    deleteLead,
    deleteUser,
    editUser,
    downloadAllUserAudios
  } = useAdminActions({
    token,
    videoApiUrl,
    deleteUserApiUrl,
    editUserApiUrl,
    loadAdminData,
    selectedUser,
    setSelectedUser
  });

  // Excel export management
  const {
    exporting,
    exportToExcel
  } = useExcelExport();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Icon name="Loader2" size={32} className="animate-spin mx-auto mb-4" />
          <p>Загрузка данных администратора...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <Icon name="Shield" size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Админ панель</h1>
                <p className="text-sm text-gray-500">Управление пользователями и лидами</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                <Icon name="Circle" size={8} className="inline-block mr-1 fill-current" />
                Онлайн
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <AdminStatsCards 
          stats={stats} 
          onExportToExcel={() => exportToExcel(users)}
          exportingToExcel={exporting}
        />
        
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
          <div className="xl:col-span-1">
            <UsersList
              users={users}
              selectedUser={selectedUser}
              onSelectUser={setSelectedUser}
              onDownloadAllUserAudios={downloadAllUserAudios}
              onDeleteUser={deleteUser}
              onEditUser={editUser}
              deletingUserId={deletingUserId}
              editingUserId={editingUserId}
              formatDate={formatDate}
            />
          </div>
          
          <div className="xl:col-span-2">
            <UserDetails
              selectedUser={selectedUser}
              audioUrl={audioUrl}
              loadingAudio={loadingAudio}
              deletingLeadId={deletingLeadId}
              onLoadAudio={loadAudio}
              onDownloadAudio={downloadAudio}
              onDeleteLead={deleteLead}
              onDownloadAllUserAudios={downloadAllUserAudios}
              onCloseAudio={closeAudio}
              formatDate={formatDate}
              videoApiUrl={videoApiUrl}
              token={token}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;