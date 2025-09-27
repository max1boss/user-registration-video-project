import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import VideoRecorder from '@/components/VideoRecorder';
import LeadsArchive from '@/components/LeadsArchive';
import { LeadFormData } from '@/types/lead';

interface VideoLead {
  id: string;
  title: string;
  comments: string;
  video_url?: string;
  created_at: string;
  video_filename?: string;
}

interface TabsNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  videoLeads: VideoLead[];
  isArchiveUnlocked: boolean;
  loading: boolean;
  externalUploadProgress?: number;
  onSaveLead: (videoBlob: Blob, leadData: LeadFormData) => Promise<void>;
  onCreateLead: () => void;
  onLoadVideo: (leadId: string) => Promise<string | null>;
  onArchiveTabClick: () => void;
}

const TabsNavigation: React.FC<TabsNavigationProps> = ({
  activeTab,
  onTabChange,
  videoLeads,
  isArchiveUnlocked,
  loading,
  externalUploadProgress,
  onSaveLead,
  onCreateLead,
  onLoadVideo,
  onArchiveTabClick
}) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleVideoSave = async (videoBlob: Blob, leadData: LeadFormData) => {
    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatus('Подготовка к загрузке...');
    
    try {
      await onSaveLead(videoBlob, leadData);
      setUploadProgress(100);
      setUploadStatus('Видео успешно отправлено!');
      
      // Очистка состояния через небольшую задержку
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        setUploadStatus('');
      }, 2000);
      
    } catch (error) {
      setIsUploading(false);
      setUploadProgress(0);
      setUploadStatus('');
      throw error; // Re-throw для обработки в VideoRecorder
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6 h-12 sm:h-10">
        <TabsTrigger value="record" className="flex items-center gap-2 text-sm sm:text-base font-medium">
          <Icon name="Video" size={14} className="sm:w-4 sm:h-4" />
          <span className="hidden xs:inline">Видеозапись</span>
          <span className="xs:hidden">Запись</span>
        </TabsTrigger>
        <TabsTrigger 
          value="archive" 
          className="flex items-center gap-2 text-sm sm:text-base font-medium"
          onClick={(e) => {
            e.preventDefault();
            onArchiveTabClick();
          }}
        >
          <Icon name="Archive" size={14} className="sm:w-4 sm:h-4" />
          <span className="hidden xs:inline">Архив ({videoLeads.length})</span>
          <span className="xs:hidden">Архив</span>
        </TabsTrigger>
      </TabsList>

      {/* Recording Tab */}
      <TabsContent value="record" className="space-y-6 flex justify-center">
        <VideoRecorder 
          onSaveLead={handleVideoSave}
          isUploading={isUploading || loading}
          uploadProgress={externalUploadProgress ?? uploadProgress}
          uploadStatus={uploadStatus}
        />
      </TabsContent>

      {/* Archive Tab */}
      <TabsContent value="archive" className="space-y-6">
        {isArchiveUnlocked ? (
          <LeadsArchive 
            videoLeads={videoLeads}
            onCreateLead={onCreateLead}
            onLoadVideo={onLoadVideo}
          />
        ) : (
          <div className="text-center py-12">
            <Icon name="Lock" size={64} className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Для доступа к архиву необходимо ввести пароль</p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default TabsNavigation;