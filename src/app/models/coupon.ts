// src/app/models/coupon.model.ts

export interface Coupon {
  id: number;
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  isValid: boolean;
}

export interface CouponValidationResult {
  code: string;
  discount: number;
  finalAmount: number;
}
