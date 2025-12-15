import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { PerformanceInterceptor } from './interceptors/performance.interceptor';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { PerformanceMonitoringService } from './services/performance-monitoring.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: PerformanceInterceptor,
      multi: true
    },
    PerformanceMonitoringService
  ]
};
