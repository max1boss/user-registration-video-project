import React from 'react';
import Icon from '@/components/ui/icon';
import AdminStatsCards from './admin/AdminStatsCards';
import UsersList from './admin/UsersList';
import UserDetails from './admin/UserDetails';
import { useAdminData } from '@/hooks/useAdminData';
import { useAdminActions } from '@/hooks/useAdminActions';
import { useExcelExport } from '@/hooks/useExcelExport';

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
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-7xl">
      <AdminStatsCards 
        stats={stats} 
        onExportToExcel={() => exportToExcel(users)}
        exportingToExcel={exporting}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
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
        />
      </div>
    </div>
  );
};

export default AdminPanel;