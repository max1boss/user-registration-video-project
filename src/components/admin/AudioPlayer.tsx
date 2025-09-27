import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface AudioPlayerProps {
  audioUrl: string;
  leadTitle: string;
  className?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUrl, leadTitle, className = '' }) => {
  const [isSupported, setIsSupported] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Detect mobile device and browser
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  useEffect(() => {
    checkAudioSupport();
  }, [audioUrl]);

  const checkAudioSupport = async () => {
    if (!audioUrl) return;

    // Проверяем поддержку разных аудио форматов
    const audio = document.createElement('audio');
    
    // Определяем формат аудио по URL или MIME-типу
    const isMP4Audio = audioUrl.includes('audio/mp4') || audioUrl.includes('mp4');
    const isWebMAudio = audioUrl.includes('audio/webm') || audioUrl.includes('webm');
    const isOggAudio = audioUrl.includes('audio/ogg') || audioUrl.includes('ogg');
    
    // Проверяем поддержку форматов
    const canPlayMP4 = audio.canPlayType('audio/mp4') !== '';
    const canPlayWebM = audio.canPlayType('audio/webm') !== '';
    const canPlayOgg = audio.canPlayType('audio/ogg') !== '';
    
    // Все современные браузеры должны поддерживать хотя бы один из форматов
    if (canPlayMP4 || canPlayWebM || canPlayOgg) {
      setIsSupported(true);
    } else {
      setIsSupported(false);
      toast({
        title: '⚠️ Формат не поддерживается',
        description: 'Браузер не может воспроизвести аудио. Попробуйте скачать файл.',
        variant: 'destructive'
      });
    }
  };

  const downloadAudio = async () => {
    try {
      setIsLoading(true);
      
      // Convert data URL to blob for proper download
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      
      // Create blob URL and download
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      
      // Clean filename for download - определяем расширение по типу
      const cleanTitle = leadTitle.replace(/[^a-zA-Z0-9]/g, '_');
      let extension = '.webm'; // default
      
      if (audioUrl.includes('audio/mp4') || audioUrl.includes('mp4')) {
        extension = '.m4a';
      } else if (audioUrl.includes('audio/ogg')) {
        extension = '.ogg';
      }
      
      link.download = `audio_${cleanTitle}${extension}`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up blob URL
      URL.revokeObjectURL(blobUrl);
      
      toast({
        title: 'Скачивание начато',
        description: `Аудио "${leadTitle}" загружается`,
      });
    } catch (error) {
      toast({
        title: 'Ошибка скачивания',
        description: 'Не удалось скачать аудио',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // If audio is not supported on this device, show download option
  if (!isSupported) {
    return (
      <div className={`border rounded-lg p-4 text-center bg-muted/30 ${className}`}>
        <Icon name="VolumeX" size={48} className="mx-auto mb-4 text-muted-foreground" />
        <p className="text-sm font-medium mb-2">
          🔊 Аудио не поддерживается
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          Ваш браузер не может воспроизвести аудио файл
        </p>
        <Button onClick={downloadAudio} disabled={isLoading} size="sm" className="mb-2">
          {isLoading ? (
            <Icon name="Loader2" size={16} className="animate-spin mr-2" />
          ) : (
            <Icon name="Download" size={16} className="mr-2" />
          )}
          Скачать аудио
        </Button>
        {isIOS && (
          <p className="text-xs text-muted-foreground mt-2">
            💡 После скачивания откройте файл в приложении "Файлы" iOS
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="bg-gray-50 rounded-lg p-4 border">
        <div className="flex items-center gap-3 mb-3">
          <Icon name="Volume2" size={24} className="text-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Аудио запись</p>
            <p className="text-xs text-gray-500">{leadTitle}</p>
          </div>
          <Button onClick={downloadAudio} disabled={isLoading} size="sm" variant="outline">
            {isLoading ? (
              <Icon name="Loader2" size={14} className="animate-spin" />
            ) : (
              <Icon name="Download" size={14} />
            )}
          </Button>
        </div>
        
        <audio 
          src={audioUrl} 
          controls 
          preload="metadata"
          className="w-full"
          style={{ height: '40px' }}
          onError={(e) => {
            console.error('Audio playback error:', e);
            setIsSupported(false);
            
            toast({
              title: 'Ошибка воспроизведения',
              description: 'Не удалось воспроизвести аудио файл',
              variant: 'destructive'
            });
          }}
        >
          <p className="text-sm text-muted-foreground">
            Ваш браузер не поддерживает воспроизведение аудио.
          </p>
        </audio>
      </div>
    </div>
  );
};

export default AudioPlayer;