import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { ChunkedUploader } from '@/utils/chunkedUpload';
import { AndroidFetchHelper } from '@/utils/androidFetchHelper';
import { LeadFormData } from '@/types/lead';

interface LeadUploadHandlerProps {
  token: string;
  apiUrls: {
    leads: string;
    chunkedUpload: string;
  };
  onProgress: (progress: number | undefined) => void;
  onLoadLeads: (token: string) => Promise<void>;
}

export const useLeadUploadHandler = ({ 
  token, 
  apiUrls, 
  onProgress, 
  onLoadLeads 
}: LeadUploadHandlerProps) => {
  const { toast } = useToast();

  const handleChunkedUpload = async (videoBlob: Blob, leadData: LeadFormData): Promise<void> => {
    const comments = `Родитель: ${leadData.parentName}, Ребенок: ${leadData.childName}, Возраст: ${leadData.age}, Телефон: ${leadData.phone}`;
    const uploader = new ChunkedUploader({
      file: videoBlob,
      title: `Лид от ${new Date().toLocaleDateString('ru-RU')}`,
      comments: comments,
      token: token,
      uploadUrl: apiUrls.chunkedUpload,
      chunkSize: 5 * 1024 * 1024, // 5MB chunks
      onProgress: (progress) => {
        onProgress(progress);
        console.log(`Upload progress: ${progress.toFixed(1)}%`);
      },
      onChunkUploaded: (chunk, total) => {
        console.log(`Chunk ${chunk}/${total} uploaded`);
      },
      onComplete: async (result) => {
        console.log('Chunked upload completed:', result);
        onProgress(100);
        
        // Reload leads and cleanup
        await onLoadLeads(token);
        setTimeout(() => {
          onProgress(undefined);
        }, 500);
      },
      onError: (error) => {
        console.error('Chunked upload error:', error);
        onProgress(undefined);
        
        toast({ 
          title: 'Ошибка загрузки большого файла', 
          description: error, 
          variant: 'destructive' 
        });
        throw new Error(error);
      }
    });

    await uploader.upload();
  };

  const handleStandardUpload = async (videoBlob: Blob, leadData: LeadFormData): Promise<void> => {
    try {
      // Convert video blob to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const result = reader.result as string;
        console.log('FileReader result length:', result.length);
        console.log('FileReader result prefix:', result.substring(0, 100));
        
        // Найдем позицию base64 данных после "base64,"
        const base64Index = result.indexOf('base64,');
        if (base64Index === -1) {
          console.error('Base64 marker not found in result');
          throw new Error('Base64 marker not found in result');
        }
        
        const base64Video = result.substring(base64Index + 7); // Skip "base64," (7 chars)
        console.log('Video blob type:', videoBlob.type);
        console.log('Video blob size:', videoBlob.size);
        console.log('Base64 length after split:', base64Video.length);
        
        if (!base64Video || base64Video.length === 0) {
          console.error('Base64 conversion failed - empty result');
          toast({ 
            title: 'Ошибка кодирования видео', 
            description: 'Не удалось преобразовать видео в base64', 
            variant: 'destructive' 
          });
          throw new Error('Base64 conversion failed');
        }
        
        // Create simple title and comments for video-only uploads
        const title = leadData.parentName || `Видео заявка от ${new Date().toLocaleDateString('ru-RU')}`;
        const comments = leadData.parentName ? 
          `Родитель: ${leadData.parentName}, Ребенок: ${leadData.childName}, Возраст: ${leadData.age}, Телефон: ${leadData.phone}` :
          `Видео файл размером ${(videoBlob.size / (1024 * 1024)).toFixed(1)}МБ`;
        
        console.log('Starting POST request to:', apiUrls.leads);
        console.log('Token length:', token.length);
        console.log('Title:', title);
        console.log('Comments:', comments);
        console.log('Base64 video length:', base64Video.length);
        
        // Check file size limits (updated for 200MB)
        const videoSizeMB = videoBlob.size / (1024 * 1024);
        const base64SizeMB = (base64Video.length * 3) / (4 * 1024 * 1024); // base64 is ~33% larger
        console.log('Video blob size:', videoBlob.size, 'bytes (', videoSizeMB.toFixed(2), 'MB)');
        console.log('Base64 size estimate:', base64SizeMB.toFixed(2), 'MB');
        
        // Warn if approaching 200MB limit
        if (videoSizeMB > 180) {
          console.warn('Video size approaching 200MB limit!');
          toast({ 
            title: '⚠️ Очень большой размер видео', 
            description: `Размер: ${videoSizeMB.toFixed(1)}MB. Максимум: 200MB`, 
            variant: 'destructive' 
          });
        } else if (videoSizeMB > 50) {
          console.log('Large video file detected');
          toast({ 
            title: '📹 Большое видео', 
            description: `Загружаем ${videoSizeMB.toFixed(1)}MB - это займет время`, 
            variant: 'default' 
          });
        }
        
        // Detect video format from blob type
        let contentType = 'video/mp4';
        let filename = 'recording.mp4';
        
        if (videoBlob.type) {
          contentType = videoBlob.type;
          const extension = videoBlob.type.includes('webm') ? 'webm' : 'mp4';
          filename = `recording.${extension}`;
        }
        
        const requestBody = {
          title: title,
          comments: comments,
          video_data: base64Video,
          video_filename: filename,
          video_content_type: contentType
        };
        
        console.log('Request body keys:', Object.keys(requestBody));
        
        // Use AndroidFetchHelper for improved Android compatibility
        console.log('Starting upload with AndroidFetchHelper');
        
        const response = await AndroidFetchHelper.uploadVideo(
          apiUrls.leads,
          requestBody,
          token,
          videoSizeMB
        );

        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        const responseText = await response.text();
        console.log('Raw response text:', responseText);
        
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          console.error('Response text that failed to parse:', responseText);
          throw new Error(`Invalid JSON response: ${responseText.substring(0, 200)}`);
        }
        
        if (response.ok && data.success) {
          // Show success message
          toast({
            title: '✅ Видео отправлено!',
            description: data.message || `Видео успешно загружено (${videoSizeMB.toFixed(1)}MB)`,
            variant: 'default'
          });
          
          // Reload leads
          await onLoadLeads(token);
        } else {
          toast({ 
            title: 'Ошибка сохранения', 
            description: data.error || 'Не удалось сохранить лид', 
            variant: 'destructive' 
          });
          throw new Error(data.error || 'Не удалось сохранить лид');
        }
      };
      
      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        toast({ 
          title: 'Ошибка чтения файла', 
          description: 'Не удалось прочитать видео файл', 
          variant: 'destructive' 
        });
        throw new Error('FileReader error');
      };
      
      reader.readAsDataURL(videoBlob);
    } catch (error: any) {
      console.error('Full error object:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      let errorMessage = 'Не удалось сохранить лид';
      
      if (error.name === 'AbortError') {
        errorMessage = 'Превышено время ожидания. Попробуйте записать короче или перезагрузите страницу';
      } else if (error.name === 'TypeError' && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
        const isAndroid = /android/i.test(navigator.userAgent);
        errorMessage = isAndroid ? 
          'Ошибка Android Chrome. Попробуйте: 1) Перезагрузить страницу 2) Переключиться на WiFi 3) Очистить кэш браузера' :
          'Ошибка сети. Проверьте интернет или попробуйте перезагрузить страницу';
      } else if (error.message.includes('Invalid JSON')) {
        errorMessage = 'Сервер вернул некорректный ответ';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Превышено время ожидания - попробуйте еще раз';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({ 
        title: 'Ошибка', 
        description: errorMessage, 
        variant: 'destructive' 
      });
      throw new Error(errorMessage);
    }
  };

  const handleSaveLead = async (videoBlob: Blob, leadData: LeadFormData) => {
    const videoSizeMB = videoBlob.size / (1024 * 1024);
    console.log('Video file size:', videoSizeMB.toFixed(2), 'MB');
    
    // Temporary fix: Always use standard upload with AndroidFetchHelper
    // Chunked upload disabled due to Android Chrome compatibility issues
    console.log('Using AndroidFetchHelper for all uploads (chunked upload temporarily disabled)');
    await handleStandardUpload(videoBlob, leadData);
  };

  return {
    handleSaveLead
  };
};