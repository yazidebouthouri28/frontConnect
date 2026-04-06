// src/app/services/wallet.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Wallet {
  id: number;
  userId: number;
  userName: string;
  balance: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: number;
  transactionNumber: string;
  amount: number;
  type: string;
  status: string;
  description: string;
  balanceBefore: number;
  balanceAfter: number;
  createdAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class WalletService {
  private apiUrl = `${environment.apiUrl}/api/wallets`;

  constructor(private http: HttpClient) { }

  private extractData<T>(response: ApiResponse<T>): T {
    return response.data ?? ({} as any);
  }

  private getUserId(): number {
    try {
      return parseInt(localStorage.getItem('user_id') || '1');
    } catch {
      return 1;
    }
  }

  getMyWallet(): Observable<Wallet> {
    const userId = this.getUserId();
    return this.http.get<ApiResponse<Wallet>>(`${this.apiUrl}/user/${userId}`)
      .pipe(map(res => this.extractData(res)));
  }

  getBalance(): Observable<number> {
    const userId = this.getUserId();
    return this.http.get<ApiResponse<number>>(`${this.apiUrl}/user/${userId}/balance`)
      .pipe(map(res => this.extractData(res)));
  }

  addFunds(amount: number): Observable<Wallet> {
    const userId = this.getUserId();
    return this.http.post<ApiResponse<Wallet>>(`${this.apiUrl}/user/${userId}/add-funds?amount=${amount}`, {})
      .pipe(map(res => this.extractData(res)));
  }

  deductFunds(amount: number): Observable<Wallet> {
    const userId = this.getUserId();
    return this.http.post<ApiResponse<Wallet>>(`${this.apiUrl}/user/${userId}/deduct-funds?amount=${amount}`, {})
      .pipe(map(res => this.extractData(res)));
  }

  getTransactions(page: number = 0, size: number = 10): Observable<any> {
    const userId = this.getUserId();
    return this.http.get<ApiResponse<any>>(`${environment.apiUrl}/api/transactions/user/${userId}?page=${page}&size=${size}`)
      .pipe(map(res => this.extractData(res)));
  }
  withdraw(data: { amount: number; bankAccount: string }): Observable<any> {
    const userId = this.getUserId();
    return this.http.post(`${this.apiUrl}/user/${userId}/withdraw`, data);
  }
}
