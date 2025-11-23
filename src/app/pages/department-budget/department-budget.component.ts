import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
// Charts
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-department-budget',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, RouterModule],
  templateUrl: './department-budget.component.html',
  styleUrls: ['./department-budget.component.css']
})
export class DepartmentBudgetComponent {
  constructor(public authService: AuthService) {}

  budgets = [
    { dept: 'Computer Science', allocated: 50000, used: 32000 },
    { dept: 'Mathematics', allocated: 30000, used: 15000 },
    { dept: 'Physics', allocated: 40000, used: 28000 },
    { dept: 'Chemistry', allocated: 35000, used: 22000 },
    { dept: 'Biology', allocated: 45000, used: 30000 },
    { dept: 'Engineering', allocated: 60000, used: 45000 }
  ];

  get totalAllocated(): number {
    return this.budgets.reduce((sum, b) => sum + b.allocated, 0);
  }

  get totalUsed(): number {
    return this.budgets.reduce((sum, b) => sum + b.used, 0);
  }

  get totalRemaining(): number {
    return this.totalAllocated - this.totalUsed;
  }

  getRemaining(budget: any): number {
    return budget.allocated - budget.used;
  }

  getUsagePercent(budget: any): number {
    if (budget.allocated === 0) return 0;
    return (budget.used / budget.allocated) * 100;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  logout() {
    this.authService.logout();
  }

  public barChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return `${context.dataset.label}: ${this.formatCurrency(context.parsed.y as number)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => {
            return this.formatCurrency(value as number);
          }
        }
      }
    }
  };

  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: this.budgets.map(b => b.dept),
    datasets: [
      {
        label: 'Allocated',
        data: this.budgets.map(b => b.allocated),
        backgroundColor: '#8B2B2B',
        borderRadius: 8
      },
      {
        label: 'Used',
        data: this.budgets.map(b => b.used),
        backgroundColor: '#3f7040',
        borderRadius: 8
      }
    ]
  };
}
