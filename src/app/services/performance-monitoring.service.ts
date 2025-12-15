import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { LogRocketImpl } from './logrocket.service';

@Injectable({
  providedIn: 'root'
})
export class PerformanceMonitoringService {
  private metrics = {
    pageLoadTime: 0,
    apiResponseTimes: new Map<string, number[]>(),
    errorCount: 0,
    userInteractions: 0,
    memoryUsage: 0,
    renderTime: 0
  };

  private startTime = 0;

  constructor(
    private router: Router,
    private logRocket: LogRocketImpl
  ) {
    this.initializeMetrics();
  }

  private initializeMetrics(): void {
    this.startTime = performance.now();
    
    window.addEventListener('load', () => {
      this.metrics.pageLoadTime = performance.now() - this.startTime;
      this.trackPageLoadPerformance();
    });

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.trackPageView(event.urlAfterRedirects);
      }
    });

    this.startMemoryMonitoring();
    this.startRenderTimeMonitoring();
  }

  private trackPageLoadPerformance(): void {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    const performanceData = {
      pageLoadTime: this.metrics.pageLoadTime,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      firstPaint: this.getFirstPaint(),
      firstContentfulPaint: this.getFirstContentfulPaint(),
      resourceLoadTime: this.getResourceLoadTime(),
      memoryUsage: this.getMemoryUsage()
    };

    this.logRocket.track('page_performance', performanceData);
    
    if (this.metrics.pageLoadTime > 3000) {
      this.logRocket.log('Slow page load detected', 'warn');
    }
  }

  trackApiCall(url: string, method: string, startTime: number): void {
    const endTime = performance.now();
    const duration = endTime - startTime;
    const key = `${method} ${url}`;
    
    if (!this.metrics.apiResponseTimes.has(key)) {
      this.metrics.apiResponseTimes.set(key, []);
    }
    this.metrics.apiResponseTimes.get(key)!.push(duration);

    this.logRocket.track('api_call', {
      url,
      method,
      duration,
      isSlow: duration > 2000
    });

    if (duration > 2000) {
      this.logRocket.log(`Slow API response: ${key} took ${duration.toFixed(2)}ms`, 'warn');
    }
  }

  trackUserInteraction(action: string, element?: string): void {
    this.metrics.userInteractions++;
    
    this.logRocket.track('user_interaction', {
      action,
      element,
      totalInteractions: this.metrics.userInteractions,
      timestamp: new Date().toISOString()
    });
  }

  trackError(error: Error, context?: string): void {
    this.metrics.errorCount++;
    
    this.logRocket.captureException(error, {
      component: context || 'unknown',
      totalErrors: this.metrics.errorCount,
      userAgent: navigator.userAgent,
      url: window.location.href
    });
  }

  trackFormSubmission(formName: string, success: boolean, duration?: number): void {
    this.logRocket.track('form_submission', {
      formName,
      success,
      duration,
      timestamp: new Date().toISOString()
    });
  }

  trackFinancialOperation(operation: string, amount?: number, accountType?: string): void {
    this.logRocket.track('financial_operation', {
      operation,
      amount,
      accountType,
      timestamp: new Date().toISOString()
    });
  }

  private trackPageView(url: string): void {
    this.metrics.renderTime = performance.now();
    
    this.logRocket.trackPageView(url);
    
    setTimeout(() => {
      const renderDuration = performance.now() - this.metrics.renderTime;
      this.logRocket.track('page_render', {
        url,
        renderTime: renderDuration,
        isSlowRender: renderDuration > 1000
      });
    }, 100);
  }

  private startMemoryMonitoring(): void {
    setInterval(() => {
      this.metrics.memoryUsage = this.getMemoryUsage();
      
      if (this.metrics.memoryUsage > 50) {
        this.logRocket.log(`High memory usage: ${this.metrics.memoryUsage.toFixed(2)}MB`, 'warn');
      }
    }, 30000);
  }

  private startRenderTimeMonitoring(): void {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'measure') {
          this.logRocket.track('performance_measure', {
            name: entry.name,
            duration: entry.duration,
            startTime: entry.startTime
          });
        }
      }
    });
    
    observer.observe({ entryTypes: ['measure'] });
  }

  private getFirstPaint(): number | null {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint ? firstPaint.startTime : null;
  }

  private getFirstContentfulPaint(): number | null {
    const paintEntries = performance.getEntriesByType('paint');
    const firstContentfulPaint = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return firstContentfulPaint ? firstContentfulPaint.startTime : null;
  }

 private getResourceLoadTime(): number {
    const resources = performance.getEntriesByType('resource');
    return resources.reduce((total, resource) => total + resource.duration, 0);
  }

  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024;
    }
    return 0;
  }

  getMetricsSummary(): any {
    const avgApiTimes = new Map<string, number>();
    this.metrics.apiResponseTimes.forEach((times, key) => {
      const avg = times.reduce((a, b) => a + b, 0) / times.length;
      avgApiTimes.set(key, avg);
    });

    return {
      pageLoadTime: this.metrics.pageLoadTime,
      averageApiResponseTimes: Object.fromEntries(avgApiTimes),
      totalErrors: this.metrics.errorCount,
      totalInteractions: this.metrics.userInteractions,
      currentMemoryUsage: this.metrics.memoryUsage,
      slowApis: Array.from(avgApiTimes.entries()).filter(([_, time]) => time > 2000)
    };
  }
}
