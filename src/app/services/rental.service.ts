import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Rental } from '../models/api.models';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class RentalService {
  private apiUrl = `${environment.apiUrl}/rentals`;

  constructor(private http: HttpClient) { }

  private extractData<T>(response: ApiResponse<T>): T {
    return response.data ?? ([] as any);
  }

  getAll(): Observable<Rental[]> {
    return this.http.get<ApiResponse<Rental[]>>(this.apiUrl)
      .pipe(map(res => this.extractData(res)));
  }

  getById(id: string): Observable<Rental> {
    return this.http.get<ApiResponse<Rental>>(`${this.apiUrl}/${id}`)
      .pipe(map(res => this.extractData(res)));
  }

  getSellerRentals(): Observable<Rental[]> {
    return this.http.get<ApiResponse<Rental[]>>(`${this.apiUrl}/seller`)
      .pipe(map(res => this.extractData(res)));
  }

  markReturned(id: string): Observable<Rental> {
    return this.http.post<ApiResponse<Rental>>(`${this.apiUrl}/${id}/return`, {})
      .pipe(map(res => this.extractData(res)));
  }

  extend(id: string, data: { additionalDays: number }): Observable<Rental> {
    return this.http.post<ApiResponse<Rental>>(`${this.apiUrl}/${id}/extend`, data)
      .pipe(map(res => this.extractData(res)));
  }
}
