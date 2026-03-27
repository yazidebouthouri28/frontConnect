import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, catchError, map } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';

export interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  image: string;
  type: 'PURCHASE' | 'RENTAL' | 'Reservation' | 'Purchase' | 'Rental';
  rentalDays?: number;
  rentalDuration?: string;
  id?: string | number;
  name?: string;
  details?: any;
}

const LOCAL_CART_KEY = 'camp_cart';
const LOCAL_DISCOUNT_KEY = 'camp_cart_discount';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = `${environment.apiUrl}/cart`;
  private isBrowser: boolean;

  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  cartItems$ = this.cartItemsSubject.asObservable();
  cart$ = this.cartItemsSubject.asObservable(); // HEAD compatibility

  private discountSubject = new BehaviorSubject<number>(0);
  discount$ = this.discountSubject.asObservable();

  private promoCodeSubject = new BehaviorSubject<string>('');
  promoCode$ = this.promoCodeSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);

    if (this.isBrowser) {
      const savedCart = localStorage.getItem(LOCAL_CART_KEY);
      if (savedCart) {
        try {
          const items: CartItem[] = JSON.parse(savedCart);
          // Migration: ensure productId and productName are set
          const migratedItems = items.map(item => ({
            ...item,
            productId: item.productId || (item.id ? item.id.toString() : ''),
            productName: item.productName || item.name || ''
          }));
          this.cartItemsSubject.next(migratedItems);
        } catch { /* ignore */ }
      }
      const savedDiscount = localStorage.getItem(LOCAL_DISCOUNT_KEY);
      if (savedDiscount) {
        this.discountSubject.next(Number(savedDiscount));
      }
      const savedPromoCode = localStorage.getItem('camp_cart_promo_code');
      if (savedPromoCode) {
        this.promoCodeSubject.next(savedPromoCode);
      }
    }

    this.loadLocalCart(); // HEAD alias
  }

  private isLoggedIn(): boolean {
    if (!this.isBrowser) return false;
    try { return !!localStorage.getItem('auth_token') || !!localStorage.getItem('token'); } catch { return false; }
  }

  getCartItems(): CartItem[] {
    return this.cartItemsSubject.value;
  }

  getItems(): CartItem[] { // HEAD alias
    return this.getCartItems();
  }

  getItemCount(): number {
    return this.cartItemsSubject.value.reduce((s, i) => s + i.quantity, 0);
  }

  addItem(item: CartItem): Observable<void> | void {
    const currentItems = this.cartItemsSubject.value;
    const targetId = item.id || item.productId;

    const existingItem = currentItems.find(i =>
      (i.id === targetId || i.productId === targetId) &&
      i.type?.toUpperCase() === item.type?.toUpperCase()
    );

    // Ensure productId and productName are set before adding
    item.productId = item.productId || (item.id ? item.id.toString() : '');
    item.productName = item.productName || item.name || '';

    if (existingItem) {
      existingItem.quantity += item.quantity;
      if (item.rentalDays) existingItem.rentalDays = item.rentalDays;
      this.cartItemsSubject.next([...currentItems]);
    } else {
      this.cartItemsSubject.next([...currentItems, item]);
    }
    this.saveToStorage();

    // HEAD API sync
    if (this.isLoggedIn()) {
      return this.http.post<any>(`${this.apiUrl}/items`, item).pipe(
        map(() => void 0),
        catchError(e => { console.warn('Cart add failed silently:', e.status); return of(void 0); })
      );
    }
    return of(void 0);
  }

  addToCart(item: CartItem): Observable<void> | void {
    return this.addItem(item);
  }

  removeItem(item: CartItem): void {
    const currentItems = this.cartItemsSubject.value;
    const targetId = item.id || item.productId;
    const updatedItems = currentItems.filter(i =>
      !((i.id === targetId || i.productId === targetId) && i.type?.toUpperCase() === item.type?.toUpperCase())
    );
    this.cartItemsSubject.next(updatedItems);
    this.saveToStorage();
  }

  removeFromCart(productId: string | number, type: 'PURCHASE' | 'RENTAL' = 'PURCHASE'): Observable<void> {
    const currentItems = this.cartItemsSubject.value;
    const updatedItems = currentItems.filter(i =>
      !((i.id === productId || i.productId === productId) && i.type?.toUpperCase() === type)
    );
    this.cartItemsSubject.next(updatedItems);
    this.saveToStorage();

    if (this.isLoggedIn()) {
      return this.http.delete<any>(`${this.apiUrl}/items/${productId}`).pipe(
        map(() => void 0),
        catchError(e => { console.warn('Cart remove failed silently:', e.status); return of(void 0); })
      );
    }
    return of(void 0);
  }

  updateQuantity(item: CartItem | string | number, delta: number): Observable<void> {
    const currentItems = this.cartItemsSubject.value;
    let target: CartItem | undefined;

    if (typeof item === 'string' || typeof item === 'number') {
      // Called with productId – delta is the NEW absolute quantity
      target = currentItems.find(i => i.id === item || i.productId === item);
      if (target) {
        target.quantity = Math.max(1, delta);
      }
    } else {
      const targetId = item.id || item.productId;
      target = currentItems.find(i =>
        (i.id === targetId || i.productId === targetId) && i.type?.toUpperCase() === item.type?.toUpperCase()
      );
      if (target) {
        target.quantity = Math.max(1, target.quantity + delta);
      }
    }

    if (target) {
      this.cartItemsSubject.next([...currentItems]);
      this.saveToStorage();
    }
    return of(void 0);
  }

  clearCart(): Observable<void> {
    this.cartItemsSubject.next([]);
    this.clearDiscount();
    this.saveToStorage();

    if (this.isLoggedIn()) {
      return this.http.delete<any>(`${this.apiUrl}`).pipe(
        map(() => void 0),
        catchError(e => { console.warn('Cart clear failed silently:', e.status); return of(void 0); })
      );
    }
    return of(void 0);
  }

  getSubtotal(): number {
    return this.cartItemsSubject.value.reduce((acc, item) => {
      const nights = (item.details && item.details.nights) ? item.details.nights : 1;
      return acc + (item.price * item.quantity * nights);
    }, 0);
  }

  getDiscountAmount(): number {
    const subtotal = this.getSubtotal();
    const discountPercentage = this.discountSubject.value;
    return subtotal * (discountPercentage / 100);
  }

  getTotal(): number {
    return this.getSubtotal() - this.getDiscountAmount();
  }

  getReservationNights(): number {
    const reservation = this.cartItemsSubject.value.find(i => i.type === 'Reservation');
    if (reservation && reservation.details && reservation.details.nights) {
      return reservation.details.nights;
    }
    return 1; // Default to 1 if no reservation found
  }

  applyDiscount(percentage: number, code: string = ''): void {
    this.discountSubject.next(Math.min(100, Math.max(0, percentage)));
    this.promoCodeSubject.next(code);
    this.saveToStorage();
  }

  clearDiscount(): void {
    this.discountSubject.next(0);
    this.promoCodeSubject.next('');
    this.saveToStorage();
  }

  private saveToStorage(): void {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(this.cartItemsSubject.value));
      localStorage.setItem(LOCAL_DISCOUNT_KEY, this.discountSubject.value.toString());
      localStorage.setItem('camp_cart_promo_code', this.promoCodeSubject.value);
    } catch { /* ignore */ }
  }

  // HEAD compatibility aliases
  private loadLocalCart(): void { }
  private saveLocalCart(items: CartItem[]): void { this.saveToStorage(); }
  private clearLocalCart(): void { this.saveToStorage(); }

  getImageUrl(imagePath: string | undefined | null): string {
    if (!imagePath || typeof imagePath !== 'string') return '';

    // Handle full URLs
    if (imagePath.startsWith('http') || imagePath.startsWith('data:') || imagePath.startsWith('blob:')) {
      return imagePath;
    }

    // Clean up the path (remove leading slashes and redundant uploads/ if present)
    let path = imagePath.trim();
    while (path.startsWith('/')) {
      path = path.substring(1);
    }

    if (path.startsWith('uploads/')) {
      path = path.substring(8);
    }

    if (!path) return '';

    const baseUrl = environment.apiUrl.replace('/api', '').replace(/\/$/, '');
    return `${baseUrl}/uploads/${path}`;
  }

  syncCartAfterLogin(): void { }
  fetchCart(): Observable<CartItem[]> { return of(this.cartItemsSubject.value); }
}
