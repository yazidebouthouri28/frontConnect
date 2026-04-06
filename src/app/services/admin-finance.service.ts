// src/app/services/admin-finance.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Wallet {
  id: number;
  userId: number;
  userName: string;
  balance: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: number;
  transactionNumber: string;
  amount: number;
  type: string;
  status: string;
  description: string;
  balanceBefore: number;
  balanceAfter: number;
  userId: number;
  userName: string;
  createdAt: string;
}

export interface Coupon {
  id: number;
  code: string;
  description: string;
  discountType: string;
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount: number;
  usageLimit: number;
  usageCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  isValid: boolean;
}

export interface CouponUsage {
  id: number;
  couponCode: string;
  userId: number;
  userName: string;
  orderId: number;
  discountAmount: number;
  usedAt: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  userName: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
}

export interface Promotion {
  id: number;
  name: string;
  description: string;
  type: string;
  discountValue: number;
  minPurchaseAmount: number;
  maxDiscountAmount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  currentUsage: number;
  maxUsage: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class AdminFinanceService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  private extractData<T>(response: ApiResponse<T>): T {
    return response.data ?? ({} as any);
  }

  // ==================== WALLETS ====================
  getAllWallets(): Observable<Wallet[]> {
    return this.http.get<ApiResponse<Wallet[]>>(`${this.apiUrl}/api/wallets/all`)
      .pipe(map(res => this.extractData(res) ?? []));
  }

  // ==================== TRANSACTIONS ====================
  getAllTransactions(page: number = 0, size: number = 20): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/api/transactions?page=${page}&size=${size}`)
      .pipe(map(res => this.extractData(res)));
  }

  // ==================== COUPONS ====================
  getAllCoupons(): Observable<Coupon[]> {
    return this.http.get<ApiResponse<Coupon[]>>(`${this.apiUrl}/api/coupons`)
      .pipe(map(res => this.extractData(res) ?? []));
  }

  createCoupon(coupon: Partial<Coupon>): Observable<Coupon> {
    return this.http.post<ApiResponse<Coupon>>(`${this.apiUrl}/api/coupons`, coupon)
      .pipe(map(res => this.extractData(res)));
  }

  updateCoupon(id: number, coupon: Partial<Coupon>): Observable<Coupon> {
    return this.http.put<ApiResponse<Coupon>>(`${this.apiUrl}/api/coupons/${id}`, coupon)
      .pipe(map(res => this.extractData(res)));
  }

  toggleCoupon(id: number, isActive: boolean): Observable<Coupon> {
    if (isActive) {
      return this.http.put<ApiResponse<Coupon>>(`${this.apiUrl}/api/coupons/${id}/activate`, {})
        .pipe(map(res => this.extractData(res)));
    } else {
      return this.http.put<ApiResponse<Coupon>>(`${this.apiUrl}/api/coupons/${id}/deactivate`, {})
        .pipe(map(res => this.extractData(res)));
    }
  }

  // ==================== PROMOTIONS ====================
  getAllPromotions(): Observable<Promotion[]> {
    return this.http.get<ApiResponse<Promotion[]>>(`${this.apiUrl}/api/promotions`)
      .pipe(map(res => this.extractData(res) ?? []));
  }

  createPromotion(promotion: Partial<Promotion>): Observable<Promotion> {
    return this.http.post<ApiResponse<Promotion>>(`${this.apiUrl}/api/promotions`, promotion)
      .pipe(map(res => this.extractData(res)));
  }

  togglePromotion(id: number, isActive: boolean): Observable<Promotion> {
    if (isActive) {
      return this.http.put<ApiResponse<Promotion>>(`${this.apiUrl}/api/promotions/${id}/activate`, {})
        .pipe(map(res => this.extractData(res)));
    } else {
      return this.http.put<ApiResponse<Promotion>>(`${this.apiUrl}/api/promotions/${id}/deactivate`, {})
        .pipe(map(res => this.extractData(res)));
    }
  }

  // ==================== ORDERS ====================
  getAllOrders(page: number = 0, size: number = 20): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/api/orders?page=${page}&size=${size}`)
      .pipe(map(res => this.extractData(res)));
  }

  updateOrderStatus(orderId: number, status: string): Observable<Order> {
    return this.http.put<ApiResponse<Order>>(`${this.apiUrl}/api/orders/${orderId}/status?status=${status}`, {})
      .pipe(map(res => this.extractData(res)));
  }

  // ==================== COUPON USAGES ====================
  getAllCouponUsages(): Observable<CouponUsage[]> {
    return this.http.get<ApiResponse<CouponUsage[]>>(`${this.apiUrl}/api/coupon-usages`)
      .pipe(map(res => this.extractData(res) ?? []));
  }
}
