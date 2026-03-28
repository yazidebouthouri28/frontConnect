import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import {
  FinanceFrontService,
  FrontCartItem,
  FrontOrder,
  FrontTransaction
} from '../../services/finance-front.service';

@Component({
  selector: 'app-client',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.css']
})
export class ClientComponent implements OnInit {
  Math = Math;

  activeTab = 'wallet';
  isLoading = false;
  errorMessage = '';

  menuItems = [
    { id: 'wallet', label: 'My Wallet', icon: '💰', badge: '' },
    { id: 'orders', label: 'My Orders', icon: '📦', badge: '' },
    { id: 'cart', label: 'Shopping Cart', icon: '🛒', badge: '0' },
    { id: 'profile', label: 'Profile', icon: '⚙️', badge: '' }
  ];

  // Customer Info
  customerName = '';
  customerEmail = '';
  customerPhone = '';
  customerCountry = '';
  customerAddress = '';

  // Wallet
  walletBalance = 0;
  loyaltyPoints = 0;
  walletTransactions: FrontTransaction[] = [];

  // Orders
  customerOrders: FrontOrder[] = [];
  orderStatuses = ['All', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
  selectedOrderStatus = 'All';

  // Cart
  cartItems: FrontCartItem[] = [];
  selectedPaymentMethod: 'wallet' | 'card' = 'wallet';
  shippingCost = 15.00;
  freeShippingThreshold = 100;
  shippingAddress = '';
  promotionCode = '';
  appliedPromotionCode = '';
  promotionDiscountRate = 0;
  promotionError = '';
  // Modals
  showAddFundsModal = false;
  showWithdrawModal = false;
  showTransferModal = false;
  showCheckoutSuccess = false;
  addFundsAmount = 100;
  withdrawAmount = 50;
  transferTarget = '';
  transferAmount = 25;
  transferConfirmationCode = '';
  transferCodeSent = false;
  transferFeePreview = 0;
  transferTotalDebitPreview = 0;
  fundingSource: 'CARD' | 'BANK_TRANSFER' = 'CARD';
  latestOrderId = '';
  lastEarnedPoints = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cartService: CartService,
    private financeFrontService: FinanceFrontService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    // Load user info
    const user = this.authService.getCurrentUser();
    if (user) {
      this.customerName = user.name;
      this.customerEmail = user.email;
    }

    // Check route data for default tab (e.g., /cart route sets defaultTab: 'cart')
    const routeData = this.route.snapshot.data;
    if (routeData['defaultTab']) {
      this.activeTab = routeData['defaultTab'];
    }

    // Handle query params for tab (overrides route data)
    this.route.queryParams.subscribe(params => {
      if (params['tab']) this.activeTab = params['tab'];
    });

    // Frontend-only state (no backend dependency)
    this.financeFrontService.wallet$.subscribe((wallet) => {
      this.walletBalance = wallet.balance;
      this.loyaltyPoints = wallet.points;
    });
    this.financeFrontService.transactions$.subscribe((transactions) => (this.walletTransactions = transactions));
    this.cartService.cart$.subscribe((items) => {
      this.financeFrontService.setCartFromExternal(items);
    });
    this.financeFrontService.cartItems$.subscribe((items) => {
      this.cartItems = items;
      this.updateCartBadge();
    });
    this.financeFrontService.orders$.subscribe((orders) => (this.customerOrders = orders));
  }

  loadWallet() {
    // Kept for compatibility; state is now reactive via frontend store.
  }

  loadOrders() {
    // Kept for compatibility; state is now reactive via frontend store.
  }

  get cartSubtotal(): number {
    return this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  get cartTax(): number {
    return this.cartSubtotal * 0.1;
  }

  get cartDiscount(): number {
    const raw = (this.cartSubtotal + this.cartTax) * (this.promotionDiscountRate / 100);
    return Number(raw.toFixed(2));
  }

  get shippingFee(): number {
    return this.cartSubtotal > this.freeShippingThreshold ? 0 : this.shippingCost;
  }

  get cartTotal(): number {
    const total = this.cartSubtotal + this.shippingFee + this.cartTax - this.cartDiscount;
    return Number(Math.max(total, 0).toFixed(2));
  }

  get filteredOrders(): FrontOrder[] {
    if (this.selectedOrderStatus === 'All') return this.customerOrders;
    return this.customerOrders.filter(o => o.status === this.selectedOrderStatus);
  }

  updateCartBadge() {
    const cartMenuItem = this.menuItems.find(m => m.id === 'cart');
    if (cartMenuItem) {
      cartMenuItem.badge = this.cartItems.length > 0 ? this.cartItems.length.toString() : '';
    }
  }

  updateQuantity(index: number, change: number) {
    const item = this.cartItems[index];
    const newQuantity = item.quantity + change;

    if (newQuantity <= 0) {
      this.removeFromCart(index);
    } else {
      this.cartService.updateQuantity(item.productId, newQuantity, item.type).subscribe();
    }
  }

  removeFromCart(index: number) {
    const item = this.cartItems[index];
    this.cartService.removeFromCart(item.productId, item.type).subscribe();
  }

  openAddFundsModal() {
    this.showAddFundsModal = true;
    this.addFundsAmount = 100;
    this.fundingSource = 'CARD';
  }

  openTransferModal() {
    this.showTransferModal = true;
    this.transferCodeSent = false;
    this.transferConfirmationCode = '';
    this.transferFeePreview = 0;
    this.transferTotalDebitPreview = 0;
  }

  confirmAddFunds() {
    if (this.addFundsAmount <= 0) {
      alert('⚠️ Please enter a valid amount');
      return;
    }

    this.financeFrontService.addFunds(this.addFundsAmount);
    this.notificationService.success(`Montant ajoute: ${this.addFundsAmount.toFixed(2)} DT`);
    this.showAddFundsModal = false;
  }

  confirmWithdraw() {
    const result = this.financeFrontService.withdrawFunds(this.withdrawAmount);
    if (!result.success) {
      this.notificationService.warning(result.message || 'Retrait impossible.');
      return;
    }
    this.notificationService.success(`Retrait confirme: ${this.withdrawAmount.toFixed(2)} DT`);
    this.showWithdrawModal = false;
  }

  confirmTransfer() {
    const result = this.financeFrontService.transferFunds(this.transferTarget, this.transferAmount);
    if (!result.success) {
      this.notificationService.warning(result.message || 'Transfert impossible.');
      return;
    }
    this.transferCodeSent = true;
    this.transferFeePreview = result.fee ?? 0;
    this.transferTotalDebitPreview = result.totalDebit ?? 0;
    // In frontend-only mode we expose OTP directly so manual testing stays easy.
    this.notificationService.info(
      `Code de confirmation: ${result.code}. Frais: ${this.transferFeePreview.toFixed(2)} DT.`
    );
  }

  confirmTransferWithCode() {
    const result = this.financeFrontService.confirmTransferCode(this.transferConfirmationCode);
    if (!result.success) {
      this.notificationService.warning(result.message || 'Confirmation transfert impossible.');
      return;
    }
    this.notificationService.success(result.message || 'Transfert confirme.');
    this.showTransferModal = false;
    this.transferTarget = '';
    this.transferAmount = 25;
    this.transferConfirmationCode = '';
    this.transferCodeSent = false;
    this.transferFeePreview = 0;
    this.transferTotalDebitPreview = 0;
  }

  checkout() {
    if (this.cartItems.length === 0) {
      alert('⚠️ Your cart is empty');
      return;
    }

    if (!this.shippingAddress) {
      alert('⚠️ Please enter a shipping address');
      return;
    }

    if (this.selectedPaymentMethod === 'wallet' && this.walletBalance < this.cartTotal) {
      alert('⚠️ Insufficient wallet balance. Please add funds or choose card payment.');
      return;
    }

    const result = this.financeFrontService.checkout(
      this.shippingAddress,
      this.selectedPaymentMethod === 'wallet' ? 'WALLET' : 'CARD',
      this.promotionDiscountRate,
      this.appliedPromotionCode || undefined
    );
    if (!result.success) {
      alert(`❌ Checkout failed: ${result.message}`);
      return;
    }
    this.latestOrderId = result.orderId || '';
    this.lastEarnedPoints = result.earnedPoints || 0;
    this.showCheckoutSuccess = true;
    this.cartService.clearCart().subscribe();
    this.clearPromotion();
  }

  closeCheckoutSuccess() {
    this.showCheckoutSuccess = false;
    this.activeTab = 'orders';
  }

  viewOrderDetails(order: FrontOrder) {
    alert(`Order #${order.id}\nStatus: ${order.status}\nTotal: $${order.totalAmount.toFixed(2)}\nItems: ${order.items.length}`);
  }

  trackOrder(order: FrontOrder) {
    if (order.trackingNumber) {
      alert(`📍 Tracking Order #${order.id}\nTracking Number: ${order.trackingNumber}`);
    } else {
      alert('Tracking information not yet available.');
    }
  }

  cancelOrder(order: FrontOrder) {
    if (confirm(`Are you sure you want to cancel Order #${order.id}?`)) {
      order.status = 'CANCELLED';
      this.notificationService.success(`Commande #${order.id} annulee.`);
    }
  }

  confirmOrder(order: FrontOrder) {
    const result = this.financeFrontService.setOrderStatus(order.id, 'PROCESSING');
    if (!result.success) {
      this.notificationService.warning(result.message || 'Confirmation impossible.');
      return;
    }
    this.notificationService.success(`Commande #${order.id} confirmee.`);
  }

  downloadInvoice(order: FrontOrder) {
    const invoiceContent = this.financeFrontService.buildInvoiceText(order.id);
    if (!invoiceContent) {
      this.notificationService.error(`Facture introuvable pour #${order.id}.`);
      return;
    }

    const blob = new Blob([invoiceContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-order-${order.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    this.notificationService.success(`Facture de la commande #${order.id} telechargee.`);
  }

  applyPromotion() {
    const code = this.promotionCode.trim().toUpperCase();
    if (!code) {
      this.promotionError = 'Entre un code promo.';
      return;
    }

    const result = this.financeFrontService.applyCode(code);
    if (!result.success) {
      this.promotionError = 'Code promo invalide.';
      return;
    }

    this.appliedPromotionCode = code;
    this.promotionDiscountRate = result.discountPercent;
    this.promotionError = '';
    this.notificationService.success(`Promotion ${code} appliquee (${result.discountPercent}% de reduction).`);
  }

  clearPromotion() {
    this.appliedPromotionCode = '';
    this.promotionDiscountRate = 0;
    this.promotionCode = '';
    this.promotionError = '';
    this.notificationService.info('Promotion retiree.');
  }

  requestRefund(order: FrontOrder) {
    const reason = prompt(`Raison du remboursement pour la commande #${order.id}:`, 'Produit defectueux');
    if (!reason || !reason.trim()) {
      this.notificationService.warning('Demande annulee : raison manquante.');
      return;
    }
    const result = this.financeFrontService.requestRefund(order.id, reason.trim());
    if (!result.success) {
      this.notificationService.warning(result.message || 'Demande refund impossible.');
      return;
    }
    this.notificationService.success(`Demande de remboursement envoyee pour #${order.id}.`);
  }

  getRefundLabel(orderId: string): string {
    const status = this.financeFrontService.getRefundStatus(orderId);
    if (!status) return '💸 Request Refund';
    if (status === 'APPROVED') return '✅ Refund Approved';
    if (status === 'REJECTED') return '❌ Refund Rejected';
    return '⏳ Refund Pending';
  }

  hasRefundRequest(orderId: string): boolean {
    return this.financeFrontService.getRefundStatus(orderId) !== null;
  }

  getOrderStatusBadge(status: string): string {
    const badges: { [key: string]: string } = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'PROCESSING': 'bg-blue-100 text-blue-800',
      'SHIPPED': 'bg-purple-100 text-purple-800',
      'DELIVERED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  }

  getTransactionIcon(type: string): string {
    return type === 'CREDIT' ? '📥' : '📤';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  getStatusBadge(status: string): string {
    const badges: { [key: string]: string } = {
      'COMPLETED': 'bg-green-100 text-green-800',
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'FAILED': 'bg-red-100 text-red-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  }

  isCredit(type: string): boolean {
    return type === 'CREDIT';
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  clearCart() {
    if (confirm('Are you sure you want to clear your cart?')) {
      this.cartService.clearCart().subscribe();
      alert('🛒 Cart cleared');
    }
  }

  saveProfile() {
    alert('✅ Profile saved successfully!');
  }
}
