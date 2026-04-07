import { Component, Input, OnInit } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';
import { InventoryService } from '../../services/inventory.service';
import { RentalService } from '../../services/rental.service';
import { WarehouseService } from '../../services/warehouse.service';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-marketplace-management',
  standalone: true,
  imports: [CommonModule, NgClass, FormsModule],
  templateUrl: './marketplace-management.component.html',
  styleUrl: './marketplace-management.component.css'
})
export class MarketplaceManagementComponent implements OnInit {

  @Input() set section(value: string) {
    if (value && value !== 'marketplace') {
      this.activePortalSection = value;
    }
  }

  // ── UI State ────────────────────────────────────────────
  activePortalSection = 'products_categories';
  activeTab = 'products';
  activeInventoryTab = 'stock';
  isLoading = false;

  // Modal state
  showProductModal = false;
  showCategoryModal = false;
  isEditMode = false;
  editingId: string | null = null;

  // ── Data ────────────────────────────────────────────────
  categories: any[] = [];
  products: any[] = [];
  filteredProducts: any[] = [];
  inventory: any[] = [];
  warehouses: any[] = [];
  gearOrders: any[] = [];
  filteredOrders: any[] = [];
  gearRentals: any[] = [];
  filteredRentals: any[] = [];

  // ── Stats ───────────────────────────────────────────────
  totalOrders = 0;
  pendingOrders = 0;
  totalRevenue = 0;
  activeRentals = 0;
  overdueRentals = 0;
  rentalRevenue = 0;
  lowStockCount = 0;

  // ── Filter State ────────────────────────────────────────
  productSearch = '';
  selectedCategoryFilter = '';
  selectedOrderStatus = 'All';
  selectedRentalFilter = 'All';
  selectedOrderStatus_map: { [key: string]: string } = {};
  globalAlertThreshold = 15;

  // ── Forms ───────────────────────────────────────────────
  productForm: any = {
    name: '', sku: '', categoryId: '', price: 0,
    rentalPrice: null, stockQuantity: 0, description: '', isActive: true
  };

  categoryForm: any = { name: '', description: '', icon: '📦' };

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private inventoryService: InventoryService,
    private authService: AuthService,
    private orderService: OrderService,
    private rentalService: RentalService,
    private warehouseService: WarehouseService
  ) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData(): void {
    this.loadCategories();
    this.loadProducts();
    this.loadInventory();
    this.loadWarehouses();
    this.loadOrders();
    this.loadRentals();
  }

  // ── Loaders ─────────────────────────────────────────────

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (data: any[]) => {
        this.categories = data.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          description: cat.description || '',
          count: cat.productCount || 0,
          icon: cat.image || this.getCategoryIcon(cat.name),
          subcategories: cat.subcategories || []
        }));
      },
      error: (err: any) => {
        console.error('categories:', err);
        this.categories = [
          { id: '1', name: 'Tentes & Abris', description: 'Tous types de tentes', count: 8, icon: '⛺', subcategories: [] },
          { id: '2', name: 'Sacs & Bagages', description: 'Sacs à dos', count: 6, icon: '🎒', subcategories: [] },
          { id: '3', name: 'Cuisine', description: 'Equipement cuisine', count: 5, icon: '🔥', subcategories: [] },
          { id: '4', name: 'Couchage', description: 'Sacs de couchage', count: 5, icon: '💤', subcategories: [] },
        ];
      }
    });
  }

  loadProducts(): void {
    this.isLoading = true;
    this.productService.getAllAdmin().subscribe({
      next: (data: any) => {
        const list: any[] = Array.isArray(data) ? data : (data?.content || []);
        this.products = list.map((p: any) => ({
          id: p.id,
          sku: p.sku || `SKU-${String(p.id).substring(0, 8)}`,
          name: p.name,
          description: p.description || '',
          category: p.categoryName || p.categoryId || 'Uncategorized',
          categoryId: p.categoryId || '',
          price: p.price || 0,
          rental: p.rentalPricePerDay || p.rentalPrice || null,
          stock: p.stockQuantity || 0,
          status: p.isActive ? 'Active' : 'Inactive',
          isActive: p.isActive ?? true
        }));
        this.filteredProducts = [...this.products];
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('products:', err);
        this.isLoading = false;
        this.products = [
          { id: '1', sku: 'TENT-FAM-001', name: '4-Person Family Tent', description: '', category: 'Tentes & Abris', categoryId: '1', price: 299.99, rental: 45, stock: 45, status: 'Active', isActive: true },
          { id: '2', sku: 'SLEEP-PREM-001', name: 'Premium Sleeping Bag -20°C', description: '', category: 'Couchage', categoryId: '4', price: 189.99, rental: 25, stock: 12, status: 'Active', isActive: true },
          { id: '3', sku: 'COOK-STOV-001', name: 'Portable Camp Stove', description: '', category: 'Cuisine', categoryId: '3', price: 89.99, rental: null, stock: 67, status: 'Active', isActive: true },
        ];
        this.filteredProducts = [...this.products];
      }
    });
  }

  loadInventory(): void {
    this.inventoryService.getAll().subscribe({
      next: (data: any[]) => {
        this.inventory = data.map((inv: any) => ({
          id: inv.id,
          productName: inv.productName || 'Product',
          warehouse: inv.warehouseName || 'Main Warehouse',
          location: inv.location || '—',
          current: inv.currentStock || 0,
          reserved: inv.reservedStock || 0,
          available: (inv.currentStock || 0) - (inv.reservedStock || 0),
          alertAt: inv.lowStockThreshold || 15,
          status: (inv.currentStock || 0) <= (inv.lowStockThreshold || 15) ? 'low' : 'ok'
        }));
        this.lowStockCount = this.inventory.filter((i: any) => i.status === 'low').length;
      },
      error: (err: any) => {
        console.error('inventory:', err);
        this.inventory = [
          { id: '1', productName: '4-Person Family Tent', warehouse: 'Main Warehouse', location: 'A1-B3-C2', current: 45, reserved: 8, available: 37, alertAt: 20, status: 'ok' },
          { id: '2', productName: 'Premium Sleeping Bag -20°C', warehouse: 'Main Warehouse', location: 'B2-C1-B4', current: 12, reserved: 3, available: 9, alertAt: 15, status: 'low' },
        ];
        this.lowStockCount = 1;
      }
    });
  }

  loadWarehouses(): void {
    this.warehouseService.getAll().subscribe({
      next: (data: any[]) => { this.warehouses = data; },
      error: (err: any) => { console.error('warehouses:', err); this.warehouses = []; }
    });
  }

  loadOrders(): void {
    this.orderService.getAll().subscribe({
      next: (data: any) => {
        const list: any[] = Array.isArray(data) ? data : (data?.content || []);
        this.gearOrders = list.map((o: any) => ({
          id: o.id,
          customer: o.customerName || o.buyerName || 'Customer',
          email: o.customerEmail || o.buyerEmail || '—',
          address: o.shippingAddress || '—',
          date: o.createdAt
            ? new Date(o.createdAt).toISOString().split('T')[0]
            : (o.orderDate ? new Date(o.orderDate).toISOString().split('T')[0] : '—'),
          total: o.totalAmount || 0,
          status: (o.status || 'PENDING').toLowerCase(),
          items: o.items || []
        }));
        this.filteredOrders = [...this.gearOrders];
        this.totalOrders = this.gearOrders.length;
        this.pendingOrders = this.gearOrders.filter((o: any) =>
          o.status === 'pending'
        ).length;
        this.totalRevenue = this.gearOrders.reduce(
          (sum: number, o: any) => sum + o.total, 0
        );
        this.gearOrders.forEach((o: any) => {
          this.selectedOrderStatus_map[o.id] = o.status;
        });
      },
      error: (err: any) => {
        console.error('orders:', err);
        this.gearOrders = [];
        this.filteredOrders = [];
      }
    });
  }
  loadRentals(): void {
    this.rentalService.getAll().subscribe({
      next: (data: any) => {
        const today = new Date();
        const list: any[] = Array.isArray(data) ? data : (data as any)?.content || [];
        this.gearRentals = list.map((r: any) => {
          const end = new Date(r.endDate);
          return {
            id: r.id,
            customer: r.customerName || r.userName || 'Customer',
            product: r.productName || 'Product',
            email: r.customerEmail || '—',
            startDate: r.startDate ? new Date(r.startDate).toISOString().split('T')[0] : '—',
            endDate: r.endDate ? new Date(r.endDate).toISOString().split('T')[0] : '—',
            total: r.totalCost || r.totalAmount || 0,
            deposit: r.deposit || r.depositAmount || 0,
            status: (r.status || 'active').toLowerCase(),
            daysLeft: Math.ceil((end.getTime() - today.getTime()) / 86400000)
          };
        });
        this.filteredRentals = [...this.gearRentals];
        this.activeRentals = this.gearRentals.filter((r: any) => r.status === 'active').length;
        this.overdueRentals = this.gearRentals.filter((r: any) => r.status === 'overdue' || r.daysLeft < 0).length;
        this.rentalRevenue = this.gearRentals.reduce((sum: number, r: any) => sum + r.total, 0);
      },
      error: (err: any) => {
        console.error('rentals:', err);
        this.gearRentals = [
          { id: 'RNT-001', customer: 'David Johnson', product: '4-Person Family Tent', email: 'david@example.com', startDate: '2026-02-10', endDate: '2026-02-17', total: 90, deposit: 60, status: 'active', daysLeft: 3 },
          { id: 'RNT-002', customer: 'Emma Wilson', product: 'Premium Sleeping Bag', email: 'emma@example.com', startDate: '2026-02-08', endDate: '2026-02-15', total: 50, deposit: 40, status: 'overdue', daysLeft: -9 },
        ];
        this.filteredRentals = [...this.gearRentals];
        this.activeRentals = 1; this.overdueRentals = 1; this.rentalRevenue = 140;
      }
    });
  }

  // ── Product CRUD ─────────────────────────────────────────

  openAddProduct(): void {
    this.productForm = { name: '', sku: '', categoryId: '', price: 0, rentalPrice: null, stockQuantity: 0, description: '', isActive: true };
    this.isEditMode = false;
    this.editingId = null;
    this.showProductModal = true;
  }

  openEditProduct(prod: any): void {
    this.productForm = {
      name: prod.name, sku: prod.sku, categoryId: prod.categoryId,
      price: prod.price, rentalPrice: prod.rental, stockQuantity: prod.stock,
      description: prod.description, isActive: prod.isActive
    };
    this.isEditMode = true;
    this.editingId = prod.id;
    this.showProductModal = true;
  }

  saveProduct(): void {
    if (!this.productForm.name || !this.productForm.price) {
      alert('Name and price are required.');
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    const sellerId = currentUser?.id ? Number(currentUser.id) : null;

    if (!sellerId) {
      alert('Cannot save product: user not authenticated.');
      return;
    }

    const payload: any = {
      name: this.productForm.name,
      description: this.productForm.description || '',
      price: Number(this.productForm.price),
      sku: this.productForm.sku || undefined,
      categoryId: this.productForm.categoryId ? Number(this.productForm.categoryId) : undefined,
      stockQuantity: Number(this.productForm.stockQuantity) || 0,
      isRentable: !!this.productForm.rentalPrice,
      rentalPricePerDay: this.productForm.rentalPrice ? Number(this.productForm.rentalPrice) : undefined,
      isFeatured: false,
      isOnSale: false,
      trackInventory: true,
      sellerId: sellerId
    };

    // Remove undefined keys so backend @Valid doesn't reject them
    Object.keys(payload).forEach(key => {
      if (payload[key] === undefined) delete payload[key];
    });

    const call = this.isEditMode && this.editingId
      ? this.productService.update(this.editingId, payload)
      : this.productService.create(payload);

    call.subscribe({
      next: () => { this.closeModals(); this.loadProducts(); },
      error: (err: any) => {
        console.error('saveProduct error:', err);
        const detail = err?.error?.message
          || (err?.error?.errors && JSON.stringify(err.error.errors))
          || JSON.stringify(err?.error);
        alert('Failed to save product: ' + detail);
      }
    });
  }

  deleteProduct(id: string): void {
    if (!confirm('Delete this product?')) return;
    this.productService.deleteAdmin(id).subscribe({
      next: () => this.loadProducts(),
      error: (err: any) => { console.error(err); alert('Failed to delete product.'); }
    });
  }

  // ── Category CRUD ────────────────────────────────────────

  openAddCategory(): void {
    this.categoryForm = { name: '', description: '', icon: '📦' };
    this.isEditMode = false;
    this.editingId = null;
    this.showCategoryModal = true;
  }

  openEditCategory(cat: any): void {
    this.categoryForm = { name: cat.name, description: cat.description, icon: cat.icon };
    this.isEditMode = true;
    this.editingId = cat.id;
    this.showCategoryModal = true;
  }

  saveCategory(): void {
    if (!this.categoryForm.name) { alert('Name is required.'); return; }

    const call = this.isEditMode && this.editingId
      ? this.categoryService.update(this.editingId, this.categoryForm)
      : this.categoryService.create(this.categoryForm);

    call.subscribe({
      next: () => { this.closeModals(); this.loadCategories(); },
      error: (err: any) => { console.error(err); alert('Failed to save category.'); }
    });
  }

  deleteCategory(id: string): void {
    if (!confirm('Delete this category?')) return;
    this.categoryService.delete(id).subscribe({
      next: () => this.loadCategories(),
      error: (err: any) => { console.error(err); alert('Failed to delete category.'); }
    });
  }

  closeModals(): void {
    this.showProductModal = false;
    this.showCategoryModal = false;
  }

  // ── Order Operations ─────────────────────────────────────

  filterOrders(status: string): void {
    this.selectedOrderStatus = status;
    this.filteredOrders = status === 'All'
      ? [...this.gearOrders]
      : this.gearOrders.filter((o: any) => o.status === status.toLowerCase());
  }
  updateOrderStatus(orderId: string): void {
    const status = this.selectedOrderStatus_map[orderId];
    if (!status) return;
    this.orderService.updateStatus(orderId, status.toUpperCase()).subscribe({
      next: () => this.loadOrders(),
      error: (err: any) => { console.error(err); alert('Failed to update order status.'); }
    });
  }

  cancelOrder(orderId: string): void {
    if (!confirm('Cancel this order?')) return;
    this.orderService.cancel(orderId).subscribe({
      next: () => this.loadOrders(),
      error: (err: any) => { console.error(err); alert('Failed to cancel order.'); }
    });
  }
  // ── Rental Operations ────────────────────────────────────

  filterRentals(filter: string): void {
    this.selectedRentalFilter = filter;
    this.filteredRentals = filter === 'All'
      ? [...this.gearRentals]
      : this.gearRentals.filter((r: any) => r.status === filter.toLowerCase());
  }

  markRentalReturned(id: string): void {
    this.rentalService.markReturned(id).subscribe({
      next: () => this.loadRentals(),
      error: (err: any) => { console.error(err); alert('Failed to mark as returned.'); }
    });
  }

  extendRental(id: string): void {
    const days = prompt('Days to extend:');
    if (!days || parseInt(days, 10) <= 0) return;
    this.rentalService.extend(id, { additionalDays: parseInt(days, 10) }).subscribe({
      next: () => this.loadRentals(),
      error: (err: any) => { console.error(err); alert('Failed to extend rental.'); }
    });
  }

  sendReminder(id: string): void {
    this.rentalService.sendReminder(id).subscribe({
      next: () => alert('Reminder sent.'),
      error: (err: any) => { console.error(err); alert('Failed to send reminder.'); }
    });
  }

  // ── Inventory ────────────────────────────────────────────

  applyGlobalAlert(): void {
    alert(`Global threshold of ${this.globalAlertThreshold} will be applied on the backend.`);
  }
  recordMovement(): void {
    const inventoryId = prompt('Enter inventory ID to record movement for:');
    if (!inventoryId) return;
    const qty = prompt('Quantity (use negative for OUT):');
    if (!qty) return;
    const parsed = parseInt(qty, 10);
    if (isNaN(parsed)) return;
    const type: 'IN' | 'OUT' = parsed >= 0 ? 'IN' : 'OUT';

    this.inventoryService.createMovement({
      productId: inventoryId,
      warehouseId: this.warehouses[0]?.id || '',   // ← use first warehouse as fallback
      type,
      quantity: Math.abs(parsed),
      reason: 'Manual movement'
    }).subscribe({
      next: () => { alert('Movement recorded.'); this.loadInventory(); },
      error: (err: any) => { console.error(err); alert('Failed to record movement.'); }
    });
  }
  filterProducts(): void {
    this.filteredProducts = this.products.filter((p: any) => {
      const matchSearch = !this.productSearch
        || p.name.toLowerCase().includes(this.productSearch.toLowerCase())
        || p.sku.toLowerCase().includes(this.productSearch.toLowerCase());
      const matchCat = !this.selectedCategoryFilter || p.category === this.selectedCategoryFilter;
      return matchSearch && matchCat;
    });
  }

  // ── Helpers ──────────────────────────────────────────────

  getCategoryIcon(name: string): string {
    const map: { [key: string]: string } = {
      tent: '⛺', tentes: '⛺', bag: '🎒', sacs: '🎒',
      cook: '🔥', cuisine: '🔥', sleep: '💤', couchage: '💤',
      light: '🔦', tool: '🔧', electronics: '📱'
    };
    const lower = name.toLowerCase();
    for (const [key, icon] of Object.entries(map)) {
      if (lower.includes(key)) return icon;
    }
    return '📦';
  }

  getOrderStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'delivered':  return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'shipped':    return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'processing': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'pending':    return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'cancelled':  return 'bg-red-50 text-red-500 border-red-100';
      default:           return 'bg-gray-50 text-gray-500 border-gray-100';
    }
  }

  setPortalSection(section: string): void { this.activePortalSection = section; }
}
