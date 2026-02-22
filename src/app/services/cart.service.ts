import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, tap, catchError, map } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';
import { CartItem, Cart } from '../models/api.models';
import { AuthService } from './auth.service';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = `${environment.apiUrl}/cart`;
  private cartItems: CartItem[] = [];
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  private isBrowser: boolean;

  cart$ = this.cartSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.loadCart();
  }

  private loadCart(): void {
    if (this.authService.isAuthenticated()) {
      this.fetchCartFromServer();
    } else {
      this.loadFromStorage();
    }
  }

  private extractCart(response: ApiResponse<Cart>): Cart | null {
    return response?.data ?? null;
  }

  private fetchCartFromServer(): void {
    this.http.get<ApiResponse<Cart>>(this.apiUrl).pipe(
      map(res => this.extractCart(res)),
      catchError(() => of(null))
    ).subscribe(cart => {
      if (cart?.items) {
        this.cartItems = cart.items;
        this.cartSubject.next([...this.cartItems]);
      }
    });
  }

  addToCart(item: CartItem): Observable<any> {
    if (this.authService.isAuthenticated()) {
      return this.http.post<ApiResponse<Cart>>(`${this.apiUrl}/add`, {
        productId: item.productId,
        quantity: item.quantity,
        type: item.type,
        rentalDays: item.rentalDays
      }).pipe(
        map(res => this.extractCart(res)),
        tap(cart => {
          if (cart?.items) {
            this.cartItems = cart.items;
            this.cartSubject.next([...this.cartItems]);
          }
        }),
        catchError(error => {
          // Fallback to local storage
          this.addToLocalCart(item);
          return of(null);
        })
      );
    } else {
      this.addToLocalCart(item);
      return of(null);
    }
  }

  private addToLocalCart(item: CartItem): void {
    const existing = this.cartItems.find(
      i => i.productId === item.productId && i.type === item.type
    );

    if (existing) {
      existing.quantity += item.quantity;
    } else {
      this.cartItems.push(item);
    }

    this.updateCart();
  }

  removeFromCart(productId: string): Observable<any> {
    if (this.authService.isAuthenticated()) {
      return this.http.delete<ApiResponse<Cart>>(`${this.apiUrl}/remove/${productId}`).pipe(
        map(res => this.extractCart(res)),
        tap(cart => {
          if (cart?.items) {
            this.cartItems = cart.items;
            this.cartSubject.next([...this.cartItems]);
          }
        }),
        catchError(() => {
          this.removeFromLocalCart(productId);
          return of(null);
        })
      );
    } else {
      this.removeFromLocalCart(productId);
      return of(null);
    }
  }

  private removeFromLocalCart(productId: string): void {
    this.cartItems = this.cartItems.filter(i => i.productId !== productId);
    this.updateCart();
  }

  updateQuantity(productId: string, quantity: number): Observable<any> {
    if (quantity <= 0) {
      return this.removeFromCart(productId);
    }

    if (this.authService.isAuthenticated()) {
      return this.http.patch<ApiResponse<Cart>>(`${this.apiUrl}/update`, { productId, quantity }).pipe(
        map(res => this.extractCart(res)),
        tap(cart => {
          if (cart?.items) {
            this.cartItems = cart.items;
            this.cartSubject.next([...this.cartItems]);
          }
        }),
        catchError(() => {
          this.updateLocalQuantity(productId, quantity);
          return of(null);
        })
      );
    } else {
      this.updateLocalQuantity(productId, quantity);
      return of(null);
    }
  }

  private updateLocalQuantity(productId: string, quantity: number): void {
    const item = this.cartItems.find(i => i.productId === productId);
    if (item) {
      item.quantity = quantity;
      this.updateCart();
    }
  }

  clearCart(): Observable<any> {
    if (this.authService.isAuthenticated()) {
      return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/clear`).pipe(
        tap(() => {
          this.cartItems = [];
          this.cartSubject.next([]);
          this.saveToStorage();
        }),
        catchError(() => {
          this.cartItems = [];
          this.updateCart();
          return of(null);
        })
      );
    } else {
      this.cartItems = [];
      this.updateCart();
      return of(null);
    }
  }

  getCartCount(): number {
    return this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }

  getCartItems(): CartItem[] {
    return [...this.cartItems];
  }

  getSubtotal(): number {
    return this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  private updateCart(): void {
    this.cartSubject.next([...this.cartItems]);
    this.saveToStorage();
  }

  private saveToStorage(): void {
    if (this.isBrowser) {
      localStorage.setItem('cart', JSON.stringify(this.cartItems));
    }
  }

  private loadFromStorage(): void {
    if (this.isBrowser) {
      const saved = localStorage.getItem('cart');
      if (saved) {
        try {
          this.cartItems = JSON.parse(saved);
          this.cartSubject.next([...this.cartItems]);
        } catch {
          this.cartItems = [];
        }
      }
    }
  }

  syncCartAfterLogin(): void {
    if (this.cartItems.length > 0) {
      // Sync local cart to server
      this.http.post<ApiResponse<Cart>>(`${this.apiUrl}/sync`, { items: this.cartItems }).pipe(
        map(res => this.extractCart(res)),
        catchError(() => of(null))
      ).subscribe(cart => {
        if (cart?.items) {
          this.cartItems = cart.items;
          this.cartSubject.next([...this.cartItems]);
        }
      });
    } else {
      this.fetchCartFromServer();
    }
  }
}
