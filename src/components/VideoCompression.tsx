import React from 'react';

interface VideoCompressionOptions {
  quality?: number; // 0.1 - 1.0
  maxWidth?: number;
  maxHeight?: number;
  maxSizeMB?: number;
}

export class VideoCompressor {
  /**
   * Compress video blob to reduce file size for better upload performance
   */
  static async compressVideo(
    videoBlob: Blob, 
    options: VideoCompressionOptions = {}
  ): Promise<Blob> {
    const {
      quality = 0.7,
      maxWidth = 720,
      maxHeight = 480,
      maxSizeMB = 10
    } = options;

    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      video.onloadedmetadata = () => {
        // Calculate new dimensions maintaining aspect ratio
        const aspectRatio = video.videoWidth / video.videoHeight;
        let newWidth = Math.min(video.videoWidth, maxWidth);
        let newHeight = Math.min(video.videoHeight, maxHeight);
        
        if (newWidth / newHeight > aspectRatio) {
          newWidth = newHeight * aspectRatio;
        } else {
          newHeight = newWidth / aspectRatio;
        }
        
        canvas.width = newWidth;
        canvas.height = newHeight;
        
        console.log(`Compressing video: ${video.videoWidth}x${video.videoHeight} → ${newWidth}x${newHeight}`);
        
        const chunks: Blob[] = [];
        let mediaRecorder: MediaRecorder;
        
        try {
          // Create compressed video stream
          const stream = canvas.captureStream(15); // 15 FPS for smaller file size
          
          // Try different codecs for compatibility
          const mimeTypes = [
            'video/mp4;codecs=h264',
            'video/webm;codecs=vp8',
            'video/webm;codecs=vp9',
            'video/mp4',
            'video/webm'
          ];
          
          let mimeType = 'video/mp4';
          for (const type of mimeTypes) {
            if (MediaRecorder.isTypeSupported(type)) {
              mimeType = type;
              break;
            }
          }
          
          mediaRecorder = new MediaRecorder(stream, {
            mimeType,
            videoBitsPerSecond: Math.max(500000, Math.min(2000000, newWidth * newHeight * 0.1)) // Dynamic bitrate
          });
          
          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              chunks.push(event.data);
            }
          };
          
          mediaRecorder.onstop = () => {
            const compressedBlob = new Blob(chunks, { type: mimeType });
            const compressionRatio = ((videoBlob.size - compressedBlob.size) / videoBlob.size * 100).toFixed(1);
            
            console.log(`Video compressed: ${(videoBlob.size / 1024 / 1024).toFixed(1)}MB → ${(compressedBlob.size / 1024 / 1024).toFixed(1)}MB (${compressionRatio}% reduction)`);
            
            // Check if compression was effective
            if (compressedBlob.size < videoBlob.size && compressedBlob.size / 1024 / 1024 <= maxSizeMB) {
              resolve(compressedBlob);
            } else {
              console.log('Compression not effective, using original');
              resolve(videoBlob);
            }
          };
          
          mediaRecorder.onerror = (error) => {
            console.error('MediaRecorder error:', error);
            resolve(videoBlob); // Fallback to original
          };
          
          // Start compression
          mediaRecorder.start(100); // Collect data every 100ms
          
          // Draw video frames to canvas for compression
          const drawFrame = () => {
            if (video.paused || video.ended) {
              mediaRecorder.stop();
              return;
            }
            
            ctx.drawImage(video, 0, 0, newWidth, newHeight);
            requestAnimationFrame(drawFrame);
          };
          
          video.currentTime = 0;
          video.play();
          drawFrame();
          
          // Stop after video duration
          setTimeout(() => {
            if (mediaRecorder.state === 'recording') {
              mediaRecorder.stop();
            }
            video.pause();
          }, video.duration * 1000 + 1000);
          
        } catch (error) {
          console.error('Compression setup failed:', error);
          resolve(videoBlob); // Fallback to original
        }
      };
      
      video.onerror = () => {
        console.error('Video loading failed');
        resolve(videoBlob); // Fallback to original
      };
      
      video.src = URL.createObjectURL(videoBlob);
      video.load();
    });
  }
  
  /**
   * Check if video needs compression based on size and duration
   */
  static shouldCompress(videoBlob: Blob, maxSizeMB: number = 5): boolean {
    const sizeMB = videoBlob.size / 1024 / 1024;
    return sizeMB > maxSizeMB;
  }
}

interface VideoCompressionProps {
  onCompressionComplete: (compressedBlob: Blob) => void;
  originalBlob: Blob;
  children: React.ReactNode;
}

export const VideoCompressionWrapper: React.FC<VideoCompressionProps> = ({
  onCompressionComplete,
  originalBlob,
  children
}) => {
  const handleCompress = async () => {
    try {
      if (VideoCompressor.shouldCompress(originalBlob)) {
        const compressed = await VideoCompressor.compressVideo(originalBlob, {
          quality: 0.7,
          maxWidth: 640,
          maxHeight: 480,
          maxSizeMB: 8
        });
        onCompressionComplete(compressed);
      } else {
        onCompressionComplete(originalBlob);
      }
    } catch (error) {
      console.error('Video compression failed:', error);
      onCompressionComplete(originalBlob); // Fallback
    }
  };

  React.useEffect(() => {
    if (originalBlob) {
      handleCompress();
    }
  }, [originalBlob]);

  return <>{children}</>;
};

export default VideoCompressor;