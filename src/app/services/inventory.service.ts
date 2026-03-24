import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Inventory, StockMovement, CreateStockMovementDto } from '../models/api.models';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private apiUrl = `${environment.apiUrl}/inventory`;

  constructor(private http: HttpClient) {}

  private extractData<T>(response: ApiResponse<T>): T {
    return response.data ?? ([] as any);
  }

  getAll(params?: {
    warehouseId?: string;
    productId?: string;
    lowStockOnly?: boolean;
  }): Observable<Inventory[]> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    return this.http.get<ApiResponse<Inventory[]>>(this.apiUrl, { params: httpParams })
      .pipe(map(res => this.extractData(res)));
  }

  getById(id: string): Observable<Inventory> {
    return this.http.get<ApiResponse<Inventory>>(`${this.apiUrl}/${id}`)
      .pipe(map(res => this.extractData(res)));
  }

  getByProduct(productId: string): Observable<Inventory[]> {
    return this.http.get<ApiResponse<Inventory[]>>(`${this.apiUrl}/product/${productId}`)
      .pipe(map(res => this.extractData(res)));
  }

  updateStock(id: string, data: { currentStock: number; lowStockThreshold?: number }): Observable<Inventory> {
    return this.http.patch<ApiResponse<Inventory>>(`${this.apiUrl}/${id}`, data)
      .pipe(map(res => this.extractData(res)));
  }

  getLowStock(): Observable<Inventory[]> {
    return this.getAll({ lowStockOnly: true });
  }

  // Stock Movements
  getMovements(params?: {
    productId?: string;
    warehouseId?: string;
    type?: string;
  }): Observable<StockMovement[]> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    return this.http.get<ApiResponse<StockMovement[]>>(`${this.apiUrl}/movements`, { params: httpParams })
      .pipe(map(res => this.extractData(res)));
  }

  createMovement(movement: CreateStockMovementDto): Observable<StockMovement> {
    return this.http.post<ApiResponse<StockMovement>>(`${this.apiUrl}/movements`, movement)
      .pipe(map(res => this.extractData(res)));
  }
}
