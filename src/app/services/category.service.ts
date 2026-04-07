import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_BASE } from './product.service';

const unwrap = (res: any) => res?.data?.content || res?.data || res || [];
const unwrapOne = (res: any) => res?.data || res;

// Matches CategoryRequest on the backend
export interface CategoryRequest {
  name: string;
  description?: string;
  /** Backend field is 'image' (not 'icon') for the URL/path */
  image?: string;
  slug?: string;
  displayOrder?: number;
  isActive?: boolean;
  parentId?: string;
}

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private url = `${API_BASE}/categories`;

  constructor(private http: HttpClient) {}

  /** GET /api/categories */
  getAll(): Observable<any[]> {
    return this.http.get<any>(this.url).pipe(
      map(res => {
        const list = unwrap(res);
        // Normalize: map 'image' field to 'icon' for frontend display
        return list.map((cat: any) => ({
          ...cat,
          icon: cat.icon || cat.image || '📦',
        }));
      })
    );
  }

  /** GET /api/categories/active */
  getActive(): Observable<any[]> {
    return this.http.get<any>(`${this.url}/active`).pipe(map(unwrap));
  }

  /** GET /api/categories/root */
  getRoots(): Observable<any[]> {
    return this.http.get<any>(`${this.url}/root`).pipe(map(unwrap));
  }

  /** GET /api/categories/{id} */
  getById(id: string): Observable<any> {
    return this.http.get<any>(`${this.url}/${id}`).pipe(map(unwrapOne));
  }

  /** GET /api/categories/slug/{slug} */
  getBySlug(slug: string): Observable<any> {
    return this.http.get<any>(`${this.url}/slug/${slug}`).pipe(map(unwrapOne));
  }

  /** GET /api/categories/{id}/subcategories */
  getSubcategories(id: string): Observable<any[]> {
    return this.http.get<any>(`${this.url}/${id}/subcategories`).pipe(map(unwrap));
  }

  /**
   * POST /api/categories
   * Backend @RequestBody CategoryRequest: name, description, image, slug, displayOrder, isActive, parentId
   *
   * Frontend forms use 'icon' (emoji) — we keep it in the payload as a
   * display hint but the backend stores 'image'. The icon emoji is kept
   * locally; the backend returns 'image' which we re-map to 'icon' in getAll().
   */
  create(data: { name: string; description?: string; icon?: string; image?: string; slug?: string; parentId?: string }): Observable<any> {
    const payload: CategoryRequest = {
      name: data.name,
      description: data.description,
      image: data.image || data.icon, // send icon emoji as image if no real URL
      slug: data.slug,
      isActive: true,
      parentId: data.parentId,
    };
    return this.http.post<any>(this.url, payload).pipe(map(unwrapOne));
  }

  /**
   * PUT /api/categories/{id}
   */
  update(id: string, data: { name: string; description?: string; icon?: string; image?: string; slug?: string }): Observable<any> {
    const payload: CategoryRequest = {
      name: data.name,
      description: data.description,
      image: data.image || data.icon,
      slug: data.slug,
    };
    return this.http.put<any>(`${this.url}/${id}`, payload).pipe(map(unwrapOne));
  }

  /**
   * DELETE /api/categories/{id}  (soft delete via isActive = false)
   */
  delete(id: string): Observable<any> {
    return this.http.delete<any>(`${this.url}/${id}`);
  }
}
