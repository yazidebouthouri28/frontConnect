import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

/**
 * API_BASE = environment.apiUrl  (which is already 'http://host/api')
 *
 * IMPORTANT: Do NOT add '/api' here.
 * environment.apiUrl already ends with /api (e.g. 'http://localhost:8088/api').
 * Adding /api again produces the double-prefix bug: /api/api/products.
 */
export const API_BASE = environment.apiUrl;

const unwrap = (res: any): any[] => {
  if (Array.isArray(res)) return res;
  return res?.data?.content || res?.data || res || [];
};
const unwrapOne = (res: any) => res?.data || res;

export interface ProductRequest {
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  sku?: string;
  barcode?: string;
  brand?: string;
  categoryId?: number;
  sellerId: number;
  stockQuantity?: number;
  minStockLevel?: number;
  maxStockLevel?: number;
  trackInventory?: boolean;
  images?: string[];
  thumbnail?: string;
  isFeatured?: boolean;
  isOnSale?: boolean;
  isRentable?: boolean;
  rentalPricePerDay?: number;
  weight?: number;
  dimensions?: string;
  tags?: string[];
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private url = `${API_BASE}/products`;

  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc'): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);
    return this.http.get<any>(this.url, { params })
      .pipe(map(res => res?.data?.content || res?.data || res || []));
  }

  getById(id: string): Observable<any> {
    return this.http.get<any>(`${this.url}/${id}`).pipe(map(unwrapOne));
  }

  getByCategory(categoryId: string, page = 0, size = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<any>(`${this.url}/category/${categoryId}`, { params })
      .pipe(map(res => res?.data || res));
  }

  getBySeller(sellerId: string, page = 0, size = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<any>(`${this.url}/seller/${sellerId}`, { params })
      .pipe(map(res => res?.data || res));
  }

  search(keyword: string, page = 0, size = 10): Observable<any> {
    const params = new HttpParams()
      .set('keyword', keyword)
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<any>(`${this.url}/search`, { params })
      .pipe(map(res => res?.data || res));
  }

  getByPriceRange(min: number, max: number, page = 0, size = 10): Observable<any> {
    const params = new HttpParams()
      .set('min', min.toString())
      .set('max', max.toString())
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<any>(`${this.url}/price-range`, { params })
      .pipe(map(res => res?.data || res));
  }

  getFeatured(): Observable<any[]> {
    return this.http.get<any>(`${this.url}/featured`).pipe(map(unwrap));
  }

  getTopSelling(limit = 10): Observable<any[]> {
    return this.http.get<any>(`${this.url}/top-selling?limit=${limit}`).pipe(map(unwrap));
  }

  create(data: ProductRequest): Observable<any> {
    return this.http.post<any>(this.url, data).pipe(map(unwrapOne));
  }

  update(id: string, data: Partial<ProductRequest>): Observable<any> {
    return this.http.put<any>(`${this.url}/${id}`, data).pipe(map(unwrapOne));
  }

  updateStock(id: string, quantity: number): Observable<any> {
    return this.http.patch<any>(`${this.url}/${id}/stock?quantity=${quantity}`, {})
      .pipe(map(unwrapOne));
  }

  delete(id: string): Observable<any> {
    return this.http.delete<any>(`${this.url}/${id}`);
  }

  // Admin aliases
  getAllAdmin(page = 0, size = 50): Observable<any> {
    return this.getAll(page, size);
  }

  getMyProducts(): Observable<any[]> {
    return this.http.get<any>(`${this.url}/my-products`).pipe(map(unwrap));
  }

  toggleFeatured(id: string): Observable<any> {
    return this.http.patch<any>(`${this.url}/${id}/feature`, {}).pipe(map(unwrapOne));
  }

  deleteAdmin(id: string): Observable<any> {
    return this.delete(id);
  }
}
