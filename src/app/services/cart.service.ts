// SAVE TO: src/app/services/cart.service.ts

import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, catchError, map } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';
import { CartItem } from '../models/api.models';

const LOCAL_CART_KEY = 'local_cart';

export interface CartItemWithId extends CartItem {
  itemId?: string;
}

@Injectable({ providedIn: 'root' })
export class CartService {

  // environment.apiUrl = 'http://localhost:8088/api'  (already has /api)
  // → resolves to 'http://localhost:8088/api/cart'  ✓
  private apiUrl = `${environment.apiUrl}/cart`;
  private isBrowser: boolean;

  private cartSubject = new BehaviorSubject<CartItemWithId[]>([]);
  cart$ = this.cartSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.loadLocalCart();
  }

  // ── localStorage ──────────────────────────────────────────────────────────

  private loadLocalCart(): void {
    if (!this.isBrowser) return;
    try {
      const raw = localStorage.getItem(LOCAL_CART_KEY);
      if (raw) this.cartSubject.next(JSON.parse(raw));
    } catch { }
  }

  private saveLocalCart(items: CartItemWithId[]): void {
    if (!this.isBrowser) return;
    try { localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items)); } catch { }
  }

  private clearLocalCart(): void {
    if (!this.isBrowser) return;
    try { localStorage.removeItem(LOCAL_CART_KEY); } catch { }
  }

  private getCurrentUserId(): string | null {
    if (!this.isBrowser) return null;
    for (const key of ['current_user', 'user', 'auth_user', 'loggedUser']) {
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const id = JSON.parse(raw)?.id;
          if (id) return String(id);
        }
      } catch { }
    }
    return null;
  }

  private isLoggedIn(): boolean {
    if (!this.isBrowser) return false;
    try { return !!localStorage.getItem('auth_token'); } catch { return false; }
  }

  // ── State ─────────────────────────────────────────────────────────────────

  getItems():     CartItemWithId[] { return this.cartSubject.value; }
  getItemCount(): number           { return this.cartSubject.value.reduce((s, i) => s + i.quantity, 0); }
  getSubtotal():  number           { return this.cartSubject.value.reduce((s, i) => s + i.price * i.quantity, 0); }

  // ── Add ───────────────────────────────────────────────────────────────────

  /**
   * POST /api/cart/{userId}/items
   *
   * Backend CartItemRequest:
   *   @NotNull UUID productId    ← must be valid UUID string
   *   @NotNull @Min(1) Integer quantity
   *   String selectedVariant, selectedColor, selectedSize  (optional)
   */
  addToCart(item: CartItemWithId): Observable<void> {
    // Optimistic local update
    const current = [...this.cartSubject.value];
    const idx = current.findIndex(
      i => i.productId === item.productId && i.type === item.type
    );
    if (idx >= 0) {
      current[idx] = { ...current[idx], quantity: current[idx].quantity + item.quantity };
    } else {
      current.push({ ...item });
    }
    this.cartSubject.next(current);
    this.saveLocalCart(current);

    const userId = this.getCurrentUserId();
    if (this.isLoggedIn() && userId) {
      // CartItemRequest expects productId as UUID — send as-is (string UUID)
      const body = {
        productId: item.productId,   // UUID string — backend deserializes UUID from string
        quantity:  item.quantity,    // Integer @Min(1)
      };
      return this.http.post<any>(`${this.apiUrl}/${userId}/items`, body).pipe(
        map(res => { this.syncFromServerResponse(res); }),
        catchError(e => {
          console.warn('Cart add failed silently:', e.status, e.error);
          return of(void 0);
        })
      );
    }
    return of(void 0);
  }

  addItem = (item: CartItemWithId) => this.addToCart(item);

  // ── Update ────────────────────────────────────────────────────────────────

  /**
   * PUT /api/cart/{userId}/items/{itemId}?quantity=N
   */
  updateQuantity(
    productId: string,
    quantity: number,
    type: 'PURCHASE' | 'RENTAL' = 'PURCHASE'
  ): Observable<void> {
    if (quantity <= 0) return this.removeFromCart(productId, type);

    const current = this.cartSubject.value.map(i =>
      i.productId === productId && i.type === type ? { ...i, quantity } : i
    );
    this.cartSubject.next(current);
    this.saveLocalCart(current);

    const userId = this.getCurrentUserId();
    if (this.isLoggedIn() && userId) {
      const cartItem = current.find(i => i.productId === productId && i.type === type);
      const itemId = cartItem?.itemId;
      if (itemId) {
        return this.http.put<any>(
          `${this.apiUrl}/${userId}/items/${itemId}`,
          null,
          { params: { quantity: quantity.toString() } }
        ).pipe(
          map(res => { this.syncFromServerResponse(res); }),
          catchError(e => { console.warn('Cart update failed:', e.status); return of(void 0); })
        );
      }
    }
    return of(void 0);
  }

  // ── Remove ────────────────────────────────────────────────────────────────

  /**
   * DELETE /api/cart/{userId}/items/{itemId}
   */
  removeFromCart(productId: string, type: 'PURCHASE' | 'RENTAL' = 'PURCHASE'): Observable<void> {
    const toRemove = this.cartSubject.value.find(
      i => i.productId === productId && i.type === type
    );
    const itemId = toRemove?.itemId;

    const updated = this.cartSubject.value.filter(
      i => !(i.productId === productId && i.type === type)
    );
    this.cartSubject.next(updated);
    this.saveLocalCart(updated);

    const userId = this.getCurrentUserId();
    if (this.isLoggedIn() && userId && itemId) {
      return this.http.delete<any>(`${this.apiUrl}/${userId}/items/${itemId}`).pipe(
        map(() => void 0),
        catchError(e => { console.warn('Cart remove failed:', e.status); return of(void 0); })
      );
    }
    return of(void 0);
  }

  removeItem = (productId: string, type: 'PURCHASE' | 'RENTAL' = 'PURCHASE') =>
    this.removeFromCart(productId, type);

  // ── Clear ─────────────────────────────────────────────────────────────────

  /**
   * DELETE /api/cart/{userId}/clear
   */
  clearCart(): Observable<void> {
    this.cartSubject.next([]);
    this.clearLocalCart();

    const userId = this.getCurrentUserId();
    if (this.isLoggedIn() && userId) {
      return this.http.delete<any>(`${this.apiUrl}/${userId}/clear`).pipe(
        map(() => void 0),
        catchError(e => { console.warn('Cart clear failed:', e.status); return of(void 0); })
      );
    }
    return of(void 0);
  }

  // ── Fetch ─────────────────────────────────────────────────────────────────

  fetchCart(): Observable<CartItemWithId[]> {
    const userId = this.getCurrentUserId();
    if (!this.isLoggedIn() || !userId) return of(this.cartSubject.value);

    return this.http.get<any>(`${this.apiUrl}/${userId}`).pipe(
      map(response => {
        const raw = response?.data || response;
        const items = this.mapServerItems(raw?.items || []);
        this.cartSubject.next(items);
        this.saveLocalCart(items);
        return items;
      }),
      catchError(() => of(this.cartSubject.value))
    );
  }

  syncCartAfterLogin(): void {
    const userId = this.getCurrentUserId();
    if (!this.isLoggedIn() || !userId) return;

    const localItems = [...this.cartSubject.value];
    this.http.get<any>(`${this.apiUrl}/${userId}`).pipe(
      catchError(() => of(null))
    ).subscribe(response => {
      if (!response) return;
      const raw = response?.data || response;
      const serverItems = this.mapServerItems(raw?.items || []);
      const merged = [...serverItems];
      for (const local of localItems) {
        if (!merged.find(s => s.productId === local.productId && s.type === local.type)) {
          merged.push(local);
        }
      }
      this.cartSubject.next(merged);
      this.saveLocalCart(merged);
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private mapServerItems(raw: any[]): CartItemWithId[] {
    return raw.map((i: any) => ({
      itemId:      String(i.id || i.itemId || ''),
      productId:   String(i.productId || i.product?.id || ''),
      productName: i.productName || i.product?.name || '',
      price:       i.price || i.unitPrice || 0,
      quantity:    i.quantity || 1,
      image:       i.image || i.product?.thumbnail || '',
      type:        (i.type || 'PURCHASE') as 'PURCHASE' | 'RENTAL',
      rentalDays:  i.rentalDays,
    }));
  }

  private syncFromServerResponse(res: any): void {
    const raw = res?.data || res;
    if (raw?.items) {
      const items = this.mapServerItems(raw.items);
      this.cartSubject.next(items);
      this.saveLocalCart(items);
    }
  }
}
