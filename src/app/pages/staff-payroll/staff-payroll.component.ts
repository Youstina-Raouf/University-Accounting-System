import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-staff-payroll',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './staff-payroll.component.html',
  styleUrls: ['./staff-payroll.component.css']
})
export class StaffPayrollComponent {
  // Simple scaffolded payroll page with mock data
  staff = [
    { id: 's1', name: 'Alice Johnson', role: 'Lecturer', salary: 3500 },
    { id: 's2', name: 'Bob Smith', role: 'Administrator', salary: 2800 }
  ];

  payAll() {
    alert('Mock: payroll processed for ' + this.staff.length + ' staff.');
  }
}
