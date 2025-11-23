import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, User, FeeCategory, FeeStructure, PaymentPolicy, RefundRequest } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule]
})
export class AdminHomeComponent implements OnInit {
  activeTab: string = 'dashboard';

  // User Management
  users: User[] = [];
  editingUser: User | null = null;
  newUser = {
    username: '',
    password: '',
    role: 'student' as 'admin' | 'accounting' | 'student',
    firstname: '',
    lastname: '',
    email: '',
    isActive: true
  };

  // Fee Category Management
  feeCategories: FeeCategory[] = [];
  editingCategory: FeeCategory | null = null;
  newCategory = {
    name: '',
    description: '',
    amount: 0,
    isActive: true
  };

  // Fee Structure Management
  feeStructures: FeeStructure[] = [];
  editingStructure: FeeStructure | null = null;
  newStructure = {
    categoryId: '',
    academicYear: '',
    amount: 0,
    dueDate: '',
    isActive: true
  };

  // Payment Policy Management
  paymentPolicies: PaymentPolicy[] = [];
  editingPolicy: PaymentPolicy | null = null;
  newPolicy = {
    policyType: 'deadline' as 'deadline' | 'penalty' | 'installment' | 'refund',
    name: '',
    description: '',
    value: 0,
    isActive: true
  };

  // Refund Requests
  refundRequests: RefundRequest[] = [];

  // Dashboard Data
  totalRevenue: number = 0;
  unpaidStudents: any[] = [];
  paymentHistory: any[] = [];

  // Student Fee Management
  showFeeModal = false;
  selectedStudentForFee: User | null = null;
  newStudentFee = {
    feeStructureId: '',
    amount: 0,
    description: ''
  };

  // Wallet Management
  showWalletModal = false;
  selectedStudentForWallet: User | null = null;
  walletTopUpAmount: number = 0;

  constructor(
    private adminService: AdminService,
    public authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadAllData();
  }

  loadAllData() {
    // Create new array references to force Angular change detection
    this.users = [...this.adminService.getUsers()];
    this.feeCategories = [...this.adminService.getFeeCategories()];
    this.feeStructures = [...this.adminService.getFeeStructures()];
    this.paymentPolicies = [...this.adminService.getPaymentPolicies()];
    this.refundRequests = [...this.adminService.getRefundRequests()];
    this.totalRevenue = this.adminService.getTotalRevenue();
    this.unpaidStudents = [...this.adminService.getUnpaidStudents()];
    this.paymentHistory = [...this.adminService.getPaymentHistory()];
    // Force change detection to update the view
    this.cdr.detectChanges();
  }

  // Tab Navigation
  setActiveTab(tab: string) {
    this.activeTab = tab;
    this.loadAllData();
  }

  // User Management Methods
  createUser() {
    if (!this.newUser.username || !this.newUser.password || !this.newUser.email) {
      alert('Please fill in all required fields (Username, Password, and Email are required)');
      return;
    }
    if (this.newUser.password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    // Check if username already exists
    const existingUsers = this.adminService.getUsers();
    if (existingUsers.some(u => u.username.toLowerCase() === this.newUser.username.toLowerCase())) {
      alert('Username already exists');
      return;
    }
    this.adminService.createUser(this.newUser);
    this.newUser = {
      username: '',
      password: '',
      role: 'student',
      firstname: '',
      lastname: '',
      email: '',
      isActive: true
    };
    this.loadAllData();
  }

  editUser(user: User) {
    this.editingUser = { ...user };
  }

  updateUser() {
    if (this.editingUser) {
      this.adminService.updateUser(this.editingUser.id, this.editingUser);
      this.editingUser = null;
      this.loadAllData();
    }
  }

  cancelEditUser() {
    this.editingUser = null;
  }

  deleteUser(id: string) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.adminService.deleteUser(id);
      this.loadAllData();
    }
  }

  toggleUserStatus(user: User) {
    this.adminService.updateUser(user.id, { isActive: !user.isActive });
    this.loadAllData();
  }

  // Fee Category Methods
  createFeeCategory() {
    if (!this.newCategory.name || this.newCategory.amount <= 0) {
      alert('Please fill in all required fields');
      return;
    }
    this.adminService.createFeeCategory(this.newCategory);
    this.newCategory = { name: '', description: '', amount: 0, isActive: true };
    this.loadAllData();
  }

  editFeeCategory(category: FeeCategory) {
    this.editingCategory = { ...category };
  }

  updateFeeCategory() {
    if (this.editingCategory) {
      this.adminService.updateFeeCategory(this.editingCategory.id, this.editingCategory);
      this.editingCategory = null;
      this.loadAllData();
    }
  }

  cancelEditCategory() {
    this.editingCategory = null;
  }

  deleteFeeCategory(id: string) {
    if (confirm('Are you sure you want to delete this fee category?')) {
      this.adminService.deleteFeeCategory(id);
      this.loadAllData();
    }
  }

  // Fee Structure Methods
  createFeeStructure() {
    if (!this.newStructure.categoryId || !this.newStructure.academicYear || this.newStructure.amount <= 0) {
      alert('Please fill in all required fields');
      return;
    }
    this.adminService.createFeeStructure(this.newStructure);
    this.newStructure = { categoryId: '', academicYear: '', amount: 0, dueDate: '', isActive: true };
    this.loadAllData();
  }

  editFeeStructure(structure: FeeStructure) {
    this.editingStructure = { ...structure };
  }

  updateFeeStructure() {
    if (this.editingStructure) {
      this.adminService.updateFeeStructure(this.editingStructure.id, this.editingStructure);
      this.editingStructure = null;
      this.loadAllData();
    }
  }

  cancelEditStructure() {
    this.editingStructure = null;
  }

  deleteFeeStructure(id: string) {
    if (confirm('Are you sure you want to delete this fee structure?')) {
      this.adminService.deleteFeeStructure(id);
      this.loadAllData();
    }
  }

  // Payment Policy Methods
  createPaymentPolicy() {
    if (!this.newPolicy.name || this.newPolicy.value <= 0) {
      alert('Please fill in all required fields');
      return;
    }
    this.adminService.createPaymentPolicy(this.newPolicy);
    this.newPolicy = { policyType: 'deadline', name: '', description: '', value: 0, isActive: true };
    this.loadAllData();
  }

  editPaymentPolicy(policy: PaymentPolicy) {
    this.editingPolicy = { ...policy };
  }

  updatePaymentPolicy() {
    if (this.editingPolicy) {
      this.adminService.updatePaymentPolicy(this.editingPolicy.id, this.editingPolicy);
      this.editingPolicy = null;
      this.loadAllData();
    }
  }

  cancelEditPolicy() {
    this.editingPolicy = null;
  }

  deletePaymentPolicy(id: string) {
    if (confirm('Are you sure you want to delete this payment policy?')) {
      this.adminService.deletePaymentPolicy(id);
      this.loadAllData();
    }
  }

  // Refund Request Methods
  approveRefund(requestId: string) {
    if (confirm('Approve this refund request?')) {
      this.adminService.updateRefundRequest(requestId, { status: 'approved' });
      this.loadAllData();
    }
  }

  rejectRefund(requestId: string) {
    if (confirm('Reject this refund request?')) {
      this.adminService.updateRefundRequest(requestId, { status: 'rejected' });
      this.loadAllData();
    }
  }

  // Logout
  logout() {
    this.authService.logout();
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }

  // Student Fee Management Methods
  openFeeModal(user: User) {
    if (user.role !== 'student') {
      alert('Fees can only be added to students');
      return;
    }
    this.selectedStudentForFee = user;
    this.newStudentFee = {
      feeStructureId: '',
      amount: 0,
      description: ''
    };
    this.showFeeModal = true;
  }

  closeFeeModal() {
    this.showFeeModal = false;
    this.selectedStudentForFee = null;
    this.newStudentFee = {
      feeStructureId: '',
      amount: 0,
      description: ''
    };
  }

  addStudentFee() {
    if (!this.selectedStudentForFee) return;

    // Validate inputs
    if (!this.newStudentFee.feeStructureId && this.newStudentFee.amount <= 0) {
      alert('Please select a fee structure or enter a custom amount');
      return;
    }

    let feeStructure: FeeStructure | undefined;
    let amount = 0;
    let useCustomAmount = false;

    if (this.newStudentFee.feeStructureId) {
      // Use existing fee structure - use its amount
      feeStructure = this.feeStructures.find(fs => fs.id === this.newStudentFee.feeStructureId);
      if (!feeStructure) {
        alert('Selected fee structure not found');
        return;
      }
      amount = feeStructure.amount;
    } else {
      // Custom amount - need to create or use a fee structure
      amount = this.newStudentFee.amount;
      useCustomAmount = true;

      // For custom amounts, create a unique fee structure to avoid conflicts
      const defaultCategory = this.feeCategories.length > 0
        ? this.feeCategories[0]
        : this.adminService.createFeeCategory({
            name: 'Custom Fee',
            description: 'Custom fee added by admin',
            amount: amount,
            isActive: true
          });

      // Create a unique fee structure for this custom amount
      feeStructure = this.adminService.createFeeStructure({
        categoryId: defaultCategory.id,
        academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
        amount: amount,
        dueDate: new Date().toISOString(),
        isActive: true
      });
    }

    // Check if student already has this fee structure assigned
    const existingFees = this.adminService.getStudentFeesForUser(this.selectedStudentForFee.username);
    const existingFee = existingFees.find(sf => sf.feeStructureId === feeStructure!.id);

    if (existingFee && !useCustomAmount) {
      // Update existing fee by adding to remaining amount (only if using fee structure's amount and it already exists)
      const newRemaining = existingFee.remainingAmount + amount;
      const newOriginal = existingFee.originalAmount + amount;
      const status: 'unpaid' | 'partial' | 'paid' = newRemaining === 0 ? 'paid' : (newRemaining < newOriginal ? 'partial' : 'unpaid');
      this.adminService.updateStudentFee(existingFee.id, {
        originalAmount: newOriginal,
        remainingAmount: newRemaining,
        status
      });
      // Refresh data before calculating new total
      this.loadAllData();
      const newTotal = this.getStudentOutstandingFees(this.selectedStudentForFee);
      alert(`Added ${this.formatCurrency(amount)} to student's outstanding fees.\nNew total: ${this.formatCurrency(newTotal)}`);
    } else {
      // Create new student fee assignment (for custom amounts or new fee structures)
      this.adminService.createStudentFee({
        userId: this.selectedStudentForFee.username,
        feeStructureId: feeStructure!.id,
        originalAmount: amount,
        remainingAmount: amount,
        status: 'unpaid'
      });
      // Refresh data before calculating new total
      this.loadAllData();
      const newTotal = this.getStudentOutstandingFees(this.selectedStudentForFee);
      alert(`Added ${this.formatCurrency(amount)} fee to student.\nNew outstanding fees: ${this.formatCurrency(newTotal)}`);
    }

    this.closeFeeModal();
  }

  getStudentOutstandingFees(user: User): number {
    if (user.role !== 'student') return 0;
    // Always get fresh data from the service
    const studentFees = this.adminService.getStudentFeesForUser(user.username);
    const total = studentFees.reduce((sum, sf) => sum + (sf.remainingAmount || 0), 0);
    return total;
  }

  getStudentWalletBalance(user: User): number {
    if (user.role !== 'student') return 0;
    return this.adminService.getUserWallet(user.username);
  }

  // Wallet Management Methods
  openWalletModal(user: User) {
    if (user.role !== 'student') {
      alert('Wallet can only be managed for students');
      return;
    }
    this.selectedStudentForWallet = user;
    this.walletTopUpAmount = 0;
    this.showWalletModal = true;
  }

  closeWalletModal() {
    this.showWalletModal = false;
    this.selectedStudentForWallet = null;
    this.walletTopUpAmount = 0;
  }

  topUpWallet() {
    if (!this.selectedStudentForWallet || this.walletTopUpAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const currentBalance = this.adminService.getUserWallet(this.selectedStudentForWallet.username);
    const success = this.adminService.adjustUserWallet(this.selectedStudentForWallet.username, this.walletTopUpAmount);

    if (success) {
      const newBalance = this.adminService.getUserWallet(this.selectedStudentForWallet.username);
      alert(`Added ${this.formatCurrency(this.walletTopUpAmount)} to wallet.\nNew wallet balance: ${this.formatCurrency(newBalance)}`);
      this.closeWalletModal();
      this.loadAllData();
    } else {
      alert('Failed to top up wallet. Please try again.');
    }
  }
}
