// src/app/models/order.model.ts

export interface CheckoutRequest {
  shippingAddress: string;
  shippingCity: string;
  shippingCountry: string;
  shippingPhone: string;
  notes?: string;
  shippingCost?: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  userName: string;
  totalAmount: number;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  shippingCost: number;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
  paymentMethod: string;
  shippingAddress: string;
  shippingCity: string;
  shippingCountry: string;
  shippingPhone: string;
  notes: string;
  createdAt: string;
}
