import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FinanceFrontService,
  FrontCartItem,
  FrontCoupon,
  FrontCouponUsage,
  FrontInvoice,
  FrontPromotion,
  FrontRefundRequest,
  FrontSubscription,
  FrontTransaction,
  FrontWallet,
  FrontOrder,
  FrontBeneficiary,
  FrontTransferRecord
} from '../../services/finance-front.service';

@Component({
  selector: 'app-finance-admin-front',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './finance-admin-front.component.html',
  styleUrls: ['./finance-admin-front.component.css']
})
export class FinanceAdminFrontComponent {
  wallet: FrontWallet = { balance: 0, points: 0 };
  subscription: FrontSubscription | null = null;
  transactions: FrontTransaction[] = [];
  cartItems: FrontCartItem[] = [];
  orders: FrontOrder[] = [];
  coupons: FrontCoupon[] = [];
  promotions: FrontPromotion[] = [];
  couponUsage: FrontCouponUsage[] = [];
  invoices: FrontInvoice[] = [];
  refundRequests: FrontRefundRequest[] = [];
  beneficiaries: FrontBeneficiary[] = [];
  transferRecords: FrontTransferRecord[] = [];

  constructor(private financeFrontService: FinanceFrontService) {
    this.financeFrontService.wallet$.subscribe((v) => (this.wallet = v));
    this.financeFrontService.subscription$.subscribe((v) => (this.subscription = v));
    this.financeFrontService.transactions$.subscribe((v) => (this.transactions = v));
    this.financeFrontService.cartItems$.subscribe((v) => (this.cartItems = v));
    this.financeFrontService.orders$.subscribe((v) => (this.orders = v));
    this.financeFrontService.coupons$.subscribe((v) => (this.coupons = v));
    this.financeFrontService.promotions$.subscribe((v) => (this.promotions = v));
    this.financeFrontService.couponUsage$.subscribe((v) => (this.couponUsage = v));
    this.financeFrontService.invoices$.subscribe((v) => (this.invoices = v));
    this.financeFrontService.refundRequests$.subscribe((v) => (this.refundRequests = v));
    this.financeFrontService.beneficiaries$.subscribe((v) => (this.beneficiaries = v));
    this.financeFrontService.transferRecords$.subscribe((v) => (this.transferRecords = v));
  }

  formatDate(value: string) {
    return new Date(value).toLocaleString();
  }

  setOrderStatus(orderId: string, status: FrontOrder['status']) {
    this.financeFrontService.setOrderStatus(orderId, status);
  }

  approveRefund(refundId: string) {
    this.financeFrontService.setRefundStatus(refundId, 'APPROVED');
  }

  rejectRefund(refundId: string) {
    this.financeFrontService.setRefundStatus(refundId, 'REJECTED');
  }

  toggleCoupon(code: string) {
    this.financeFrontService.toggleCoupon(code);
  }

  togglePromotion(code: string) {
    this.financeFrontService.togglePromotion(code);
  }

  renewSubscription(days = 30) {
    this.financeFrontService.renewSubscription(days);
  }

  exportInvoicesCsv() {
    const csv = this.financeFrontService.exportInvoicesCsv();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoices-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }
}

