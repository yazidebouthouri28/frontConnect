import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { CartService, CartItem } from '../../services/cart.service';
import { PromotionService } from '../../modules/services/services/promotion.service';

@Component({
    selector: 'app-cart',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './cart.component.html',
    styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
    cartItems: CartItem[] = [];
    subtotal: number = 0;
    shipping: number = 0;
    tax: number = 0;
    total: number = 0;

    discountPercentage: number = 0;
    discountAmount: number = 0;
    pointsToEarn: number = 0;

    promoCode: string = '';
    applyingPromo: boolean = false;
    promoError: string = '';
    promoSuccess: string = '';

    walletBalance: number = 2500; // Mock balance

    constructor(
        private location: Location,
        private cartService: CartService,
        private promotionService: PromotionService
    ) { }

    ngOnInit(): void {
        this.cartService.cartItems$.subscribe(items => {
            this.cartItems = items;
            this.calculateTotals();
        });

        this.cartService.discount$.subscribe(discount => {
            this.discountPercentage = discount;
            this.calculateTotals();
        });
    }

    goBack() {
        this.location.back();
    }

    decrementQuantity(item: CartItem) {
        if (item.quantity > 1) {
            this.cartService.updateQuantity(item, -1);
        }
    }

    incrementQuantity(item: CartItem) {
        this.cartService.updateQuantity(item, 1);
    }

    removeItem(item: CartItem) {
        this.cartService.removeItem(item);
    }

    applyPromoCode() {
        if (!this.promoCode) return;

        this.applyingPromo = true;
        this.promoError = '';
        this.promoSuccess = '';

        this.promotionService.validateCode(this.promoCode.toUpperCase(), this.subtotal).subscribe({
            next: (promo) => {
                this.applyingPromo = false;
                if (promo && promo.isActive) {
                    const discount = promo.discountPercentage || 0;
                    this.cartService.applyDiscount(discount);
                    this.promoSuccess = `Promo code '${this.promoCode}' applied: ${discount}% off!`;
                } else {
                    this.promoError = 'This promo code is inactive or expired.';
                    this.cartService.clearDiscount();
                }
            },
            error: (err) => {
                this.applyingPromo = false;
                this.promoError = 'Invalid promo code or network error.';
                this.cartService.clearDiscount();
            }
        });
    }

    removePromoCode() {
        this.promoCode = '';
        this.cartService.clearDiscount();
        this.promoSuccess = '';
        this.promoError = '';
    }

    clearCart() {
        this.cartService.clearCart();
        this.removePromoCode();
    }

    calculateTotals() {
        this.subtotal = this.cartService.getSubtotal();
        this.discountAmount = this.cartService.getDiscountAmount();

        this.shipping = this.cartItems.length > 0 ? 15 : 0;
        // Tax on subtotal after discount
        this.tax = (this.subtotal - this.discountAmount) * 0.1;

        this.total = this.subtotal - this.discountAmount + this.shipping + this.tax;
        this.pointsToEarn = Math.floor(this.total / 10);
    }
}
