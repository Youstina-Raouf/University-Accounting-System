import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentService } from '../../services/student.service';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { SoundService } from '../../services/sound.service';
import { FeeStructure, Payment } from '../../services/admin.service';

@Component({
  selector: 'app-student-home',
  templateUrl: './student-home.component.html',
  styleUrls: ['./student-home.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule]
})
export class StudentHomeComponent implements OnInit {
  student: any = null;
  fees: FeeStructure[] = [];
  payments: Payment[] = [];
  invoices: any[] = [];
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
    private router: Router,
    private sound: SoundService
  ) {}

  ngOnInit() {
    this.loadStudentData();
  }

  loadStudentData() {
    this.student = this.studentService.getCurrentStudent();
    const feeSnapshot = this.studentService.getStudentFeeSnapshot();
    this.fees = feeSnapshot.fees;
    this.payments = this.studentService.getStudentPayments();
    this.invoices = this.studentService.getStudentInvoices();
    this.totalDue = feeSnapshot.totalDue;
    this.totalPaid = this.studentService.getTotalPaid();
    this.outstandingBalance = feeSnapshot.outstanding;
  }

  // Create invoice modal
  showCreateInvoiceModal = false;
  newInvoice = { title: '', description: '', amount: 0, dueDate: '' };

  openCreateInvoiceModal() {
    this.newInvoice = { title: '', description: '', amount: 0, dueDate: '' };
    this.showCreateInvoiceModal = true;
  }

  closeCreateInvoiceModal() {
    this.showCreateInvoiceModal = false;
  }

  createInvoice() {
    // client-side validation
    this.invoiceError = '';
    if (!this.newInvoice.title.trim() || this.newInvoice.amount <= 0) {
      this.invoiceError = 'Please provide a title and a valid amount (greater than 0)';
      return;
    }

    const user = this.studentService.getCurrentStudent();
    if (!user) {
      this.invoiceError = 'No logged in student';
      return;
    }

    const created = (this.studentService as any).adminService.createInvoice({
      userId: user.username,
      username: user.username,
      title: this.newInvoice.title,
      description: this.newInvoice.description,
      amount: this.newInvoice.amount,
      dueDate: this.newInvoice.dueDate || undefined,
      status: 'unpaid'
    });

    if (created) {
      this.sound.playSuccess();
      this.invoiceSuccess = 'Invoice created successfully';
      setTimeout(() => this.invoiceSuccess = '', 2500);
      this.closeCreateInvoiceModal();
      this.loadStudentData();
    } else {
      this.invoiceError = 'Failed to create invoice';
      this.sound.playError();
    }
  }

  invoiceError = '';
  invoiceSuccess = '';

  // audio handled by SoundService

  // Mark invoice as paid (creates a completed payment and updates invoice)
  payInvoice(invoice: any) {
    if (!confirm('Mark this invoice as paid?')) return;
    const success = this.studentService.makePayment(invoice.amount, invoice.id, 'Invoice Payment');
    if (success) {
      (this.studentService as any).adminService.updateInvoice(invoice.id, { status: 'paid' });
      this.sound.playSuccess();
      alert('Invoice marked as paid');
      this.loadStudentData();
    } else {
      this.sound.playError();
      alert('Payment failed');
    }
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

  onPaymentMethodChange(newValue: string) {
    // Update paymentMethod with the new value
    this.paymentMethod = newValue;
    
    // If Credit Card is selected, navigate to credit card payment page
    if (newValue === 'Credit Card' && this.selectedFee) {
      // Use the fee amount if payment amount is not set or is 0
      const amount = (this.paymentAmount > 0) ? this.paymentAmount : this.selectedFee.amount;
      
      console.log('Navigating to credit card payment:', { 
        paymentMethod: newValue,
        amount: amount, 
        feeId: this.selectedFee.id,
        selectedFee: this.selectedFee
      });
      
      // Close modal first
      this.showPaymentModal = false;
      
      // Store fee info temporarily before navigation
      const feeId = this.selectedFee.id;
      
      // Navigate to credit card payment page
      setTimeout(() => {
        this.router.navigate(['/credit-card-payment'], {
          queryParams: {
            amount: amount,
            feeId: feeId
          }
        }).then(() => {
          console.log('Navigation completed successfully');
        }).catch(err => {
          console.error('Navigation error:', err);
          alert('Failed to navigate to payment page. Please try again.');
        });
      }, 150);
    }
  }

  processPayment() {
    if (!this.selectedFee || this.paymentAmount <= 0) {
      alert('Please select a fee and enter a valid amount');
      return;
    }

    // If paying from wallet, verify sufficient funds before attempting payment
    if (this.paymentMethod === 'Wallet') {
      const balance = this.studentService.getWalletBalance();
      if (balance < this.paymentAmount) {
        this.sound.playError();
        alert(`Insufficient wallet balance. Your wallet balance is ${this.formatCurrency(balance)}. Please top up or choose another payment method.`);
        return;
      }
    }

    this.paymentProcessing = true;

    setTimeout(() => {
      const success = this.studentService.makePayment(
        this.paymentAmount,
        this.selectedFee!.id,
        this.paymentMethod
      );

      if (success) {
        this.sound.playSuccess();
        alert('Payment processed successfully!');
        this.closePaymentModal();
        this.loadStudentData();
      } else {
        this.sound.playError();
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
