import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, catchError, tap, map } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';
import { Cart, CartItem } from '../models/api.models';

const LOCAL_CART_KEY = 'local_cart';

@Injectable({ providedIn: 'root' })
export class CartService {

  private apiUrl    = `${environment.apiUrl}/cart`;
  private isBrowser: boolean;

  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  cart$  = this.cartSubject.asObservable();

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

  // ── Cart state ────────────────────────────────────────────────────────────

  getItems():    CartItem[] { return this.cartSubject.value; }
  getItemCount(): number    { return this.cartSubject.value.reduce((s, i) => s + i.quantity, 0); }
  getSubtotal():  number    { return this.cartSubject.value.reduce((s, i) => s + i.price * i.quantity, 0); }

  addItem(item: CartItem): void {
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
      this.http.post(`${this.apiUrl}/items`, item).pipe(
        catchError(e => { console.warn('Cart add failed silently:', e.status); return of(null); })
      ).subscribe();
    }
  }

  removeItem(productId: string, type: 'PURCHASE' | 'RENTAL' = 'PURCHASE'): void {
    const current = this.cartSubject.value.filter(
      i => !(i.productId === productId && i.type === type)
    );
    this.cartSubject.next(current);
    this.saveLocalCart(current);

    if (this.isLoggedIn()) {
      this.http.delete(`${this.apiUrl}/items/${productId}`).pipe(
        catchError(e => { console.warn('Cart remove failed silently:', e.status); return of(null); })
      ).subscribe();
    }
  }

  updateQuantity(productId: string, quantity: number, type: 'PURCHASE' | 'RENTAL' = 'PURCHASE'): void {
    if (quantity <= 0) { this.removeItem(productId, type); return; }
    const current = this.cartSubject.value.map(i =>
      i.productId === productId && i.type === type ? { ...i, quantity } : i
    );
    this.cartSubject.next(current);
    this.saveLocalCart(current);
  }

  clearCart(): void {
    this.cartSubject.next([]);
    this.clearLocalCart();
    if (this.isLoggedIn()) {
      this.http.delete(`${this.apiUrl}`).pipe(
        catchError(e => { console.warn('Cart clear failed silently:', e.status); return of(null); })
      ).subscribe();
    }
  }

  // ── Called after login — NO /cart/sync endpoint ───────────────────────────

  /**
   * After login: fetch the server cart, merge with local cart, update state.
   * If the server cart endpoint fails (404/500), silently keep the local cart.
   * ✅ Never calls /cart/sync — that endpoint doesn't exist in the backend.
   */
  syncCartAfterLogin(): void {
    if (!this.isLoggedIn()) return;

    const localItems = [...this.cartSubject.value];

    this.http.get<any>(`${this.apiUrl}`).pipe(
      catchError(e => {
        console.warn(`Cart fetch after login failed (${e.status}) — keeping local cart`);
        return of(null);
      })
    ).subscribe(response => {
      if (response === null) return;  // server unavailable — keep local cart

      const serverItems: CartItem[] =
        response?.items          ??   // { items: [...] }
        response?.data?.items    ??   // { success, data: { items: [...] } }
        [];

      // Merge: server wins for existing items, add local-only items on top
      const merged = [...serverItems];
      for (const local of localItems) {
        const exists = merged.find(s => s.productId === local.productId && s.type === local.type);
        if (!exists) merged.push(local);
      }

      this.cartSubject.next(merged);
      this.saveLocalCart(merged);

      // Push local-only items to server
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
}
