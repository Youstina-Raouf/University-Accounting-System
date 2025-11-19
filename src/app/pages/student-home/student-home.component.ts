import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentService } from '../../services/student.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FeeStructure, Payment } from '../../services/admin.service';

@Component({
  selector: 'app-student-home',
  templateUrl: './student-home.component.html',
  styleUrls: ['./student-home.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class StudentHomeComponent implements OnInit {
  student: any = null;
  fees: FeeStructure[] = [];
  payments: Payment[] = [];
  totalDue: number = 0;
  totalPaid: number = 0;
  outstandingBalance: number = 0;

  // Payment modal
  showPaymentModal = false;
  selectedFee: FeeStructure | null = null;
  paymentAmount: number = 0;
  paymentMethod: string = 'Online';
  paymentProcessing = false;

  // Refund modal
  showRefundModal = false;
  selectedPayment: Payment | null = null;
  refundReason: string = '';
  refundProcessing = false;

  constructor(
    private studentService: StudentService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadStudentData();
  }

  loadStudentData() {
    this.student = this.studentService.getCurrentStudent();
    this.fees = this.studentService.getStudentFees();
    this.payments = this.studentService.getStudentPayments();
    this.totalDue = this.studentService.getTotalDue();
    this.totalPaid = this.studentService.getTotalPaid();
    this.outstandingBalance = this.studentService.getOutstandingBalance();
  }

  openPaymentModal(fee: FeeStructure) {
    this.selectedFee = fee;
    this.paymentAmount = fee.amount;
    this.paymentMethod = 'Online';
    this.showPaymentModal = true;
  }

  closePaymentModal() {
    this.showPaymentModal = false;
    this.selectedFee = null;
    this.paymentAmount = 0;
  }

  processPayment() {
    if (!this.selectedFee || this.paymentAmount <= 0) {
      alert('Please select a fee and enter a valid amount');
      return;
    }

    this.paymentProcessing = true;
    
    setTimeout(() => {
      const success = this.studentService.makePayment(
        this.paymentAmount,
        this.selectedFee!.id,
        this.paymentMethod
      );

      if (success) {
        alert('Payment processed successfully!');
        this.closePaymentModal();
        this.loadStudentData();
      } else {
        alert('Payment failed. Please try again.');
      }
      this.paymentProcessing = false;
    }, 1000);
  }

  openRefundModal(payment: Payment) {
    this.selectedPayment = payment;
    this.refundReason = '';
    this.showRefundModal = true;
  }

  closeRefundModal() {
    this.showRefundModal = false;
    this.selectedPayment = null;
    this.refundReason = '';
  }

  requestRefund() {
    if (!this.selectedPayment || !this.refundReason.trim()) {
      alert('Please provide a reason for the refund request');
      return;
    }

    this.refundProcessing = true;

    setTimeout(() => {
      const success = this.studentService.requestRefund(
        this.selectedPayment!.id,
        this.selectedPayment!.amount,
        this.refundReason
      );

      if (success) {
        alert('Refund request submitted successfully!');
        this.closeRefundModal();
      } else {
        alert('Refund request failed. Please try again.');
      }
      this.refundProcessing = false;
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
}
