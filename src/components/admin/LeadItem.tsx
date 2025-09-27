import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
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
}

const LeadItem: React.FC<LeadItemProps> = ({
  lead,
  userName,
  loadingAudio,
  deletingLeadId,
  onLoadAudio,
  onDownloadAudio,
  onDeleteLead,
  formatDate
}) => {
  const [showFullComments, setShowFullComments] = useState(false);
  
  // Проверяем наличие аудио по разным полям для совместимости
  const hasAudio = lead.has_audio || Boolean(lead.audio_filename) || Boolean(lead.video_filename);
  
  const handleDelete = async () => {
    await onDeleteLead(lead.id, lead.title);
  };

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
      <div className="relative p-5 bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-300 hover:border-gray-300">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 text-lg leading-tight line-clamp-2 mb-2">
              {lead.title}
            </h4>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Icon name="Calendar" size={12} />
              <span>{formatDate(lead.created_at)}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge 
              variant={hasAudio ? 'default' : 'secondary'} 
              className={hasAudio 
                ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white border-0' 
                : 'bg-gray-100 text-gray-600 border-0'
              }
            >
              <Icon name={hasAudio ? 'Volume2' : 'FileText'} size={12} className="mr-1" />
              {hasAudio ? 'Аудио' : 'Текст'}
            </Badge>
          </div>
        </div>

        {/* Lead Information */}
        <div className="mb-4">
          <LeadInfo 
            comments={lead.comments} 
            showFullComments={showFullComments}
            onToggleComments={() => setShowFullComments(!showFullComments)}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {hasAudio && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onLoadAudio(lead.id)}
                  disabled={loadingAudio}
                  className="bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
                  title="Прослушать аудио"
                >
                  {loadingAudio ? (
                    <Icon name="Loader2" size={14} className="animate-spin mr-2" />
                  ) : (
                    <Icon name="Play" size={14} className="mr-2" />
                  )}
                  Играть
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDownloadAudio(lead.id, lead.title, userName)}
                  className="bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
                  title="Скачать аудио"
                >
                  <Icon name="Download" size={14} className="mr-2" />
                  Скачать
                </Button>
              </>
            )}
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                disabled={deletingLeadId === lead.id}
                className="bg-red-50 hover:bg-red-100 border-red-200 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                title="Удалить лид"
              >
                {deletingLeadId === lead.id ? (
                  <Icon name="Loader2" size={14} className="animate-spin mr-2" />
                ) : (
                  <Icon name="Trash2" size={14} className="mr-2" />
                )}
                Удалить
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-md">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-xl font-bold text-red-600">
                  <Icon name="AlertTriangle" size={20} className="inline mr-2" />
                  Удалить лид?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm leading-relaxed">
                  Вы действительно хотите удалить лид <strong>"{lead.title}"</strong>?
                  <br /><br />
                  {hasAudio && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700">
                      <strong>⚠️ Внимание:</strong> Вместе с лидом будет удалена и аудиозапись.
                    </div>
                  )}
                  <br />
                  <strong>Это действие нельзя отменить.</strong>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="gap-3">
                <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200">
                  Отмена
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-600 text-white hover:bg-red-700"
                >
                  <Icon name="Trash2" size={14} className="mr-2" />
                  Удалить навсегда
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};

// Component to display lead information in a structured way
interface LeadInfoProps {
  comments: string;
  showFullComments: boolean;
  onToggleComments: () => void;
}

const LeadInfo: React.FC<LeadInfoProps> = ({ comments, showFullComments, onToggleComments }) => {
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
  const isLongContent = comments.length > 150;

  if (leadData.isStructured) {
    return (
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-4 border border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
              <Icon name="User" size={12} className="text-blue-600" />
            </div>
            <div>
              <span className="text-gray-500 text-xs">Родитель</span>
              <p className="font-medium text-gray-900">{leadData.parentName}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
              <Icon name="Baby" size={12} className="text-purple-600" />
            </div>
            <div>
              <span className="text-gray-500 text-xs">Ребенок</span>
              <p className="font-medium text-gray-900">{leadData.childName}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
              <Icon name="Calendar" size={12} className="text-green-600" />
            </div>
            <div>
              <span className="text-gray-500 text-xs">Возраст</span>
              <p className="font-medium text-gray-900">{leadData.age}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
              <Icon name="Phone" size={12} className="text-orange-600" />
            </div>
            <div>
              <span className="text-gray-500 text-xs">Телефон</span>
              <p className="font-medium text-gray-900">{leadData.phone}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback for old comments format
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex items-start gap-2">
        <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
          <Icon name="MessageSquare" size={12} className="text-gray-600" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-gray-500 text-xs">Комментарии</span>
          <div className="text-sm text-gray-700 mt-1">
            {isLongContent && !showFullComments ? (
              <>
                <p className="line-clamp-3">{leadData.originalComments}</p>
                <button
                  onClick={onToggleComments}
                  className="text-blue-600 hover:text-blue-700 text-xs mt-2 font-medium"
                >
                  Показать полностью
                </button>
              </>
            ) : (
              <>
                <p className="whitespace-pre-wrap">{leadData.originalComments}</p>
                {isLongContent && (
                  <button
                    onClick={onToggleComments}
                    className="text-blue-600 hover:text-blue-700 text-xs mt-2 font-medium"
                  >
                    Свернуть
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadItem;