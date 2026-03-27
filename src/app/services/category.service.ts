import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

const unwrap = (res: any) => res?.data?.content || res?.data || res || [];
const unwrapOne = (res: any) => res?.data || res;

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private url = `${environment.apiUrl}/categories`;
  private adminUrl = `${environment.apiUrl}/admin/categories`;

  constructor(private http: HttpClient) { }

  getAll(): Observable<any[]> {
    return this.http.get<any>(this.url).pipe(map(unwrap));
  }

  getById(id: string): Observable<any> {
    return this.http.get<any>(`${this.url}/${id}`).pipe(map(unwrapOne));
  }

  create(data: any): Observable<any> {
    return this.http.post<any>(this.adminUrl, data).pipe(map(unwrapOne));
  }

  update(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.adminUrl}/${id}`, data).pipe(map(unwrapOne));
  }

  delete(id: string): Observable<any> {
    return this.http.delete<any>(`${this.adminUrl}/${id}`);
  }
}
