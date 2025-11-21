import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { AdminService, FeeStructure, Payment } from './admin.service';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  constructor(
    private authService: AuthService,
    private adminService: AdminService
  ) {}

  getCurrentStudent() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return null;

    const allUsers = this.adminService.getUsers();
    return allUsers.find(u => u.username === currentUser.username);
  }

  getStudentFees(): FeeStructure[] {
    return this.adminService.getFeeStructures().filter(fs => fs.isActive);
  }

  getStudentPayments(): Payment[] {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return [];

    const allPayments = this.adminService.getPayments();
    return allPayments.filter(p => p.userId === currentUser.username || p.username === currentUser.username);
  }

  getStudentInvoices() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return [];
    const allInvoices = this.adminService.getInvoices ? this.adminService.getInvoices() : [];
    return allInvoices.filter((inv: any) => inv.userId === currentUser.username || inv.username === currentUser.username);
  }

  getOutstandingBalance(): number {
    const fees = this.getStudentFees();
    const payments = this.getStudentPayments();
    
    const totalDue = fees.reduce((sum, fee) => sum + fee.amount, 0);
    const totalPaid = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
    
    return Math.max(0, totalDue - totalPaid);
  }

  getTotalDue(): number {
    const fees = this.getStudentFees();
    return fees.reduce((sum, fee) => sum + fee.amount, 0);
  }

  getTotalPaid(): number {
    const payments = this.getStudentPayments();
    return payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
  }

  makePayment(amount: number, feeStructureId: string, paymentMethod: string = 'Online'): boolean {
    try {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) return false;

      const payment: Omit<Payment, 'id'> = {
        userId: currentUser.username,
        username: currentUser.username,
        feeStructureId: feeStructureId,
        amount: amount,
        paymentDate: new Date().toISOString(),
        status: 'completed',
        paymentMethod: paymentMethod
      };

      this.adminService.createPayment(payment);
      return true;
    } catch (error) {
      console.error('Payment error:', error);
      return false;
    }
  }

  requestRefund(paymentId: string, amount: number, reason: string): boolean {
    try {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) return false;

      this.adminService.createRefundRequest({
        userId: currentUser.username,
        username: currentUser.username,
        paymentId: paymentId,
        amount: amount,
        reason: reason
      });

      return true;
    } catch (error) {
      console.error('Refund request error:', error);
      return false;
    }
  }
}

