import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { AdminService, FeeStructure, Payment, StudentFee } from './admin.service';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  constructor(
    private authService: AuthService,
    private adminService: AdminService
  ) {}

  getWalletBalance(): number {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return 0;
    return this.adminService.getUserWallet(currentUser.username);
  }

  getCurrentStudent() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return null;

    const allUsers = this.adminService.getUsers();
    return allUsers.find(u => u.username === currentUser.username);
  }

  getStudentFees(): FeeStructure[] {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return [];

    // Get per-student fee assignments; if none exist, auto-assign active fee structures as student-specific fees
    let sFees = this.adminService.getStudentFeesForUser(currentUser.username);

    // Ensure any new active fee templates are assigned to the student.
    // If the student has no assignments, create assignments for all active templates.
    const templates = this.adminService.getFeeStructures().filter(fs => fs.isActive);
    // Build a set of assigned template ids for this student
    const assignedTemplateIds = new Set((sFees || []).map(sf => sf.feeStructureId));
    let createdAny = false;
    templates.forEach(t => {
      if (!assignedTemplateIds.has(t.id)) {
        try {
          this.adminService.createStudentFee({
            userId: currentUser.username,
            feeStructureId: t.id,
            originalAmount: t.amount,
            remainingAmount: t.amount,
            status: 'unpaid'
          });
          createdAny = true;
        } catch (e) {
          // ignore and continue
        }
      }
    });

    if (createdAny || !sFees) {
      sFees = this.adminService.getStudentFeesForUser(currentUser.username);
    }

    // Map StudentFee to a FeeStructure-like object for UI consumption
    return sFees.map((sf: StudentFee) => {
      const tmpl = this.adminService.getFeeStructures().find(f => f.id === sf.feeStructureId);
      return {
        id: sf.id,
        categoryId: tmpl?.categoryId || '',
        categoryName: tmpl?.categoryName || 'Fee',
        academicYear: tmpl?.academicYear || '',
        amount: sf.remainingAmount,
        dueDate: tmpl?.dueDate || new Date().toISOString(),
        isActive: sf.remainingAmount > 0
      } as FeeStructure;
    });
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
    // Outstanding balance is simply the sum of remaining amounts from StudentFee records
    // This is already calculated correctly when payments are made
    const fees = this.adminService.getStudentFeesForUser(this.authService.getCurrentUser()?.username || '');
    return fees.reduce((sum, f) => sum + (f.remainingAmount || 0), 0);
  }

  getTotalDue(): number {
    // Total due is the sum of original amounts from StudentFee records
    const fees = this.adminService.getStudentFeesForUser(this.authService.getCurrentUser()?.username || '');
    return fees.reduce((sum, f) => sum + (f.originalAmount || 0), 0);
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

      // Here feeStructureId is actually the studentFee id (per-student assignment)
      const studentFee = this.adminService.getStudentFeeById(feeStructureId);
      if (!studentFee) {
        console.error('Student fee not found for id', feeStructureId);
        return false;
      }

      // Validate payment amount doesn't exceed remaining amount
      if (amount > studentFee.remainingAmount) {
        console.warn(`Payment amount (${amount}) exceeds remaining amount (${studentFee.remainingAmount})`);
        // Cap payment at remaining amount
        amount = studentFee.remainingAmount;
      }

      if (amount <= 0) {
        console.warn('Payment amount must be greater than 0');
        return false;
      }

      // If using wallet balance, ensure sufficient funds and deduct first
      if (paymentMethod === 'Wallet') {
        const ok = this.adminService.adjustUserWallet(currentUser.username, -amount);
        if (!ok) {
          console.warn('Insufficient wallet balance for', currentUser.username);
          return false;
        }
      }

      const payment: Omit<Payment, 'id'> = {
        userId: currentUser.username,
        username: currentUser.username,
        feeStructureId: studentFee.feeStructureId,
        amount: amount,
        paymentDate: new Date().toISOString(),
        status: 'completed',
        paymentMethod: paymentMethod,
        studentFeeId: studentFee.id
      };

      this.adminService.createPayment(payment);

      // Update studentFee remaining amount / status
      try {
        const remaining = Math.max(0, studentFee.remainingAmount - amount);
        const status: StudentFee['status'] = remaining === 0 ? 'paid' : (remaining < studentFee.originalAmount ? 'partial' : 'unpaid');
        this.adminService.updateStudentFee(studentFee.id, { remainingAmount: remaining, status });
      } catch (e) {
        console.error('Failed to update student fee after payment', e);
        return false;
      }
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

