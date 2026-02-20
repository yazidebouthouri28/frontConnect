import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Category, CreateCategoryDto } from '../models/api.models';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = `${environment.apiUrl}/categories`;

  constructor(private http: HttpClient) {}

  private extractData<T>(response: ApiResponse<T>): T {
    return response.data ?? ([] as any);
  }

  getAll(): Observable<Category[]> {
    return this.http.get<ApiResponse<Category[]>>(this.apiUrl)
      .pipe(map(res => this.extractData(res)));
  }

  getById(id: string): Observable<Category> {
    return this.http.get<ApiResponse<Category>>(`${this.apiUrl}/${id}`)
      .pipe(map(res => this.extractData(res)));
  }

  create(category: CreateCategoryDto): Observable<Category> {
    return this.http.post<ApiResponse<Category>>(this.apiUrl, category)
      .pipe(map(res => this.extractData(res)));
  }

  update(id: string, category: Partial<CreateCategoryDto>): Observable<Category> {
    return this.http.put<ApiResponse<Category>>(`${this.apiUrl}/${id}`, category)
      .pipe(map(res => this.extractData(res)));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`)
      .pipe(map(() => undefined));
  }

  getSubcategories(parentId: string): Observable<Category[]> {
    return this.http.get<ApiResponse<Category[]>>(`${this.apiUrl}/${parentId}/subcategories`)
      .pipe(map(res => this.extractData(res)));
  }
}
