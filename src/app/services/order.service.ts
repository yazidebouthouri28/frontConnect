import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_BASE } from './product.service';

const unwrap = (res: any) => res?.data?.content || res?.data || res || [];
const unwrapOne = (res: any) => res?.data || res;

@Injectable({ providedIn: 'root' })
export class OrderService {
  private adminUrl = `${API_BASE}/admin/orders`;
  private url = `${API_BASE}/orders`;

  constructor(private http: HttpClient) {}

  // ── Admin ──────────────────────────────────────────────

  /** GET /api/admin/orders */
  getAll(page = 0, size = 50): Observable<any[]> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<any>(this.adminUrl, { params }).pipe(map(unwrap));
  }

  /** GET /api/admin/orders/status/{status} */
  getByStatus(status: string, page = 0, size = 20): Observable<any[]> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<any>(`${this.adminUrl}/status/${status}`, { params }).pipe(map(unwrap));
  }

  /** GET /api/admin/orders/{id} */
  getById(id: string): Observable<any> {
    return this.http.get<any>(`${this.adminUrl}/${id}`).pipe(map(unwrapOne));
  }

  /** PUT /api/admin/orders/{id}/status?status=SHIPPED */
  updateStatus(id: string, status: string, notes?: string): Observable<any> {
    let params = new HttpParams().set('status', status);
    if (notes) params = params.set('notes', notes);
    return this.http.put<any>(`${this.adminUrl}/${id}/status`, null, { params }).pipe(map(unwrapOne));
  }

  /** PUT /api/admin/orders/{id}/tracking */
  updateTracking(id: string, trackingNumber: string, carrier?: string): Observable<any> {
    let params = new HttpParams().set('trackingNumber', trackingNumber);
    if (carrier) params = params.set('carrier', carrier);
    return this.http.put<any>(`${this.adminUrl}/${id}/tracking`, null, { params }).pipe(map(unwrapOne));
  }

  /** POST /api/admin/orders/{id}/cancel?reason=... */
  cancelAdmin(id: string, reason?: string): Observable<any> {
    const params = reason ? new HttpParams().set('reason', reason) : undefined;
    return this.http.post<any>(`${this.adminUrl}/${id}/cancel`, null, { params });
  }

  // ── Client / Seller ────────────────────────────────────

  /** GET /api/orders — current user's orders */
  getMyOrders(): Observable<any[]> {
    return this.http.get<any>(this.url).pipe(map(unwrap));
  }

  /** GET /api/orders/seller — seller's received orders */
  getSellerOrders(): Observable<any[]> {
    return this.http.get<any>(`${this.url}/seller`).pipe(map(unwrap));
  }

  /** GET /api/orders/status/{status} */
  getMyOrdersByStatus(status: string): Observable<any[]> {
    return this.http.get<any>(`${this.url}/status/${status}`).pipe(map(unwrap));
  }

  /** GET /api/orders/{id} */
  getMyOrderById(id: string): Observable<any> {
    return this.http.get<any>(`${this.url}/${id}`).pipe(map(unwrapOne));
  }

  /** POST /api/orders — place new order */
  create(orderData: any): Observable<any> {
    return this.http.post<any>(this.url, orderData).pipe(map(unwrapOne));
  }

  /** POST /api/orders/{id}/cancel */
  cancel(id: string, reason?: string): Observable<any> {
    const params = reason ? new HttpParams().set('reason', reason) : undefined;
    return this.http.post<any>(`${this.url}/${id}/cancel`, null, { params });
  }

  /** PUT /api/orders/{id}/status */
  updateMyOrderStatus(id: string, status: string): Observable<any> {
    const params = new HttpParams().set('status', status);
    return this.http.put<any>(`${this.url}/${id}/status`, null, { params }).pipe(map(unwrapOne));
  }

  /** DELETE /api/orders/{id} */
  delete(id: string): Observable<any> {
    return this.http.delete<any>(`${this.url}/${id}`);
  }
}
