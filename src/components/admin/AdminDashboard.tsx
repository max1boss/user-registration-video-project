import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import StatisticsCards from '../StatisticsCards';
import UsersList from '../UsersList';
import EditUserModal from './EditUserModal';
import UserDetailModal from './UserDetailModal';
import { createCSVContent } from '@/utils/csvExport';

interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
  created_at: string;
  leads?: any[];
}

interface AdminDashboardProps {
  user: User;
  token: string;
  onLogout: () => void;
  adminApiUrl: string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  token,
  onLogout,
  adminApiUrl
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [statistics, setStatistics] = useState({ total_users: 0, total_leads: 0, total_audios: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const { toast } = useToast();

  const loadUsers = async () => {
    if (!token) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(adminApiUrl, {
        method: 'GET',
        headers: {
          'X-Auth-Token': token,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки данных');
      }

      const data = await response.json();
      setUsers(data.users || []);
      setStatistics(data.statistics || { total_users: 0, total_leads: 0, total_audios: 0 });
    } catch (error: any) {
      toast({ 
        title: 'Ошибка загрузки', 
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUser = (userToEdit: any) => {
    setEditingUser(userToEdit);
    setShowEditModal(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      return;
    }

    try {
      // Здесь будет запрос на удаление пользователя
      toast({ 
        title: 'Функция в разработке', 
        description: 'Удаление пользователей будет доступно позже',
        variant: 'default'
      });
    } catch (error: any) {
      toast({ 
        title: 'Ошибка удаления', 
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const saveUserChanges = async (updatedUser: any) => {
    try {
      // Здесь будет запрос на обновление пользователя
      setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
      setShowEditModal(false);
      setEditingUser(null);
      

    } catch (error: any) {

    }
  };

  const handleUserClick = (userData: any) => {
    setSelectedUser(userData);
    setShowUserDetail(true);
  };

  const handleAudioPlay = (audioId: string) => {
    setPlayingAudio(audioId);
  };

  const handleAudioPause = () => {
    setPlayingAudio(null);
  };

  const handleExcelExport = async () => {
    setIsExporting(true);
    
    try {
      // Загружаем данные пользователей
      const response = await fetch(adminApiUrl, {
        method: 'GET',
        headers: {
          'X-Auth-Token': token,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки данных');
      }

      const data = await response.json();
      
      // Создаём CSV с правильной кодировкой UTF-8
      const csvContent = createCSVContent(data.users || []);
      // Добавляем BOM для правильного отображения в Excel
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      
      // Создаём ссылку для скачивания
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      

      
    } catch (error: any) {

    } finally {
      setIsExporting(false);
    }
  };

  // Загружаем пользователей при входе администратора
  useEffect(() => {
    if (user?.role === 'admin' && token) {
      loadUsers();
    }
  }, [user, token]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-blue-600">🎥 IMPERIA PROMO</h1>
            <div className="flex gap-3 items-center">
              <button 
                onClick={handleExcelExport}
                disabled={isExporting}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
              >
                {isExporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    CSV
                  </>
                ) : (
                  <>
                    📊 CSV
                  </>
                )}
              </button>
              <button 
                onClick={onLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
              >
                Выйти
              </button>
            </div>
          </div>
          
          <StatisticsCards statistics={statistics} isLoading={isLoading} />
          
          <UsersList
            users={users}
            statistics={statistics}
            isLoading={isLoading}
            onUserClick={handleUserClick}
            onEditUser={handleEditUser}
            onDeleteUser={handleDeleteUser}
            onLoadUsers={loadUsers}
          />
          
          <EditUserModal
            editingUser={editingUser}
            showEditModal={showEditModal}
            onSave={saveUserChanges}
            onClose={() => {
              setShowEditModal(false);
              setEditingUser(null);
            }}
          />
          
          <UserDetailModal
            selectedUser={selectedUser}
            showUserDetail={showUserDetail}
            onClose={() => setShowUserDetail(false)}
            onAudioPlay={handleAudioPlay}
            onAudioPause={handleAudioPause}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;