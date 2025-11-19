import { Injectable } from '@angular/core';
import { AdminService, Payment, FeeStructure, User } from './admin.service';

@Injectable({
  providedIn: 'root'
})
export class AccountingService {
  constructor(private adminService: AdminService) {}

  getAllStudents(): User[] {
    return this.adminService.getUsers().filter(u => u.role === 'student' && u.isActive);
  }

  getStudentPayments(studentId?: string): Payment[] {
    const allPayments = this.adminService.getPayments();
    if (studentId) {
      return allPayments.filter(p => p.userId === studentId || p.username === studentId);
    }
    return allPayments;
  }

  getFeeStructures(): FeeStructure[] {
    return this.adminService.getFeeStructures();
  }

  getTotalRevenue(): number {
    return this.adminService.getTotalRevenue();
  }

  getUnpaidStudents(): any[] {
    return this.adminService.getUnpaidStudents();
  }

  processPayment(studentId: string, amount: number, feeStructureId: string, paymentMethod: string = 'Manual'): boolean {
    try {
      const student = this.adminService.getUsers().find(u => u.id === studentId || u.username === studentId);
      if (!student) return false;

      const payment: Omit<Payment, 'id'> = {
        userId: student.id || student.username,
        username: student.username,
        feeStructureId: feeStructureId,
        amount: amount,
        paymentDate: new Date().toISOString(),
        status: 'completed',
        paymentMethod: paymentMethod
      };

      this.adminService.createPayment(payment);
      return true;
    } catch (error) {
      console.error('Payment processing error:', error);
      return false;
    }
  }

  getStudentBalance(studentId: string): { totalDue: number; totalPaid: number; outstanding: number } {
    const fees = this.getFeeStructures().filter(fs => fs.isActive);
    const payments = this.getStudentPayments(studentId);

    const totalDue = fees.reduce((sum, fee) => sum + fee.amount, 0);
    const totalPaid = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
    const outstanding = Math.max(0, totalDue - totalPaid);

    return { totalDue, totalPaid, outstanding };
  }
}

