import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface CartItem {
    id: string | number;
    name: string;
    image: string;
    type: 'Purchase' | 'Rental' | 'Reservation';
    rentalDuration?: string;
    quantity: number;
    price: number;
    details?: any;
}

@Injectable({
    providedIn: 'root'
})
export class CartService {
    private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
    cartItems$ = this.cartItemsSubject.asObservable();

    private discountSubject = new BehaviorSubject<number>(0);
    discount$ = this.discountSubject.asObservable();

    constructor() {
        // Load from local storage if needed
        const savedCart = localStorage.getItem('camp_cart');
        if (savedCart) {
            this.cartItemsSubject.next(JSON.parse(savedCart));
        }
        const savedDiscount = localStorage.getItem('camp_cart_discount');
        if (savedDiscount) {
            this.discountSubject.next(Number(savedDiscount));
        }
    }

    getCartItems(): CartItem[] {
        return this.cartItemsSubject.value;
    }

    addItem(item: CartItem): void {
        const currentItems = this.cartItemsSubject.value;
        const existingItem = currentItems.find(i => i.id === item.id && i.type === item.type);

        if (existingItem) {
            existingItem.quantity += item.quantity;
            this.cartItemsSubject.next([...currentItems]);
        } else {
            this.cartItemsSubject.next([...currentItems, item]);
        }
        this.saveToStorage();
    }

    removeItem(item: CartItem): void {
        const currentItems = this.cartItemsSubject.value;
        const updatedItems = currentItems.filter(i => !(i.id === item.id && i.type === item.type));
        this.cartItemsSubject.next(updatedItems);
        this.saveToStorage();
    }

    updateQuantity(item: CartItem, delta: number): void {
        const currentItems = this.cartItemsSubject.value;
        const target = currentItems.find(i => i.id === item.id && i.type === item.type);
        if (target) {
            target.quantity = Math.max(1, target.quantity + delta);
            this.cartItemsSubject.next([...currentItems]);
            this.saveToStorage();
        }
    }

    clearCart(): void {
        this.cartItemsSubject.next([]);
        this.clearDiscount();
        this.saveToStorage();
    }

    getSubtotal(): number {
        return this.cartItemsSubject.value.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    }
    
    getDiscountAmount(): number {
        const subtotal = this.getSubtotal();
        const discountPercentage = this.discountSubject.value;
        return subtotal * (discountPercentage / 100);
    }

    getTotal(): number {
        return this.getSubtotal() - this.getDiscountAmount();
    }
    
    applyDiscount(percentage: number): void {
        this.discountSubject.next(Math.min(100, Math.max(0, percentage)));
        this.saveToStorage();
    }
    
    clearDiscount(): void {
        this.discountSubject.next(0);
        this.saveToStorage();
    }

    private saveToStorage(): void {
        localStorage.setItem('camp_cart', JSON.stringify(this.cartItemsSubject.value));
        localStorage.setItem('camp_cart_discount', this.discountSubject.value.toString());
    }
}
