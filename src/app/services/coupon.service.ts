// src/app/services/coupon.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

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

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class CouponService {
  private apiUrl = `${environment.apiUrl}/api/coupons`;

  constructor(private http: HttpClient) { }

  private extractData<T>(response: ApiResponse<T>): T {
    return response.data ?? ({} as any);
  }

  // Récupérer tous les coupons (admin)
  getAllCoupons(): Observable<Coupon[]> {
    return this.http.get<ApiResponse<Coupon[]>>(this.apiUrl)
      .pipe(map(res => this.extractData(res) ?? []));
  }

  // Récupérer les coupons actifs
  getActiveCoupons(): Observable<Coupon[]> {
    return this.http.get<ApiResponse<Coupon[]>>(`${this.apiUrl}/active`)
      .pipe(map(res => this.extractData(res) ?? []));
  }

  // Récupérer les coupons valides (date)
  getValidCoupons(): Observable<Coupon[]> {
    return this.http.get<ApiResponse<Coupon[]>>(`${this.apiUrl}/valid`)
      .pipe(map(res => this.extractData(res) ?? []));
  }

  // Récupérer un coupon par son code
  getCouponByCode(code: string): Observable<Coupon> {
    return this.http.get<ApiResponse<Coupon>>(`${this.apiUrl}/code/${code}`)
      .pipe(map(res => this.extractData(res)));
  }

  // Valider un coupon et calculer la réduction
  validateCoupon(code: string, orderAmount: number): Observable<CouponValidationResult> {
    return this.http.post<ApiResponse<CouponValidationResult>>(
      `${this.apiUrl}/validate?code=${code}&orderAmount=${orderAmount}`, {})
      .pipe(map(res => this.extractData(res)));
  }
}
