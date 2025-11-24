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

  /**
   * Ensure the current student has StudentFee assignments for every active template
   * and return the up-to-date StudentFee records from storage.
   */
  private getStudentFeeAssignments() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return [];

    let studentFees = this.adminService.getStudentFeesForUser(currentUser.username);

    // Auto-assign any active fee templates the student does not yet have
    const templates = this.adminService.getFeeStructures().filter(fs => fs.isActive);
    const assignedTemplateIds = new Set(studentFees.map(sf => sf.feeStructureId));
    let createdAny = false;

    templates.forEach(template => {
      if (!assignedTemplateIds.has(template.id)) {
        this.adminService.createStudentFee({
          userId: currentUser.username,
          feeStructureId: template.id,
          originalAmount: template.amount,
          remainingAmount: template.amount,
          status: 'unpaid'
        });
        createdAny = true;
      }
    });

    if (createdAny) {
      studentFees = this.adminService.getStudentFeesForUser(currentUser.username);
    }

    return studentFees;
  }

  /**
   * Build a snapshot of student fees with computed summary values so the UI can
   * render consistent totals/outstanding balances.
   */
  getStudentFeeSnapshot() {
    const studentFees = this.getStudentFeeAssignments();

    const outstanding = studentFees.reduce((sum, sf) => sum + (sf.remainingAmount || 0), 0);
    const totalAssigned = studentFees.reduce((sum, sf) => sum + (sf.originalAmount || 0), 0);

    const feeViews: FeeStructure[] = studentFees.map((sf: StudentFee) => {
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

    return {
      fees: feeViews,
      outstanding,
      totalAssigned,
      totalDue: outstanding // total remaining due after payments
    };
  }

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
    return this.getStudentFeeSnapshot().fees;
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
    return this.getStudentFeeSnapshot().outstanding;
  }

  getTotalDue(): number {
    // Total due should reflect the remaining balance the student still owes
    return this.getStudentFeeSnapshot().totalDue;
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

