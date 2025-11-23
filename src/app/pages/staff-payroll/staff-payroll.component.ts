import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-staff-payroll',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './staff-payroll.component.html',
  styleUrls: ['./staff-payroll.component.css']
})
export class StaffPayrollComponent {
  // Simple scaffolded payroll page with mock data
  staff: Array<any> = [
    { id: 's1', name: 'Alice Johnson', role: 'Lecturer', salary: 3500, allowances: 0, deductions: 0 },
    { id: 's2', name: 'Bob Smith', role: 'Administrator', salary: 2800, allowances: 0, deductions: 0 }
  ];

  payAll() {
    alert('Mock: payroll processed for ' + this.staff.length + ' staff.');
  }

  netPay(s: any) {
    return (s.salary || 0) + (s.allowances || 0) - (s.deductions || 0);
  }

  generateMonthlyReport() {
    const report = this.staff.map(s => ({
      id: s.id,
      name: s.name,
      role: s.role,
      salary: s.salary,
      allowances: s.allowances || 0,
      deductions: s.deductions || 0,
      net: this.netPay(s)
    }));

    const json = JSON.stringify({ generatedAt: new Date().toISOString(), data: report }, null, 2);
    try {
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payroll-report-${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Export failed', e);
      alert('Failed to generate report');
    }
  }
}
