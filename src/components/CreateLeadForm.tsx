import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
}

interface CreateLeadFormProps {
  user: User;
  onBack: () => void;
  onLogout: () => void;
}

const CreateLeadForm: React.FC<CreateLeadFormProps> = ({ user, onBack, onLogout }) => {
  const [formData, setFormData] = useState({
    title: '',
    parentName: '',
    childName: '',
    age: '',
    phone: '',
    comments: ''
  });
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Таймер для отображения времени записи
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      alert('Ошибка доступа к микрофону. Проверьте разрешения.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  };

  const removeAudio = () => {
    setAudioBlob(null);
    setRecordingTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Симуляция отправки данных
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onBack();
      }, 3000);
      
    } catch (error) {
      alert('Ошибка при сохранении лида');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.title.trim() && formData.parentName.trim() && formData.phone.trim();

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 rounded-2xl blur opacity-30"></div>
          <Card className="relative bg-white/90 backdrop-blur-sm border-0 shadow-xl max-w-md">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="CheckCircle" size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Лид успешно создан!</h3>
              <p className="text-gray-600 mb-4">
                Информация сохранена и отправлена администратору
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Icon name="ArrowLeft" size={16} />
                <span>Возвращаемся в личный кабинет...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onBack}
                className="bg-white/70 backdrop-blur-sm border-gray-200 hover:bg-white/90"
              >
                <Icon name="ArrowLeft" size={16} className="mr-2" />
                Назад
              </Button>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Создание лида
                </h1>
                <p className="text-sm text-gray-500">Добавить нового клиента</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 hidden md:block">
                {user.name}
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onLogout}
                className="bg-red-50 hover:bg-red-100 border-red-200 text-red-600"
              >
                <Icon name="LogOut" size={16} className="mr-2" />
                Выйти
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Main Form */}
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-20"></div>
              <Card className="relative bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <Icon name="FileText" size={16} className="text-white" />
                    </div>
                    Информация о клиенте
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Название лида *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="Например: Консультация по детскому промо"
                      className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  {/* Parent and Child Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Имя родителя *
                      </label>
                      <input
                        type="text"
                        value={formData.parentName}
                        onChange={(e) => setFormData({...formData, parentName: e.target.value})}
                        placeholder="Имя и фамилия"
                        className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Имя ребенка
                      </label>
                      <input
                        type="text"
                        value={formData.childName}
                        onChange={(e) => setFormData({...formData, childName: e.target.value})}
                        placeholder="Имя ребенка"
                        className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {/* Age and Phone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Возраст ребенка
                      </label>
                      <input
                        type="text"
                        value={formData.age}
                        onChange={(e) => setFormData({...formData, age: e.target.value})}
                        placeholder="Например: 7 лет"
                        className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Телефон *
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="+7 (999) 123-45-67"
                        className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Comments */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Дополнительные комментарии
                    </label>
                    <textarea
                      value={formData.comments}
                      onChange={(e) => setFormData({...formData, comments: e.target.value})}
                      placeholder="Любая дополнительная информация о клиенте или запросе..."
                      rows={4}
                      className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Audio Recording */}
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 rounded-2xl blur opacity-20"></div>
              <Card className="relative bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                      <Icon name="Mic" size={16} className="text-white" />
                    </div>
                    Аудиозапись (необязательно)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!audioBlob ? (
                    <div className="text-center py-8">
                      {!isRecording ? (
                        <div className="space-y-4">
                          <div className="w-16 h-16 bg-gradient-to-r from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto">
                            <Icon name="Mic" size={24} className="text-red-600" />
                          </div>
                          <div>
                            <h4 className="text-lg font-medium text-gray-900 mb-2">
                              Записать аудиокомментарий
                            </h4>
                            <p className="text-gray-600 text-sm mb-4">
                              Запишите голосовые заметки или комментарии к лиду
                            </p>
                            <Button
                              type="button"
                              onClick={startRecording}
                              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                            >
                              <Icon name="Mic" size={16} className="mr-2" />
                              Начать запись
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
                            <Icon name="Mic" size={24} className="text-white" />
                          </div>
                          <div>
                            <h4 className="text-lg font-medium text-gray-900 mb-2">
                              Идет запись...
                            </h4>
                            <div className="text-2xl font-mono text-red-600 mb-4">
                              {formatTime(recordingTime)}
                            </div>
                            <Button
                              type="button"
                              onClick={stopRecording}
                              variant="outline"
                              className="bg-white border-red-200 text-red-600 hover:bg-red-50"
                            >
                              <Icon name="Square" size={16} className="mr-2" />
                              Остановить запись
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                            <Icon name="CheckCircle" size={18} className="text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Аудио записано</p>
                            <p className="text-sm text-gray-600">
                              Длительность: {formatTime(recordingTime)}
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          onClick={removeAudio}
                          variant="outline"
                          size="sm"
                          className="bg-red-50 hover:bg-red-100 border-red-200 text-red-600"
                        >
                          <Icon name="X" size={14} className="mr-1" />
                          Удалить
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                className="bg-white/70 backdrop-blur-sm border-gray-200 hover:bg-white/90"
              >
                Отмена
              </Button>
              <Button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white min-w-[120px]"
              >
                {isSubmitting ? (
                  <>
                    <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                    Сохранение...
                  </>
                ) : (
                  <>
                    <Icon name="Save" size={16} className="mr-2" />
                    Создать лид
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateLeadForm;