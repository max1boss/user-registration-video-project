import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import LeadItem from './LeadItem';
import AudioPlayer from './AudioPlayer';

interface Lead {
  id: string;
  title: string;
  comments: string;
  created_at: string;
  audio_filename?: string;
  video_filename?: string; // Для совместимости с бэкендом
  has_audio?: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
  leads: Lead[];
}

interface UserDetailsProps {
  selectedUser: User | null;
  audioUrl: string;
  loadingAudio: boolean;
  deletingLeadId: string | null;
  onLoadAudio: (leadId: string) => void;
  onDownloadAudio: (leadId: string, leadTitle: string, userName: string) => void;
  onDeleteLead: (leadId: string, leadTitle: string) => void;
  onDownloadAllUserAudios: (user: User) => void;
  onCloseAudio: () => void;
  formatDate: (dateString: string) => string;
  // Добавляем API параметры для встроенного плеера
  videoApiUrl?: string;
  token?: string;
}

const UserDetails: React.FC<UserDetailsProps> = ({
  selectedUser,
  audioUrl,
  loadingAudio,
  deletingLeadId,
  onLoadAudio,
  onDownloadAudio,
  onDeleteLead,
  onDownloadAllUserAudios,
  onCloseAudio,
  formatDate,
  videoApiUrl,
  token
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Eye" size={20} />
          {selectedUser ? `Данные: ${selectedUser.name}` : 'Выберите пользователя'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {selectedUser ? (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Информация о пользователе:</h4>
              <div className="text-sm space-y-1">
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>Регистрация:</strong> {formatDate(selectedUser.created_at)}</p>
                <p><strong>Лидов:</strong> {selectedUser.leads.length}</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Лиды пользователя:</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {selectedUser.leads.length > 0 ? (
                  <>
                    <div className="flex gap-2 mb-4 p-3 bg-muted/50 rounded-lg">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDownloadAllUserAudios(selectedUser)}
                        disabled={selectedUser.leads.filter(l => l.has_audio || l.audio_filename || l.video_filename).length === 0}
                      >
                        <Icon name="Download" size={12} className="mr-1" />
                        Скачать все аудио ({selectedUser.leads.filter(l => l.has_audio || l.audio_filename || l.video_filename).length})
                      </Button>
                    </div>
                    
                    {selectedUser.leads.map((lead) => (
                      <LeadItem
                        key={lead.id}
                        lead={lead}
                        userName={selectedUser.name}
                        loadingAudio={loadingAudio}
                        deletingLeadId={deletingLeadId}
                        onLoadAudio={onLoadAudio}
                        onDownloadAudio={onDownloadAudio}
                        onDeleteLead={onDeleteLead}
                        formatDate={formatDate}
                        videoApiUrl={videoApiUrl}
                        token={token}
                      />
                    ))}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    У пользователя пока нет лидов
                  </p>
                )}
              </div>
            </div>

            {audioUrl && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Прослушивание аудио:</h4>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onCloseAudio}
                    className="w-8 h-8 p-0"
                    title="Закрыть аудио"
                  >
                    <Icon name="X" size={14} />
                  </Button>
                </div>
                <AudioPlayer 
                  audioUrl={audioUrl} 
                  leadTitle="Аудио запись" 
                  className=""
                />
              </div>
            )}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            Выберите пользователя из списка слева для просмотра его данных
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default UserDetails;