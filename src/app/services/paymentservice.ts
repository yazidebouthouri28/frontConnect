// src/app/services/payment.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface Transaction {
  id: number;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  status: string;
  description: string;
  processedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  // Données mockées pour simuler les wallets des utilisateurs
  private userWallets: Map<number, { balance: number, transactions: Transaction[] }> = new Map([
    [1, {
      balance: 1500.50,
      transactions: [
        {
          id: 1,
          type: 'CREDIT',
          amount: 1000,
          balanceBefore: 500,
          balanceAfter: 1500,
          status: 'COMPLETED',
          description: 'Dépôt initial',
          processedAt: new Date('2024-02-01')
        },
        {
          id: 2,
          type: 'DEBIT',
          amount: 499.50,
          balanceBefore: 2000,
          balanceAfter: 1500.50,
          status: 'COMPLETED',
          description: 'Achat de produits',
          processedAt: new Date('2024-02-15')
        }
      ]
    }],
    [2, {
      balance: 3200.00,
      transactions: [
        {
          id: 3,
          type: 'CREDIT',
          amount: 3500,
          balanceBefore: 0,
          balanceAfter: 3500,
          status: 'COMPLETED',
          description: 'Dépôt initial',
          processedAt: new Date('2024-01-20')
        },
        {
          id: 4,
          type: 'DEBIT',
          amount: 300,
          balanceBefore: 3500,
          balanceAfter: 3200,
          status: 'COMPLETED',
          description: 'Retrait',
          processedAt: new Date('2024-01-25')
        }
      ]
    }],
    [3, {
      balance: 0,
      transactions: []
    }]
  ]);

  private nextTransactionId = 5;

  constructor() { }

  // Obtenir le solde du wallet par userId
  getBalance(userId: number): Observable<number> {
    const wallet = this.userWallets.get(userId);
    if (wallet) {
      return of(wallet.balance);
    }
    // Si l'utilisateur n'a pas de wallet, en créer un avec solde 0
    this.userWallets.set(userId, { balance: 0, transactions: [] });
    return of(0);
  }

  // Déposer de l'argent (recharger le wallet)
  deposit(userId: number, amount: number, description: string): Observable<Transaction> {
    let wallet = this.userWallets.get(userId);

    if (!wallet) {
      wallet = { balance: 0, transactions: [] };
      this.userWallets.set(userId, wallet);
    }

    const beforeBalance = wallet.balance;
    const afterBalance = beforeBalance + amount;
    wallet.balance = afterBalance;

    const transaction: Transaction = {
      id: this.nextTransactionId++,
      type: 'CREDIT',
      amount: amount,
      balanceBefore: beforeBalance,
      balanceAfter: afterBalance,
      status: 'COMPLETED',
      description: description,
      processedAt: new Date()
    };

    wallet.transactions.unshift(transaction);

    return of(transaction);
  }

  // Retirer de l'argent
  withdraw(userId: number, amount: number, description: string): Observable<Transaction> {
    const wallet = this.userWallets.get(userId);

    if (!wallet) {
      throw new Error('Wallet non trouvé');
    }

    if (wallet.balance < amount) {
      throw new Error('Solde insuffisant');
    }

    const beforeBalance = wallet.balance;
    const afterBalance = beforeBalance - amount;
    wallet.balance = afterBalance;

    const transaction: Transaction = {
      id: this.nextTransactionId++,
      type: 'DEBIT',
      amount: amount,
      balanceBefore: beforeBalance,
      balanceAfter: afterBalance,
      status: 'COMPLETED',
      description: description,
      processedAt: new Date()
    };

    wallet.transactions.unshift(transaction);

    return of(transaction);
  }

  // Payer avec le wallet (spécial pour le checkout)
  pay(userId: number, amount: number, description: string): Observable<Transaction> {
    return this.withdraw(userId, amount, description);
  }

  // Récupérer l'historique des transactions
  getTransactionHistory(userId: number): Observable<Transaction[]> {
    const wallet = this.userWallets.get(userId);
    if (wallet) {
      return of([...wallet.transactions]);
    }
    return of([]);
  }
}
