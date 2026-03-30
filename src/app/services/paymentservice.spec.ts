// payment.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { PaymentService } from './paymentservice';  // ← P majuscule

describe('PaymentService', () => {  // ← P majuscule
  let service: PaymentService;      // ← P majuscule

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaymentService);  // ← P majuscule
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
