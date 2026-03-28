import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../models/api.models';
import { WalletService } from '../../services/wallet.service';
import { PointsService } from '../../services/points';
import {FormsModule} from '@angular/forms';

@Component({
    selector: 'app-cart',
    standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
    templateUrl: './cart.component.html',
    styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
    cartItems: CartItem[] = [];
    walletBalance :number=0 ;
    userId=1;
    shipping = 15.00;
    taxRate = 0.10;
    loyaltyPoints :number=0;
  usePoints: boolean = false;

    constructor(
        private location: Location,
        private router: Router,
        private cartService: CartService,
         private walletService: WalletService,
        private pointsService: PointsService
    ) {}

    ngOnInit(): void {
        // Subscribe to cart updates
        this.cartService.cart$.subscribe(items => {
            this.cartItems = items;
        });
      this.walletService.getBalance(this.userId).subscribe((res: any) => {
        this.walletBalance = res;
      });
      this.pointsService.getPoints(this.userId).subscribe(res => {
        this.loyaltyPoints = res;
      });
    }

    goBack() {
        this.location.back();
    }

    get subtotal(): number {
        return this.cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
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
        this.cartService.updateQuantity(item.productId, item.quantity + 1).subscribe();
    }

    decrementQuantity(item: CartItem) {
        if (item.quantity > 1) {
            this.cartService.updateQuantity(item.productId, item.quantity - 1).subscribe();
        }
    }

  addFunds() {
    this.walletService.deposit(this.userId, 50, "Add funds")
      .subscribe(res => {
        console.log("Deposit OK", res);
        this.refreshBalance();
      });
  }
  withdrawFunds() {
    this.walletService.withdraw(this.userId, 20, "Withdraw")
      .subscribe(res => {
        console.log("Withdraw OK", res);
        this.refreshBalance();
      });
  }
  refreshBalance() {
    this.walletService.getBalance(this.userId)
      .subscribe((res: any) => {
        this.walletBalance = res;
      });
  }

    removeItem(item: CartItem) {
        this.cartService.removeFromCart(item.productId).subscribe();
    }

    clearCart() {
        if (confirm('Are you sure you want to clear your cart?')) {
            this.cartService.clearCart().subscribe();
        }
    }

  proceedToCheckout() {

    let finalAmount = this.total;

    if (this.usePoints) {
      finalAmount = this.total - this.loyaltyPoints;
      if (finalAmount < 0) finalAmount = 0;
    }

    if (this.walletBalance < finalAmount) {
      alert("Solde insuffisant !");
      return;
    }

    this.walletService.withdraw(this.userId, finalAmount, "Payment with points")
      .subscribe(res => {
        alert("Paiement réussi !");
        this.refreshBalance();
      });
  }
}
