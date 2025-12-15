import { Injectable } from '@angular/core';
import { logRocketService } from '../services/logrocket.service';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlingService {
  
  handleError(error: Error, context?: string): void {
    console.error('Application Error:', error);
    
    logRocketService.captureException(error, {
      component: context || 'unknown',
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      stack: error.stack
    });

    this.showUserFeedback(error.message);
  }

  handleHttpError(error: any, context?: string): void {
    const errorMessage = this.getHttpErrorMessage(error);
    
    logRocketService.captureException(new Error(errorMessage), {
      component: context || 'http_client',
      status: error.status,
      statusText: error.statusText,
      url: error.url,
      timestamp: new Date().toISOString()
    });

    this.showUserFeedback(errorMessage);
  }

  private getHttpErrorMessage(error: any): string {
    if (error.status === 0) {
      return 'Network error. Please check your internet connection.';
    }
    
    switch (error.status) {
      case 400:
        return 'Bad request. Please check your input and try again.';
      case 401:
        return 'Unauthorized. Please log in again.';
      case 403:
        return 'Access denied. You do not have permission to perform this action.';
      case 404:
        return 'Resource not found.';
      case 422:
        return 'Validation error. Please check your input.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return `An error occurred (${error.status}): ${error.statusText || 'Unknown error'}`;
    }
  }

  private showUserFeedback(message: string): void {
    const feedbackElement = document.createElement('div');
    feedbackElement.className = 'error-feedback';
    feedbackElement.textContent = message;
    feedbackElement.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #f8d7da;
      color: #721c24;
      padding: 15px;
      border-radius: 5px;
      border: 1px solid #f5c6cb;
      z-index: 9999;
      max-width: 300px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    `;
    
    document.body.appendChild(feedbackElement);
    
    setTimeout(() => {
      feedbackElement.remove();
    }, 5000);
  }

  showSuccessFeedback(message: string): void {
    const feedbackElement = document.createElement('div');
    feedbackElement.className = 'success-feedback';
    feedbackElement.textContent = message;
    feedbackElement.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #d4edda;
      color: #155724;
      padding: 15px;
      border-radius: 5px;
      border: 1px solid #c3e6cb;
      z-index: 9999;
      max-width: 300px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    `;
    
    document.body.appendChild(feedbackElement);
    
    setTimeout(() => {
      feedbackElement.remove();
    }, 3000);
  }
}
