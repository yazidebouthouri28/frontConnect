import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { Product, CreateProductDto } from '../models/api.models';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  private extractData<T>(response: ApiResponse<T>): T {
    return response.data ?? ([] as any);
  }

  getAll(params?: {
    search?: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    isActive?: boolean;
    isFeatured?: boolean;
    rentalAvailable?: boolean;
    page?: number;
    limit?: number;
  }): Observable<Product[]> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    return this.http.get<ApiResponse<Product[]>>(this.apiUrl, { params: httpParams })
      .pipe(map(res => this.extractData(res)));
  }

  getById(id: string): Observable<Product> {
    return this.http.get<ApiResponse<Product>>(`${this.apiUrl}/${id}`)
      .pipe(map(res => this.extractData(res)));
  }

  create(product: CreateProductDto): Observable<Product> {
    return this.http.post<ApiResponse<Product>>(this.apiUrl, product)
      .pipe(map(res => this.extractData(res)));
  }

  update(id: string, product: Partial<CreateProductDto>): Observable<Product> {
    return this.http.put<ApiResponse<Product>>(`${this.apiUrl}/${id}`, product)
      .pipe(map(res => this.extractData(res)));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`)
      .pipe(map(() => undefined));
  }

  search(query: string): Observable<Product[]> {
    return this.http.get<ApiResponse<Product[]>>(`${this.apiUrl}/search`, {
      params: { q: query }
    }).pipe(map(res => this.extractData(res)));
  }

  getByCategory(categoryId: string): Observable<Product[]> {
    return this.http.get<ApiResponse<Product[]>>(`${this.apiUrl}/category/${categoryId}`)
      .pipe(map(res => this.extractData(res)));
  }

  getFeatured(): Observable<Product[]> {
    return this.getAll({ isFeatured: true, isActive: true });
  }

  getMyProducts(): Observable<Product[]> {
    return this.http.get<ApiResponse<Product[]>>(`${this.apiUrl}/my-products`)
      .pipe(map(res => this.extractData(res)));
  }
}
