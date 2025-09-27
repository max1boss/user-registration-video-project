import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';


interface TestResult {
  test: string;
  status: 'pending' | 'running' | 'success' | 'error';
  duration?: number;
  error?: string;
  details?: string;
}

export const AndroidVideoTest: React.FC = () => {
  const [tests, setTests] = useState<TestResult[]>([
    { test: 'Short Video (30s)', status: 'pending' },
    { test: 'Medium Video (2min)', status: 'pending' },
    { test: 'Long Video (5min)', status: 'pending' },
    { test: 'Network Retry Test', status: 'pending' },
    { test: 'Chunked Upload Test', status: 'pending' }
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);


  const updateTest = (index: number, update: Partial<TestResult>) => {
    setTests(prev => prev.map((test, i) => i === index ? { ...test, ...update } : test));
  };

  const createTestVideo = async (durationSeconds: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas not supported'));
        return;
      }

      canvas.width = 320;
      canvas.height = 240;
      
      const stream = canvas.captureStream(15);
      const chunks: Blob[] = [];
      
      let mediaRecorder: MediaRecorder;
      try {
        mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'video/mp4;codecs=h264'
        });
      } catch {
        try {
          mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'video/webm;codecs=vp8'
          });
        } catch {
          mediaRecorder = new MediaRecorder(stream);
        }
      }

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: mediaRecorder.mimeType });
        resolve(blob);
      };

      mediaRecorder.start();

      // Draw animated content
      let frame = 0;
      const drawFrame = () => {
        if (frame * 66 >= durationSeconds * 1000) {
          mediaRecorder.stop();
          return;
        }

        ctx.fillStyle = `hsl(${frame % 360}, 70%, 50%)`;
        ctx.fillRect(0, 0, 320, 240);
        
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Test Video`, 160, 100);
        ctx.fillText(`${Math.floor(frame * 66 / 1000)}s`, 160, 140);
        
        frame++;
        setTimeout(drawFrame, 66); // ~15 FPS
      };

      drawFrame();
    });
  };

  const testUpload = async (videoBlob: Blob, testIndex: number): Promise<void> => {
    const startTime = Date.now();
    
    try {
      // Simulate API upload
      const formData = new FormData();
      formData.append('video', videoBlob, 'test-video.mp4');
      
      const response = await fetch('/api/test-upload', {
        method: 'POST',
        body: formData,
        headers: {
          'X-Test-Upload': 'true'
        }
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const duration = Date.now() - startTime;
      updateTest(testIndex, {
        status: 'success',
        duration,
        details: `${(videoBlob.size / 1024 / 1024).toFixed(1)}MB uploaded in ${(duration / 1000).toFixed(1)}s`
      });

    } catch (error: any) {
      const duration = Date.now() - startTime;
      updateTest(testIndex, {
        status: 'error',
        duration,
        error: error.message,
        details: `Failed after ${(duration / 1000).toFixed(1)}s`
      });
    }
  };

  const testNetworkResilience = async (testIndex: number): Promise<void> => {
    const startTime = Date.now();
    updateTest(testIndex, { status: 'running' });

    try {
      // Test multiple rapid requests
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(
          fetch('/api/health', {
            method: 'GET',
            headers: { 'X-Test-Request': i.toString() }
          })
        );
      }

      await Promise.all(promises);
      
      const duration = Date.now() - startTime;
      updateTest(testIndex, {
        status: 'success',
        duration,
        details: '5 concurrent requests successful'
      });

    } catch (error: any) {
      const duration = Date.now() - startTime;
      updateTest(testIndex, {
        status: 'error',
        duration,
        error: error.message
      });
    }
  };

  const testChunkedUpload = async (testIndex: number): Promise<void> => {
    const startTime = Date.now();
    updateTest(testIndex, { status: 'running' });

    try {
      // Create a large test blob
      const largeData = new Uint8Array(5 * 1024 * 1024); // 5MB
      for (let i = 0; i < largeData.length; i++) {
        largeData[i] = i % 256;
      }
      const largeBlob = new Blob([largeData], { type: 'application/octet-stream' });

      // Simulate chunked upload
      const chunkSize = 1024 * 1024; // 1MB chunks
      const totalChunks = Math.ceil(largeBlob.size / chunkSize);
      
      for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, largeBlob.size);
        const chunk = largeBlob.slice(start, end);
        
        // Simulate chunk upload
        const response = await fetch('/api/test-chunk', {
          method: 'POST',
          body: chunk,
          headers: {
            'X-Chunk-Index': i.toString(),
            'X-Total-Chunks': totalChunks.toString()
          }
        });

        if (!response.ok) {
          throw new Error(`Chunk ${i} failed: ${response.status}`);
        }
      }

      const duration = Date.now() - startTime;
      updateTest(testIndex, {
        status: 'success',
        duration,
        details: `${totalChunks} chunks (${(largeBlob.size / 1024 / 1024).toFixed(1)}MB) uploaded`
      });

    } catch (error: any) {
      const duration = Date.now() - startTime;
      updateTest(testIndex, {
        status: 'error',
        duration,
        error: error.message
      });
    }
  };

  const runAllTests = async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    setTests(prev => prev.map(test => ({ ...test, status: 'pending' })));

    try {
      // Test 1: Short Video (30s)
      updateTest(0, { status: 'running' });
      const shortVideo = await createTestVideo(30);
      await testUpload(shortVideo, 0);

      // Test 2: Medium Video (2min)
      updateTest(1, { status: 'running' });
      const mediumVideo = await createTestVideo(120);
      await testUpload(mediumVideo, 1);

      // Test 3: Long Video (5min)
      updateTest(2, { status: 'running' });
      const longVideo = await createTestVideo(300);
      await testUpload(longVideo, 2);

      // Test 4: Network Retry
      await testNetworkResilience(3);

      // Test 5: Chunked Upload
      await testChunkedUpload(4);

      toast({
        title: 'Tests Complete',
        description: 'All Android video tests finished',
      });

    } catch (error: any) {
      toast({
        title: 'Test Suite Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'running': return '🔄';
      case 'success': return '✅';
      case 'error': return '❌';
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pending': return 'text-gray-500';
      case 'running': return 'text-blue-600';
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📱 Android Video Upload Tests
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runAllTests} 
          disabled={isRunning}
          className="w-full"
        >
          {isRunning ? 'Running Tests...' : 'Run All Tests'}
        </Button>

        <div className="space-y-3">
          {tests.map((test, index) => (
            <div 
              key={index}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{getStatusIcon(test.status)}</span>
                <div>
                  <div className="font-medium">{test.test}</div>
                  {test.details && (
                    <div className="text-sm text-gray-600">{test.details}</div>
                  )}
                  {test.error && (
                    <div className="text-sm text-red-600">{test.error}</div>
                  )}
                </div>
              </div>
              <div className={`text-sm ${getStatusColor(test.status)}`}>
                {test.duration && `${(test.duration / 1000).toFixed(1)}s`}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-800 mb-2">Test Instructions:</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Open Chrome DevTools (F12)</li>
            <li>• Go to Network tab</li>
            <li>• Enable "Slow 3G" to simulate mobile network</li>
            <li>• Run tests and monitor for "failed to fetch" errors</li>
            <li>• Check console for detailed error logs</li>
          </ul>
        </div>

        {/* Hidden video element for testing */}
        <video ref={videoRef} style={{ display: 'none' }} />
      </CardContent>
    </Card>
  );
};

export default AndroidVideoTest;