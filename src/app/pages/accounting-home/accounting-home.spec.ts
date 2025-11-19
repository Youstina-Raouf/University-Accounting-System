import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountingHome } from './accounting-home.component';

describe('AccountingHome', () => {
  let component: AccountingHome;
  let fixture: ComponentFixture<AccountingHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountingHome]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountingHome);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
