import React from 'react';
import { Progress } from '@/components/ui/progress';

interface RecordingInfoProps {
  isRecording: boolean;
  isPaused: boolean;
  recordingTime: number;
  videoSize: number;
  maxDuration: number;
  maxSizeBytes: number;
  maxSizeMB: number;
}

const RecordingInfo: React.FC<RecordingInfoProps> = ({
  isRecording,
  isPaused,
  recordingTime,
  videoSize,
  maxDuration,
  maxSizeBytes,
  maxSizeMB
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

  // Прогресс времени записи
  const timeProgress = (recordingTime / maxDuration) * 100;
  const sizeProgress = (videoSize / maxSizeBytes) * 100;

  if (!isRecording && !isPaused) {
    return null; // Не показываем информацию когда не записываем
  }

  return (
    <div className="absolute bottom-4 left-4 right-4">
      <div className="bg-black/80 rounded-lg p-4 space-y-3">
        <div className="flex justify-between text-white text-sm">
          <span className="font-medium">{formatTime(recordingTime)} / {formatTime(maxDuration)}</span>
          <span className="font-medium">{formatFileSize(videoSize)} / {maxSizeMB}MB</span>
        </div>
        
        {/* Прогресс времени */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-300">
            <span>Время</span>
            <span>{Math.round(timeProgress)}%</span>
          </div>
          <Progress value={timeProgress} className="h-2" />
        </div>
        
        {/* Прогресс размера */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-300">
            <span>Размер</span>
            <span>{Math.round(sizeProgress)}%</span>
          </div>
          <Progress 
            value={sizeProgress} 
            className={`h-2 ${sizeProgress > 80 ? 'bg-red-200' : ''}`}
          />
        </div>
      </div>
    </div>
  );
};

export default RecordingInfo;