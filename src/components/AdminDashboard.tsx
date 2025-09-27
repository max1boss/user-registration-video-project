import React from 'react';
import UserList from './UserList';
import EditUserModal from './EditUserModal';
import UserDetailModal from './UserDetailModal';

interface AdminDashboardProps {
  user: any;
  token: string;
  users: any[];
  statistics: { total_users: number; total_leads: number; total_audios: number };
  isLoading: boolean;
  isExporting: boolean;
  editingUser: any | null;
  showEditModal: boolean;
  selectedUser: any | null;
  showUserDetail: boolean;
  playingAudio: string | null;
  onLogout: () => void;
  onExportCSV: () => void;
  onLoadUsers: () => void;
  onEditUser: (user: any) => void;
  onDeleteUser: (userId: string) => void;
  onUserClick: (user: any) => void;
  onSaveUserChanges: (user: any) => void;
  onCloseEditModal: () => void;
  onCloseUserDetail: () => void;
  onAudioPlay: (audioId: string) => void;
  onAudioPause: () => void;
  parseChildInfo: (comments: string) => any;
  formatDuration: (seconds: number) => string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  token,
  users,
  statistics,
  isLoading,
  isExporting,
  editingUser,
  showEditModal,
  selectedUser,
  showUserDetail,
  playingAudio,
  onLogout,
  onExportCSV,
  onLoadUsers,
  onEditUser,
  onDeleteUser,
  onUserClick,
  onSaveUserChanges,
  onCloseEditModal,
  onCloseUserDetail,
  onAudioPlay,
  onAudioPause,
  parseChildInfo,
  formatDuration
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          {/* Заголовок админ панели */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Админ панель</h1>
              <p className="text-gray-600">Добро пожаловать, {user.name}</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={onExportCSV}
                disabled={isExporting || users.length === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isExporting ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Экспорт...
                  </>
                ) : (
                  <>📋 Экспорт CSV</>
                )}
              </button>
              <button 
                onClick={onLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Выйти
              </button>
            </div>
          </div>
          
          {/* Статистические карточки */}
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
          
          {/* Список пользователей */}
          <UserList
            users={users}
            statistics={statistics}
            isLoading={isLoading}
            onLoadUsers={onLoadUsers}
            onEditUser={onEditUser}
            onDeleteUser={onDeleteUser}
            onUserClick={onUserClick}
          />
          
          {/* Модальные окна */}
          <EditUserModal
            editingUser={editingUser}
            showEditModal={showEditModal}
            onSaveUserChanges={onSaveUserChanges}
            onCloseEditModal={onCloseEditModal}
          />
          
          <UserDetailModal
            selectedUser={selectedUser}
            showUserDetail={showUserDetail}
            playingAudio={playingAudio}
            onCloseUserDetail={onCloseUserDetail}
            onAudioPlay={onAudioPlay}
            onAudioPause={onAudioPause}
            parseChildInfo={parseChildInfo}
            formatDuration={formatDuration}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;