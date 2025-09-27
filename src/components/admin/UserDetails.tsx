import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  formatDate
}) => {
  const [showAllLeads, setShowAllLeads] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const leadsPerPage = 10;

  if (!selectedUser) {
    return (
      <div className="space-y-6">
        <div className="relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-20"></div>
          <Card className="relative bg-white/90 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-12">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Icon name="UserCheck" size={32} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Выберите пользователя
                </h3>
                <p className="text-gray-500 leading-relaxed">
                  Выберите пользователя из списка слева<br />
                  для просмотра его данных и лидов
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Фильтрация лидов по поисковому запросу
  const filteredLeads = selectedUser.leads.filter(lead =>
    lead.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.comments.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedLeads = showAllLeads ? 
    filteredLeads.slice(currentPage * leadsPerPage, (currentPage + 1) * leadsPerPage) : 
    filteredLeads.slice(0, 5);

  const totalPages = Math.ceil(filteredLeads.length / leadsPerPage);
  const audioCount = selectedUser.leads.filter(l => l.has_audio || l.audio_filename || l.video_filename).length;

  return (
    <div className="space-y-6">
      {/* User Profile Card */}
      <div className="relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-20"></div>
        <Card className="relative bg-white/90 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-start space-x-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-bold text-white">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900 truncate">
                    {selectedUser.name}
                  </h2>
                  <Badge variant="secondary" className="bg-green-100 text-green-700 border-0">
                    <Icon name="CheckCircle" size={12} className="mr-1" />
                    Активен
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Icon name="Mail" size={16} />
                    <span className="truncate">{selectedUser.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Icon name="Calendar" size={16} />
                    <span>Регистрация: {formatDate(selectedUser.created_at)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
                    <Icon name="FileText" size={16} className="text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">
                      {selectedUser.leads.length} лидов
                    </span>
                  </div>
                  {audioCount > 0 && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 rounded-lg">
                      <Icon name="Volume2" size={16} className="text-purple-600" />
                      <span className="text-sm font-medium text-purple-700">
                        {audioCount} аудио
                      </span>
                    </div>
                  )}
                </div>
              </div>
              {audioCount > 0 && (
                <Button
                  variant="outline"
                  onClick={() => onDownloadAllUserAudios(selectedUser)}
                  className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200 hover:from-green-100 hover:to-blue-100 text-green-700"
                >
                  <Icon name="Download" size={16} className="mr-2" />
                  Скачать все аудио
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leads Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Лиды пользователя
            </h3>
            <p className="text-gray-500 text-sm mt-1">
              {filteredLeads.length} {filteredLeads.length === 1 ? 'лид' : 
               filteredLeads.length < 5 ? 'лида' : 'лидов'} всего
            </p>
          </div>
          {!showAllLeads && filteredLeads.length > 5 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowAllLeads(true)}
              className="bg-white/70 backdrop-blur-sm border-gray-200 hover:bg-white/90"
            >
              <Icon name="ChevronDown" size={16} className="mr-2" />
              Показать все ({filteredLeads.length})
            </Button>
          )}
          {showAllLeads && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setShowAllLeads(false);
                setCurrentPage(0);
              }}
              className="bg-white/70 backdrop-blur-sm border-gray-200 hover:bg-white/90"
            >
              <Icon name="ChevronUp" size={16} className="mr-2" />
              Свернуть
            </Button>
          )}
        </div>

        {/* Search Bar for Leads */}
        {selectedUser.leads.length > 3 && (
          <div className="relative">
            <Icon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск по названию или комментариям..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon name="X" size={16} />
              </button>
            )}
          </div>
        )}

        {/* Pagination Info */}
        {showAllLeads && filteredLeads.length > leadsPerPage && (
          <div className="flex items-center justify-between text-sm text-gray-500 px-4 py-2 bg-gray-50 rounded-lg">
            <span>
              Показано {currentPage * leadsPerPage + 1}-{Math.min((currentPage + 1) * leadsPerPage, filteredLeads.length)} из {filteredLeads.length}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 0}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="h-8 w-8 p-0"
              >
                <Icon name="ChevronLeft" size={14} />
              </Button>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium">
                {currentPage + 1} из {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages - 1}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="h-8 w-8 p-0"
              >
                <Icon name="ChevronRight" size={14} />
              </Button>
            </div>
          </div>
        )}

        {/* Leads List */}
        <div className="relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-20"></div>
          <Card className="relative bg-white/90 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <div className={`space-y-4 ${showAllLeads ? 'max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100' : ''}`}>
                {displayedLeads.length > 0 ? (
                  displayedLeads.map((lead) => (
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
                    />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon name="FileText" size={24} className="text-gray-400" />
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      {searchTerm ? 'Лиды не найдены' : 'Нет лидов'}
                    </h4>
                    <p className="text-gray-500">
                      {searchTerm 
                        ? `По запросу "${searchTerm}" ничего не найдено`
                        : 'У пользователя пока нет лидов'
                      }
                    </p>
                    {searchTerm && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSearchTerm('')}
                        className="mt-4"
                      >
                        <Icon name="X" size={14} className="mr-2" />
                        Очистить поиск
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Audio Player Section */}
      {audioUrl && (
        <div className="relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 rounded-2xl blur opacity-20"></div>
          <Card className="relative bg-white/90 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                    <Icon name="Volume2" size={16} className="text-white" />
                  </div>
                  Прослушивание аудио
                </CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onCloseAudio}
                  className="w-8 h-8 p-0 bg-red-50 hover:bg-red-100 border-red-200 text-red-600"
                  title="Закрыть аудио"
                >
                  <Icon name="X" size={14} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4">
                <AudioPlayer 
                  audioUrl={audioUrl} 
                  leadTitle="Аудио запись" 
                  className="bg-white/70 backdrop-blur-sm"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default UserDetails;