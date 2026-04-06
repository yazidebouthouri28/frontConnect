import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, catchError, map } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';
import { CartItem } from '../models/api.models';

const LOCAL_CART_KEY = 'local_cart';

@Injectable({ providedIn: 'root' })
export class CartService {

  private apiUrl = `${environment.apiUrl}/api/cart`;
  private isBrowser: boolean;

  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  cart$ = this.cartSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.loadLocalCart();
  }

  // ── localStorage helpers ──────────────────────────────────────────────────

  private loadLocalCart(): void {
    if (!this.isBrowser) return;
    try {
      const raw = localStorage.getItem(LOCAL_CART_KEY);
      if (raw) this.cartSubject.next(JSON.parse(raw));
    } catch { /* ignore */ }
  }

  private saveLocalCart(items: CartItem[]): void {
    if (!this.isBrowser) return;
    try { localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items)); } catch { /* ignore */ }
  }

  private clearLocalCart(): void {
    if (!this.isBrowser) return;
    try { localStorage.removeItem(LOCAL_CART_KEY); } catch { /* ignore */ }
  }

  private isLoggedIn(): boolean {
    if (!this.isBrowser) return false;
    try { return !!localStorage.getItem('auth_token'); } catch { return false; }
  }

  private getUserId(): number {
    try {
      return parseInt(localStorage.getItem('user_id') || '1');
    } catch {
      return 1;
    }
  }

  // ── Cart state ────────────────────────────────────────────────────────────

  getItems(): CartItem[] { return this.cartSubject.value; }
  getItemCount(): number { return this.cartSubject.value.reduce((s, i) => s + i.quantity, 0); }
  getSubtotal(): number { return this.cartSubject.value.reduce((s, i) => s + i.price * i.quantity, 0); }

  // ── Core methods — all return Observable<void> so .subscribe() always works ──

  addItem(item: CartItem): Observable<void> {
    const current = [...this.cartSubject.value];
    const idx = current.findIndex(i => i.productId === item.productId && i.type === item.type);
    if (idx >= 0) {
      current[idx] = { ...current[idx], quantity: current[idx].quantity + item.quantity };
    } else {
      current.push(item);
    }
    this.cartSubject.next(current);
    this.saveLocalCart(current);

    if (this.isLoggedIn()) {
      return this.http.post<any>(`${this.apiUrl}/items`, item).pipe(
        map(() => void 0),
        catchError(e => { console.warn('Cart add failed silently:', e.status); return of(void 0); })
      );
    }
    return of(void 0);
  }

  addToCart(item: CartItem): Observable<void> {
    return this.addItem(item);
  }

  removeItem(productId: string, type: 'PURCHASE' | 'RENTAL' = 'PURCHASE'): Observable<void> {
    const current = this.cartSubject.value.filter(
      i => !(i.productId === productId && i.type === type)
    );
    this.cartSubject.next(current);
    this.saveLocalCart(current);

    if (this.isLoggedIn()) {
      return this.http.delete<any>(`${this.apiUrl}/items/${productId}`).pipe(
        map(() => void 0),
        catchError(e => { console.warn('Cart remove failed silently:', e.status); return of(void 0); })
      );
    }
    return of(void 0);
  }

  removeFromCart(productId: string, type: 'PURCHASE' | 'RENTAL' = 'PURCHASE'): Observable<void> {
    return this.removeItem(productId, type);
  }

  updateQuantity(
    productId: string,
    quantity: number,
    type: 'PURCHASE' | 'RENTAL' = 'PURCHASE'
  ): Observable<void> {
    if (quantity <= 0) return this.removeItem(productId, type);

    const current = this.cartSubject.value.map(i =>
      i.productId === productId && i.type === type ? { ...i, quantity } : i
    );
    this.cartSubject.next(current);
    this.saveLocalCart(current);
    return of(void 0);
  }

  clearCart(): Observable<void> {
    this.cartSubject.next([]);
    this.clearLocalCart();

    if (this.isLoggedIn()) {
      return this.http.delete<any>(`${this.apiUrl}`).pipe(
        map(() => void 0),
        catchError(e => { console.warn('Cart clear failed silently:', e.status); return of(void 0); })
      );
    }
    return of(void 0);
  }

  // ── Called after login ────────────────────────────────────────────────────

  syncCartAfterLogin(): void {
    if (!this.isLoggedIn()) return;

    const localItems = [...this.cartSubject.value];

    this.http.get<any>(`${this.apiUrl}`).pipe(
      catchError(e => {
        console.warn(`Cart fetch after login failed (${e.status}) — keeping local cart`);
        return of(null);
      })
    ).subscribe(response => {
      if (response === null) return;

      const serverItems: CartItem[] =
        response?.items ??
        response?.data?.items ??
        [];

      const merged = [...serverItems];
      for (const local of localItems) {
        const exists = merged.find(s => s.productId === local.productId && s.type === local.type);
        if (!exists) merged.push(local);
      }

      this.cartSubject.next(merged);
      this.saveLocalCart(merged);

      const newItems = localItems.filter(
        l => !serverItems.find(s => s.productId === l.productId && s.type === l.type)
      );
      for (const item of newItems) {
        this.http.post(`${this.apiUrl}/items`, item).pipe(
          catchError(e => { console.warn('Cart push failed silently:', e.status); return of(null); })
        ).subscribe();
      }

      this.clearLocalCart();
    });
  }

  // ── Fetch for cart page ───────────────────────────────────────────────────

  fetchCart(): Observable<CartItem[]> {
    if (!this.isLoggedIn()) return of(this.cartSubject.value);

    return this.http.get<any>(`${this.apiUrl}`).pipe(
      map(response => {
        const items: CartItem[] = response?.items ?? response?.data?.items ?? [];
        this.cartSubject.next(items);
        return items;
      }),
      catchError(e => {
        console.warn(`fetchCart failed (${e.status}) — returning local cart`);
        return of(this.cartSubject.value);
      })
    );
  }

  // ── Coupon methods ─────────────────────────────────────────────────────────

  /**
   * Appliquer un code promo au panier
   */
  applyCoupon(couponCode: string): Observable<any> {
    if (!this.isLoggedIn()) {
      console.warn('Apply coupon only available for logged-in users');
      return of(null);
    }
    return this.http.post<any>(`${this.apiUrl}/apply-coupon?couponCode=${couponCode}`, {})
      .pipe(
        map(response => response),
        catchError(e => {
          console.warn('Apply coupon failed:', e.status);
          throw e;
        })
      );
  }

  /**
   * Supprimer le code promo appliqué
   */
  removeCoupon(): Observable<any> {
    if (!this.isLoggedIn()) {
      return of(null);
    }
    return this.http.delete<any>(`${this.apiUrl}/remove-coupon`)
      .pipe(
        catchError(e => {
          console.warn('Remove coupon failed:', e.status);
          return of(null);
        })
      );
  }

  /**
   * Appliquer la meilleure promotion automatique
   */
  applyBestPromotion(): Observable<any> {
    if (!this.isLoggedIn()) {
      return of(null);
    }
    return this.http.post<any>(`${this.apiUrl}/apply-best-promotion`, {})
      .pipe(
        catchError(e => {
          console.warn('Apply best promotion failed:', e.status);
          return of(null);
        })
      );
  }

  // ── Checkout method ─────────────────────────────────────────────────────────

  /**
   * Passer commande et payer avec le wallet
   */
  checkout(checkoutData: {
    shippingAddress: string;
    shippingCity: string;
    shippingCountry: string;
    shippingPhone: string;
    notes?: string;
    shippingCost?: number;
  }): Observable<any> {
    if (!this.isLoggedIn()) {
      throw new Error('You must be logged in to checkout');
    }
    return this.http.post<any>(`${this.apiUrl}/checkout`, checkoutData)
      .pipe(
        catchError(e => {
          console.error('Checkout failed:', e);
          throw e;
        })
      );
  }

  // ── Cart summary method ─────────────────────────────────────────────────────

  /**
   * Récupérer le résumé du panier (totaux)
   */
  getCartSummary(): Observable<any> {
    if (!this.isLoggedIn()) {
      const items = this.cartSubject.value;
      const subtotal = this.getSubtotal();
      return of({
        itemCount: this.getItemCount(),
        subtotal: subtotal,
        discountAmount: 0,
        total: subtotal
      });
    }
    return this.http.get<any>(`${this.apiUrl}/summary`)
      .pipe(
        catchError(e => {
          console.warn('Get cart summary failed:', e.status);
          return of(null);
        })
      );
  }

  // ── Utility methods ─────────────────────────────────────────────────────────

  getImageUrl(imagePath: string | undefined | null): string {
    if (!imagePath || typeof imagePath !== 'string') return '';
    if (imagePath.startsWith('http') || imagePath.startsWith('data:') || imagePath.startsWith('blob:')) {
      return imagePath;
    }
    let path = imagePath.trim().replace(/^\/+/, '');
    if (path.startsWith('uploads/')) path = path.substring(8);
    if (!path) return '';
    const baseUrl = environment.apiUrl.replace('/api', '').replace(/\/$/, '');
    return `${baseUrl}/uploads/${path}`;
  }


}
