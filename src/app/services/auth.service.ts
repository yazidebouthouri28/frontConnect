import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of, map } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../models/api.models';

// Backend wraps responses in this format
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private tokenKey = 'auth_token';
  private userKey = 'current_user';
  private isBrowser: boolean;

  currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.loadStoredUser();
  }

  private loadStoredUser(): void {
    if (this.isBrowser) {
      const token = localStorage.getItem(this.tokenKey);
      const userJson = localStorage.getItem(this.userKey);
      if (token && userJson) {
        try {
          const user = JSON.parse(userJson);
          this.currentUserSubject.next(user);
        } catch {
          this.logout();
        }
      }
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    // Backend expects emailOrUsername instead of email
    const loginData = {
      emailOrUsername: credentials.email,
      password: credentials.password
    };
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/login`, loginData).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message || 'Login failed');
        }
        return this.transformAuthResponse(response.data);
      }),
      tap(authResponse => this.handleAuthSuccess(authResponse)),
      catchError(error => {
        const message = error.error?.message || error.message || 'Login failed';
        throw new Error(message);
      })
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/register`, data).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message || 'Registration failed');
        }
        return this.transformAuthResponse(response.data);
      }),
      tap(authResponse => this.handleAuthSuccess(authResponse)),
      catchError(error => {
        const message = error.error?.message || error.message || 'Registration failed';
        throw new Error(message);
      })
    );
  }

  private transformAuthResponse(data: any): AuthResponse {
    // Transform backend response to AuthResponse format
    const user: User = {
      id: data.userId || data.id,
      name: data.name || data.username,
      username: data.username,
      email: data.email,
      phone: data.phone,
      address: data.address,
      country: data.country,
      loyaltyPoints: data.loyaltyPoints || 0,
      role: data.role || 'CLIENT',
      createdAt: data.createdAt || new Date().toISOString()
    };
    console.log('Auth Response - User:', user);
    return { token: data.token, user };
  }

  private handleAuthSuccess(response: AuthResponse): void {
    if (this.isBrowser) {
      localStorage.setItem(this.tokenKey, response.token);
      localStorage.setItem(this.userKey, JSON.stringify(response.user));
    }
    this.currentUserSubject.next(response.user);
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
    }
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    if (this.isBrowser) {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    // Check token expiration
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000; // Convert to milliseconds
      if (Date.now() >= expiry) {
        this.logout();
        return false;
      }
      return true;
    } catch {
      return true; // If we can't parse, assume it's valid
    }
  }

  // Check if token will expire soon (within 5 minutes)
  isTokenExpiringSoon(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000;
      const fiveMinutes = 5 * 60 * 1000;
      return Date.now() >= (expiry - fiveMinutes);
    } catch {
      return false;
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  isSeller(): boolean {
    return this.hasRole('SELLER');
  }

  isClient(): boolean {
    return this.hasRole('CLIENT');
  }

  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }
}
