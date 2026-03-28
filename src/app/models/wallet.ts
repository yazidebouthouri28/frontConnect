// src/app/models/wallet.model.ts
export interface Wallet {
  id?: number;
  user?: {
    id: number;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  balance: number;
  totalDeposited?: number;
  totalWithdrawn?: number;
  currency: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// DTO pour créer un wallet
export interface CreateWalletDto {
  user: { id: number };
  balance?: number;
  currency?: string;
  isActive?: boolean;
}

// DTO pour mettre à jour un wallet
export interface UpdateWalletDto {
  balance?: number;
  totalDeposited?: number;
  totalWithdrawn?: number;
  currency?: string;
  isActive?: boolean;
}
