import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-staff-payroll',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './staff-payroll.component.html',
  styleUrls: ['./staff-payroll.component.css']
})
export class StaffPayrollComponent {
  constructor(public authService: AuthService) {}

  // Simple scaffolded payroll page with mock data
  staff: Array<any> = [
    { id: 's1', name: 'Alice Johnson', role: 'Lecturer', salary: 3500, allowances: 0, deductions: 0 },
    { id: 's2', name: 'Bob Smith', role: 'Administrator', salary: 2800, allowances: 0, deductions: 0 },
    { id: 's3', name: 'Carol Williams', role: 'Professor', salary: 4500, allowances: 0, deductions: 0 },
    { id: 's4', name: 'David Brown', role: 'Assistant Professor', salary: 3200, allowances: 0, deductions: 0 },
    { id: 's5', name: 'Emma Davis', role: 'Administrator', salary: 2600, allowances: 0, deductions: 0 }
  ];

  get totalSalary(): number {
    return this.staff.reduce((sum, s) => sum + (s.salary || 0), 0);
  }

  get totalAllowances(): number {
    return this.staff.reduce((sum, s) => sum + (s.allowances || 0), 0);
  }

  get totalDeductions(): number {
    return this.staff.reduce((sum, s) => sum + (s.deductions || 0), 0);
  }

  get totalNetPay(): number {
    return this.staff.reduce((sum, s) => sum + this.netPay(s), 0);
  }

  netPay(s: any): number {
    return (s.salary || 0) + (s.allowances || 0) - (s.deductions || 0);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  payAll() {
    const totalStaff = this.staff.length;
    const totalAmount = this.totalNetPay;
    alert(`Payroll processed successfully!\n\nStaff Count: ${totalStaff}\nTotal Net Pay: ${this.formatCurrency(totalAmount)}`);
  }

  resetAll() {
    if (confirm('Are you sure you want to reset all allowances and deductions?')) {
      this.staff.forEach(s => {
        s.allowances = 0;
        s.deductions = 0;
      });
    }
  }

  generateMonthlyReport() {
    const report = {
      generatedAt: new Date().toISOString(),
      month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
      summary: {
        totalStaff: this.staff.length,
        totalSalary: this.totalSalary,
        totalAllowances: this.totalAllowances,
        totalDeductions: this.totalDeductions,
        totalNetPay: this.totalNetPay
      },
      data: this.staff.map(s => ({
        id: s.id,
        name: s.name,
        role: s.role,
        salary: s.salary,
        allowances: s.allowances || 0,
        deductions: s.deductions || 0,
        net: this.netPay(s)
      }))
    };

    const json = JSON.stringify(report, null, 2);
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

  logout() {
    this.authService.logout();
  }
}
