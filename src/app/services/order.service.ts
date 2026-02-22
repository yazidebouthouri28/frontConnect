import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Order, CreateOrderDto } from '../models/api.models';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  private extractData<T>(response: ApiResponse<T>): T {
    return response.data ?? ([] as any);
  }

  getAll(params?: {
    status?: string;
    type?: string;
    customerId?: string;
    sellerId?: string;
  }): Observable<Order[]> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    return this.http.get<ApiResponse<Order[]>>(this.apiUrl, { params: httpParams })
      .pipe(map(res => this.extractData(res)));
  }

  getById(id: string): Observable<Order> {
    return this.http.get<ApiResponse<Order>>(`${this.apiUrl}/${id}`)
      .pipe(map(res => this.extractData(res)));
  }

  create(order: CreateOrderDto): Observable<Order> {
    return this.http.post<ApiResponse<Order>>(this.apiUrl, order)
      .pipe(map(res => this.extractData(res)));
  }

  updateStatus(id: string, status: string): Observable<Order> {
    return this.http.patch<ApiResponse<Order>>(`${this.apiUrl}/${id}/status`, { status })
      .pipe(map(res => this.extractData(res)));
  }

  cancel(id: string): Observable<Order> {
    return this.updateStatus(id, 'CANCELLED');
  }

  getMyOrders(): Observable<Order[]> {
    return this.http.get<ApiResponse<Order[]>>(`${this.apiUrl}/my-orders`)
      .pipe(map(res => this.extractData(res)));
  }

  getSellerOrders(): Observable<Order[]> {
    return this.http.get<ApiResponse<Order[]>>(`${this.apiUrl}/seller-orders`)
      .pipe(map(res => this.extractData(res)));
  }

  addTracking(id: string, trackingNumber: string, estimatedDelivery?: string): Observable<Order> {
    return this.http.patch<ApiResponse<Order>>(`${this.apiUrl}/${id}/tracking`, {
      trackingNumber,
      estimatedDelivery
    }).pipe(map(res => this.extractData(res)));
  }
}
