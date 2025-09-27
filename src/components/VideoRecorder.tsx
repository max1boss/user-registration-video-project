import React, { useState, useRef, useEffect } from 'react';
import { LeadFormData } from '@/types/lead';

// Декомпозированные компоненты
import CameraPermissionScreen from './video/CameraPermissionScreen';
import CameraView from './video/CameraView';
import RecordingInfo from './video/RecordingInfo';
import RecordingControls from './video/RecordingControls';
import PreviewMode from './video/PreviewMode';

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
  // Состояние записи
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [videoSize, setVideoSize] = useState(0);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [hasVideoAccess, setHasVideoAccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentCamera, setCurrentCamera] = useState<'user' | 'environment'>('user');

  // Рефы для управления записью
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Константы
  const MAX_DURATION = 5 * 60; // 5 минут в секундах
  const MAX_SIZE_MB = 200; // 200 МБ
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

  // Очистка ресурсов при размонтировании
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

  // Запрос доступа к камере
  const requestCameraAccess = async () => {
    try {
      setError(null);
      
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

  // Начало записи
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

  // Пауза записи
  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  // Возобновление записи
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

  // Остановка записи
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

  // Переснять видео
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

  // Сохранение видео
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

  // Переключение камеры
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

  // Экран запроса разрешений
  if (!hasVideoAccess) {
    return (
      <CameraPermissionScreen 
        error={error}
        onRequestAccess={requestCameraAccess}
      />
    );
  }

  // Основной интерфейс записи
  return (
    <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Видео превью */}
      <div className="relative">
        <CameraView
          videoRef={videoRef}
          recordedVideo={recordedVideo}
          isPreviewMode={isPreviewMode}
          isRecording={isRecording}
          isPaused={isPaused}
          currentCamera={currentCamera}
          onSwitchCamera={switchCamera}
        />
        
        {/* Информация о записи - поверх видео */}
        <RecordingInfo
          isRecording={isRecording}
          isPaused={isPaused}
          recordingTime={recordingTime}
          videoSize={videoSize}
          maxDuration={MAX_DURATION}
          maxSizeBytes={MAX_SIZE_BYTES}
          maxSizeMB={MAX_SIZE_MB}
        />
      </div>

      {/* Управление */}
      <div className="p-6">
        {/* Отображение ошибок */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <div className="w-4 h-4 text-red-500 mr-2 flex-shrink-0">⚠️</div>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {isPreviewMode ? (
          // Режим превью
          <PreviewMode
            recordingTime={recordingTime}
            videoSize={videoSize}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
            uploadStatus={uploadStatus}
            onRetake={retakeVideo}
            onSave={handleSaveVideo}
          />
        ) : (
          // Режим записи
          <RecordingControls
            isRecording={isRecording}
            isPaused={isPaused}
            isPreviewMode={isPreviewMode}
            onStartRecording={startRecording}
            onPauseRecording={pauseRecording}
            onResumeRecording={resumeRecording}
            onStopRecording={stopRecording}
          />
        )}
      </div>
    </div>
  );
};

export default VideoRecorder;