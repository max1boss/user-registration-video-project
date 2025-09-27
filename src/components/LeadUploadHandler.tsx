import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { ChunkedUploader } from '@/utils/chunkedUpload';
import { LeadFormData } from '@/types/lead';
import { GoogleSheetsExporter } from '@/utils/googleSheetsExport';

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

  const autoExportToGoogleSheets = async (leadData: LeadFormData) => {
    try {
      // Проверяем настройку автоэкспорта
      const autoExportEnabled = localStorage.getItem('google_sheets_auto_export') === 'true';
      if (!autoExportEnabled) {
        console.log('Автоэкспорт выключен - пропускаем');
        return;
      }

      const serviceAccountKey = localStorage.getItem('google_service_account_key');
      if (!serviceAccountKey) {
        console.log('Google Sheets не настроен - пропускаем автоэкспорт');
        return;
      }

      const exporter = new GoogleSheetsExporter(serviceAccountKey);
      await exporter.exportLead({
        parentName: leadData.parentName,
        childInfo: `${leadData.childName}, ${leadData.age} лет`,
        phone: leadData.phone,
        userName: 'Лид'
      });

      console.log('Лид автоматически экспортирован в Google Sheets');
      
      // Показываем ненавязчивое уведомление
      toast({
        title: '✅ Экспорт в Google Sheets',
        description: 'Лид автоматически добавлен в таблицу',
        duration: 3000
      });
    } catch (error) {
      console.error('Ошибка автоэкспорта в Google Sheets:', error);
      // Не показываем ошибку пользователю, чтобы не мешать основному процессу
    }
  };

  const handleChunkedUpload = async (audioBlob: Blob, leadData: LeadFormData): Promise<void> => {
    const comments = `Родитель: ${leadData.parentName}, Ребенок: ${leadData.childName}, Возраст: ${leadData.age}, Телефон: ${leadData.phone}`;
    const uploader = new ChunkedUploader({
      file: audioBlob,
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
        
        // Auto-export to Google Sheets if configured
        await autoExportToGoogleSheets(leadData);
        
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

  const handleStandardUpload = async (audioBlob: Blob, leadData: LeadFormData): Promise<void> => {
    try {
      // Convert audio blob to base64
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
        
        const base64Audio = result.substring(base64Index + 7); // Skip "base64," (7 chars)
        console.log('Audio blob type:', audioBlob.type);
        console.log('Audio blob size:', audioBlob.size);
        console.log('Base64 length after split:', base64Audio.length);
        
        if (!base64Audio || base64Audio.length === 0) {
          console.error('Base64 conversion failed - empty result');
          toast({ 
            title: 'Ошибка кодирования аудио', 
            description: 'Не удалось преобразовать аудио в base64', 
            variant: 'destructive' 
          });
          throw new Error('Base64 conversion failed');
        }
        
        const comments = `Родитель: ${leadData.parentName}, Ребенок: ${leadData.childName}, Возраст: ${leadData.age}, Телефон: ${leadData.phone}`;
        
        console.log('Starting POST request to:', apiUrls.leads);
        console.log('Token length:', token.length);
        console.log('Comments:', comments);
        console.log('Base64 audio length:', base64Audio.length);
        
        // Check file size limits
        const audioSizeMB = audioBlob.size / (1024 * 1024);
        const base64SizeMB = (base64Audio.length * 3) / (4 * 1024 * 1024); // base64 is ~33% larger
        console.log('Audio blob size:', audioBlob.size, 'bytes (', audioSizeMB.toFixed(2), 'MB)');
        console.log('Base64 size estimate:', base64SizeMB.toFixed(2), 'MB');
        
        // Warn if approaching limits (audio files are typically much smaller)
        if (audioSizeMB > 8) {
          console.warn('Audio size approaching Cloud Function limits!');
          toast({ 
            title: '⚠️ Большой размер аудио', 
            description: `Размер: ${audioSizeMB.toFixed(1)}MB. Это может вызвать проблемы с загрузкой.`, 
            variant: 'destructive' 
          });
        }
        
        const requestBody = {
          title: `Лид от ${new Date().toLocaleDateString('ru-RU')}`,
          comments: comments,
          video_data: base64Audio, // Оставляем старое имя для совместимости
          video_filename: audioBlob.type.includes('mp4') ? 'recording.m4a' : 'recording.webm',
          video_content_type: audioBlob.type || 'audio/webm'
        };
        
        console.log('Request body keys:', Object.keys(requestBody));
        
        // Create fetch with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
        const response = await fetch(apiUrls.leads, {
          method: 'POST',
          headers: {
            'X-Auth-Token': token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

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
          // Reload leads
          await onLoadLeads(token);
          
          // Auto-export to Google Sheets if configured
          await autoExportToGoogleSheets(leadData);
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
          description: 'Не удалось прочитать аудио файл', 
          variant: 'destructive' 
        });
        throw new Error('FileReader error');
      };
      
      reader.readAsDataURL(audioBlob);
    } catch (error: any) {
      console.error('Full error object:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      let errorMessage = 'Не удалось сохранить лид';
      
      if (error.name === 'AbortError') {
        errorMessage = 'Превышено время ожидания (30 сек) - попробуйте еще раз';
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = 'Ошибка сети - проверьте подключение к интернету';
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

  const handleSaveLead = async (audioBlob: Blob, leadData: LeadFormData) => {
    const audioSizeMB = audioBlob.size / (1024 * 1024);
    console.log('Audio file size:', audioSizeMB.toFixed(2), 'MB');
    
    // Use chunked upload for files larger than 8MB (unlikely for audio)
    if (audioSizeMB > 8) {
      console.log('Using chunked upload for large file');
      await handleChunkedUpload(audioBlob, leadData);
    } else {
      console.log('Using standard upload for small file');
      await handleStandardUpload(audioBlob, leadData);
    }
  };

  return {
    handleSaveLead
  };
};