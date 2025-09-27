import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';

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
    <div className="p-3 sm:p-4 border rounded-lg">
      <div className="flex justify-between items-start mb-3 gap-2">
        <p className="font-medium text-sm flex-1 min-w-0">{lead.title}</p>
        <Badge variant={hasAudio ? 'default' : 'secondary'} className="flex-shrink-0">
          <Icon name={hasAudio ? 'Volume2' : 'FileText'} size={12} className="mr-1" />
          {hasAudio ? 'Аудио' : 'Текст'}
        </Badge>
      </div>
      <div className="text-sm text-muted-foreground mb-3">
        <LeadInfo comments={lead.comments} />
      </div>

      {/* Встроенный аудиоплеер */}
      {hasAudio && showPlayer && audioUrl && (
        <div className="mb-3 p-3 bg-muted/30 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Icon name="Volume2" size={16} className="text-primary" />
              <span className="text-sm font-medium">Аудиозапись</span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setShowPlayer(false);
                if (audioUrl && audioUrl.startsWith('blob:')) {
                  URL.revokeObjectURL(audioUrl);
                }
                setAudioUrl(null);
              }}
              className="w-6 h-6 p-0"
            >
              <Icon name="X" size={12} />
            </Button>
          </div>
          <audio 
            src={audioUrl} 
            controls 
            preload="metadata"
            className="w-full"
            style={{ height: '32px' }}
          >
            Ваш браузер не поддерживает аудио.
          </audio>
        </div>
      )}
      
      {/* Mobile: Stack date and buttons vertically */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <p className="text-xs text-muted-foreground order-2 sm:order-1">
          {formatDate(lead.created_at)}
        </p>
        <div className="flex flex-wrap gap-2 order-1 sm:order-2">
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
                className="w-9 h-9 p-0 touch-manipulation"
                title={showPlayer ? "Скрыть плеер" : "Показать плеер"}
              >
                {loadingAudioUrl ? (
                  <Icon name="Loader2" size={14} className="animate-spin" />
                ) : showPlayer ? (
                  <Icon name="VolumeX" size={14} />
                ) : (
                  <Icon name="Volume2" size={14} />
                )}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onDownloadAudio(lead.id, lead.title, userName)}
                className="w-9 h-9 p-0 touch-manipulation"
                title="Скачать аудио"
              >
                <Icon name="Download" size={14} />
              </Button>
            </>
          )}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                variant="destructive"
                disabled={deletingLeadId === lead.id}
                className="w-9 h-9 p-0 touch-manipulation"
                title="Удалить лид"
              >
                {deletingLeadId === lead.id ? (
                  <Icon name="Loader2" size={14} className="animate-spin" />
                ) : (
                  <Icon name="Trash2" size={14} />
                )}
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