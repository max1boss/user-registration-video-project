import React from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface RecordingControlsProps {
  isRecording: boolean;
  isPaused: boolean;
  isPreviewMode: boolean;
  onStartRecording: () => void;
  onPauseRecording: () => void;
  onResumeRecording: () => void;
  onStopRecording: () => void;
}

const RecordingControls: React.FC<RecordingControlsProps> = ({
  isRecording,
  isPaused,
  isPreviewMode,
  onStartRecording,
  onPauseRecording,
  onResumeRecording,
  onStopRecording
}) => {
  if (isPreviewMode) {
    return null; // Элементы управления записью скрыты в режиме превью
  }

  return (
    <div className="space-y-4">
      {!isRecording ? (
        <Button 
          onClick={onStartRecording} 
          size="lg"
          className="w-full h-14 text-lg"
        >
          <Icon name="Video" size={24} className="mr-3" />
          Начать запись
        </Button>
      ) : (
        <div className="flex space-x-3">
          {isPaused ? (
            <Button onClick={onResumeRecording} size="lg" variant="outline" className="flex-1">
              <Icon name="Play" size={20} className="mr-2" />
              Продолжить
            </Button>
          ) : (
            <Button onClick={onPauseRecording} size="lg" variant="outline" className="flex-1">
              <Icon name="Pause" size={20} className="mr-2" />
              Пауза
            </Button>
          )}
          
          <Button onClick={onStopRecording} size="lg" className="flex-1">
            <Icon name="Square" size={20} className="mr-2" />
            Остановить
          </Button>
        </div>
      )}
      
      {/* Подсказки */}
      <div className="text-center text-sm text-gray-500 space-y-1">
        <p>💡 Поверните телефон горизонтально для лучшего качества</p>
        <p>📹 Запись ведется на тыловую камеру телефона</p>
      </div>
    </div>
  );
};

export default RecordingControls;