import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface CartItem {
    id: number;
    name: string;
    image: string;
    type: 'Purchase' | 'Rental';
    rentalDuration?: string;
    quantity: number;
    price: number;
}

import { Location } from '@angular/common';

@Component({
    selector: 'app-cart',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './cart.component.html',
    styleUrls: ['./cart.component.css']
})
export class CartComponent {
    constructor(private location: Location) { }

    goBack() {
        this.location.back();
    }

    cartItems: CartItem[] = [
        {
            id: 1,
            name: 'Waterproof Hiking Boots - Men\'s',
            image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1080',
            type: 'Purchase',
            quantity: 2,
            price: 286.20
        },
        {
            id: 2,
            name: 'Camping Cookware Set - 4 Pieces',
            image: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?q=80&w=1080',
            type: 'Rental',
            rentalDuration: '7 days',
            quantity: 3,
            price: 36.00
        }
    ];

    walletBalance = 250.00;
    shipping = 15.00;
    taxRate = 0.10;

    get subtotal(): number {
        return this.cartItems.reduce((acc, item) => acc + item.price, 0);
    }

    get tax(): number {
        return this.subtotal * this.taxRate;
    }

    get total(): number {
        return this.subtotal + this.shipping + this.tax;
    }

    get pointsToEarn(): number {
        return Math.floor(this.total);
    }

    incrementQuantity(item: CartItem) {
        item.quantity++;
        // In a real app, unit price would be separate from total line price, 
        // but for this mock we'll just adjust the price based on ratio or keep it simple
        // Let's assume 'price' in the mock is the line total for simplicity of the screenshot matching
        // For functionality, we'd want unit price. Let's infer unit price.
        const unitPrice = item.price / (item.quantity - 1);
        item.price += unitPrice;
    }

    decrementQuantity(item: CartItem) {
        if (item.quantity > 1) {
            const unitPrice = item.price / item.quantity;
            item.quantity--;
            item.price -= unitPrice;
        }
    }

    removeItem(item: CartItem) {
        this.cartItems = this.cartItems.filter(i => i.id !== item.id);
    }

    clearCart() {
        this.cartItems = [];
    }
}
