import { Component, Input, OnInit } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';
import { InventoryService } from '../../services/inventory.service';
import { OrderService } from '../../services/order.service';
import { RentalService } from '../../services/rental.service';
import { WarehouseService } from '../../services/warehouse.service';
import { Product, Category, Inventory, Order, Rental, Warehouse } from '../../models/api.models';

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

    activePortalSection = 'products_categories';
    activeTab = 'products';
    activeInventoryTab = 'stock';
    activeOrdersTab = 'sales';
    
    // Loading and error states
    isLoading = false;
    errorMessage = '';

    // Data from backend
    categories: any[] = [];
    products: any[] = [];
    inventory: any[] = [];
    warehouses: Warehouse[] = [];
    gearOrders: any[] = [];
    gearRentals: any[] = [];

    // Stats
    totalOrders = 0;
    pendingOrders = 0;
    totalRevenue = 0;
    activeRentals = 0;
    overdueRentals = 0;
    rentalRevenue = 0;
    lowStockCount = 0;

    constructor(
        private productService: ProductService,
        private categoryService: CategoryService,
        private inventoryService: InventoryService,
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

    loadCategories(): void {
        this.categoryService.getAll().subscribe({
            next: (data) => {
                this.categories = data.map(cat => ({
                    id: cat.id,
                    name: cat.name,
                    description: cat.description || 'Category',
                    count: 0, // Will be updated from products
                    icon: this.getCategoryIcon(cat.name),
                    subcategories: []
                }));
            },
            error: (err) => {
                console.error('Failed to load categories:', err);
                // Fallback to mock data
                this.categories = [
                    { id: 1, name: 'Tentes & Abris', description: 'Tous types de tentes', count: 8, icon: '⛺', subcategories: ['Tentes Familiales', 'Tentes 2-3 Personnes'] },
                    { id: 2, name: 'Sacs & Bagages', description: 'Sacs à dos', count: 6, icon: '🎒' },
                    { id: 3, name: 'Cuisine', description: 'Equipement cuisine', count: 5, icon: '🔥' },
                    { id: 4, name: 'Couchage', description: 'Sacs de couchage', count: 5, icon: '💤' },
                ];
            }
        });
    }

    loadProducts(): void {
        this.isLoading = true;
        this.productService.getAll().subscribe({
            next: (data) => {
                this.products = data.map(prod => ({
                    id: prod.id,
                    sku: prod.sku || `SKU-${prod.id?.substring(0, 8)}`,
                    name: prod.name,
                    category: prod.categoryId || 'Uncategorized',
                    price: prod.price,
                    rental: prod.rentalPrice || null,
                    stock: prod.stockQuantity || 0,
                    status: prod.isActive ? 'Active' : 'Inactive'
                }));
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Failed to load products:', err);
                this.isLoading = false;
                // Fallback to mock data
                this.products = [
                    { id: 1, sku: 'TENT-FAM-001', name: '4-Person Family Tent', category: 'Tentes & Abris', price: 299.99, rental: 45, stock: 45, status: 'Active' },
                    { id: 2, sku: 'SLEEP-PREM-001', name: 'Premium Sleeping Bag -20°C', category: 'Couchage', price: 189.99, rental: 25, stock: 12, status: 'Active' },
                    { id: 3, sku: 'COOK-STOV-001', name: 'Portable Camp Stove', category: 'Cuisine', price: 89.99, rental: null, stock: 67, status: 'Active' },
                ];
            }
        });
    }

    loadInventory(): void {
        this.inventoryService.getAll().subscribe({
            next: (data) => {
                this.inventory = data.map(inv => ({
                    id: inv.id,
                    productName: inv.productName || 'Product',
                    warehouse: inv.warehouseName || 'Main Warehouse',
                    location: inv.location || 'A1-B1-C1',
                    current: inv.currentStock,
                    reserved: inv.reservedStock || 0,
                    available: inv.currentStock - (inv.reservedStock || 0),
                    alertAt: inv.lowStockThreshold || 15,
                    status: inv.currentStock <= (inv.lowStockThreshold || 15) ? 'low' : 'ok'
                }));
                this.lowStockCount = this.inventory.filter(i => i.status === 'low').length;
            },
            error: (err) => {
                console.error('Failed to load inventory:', err);
                // Fallback to mock data
                this.inventory = [
                    { id: 1, productName: '4-Person Family Tent', warehouse: 'Main Warehouse', location: 'A1-B3-C2', current: 45, reserved: 8, available: 37, alertAt: 20, status: 'ok' },
                    { id: 2, productName: 'Premium Sleeping Bag -20°C', warehouse: 'Main Warehouse', location: 'B2-C1-B4', current: 12, reserved: 3, available: 9, alertAt: 15, status: 'low' },
                    { id: 3, productName: 'Portable Camp Stove', warehouse: 'Secondary Warehouse', location: 'C3-D2-E1', current: 67, reserved: 5, available: 62, alertAt: 25, status: 'ok' },
                ];
                this.lowStockCount = 1;
            }
        });
    }

    loadWarehouses(): void {
        this.warehouseService.getAll().subscribe({
            next: (data) => {
                this.warehouses = data;
            },
            error: (err) => {
                console.error('Failed to load warehouses:', err);
                this.warehouses = [];
            }
        });
    }

    loadOrders(): void {
        this.orderService.getAll().subscribe({
            next: (data) => {
                this.gearOrders = data.map(order => ({
                    id: order.id,
                    customer: order.customerName || 'Customer',
                    email: order.customerEmail || 'customer@example.com',
                    date: order.createdAt ? new Date(order.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                    total: order.totalAmount,
                    status: order.status?.toLowerCase() || 'pending',
                    type: 'sale',
                    items: order.items || []
                }));
                this.totalOrders = this.gearOrders.length;
                this.pendingOrders = this.gearOrders.filter(o => o.status === 'pending').length;
                this.totalRevenue = this.gearOrders.reduce((sum, o) => sum + o.total, 0);
            },
            error: (err) => {
                console.error('Failed to load orders:', err);
                // Fallback to mock data
                this.gearOrders = [
                    { id: 'ORD-001', customer: 'David Johnson', email: 'david@example.com', date: '2026-02-14', total: 350.50, status: 'delivered', type: 'sale' },
                    { id: 'ORD-002', customer: 'Emma Wilson', email: 'emma@example.com', date: '2026-02-15', total: 95.00, status: 'pending', type: 'sale' },
                ];
                this.totalOrders = 2;
                this.pendingOrders = 1;
                this.totalRevenue = 445.50;
            }
        });
    }

    loadRentals(): void {
        this.rentalService.getAll().subscribe({
            next: (data) => {
                this.gearRentals = data.map(rental => {
                    const endDate = new Date(rental.endDate);
                    const today = new Date();
                    const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    
                    return {
                        id: rental.id,
                        customer: rental.customerName || 'Customer',
                        product: rental.productName || 'Product',
                        email: rental.customerEmail || 'customer@example.com',
                        startDate: rental.startDate ? new Date(rental.startDate).toISOString().split('T')[0] : '',
                        endDate: rental.endDate ? new Date(rental.endDate).toISOString().split('T')[0] : '',
                        total: rental.totalCost || 0,
                        deposit: rental.deposit || 0,
                        status: rental.status?.toLowerCase() || 'active',
                        daysLeft: daysLeft
                    };
                });
                this.activeRentals = this.gearRentals.filter(r => r.status === 'active').length;
                this.overdueRentals = this.gearRentals.filter(r => r.status === 'overdue' || r.daysLeft < 0).length;
                this.rentalRevenue = this.gearRentals.reduce((sum, r) => sum + r.total, 0);
            },
            error: (err) => {
                console.error('Failed to load rentals:', err);
                // Fallback to mock data
                this.gearRentals = [
                    { id: 'RNT-001', customer: 'David Johnson', product: '4-Person Family Tent', email: 'david@example.com', startDate: '2026-02-10', endDate: '2026-02-17', total: 90.00, deposit: 60.00, status: 'active', daysLeft: 1 },
                    { id: 'RNT-002', customer: 'Emma Wilson', product: 'Premium Sleeping Bag', email: 'emma@example.com', startDate: '2026-02-08', endDate: '2026-02-15', total: 50.00, deposit: 40.00, status: 'overdue', daysLeft: -1 },
                ];
                this.activeRentals = 1;
                this.overdueRentals = 1;
                this.rentalRevenue = 140;
            }
        });
    }

    // Helper methods
    getCategoryIcon(name: string): string {
        const iconMap: { [key: string]: string } = {
            'tent': '⛺',
            'tentes': '⛺',
            'bag': '🎒',
            'sacs': '🎒',
            'cook': '🔥',
            'cuisine': '🔥',
            'sleep': '💤',
            'couchage': '💤',
            'light': '🔦',
            'tool': '🔧',
            'electronics': '📱',
            'default': '📦'
        };
        
        const lowerName = name.toLowerCase();
        for (const [key, icon] of Object.entries(iconMap)) {
            if (lowerName.includes(key)) {
                return icon;
            }
        }
        return iconMap['default'];
    }

    setPortalSection(section: string) {
        this.activePortalSection = section;
    }

    setTab(tab: string) {
        this.activeTab = tab;
    }

    setInventoryTab(tab: string) {
        this.activeInventoryTab = tab;
    }

    setOrdersTab(tab: string) {
        this.activeOrdersTab = tab;
    }

    getStatusClass(status: string): string {
        switch (status.toLowerCase()) {
            case 'active':
            case 'delivered':
            case 'in stock':
                return 'bg-green-100 text-green-700';
            case 'low':
            case 'low stock':
            case 'pending':
            case 'shipped':
                return 'bg-yellow-100 text-yellow-700';
            case 'cancelled':
            case 'out of stock':
                return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    }

    // CRUD Operations
    deleteProduct(productId: string): void {
        if (confirm('Are you sure you want to delete this product?')) {
            this.productService.delete(productId).subscribe({
                next: () => {
                    this.loadProducts();
                },
                error: (err) => {
                    console.error('Failed to delete product:', err);
                    alert('Failed to delete product. Please try again.');
                }
            });
        }
    }

    deleteCategory(categoryId: string): void {
        if (confirm('Are you sure you want to delete this category?')) {
            this.categoryService.delete(categoryId).subscribe({
                next: () => {
                    this.loadCategories();
                },
                error: (err) => {
                    console.error('Failed to delete category:', err);
                    alert('Failed to delete category. Please try again.');
                }
            });
        }
    }

    updateOrderStatus(orderId: string, newStatus: string): void {
        this.orderService.updateStatus(orderId, newStatus.toUpperCase()).subscribe({
            next: () => {
                this.loadOrders();
            },
            error: (err) => {
                console.error('Failed to update order status:', err);
                alert('Failed to update order status. Please try again.');
            }
        });
    }

    markRentalReturned(rentalId: string): void {
        this.rentalService.markReturned(rentalId).subscribe({
            next: () => {
                this.loadRentals();
            },
            error: (err) => {
                console.error('Failed to mark rental as returned:', err);
                alert('Failed to mark rental as returned. Please try again.');
            }
        });
    }

    extendRental(rentalId: string): void {
        const days = prompt('Enter number of days to extend:');
        if (days && parseInt(days) > 0) {
            this.rentalService.extend(rentalId, { additionalDays: parseInt(days) }).subscribe({
                next: () => {
                    this.loadRentals();
                },
                error: (err) => {
                    console.error('Failed to extend rental:', err);
                    alert('Failed to extend rental. Please try again.');
                }
            });
        }
    }
}
