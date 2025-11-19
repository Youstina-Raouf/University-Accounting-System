import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, User, FeeCategory, FeeStructure, PaymentPolicy, RefundRequest } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
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

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadAllData();
  }

  loadAllData() {
    this.users = this.adminService.getUsers();
    this.feeCategories = this.adminService.getFeeCategories();
    this.feeStructures = this.adminService.getFeeStructures();
    this.paymentPolicies = this.adminService.getPaymentPolicies();
    this.refundRequests = this.adminService.getRefundRequests();
    this.totalRevenue = this.adminService.getTotalRevenue();
    this.unpaidStudents = this.adminService.getUnpaidStudents();
    this.paymentHistory = this.adminService.getPaymentHistory();
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
}
