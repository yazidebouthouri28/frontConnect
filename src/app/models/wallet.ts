// src/app/models/wallet.model.ts

export interface Wallet {
  id: number;
  userId: number;
  userName: string;
  balance: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: number;
  transactionNumber: string;
  amount: number;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'PURCHASE' | 'REFUND' | 'SUBSCRIPTION' | 'TRANSFER';
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
  description: string;
  balanceBefore: number;
  balanceAfter: number;
  createdAt: string;
}
