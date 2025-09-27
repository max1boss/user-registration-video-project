import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface Lead {
  id: string;
  title: string;
  comments: string;
  created_at: string;
  audio_filename?: string;
  has_audio: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
  leads: Lead[];
}

export interface AdminStats {
  total_users: number;
  total_leads: number;
  total_audios: number;
}

interface UseAdminDataProps {
  token: string;
  adminApiUrl: string;
}

export const useAdminData = ({ token, adminApiUrl }: UseAdminDataProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<AdminStats>({ total_users: 0, total_leads: 0, total_audios: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const { toast } = useToast();

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
        const newUsers = data.users || [];
        setUsers(newUsers);
        const stats = data.statistics || { total_users: 0, total_leads: 0, total_audios: 0 };
        // Совместимость с разными названиями полей
        if (stats.total_videos !== undefined && stats.total_audios === undefined) {
          stats.total_audios = stats.total_videos;
        }
        setStats(stats);
        
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

  useEffect(() => {
    loadAdminData();
  }, []);

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

  return {
    users,
    stats,
    loading,
    selectedUser,
    setSelectedUser,
    loadAdminData,
    formatDate
  };
};