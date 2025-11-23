import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
// Charts
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-department-budget',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './department-budget.component.html',
  styleUrls: ['./department-budget.component.css']
})
export class DepartmentBudgetComponent {
  budgets = [
    { dept: 'Computer Science', allocated: 50000, used: 32000 },
    { dept: 'Mathematics', allocated: 30000, used: 15000 }
  ];

  public barChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false
  };

  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: this.budgets.map(b => b.dept),
    datasets: [
      { label: 'Allocated', data: this.budgets.map(b => b.allocated), backgroundColor: '#3b82f6' },
      { label: 'Used', data: this.budgets.map(b => b.used), backgroundColor: '#10b981' }
    ]
  };
}
