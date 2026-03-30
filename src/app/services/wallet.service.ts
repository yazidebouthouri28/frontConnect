// src/app/services/wallet.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Wallet } from '../models/wallet';

@Injectable({
  providedIn: 'root'
})
export class WalletService {

  // Pour l'instant, on utilise des données mockées
  // Plus tard, on remplacera par de vraies appels HTTP
  private mockWallets: Wallet[] = [
    {
      id: 1,
      user: { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
      balance: 1500.50,
      totalDeposited: 2000,
      totalWithdrawn: 499.50,
      currency: 'TND',
      isActive: true,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-02-20')
    },
    {
      id: 2,
      user: { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' },
      balance: 3200.00,
      totalDeposited: 3500,
      totalWithdrawn: 300,
      currency: 'TND',
      isActive: true,
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-02-25')
    },
    {
      id: 3,
      user: { id: 3, firstName: 'Mohamed', lastName: 'Ben Ali', email: 'mohamed@example.com' },
      balance: 0,
      totalDeposited: 0,
      totalWithdrawn: 0,
      currency: 'TND',
      isActive: false,
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-02-01')
    }
  ];

  constructor(private http: HttpClient) { }

  // CREATE - Ajouter un wallet
  createWallet(walletData: any): Observable<Wallet> {
    // Simuler un appel API avec un nouveau wallet
    const newWallet: Wallet = {
      id: this.mockWallets.length + 1,
      user: { id: walletData.user.id },
      balance: walletData.balance || 0,
      totalDeposited: 0,
      totalWithdrawn: 0,
      currency: walletData.currency || 'TND',
      isActive: walletData.isActive !== undefined ? walletData.isActive : true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.mockWallets.push(newWallet);

    // Simuler une réponse asynchrone
    return of(newWallet);
  }

  // READ - Récupérer tous les wallets
  getAllWallets(): Observable<Wallet[]> {
    // Simuler un appel API
    return of([...this.mockWallets]);
  }

  // READ - Récupérer un wallet par son ID
  getWalletById(id: number): Observable<Wallet> {
    const wallet = this.mockWallets.find(w => w.id === id);
    return of(wallet!);
  }

  // READ - Récupérer un wallet par ID utilisateur
  getWalletByUserId(userId: number): Observable<Wallet> {
    const wallet = this.mockWallets.find(w => w.user?.id === userId);
    return of(wallet!);
  }

  // UPDATE - Modifier un wallet
  updateWallet(id: number, walletData: any): Observable<Wallet> {
    const index = this.mockWallets.findIndex(w => w.id === id);
    if (index !== -1) {
      this.mockWallets[index] = {
        ...this.mockWallets[index],
        balance: walletData.balance !== undefined ? walletData.balance : this.mockWallets[index].balance,
        currency: walletData.currency || this.mockWallets[index].currency,
        isActive: walletData.isActive !== undefined ? walletData.isActive : this.mockWallets[index].isActive,
        updatedAt: new Date()
      };
      return of(this.mockWallets[index]);
    }
    throw new Error('Wallet non trouvé');
  }

  // DELETE - Supprimer un wallet
  deleteWallet(id: number): Observable<void> {
    const index = this.mockWallets.findIndex(w => w.id === id);
    if (index !== -1) {
      this.mockWallets.splice(index, 1);
      return of(void 0);
    }
    throw new Error('Wallet non trouvé');
  }
}
