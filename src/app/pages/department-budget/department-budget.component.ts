import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-department-budget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './department-budget.component.html',
  styleUrls: ['./department-budget.component.css']
})
export class DepartmentBudgetComponent {
  budgets = [
    { dept: 'Computer Science', allocated: 50000, used: 32000 },
    { dept: 'Mathematics', allocated: 30000, used: 15000 }
  ];
}
