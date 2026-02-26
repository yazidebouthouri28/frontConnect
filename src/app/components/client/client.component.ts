import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { WalletService } from '../../services/wallet.service';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { CartItem, Wallet, WalletTransaction, Order, CreateOrderDto } from '../../models/api.models';

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
  walletTransactions: WalletTransaction[] = [];

  // Orders
  customerOrders: Order[] = [];
  orderStatuses = ['All', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
  selectedOrderStatus = 'All';

  // Cart
  cartItems: CartItem[] = [];
  selectedPaymentMethod: 'wallet' | 'card' = 'wallet';
  shippingCost = 15.00;
  shippingAddress = '';

  // Modals
  showAddFundsModal = false;
  showWithdrawModal = false;
  showTransferModal = false;
  showCheckoutSuccess = false;
  addFundsAmount = 100;
  fundingSource: 'CARD' | 'BANK_TRANSFER' = 'CARD';
  latestOrderId = '';
  lastEarnedPoints = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cartService: CartService,
    private walletService: WalletService,
    private orderService: OrderService,
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

    // Subscribe to cart updates
    this.cartService.cart$.subscribe(items => {
      this.cartItems = items;
      this.updateCartBadge();
    });

    // Load data
    this.loadWallet();
    this.loadOrders();
  }

  loadWallet() {
    this.walletService.getMyWallet().subscribe({
      next: (wallet) => {
        this.walletBalance = wallet.balance;
        this.loyaltyPoints = wallet.loyaltyPoints;
      },
      error: () => {
        // Fallback - try balance endpoint
        this.walletService.getBalance().subscribe({
          next: (data) => {
            this.walletBalance = data.balance;
            this.loyaltyPoints = data.loyaltyPoints;
          },
          error: () => {
            // Wallet service unavailable - use defaults
            this.walletBalance = 0;
            this.loyaltyPoints = 0;
          }
        });
      }
    });

    this.walletService.getTransactions().subscribe({
      next: (transactions) => this.walletTransactions = transactions,
      error: () => this.walletTransactions = [] // Transactions unavailable
    });
  }

  loadOrders() {
    this.orderService.getMyOrders().subscribe({
      next: (orders) => this.customerOrders = orders,
      error: () => {
        this.orderService.getAll().subscribe({
          next: (orders) => this.customerOrders = orders,
          error: () => this.customerOrders = [] // Orders unavailable
        });
      }
    });
  }

  get cartSubtotal(): number {
    return this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  get cartTax(): number {
    return this.cartSubtotal * 0.1;
  }

  get cartTotal(): number {
    return this.cartSubtotal + this.shippingCost + this.cartTax;
  }

  get filteredOrders(): Order[] {
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
      this.cartService.updateQuantity(item.productId, newQuantity).subscribe();
    }
  }

  removeFromCart(index: number) {
    const item = this.cartItems[index];
    this.cartService.removeFromCart(item.productId).subscribe();
  }

  openAddFundsModal() {
    this.showAddFundsModal = true;
    this.addFundsAmount = 100;
    this.fundingSource = 'CARD';
  }

  confirmAddFunds() {
    if (this.addFundsAmount <= 0) {
      alert('⚠️ Please enter a valid amount');
      return;
    }

    this.isLoading = true;
    this.walletService.addFunds({
      amount: this.addFundsAmount,
      source: this.fundingSource
    }).subscribe({
      next: (wallet) => {
        this.walletBalance = wallet.balance;
        this.loyaltyPoints = wallet.loyaltyPoints;
        alert(`✅ Successfully added $${this.addFundsAmount} to your wallet!`);
        this.showAddFundsModal = false;
        this.isLoading = false;
        this.loadWallet();
      },
      error: (err) => {
        this.isLoading = false;
        alert('❌ Failed to add funds: ' + (err.message || 'Unknown error'));
      }
    });
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

    const orderData: CreateOrderDto = {
      items: this.cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        type: item.type,
        rentalDays: item.rentalDays
      })),
      shippingAddress: this.shippingAddress,
      paymentMethod: this.selectedPaymentMethod === 'wallet' ? 'WALLET' : 'CARD'
    };

    this.isLoading = true;
    this.orderService.create(orderData).subscribe({
      next: (order: any) => {
        this.latestOrderId = order.id;
        this.lastEarnedPoints = Math.floor(this.cartTotal);
        this.showCheckoutSuccess = true;
        this.isLoading = false;

        // Clear cart
        this.cartService.clearCart().subscribe();

        // Reload wallet and orders
        this.loadWallet();
        this.loadOrders();
      },
      error: (err: any) => {

        this.isLoading = false;
        alert('❌ Checkout failed: ' + (err.message || 'Unknown error'));
      }
    });
  }

  closeCheckoutSuccess() {
    this.showCheckoutSuccess = false;
    this.activeTab = 'orders';
  }

  viewOrderDetails(order: Order) {
    alert(`Order #${order.id}\nStatus: ${order.status}\nTotal: $${order.totalAmount.toFixed(2)}\nItems: ${order.items.length}`);
  }

  trackOrder(order: Order) {
    if (order.trackingNumber) {
      alert(`📍 Tracking Order #${order.id}\nTracking Number: ${order.trackingNumber}`);
    } else {
      alert('Tracking information not yet available.');
    }
  }

  cancelOrder(order: Order) {
    if (confirm(`Are you sure you want to cancel Order #${order.id}?`)) {
      this.orderService.cancel(order.id).subscribe({
        next: () => {
          alert(`✅ Order #${order.id} has been cancelled.`);
          this.loadOrders();
        },
        error: (err) => alert('❌ Failed to cancel order: ' + (err.message || 'Unknown error'))
      });
    }
  }

  downloadInvoice(order: Order) {
    alert(`📄 Invoice for Order #${order.id} would be downloaded.\n(Feature coming soon)`);
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
      this.cartService.clearCart().subscribe(() => {
        alert('🛒 Cart cleared');
      });
    }
  }

  saveProfile() {
    alert('✅ Profile saved successfully!');
  }
}
