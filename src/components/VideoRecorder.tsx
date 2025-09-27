import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { LeadFormData } from '@/types/lead';

interface VideoRecorderProps {
  onSaveLead: (audioBlob: Blob, leadData: LeadFormData) => Promise<void>;
  loading: boolean;
  externalUploadProgress?: number;
}

const VideoRecorder: React.FC<VideoRecorderProps> = ({ onSaveLead, loading, externalUploadProgress }) => {
  const [leadData, setLeadData] = useState<LeadFormData>({
    parentName: '',
    childName: '',
    age: '',
    phone: ''
  });
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [isRecording, setIsRecording] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  
  // Use external progress if available, otherwise internal progress
  const currentProgress = externalUploadProgress ?? uploadProgress;
  const [isUploading, setIsUploading] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      
      streamRef.current = stream;

      // Настройки записи аудио
      const options: MediaRecorderOptions = {
        audioBitsPerSecond: 64000
      };
      
      // Проверяем поддержку аудио форматов
      if (MediaRecorder.isTypeSupported('audio/mp4')) {
        options.mimeType = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        options.mimeType = 'audio/webm';
      } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
        options.mimeType = 'audio/ogg';
      } else {
        throw new Error('Браузер не поддерживает запись аудио');
      }
      
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (event) => {
        console.log('Audio data available:', event.data.size, 'bytes');
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        console.log('Audio recording stopped, chunks:', chunks.length);
        console.log('Total chunks size:', chunks.reduce((sum, chunk) => sum + chunk.size, 0));
        const actualMimeType = mediaRecorder.mimeType || 'audio/webm';
        const blob = new Blob(chunks, { type: actualMimeType });
        console.log('Final audio blob size:', blob.size, 'type:', blob.type);
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start(1000); // Собираем данные каждые 1000мс
      setIsRecording(true);
      console.log('MediaRecorder started with mimeType:', mediaRecorder.mimeType);
    } catch (error: any) {
      let errorMessage = 'Не удалось получить доступ к микрофону';
      
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Доступ к микрофону запрещен. Разрешите доступ в настройках браузера';
      }
      
      toast({ title: 'Ошибка', description: errorMessage, variant: 'destructive' });
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const retakeAudio = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    
    // Stop any active audio streams
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    setAudioBlob(null);
    setAudioUrl('');
    setIsRecording(false);
  };

  const isFormValid = () => {
    return leadData.parentName.trim() && 
           leadData.childName.trim() && 
           leadData.age.trim() && 
           leadData.phone.trim();
  };

  const handleSaveLead = async () => {
    if (!audioBlob || !isFormValid()) {
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    
    // Audio files are typically smaller, but still check
    const audioSizeMB = audioBlob.size / (1024 * 1024);
    const isChunkedUpload = audioSizeMB > 8;
    
    let progressInterval: NodeJS.Timeout | null = null;
    
    // For standard upload, simulate progress
    if (!isChunkedUpload) {
      progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval!);
            return prev;
          }
          return prev + Math.random() * 15;
        });
      }, 200);
    }

    try {
      await onSaveLead(audioBlob, leadData);
      
      // Complete progress for standard upload
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      if (!isChunkedUpload) {
        setUploadProgress(100);
      }
      
      // Success will be handled by upload page
      
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        setLeadData({
          parentName: '',
          childName: '',
          age: '',
          phone: ''
        });
        retakeAudio();
      }, 500);
      
    } catch (error) {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      setIsUploading(false);
      setUploadProgress(0);
      throw error;
    }
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      {/* Comments Block - First on mobile */}
      <Card className="animate-scale-in">
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Icon name="FileText" size={18} className="sm:w-5 sm:h-5" />
            Информация о лиде
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="parentName" className="text-sm font-medium">
                Имя родителя
              </Label>
              <Input
                id="parentName"
                placeholder="Введите имя родителя"
                value={leadData.parentName}
                onChange={(e) => setLeadData(prev => ({ ...prev, parentName: e.target.value }))}
                className="text-sm sm:text-base"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="childName" className="text-sm font-medium">
                Имя ребенка
              </Label>
              <Input
                id="childName"
                placeholder="Введите имя ребенка"
                value={leadData.childName}
                onChange={(e) => setLeadData(prev => ({ ...prev, childName: e.target.value }))}
                className="text-sm sm:text-base"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="age" className="text-sm font-medium">
                Возраст ребенка
              </Label>
              <Input
                id="age"
                placeholder="Введите возраст"
                value={leadData.age}
                onChange={(e) => setLeadData(prev => ({ ...prev, age: e.target.value }))}
                className="text-sm sm:text-base"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">
                Телефон
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+7 (999) 123-45-67"
                value={leadData.phone}
                onChange={(e) => setLeadData(prev => ({ ...prev, phone: e.target.value }))}
                className="text-sm sm:text-base"
              />
            </div>
          </div>
          
          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>
                  {currentProgress > 0 && currentProgress < 100 ? 
                    (externalUploadProgress !== undefined ? 'Загрузка большого файла...' : 'Загрузка аудио...') : 
                    'Подготовка к загрузке...'
                  }
                </span>
                <span>{Math.round(currentProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${currentProgress}%` }}
                ></div>
              </div>

            </div>
          )}
          
          <Button 
            onClick={handleSaveLead} 
            className="w-full h-12 sm:h-10 text-base sm:text-sm font-medium touch-manipulation"
            disabled={!audioBlob || !isFormValid() || loading || isUploading}
          >
            {loading || isUploading ? (
              <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
            ) : (
              <Icon name="Save" size={16} className="mr-2" />
            )}
            {isUploading ? 'Загружаем...' : 'Сохранить лид'}
          </Button>
        </CardContent>
      </Card>

      {/* Audio Recording Block with Video Cover - Second on mobile */}
      <Card className="animate-scale-in">
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Icon name="Camera" size={18} className="sm:w-5 sm:h-5" />
            Контроль качества
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative touch-manipulation">
            {/* Always show fake video cover */}
            <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
              <h1 className="text-black font-bold text-xl sm:text-2xl md:text-4xl select-none px-4 text-center">IMPERIA PROMO</h1>
            </div>
            
            {/* Recording indicator */}
            {isRecording && (
              <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                REC
              </div>
            )}
            
            {/* Audio ready indicator */}
            {audioUrl && (
              <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                <Icon name="Check" size={12} />
                Готово
              </div>
            )}
            
            {/* Show placeholder when no audio */}
            {!isRecording && !audioUrl && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 z-5">
                <div className="text-center px-4">
                  <Icon name="Mic" size={40} className="mx-auto mb-2 text-gray-400 sm:w-12 sm:h-12" />
                  <p className="text-gray-500 text-sm sm:text-base">Нажмите "Начать запись"</p>
                </div>
              </div>
            )}
          </div>

          {/* Hidden audio player for playback */}
          {audioUrl && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Icon name="Volume2" size={20} className="text-gray-600" />
                <audio src={audioUrl} controls className="flex-1" />
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
            {!isRecording && !audioUrl && (
              <Button onClick={startAudioRecording} className="flex-1 h-12 sm:h-10 text-base sm:text-sm font-medium touch-manipulation">
                <Icon name="Mic" size={16} className="mr-2" />
                Начать запись
              </Button>
            )}
            
            {isRecording && (
              <Button onClick={stopAudioRecording} variant="destructive" className="flex-1 h-12 sm:h-10 text-base sm:text-sm font-medium touch-manipulation">
                <Icon name="Square" size={16} className="mr-2" />
                Остановить
              </Button>
            )}
            
            {audioUrl && (
              <Button onClick={retakeAudio} variant="outline" className="flex-1 h-12 sm:h-10 text-base sm:text-sm font-medium touch-manipulation">
                <Icon name="RefreshCw" size={16} className="mr-2" />
                Пересъемка
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoRecorder;