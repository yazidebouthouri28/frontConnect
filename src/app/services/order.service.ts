// SAVE TO: src/app/services/order.service.ts

import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';

const unwrap   = (res: any): any[] => Array.isArray(res) ? res : res?.data?.content || res?.data || res || [];
const unwrapOne = (res: any) => res?.data || res;

/**
 * Matches backend OrderRequest exactly:
 * @NotBlank: shippingName, shippingAddress, shippingCity,
 *            shippingPostalCode, shippingCountry, paymentMethod
 * Optional:  shippingPhone, notes, couponCode
 */
export interface OrderRequest {
  shippingName:       string;   // @NotBlank
  shippingPhone?:     string;
  shippingAddress:    string;   // @NotBlank
  shippingCity:       string;   // @NotBlank
  shippingPostalCode: string;   // @NotBlank
  shippingCountry:    string;   // @NotBlank
  paymentMethod:      string;   // @NotBlank — backend enum: WALLET | CREDIT_CARD | BANK_TRANSFER | CASH_ON_DELIVERY
  notes?:             string;
  couponCode?:        string;
}

@Injectable({ providedIn: 'root' })
export class OrderService {

  // environment.apiUrl = 'http://localhost:8088/api'  (already contains /api)
  private url = `${environment.apiUrl}/orders`;
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  // ── Read ──────────────────────────────────────────────────────────────────

  getAll(): Observable<any[]> {
    return this.http.get<any>(this.url).pipe(map(unwrap));
  }

  getById(id: string): Observable<any> {
    return this.http.get<any>(`${this.url}/${id}`).pipe(map(unwrapOne));
  }

  getByUser(userId: string, page = 0, size = 50): Observable<any[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<any>(`${this.url}/user/${userId}`, { params }).pipe(map(unwrap));
  }

  getMyOrders(): Observable<any[]> {
    return this.http.get<any>(`${this.url}/my-orders`).pipe(map(unwrap));
  }

  getByStatus(status: string, page = 0, size = 20): Observable<any[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<any>(`${this.url}/status/${status.toUpperCase()}`, { params })
      .pipe(map(unwrap));
  }

  // ── Create order ──────────────────────────────────────────────────────────

  /**
   * POST /api/orders?userId={uuid}
   *
   * All @NotBlank fields must be non-empty strings.
   * paymentMethod must match backend PaymentMethod enum exactly.
   */
  create(orderData: {
    userId?:            string | number;
    shippingName:       string;
    shippingPhone?:     string;
    shippingAddress:    string;
    shippingCity:       string;
    shippingPostalCode: string;
    shippingCountry:    string;
    paymentMethod:      string;
    notes?:             string;
    couponCode?:        string;
  }): Observable<any> {

    // Map frontend aliases → backend PaymentMethod enum values
    const methodMap: Record<string, string> = {
      wallet:        'WALLET',
      card:          'CREDIT_CARD',
      credit_card:   'CREDIT_CARD',
      creditcard:    'CREDIT_CARD',
      bank:          'BANK_TRANSFER',
      bank_transfer: 'BANK_TRANSFER',
      cash:          'CASH_ON_DELIVERY',
    };
    const rawMethod = (orderData.paymentMethod || 'card').toLowerCase().replace(/\s/g, '_');
    const paymentMethod = methodMap[rawMethod] ?? rawMethod.toUpperCase();

    const body: OrderRequest = {
      shippingName:       orderData.shippingName.trim(),
      shippingPhone:      (orderData.shippingPhone || '').trim(),
      shippingAddress:    orderData.shippingAddress.trim(),
      shippingCity:       orderData.shippingCity.trim(),
      shippingPostalCode: orderData.shippingPostalCode.trim(),
      shippingCountry:    orderData.shippingCountry.trim(),
      paymentMethod,
      notes:      orderData.notes,
      couponCode: orderData.couponCode,
    };

    console.debug('[OrderService] POST /orders →', JSON.stringify(body, null, 2));

    const resolvedId = this.resolveUserId(orderData.userId);
    const params = resolvedId
      ? new HttpParams().set('userId', resolvedId)
      : new HttpParams();

    return this.http.post<any>(this.url, body, { params }).pipe(map(unwrapOne));
  }

  // ── Update ────────────────────────────────────────────────────────────────

  updateStatus(id: string, status: string): Observable<any> {
    const params = new HttpParams().set('status', status.toUpperCase());
    return this.http.patch<any>(`${this.url}/${id}/status`, null, { params })
      .pipe(map(unwrapOne));
  }

  updatePaymentStatus(id: string, status: string, transactionId?: string): Observable<any> {
    let params = new HttpParams().set('status', status.toUpperCase());
    if (transactionId) params = params.set('transactionId', transactionId);
    return this.http.patch<any>(`${this.url}/${id}/payment`, null, { params })
      .pipe(map(unwrapOne));
  }

  cancel(id: string): Observable<any> {
    return this.updateStatus(id, 'CANCELLED');
  }

  getTotalRevenue(): Observable<number> {
    return this.http.get<any>(`${this.url}/revenue`).pipe(map(res => res?.data ?? res));
  }

  // ── Helper ────────────────────────────────────────────────────────────────

  private resolveUserId(explicit?: string | number): string | null {
    if (explicit !== undefined && explicit !== null) {
      const s = String(explicit).trim();
      if (s && s !== 'NaN' && s !== '0' && s !== 'undefined' && s !== 'null') return s;
    }
    if (this.isBrowser) {
      for (const key of ['current_user', 'user', 'auth_user', 'loggedUser']) {
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const id = JSON.parse(raw)?.id;
            if (id) return String(id);
          }
        } catch { }
      }
    }
    return null;
  }
}
