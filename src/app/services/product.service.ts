import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export const API_BASE = 'http://localhost:8089/api';

const unwrap = (res: any) => res?.data?.content || res?.data || res || [];
const unwrapOne = (res: any) => res?.data || res;

@Injectable({ providedIn: 'root' })
export class ProductService {
  private url = `${API_BASE}/products`;
  private adminUrl = `${API_BASE}/admin/products`;

  constructor(private http: HttpClient) {}

  // ── Admin ──────────────────────────────────────────────
  getAllAdmin(page = 0, size = 50): Observable<any[]> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<any>(this.adminUrl, { params }).pipe(map(unwrap));
  }

  getPending(page = 0, size = 20): Observable<any[]> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<any>(`${this.adminUrl}/pending`, { params }).pipe(map(unwrap));
  }

  approve(id: string): Observable<any> {
    return this.http.post<any>(`${this.adminUrl}/${id}/approve`, {}).pipe(map(unwrapOne));
  }

  reject(id: string, reason: string): Observable<any> {
    const params = new HttpParams().set('reason', reason);
    return this.http.post<any>(`${this.adminUrl}/${id}/reject`, null, { params }).pipe(map(unwrapOne));
  }

  toggleFeatured(id: string): Observable<any> {
    return this.http.post<any>(`${this.adminUrl}/${id}/feature`, {}).pipe(map(unwrapOne));
  }

  deleteAdmin(id: string): Observable<any> {
    return this.http.delete<any>(`${this.adminUrl}/${id}`);
  }

  // ── Public / Seller ────────────────────────────────────
  /** GET /api/products — used by marketplace, accepts optional filters */
  getAll(filters?: { isActive?: boolean; categoryId?: string }): Observable<any[]> {
    let params = new HttpParams();
    if (filters?.isActive !== undefined) params = params.set('isActive', String(filters.isActive));
    if (filters?.categoryId) params = params.set('categoryId', filters.categoryId);
    return this.http.get<any>(this.url, { params }).pipe(map(unwrap));
  }

  getActive(): Observable<any[]> {
    return this.http.get<any>(`${this.url}/active`).pipe(map(unwrap));
  }

  getFeatured(): Observable<any[]> {
    return this.http.get<any>(`${this.url}/featured`).pipe(map(unwrap));
  }

  getRentals(): Observable<any[]> {
    return this.http.get<any>(`${this.url}/rental`).pipe(map(unwrap));
  }

  /** GET /api/products/search?q=term */
  search(term: string): Observable<any[]> {
    const params = new HttpParams().set('q', term);
    return this.http.get<any>(`${this.url}/search`, { params }).pipe(map(unwrap));
  }

  /** GET /api/products/{id} */
  getById(id: string): Observable<any> {
    return this.http.get<any>(`${this.url}/${id}`).pipe(map(unwrapOne));
  }

  /** POST /api/products — seller creates product */
  create(data: any): Observable<any> {
    return this.http.post<any>(this.url, data).pipe(map(unwrapOne));
  }

  /** PUT /api/products/{id} */
  update(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.url}/${id}`, data).pipe(map(unwrapOne));
  }

  /** DELETE /api/products/{id} */
  delete(id: string): Observable<any> {
    return this.http.delete<any>(`${this.url}/${id}`);
  }

  // alias used by admin component
  getMyProducts(): Observable<any[]> {
    return this.getAll();
  }
}
