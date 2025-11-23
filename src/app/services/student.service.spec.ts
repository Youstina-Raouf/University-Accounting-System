import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AdminService } from './admin.service';
import { AuthService } from './auth.service';
import { StudentService } from './student.service';

class MockRouter { navigate() { return Promise.resolve(true); } }

describe('StudentService payments (full & partial)', () => {
  let admin: AdminService;
  let auth: AuthService;
  let studentSvc: StudentService;

  beforeEach(() => {
    // clear storage to avoid state carryover
    localStorage.clear();
    sessionStorage.clear();

    TestBed.configureTestingModule({ providers: [{ provide: Router, useClass: MockRouter }] });
    admin = TestBed.inject(AdminService);
    auth = TestBed.inject(AuthService);
    studentSvc = TestBed.inject(StudentService);

    // seed a student user
    localStorage.setItem('users', JSON.stringify([{ username: 'stu1', password: 'pw', role: 'student', firstname: 'Stu', lastname: 'Dent' }]));
    const ok = auth.login('stu1', 'pw', false);
    expect(ok).toBeTrue();
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('should assign templates and allow a full payment which marks student fee paid', () => {
    const fees = studentSvc.getStudentFees();
    expect(fees.length).toBeGreaterThan(0);

    const first = fees[0];
    // process full payment equal to fee amount
    const paid = studentSvc.makePayment(first.amount, first.id, 'Online');
    expect(paid).toBeTrue();

    const payments = admin.getPayments();
    const recent = payments[payments.length - 1];
    expect(recent).toBeDefined();
    expect(recent.amount).toBe(first.amount);
    expect(recent.studentFeeId).toBe(first.id);

    const sfee = admin.getStudentFeeById(first.id as string);
    expect(sfee).toBeDefined();
    expect(sfee!.remainingAmount).toBe(0);
    expect(sfee!.status).toBe('paid');
  });

  it('should support partial payments and reduce remaining amount', () => {
    const fees = studentSvc.getStudentFees();
    expect(fees.length).toBeGreaterThan(0);

    const first = fees[0];
    const partial = Math.floor((first.amount as number) / 2);

    const ok1 = studentSvc.makePayment(partial, first.id, 'Online');
    expect(ok1).toBeTrue();

    const sfee1 = admin.getStudentFeeById(first.id as string)!;
    expect(sfee1.remainingAmount).toBe(first.amount - partial);
    expect(sfee1.status).toBe('partial');

    // pay remaining
    const ok2 = studentSvc.makePayment(sfee1.remainingAmount, first.id, 'Online');
    expect(ok2).toBeTrue();

    const sfee2 = admin.getStudentFeeById(first.id as string)!;
    expect(sfee2.remainingAmount).toBe(0);
    expect(sfee2.status).toBe('paid');
  });
});
