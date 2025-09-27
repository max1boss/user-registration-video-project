import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';

interface PreviewModeProps {
  recordingTime: number;
  videoSize: number;
  isUploading: boolean;
  uploadProgress: number;
  uploadStatus: string;
  onRetake: () => void;
  onSave: () => void;
}

const PreviewMode: React.FC<PreviewModeProps> = ({
  recordingTime,
  videoSize,
  isUploading,
  uploadProgress,
  uploadStatus,
  onRetake,
  onSave
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 MB';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="font-semibold text-lg mb-2">Видео готово!</h3>
        <p className="text-sm text-gray-600 mb-4">
          Длительность: {formatTime(recordingTime)} • Размер: {formatFileSize(videoSize)}
        </p>
      </div>
      
      <div className="flex space-x-3">
        <Button variant="outline" onClick={onRetake} className="flex-1">
          <Icon name="RotateCcw" size={16} className="mr-2" />
          Переснять
        </Button>
        
        <Button 
          onClick={onSave} 
          disabled={isUploading}
          className="flex-1"
        >
          {isUploading ? (
            <>
              <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
              Отправка...
            </>
          ) : (
            <>
              <Icon name="Send" size={16} className="mr-2" />
              Отправить
            </>
          )}
        </Button>
      </div>

      {/* Прогресс загрузки */}
      {isUploading && (
        <div className="space-y-2">
          <Progress value={uploadProgress} className="w-full" />
          <p className="text-sm text-gray-600 text-center">{uploadStatus}</p>
        </div>
      )}
    </div>
  );
};

export default PreviewMode;