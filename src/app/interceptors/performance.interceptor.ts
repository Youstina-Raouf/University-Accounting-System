import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { PerformanceMonitoringService } from '../services/performance-monitoring.service';

@Injectable()
export class PerformanceInterceptor implements HttpInterceptor {
  constructor(private performanceService: PerformanceMonitoringService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const startTime = performance.now();
    
    return next.handle(req).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          this.performanceService.trackApiCall(req.url, req.method, startTime);
        }
      }),
      catchError((error: HttpErrorResponse) => {
        this.performanceService.trackApiCall(req.url, req.method, startTime);
        this.performanceService.trackError(new Error(`API Error: ${error.status} ${error.message}`), 'HTTP_INTERCEPTOR');
        throw error;
      })
    );
  }
}
