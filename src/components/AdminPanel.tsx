import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import AdminStatsCards from './admin/AdminStatsCards';
import UsersList from './admin/UsersList';
import UserDetails from './admin/UserDetails';

interface Lead {
  id: string;
  title: string;
  comments: string;
  created_at: string;
  audio_filename?: string;
  has_audio: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
  leads: Lead[];
}

interface AdminStats {
  total_users: number;
  total_leads: number;
  total_audios: number;
}

interface AdminPanelProps {
  token: string;
  adminApiUrl: string;
  videoApiUrl: string;
  deleteUserApiUrl: string;
  editUserApiUrl: string;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ token, adminApiUrl, videoApiUrl, deleteUserApiUrl, editUserApiUrl }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<AdminStats>({ total_users: 0, total_leads: 0, total_audios: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [deletingLeadId, setDeletingLeadId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const response = await fetch(adminApiUrl, {
        method: 'GET',
        headers: {
          'X-Auth-Token': token,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Admin API response data:', data);
        console.log('Statistics from API:', data.statistics);
        const newUsers = data.users || [];
        setUsers(newUsers);
        setStats(data.statistics || { total_users: 0, total_leads: 0, total_audios: 0 });
        
        // Update selected user with fresh data if one was selected
        if (selectedUser) {
          const updatedSelectedUser = newUsers.find((u: User) => u.id === selectedUser.id);
          setSelectedUser(updatedSelectedUser || null);
        }
      } else {
        toast({
          title: 'Ошибка загрузки',
          description: 'Не удалось загрузить данные администратора',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить данные',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAudio = async (leadId: string) => {
    setLoadingAudio(true);
    setAudioUrl('');
    
    try {
      const response = await fetch(`${videoApiUrl}?id=${leadId}`, {
        method: 'GET',
        headers: {
          'X-Auth-Token': token
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Проверяем разные названия поля для совместимости
        const audioUrl = data.audio_url || data.video_url;
        if (audioUrl) {
          setAudioUrl(audioUrl);
        } else {
          toast({
            title: 'Аудио не найдено',
            description: 'Аудио для этого лида не существует',
            variant: 'destructive'
          });
        }
      }
    } catch (error) {
      toast({
        title: 'Ошибка загрузки аудио',
        description: 'Не удалось загрузить аудио',
        variant: 'destructive'
      });
    } finally {
      setLoadingAudio(false);
    }
  };

  const closeAudio = () => {
    setAudioUrl('');
  };

  const downloadAudio = async (leadId: string, leadTitle: string, userName: string) => {
    try {
      const response = await fetch(`${videoApiUrl}?id=${leadId}`, {
        method: 'GET',
        headers: {
          'X-Auth-Token': token
        }
      });

      if (response.ok) {
        const data = await response.json();
        const audioUrl = data.audio_url || data.video_url;
        if (audioUrl) {
          const dataUrl = audioUrl;
          const response = await fetch(dataUrl);
          const blob = await response.blob();
          
          const blobUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = blobUrl;
          
          const cleanUserName = userName.replace(/[^a-zA-Z0-9]/g, '_');
          const cleanTitle = leadTitle.replace(/[^a-zA-Z0-9]/g, '_');
          
          // Определяем расширение по типу контента
          let extension = '.webm'; // default
          if (data.content_type) {
            if (data.content_type.includes('mp4')) extension = '.m4a';
            else if (data.content_type.includes('ogg')) extension = '.ogg';
          }
          
          link.download = `${cleanUserName}_${cleanTitle}_${leadId}${extension}`;
          
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          URL.revokeObjectURL(blobUrl);
          
          toast({
            title: 'Скачивание начато',
            description: `Аудио "${leadTitle}" от ${userName} загружается`,
          });
        } else {
          toast({
            title: 'Аудио не найдено',
            description: 'Аудио для этого лида не существует',
            variant: 'destructive'
          });
        }
      } else {
        const errorData = await response.json();
        toast({
          title: 'Ошибка доступа',
          description: errorData.error || 'Не удалось получить аудио',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка скачивания',
        description: 'Не удалось скачать аудио',
        variant: 'destructive'
      });
    }
  };

  const deleteLead = async (leadId: string, leadTitle: string) => {
    setDeletingLeadId(leadId);
    
    try {
      const leadsApiUrl = 'https://functions.poehali.dev/a119ce14-9a5b-40de-b18f-3ef1f6dc7484';
      const response = await fetch(`${leadsApiUrl}?lead_id=${leadId}`, {
        method: 'DELETE',
        headers: {
          'X-Auth-Token': token
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          toast({
            title: '✅ Лид удален',
            description: `Лид "${leadTitle}" успешно удален из системы`,
          });
          
          // Reload admin data to refresh the UI (selectedUser will be updated automatically)
          await loadAdminData();
        } else {
          throw new Error(data.error || 'Failed to delete lead');
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Network error');
      }
    } catch (error) {
      toast({
        title: 'Ошибка удаления',
        description: `Не удалось удалить лид: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
        variant: 'destructive'
      });
    } finally {
      setDeletingLeadId(null);
    }
  };



  const deleteUser = async (userId: string, userName: string) => {
    setDeletingUserId(userId);
    
    try {
      const response = await fetch(deleteUserApiUrl, {
        method: 'DELETE',
        headers: {
          'X-Auth-Token': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: userId
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          toast({
            title: '✅ Пользователь удален',
            description: `Пользователь "${userName}" и все его данные удалены из системы`,
          });
          
          // Clear selected user if it was deleted
          if (selectedUser && selectedUser.id === userId) {
            setSelectedUser(null);
          }
          
          // Reload admin data to refresh the UI
          await loadAdminData();
        } else {
          throw new Error(data.error || 'Failed to delete user');
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Network error');
      }
    } catch (error) {
      toast({
        title: 'Ошибка удаления',
        description: `Не удалось удалить пользователя: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
        variant: 'destructive'
      });
    } finally {
      setDeletingUserId(null);
    }
  };

  const editUser = async (userId: string, currentName: string) => {
    const newName = prompt(`Изменить имя пользователя:`, currentName);
    
    if (!newName || newName.trim() === '' || newName === currentName) {
      return; // Cancelled or no changes
    }
    
    setEditingUserId(userId);
    
    try {
      const response = await fetch(editUserApiUrl, {
        method: 'PUT',
        headers: {
          'X-Auth-Token': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: userId,
          new_name: newName.trim()
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          toast({
            title: '✅ Имя пользователя изменено',
            description: `Имя изменено с "${data.user.old_name}" на "${data.user.name}"`,
          });
          
          // Reload admin data to refresh the UI
          await loadAdminData();
        } else {
          throw new Error(data.error || 'Failed to edit user');
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Network error');
      }
    } catch (error) {
      toast({
        title: 'Ошибка редактирования',
        description: `Не удалось изменить имя пользователя: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
        variant: 'destructive'
      });
    } finally {
      setEditingUserId(null);
    }
  };

  const downloadAllUserAudios = async (user: User) => {
    const leadsWithAudio = user.leads.filter(l => l.has_audio || l.audio_filename || l.video_filename);
    
    if (leadsWithAudio.length === 0) {
      toast({
        title: 'Нет аудиозаписей',
        description: 'У этого пользователя нет аудиозаписей для скачивания',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: `Скачивание ${leadsWithAudio.length} аудиозаписей`,
      description: `Начинаем скачивание всех аудио пользователя ${user.name}`,
    });

    for (const lead of leadsWithAudio) {
      try {
        await downloadAudio(lead.id, lead.title, user.name);
        // Небольшая задержка между скачиваниями
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error downloading audio for lead ${lead.id}:`, error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Moscow'
    });
  };

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
      <AdminStatsCards stats={stats} />
      
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