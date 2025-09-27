import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
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

interface LeadItemProps {
  lead: Lead;
  userName: string;
  loadingAudio: boolean;
  deletingLeadId: string | null;
  onLoadAudio: (leadId: string) => void;
  onDownloadAudio: (leadId: string, leadTitle: string, userName: string) => void;
  onDeleteLead: (leadId: string, leadTitle: string) => void;
  formatDate: (dateString: string) => string;
  // Добавляем API для получения аудио URL
  videoApiUrl?: string;
  token?: string;
}

const LeadItem: React.FC<LeadItemProps> = ({
  lead,
  userName,
  loadingAudio,
  deletingLeadId,
  onLoadAudio,
  onDownloadAudio,
  onDeleteLead,
  formatDate,
  videoApiUrl,
  token
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loadingAudioUrl, setLoadingAudioUrl] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  
  // Проверяем наличие аудио по разным полям для совместимости
  const hasAudio = lead.has_audio || Boolean(lead.audio_filename) || Boolean(lead.video_filename);

  // Загружаем аудио для встроенного плеера
  const loadAudioForPlayer = async () => {
    if (audioUrl || loadingAudioUrl || !videoApiUrl || !token) return;
    
    setLoadingAudioUrl(true);
    try {
      const response = await fetch(`${videoApiUrl}?id=${lead.id}`, {
        headers: {
          'X-Auth-Token': token,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const audioDataUrl = data.audio_url || data.video_url;
        if (audioDataUrl) {
          setAudioUrl(audioDataUrl);
          setShowPlayer(true);
        } else {
          console.error('URL аудио не найден в ответе');
        }
      } else {
        console.error('Не удалось загрузить аудио');
      }
    } catch (error) {
      console.error('Ошибка загрузки аудио:', error);
    } finally {
      setLoadingAudioUrl(false);
    }
  };

  // Очистка состояния при размонтировании
  useEffect(() => {
    return () => {
      if (audioUrl && audioUrl.startsWith('blob:')) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);
  
  const handleDelete = async () => {
    await onDeleteLead(lead.id, lead.title);
    setIsDialogOpen(false);
  };
  return (
    <div className={`relative p-4 border border-gray-200 rounded-xl transition-all duration-200 hover:shadow-lg ${
      showPlayer ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200' : 'bg-white hover:bg-gray-50'
    }`}>
      {showPlayer && (
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur opacity-10"></div>
      )}
      <div className="relative">
        <div className="flex justify-between items-start mb-3 gap-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 truncate text-sm">{lead.title}</h4>
            <p className="text-xs text-gray-500 mt-1">
              <Icon name="Calendar" size={12} className="inline mr-1" />
              {formatDate(lead.created_at)}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge 
              variant={hasAudio ? 'default' : 'secondary'} 
              className={hasAudio 
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0' 
                : 'bg-gray-100 text-gray-600 border-0'
              }
            >
              <Icon name={hasAudio ? 'Volume2' : 'FileText'} size={12} className="mr-1" />
              {hasAudio ? 'Аудио' : 'Текст'}
            </Badge>
          </div>
        </div>
        
        <div className="text-sm text-gray-600 mb-4">
          <LeadInfo comments={lead.comments} />
        </div>

      {/* Встроенный аудиоплеер */}
      {hasAudio && showPlayer && audioUrl && (
        <div className="mb-4">
          <AudioPlayer 
            src={audioUrl} 
            title={`Аудио: ${lead.title}`}
            onClose={() => {
              setShowPlayer(false);
              if (audioUrl && audioUrl.startsWith('blob:')) {
                URL.revokeObjectURL(audioUrl);
              }
              setAudioUrl(null);
            }}
            className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200"
          />
        </div>
      )}
        
        <div className="flex flex-wrap gap-2 justify-end">
          {hasAudio && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (showPlayer && audioUrl) {
                    setShowPlayer(false);
                    if (audioUrl && audioUrl.startsWith('blob:')) {
                      URL.revokeObjectURL(audioUrl);
                    }
                    setAudioUrl(null);
                  } else {
                    loadAudioForPlayer();
                  }
                }}
                disabled={loadingAudioUrl}
                className={`h-9 px-3 transition-all duration-200 ${
                  showPlayer 
                    ? 'bg-purple-100 hover:bg-purple-200 border-purple-300 text-purple-700' 
                    : 'bg-white hover:bg-gray-50 border-gray-200'
                }`}
                title={showPlayer ? "Скрыть плеер" : "Показать плеер"}
              >
                {loadingAudioUrl ? (
                  <Icon name="Loader2" size={14} className="animate-spin mr-2" />
                ) : showPlayer ? (
                  <Icon name="VolumeX" size={14} className="mr-2" />
                ) : (
                  <Icon name="Play" size={14} className="mr-2" />
                )}
                <span className="text-xs font-medium">
                  {loadingAudioUrl ? 'Загрузка...' : showPlayer ? 'Скрыть' : 'Слушать'}
                </span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDownloadAudio(lead.id, lead.title, userName)}
                className="h-9 px-3 bg-white hover:bg-gray-50 border-gray-200"
                title="Скачать аудио"
              >
                <Icon name="Download" size={14} className="mr-2" />
                <span className="text-xs font-medium">Скачать</span>
              </Button>
            </>
          )}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                disabled={deletingLeadId === lead.id}
                className="h-9 px-3 bg-red-50 hover:bg-red-100 border-red-200 text-red-600"
                title="Удалить лид"
              >
                {deletingLeadId === lead.id ? (
                  <Icon name="Loader2" size={14} className="animate-spin mr-2" />
                ) : (
                  <Icon name="Trash2" size={14} className="mr-2" />
                )}
                <span className="text-xs font-medium">
                  {deletingLeadId === lead.id ? 'Удаление...' : 'Удалить'}
                </span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md mx-3 rounded-lg">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl">Подтверждение удаления</DialogTitle>
                <DialogDescription className="text-sm sm:text-base">
                  Вы действительно хотите удалить лид "{lead.title}"?
                  Это действие нельзя отменить.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-2 mt-4">
                <DialogTrigger asChild>
                  <Button variant="outline" className="h-12 sm:h-10 order-2 sm:order-1 touch-manipulation">Отмена</Button>
                </DialogTrigger>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deletingLeadId === lead.id}
                  className="h-12 sm:h-10 order-1 sm:order-2 touch-manipulation"
                >
                  {deletingLeadId === lead.id ? (
                    <Icon name="Loader2" size={12} className="animate-spin mr-1" />
                  ) : (
                    <Icon name="Trash2" size={12} className="mr-1" />
                  )}
                  Удалить навсегда
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

// Component to display lead information in a structured way
const LeadInfo: React.FC<{ comments: string }> = ({ comments }) => {
  // Try to parse structured data from comments
  const parseLeadData = (comments: string) => {
    // Check if it's new structured format
    if (comments.includes('Родитель:') && comments.includes('Ребенок:')) {
      const parentMatch = comments.match(/Родитель:\s*([^,]+)/);
      const childMatch = comments.match(/Ребенок:\s*([^,]+)/);
      const ageMatch = comments.match(/Возраст:\s*([^,]+)/);
      const phoneMatch = comments.match(/Телефон:\s*(.+)/);
      
      return {
        parentName: parentMatch?.[1]?.trim() || '',
        childName: childMatch?.[1]?.trim() || '',
        age: ageMatch?.[1]?.trim() || '',
        phone: phoneMatch?.[1]?.trim() || '',
        isStructured: true
      };
    }
    
    // Old format - just display as is
    return {
      isStructured: false,
      originalComments: comments
    };
  };

  const leadData = parseLeadData(comments);

  if (leadData.isStructured) {
    return (
      <div className="space-y-1 text-xs sm:text-sm">
        <div><span className="font-medium">Родитель:</span> {leadData.parentName}</div>
        <div><span className="font-medium">Ребенок:</span> {leadData.childName}</div>
        <div><span className="font-medium">Возраст:</span> {leadData.age}</div>
        <div><span className="font-medium">Телефон:</span> {leadData.phone}</div>
      </div>
    );
  }

  // Fallback for old comments format
  return <div className="line-clamp-2">{leadData.originalComments}</div>;
};

export default LeadItem;