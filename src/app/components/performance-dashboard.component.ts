import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { logRocketService } from '../services/logrocket.service';
import { PerformanceMonitoringService } from '../services/performance-monitoring.service';

@Component({
  selector: 'app-performance-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="performance-dashboard">
      <h3>Performance Metrics</h3>
      <div class="metrics-grid">
        <div class="metric-card">
          <h4>Page Load Time</h4>
          <p>{{ metrics.pageLoadTime?.toFixed(2) || 'N/A' }}ms</p>
          <div class="status" [class.good]="isGoodLoadTime()" [class.poor]="isPoorLoadTime()">
            {{ getLoadTimeStatus() }}
          </div>
        </div>
        
        <div class="metric-card">
          <h4>Memory Usage</h4>
          <p>{{ metrics.currentMemoryUsage?.toFixed(2) || 'N/A' }}MB</p>
          <div class="status" [class.good]="isGoodMemoryUsage()" [class.poor]="isPoorMemoryUsage()">
            {{ getMemoryStatus() }}
          </div>
        </div>
        
        <div class="metric-card">
          <h4>Total Errors</h4>
          <p>{{ metrics.totalErrors || 0 }}</p>
          <div class="status" [class.good]="metrics.totalErrors === 0" [class.poor]="metrics.totalErrors > 5">
            {{ getErrorStatus() }}
          </div>
        </div>
        
        <div class="metric-card">
          <h4>User Interactions</h4>
          <p>{{ metrics.totalInteractions || 0 }}</p>
          <div class="status good">Active</div>
        </div>
      </div>
      
      <div class="api-performance">
        <h4>API Response Times</h4>
        <div class="api-list">
          <div *ngFor="let api of getApiMetrics()" class="api-item">
            <span class="api-endpoint">{{ api.endpoint }}</span>
            <span class="api-time" [class.slow]="api.avgTime > 2000">
              {{ api.avgTime.toFixed(2) || 'N/A' }}ms
            </span>
            <span class="api-status" [class.slow]="api.avgTime > 2000">
              {{ api.avgTime > 2000 ? 'Slow' : 'Good' }}
            </span>
          </div>
        </div>
      </div>
      
      <div class="actions">
        <button (click)="refreshMetrics()">Refresh Metrics</button>
        <button (click)="exportMetrics()">Export Data</button>
        <button (click)="testPerformance()">Run Performance Test</button>
      </div>
    </div>
  `,
  styles: [`
    .performance-dashboard {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .metric-card {
      background: #f5f5f5;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #007bff;
    }
    
    .metric-card h4 {
      margin: 0 0 10px 0;
      color: #333;
    }
    
    .metric-card p {
      font-size: 24px;
      font-weight: bold;
      margin: 10px 0;
    }
    
    .status {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
    }
    
    .status.good {
      background: #d4edda;
      color: #155724;
    }
    
    .status.poor {
      background: #f8d7da;
      color: #721c24;
    }
    
    .api-performance {
      background: #f5f5f5;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    
    .api-list {
      margin-top: 15px;
    }
    
    .api-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px;
      border-bottom: 1px solid #ddd;
    }
    
    .api-item:last-child {
      border-bottom: none;
    }
    
    .api-endpoint {
      flex: 1;
      font-family: monospace;
      font-size: 12px;
    }
    
    .api-time {
      margin: 0 15px;
      font-weight: bold;
    }
    
    .api-time.slow, .api-status.slow {
      color: #dc3545;
    }
    
    .actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
    
    .actions button {
      padding: 10px 20px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .actions button:hover {
      background: #0056b3;
    }
  `]
})
export class PerformanceDashboardComponent implements OnInit {
  metrics: any = {};

  constructor(private performanceService: PerformanceMonitoringService) {}

  ngOnInit() {
    this.refreshMetrics();
  }

  refreshMetrics() {
    this.metrics = this.performanceService.getMetricsSummary();
  }

  exportMetrics() {
    const data = JSON.stringify(this.metrics, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-metrics-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    logRocketService.track('metrics_exported', { timestamp: new Date().toISOString() });
  }

  testPerformance() {
    const startTime = performance.now();
    
    for (let i = 0; i < 1000; i++) {
      document.createElement('div');
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    logRocketService.track('performance_test', {
      testType: 'dom_creation',
      duration,
      iterations: 1000
    });
    
    alert(`Performance test completed in ${duration.toFixed(2)}ms`);
  }

  isGoodLoadTime(): boolean {
    return this.metrics.pageLoadTime < 2000;
  }

  isPoorLoadTime(): boolean {
    return this.metrics.pageLoadTime > 3000;
  }

  getLoadTimeStatus(): string {
    if (this.isGoodLoadTime()) return 'Good';
    if (this.isPoorLoadTime()) return 'Poor';
    return 'Fair';
  }

  isGoodMemoryUsage(): boolean {
    return this.metrics.currentMemoryUsage < 50;
  }

  isPoorMemoryUsage(): boolean {
    return this.metrics.currentMemoryUsage > 100;
  }

  getMemoryStatus(): string {
    if (this.isGoodMemoryUsage()) return 'Good';
    if (this.isPoorMemoryUsage()) return 'Poor';
    return 'Fair';
  }

  getErrorStatus(): string {
    if (this.metrics.totalErrors === 0) return 'None';
    if (this.metrics.totalErrors > 5) return 'Many';
    return 'Some';
  }

  getApiMetrics() {
    const apiMetrics = this.metrics.averageApiResponseTimes || {};
    return Object.entries(apiMetrics).map(([endpoint, avgTime]) => ({
      endpoint,
      avgTime: avgTime as number
    }));
  }
}
