import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountingService } from '../../services/accounting.service';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { User, FeeStructure, Payment } from '../../services/admin.service';

// Charts
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-accounting-home',
  templateUrl: './accounting-home.component.html',
  styleUrls: ['./accounting-home.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective, RouterModule]
})
export class AccountingHomeComponent implements OnInit {
  activeTab: string = 'students';

  // Students
  students: User[] = [];
  selectedStudent: User | null = null;
  studentPayments: Payment[] = [];
  studentBalance: { totalDue: number; totalPaid: number; outstanding: number } = { totalDue: 0, totalPaid: 0, outstanding: 0 };

  // Payments
  allPayments: Payment[] = [];
  feeStructures: FeeStructure[] = [];

  // Stats
  totalRevenue: number = 0;
  unpaidStudents: any[] = [];

  // Payment Modal
  showPaymentModal = false;
  paymentAmount: number = 0;
  selectedFeeStructure: string = '';
  paymentMethod: string = 'Manual';
  paymentProcessing = false;

  // Chart data (sample)
  public revenueChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false
  };

  public revenueChartData: ChartConfiguration<'line'>['data'] = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue',
        data: [12000, 15000, 14000, 18000, 22000, 20000],
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79,70,229,0.2)',
        fill: true
      }
    ]
  };

  constructor(
    public accountingService: AccountingService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadAllData();
  }

  loadAllData() {
    this.students = this.accountingService.getAllStudents();
    this.allPayments = this.accountingService.getStudentPayments();
    this.feeStructures = this.accountingService.getFeeStructures();
    this.totalRevenue = this.accountingService.getTotalRevenue();
    this.unpaidStudents = this.accountingService.getUnpaidStudents();
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
    this.loadAllData();
  }

  viewStudentDetails(student: User) {
    this.selectedStudent = student;
    this.studentPayments = this.accountingService.getStudentPayments(student.id || student.username);
    this.studentBalance = this.accountingService.getStudentBalance(student.id || student.username);
    this.activeTab = 'student-details';
  }

  viewStudentDetailsByUsername(username: string) {
    const student = this.students.find(s => s.username === username);
    if (student) {
      this.viewStudentDetails(student);
    }
  }

  openPaymentModal(student: User) {
    this.selectedStudent = student;
    this.paymentAmount = 0;
    this.selectedFeeStructure = '';
    this.paymentMethod = 'Manual';
    this.showPaymentModal = true;
  }

  closePaymentModal() {
    this.showPaymentModal = false;
    this.selectedStudent = null;
    this.paymentAmount = 0;
    this.selectedFeeStructure = '';
  }

  processPayment() {
    if (!this.selectedStudent || !this.selectedFeeStructure || this.paymentAmount <= 0) {
      alert('Please fill in all required fields');
      return;
    }

    this.paymentProcessing = true;

    setTimeout(() => {
      const success = this.accountingService.processPayment(
        this.selectedStudent!.id || this.selectedStudent!.username,
        this.paymentAmount,
        this.selectedFeeStructure,
        this.paymentMethod
      );

      if (success) {
        alert('Payment processed successfully!');
        this.closePaymentModal();
        this.loadAllData();
        if (this.selectedStudent) {
          this.viewStudentDetails(this.selectedStudent);
        }
      } else {
        alert('Payment failed. Please try again.');
      }
      this.paymentProcessing = false;
    }, 1000);
  }

  logout() {
    this.authService.logout();
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }

  getStudentOutstanding(student: User): number {
    return this.accountingService.getStudentBalance(student.id || student.username).outstanding;
  }
}
