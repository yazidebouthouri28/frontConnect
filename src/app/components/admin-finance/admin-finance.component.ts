// src/app/components/admin-finance/admin-finance.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminFinanceService, Wallet, Transaction, Coupon, CouponUsage, Order, Promotion } from '../../services/admin-finance.service';

@Component({
  selector: 'app-admin-finance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-finance.component.html',
  styleUrls: ['./admin-finance.component.css']
})
export class AdminFinanceComponent implements OnInit {

  // Données
  wallets: Wallet[] = [];
  transactions: Transaction[] = [];
  coupons: Coupon[] = [];
  promotions: Promotion[] = [];
  orders: Order[] = [];
  couponUsages: CouponUsage[] = [];

  // États
  isLoading = true;

  // Pagination
  transactionPage = 0;
  orderPage = 0;
  totalTransactions = 0;
  totalOrders = 0;

  // Nouveau coupon
  showCouponForm = false;
  newCoupon: Partial<Coupon> = {
    code: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    minOrderAmount: 0,
    maxDiscountAmount: 100,
    usageLimit: 100,
    validFrom: new Date().toISOString(),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true
  };

  // Nouvelle promotion
  showPromotionForm = false;
  newPromotion: Partial<Promotion> = {
    name: '',
    description: '',
    type: 'PERCENTAGE',
    discountValue: 10,
    minPurchaseAmount: 0,
    maxDiscountAmount: 100,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    maxUsage: 1000
  };

  constructor(private adminService: AdminFinanceService) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData(): void {
    this.isLoading = true;
    this.loadWallets();
    this.loadTransactions();
    this.loadCoupons();
    this.loadPromotions();
    this.loadOrders();
    this.loadCouponUsages();
  }

  loadWallets(): void {
    this.adminService.getAllWallets().subscribe({
      next: (data) => {
        this.wallets = data;
        this.isLoading = false;
      },
      error: (err) => console.error('Erreur chargement wallets:', err)
    });
  }

  loadTransactions(): void {
    this.adminService.getAllTransactions(this.transactionPage, 20).subscribe({
      next: (data) => {
        this.transactions = data.content || [];
        this.totalTransactions = data.totalElements || 0;
      },
      error: (err) => console.error('Erreur chargement transactions:', err)
    });
  }

  loadCoupons(): void {
    this.adminService.getAllCoupons().subscribe({
      next: (data) => {
        this.coupons = data;
      },
      error: (err) => console.error('Erreur chargement coupons:', err)
    });
  }

  loadPromotions(): void {
    this.adminService.getAllPromotions().subscribe({
      next: (data) => {
        this.promotions = data;
      },
      error: (err) => console.error('Erreur chargement promotions:', err)
    });
  }

  loadOrders(): void {
    this.adminService.getAllOrders(this.orderPage, 20).subscribe({
      next: (data) => {
        this.orders = data.content || [];
        this.totalOrders = data.totalElements || 0;
      },
      error: (err) => console.error('Erreur chargement commandes:', err)
    });
  }

  loadCouponUsages(): void {
    this.adminService.getAllCouponUsages().subscribe({
      next: (data) => {
        this.couponUsages = data;
      },
      error: (err) => console.error('Erreur chargement utilisations coupons:', err)
    });
  }

  // ==================== STATS METHODS ====================

  getActiveCouponsCount(): number {
    return this.coupons?.filter(c => c.isActive).length ?? 0;
  }

  getActivePromotionsCount(): number {
    return this.promotions?.filter(p => p.isActive).length ?? 0;
  }

  getTotalWalletsBalance(): number {
    return this.wallets?.reduce((sum, w) => sum + (w.balance || 0), 0) ?? 0;
  }

  getTotalTransactionsAmount(): number {
    return this.transactions?.reduce((sum, t) => sum + (t.amount || 0), 0) ?? 0;
  }

  // ==================== COUPONS ====================

  toggleCoupon(coupon: Coupon): void {
    this.adminService.toggleCoupon(coupon.id, !coupon.isActive).subscribe({
      next: () => {
        coupon.isActive = !coupon.isActive;
      },
      error: (err) => console.error('Erreur toggle coupon:', err)
    });
  }

  createCoupon(): void {
    this.adminService.createCoupon(this.newCoupon).subscribe({
      next: (coupon) => {
        this.coupons.push(coupon);
        this.showCouponForm = false;
        this.newCoupon = {
          code: '', description: '', discountType: 'PERCENTAGE',
          discountValue: 10, minOrderAmount: 0, maxDiscountAmount: 100,
          usageLimit: 100, validFrom: new Date().toISOString(),
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          isActive: true
        };
      },
      error: (err) => console.error('Erreur création coupon:', err)
    });
  }

  // ==================== PROMOTIONS ====================

  togglePromotion(promotion: Promotion): void {
    this.adminService.togglePromotion(promotion.id, !promotion.isActive).subscribe({
      next: () => {
        promotion.isActive = !promotion.isActive;
      },
      error: (err) => console.error('Erreur toggle promotion:', err)
    });
  }

  createPromotion(): void {
    this.adminService.createPromotion(this.newPromotion).subscribe({
      next: (promotion) => {
        this.promotions.push(promotion);
        this.showPromotionForm = false;
        this.newPromotion = {
          name: '', description: '', type: 'PERCENTAGE',
          discountValue: 10, minPurchaseAmount: 0, maxDiscountAmount: 100,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          isActive: true, maxUsage: 1000
        };
      },
      error: (err) => console.error('Erreur création promotion:', err)
    });
  }

  // ==================== ORDERS ====================

  onOrderStatusChange(order: Order, event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const newStatus = selectElement.value;

    this.adminService.updateOrderStatus(order.id, newStatus).subscribe({
      next: () => {
        order.status = newStatus;
      },
      error: (err) => console.error('Erreur mise à jour statut:', err)
    });
  }

  // ==================== PAGINATION ====================

  previousTransactionPage(): void {
    if (this.transactionPage > 0) {
      this.transactionPage--;
      this.loadTransactions();
    }
  }

  nextTransactionPage(): void {
    if ((this.transactionPage + 1) * 20 < this.totalTransactions) {
      this.transactionPage++;
      this.loadTransactions();
    }
  }

  previousOrderPage(): void {
    if (this.orderPage > 0) {
      this.orderPage--;
      this.loadOrders();
    }
  }

  nextOrderPage(): void {
    if ((this.orderPage + 1) * 20 < this.totalOrders) {
      this.orderPage++;
      this.loadOrders();
    }
  }

  // ==================== UTILS ====================

  formatDate(date: string): string {
    return new Date(date).toLocaleString();
  }
}
