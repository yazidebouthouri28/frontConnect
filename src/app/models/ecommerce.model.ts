// ========== PRODUCT MANAGEMENT (CATALOGUE) ==========
export interface Product {
  id: number;
  name: string;
  description: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;
  sku: string;
  categoryId: number;
  categoryName: string;
  tags: string[];
  images: string[];
  isActive: boolean;
  isFeatured: boolean;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
}

// ========== INVENTORY MANAGEMENT (STOCKS) ==========
export interface Inventory {
  id: number;
  productId: number;
  productName: string;
  sku: string;
  warehouseId: number;
  warehouseName: string;
  locationCode: string;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  lowStockThreshold: number;
  isLowStock: boolean;
  lastRestockedAt: string;
}

export interface StockMovement {
  id: number;
  productName: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  location: string;
  date: string;
  performedBy: string;
}

export interface Warehouse {
  id: number;
  name: string;
  code: string;
  address: string;
}

// ========== CATEGORIES ==========
export interface Category {
  id: number;
  name: string;
  description: string;
  icon: string;
  subcategories: Subcategory[];
  productCount: number;
}

export interface Subcategory {
  id: number;
  categoryId: number;
  name: string;
}

// ========== ORDERS ==========
export interface Order {
  id: number;
  customerName: string;
  orderDate: string;
  status: string;
  totalAmount: number;
  items: OrderItem[];
}

export interface OrderItem {
  productName: string;
  quantity: number;
  price: number;
}

export interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  lowStockItems: number;
  totalStock: number;
  stockValue: number;
}
