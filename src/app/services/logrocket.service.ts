import * as LogRocket from 'logrocket';

function isTestEnvironment(): boolean {
  try {
    const w = window as any;
    return !!(w && (w.__karma__ || w.jasmine));
  } catch {
    return true;
  }
}

export interface LogRocketService {
  init(): void;
  identify(userId: string, traits?: any): void;
  track(eventName: string, properties?: any): void;
  captureException(error: Error, extra?: any): void;
  trackPageView(path?: string): void;
  log(message: string, level?: 'info' | 'warn' | 'error'): void;
}

export class LogRocketImpl implements LogRocketService {
  private isInitialized = false;
  private readonly appVersion = '1.0.0';

  constructor() {
    if (!isTestEnvironment()) {
      this.init();
    }
  }

  init(): void {
    if (this.isInitialized) {
      return;
    }

     if (isTestEnvironment()) {
       return;
     }

    try {
      LogRocket.init('your-app-id/your-project', {
        network: {
          requestSanitizer: (request) => {
            if (request.url.toLowerCase().includes('/api/login') || 
                request.url.toLowerCase().includes('/api/register')) {
              request.body = undefined;
            }
            return request;
          },
          responseSanitizer: (response) => {
            if (response.url?.toLowerCase().includes('/api/login') || 
                response.url?.toLowerCase().includes('/api/register')) {
              if (response.body && typeof response.body === 'object' && 'token' in response.body) {
                delete (response.body as any).token;
              }
            }
            return response;
          }
        },
        console: {
          shouldAggregateConsoleErrors: true,
        },
        dom: {
          inputSanitizer: true,
        },
        release: this.appVersion,
      });

      this.isInitialized = true;
      console.log('LogRocket initialized successfully');
    } catch (error) {
      console.error('Failed to initialize LogRocket:', error);
    }
  }

  identify(userId: string, traits?: any): void {
    if (!this.isInitialized) return;

    try {
      LogRocket.identify(userId, {
        ...traits,
        appVersion: this.appVersion,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to identify user in LogRocket:', error);
    }
  }

  track(eventName: string, properties?: any): void {
    if (!this.isInitialized) return;

    try {
      LogRocket.track(eventName, {
        ...properties,
        timestamp: new Date().toISOString(),
        userId: this.getCurrentUserId(),
      });
    } catch (error) {
      console.error('Failed to track event in LogRocket:', error);
    }
  }

  captureException(error: Error, extra?: any): void {
    if (!this.isInitialized) return;

    try {
      LogRocket.captureException(error, {
        tags: {
          component: extra?.component || 'unknown',
          action: extra?.action || 'unknown',
        },
        extra: {
          ...extra,
          userId: this.getCurrentUserId(),
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
        },
      });
    } catch (logError) {
      console.error('Failed to capture exception in LogRocket:', logError);
    }
  }

  trackPageView(path?: string): void {
    if (!this.isInitialized) return;

    try {
      const currentPath = path || window.location.pathname;
      LogRocket.track('page_view', {
        path: currentPath,
        referrer: document.referrer,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to track page view in LogRocket:', error);
    }
  }

  log(message: string, level: 'info' | 'warn' | 'error' = 'info'): void {
    if (!this.isInitialized) return;

    try {
      LogRocket.track('log_message', {
        message,
        level,
        timestamp: new Date().toISOString(),
        userId: this.getCurrentUserId(),
      });
    } catch (error) {
      console.error('Failed to log message in LogRocket:', error);
    }
  }

  private getCurrentUserId(): string | null {
    try {
      // Try to get user from backend auth service first
      const authToken = localStorage.getItem('authToken');
      if (authToken) {
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        return user.id || null;
      }
      return null;
    } catch {
      return null;
    }
  }
}

export const logRocketService = new LogRocketImpl();
