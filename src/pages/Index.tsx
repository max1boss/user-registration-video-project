import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import AuthForm from '@/components/AuthForm';
import AdminDashboard from '@/components/AdminDashboard';

const API_URLS = {
  auth: 'https://functions.poehali.dev/080ec769-925f-4132-8cd3-549c89bdc4c0',
  admin: 'https://functions.poehali.dev/bf64fc6c-c075-4df6-beb9-f5b527586fa1',
};

interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
}

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [statistics, setStatistics] = useState({ total_users: 0, total_leads: 0, total_audios: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('user_data');
    
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
      }
    }
  }, []);

  const handleAuthSuccess = async (userData: User, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('auth_token', authToken);
    localStorage.setItem('user_data', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    toast({ title: 'Выход выполнен', description: 'До свидания!' });
  };

  const loadUsers = async () => {
    if (!token) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(API_URLS.admin, {
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
      setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
      setShowEditModal(false);
      setEditingUser(null);
      
      toast({ 
        title: 'Пользователь обновлен', 
        description: 'Изменения сохранены успешно',
        variant: 'default'
      });
    } catch (error: any) {
      toast({ 
        title: 'Ошибка сохранения', 
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    if (user?.role === 'admin' && token) {
      loadUsers();
    }
  }, [user, token]);

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

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const parseChildInfo = (comments: string) => {
    let parentName = '';
    let childName = '';
    let childAge = '';
    let phone = '';
    
    if (comments && comments.trim() !== '') {
      const parts = comments.split(',').map(part => part.trim());
      
      parts.forEach(part => {
        if (part.toLowerCase().startsWith('родитель:')) {
          parentName = part.replace(/^родитель:\s*/i, '').trim();
          if (parentName && parentName !== 'отказ' && parentName !== 'о' && parentName !== 'л' && parentName.length > 1) {
            // Оставляем только если это нормальное имя
          } else {
            parentName = '';
          }
        } else if (part.toLowerCase().startsWith('ребенок:')) {
          childName = part.replace(/^ребенок:\s*/i, '').trim();
          if (childName && childName !== 'о' && childName !== 'отказ' && childName !== 'л' && childName.length > 1) {
            // Оставляем только если это нормальное имя
          } else {
            childName = '';
          }
        } else if (part.toLowerCase().startsWith('возраст:')) {
          childAge = part.replace(/^возраст:\s*/i, '').trim();
          if (childAge && childAge !== 'л' && childAge !== 'о' && childAge !== 'отказ') {
            if (/^\d+/.test(childAge) || childAge.includes('лет') || childAge.includes('год')) {
              // Оставляем
            } else {
              childAge = '';
            }
          } else {
            childAge = '';
          }
        } else if (part.toLowerCase().startsWith('телефон:')) {
          phone = part.replace(/^телефон:\s*/i, '').trim();
          if (phone && phone.length > 5 && (/^\+?\d+/.test(phone) || phone.includes('+'))) {
            // Оставляем
          } else {
            phone = '';
          }
        }
      });
    }
    
    return { parentName, childName, childAge, phone };
  };

  const exportCSV = async () => {
    if (users.length === 0) {
      toast({ 
        title: 'Нет данных', 
        description: 'Список пользователей пуст',
        variant: 'destructive'
      });
      return;
    }

    setIsExporting(true);
    try {
      const csvContent = generateCSV();
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({ 
        title: 'Экспорт завершен', 
        description: 'CSV файл загружен успешно',
        variant: 'default'
      });
    } catch (error: any) {
      toast({ 
        title: 'Ошибка экспорта', 
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const generateCSV = () => {
    const headers = ['Имя пользователя', 'Родитель', 'Ребенок', 'Возраст', 'Телефон'];
    const csvRows = [headers.join(';')];
    
    users.forEach(user => {
      if (user.leads && user.leads.length > 0) {
        user.leads.forEach((lead: any) => {
          const comments = lead.comments || '';
          const leadInfo = parseChildInfo(comments);
          
          const row = [
            `"${(user.name || '').replace(/"/g, '""')}"`,
            `"${leadInfo.parentName.replace(/"/g, '""')}"`,
            `"${leadInfo.childName.replace(/"/g, '""')}"`,
            `"${leadInfo.childAge.replace(/"/g, '""')}"`,
            `"${leadInfo.phone.replace(/"/g, '""')}"`
          ];
          csvRows.push(row.join(';'));
        });
      } else {
        const row = [
          `"${(user.name || '').replace(/"/g, '""')}"`,
          '', '', '', ''
        ];
        csvRows.push(row.join(';'));
      }
    });
    
    return csvRows.join('\r\n');
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingUser(null);
  };

  const handleCloseUserDetail = () => {
    setShowUserDetail(false);
    setSelectedUser(null);
  };

  if (!user) {
    return (
      <AuthForm 
        onAuthSuccess={handleAuthSuccess}
        apiUrl={API_URLS.auth}
      />
    );
  }

  if (user.role === 'admin') {
    return (
      <AdminDashboard
        user={user}
        token={token}
        users={users}
        statistics={statistics}
        isLoading={isLoading}
        isExporting={isExporting}
        editingUser={editingUser}
        showEditModal={showEditModal}
        selectedUser={selectedUser}
        showUserDetail={showUserDetail}
        playingAudio={playingAudio}
        onLogout={handleLogout}
        onExportCSV={exportCSV}
        onLoadUsers={loadUsers}
        onEditUser={handleEditUser}
        onDeleteUser={handleDeleteUser}
        onUserClick={handleUserClick}
        onSaveUserChanges={saveUserChanges}
        onCloseEditModal={handleCloseEditModal}
        onCloseUserDetail={handleCloseUserDetail}
        onAudioPlay={handleAudioPlay}
        onAudioPause={handleAudioPause}
        parseChildInfo={parseChildInfo}
        formatDuration={formatDuration}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-success/5">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Личный кабинет</h1>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Выйти
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Добро пожаловать!</h2>
            <p className="text-gray-600 mb-4">
              Привет, <strong>{user.name}</strong>! 
            </p>
            <p className="text-gray-600">
              Email: <strong>{user.email}</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;