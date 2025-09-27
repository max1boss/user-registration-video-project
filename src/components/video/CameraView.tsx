import React from 'react';
import Icon from '@/components/ui/icon';

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  recordedVideo: string | null;
  isPreviewMode: boolean;
  isRecording: boolean;
  isPaused: boolean;
  currentCamera: 'user' | 'environment';
  onSwitchCamera: () => void;
}

const CameraView: React.FC<CameraViewProps> = ({
  videoRef,
  recordedVideo,
  isPreviewMode,
  isRecording,
  isPaused,
  currentCamera,
  onSwitchCamera
}) => {
  return (
    <div className="relative aspect-video bg-black">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        playsInline
        muted={!isPreviewMode}
        style={{ transform: isPreviewMode ? 'none' : (currentCamera === 'user' ? 'scaleX(-1)' : 'none') }}
      />
      
      {/* Видео для воспроизведения записи */}
      {recordedVideo && isPreviewMode && (
        <video
          src={recordedVideo}
          controls
          className="w-full h-full object-cover absolute inset-0"
        />
      )}
      
      {/* Индикатор записи */}
      {isRecording && (
        <div className="absolute top-4 left-4 flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-red-500'} ${!isPaused && 'animate-pulse'}`} />
          <span className="text-white text-sm font-medium bg-black/70 px-3 py-1 rounded-full">
            {isPaused ? 'ПАУЗА' : 'ЗАПИСЬ'}
          </span>
        </div>
      )}

      {/* Переключатель камеры */}
      {!isRecording && !isPreviewMode && (
        <button
          onClick={onSwitchCamera}
          className="absolute top-4 right-4 w-12 h-12 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
        >
          <Icon name="RotateCcw" size={24} />
        </button>
      )}
    </div>
  );
};

export default CameraView;