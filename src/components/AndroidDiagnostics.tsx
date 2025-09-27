import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface AndroidDiagnosticsProps {
  onClose: () => void;
}

interface DiagnosticResult {
  test: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  details?: string;
}

const AndroidDiagnostics: React.FC<AndroidDiagnosticsProps> = ({ onClose }) => {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  const runDiagnostics = async () => {
    setIsRunning(true);
    setResults([]);
    
    const newResults: DiagnosticResult[] = [];

    // Test 1: Device Detection
    const userAgent = navigator.userAgent;
    const isAndroid = /android/i.test(userAgent);
    const isChrome = /chrome/i.test(userAgent) && !/edge/i.test(userAgent);
    const isAndroidChrome = isAndroid && isChrome;
    
    newResults.push({
      test: 'Device Detection',
      status: isAndroidChrome ? 'warning' : 'success',
      message: isAndroidChrome ? 'Android Chrome detected (проблемная платформа)' : 'Устройство совместимо',
      details: `Android: ${isAndroid}, Chrome: ${isChrome}, UserAgent: ${userAgent.substring(0, 100)}...`
    });

    // Test 2: MediaRecorder Support
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      
      const mp4Support = MediaRecorder.isTypeSupported('video/mp4');
      const webmSupport = MediaRecorder.isTypeSupported('video/webm');
      
      stream.getTracks().forEach(track => track.stop());
      
      newResults.push({
        test: 'Camera & Recording',
        status: mp4Support ? 'success' : 'warning',
        message: mp4Support ? 'MP4 запись поддерживается' : 'Только WebM запись',
        details: `MP4: ${mp4Support}, WebM: ${webmSupport}`
      });
    } catch (error: any) {
      newResults.push({
        test: 'Camera & Recording',
        status: 'error',
        message: 'Нет доступа к камере',
        details: error.message
      });
    }

    // Test 3: Network Connectivity
    try {
      const testUrl = 'https://functions.poehali.dev/080ec769-925f-4132-8cd3-549c89bdc4c0';
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(testUrl, {
        method: 'GET',
        signal: controller.signal,
        mode: 'cors',
        credentials: 'omit'
      });
      
      clearTimeout(timeoutId);
      
      newResults.push({
        test: 'Network Connectivity',
        status: response.ok ? 'success' : 'warning',
        message: response.ok ? 'Сеть работает нормально' : 'Проблемы с сетью',
        details: `Status: ${response.status}, Headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()))}`
      });
    } catch (error: any) {
      newResults.push({
        test: 'Network Connectivity',
        status: 'error',
        message: 'Ошибка сети (типичная для Android Chrome)',
        details: error.message
      });
    }

    // Test 4: Local Storage
    try {
      localStorage.setItem('android_test', 'test_value');
      const value = localStorage.getItem('android_test');
      localStorage.removeItem('android_test');
      
      newResults.push({
        test: 'Local Storage',
        status: value === 'test_value' ? 'success' : 'error',
        message: value === 'test_value' ? 'Local Storage работает' : 'Local Storage недоступен',
        details: `Test value: ${value}`
      });
    } catch (error: any) {
      newResults.push({
        test: 'Local Storage',
        status: 'error',
        message: 'Local Storage недоступен',
        details: error.message
      });
    }

    // Test 5: File API
    try {
      const testBlob = new Blob(['test'], { type: 'text/plain' });
      const reader = new FileReader();
      
      const readPromise = new Promise((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(testBlob);
      });
      
      await readPromise;
      
      newResults.push({
        test: 'File API',
        status: 'success',
        message: 'File API работает',
        details: 'Blob creation and FileReader working'
      });
    } catch (error: any) {
      newResults.push({
        test: 'File API',
        status: 'error',
        message: 'File API недоступен',
        details: error.message
      });
    }

    setResults(newResults);
    setIsRunning(false);
    
    const errorCount = newResults.filter(r => r.status === 'error').length;
    const warningCount = newResults.filter(r => r.status === 'warning').length;
    
    if (errorCount > 0) {
      toast({
        title: 'Обнаружены проблемы',
        description: `${errorCount} критических ошибок, ${warningCount} предупреждений`,
        variant: 'destructive'
      });
    } else if (warningCount > 0) {
      toast({
        title: 'Android Chrome особенности',
        description: `${warningCount} предупреждений - это нормально для Android`,
      });
    } else {
      toast({
        title: 'Все тесты пройдены',
        description: 'Устройство полностью совместимо',
      });
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success': return <Icon name="CheckCircle" size={16} className="text-green-600" />;
      case 'warning': return <Icon name="AlertTriangle" size={16} className="text-yellow-600" />;
      case 'error': return <Icon name="XCircle" size={16} className="text-red-600" />;
    }
  };

  const getStatusColor = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success': return 'text-green-800 bg-green-50';
      case 'warning': return 'text-yellow-800 bg-yellow-50';
      case 'error': return 'text-red-800 bg-red-50';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="Smartphone" size={20} />
              Android Диагностика
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <Icon name="X" size={16} />
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto">
          {isRunning ? (
            <div className="flex items-center justify-center py-8">
              <Icon name="Loader2" size={32} className="animate-spin mr-3" />
              <span>Проверяем совместимость...</span>
            </div>
          ) : (
            <>
              {results.map((result, index) => (
                <div key={index} className={`p-3 rounded-lg border ${getStatusColor(result.status)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(result.status)}
                      <span className="font-medium">{result.test}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm mb-1">{result.message}</p>
                  
                  {result.details && (
                    <details className="text-xs opacity-70">
                      <summary className="cursor-pointer">Детали</summary>
                      <pre className="mt-1 whitespace-pre-wrap break-all">{result.details}</pre>
                    </details>
                  )}
                </div>
              ))}
              
              <div className="pt-4 border-t">
                <div className="flex gap-2">
                  <Button onClick={runDiagnostics} variant="outline" className="flex-1">
                    <Icon name="RefreshCw" size={16} className="mr-2" />
                    Перезапустить тесты
                  </Button>
                  
                  <Button onClick={onClose} className="flex-1">
                    <Icon name="CheckCircle" size={16} className="mr-2" />
                    Закрыть
                  </Button>
                </div>
                
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Если есть ошибки сети - это обычная проблема Android Chrome. 
                  Попробуйте WiFi или перезагрузите страницу.
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AndroidDiagnostics;