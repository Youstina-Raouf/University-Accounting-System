import { Injectable } from '@angular/core';

export type UserRole = 'admin' | 'accounting' | 'student';

export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  firstname: string;
  lastname: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  walletBalance?: number;
}

export interface FeeCategory {
  id: string;
  name: string;
  description: string;
  amount: number;
  isActive: boolean;
}

export interface FeeStructure {
  id: string;
  categoryId: string;
  categoryName: string;
  academicYear: string;
  amount: number;
  dueDate: string;
  isActive: boolean;
}

export interface PaymentPolicy {
  id: string;
  policyType: 'deadline' | 'penalty' | 'installment' | 'refund';
  name: string;
  description: string;
  value: number; // percentage or amount
  isActive: boolean;
}

export interface Payment {
  id: string;
  userId: string;
  username: string;
  feeStructureId: string;
  amount: number;
  paymentDate: string;
  status: 'pending' | 'completed' | 'refunded';
  paymentMethod: string;
  studentFeeId?: string; // optional link to per-student fee assignment
}

export interface RefundRequest {
  id: string;
  userId: string;
  username: string;
  paymentId: string;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedDate: string;
}

export interface Invoice {
  id: string;
  userId: string;
  username: string;
  title: string;
  description?: string;
  amount: number;
  createdDate: string;
  dueDate?: string;
  status: 'unpaid' | 'paid' | 'cancelled';
}

export interface StudentFee {
  id: string;
  userId: string;
  feeStructureId: string; // reference to FeeStructure template
  originalAmount: number;
  remainingAmount: number;
  status: 'unpaid' | 'partial' | 'paid';
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private usersKey = 'users';
  private feeCategoriesKey = 'feeCategories';
  private feeStructuresKey = 'feeStructures';
  private paymentPoliciesKey = 'paymentPolicies';
  private paymentsKey = 'payments';
  private studentFeesKey = 'studentFees';
  private refundRequestsKey = 'refundRequests';
  private invoicesKey = 'invoices';

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Initialize fee categories
    if (!localStorage.getItem(this.feeCategoriesKey)) {
      const defaultCategories: FeeCategory[] = [
        { id: '1', name: 'Tuition Fee', description: 'Annual tuition fee', amount: 5000, isActive: true },
        { id: '2', name: 'Registration Fee', description: 'Registration fee', amount: 500, isActive: true },
        { id: '3', name: 'Library Fee', description: 'Library access fee', amount: 200, isActive: true }
      ];
      localStorage.setItem(this.feeCategoriesKey, JSON.stringify(defaultCategories));
    }

    // Initialize fee structures
    if (!localStorage.getItem(this.feeStructuresKey)) {
      const currentYear = new Date().getFullYear();
      const defaultStructures: FeeStructure[] = [
        { id: '1', categoryId: '1', categoryName: 'Tuition Fee', academicYear: `${currentYear}-${currentYear + 1}`, amount: 5000, dueDate: new Date(currentYear, 8, 1).toISOString(), isActive: true },
        { id: '2', categoryId: '2', categoryName: 'Registration Fee', academicYear: `${currentYear}-${currentYear + 1}`, amount: 500, dueDate: new Date(currentYear, 8, 1).toISOString(), isActive: true }
      ];
      localStorage.setItem(this.feeStructuresKey, JSON.stringify(defaultStructures));
    }

    // Initialize payment policies
    if (!localStorage.getItem(this.paymentPoliciesKey)) {
      const defaultPolicies: PaymentPolicy[] = [
        { id: '1', policyType: 'deadline', name: 'Fall Semester Deadline', description: 'Payment deadline for fall semester', value: 30, isActive: true },
        { id: '2', policyType: 'penalty', name: 'Late Payment Penalty', description: 'Penalty for late payments', value: 5, isActive: true },
        { id: '3', policyType: 'installment', name: 'Installment Plan', description: 'Maximum installments allowed', value: 3, isActive: true }
      ];
      localStorage.setItem(this.paymentPoliciesKey, JSON.stringify(defaultPolicies));
    }

    // Initialize payments
    if (!localStorage.getItem(this.paymentsKey)) {
      localStorage.setItem(this.paymentsKey, JSON.stringify([]));
    }

    // Initialize refund requests
    if (!localStorage.getItem(this.refundRequestsKey)) {
      localStorage.setItem(this.refundRequestsKey, JSON.stringify([]));
    }

    // Initialize invoices
    if (!localStorage.getItem(this.invoicesKey)) {
      localStorage.setItem(this.invoicesKey, JSON.stringify([]));
    }

    // Initialize student fees assignments
    if (!localStorage.getItem(this.studentFeesKey)) {
      localStorage.setItem(this.studentFeesKey, JSON.stringify([]));
    }
  }

  // Student fee assignments (per-user)
  getStudentFees(): StudentFee[] {
    const raw = localStorage.getItem(this.studentFeesKey);
    return raw ? JSON.parse(raw) : [];
  }

  getStudentFeesForUser(userId: string): StudentFee[] {
    return this.getStudentFees().filter(sf => sf.userId === userId);
  }

  getStudentFeeById(id: string): StudentFee | undefined {
    return this.getStudentFees().find(sf => sf.id === id);
  }

  createStudentFee(fee: Omit<StudentFee, 'id'>): StudentFee {
    const fees = this.getStudentFees();
    const newFee: StudentFee = { ...fee, id: `sfee-${Date.now()}-${Math.random().toString(36).slice(2,8)}` };
    fees.push(newFee);
    localStorage.setItem(this.studentFeesKey, JSON.stringify(fees));
    return newFee;
  }

  updateStudentFee(id: string, updates: Partial<StudentFee>): boolean {
    const fees = this.getStudentFees();
    const idx = fees.findIndex(f => f.id === id);
    if (idx === -1) return false;
    fees[idx] = { ...fees[idx], ...updates };
    localStorage.setItem(this.studentFeesKey, JSON.stringify(fees));
    return true;
  }

  // User Management
  getUsers(): User[] {
    const users = localStorage.getItem(this.usersKey);
    if (!users) return [];
    const allUsers = JSON.parse(users);
    return allUsers.map((u: any, index: number) => ({
      id: u.id || `user-${index}`,
      username: u.username,
      password: u.password || '',
      role: u.role,
      firstname: u.firstname || '',
      lastname: u.lastname || '',
      email: u.email || '',
      isActive: u.isActive !== undefined ? u.isActive : true,
      createdAt: u.createdAt || new Date().toISOString(),
      walletBalance: u.walletBalance !== undefined ? u.walletBalance : 0
    }));
  }

  createUser(user: Omit<User, 'id' | 'createdAt'>): User {
    const users = this.getUsers();
    const newUser: User = {
      ...user,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    localStorage.setItem(this.usersKey, JSON.stringify(users));
    return newUser;
  }

  // Wallet utilities (per-user balance)
  getUserWallet(username: string): number {
    const users = this.getUsers();
    const u = users.find(x => x.username === username);
    return u ? (u.walletBalance || 0) : 0;
  }

  setUserWallet(username: string, amount: number): boolean {
    const usersRaw = localStorage.getItem(this.usersKey);
    if (!usersRaw) return false;
    const users = JSON.parse(usersRaw) as any[];
    const idx = users.findIndex(u => u.username === username);
    if (idx === -1) return false;
    users[idx].walletBalance = amount;
    localStorage.setItem(this.usersKey, JSON.stringify(users));
    return true;
  }

  adjustUserWallet(username: string, delta: number): boolean {
    const usersRaw = localStorage.getItem(this.usersKey);
    if (!usersRaw) return false;
    const users = JSON.parse(usersRaw) as any[];
    const idx = users.findIndex(u => u.username === username);
    if (idx === -1) return false;
    const cur = users[idx].walletBalance !== undefined ? users[idx].walletBalance : 0;
    const next = cur + delta;
    if (next < 0) return false; // prevent negative balance
    users[idx].walletBalance = next;
    localStorage.setItem(this.usersKey, JSON.stringify(users));
    return true;
  }

  updateUser(id: string, updates: Partial<User>): boolean {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return false;
    users[index] = { ...users[index], ...updates };
    localStorage.setItem(this.usersKey, JSON.stringify(users));
    return true;
  }

  deleteUser(id: string): boolean {
    const users = this.getUsers();
    const filtered = users.filter(u => u.id !== id);
    if (filtered.length === users.length) return false;
    localStorage.setItem(this.usersKey, JSON.stringify(filtered));
    return true;
  }

  // Fee Category Management
  getFeeCategories(): FeeCategory[] {
    const categories = localStorage.getItem(this.feeCategoriesKey);
    return categories ? JSON.parse(categories) : [];
  }

  createFeeCategory(category: Omit<FeeCategory, 'id'>): FeeCategory {
    const categories = this.getFeeCategories();
    const newCategory: FeeCategory = {
      ...category,
      id: `category-${Date.now()}`
    };
    categories.push(newCategory);
    localStorage.setItem(this.feeCategoriesKey, JSON.stringify(categories));
    return newCategory;
  }

  updateFeeCategory(id: string, updates: Partial<FeeCategory>): boolean {
    const categories = this.getFeeCategories();
    const index = categories.findIndex(c => c.id === id);
    if (index === -1) return false;
    categories[index] = { ...categories[index], ...updates };
    localStorage.setItem(this.feeCategoriesKey, JSON.stringify(categories));
    return true;
  }

  deleteFeeCategory(id: string): boolean {
    const categories = this.getFeeCategories();
    const filtered = categories.filter(c => c.id !== id);
    if (filtered.length === categories.length) return false;
    localStorage.setItem(this.feeCategoriesKey, JSON.stringify(filtered));
    return true;
  }

  // Fee Structure Management
  getFeeStructures(): FeeStructure[] {
    const structures = localStorage.getItem(this.feeStructuresKey);
    return structures ? JSON.parse(structures) : [];
  }

  createFeeStructure(structure: Omit<FeeStructure, 'id' | 'categoryName'>): FeeStructure {
    const structures = this.getFeeStructures();
    const category = this.getFeeCategories().find(c => c.id === structure.categoryId);
    const newStructure: FeeStructure = {
      ...structure,
      id: `structure-${Date.now()}`,
      categoryName: category?.name || ''
    };
    structures.push(newStructure);
    localStorage.setItem(this.feeStructuresKey, JSON.stringify(structures));
    return newStructure;
  }

  updateFeeStructure(id: string, updates: Partial<FeeStructure>): boolean {
    const structures = this.getFeeStructures();
    const index = structures.findIndex(s => s.id === id);
    if (index === -1) return false;
    if (updates.categoryId) {
      const category = this.getFeeCategories().find(c => c.id === updates.categoryId);
      updates.categoryName = category?.name || '';
    }
    structures[index] = { ...structures[index], ...updates };
    localStorage.setItem(this.feeStructuresKey, JSON.stringify(structures));
    return true;
  }

  deleteFeeStructure(id: string): boolean {
    const structures = this.getFeeStructures();
    const filtered = structures.filter(s => s.id !== id);
    if (filtered.length === structures.length) return false;
    localStorage.setItem(this.feeStructuresKey, JSON.stringify(filtered));
    return true;
  }

  // Payment Policy Management
  getPaymentPolicies(): PaymentPolicy[] {
    const policies = localStorage.getItem(this.paymentPoliciesKey);
    return policies ? JSON.parse(policies) : [];
  }

  createPaymentPolicy(policy: Omit<PaymentPolicy, 'id'>): PaymentPolicy {
    const policies = this.getPaymentPolicies();
    const newPolicy: PaymentPolicy = {
      ...policy,
      id: `policy-${Date.now()}`
    };
    policies.push(newPolicy);
    localStorage.setItem(this.paymentPoliciesKey, JSON.stringify(policies));
    return newPolicy;
  }

  updatePaymentPolicy(id: string, updates: Partial<PaymentPolicy>): boolean {
    const policies = this.getPaymentPolicies();
    const index = policies.findIndex(p => p.id === id);
    if (index === -1) return false;
    policies[index] = { ...policies[index], ...updates };
    localStorage.setItem(this.paymentPoliciesKey, JSON.stringify(policies));
    return true;
  }

  deletePaymentPolicy(id: string): boolean {
    const policies = this.getPaymentPolicies();
    const filtered = policies.filter(p => p.id !== id);
    if (filtered.length === policies.length) return false;
    localStorage.setItem(this.paymentPoliciesKey, JSON.stringify(filtered));
    return true;
  }

  // Payment Management
  getPayments(): Payment[] {
    const payments = localStorage.getItem(this.paymentsKey);
    return payments ? JSON.parse(payments) : [];
  }

  createPayment(payment: Omit<Payment, 'id'>): Payment {
    const payments = this.getPayments();
    const newPayment: Payment = {
      ...payment,
      id: `payment-${Date.now()}`
    };
    payments.push(newPayment);
    localStorage.setItem(this.paymentsKey, JSON.stringify(payments));
    return newPayment;
  }

  // Refund Management
  getRefundRequests(): RefundRequest[] {
    const requests = localStorage.getItem(this.refundRequestsKey);
    return requests ? JSON.parse(requests) : [];
  }

  createRefundRequest(request: Omit<RefundRequest, 'id' | 'requestedDate' | 'status'>): RefundRequest {
    const requests = this.getRefundRequests();
    const newRequest: RefundRequest = {
      ...request,
      id: `refund-${Date.now()}`,
      requestedDate: new Date().toISOString(),
      status: 'pending'
    };
    requests.push(newRequest);
    localStorage.setItem(this.refundRequestsKey, JSON.stringify(requests));
    return newRequest;
  }

  // Invoice Management (simple per-user invoices)
  getInvoices(): Invoice[] {
    const raw = localStorage.getItem(this.invoicesKey);
    return raw ? JSON.parse(raw) : [];
  }

  createInvoice(invoice: Omit<Invoice, 'id' | 'createdDate'>): Invoice {
    const invoices = this.getInvoices();
    const newInv: Invoice = {
      ...invoice,
      id: `invoice-${Date.now()}`,
      createdDate: new Date().toISOString()
    };
    invoices.push(newInv);
    localStorage.setItem(this.invoicesKey, JSON.stringify(invoices));
    return newInv;
  }

  updateInvoice(id: string, updates: Partial<Invoice>): boolean {
    const invoices = this.getInvoices();
    const idx = invoices.findIndex(i => i.id === id);
    if (idx === -1) return false;
    invoices[idx] = { ...invoices[idx], ...updates };
    localStorage.setItem(this.invoicesKey, JSON.stringify(invoices));
    return true;
  }

  updateRefundRequest(id: string, updates: Partial<RefundRequest>): boolean {
    const requests = this.getRefundRequests();
    const index = requests.findIndex(r => r.id === id);
    if (index === -1) return false;
    requests[index] = { ...requests[index], ...updates };
    localStorage.setItem(this.refundRequestsKey, JSON.stringify(requests));
    return true;
  }

  // Reporting
  getTotalRevenue(): number {
    const payments = this.getPayments();
    return payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
  }

  getUnpaidStudents(): any[] {
    const users = this.getUsers().filter(u => u.role === 'student' && u.isActive);
    const payments = this.getPayments();
    const studentFees = this.getStudentFees();

    return users.map(user => {
      // Get student's fee assignments
      const userStudentFees = studentFees.filter(sf => sf.userId === user.username);

      // Total due is sum of original amounts from StudentFee records
      const totalDue = userStudentFees.reduce((sum, sf) => sum + sf.originalAmount, 0);

      // Total paid is sum of completed payments
      const userPayments = payments.filter(p =>
        (p.userId === user.id || p.userId === user.username || p.username === user.username) &&
        p.status === 'completed'
      );
      const totalPaid = userPayments.reduce((sum, p) => sum + p.amount, 0);

      // Outstanding is sum of remaining amounts from StudentFee records
      const unpaid = userStudentFees.reduce((sum, sf) => sum + sf.remainingAmount, 0);

      return {
        userId: user.id,
        username: user.username,
        name: `${user.firstname} ${user.lastname}`,
        email: user.email,
        totalDue,
        totalPaid,
        unpaid: unpaid > 0 ? unpaid : 0
      };
    }).filter(s => s.unpaid > 0);
  }

  getPaymentHistory(): Payment[] {
    return this.getPayments().sort((a, b) =>
      new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
    );
  }
}

