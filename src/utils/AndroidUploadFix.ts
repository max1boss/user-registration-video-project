/**
 * Android-specific upload fixes for Chrome "failed to fetch" errors
 */

export interface AndroidUploadOptions {
  maxRetries?: number;
  retryDelay?: number;
  chunkThresholdMB?: number;
  timeoutMs?: number;
}

export class AndroidUploadHelper {
  private static readonly DEFAULT_OPTIONS: Required<AndroidUploadOptions> = {
    maxRetries: 3,
    retryDelay: 2000,
    chunkThresholdMB: 2,
    timeoutMs: 120000 // 2 minutes
  };

  /**
   * Detect if we're running on Android Chrome
   */
  static isAndroidChrome(): boolean {
    const userAgent = navigator.userAgent.toLowerCase();
    return userAgent.includes('android') && userAgent.includes('chrome');
  }

  /**
   * Create a fetch request with Android-specific optimizations
   */
  static async safeFetch(
    url: string, 
    options: RequestInit, 
    androidOptions: AndroidUploadOptions = {}
  ): Promise<Response> {
    const opts = { ...this.DEFAULT_OPTIONS, ...androidOptions };
    
    // Add Android-specific headers
    const headers = new Headers(options.headers);
    headers.set('Cache-Control', 'no-cache');
    headers.set('Accept', 'application/json');
    
    // Remove problematic headers for Android
    headers.delete('Authorization'); // Use X-Auth-Token instead
    
    const enhancedOptions: RequestInit = {
      ...options,
      headers,
      mode: 'cors',
      credentials: 'omit',
      keepalive: false // Disable keepalive for Android
    };

    let lastError: Error;
    
    for (let attempt = 1; attempt <= opts.maxRetries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), opts.timeoutMs);
      
      try {
        console.log(`Android fetch attempt ${attempt}/${opts.maxRetries} to ${url}`);
        
        const response = await fetch(url, {
          ...enhancedOptions,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        // Success
        console.log(`Android fetch succeeded on attempt ${attempt}`);
        return response;
        
      } catch (error: any) {
        clearTimeout(timeoutId);
        lastError = error;
        
        console.error(`Android fetch attempt ${attempt} failed:`, {
          error: error.message,
          name: error.name,
          stack: error.stack?.substring(0, 200)
        });
        
        // Don't retry on certain errors
        if (error.name === 'AbortError' && attempt === opts.maxRetries) {
          break;
        }
        
        // Wait before retry (but not on last attempt)
        if (attempt < opts.maxRetries) {
          const delay = opts.retryDelay * attempt; // Exponential backoff
          console.log(`Waiting ${delay}ms before retry...`);
          await this.sleep(delay);
        }
      }
    }
    
    // All attempts failed
    throw new Error(`Android fetch failed after ${opts.maxRetries} attempts: ${lastError.message}`);
  }

  /**
   * Check if a file should use chunked upload based on Android limitations
   */
  static shouldUseChunkedUpload(blob: Blob, thresholdMB: number = 2): boolean {
    const sizeMB = blob.size / (1024 * 1024);
    
    // Always use chunked upload for large files on Android
    if (this.isAndroidChrome() && sizeMB > thresholdMB) {
      console.log(`Android: Using chunked upload for ${sizeMB.toFixed(1)}MB file`);
      return true;
    }
    
    return sizeMB > thresholdMB;
  }

  /**
   * Prepare video blob for Android upload with compression if needed
   */
  static async prepareVideoForAndroid(videoBlob: Blob): Promise<Blob> {
    const sizeMB = videoBlob.size / (1024 * 1024);
    
    // If video is too large for standard upload, try compression
    if (sizeMB > 2 && this.isAndroidChrome()) {
      console.log(`Android: Attempting to compress ${sizeMB.toFixed(1)}MB video`);
      
      try {
        const compressed = await this.compressVideo(videoBlob);
        const compressedSizeMB = compressed.size / (1024 * 1024);
        
        if (compressedSizeMB < sizeMB * 0.8) { // At least 20% reduction
          console.log(`Android: Video compressed from ${sizeMB.toFixed(1)}MB to ${compressedSizeMB.toFixed(1)}MB`);
          return compressed;
        }
      } catch (error) {
        console.warn('Android: Video compression failed, using original', error);
      }
    }
    
    return videoBlob;
  }

  /**
   * Simple video compression for Android
   */
  private static async compressVideo(videoBlob: Blob): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas not supported'));
        return;
      }

      video.onloadedmetadata = () => {
        // Reduce resolution for Android
        const maxWidth = 480;
        const maxHeight = 360;
        
        const aspectRatio = video.videoWidth / video.videoHeight;
        let width = Math.min(video.videoWidth, maxWidth);
        let height = Math.min(video.videoHeight, maxHeight);
        
        if (width / height > aspectRatio) {
          width = height * aspectRatio;
        } else {
          height = width / aspectRatio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const stream = canvas.captureStream(12); // Reduced frame rate for Android
        const chunks: Blob[] = [];
        
        // Use most compatible codec for Android
        let mediaRecorder: MediaRecorder;
        try {
          mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'video/mp4;codecs=h264',
            videoBitsPerSecond: 500000 // Lower bitrate for Android
          });
        } catch {
          try {
            mediaRecorder = new MediaRecorder(stream, {
              mimeType: 'video/webm;codecs=vp8',
              videoBitsPerSecond: 500000
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
          const compressedBlob = new Blob(chunks, { type: mediaRecorder.mimeType });
          resolve(compressedBlob);
        };
        
        mediaRecorder.onerror = () => {
          reject(new Error('Compression failed'));
        };
        
        mediaRecorder.start();
        
        // Draw frames
        const drawFrame = () => {
          if (video.paused || video.ended) {
            mediaRecorder.stop();
            return;
          }
          
          ctx.drawImage(video, 0, 0, width, height);
          requestAnimationFrame(drawFrame);
        };
        
        video.currentTime = 0;
        video.play();
        drawFrame();
        
        // Stop after duration
        setTimeout(() => {
          if (mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
          }
          video.pause();
        }, Math.min(video.duration * 1000, 180000)); // Max 3 minutes for Android
      };
      
      video.onerror = () => reject(new Error('Video loading failed'));
      video.src = URL.createObjectURL(videoBlob);
      video.load();
    });
  }

  /**
   * Sleep utility
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get optimal upload settings for current device
   */
  static getOptimalSettings(): AndroidUploadOptions {
    if (this.isAndroidChrome()) {
      return {
        maxRetries: 3,
        retryDelay: 3000, // Longer delays for Android
        chunkThresholdMB: 1.5, // Lower threshold for Android
        timeoutMs: 180000 // 3 minutes for Android
      };
    }
    
    return this.DEFAULT_OPTIONS;
  }
}

export default AndroidUploadHelper;