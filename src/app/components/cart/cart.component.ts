import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

// Services
import { CartService } from '../../services/cart.service';
import { WalletService, Wallet } from '../../services/wallet.service';
import { CouponService } from '../../services/coupon.service';

// Models
import { CartItem } from '../../models/api.models';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {

  // Données
  cartItems: CartItem[] = [];
  wallet: Wallet | null = null;

  // États de chargement
  isLoading = true;
  isProcessing = false;
  isCheckingOut = false;

  // Coupon
  couponCode = '';
  couponError: string | null = null;
  couponSuccess: string | null = null;
  appliedCouponCode: string | null = null;
  discountAmount = 0;

  // Totaux
  shipping = 15.00;
  taxRate = 0.10;

  // Checkout
  showCheckoutForm = false;
  checkoutData = {
    shippingAddress: '',
    shippingCity: '',
    shippingCountry: 'Tunisie',
    shippingPhone: '',
    notes: '',
    shippingCost: 15
  };

  constructor(
    private cartService: CartService,
    private walletService: WalletService,
    private couponService: CouponService,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.loadCart();
    this.loadWallet();
  }

  // ==================== CHARGEMENT ====================

  loadCart(): void {
    this.isLoading = true;
    this.cartService.fetchCart().subscribe({
      next: (items) => {
        this.cartItems = items;
        this.isLoading = false;
        this.checkAppliedCoupon();
      },
      error: (err) => {
        console.error('Erreur chargement panier:', err);
        this.isLoading = false;
      }
    });
  }

  loadWallet(): void {
    this.walletService.getMyWallet().subscribe({
      next: (wallet) => {
        this.wallet = wallet;
      },
      error: (err) => {
        console.error('Erreur chargement wallet:', err);
      }
    });
  }

  checkAppliedCoupon(): void {
    const savedCoupon = localStorage.getItem('applied_coupon');
    if (savedCoupon) {
      this.appliedCouponCode = savedCoupon;
      this.couponCode = savedCoupon;
    }
    const savedDiscount = localStorage.getItem('cart_discount');
    if (savedDiscount) {
      this.discountAmount = parseFloat(savedDiscount);
    }
  }

  // ==================== CALCULS ====================

  get subtotal(): number {
    return this.cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }

  get tax(): number {
    return (this.subtotal - this.discountAmount) * this.taxRate;
  }

  get total(): number {
    return this.subtotal - this.discountAmount + this.shipping + this.tax;
  }

  get isWalletSufficient(): boolean {
    return this.wallet ? this.wallet.balance >= this.total : false;
  }

  // ==================== GESTION PANIER ====================

  incrementQuantity(item: CartItem): void {
    const newQuantity = item.quantity + 1;
    this.cartService.updateQuantity(item.productId, newQuantity, item.type).subscribe({
      next: () => {
        item.quantity = newQuantity;
      },
      error: (err) => console.error('Erreur:', err)
    });
  }

  decrementQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      const newQuantity = item.quantity - 1;
      this.cartService.updateQuantity(item.productId, newQuantity, item.type).subscribe({
        next: () => {
          item.quantity = newQuantity;
        },
        error: (err) => console.error('Erreur:', err)
      });
    }
  }

  removeItem(item: CartItem): void {
    if (confirm('Supprimer cet article du panier ?')) {
      this.cartService.removeFromCart(item.productId, item.type).subscribe({
        next: () => {
          this.cartItems = this.cartItems.filter(i =>
            !(i.productId === item.productId && i.type === item.type)
          );
        },
        error: (err) => console.error('Erreur:', err)
      });
    }
  }

  clearCart(): void {
    if (confirm('Vider tout le panier ?')) {
      this.cartService.clearCart().subscribe({
        next: () => {
          this.cartItems = [];
          this.discountAmount = 0;
          this.appliedCouponCode = null;
          localStorage.removeItem('applied_coupon');
          localStorage.removeItem('cart_discount');
        },
        error: (err) => console.error('Erreur:', err)
      });
    }
  }

  // ==================== COUPONS ====================

  applyCoupon(): void {
    if (!this.couponCode.trim()) {
      this.couponError = 'Veuillez entrer un code promo';
      return;
    }

    this.isProcessing = true;
    this.couponError = null;
    this.couponSuccess = null;

    this.cartService.applyCoupon(this.couponCode).subscribe({
      next: (response) => {
        this.couponSuccess = 'Code promo appliqué avec succès !';
        this.appliedCouponCode = this.couponCode;
        localStorage.setItem('applied_coupon', this.couponCode);

        if (response?.data?.discountAmount) {
          this.discountAmount = response.data.discountAmount;
          localStorage.setItem('cart_discount', response.data.discountAmount);
        }

        this.isProcessing = false;
        this.loadCart(); // Recharger pour mettre à jour
      },
      error: (err) => {
        this.couponError = err.error?.message || 'Code promo invalide';
        this.isProcessing = false;
      }
    });
  }

  removeCoupon(): void {
    this.cartService.removeCoupon().subscribe({
      next: () => {
        this.appliedCouponCode = null;
        this.couponCode = '';
        this.discountAmount = 0;
        this.couponSuccess = null;
        localStorage.removeItem('applied_coupon');
        localStorage.removeItem('cart_discount');
        this.loadCart();
      },
      error: (err) => console.error('Erreur:', err)
    });
  }

  // ==================== CHECKOUT ====================

  toggleCheckoutForm(): void {
    this.showCheckoutForm = !this.showCheckoutForm;
  }

  proceedToCheckout(): void {
    if (!this.validateCheckoutForm()) {
      return;
    }

    if (!this.isWalletSufficient) {
      alert(`Solde insuffisant. Votre solde est de ${this.wallet?.balance} DT.`);
      return;
    }

    this.isCheckingOut = true;

    const payload = {
      shippingAddress: this.checkoutData.shippingAddress,
      shippingCity: this.checkoutData.shippingCity,
      shippingCountry: this.checkoutData.shippingCountry,
      shippingPhone: this.checkoutData.shippingPhone,
      notes: this.checkoutData.notes,
      shippingCost: this.checkoutData.shippingCost
    };

    this.cartService.checkout(payload).subscribe({
      next: (order) => {
        this.isCheckingOut = false;
        alert(`Commande ${order.data?.orderNumber || order.orderNumber} créée avec succès !`);
        this.router.navigate(['/order-confirmation', order.data?.id || order.id]);
      },
      error: (err) => {
        this.isCheckingOut = false;
        alert(err.error?.message || 'Erreur lors du paiement');
      }
    });
  }

  validateCheckoutForm(): boolean {
    if (!this.checkoutData.shippingAddress.trim()) {
      alert('Veuillez entrer votre adresse');
      return false;
    }
    if (!this.checkoutData.shippingCity.trim()) {
      alert('Veuillez entrer votre ville');
      return false;
    }
    if (!this.checkoutData.shippingPhone.trim()) {
      alert('Veuillez entrer votre numéro de téléphone');
      return false;
    }
    return true;
  }

  // ==================== NAVIGATION ====================

  goBack(): void {
    this.location.back();
  }

  goToShop(): void {
    this.router.navigate(['/shop']);
  }

  addFunds(): void {
    this.router.navigate(['/wallet/recharge']);
  }
}
