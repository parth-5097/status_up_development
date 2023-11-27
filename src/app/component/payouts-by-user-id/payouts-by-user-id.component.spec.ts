import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayoutsByUserIdComponent } from './payouts-by-user-id.component';

describe('PayoutsByUserIdComponent', () => {
  let component: PayoutsByUserIdComponent;
  let fixture: ComponentFixture<PayoutsByUserIdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PayoutsByUserIdComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PayoutsByUserIdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
