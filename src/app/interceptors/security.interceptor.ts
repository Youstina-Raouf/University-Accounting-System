import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable()
export class SecurityInterceptor implements HttpInterceptor {
  private readonly sensitiveEndpoints = ['/api/login', '/api/register'];
  private readonly allowedOrigins = ['http://localhost:4200', 'http://localhost:8000'];

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const secureReq = this.secureRequest(req);
    
    return next.handle(secureReq).pipe(
      catchError(error => {
        this.logSecurityEvent(error, req);
        return throwError(() => error);
      })
    );
  }

  private secureRequest(req: HttpRequest<any>): HttpRequest<any> {
    let secureReq = req.clone();

    secureReq = secureReq.clone({
      setHeaders: {
        'X-Requested-With': 'XMLHttpRequest',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    if (this.isSensitiveEndpoint(req.url)) {
      secureReq = secureReq.clone({
        body: this.sanitizeRequestBody(req.body)
      });
    }

    secureReq = secureReq.clone({
      url: this.validateUrl(req.url)
    });

    return secureReq;
  }

  private sanitizeRequestBody(body: any): any {
    if (!body || typeof body !== 'object') {
      return body;
    }

    const sanitized = { ...body };
    
    if (sanitized.password) {
      sanitized.password = '[REDACTED]';
    }
    
    if (sanitized.token) {
      sanitized.token = '[REDACTED]';
    }
    
    if (sanitized.api_key) {
      sanitized.api_key = '[REDACTED]';
    }

    return sanitized;
  }

  private validateUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      
      if (!this.allowedOrigins.includes(urlObj.origin)) {
        console.warn('Security Warning: Request to non-allowed origin:', urlObj.origin);
      }
      
      return url;
    } catch {
      return url;
    }
  }

  private isSensitiveEndpoint(url: string): boolean {
    return this.sensitiveEndpoints.some(endpoint => 
      url.toLowerCase().includes(endpoint.toLowerCase())
    );
  }

  private logSecurityEvent(error: any, req: HttpRequest<any>): void {
    const securityEvent = {
      timestamp: new Date().toISOString(),
      url: req.url,
      method: req.method,
      status: error.status,
      message: error.message,
      userAgent: navigator.userAgent,
      ip: this.getClientIP()
    };

    console.warn('Security Event:', securityEvent);
    
    if (error.status === 401 || error.status === 403) {
      this.handleAuthError(error, req);
    }
    
    if (error.status >= 500) {
      this.handleServerError(error, req);
    }
  }

  private handleAuthError(error: any, req: HttpRequest<any>): void {
    console.warn('Authentication/Authorization Error:', {
      url: req.url,
      status: error.status,
      message: 'Unauthorized access attempt'
    });
    
    if (error.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      
      if (!req.url.includes('/api/login')) {
        window.location.href = '/login';
      }
    }
  }

  private handleServerError(error: any, req: HttpRequest<any>): void {
    console.error('Server Error:', {
      url: req.url,
      status: error.status,
      message: 'Server-side error occurred'
    });
  }

  private getClientIP(): string {
    return localStorage.getItem('clientIP') || 'unknown';
  }
}
