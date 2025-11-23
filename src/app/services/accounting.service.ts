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

      // Find or create StudentFee for this student and fee structure
      let studentFee = this.adminService.getStudentFeesForUser(student.username)
        .find(sf => sf.feeStructureId === feeStructureId);

      if (!studentFee) {
        // Create StudentFee if it doesn't exist
        const feeStructure = this.adminService.getFeeStructures().find(fs => fs.id === feeStructureId);
        if (!feeStructure) {
          console.error('Fee structure not found:', feeStructureId);
          return false;
        }
        studentFee = this.adminService.createStudentFee({
          userId: student.username,
          feeStructureId: feeStructureId,
          originalAmount: feeStructure.amount,
          remainingAmount: feeStructure.amount,
          status: 'unpaid'
        });
      }

      // Validate payment amount doesn't exceed remaining amount
      if (amount > studentFee.remainingAmount) {
        console.warn(`Payment amount (${amount}) exceeds remaining amount (${studentFee.remainingAmount})`);
        // Allow it but cap it at remaining amount
        amount = studentFee.remainingAmount;
      }

      if (amount <= 0) {
        console.warn('Payment amount must be greater than 0');
        return false;
      }

      // Create payment linked to StudentFee
      const payment: Omit<Payment, 'id'> = {
        userId: student.id || student.username,
        username: student.username,
        feeStructureId: feeStructureId,
        amount: amount,
        paymentDate: new Date().toISOString(),
        status: 'completed',
        paymentMethod: paymentMethod,
        studentFeeId: studentFee.id
      };

      this.adminService.createPayment(payment);

      // Update StudentFee remaining amount and status
      const remaining = Math.max(0, studentFee.remainingAmount - amount);
      const status: 'unpaid' | 'partial' | 'paid' = remaining === 0 ? 'paid' : (remaining < studentFee.originalAmount ? 'partial' : 'unpaid');
      this.adminService.updateStudentFee(studentFee.id, { remainingAmount: remaining, status });

      return true;
    } catch (error) {
      console.error('Payment processing error:', error);
      return false;
    }
  }

  getStudentBalance(studentId: string): { totalDue: number; totalPaid: number; outstanding: number } {
    // Get student by id or username
    const student = this.adminService.getUsers().find(u => u.id === studentId || u.username === studentId);
    if (!student) {
      return { totalDue: 0, totalPaid: 0, outstanding: 0 };
    }

    // Use StudentFee records (per-student assignments) instead of templates
    const studentFees = this.adminService.getStudentFeesForUser(student.username);
    const payments = this.getStudentPayments(studentId);

    // Total due is the sum of original amounts from StudentFee records
    const totalDue = studentFees.reduce((sum, sf) => sum + sf.originalAmount, 0);

    // Total paid is sum of completed payments
    const totalPaid = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);

    // Outstanding is the sum of remaining amounts from StudentFee records
    const outstanding = studentFees.reduce((sum, sf) => sum + sf.remainingAmount, 0);

    return { totalDue, totalPaid, outstanding };
  }
}

