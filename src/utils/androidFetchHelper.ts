/**
 * Android Chrome specific fetch helper utility
 * Handles the "failed to fetch" issues on Android Chrome
 */

export interface AndroidFetchOptions extends RequestInit {
  url: string;
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
}

export class AndroidFetchHelper {
  private static isAndroidChrome(): boolean {
    const isAndroid = /android/i.test(navigator.userAgent);
    const isChrome = /chrome/i.test(navigator.userAgent) && !/edge/i.test(navigator.userAgent);
    return isAndroid && isChrome;
  }

  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Enhanced fetch specifically designed for Android Chrome compatibility
   */
  static async fetch(options: AndroidFetchOptions): Promise<Response> {
    const {
      url,
      maxRetries = 5,
      retryDelay = 1000,
      timeout = 300000, // 5 minutes default
      ...fetchOptions
    } = options;

    const isAndroidChrome = this.isAndroidChrome();
    console.log('AndroidFetchHelper:', { isAndroidChrome, url: url.substring(0, 50) + '...' });

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log('AndroidFetchHelper: Timeout reached');
      controller.abort();
    }, timeout);

    // Configure fetch options for Android Chrome
    const finalFetchOptions: RequestInit = {
      ...fetchOptions,
      signal: controller.signal
    };

    if (isAndroidChrome) {
      // Android Chrome specific optimizations
      Object.assign(finalFetchOptions, {
        mode: 'cors' as RequestMode,
        credentials: 'omit' as RequestCredentials,
        cache: 'no-store' as RequestCache,
        redirect: 'follow' as RequestRedirect,
        keepalive: false
      });

      // Clean headers for Android - remove problematic ones
      if (finalFetchOptions.headers) {
        const cleanHeaders = { ...finalFetchOptions.headers };
        delete (cleanHeaders as any)['Cache-Control'];
        delete (cleanHeaders as any)['Accept'];
        delete (cleanHeaders as any)['User-Agent'];
        finalFetchOptions.headers = cleanHeaders;
      }
    } else {
      // Standard configuration for other browsers
      Object.assign(finalFetchOptions, {
        mode: 'cors' as RequestMode,
        credentials: 'omit' as RequestCredentials
      });
    }

    let lastError: Error | null = null;
    const retries = isAndroidChrome ? maxRetries : Math.min(maxRetries, 3);

    // Retry loop
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`AndroidFetchHelper: Attempt ${attempt}/${retries}`);
        
        const response = await fetch(url, finalFetchOptions);
        
        // Validate response for Android Chrome
        if (isAndroidChrome && response && response.status === 0) {
          throw new Error('Network error - response status 0');
        }

        clearTimeout(timeoutId);
        console.log(`AndroidFetchHelper: Success on attempt ${attempt}`);
        return response;

      } catch (error: any) {
        lastError = error;
        const errorMsg = error.message || 'Unknown error';
        console.error(`AndroidFetchHelper: Attempt ${attempt} failed:`, errorMsg);

        // Don't retry on abort (timeout)
        if (error.name === 'AbortError') {
          clearTimeout(timeoutId);
          throw error;
        }

        // Retry logic
        if (attempt < retries) {
          const delay = isAndroidChrome ? 
            (retryDelay * attempt) : // Progressive: 1s, 2s, 3s, 4s, 5s
            (retryDelay * attempt * 2); // Standard: 2s, 4s, 6s

          console.log(`AndroidFetchHelper: Waiting ${delay}ms before retry...`);
          await this.sleep(delay);
        }
      }
    }

    clearTimeout(timeoutId);
    
    // All attempts failed
    const errorMsg = isAndroidChrome ? 
      `Android Chrome fetch failed after ${retries} attempts. Try: 1) Reload page 2) Switch to WiFi 3) Clear browser cache` :
      `Fetch failed after ${retries} attempts: ${lastError?.message || 'Unknown error'}`;
    
    throw new Error(errorMsg);
  }

  /**
   * Upload helper specifically for video files on Android
   */
  static async uploadVideo(
    url: string, 
    videoData: any, 
    token: string, 
    videoSizeMB: number
  ): Promise<Response> {
    const isAndroidChrome = this.isAndroidChrome();
    
    return this.fetch({
      url,
      method: 'POST',
      headers: {
        'X-Auth-Token': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(videoData),
      maxRetries: isAndroidChrome ? 5 : 3,
      retryDelay: isAndroidChrome ? 1000 : 2000,
      timeout: isAndroidChrome ? 
        (videoSizeMB > 1 ? 900000 : 180000) : // 15min/>1MB, 3min/smaller on Android
        (videoSizeMB > 2 ? 600000 : 120000)   // 10min/>2MB, 2min/smaller on others
    });
  }

  /**
   * Chunk upload helper for large files
   */
  static async uploadChunk(
    url: string,
    chunkData: any,
    token: string
  ): Promise<Response> {
    const isAndroidChrome = this.isAndroidChrome();
    
    return this.fetch({
      url,
      method: 'POST',
      headers: {
        'X-Auth-Token': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(chunkData),
      maxRetries: isAndroidChrome ? 3 : 2,
      retryDelay: 1500,
      timeout: 60000 // 1 minute for chunks
    });
  }
}