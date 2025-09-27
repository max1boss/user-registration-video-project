import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { User } from './useAdminData';

interface UseAdminActionsProps {
  token: string;
  videoApiUrl: string;
  deleteUserApiUrl: string;
  editUserApiUrl: string;
  loadAdminData: () => Promise<void>;
  selectedUser: User | null;
  setSelectedUser: (user: User | null) => void;
}

export const useAdminActions = ({
  token,
  videoApiUrl,
  deleteUserApiUrl,
  editUserApiUrl,
  loadAdminData,
  selectedUser,
  setSelectedUser
}: UseAdminActionsProps) => {
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [deletingLeadId, setDeletingLeadId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  
  const { toast } = useToast();

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
    const leadsWithAudio = user.leads.filter(l => l.has_audio || l.audio_filename);
    
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

  return {
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
  };
};