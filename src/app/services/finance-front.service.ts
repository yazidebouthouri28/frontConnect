import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CartItem } from '../models/api.models';

type PaymentMethod = 'WALLET' | 'CARD';

export interface FrontCartItem {
  id: string;
  productId: string;
  productName: string;
  image: string;
  quantity: number;
  price: number;
  type: 'PURCHASE' | 'RENTAL';
  rentalDays?: number;
}

export interface FrontOrder {
  id: string;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
  totalAmount: number;
  trackingNumber?: string;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
    type: 'PURCHASE' | 'RENTAL';
    rentalDays?: number;
  }>;
}

export interface FrontWallet {
  balance: number;
  points: number;
}

export interface FrontTransaction {
  id: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  description: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  createdAt: string;
}

export interface FrontCoupon {
  code: string;
  discountPercent: number;
  active: boolean;
}

export interface FrontPromotion {
  code: string;
  label: string;
  discountPercent: number;
  active: boolean;
}

export interface FrontCouponUsage {
  id: string;
  code: string;
  orderId: string;
  usedAt: string;
}

export interface FrontInvoice {
  id: string;
  orderId: string;
  amount: number;
  createdAt: string;
}

export interface FrontRefundRequest {
  id: string;
  orderId: string;
  reason: string;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export interface FrontSubscription {
  id: string;
  plan: 'FREE' | 'PRO' | 'PREMIUM';
  status: 'ACTIVE' | 'EXPIRED';
  renewAt: string;
}

export interface FrontBeneficiary {
  id: string;
  name: string;
  walletBalance: number;
}

export interface FrontTransferRecord {
  id: string;
  target: string;
  amount: number;
  fee: number;
  totalDebit: number;
  status: 'SUCCESS' | 'FAILED';
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class FinanceFrontService {
  private walletSubject = new BehaviorSubject<FrontWallet>({ balance: 420, points: 1245 });
  private transactionsSubject = new BehaviorSubject<FrontTransaction[]>([
    {
      id: 'tx-1',
      type: 'CREDIT',
      amount: 150,
      description: 'Recharge wallet',
      status: 'COMPLETED',
      createdAt: new Date().toISOString()
    }
  ]);
  private cartItemsSubject = new BehaviorSubject<FrontCartItem[]>([]);
  private ordersSubject = new BehaviorSubject<FrontOrder[]>([]);
  private invoicesSubject = new BehaviorSubject<FrontInvoice[]>([]);
  private refundRequestsSubject = new BehaviorSubject<FrontRefundRequest[]>([]);
  private couponUsageSubject = new BehaviorSubject<FrontCouponUsage[]>([]);
  private couponsSubject = new BehaviorSubject<FrontCoupon[]>([
    { code: 'WELCOME15', discountPercent: 15, active: true },
    { code: 'CAMP10', discountPercent: 10, active: true }
  ]);
  private promotionsSubject = new BehaviorSubject<FrontPromotion[]>([
    { code: 'VIP20', label: 'VIP Promo', discountPercent: 20, active: true },
    { code: 'SPRING25', label: 'Spring Promo', discountPercent: 25, active: true }
  ]);
  private subscriptionSubject = new BehaviorSubject<FrontSubscription>({
    id: 'sub-1',
    plan: 'PRO',
    status: 'ACTIVE',
    renewAt: new Date(Date.now() + 86400000 * 30).toISOString()
  });
  private beneficiariesSubject = new BehaviorSubject<FrontBeneficiary[]>([
    { id: 'bf-1', name: 'alice@campconnect.dev', walletBalance: 90 },
    { id: 'bf-2', name: 'bob@campconnect.dev', walletBalance: 140 }
  ]);
  private transferRecordsSubject = new BehaviorSubject<FrontTransferRecord[]>([]);
  private pendingTransfer:
    | { target: string; amount: number; fee: number; totalDebit: number; code: string; expiresAt: number }
    | null = null;

  wallet$ = this.walletSubject.asObservable();
  transactions$ = this.transactionsSubject.asObservable();
  cartItems$ = this.cartItemsSubject.asObservable();
  orders$ = this.ordersSubject.asObservable();
  invoices$ = this.invoicesSubject.asObservable();
  coupons$ = this.couponsSubject.asObservable();
  promotions$ = this.promotionsSubject.asObservable();
  couponUsage$ = this.couponUsageSubject.asObservable();
  refundRequests$ = this.refundRequestsSubject.asObservable();
  subscription$ = this.subscriptionSubject.asObservable();
  beneficiaries$ = this.beneficiariesSubject.asObservable();
  transferRecords$ = this.transferRecordsSubject.asObservable();

  addFunds(amount: number) {
    const wallet = this.walletSubject.value;
    this.walletSubject.next({ ...wallet, balance: Number((wallet.balance + amount).toFixed(2)) });
    this.pushTransaction('CREDIT', amount, 'Add funds');
  }

  withdrawFunds(amount: number) {
    if (amount <= 0) return { success: false, message: 'Montant invalide' };
    const wallet = this.walletSubject.value;
    if (wallet.balance < amount) return { success: false, message: 'Solde insuffisant' };
    this.walletSubject.next({ ...wallet, balance: Number((wallet.balance - amount).toFixed(2)) });
    this.pushTransaction('DEBIT', amount, 'Withdraw funds');
    return { success: true };
  }

  transferFunds(target: string, amount: number) {
    if (!target.trim()) return { success: false, message: 'Destinataire requis' };
    if (amount <= 0) return { success: false, message: 'Montant invalide' };
    const normalizedTarget = target.trim().toLowerCase();
    const fee = this.computeTransferFee(amount);
    const totalDebit = Number((amount + fee).toFixed(2));
    const wallet = this.walletSubject.value;
    if (wallet.balance < totalDebit) return { success: false, message: 'Solde insuffisant' };

    // Complete transfer flow requires a one-time confirmation code.
    const code = this.generateOtpCode();
    this.pendingTransfer = {
      target: normalizedTarget,
      amount: Number(amount.toFixed(2)),
      fee,
      totalDebit,
      code,
      expiresAt: Date.now() + 5 * 60 * 1000
    };

    return {
      success: true,
      requiresConfirmation: true,
      code,
      fee,
      totalDebit,
      expiresInSec: 300
    };
  }

  confirmTransferCode(code: string) {
    if (!this.pendingTransfer) {
      return { success: false, message: 'Aucun transfert en attente' };
    }
    if (Date.now() > this.pendingTransfer.expiresAt) {
      this.pendingTransfer = null;
      return { success: false, message: 'Code expire, recommence le transfert' };
    }
    if (this.pendingTransfer.code !== code.trim()) {
      return { success: false, message: 'Code de confirmation invalide' };
    }

    const wallet = this.walletSubject.value;
    if (wallet.balance < this.pendingTransfer.totalDebit) {
      this.pendingTransfer = null;
      return { success: false, message: 'Solde insuffisant au moment de confirmer' };
    }

    const target = this.pendingTransfer.target;
    const amount = this.pendingTransfer.amount;
    const fee = this.pendingTransfer.fee;
    const totalDebit = this.pendingTransfer.totalDebit;

    this.walletSubject.next({ ...wallet, balance: Number((wallet.balance - totalDebit).toFixed(2)) });
    this.pushTransaction('DEBIT', amount, `Transfer sent to ${target}`);
    this.pushTransaction('DEBIT', fee, `Transfer fee (1%)`);

    const existing = this.beneficiariesSubject.value.find((b) => b.name.toLowerCase() === target);
    if (existing) {
      this.beneficiariesSubject.next(
        this.beneficiariesSubject.value.map((b) =>
          b.id === existing.id ? { ...b, walletBalance: Number((b.walletBalance + amount).toFixed(2)) } : b
        )
      );
    } else {
      this.beneficiariesSubject.next([
        ...this.beneficiariesSubject.value,
        {
          id: `bf-${Date.now()}`,
          name: target,
          walletBalance: amount
        }
      ]);
    }

    this.transferRecordsSubject.next([
      {
        id: `TR-${Date.now()}`,
        target,
        amount,
        fee,
        totalDebit,
        status: 'SUCCESS',
        createdAt: new Date().toISOString()
      },
      ...this.transferRecordsSubject.value
    ]);

    this.pendingTransfer = null;
    return { success: true, message: 'Transfert confirme avec succes' };
  }

  applyCode(code: string): { success: boolean; discountPercent: number; source?: 'coupon' | 'promotion' } {
    const normalized = code.trim().toUpperCase();
    const coupon = this.couponsSubject.value.find((c) => c.code === normalized && c.active);
    if (coupon) return { success: true, discountPercent: coupon.discountPercent, source: 'coupon' };
    const promo = this.promotionsSubject.value.find((p) => p.code === normalized && p.active);
    if (promo) return { success: true, discountPercent: promo.discountPercent, source: 'promotion' };
    return { success: false, discountPercent: 0 };
  }

  updateCartQuantity(productId: string, quantity: number) {
    const next = this.cartItemsSubject.value
      .map((item) => (item.productId === productId ? { ...item, quantity } : item))
      .filter((item) => item.quantity > 0);
    this.cartItemsSubject.next(next);
  }

  // Keep frontend finance cart aligned with the main cart service
  setCartFromExternal(items: CartItem[]) {
    const mapped: FrontCartItem[] = (items || []).map((item, index) => ({
      id: `ext-${index}-${item.productId}-${item.type}`,
      productId: item.productId,
      productName: item.productName,
      image: item.image,
      quantity: item.quantity,
      price: item.price,
      type: item.type,
      rentalDays: item.rentalDays
    }));
    this.cartItemsSubject.next(mapped);
  }

  removeFromCart(productId: string) {
    this.cartItemsSubject.next(this.cartItemsSubject.value.filter((item) => item.productId !== productId));
  }

  clearCart() {
    this.cartItemsSubject.next([]);
  }

  checkout(shippingAddress: string, paymentMethod: PaymentMethod, discountPercent: number, appliedCode?: string) {
    const items = this.cartItemsSubject.value;
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const tax = subtotal * 0.1;
    const shipping = subtotal > 100 ? 0 : 15;
    const discount = (subtotal + tax) * (discountPercent / 100);
    const total = Number(Math.max(subtotal + tax + shipping - discount, 0).toFixed(2));

    if (!shippingAddress.trim()) {
      return { success: false, message: 'Adresse de livraison requise' };
    }

    if (paymentMethod === 'WALLET' && this.walletSubject.value.balance < total) {
      return { success: false, message: 'Solde wallet insuffisant' };
    }

    if (paymentMethod === 'WALLET') {
      const wallet = this.walletSubject.value;
      this.walletSubject.next({ ...wallet, balance: Number((wallet.balance - total).toFixed(2)) });
      this.pushTransaction('DEBIT', total, 'Order payment');
    } else {
      this.pushTransaction('DEBIT', total, 'Card order payment');
    }

    const orderId = `ORD-${Date.now()}`;
    const order: FrontOrder = {
      id: orderId,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      totalAmount: total,
      items: items.map((i) => ({
        productName: i.productName,
        quantity: i.quantity,
        price: i.price,
        type: i.type,
        rentalDays: i.rentalDays
      }))
    };
    this.ordersSubject.next([order, ...this.ordersSubject.value]);

    const invoice: FrontInvoice = {
      id: `INV-${Date.now()}`,
      orderId,
      amount: total,
      createdAt: new Date().toISOString()
    };
    this.invoicesSubject.next([invoice, ...this.invoicesSubject.value]);

    if (appliedCode) {
      this.couponUsageSubject.next([
        {
          id: `CU-${Date.now()}`,
          code: appliedCode,
          orderId,
          usedAt: new Date().toISOString()
        },
        ...this.couponUsageSubject.value
      ]);
    }

    const wallet = this.walletSubject.value;
    this.walletSubject.next({ ...wallet, points: wallet.points + Math.floor(total) });
    this.clearCart();
    return { success: true, orderId, earnedPoints: Math.floor(total) };
  }

  setOrderStatus(orderId: string, status: FrontOrder['status']) {
    const exists = this.ordersSubject.value.some((o) => o.id === orderId);
    if (!exists) return { success: false, message: 'Commande introuvable' };

    const updated = this.ordersSubject.value.map((order) =>
      order.id === orderId ? { ...order, status } : order
    );
    this.ordersSubject.next(updated);
    return { success: true };
  }

  requestRefund(orderId: string, reason: string) {
    const order = this.ordersSubject.value.find((o) => o.id === orderId);
    if (!order) return { success: false, message: 'Commande introuvable' };
    if (this.refundRequestsSubject.value.some((r) => r.orderId === orderId)) {
      return { success: false, message: 'Remboursement deja demande' };
    }
    const req: FrontRefundRequest = {
      id: `RR-${Date.now()}`,
      orderId,
      reason,
      amount: order.totalAmount,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };
    this.refundRequestsSubject.next([req, ...this.refundRequestsSubject.value]);
    return { success: true };
  }

  setRefundStatus(refundId: string, status: 'APPROVED' | 'REJECTED') {
    const current = this.refundRequestsSubject.value;
    const refund = current.find((r) => r.id === refundId);
    if (!refund) return { success: false, message: 'Refund introuvable' };
    if (refund.status !== 'PENDING') return { success: false, message: 'Refund deja traitee' };

    const updated = current.map((r) => (r.id === refundId ? { ...r, status } : r));
    this.refundRequestsSubject.next(updated);

    if (status === 'APPROVED') {
      const wallet = this.walletSubject.value;
      this.walletSubject.next({ ...wallet, balance: Number((wallet.balance + refund.amount).toFixed(2)) });
      this.pushTransaction('CREDIT', refund.amount, `Refund approved for order ${refund.orderId}`);
    }

    return { success: true };
  }

  toggleCoupon(code: string) {
    const next = this.couponsSubject.value.map((coupon) =>
      coupon.code === code ? { ...coupon, active: !coupon.active } : coupon
    );
    this.couponsSubject.next(next);
  }

  togglePromotion(code: string) {
    const next = this.promotionsSubject.value.map((promotion) =>
      promotion.code === code ? { ...promotion, active: !promotion.active } : promotion
    );
    this.promotionsSubject.next(next);
  }

  renewSubscription(days = 30) {
    const current = this.subscriptionSubject.value;
    this.subscriptionSubject.next({
      ...current,
      status: 'ACTIVE',
      renewAt: new Date(Date.now() + days * 86400000).toISOString()
    });
  }

  exportInvoicesCsv(): string {
    const headers = ['invoice_id', 'order_id', 'amount', 'created_at'];
    const rows = this.invoicesSubject.value.map((invoice) =>
      [invoice.id, invoice.orderId, invoice.amount.toFixed(2), invoice.createdAt].join(',')
    );
    return [headers.join(','), ...rows].join('\n');
  }

  getRefundStatus(orderId: string): FrontRefundRequest['status'] | null {
    return this.refundRequestsSubject.value.find((r) => r.orderId === orderId)?.status ?? null;
  }

  buildInvoiceText(orderId: string): string | null {
    const order = this.ordersSubject.value.find((o) => o.id === orderId);
    const invoice = this.invoicesSubject.value.find((i) => i.orderId === orderId);
    if (!order || !invoice) return null;
    const lines = order.items
      .map(
        (item, index) =>
          `${index + 1}. ${item.productName} | Qty ${item.quantity} | ${item.price.toFixed(2)} DT`
      )
      .join('\n');
    return [
      'CampConnect Invoice',
      `Invoice ID: ${invoice.id}`,
      `Order ID: ${order.id}`,
      `Date: ${new Date(invoice.createdAt).toLocaleString()}`,
      '-------------------------',
      lines,
      '-------------------------',
      `Total: ${invoice.amount.toFixed(2)} DT`
    ].join('\n');
  }

  private pushTransaction(type: 'CREDIT' | 'DEBIT', amount: number, description: string) {
    this.transactionsSubject.next([
      {
        id: `TX-${Date.now()}`,
        type,
        amount: Number(amount.toFixed(2)),
        description,
        status: 'COMPLETED',
        createdAt: new Date().toISOString()
      },
      ...this.transactionsSubject.value
    ]);
  }

  private computeTransferFee(amount: number) {
    return Number((amount * 0.01).toFixed(2));
  }

  private generateOtpCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}

