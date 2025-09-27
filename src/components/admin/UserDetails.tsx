import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import LeadItem from './LeadItem';
import LeadItem from './LeadItem';
import AudioPlayer from '../ui/AudioPlayer';

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
    <div className="space-y-6">
      {selectedUser ? (
        <>
          {/* User Info Card */}
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 rounded-2xl blur opacity-20"></div>
            <Card className="relative bg-white/90 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl flex items-center justify-center">
                    <span className="text-lg font-bold text-white">
                      {selectedUser.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedUser.name}</h3>
                    <p className="text-sm text-gray-500">Полная информация о пользователе</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                    <Icon name="Mail" size={16} className="text-blue-500" />
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Эл. почта</p>
                      <p className="text-sm font-semibold text-gray-900 truncate">{selectedUser.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-100">
                    <Icon name="Calendar" size={16} className="text-emerald-500" />
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Регистрация</p>
                      <p className="text-sm font-semibold text-gray-900">{formatDate(selectedUser.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                    <Icon name="Target" size={16} className="text-purple-500" />
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Общие лиды</p>
                      <p className="text-sm font-semibold text-gray-900">{selectedUser.leads.length} шт.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Audio Player */}
          {audioUrl && (
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-20"></div>
              <div className="relative bg-white/90 backdrop-blur-sm border-0 shadow-xl rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <Icon name="Headphones" size={20} className="text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Прослушивание аудио</h4>
                      <p className="text-sm text-gray-500">Аудиозапись лида</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onCloseAudio}
                    className="w-10 h-10 p-0 bg-white/70 border-gray-200 hover:bg-white"
                    title="Закрыть аудио"
                  >
                    <Icon name="X" size={16} />
                  </Button>
                </div>
                <AudioPlayer 
                  src={audioUrl} 
                  title="Аудиозапись лида"
                  onClose={onCloseAudio}
                />
              </div>
            </div>
          )}

          {/* Leads List */}
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-2xl blur opacity-20"></div>
            <Card className="relative bg-white/90 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                      <Icon name="FileText" size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Лиды пользователя</h3>
                      <p className="text-sm text-gray-500">{selectedUser.leads.length} всего</p>
                    </div>
                  </div>
                  {selectedUser.leads.filter(l => l.has_audio || l.audio_filename || l.video_filename).length > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDownloadAllUserAudios(selectedUser)}
                      className="bg-white/70 backdrop-blur-sm border-gray-200 hover:bg-white"
                    >
                      <Icon name="Download" size={16} className="mr-2" />
                      Скачать все аудио
                      <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        {selectedUser.leads.filter(l => l.has_audio || l.audio_filename || l.video_filename).length}
                      </span>
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {selectedUser.leads.length > 0 ? (
                    selectedUser.leads.map((lead) => (
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
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon name="FileText" size={24} className="text-gray-400" />
                      </div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">Нет лидов</h4>
                      <p className="text-gray-500">У этого пользователя пока нет созданных лидов</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <div className="relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl blur opacity-30"></div>
          <Card className="relative bg-white/90 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="py-16">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Icon name="Users" size={32} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Выберите пользователя</h3>
                <p className="text-gray-500 max-w-sm mx-auto">
                  Нажмите на любого пользователя в списке слева, чтобы посмотреть его данные и прослушать аудиозаписи
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default UserDetails;