import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { LeadFormData } from '@/types/lead';

interface VideoRecorderProps {
  onSaveLead: (videoBlob: Blob, leadData: LeadFormData) => Promise<void>;
  isUploading: boolean;
  uploadProgress: number;
  uploadStatus: string;
}

const VideoRecorder: React.FC<VideoRecorderProps> = ({
  onSaveLead,
  isUploading,
  uploadProgress,
  uploadStatus
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [videoSize, setVideoSize] = useState(0);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [hasVideoAccess, setHasVideoAccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentCamera, setCurrentCamera] = useState<'user' | 'environment'>('user');

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Константы
  const MAX_DURATION = 5 * 60; // 5 минут в секундах
  const MAX_SIZE_MB = 200; // 200 МБ
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

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

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const requestCameraAccess = async () => {
    try {
      setError(null);
      
      // Оптимальные настройки для мобильных устройств
      const constraints = {
        video: {
          facingMode: currentCamera,
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          frameRate: { ideal: 30, max: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
          channelCount: 2
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      setHasVideoAccess(true);
    } catch (err) {
      console.error('Ошибка доступа к камере:', err);
      setError('Не удалось получить доступ к камере. Проверьте разрешения в браузере.');
    }
  };

  const startRecording = async () => {
    if (!streamRef.current) return;

    try {
      setError(null);
      chunksRef.current = [];
      
      // Настройки записи для высокого качества и совместимости
      let mimeType = 'video/mp4';
      const options: MediaRecorderOptions = {
        videoBitsPerSecond: 2500000, // 2.5 Mbps для хорошего качества
        audioBitsPerSecond: 128000   // 128 kbps для аудио
      };

      // Проверяем поддержку форматов (MP4 приоритет)
      if (MediaRecorder.isTypeSupported('video/mp4; codecs="avc1.424028, mp4a.40.2"')) {
        mimeType = 'video/mp4; codecs="avc1.424028, mp4a.40.2"';
      } else if (MediaRecorder.isTypeSupported('video/mp4; codecs="avc1.42E01E, mp4a.40.2"')) {
        mimeType = 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"';
      } else if (MediaRecorder.isTypeSupported('video/mp4')) {
        mimeType = 'video/mp4';
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
        mimeType = 'video/webm;codecs=vp9,opus';
      } else if (MediaRecorder.isTypeSupported('video/webm')) {
        mimeType = 'video/webm';
      } else {
        throw new Error('Браузер не поддерживает запись видео');
      }

      options.mimeType = mimeType;
      const mediaRecorder = new MediaRecorder(streamRef.current, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
          
          // Обновляем размер файла в реальном времени
          const totalSize = chunksRef.current.reduce((acc, chunk) => acc + chunk.size, 0);
          setVideoSize(totalSize);

          // Проверяем лимит размера
          if (totalSize > MAX_SIZE_BYTES) {
            stopRecording();
            setError(`Файл превысил лимит ${MAX_SIZE_MB}MB. Запись остановлена.`);
          }
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const videoUrl = URL.createObjectURL(blob);
        setRecordedVideo(videoUrl);
        setIsPreviewMode(true);
      };

      mediaRecorder.start(1000); // Записываем чанки каждую секунду для контроля размера
      setIsRecording(true);
      setRecordingTime(0);

      // Таймер записи
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          
          // Автостоп при достижении максимального времени
          if (newTime >= MAX_DURATION) {
            stopRecording();
            return MAX_DURATION;
          }
          
          return newTime;
        });
      }, 1000);

    } catch (err) {
      console.error('Ошибка начала записи:', err);
      setError('Не удалось начать запись. Попробуйте еще раз.');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      
      // Возобновляем таймер
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          if (newTime >= MAX_DURATION) {
            stopRecording();
            return MAX_DURATION;
          }
          return newTime;
        });
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const retakeVideo = () => {
    if (recordedVideo) {
      URL.revokeObjectURL(recordedVideo);
    }
    setRecordedVideo(null);
    setIsPreviewMode(false);
    setRecordingTime(0);
    setVideoSize(0);
    setError(null);
    chunksRef.current = [];
  };

  const handleSaveVideo = async () => {
    if (!recordedVideo || chunksRef.current.length === 0) return;

    const videoBlob = new Blob(chunksRef.current, { 
      type: mediaRecorderRef.current?.mimeType || 'video/mp4' 
    });
    
    // Данные лида (простая форма для видео)
    const leadData: LeadFormData = {
      parentName: 'Видео заявка',
      childName: '',
      age: '',
      phone: ''
    };

    try {
      await onSaveLead(videoBlob, leadData);
      // После успешной отправки очищаем состояние
      retakeVideo();
    } catch (error) {
      console.error('Ошибка сохранения видео:', error);
      setError('Не удалось отправить видео. Попробуйте еще раз.');
    }
  };

  const switchCamera = async () => {
    if (!streamRef.current) return;
    
    // Останавливаем текущий поток
    streamRef.current.getTracks().forEach(track => track.stop());
    
    // Переключаем камеру
    const newCamera = currentCamera === 'user' ? 'environment' : 'user';
    setCurrentCamera(newCamera);
    
    try {
      const constraints = {
        video: {
          facingMode: newCamera,
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error('Ошибка переключения камеры:', err);
      setError('Не удалось переключить камеру');
      // Возвращаем предыдущую камеру
      setCurrentCamera(currentCamera);
    }
  };

  // Прогресс времени записи
  const timeProgress = (recordingTime / MAX_DURATION) * 100;
  const sizeProgress = (videoSize / MAX_SIZE_BYTES) * 100;

  if (!hasVideoAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 space-y-6">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
          <Icon name="Video" size={40} className="text-blue-600" />
        </div>
        
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-3">Видеозапись</h2>
          <p className="text-gray-600 mb-2">
            📹 Записывайте видео до <strong>5 минут</strong>
          </p>
          <p className="text-gray-600 mb-6">
            💾 Максимальный размер <strong>200МБ</strong>
          </p>
          
          <Button onClick={requestCameraAccess} size="lg" className="w-full">
            <Icon name="Camera" size={20} className="mr-2" />
            Включить камеру
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md w-full">
            <div className="flex items-center">
              <Icon name="AlertCircle" size={20} className="text-red-500 mr-2 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Видео превью */}
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
            onClick={switchCamera}
            className="absolute top-4 right-4 w-12 h-12 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
          >
            <Icon name="RotateCcw" size={24} />
          </button>
        )}

        {/* Информация о записи */}
        {(isRecording || isPaused) && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-black/80 rounded-lg p-4 space-y-3">
              <div className="flex justify-between text-white text-sm">
                <span className="font-medium">{formatTime(recordingTime)} / {formatTime(MAX_DURATION)}</span>
                <span className="font-medium">{formatFileSize(videoSize)} / {MAX_SIZE_MB}MB</span>
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
        )}
      </div>

      {/* Управление записью */}
      <div className="p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <Icon name="AlertCircle" size={16} className="text-red-500 mr-2 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {isPreviewMode ? (
          // Режим превью
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="font-semibold text-lg mb-2">Видео готово!</h3>
              <p className="text-sm text-gray-600 mb-4">
                Длительность: {formatTime(recordingTime)} • Размер: {formatFileSize(videoSize)}
              </p>
            </div>
            
            <div className="flex space-x-3">
              <Button variant="outline" onClick={retakeVideo} className="flex-1">
                <Icon name="RotateCcw" size={16} className="mr-2" />
                Переснять
              </Button>
              
              <Button 
                onClick={handleSaveVideo} 
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
        ) : (
          // Режим записи
          <div className="space-y-4">
            {!isRecording ? (
              <Button 
                onClick={startRecording} 
                size="lg"
                className="w-full h-14 text-lg"
              >
                <Icon name="Video" size={24} className="mr-3" />
                Начать запись
              </Button>
            ) : (
              <div className="flex space-x-3">
                {isPaused ? (
                  <Button onClick={resumeRecording} size="lg" variant="outline" className="flex-1">
                    <Icon name="Play" size={20} className="mr-2" />
                    Продолжить
                  </Button>
                ) : (
                  <Button onClick={pauseRecording} size="lg" variant="outline" className="flex-1">
                    <Icon name="Pause" size={20} className="mr-2" />
                    Пауза
                  </Button>
                )}
                
                <Button onClick={stopRecording} size="lg" className="flex-1">
                  <Icon name="Square" size={20} className="mr-2" />
                  Остановить
                </Button>
              </div>
            )}
            
            {/* Подсказки */}
            <div className="text-center text-sm text-gray-500 space-y-1">
              <p>💡 Поверните телефон горизонтально для лучшего качества</p>
              <p>🔄 Нажмите на иконку сверху для переключения камеры</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoRecorder;