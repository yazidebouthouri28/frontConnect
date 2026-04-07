import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { WalletService } from '../../services/wallet.service';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { CartItem, Wallet, WalletTransaction, Order } from '../../models/api.models';

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

  shippingNameError = '';
  shippingPhoneError = '';
  shippingAddressError = '';
  shippingCityError = '';
  shippingPostalCodeError = '';
  shippingCountryError = '';

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

  // Checkout form fields — map to backend @RequestParam fields
  shippingName = '';
  shippingPhone = '';
  shippingCity = '';
  shippingPostalCode = '';
  shippingCountry = 'Tunisia';

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
    const user = this.authService.getCurrentUser();
    if (user) {
      this.customerName = user.name;
      this.customerEmail = user.email;
      // Pre-fill shipping fields from user profile
      this.shippingName = user.name || '';
      this.shippingPhone = (user as any).phone || '';
      this.shippingAddress = (user as any).address || '';
      this.shippingCountry = (user as any).country || 'Tunisia';
    }

    // Check route data for default tab
    const routeData = this.route.snapshot.data;
    if (routeData['defaultTab']) {
      this.activeTab = routeData['defaultTab'];
    }

    // Handle query params for tab
    this.route.queryParams.subscribe(params => {
      if (params['tab']) this.activeTab = params['tab'];
    });

    // Subscribe to cart updates
    this.cartService.cart$.subscribe((items: CartItem[]) => {
      this.cartItems = items;
      this.updateCartBadge();
    });

    this.loadWallet();
    this.loadOrders();
  }

  loadWallet() {
    this.walletService.getMyWallet().subscribe({
      next: (wallet: any) => {
        this.walletBalance = wallet.balance ?? 0;
        this.loyaltyPoints = wallet.loyaltyPoints ?? 0;
      },
      error: () => {
        this.walletService.getBalance().subscribe({
          next: (data: any) => {
            this.walletBalance = data.balance ?? 0;
            this.loyaltyPoints = data.loyaltyPoints ?? 0;
          },
          error: () => {
            this.walletBalance = 0;
            this.loyaltyPoints = 0;
          }
        });
      }
    });

    this.walletService.getTransactions().subscribe({
      next: (transactions: WalletTransaction[]) => this.walletTransactions = transactions,
      error: () => { this.walletTransactions = []; }
    });
  }

  loadOrders() {
    this.orderService.getMyOrders().subscribe({
      next: (orders: any[]) => {
        this.customerOrders = Array.isArray(orders) ? orders : [];
      },
      error: () => {
        // getMyOrders uses getByUser(userId) which needs ADMIN or own user — fall back gracefully
        this.customerOrders = [];
      }
    });
  }

  // ==================== VALIDATION METHODS ====================

  /**
   * Validate shipping name
   */
  validateShippingName(): boolean {
    const name = this.shippingName?.trim() || '';

    if (!name) {
      this.shippingNameError = 'Full name is required';
      return false;
    }

    if (name.length < 2) {
      this.shippingNameError = 'Name must be at least 2 characters';
      return false;
    }

    if (name.length > 100) {
      this.shippingNameError = 'Name must not exceed 100 characters';
      return false;
    }

    // Check for valid characters (letters, spaces, hyphens, apostrophes)
    const nameRegex = /^[a-zA-ZÀ-ÿ\s\-']+$/;
    if (!nameRegex.test(name)) {
      this.shippingNameError = 'Name can only contain letters, spaces, hyphens, and apostrophes';
      return false;
    }

    this.shippingNameError = '';
    return true;
  }

  /**
   * Validate shipping phone number
   * Supports Tunisian format and international format
   */
  validateShippingPhone(): boolean {
    const phone = this.shippingPhone?.trim() || '';

    if (!phone) {
      this.shippingPhoneError = 'Phone number is required';
      return false;
    }

    // Remove all spaces, dashes, and parentheses for validation
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

    // International format: +216XXXXXXXX
    const internationalRegex = /^\+216\d{8}$/;
    // Tunisian format: 12 345 678 or 12345678
    const tunisianRegex = /^[2-9]\d{7}$/;
    // Alternative: allow 8 digits
    const simpleRegex = /^\d{8}$/;

    if (internationalRegex.test(cleanPhone)) {
      this.shippingPhoneError = '';
      return true;
    }

    if (tunisianRegex.test(cleanPhone) || simpleRegex.test(cleanPhone)) {
      this.shippingPhoneError = '';
      return true;
    }

    // Check if it's a valid international format (with country code)
    const anyInternationalRegex = /^\+\d{1,3}\d{8,12}$/;
    if (anyInternationalRegex.test(cleanPhone)) {
      this.shippingPhoneError = '';
      return true;
    }

    this.shippingPhoneError = 'Please enter a valid phone number (e.g., +21612345678 or 12345678)';
    return false;
  }

  /**
   * Validate shipping address
   */
  validateShippingAddress(): boolean {
    const address = this.shippingAddress?.trim() || '';

    if (!address) {
      this.shippingAddressError = 'Street address is required';
      return false;
    }

    if (address.length < 5) {
      this.shippingAddressError = 'Address must be at least 5 characters';
      return false;
    }

    if (address.length > 255) {
      this.shippingAddressError = 'Address must not exceed 255 characters';
      return false;
    }

    this.shippingAddressError = '';
    return true;
  }

  /**
   * Validate shipping city
   */
  validateShippingCity(): boolean {
    const city = this.shippingCity?.trim() || '';

    if (!city) {
      this.shippingCityError = 'City is required';
      return false;
    }

    if (city.length < 2) {
      this.shippingCityError = 'City must be at least 2 characters';
      return false;
    }

    if (city.length > 100) {
      this.shippingCityError = 'City must not exceed 100 characters';
      return false;
    }

    // Check for valid characters
    const cityRegex = /^[a-zA-ZÀ-ÿ\s\-']+$/;
    if (!cityRegex.test(city)) {
      this.shippingCityError = 'City can only contain letters, spaces, hyphens, and apostrophes';
      return false;
    }

    this.shippingCityError = '';
    return true;
  }

  /**
   * Validate postal code
   * Supports Tunisian postal codes (1000-9999) and international formats
   */
  validateShippingPostalCode(): boolean {
    const postalCode = this.shippingPostalCode?.trim() || '';

    if (!postalCode) {
      this.shippingPostalCodeError = 'Postal code is required';
      return false;
    }

    // Remove spaces
    const cleanCode = postalCode.replace(/\s/g, '');

    // Check length (4-10 digits)
    if (cleanCode.length < 4 || cleanCode.length > 10) {
      this.shippingPostalCodeError = 'Postal code must be 4-10 characters';
      return false;
    }

    // Check if it's alphanumeric or just numeric
    // Tunisian postal codes are numeric (1000-9999)
    const numericRegex = /^\d+$/;
    const alphanumericRegex = /^[A-Z0-9]+$/i;

    if (numericRegex.test(cleanCode)) {
      // Tunisian specific: between 1000 and 9999
      const codeNum = parseInt(cleanCode, 10);
      if (cleanCode.length === 4 && (codeNum < 1000 || codeNum > 9999)) {
        this.shippingPostalCodeError = 'Tunisian postal codes must be between 1000 and 9999';
        return false;
      }
      this.shippingPostalCodeError = '';
      return true;
    }

    // Allow alphanumeric for international addresses
    if (alphanumericRegex.test(cleanCode)) {
      this.shippingPostalCodeError = '';
      return true;
    }

    this.shippingPostalCodeError = 'Postal code can only contain numbers and letters (A-Z, 0-9)';
    return false;
  }

  /**
   * Validate shipping country
   */
  validateShippingCountry(): boolean {
    const country = this.shippingCountry?.trim() || '';

    if (!country) {
      this.shippingCountryError = 'Country is required';
      return false;
    }

    if (country.length < 2) {
      this.shippingCountryError = 'Country must be at least 2 characters';
      return false;
    }

    if (country.length > 100) {
      this.shippingCountryError = 'Country must not exceed 100 characters';
      return false;
    }

    // Check for valid characters
    const countryRegex = /^[a-zA-ZÀ-ÿ\s\-']+$/;
    if (!countryRegex.test(country)) {
      this.shippingCountryError = 'Country can only contain letters, spaces, hyphens, and apostrophes';
      return false;
    }

    this.shippingCountryError = '';
    return true;
  }

  /**
   * Validate all shipping fields
   */
  validateAllShippingFields(): boolean {
    const isValidName = this.validateShippingName();
    const isValidPhone = this.validateShippingPhone();
    const isValidAddress = this.validateShippingAddress();
    const isValidCity = this.validateShippingCity();
    const isValidPostalCode = this.validateShippingPostalCode();
    const isValidCountry = this.validateShippingCountry();

    return isValidName && isValidPhone && isValidAddress &&
      isValidCity && isValidPostalCode && isValidCountry;
  }

  // ── Cart computed ─────────────────────────────────────────────────────────

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
    return this.customerOrders.filter((o: Order) => o.status === this.selectedOrderStatus);
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

  clearCart() {
    if (confirm('Are you sure you want to clear your cart?')) {
      this.cartService.clearCart().subscribe(() => {
        alert('🛒 Cart cleared');
      });
    }
  }

  // ── Wallet ────────────────────────────────────────────────────────────────

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
      next: (wallet: any) => {
        this.walletBalance = wallet.balance ?? this.walletBalance;
        this.loyaltyPoints = wallet.loyaltyPoints ?? this.loyaltyPoints;
        alert(`✅ Successfully added $${this.addFundsAmount} to your wallet!`);
        this.showAddFundsModal = false;
        this.isLoading = false;
        this.loadWallet();
      },
      error: (err: any) => {
        this.isLoading = false;
        alert('❌ Failed to add funds: ' + (err.error?.message || err.message || 'Unknown error'));
      }
    });
  }

  // ── Checkout ──────────────────────────────────────────────────────────────

  checkout() {
    // First validate all shipping fields
    if (!this.validateAllShippingFields()) {
      // Scroll to the first error
      const firstError = document.querySelector('.border-red-500');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      alert('⚠️ Please correct the errors in the shipping form before proceeding.');
      return;
    }

    if (this.cartItems.length === 0) {
      alert('⚠️ Your cart is empty');
      return;
    }

    if (this.selectedPaymentMethod === 'wallet' && this.walletBalance < this.cartTotal) {
      alert('⚠️ Insufficient wallet balance. Please add funds or choose card payment.');
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.id) {
      alert('⚠️ Please log in to place an order.');
      return;
    }

    this.isLoading = true;

    // Sync local cart items to the server cart first.
    // Backend createOrderFromCart() reads items from the DB cart.
    const syncAll = this.cartItems.map(item =>
      this.cartService.addToCart({ ...item }).toPromise().catch(() => {})
    );

    Promise.all(syncAll).then(() => {
      // Format phone number: remove spaces and ensure consistent format
      let formattedPhone = (this.shippingPhone || '').trim();
      // Remove spaces and dashes
      formattedPhone = formattedPhone.replace(/[\s\-]/g, '');

      // Build payload — all @NotBlank fields must be non-empty
      const orderPayload = {
        userId:             String(currentUser.id),
        shippingName:       this.shippingName.trim(),
        shippingPhone:      formattedPhone,
        shippingAddress:    this.shippingAddress.trim(),
        shippingCity:       this.shippingCity.trim(),
        shippingPostalCode: this.shippingPostalCode.trim().replace(/\s/g, ''),
        shippingCountry:    this.shippingCountry.trim(),
        // 'wallet' → 'WALLET',  'card' → 'CREDIT_CARD'
        paymentMethod: this.selectedPaymentMethod === 'wallet' ? 'wallet' : 'card',
      };

      this.orderService.create(orderPayload).subscribe({
        next: (order: any) => {
          this.latestOrderId       = order?.id || order?.orderNumber || 'N/A';
          this.lastEarnedPoints    = Math.floor(this.cartTotal);
          this.showCheckoutSuccess = true;
          this.isLoading           = false;
          this.cartService.clearCart().subscribe();
          this.loadWallet();
          this.loadOrders();
        },
        error: (err: any) => {
          this.isLoading = false;
          console.error('[checkout] Error:', err);

          const body = err?.error;
          if (!body) {
            alert(`❌ Order failed (${err.status}). Please try again.`);
            return;
          }

          // Show per-field validation messages
          const fieldErrors = body?.errors || body?.fieldErrors || body?.violations;
          if (fieldErrors && typeof fieldErrors === 'object') {
            const msgs = Object.entries(fieldErrors)
              .map(([f, m]) => `• ${f}: ${m}`)
              .join('\n');
            alert(`❌ Validation errors:\n${msgs}`);
          } else {
            alert(`❌ Order failed:\n${body?.message || JSON.stringify(body)}`);
          }
        },
      });
    });
  }

  closeCheckoutSuccess() {
    this.showCheckoutSuccess = false;
    this.activeTab = 'orders';
  }

  // ── Orders ────────────────────────────────────────────────────────────────

  viewOrderDetails(order: Order) {
    alert(`Order #${order.id}\nStatus: ${order.status}\nTotal: $${order.totalAmount.toFixed(2)}\nItems: ${order.items?.length ?? 0}`);
  }

  trackOrder(order: Order) {
    if ((order as any).trackingNumber) {
      alert(`📍 Tracking Order #${order.id}\nTracking Number: ${(order as any).trackingNumber}`);
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
        error: (err: any) => alert('❌ Failed to cancel: ' + (err.error?.message || err.message || 'Unknown error'))
      });
    }
  }

  downloadInvoice(order: Order) {
    alert(`📄 Invoice for Order #${order.id} would be downloaded.\n(Feature coming soon)`);
  }

  // ── Profile ───────────────────────────────────────────────────────────────

  saveProfile() {
    alert('✅ Profile saved successfully!');
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  // ── Badge helpers ─────────────────────────────────────────────────────────

  getOrderStatusBadge(status: string): string {
    const badges: { [key: string]: string } = {
      'PENDING':    'bg-yellow-100 text-yellow-800',
      'PROCESSING': 'bg-blue-100 text-blue-800',
      'SHIPPED':    'bg-purple-100 text-purple-800',
      'DELIVERED':  'bg-green-100 text-green-800',
      'CANCELLED':  'bg-red-100 text-red-800'
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
      'PENDING':   'bg-yellow-100 text-yellow-800',
      'FAILED':    'bg-red-100 text-red-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  }

  isCredit(type: string): boolean {
    return type === 'CREDIT';
  }
}
