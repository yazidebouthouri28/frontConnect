import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../models/api.models';
import { PaymentService } from '../../services/paymentservice';
import { WalletService } from '../../services/wallet.service';  // ← Ajout pour les opérations CRUD
import { PointsService } from '../../services/points';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  // Variables existantes
  cartItems: CartItem[] = [];
  walletBalance: number = 0;
  userId = 1;
  shipping = 15.00;
  taxRate = 0.10;
  loyaltyPoints: number = 0;
  usePoints: boolean = false;

  // Nouvelles variables pour les opérations CRUD Wallet
  walletId: number | null = null;
  walletInfo: any = null;
  showCreateWalletForm: boolean = false;
  showUpdateWalletForm: boolean = false;
  customAmount: number = 0;
  customWithdrawAmount: number = 0;

  // Données pour créer un nouveau wallet
  newWallet = {
    userId: null as number | null,
    balance: 0,
    currency: 'TND',
    isActive: true
  };

  // Données pour mettre à jour le wallet
  updateWalletData = {
    balance: 0,
    currency: 'TND',
    isActive: true
  };

  constructor(
    private location: Location,
    private router: Router,
    private cartService: CartService,
    private paymentService: PaymentService,
    private walletService: WalletService,  // ← Ajout pour les opérations CRUD
    private pointsService: PointsService
  ) {}

  ngOnInit(): void {
    // Subscribe to cart updates
    this.cartService.cart$.subscribe(items => {
      this.cartItems = items;
    });

    // Charger le solde du wallet
    this.paymentService.getBalance(this.userId).subscribe({
      next: (res: any) => {
        this.walletBalance = res;
      },
      error: (err) => {
        console.error('Erreur chargement solde:', err);
        this.walletBalance = 0;
      }
    });

    // Charger les points de fidélité
    this.pointsService.getPoints(this.userId).subscribe(res => {
      this.loyaltyPoints = res;
    });

    // Charger les détails complets du wallet
    this.loadWalletDetails();
  }

  // ============================================
  // MÉTHODES EXISTANTES (inchangées)
  // ============================================

  goBack() {
    this.location.back();
  }

  get subtotal(): number {
    return this.cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }

  get tax(): number {
    return this.subtotal * this.taxRate;
  }

  get total(): number {
    return this.subtotal + this.shipping + this.tax;
  }

  get pointsToEarn(): number {
    return Math.floor(this.total);
  }

  incrementQuantity(item: CartItem) {
    this.cartService.updateQuantity(item.productId, item.quantity + 1).subscribe();
  }

  decrementQuantity(item: CartItem) {
    if (item.quantity > 1) {
      this.cartService.updateQuantity(item.productId, item.quantity - 1).subscribe();
    }
  }

  removeItem(item: CartItem) {
    this.cartService.removeFromCart(item.productId).subscribe();
  }

  clearCart() {
    if (confirm('Are you sure you want to clear your cart?')) {
      this.cartService.clearCart().subscribe();
    }
  }

  // ============================================
  // MÉTHODES DE RAFRAÎCHISSEMENT
  // ============================================

  refreshBalance() {
    this.paymentService.getBalance(this.userId)
      .subscribe({
        next: (res: any) => {
          this.walletBalance = res;
        },
        error: (err) => {
          console.error('Erreur rafraîchissement:', err);
        }
      });
  }

  // ============================================
  // MÉTHODES CRUD WALLET
  // ============================================

  // READ - Charger les détails du wallet
  loadWalletDetails() {
    // ✅ CORRECT : utiliser getWalletByUserId avec userId
    this.walletService.getWalletByUserId(this.userId).subscribe({
      next: (wallet) => {
        this.walletInfo = wallet;
        this.walletId = wallet.id ? wallet.id : null;// verif si exit wale
        this.walletBalance = wallet.balance;
        this.updateWalletData = {
          balance: wallet.balance,
          currency: wallet.currency,
          isActive: wallet.isActive
        };
      },
      error: (err) => {
        console.error('Wallet non trouvé:', err);
        this.walletInfo = null;
        this.walletId = null;
      }
    });
  }

  // CREATE - Créer un wallet
  createWallet() {
    if (!this.newWallet.userId) {
      alert('User ID requis');
      return;
    }

    this.walletService.createWallet({
      user: { id: this.newWallet.userId },
      balance: this.newWallet.balance,
      currency: this.newWallet.currency,
      isActive: this.newWallet.isActive
    }).subscribe({
      next: (wallet) => {
        alert('Wallet créé avec succès!');
        this.showCreateWalletForm = false;
        this.loadWalletDetails();
        this.refreshBalance();
        // Réinitialiser le formulaire
        this.newWallet = { userId: null, balance: 0, currency: 'TND', isActive: true };
      },
      error: (err) => {
        console.error('Erreur création:', err);
        alert('Erreur lors de la création du wallet');
      }
    });
  }

  // UPDATE - Modifier le wallet
  updateWallet() {
    if (!this.walletId) {
      alert('Aucun wallet à modifier');
      return;
    }

    this.walletService.updateWallet(this.walletId, this.updateWalletData).subscribe({
      next: () => {
        alert('Wallet modifié avec succès!');
        this.showUpdateWalletForm = false;
        this.loadWalletDetails();
        this.refreshBalance();
      },
      error: (err) => {
        console.error('Erreur modification:', err);
        alert('Erreur lors de la modification du wallet');
      }
    });
  }

  // DELETE - Supprimer le wallet
  deleteWallet() {
    if (!this.walletId) {
      alert('Aucun wallet à supprimer');
      return;
    }

    if (confirm('Êtes-vous sûr de vouloir supprimer ce wallet ? Cette action est irréversible.')) {
      this.walletService.deleteWallet(this.walletId).subscribe({
        next: () => {
          alert('Wallet supprimé avec succès!');
          this.walletId = null;
          this.walletInfo = null;
          this.walletBalance = 0;
        },
        error: (err) => {
          console.error('Erreur suppression:', err);
          alert('Erreur lors de la suppression du wallet');
        }
      });
    }
  }

  // ============================================
  // MÉTHODES DE PAIEMENT (avec montants personnalisables)
  // ============================================

  // Ajouter des fonds avec montant personnalisé
  addFunds(amount?: number) {
    const depositAmount = amount || this.customAmount;

    if (!depositAmount || depositAmount <= 0) {
      alert('Veuillez entrer un montant valide');
      return;
    }

    this.paymentService.deposit(this.userId, depositAmount, "Add funds").subscribe({
      next: (res) => {
        console.log("Deposit OK", res);
        this.refreshBalance();
        this.loadWalletDetails();
        alert(`${depositAmount} DT ajoutés avec succès!`);
        this.customAmount = 0;
      },
      error: (err) => {
        console.error("Erreur dépôt:", err);
        alert('Erreur lors du dépôt');
      }
    });
  }

  // Retirer des fonds avec montant personnalisé
  withdrawFunds(amount?: number) {
    const withdrawAmount = amount || this.customWithdrawAmount;

    if (!withdrawAmount || withdrawAmount <= 0) {
      alert('Veuillez entrer un montant valide');
      return;
    }

    if (this.walletBalance < withdrawAmount) {
      alert('Solde insuffisant pour ce retrait');
      return;
    }

    this.paymentService.withdraw(this.userId, withdrawAmount, "Withdraw").subscribe({
      next: (res) => {
        console.log("Withdraw OK", res);
        this.refreshBalance();
        this.loadWalletDetails();
        alert(`${withdrawAmount} DT retirés avec succès!`);
        this.customWithdrawAmount = 0;
      },
      error: (err) => {
        console.error("Erreur retrait:", err);
        alert('Erreur lors du retrait');
      }
    });
  }

  // Paiement final
  proceedToCheckout() {
    let finalAmount = this.total;

    if (this.usePoints) {
      finalAmount = this.total - this.loyaltyPoints;
      if (finalAmount < 0) finalAmount = 0;
    }

    if (this.walletBalance < finalAmount) {
      alert(`Solde insuffisant ! Solde actuel: ${this.walletBalance} DT, Montant à payer: ${finalAmount} DT`);
      return;
    }

    this.paymentService.pay(this.userId, finalAmount, "Payment").subscribe({
      next: (res) => {
        alert("Paiement réussi !");
        this.refreshBalance();
        this.loadWalletDetails();
        this.clearCart();
        // Optionnel: rediriger vers une page de confirmation
        // this.router.navigate(['/order-confirmation']);
      },
      error: (err) => {
        console.error("Erreur paiement:", err);
        alert('Erreur lors du paiement');
      }
    });
  }

  // ============================================
  // MÉTHODES UTILITAIRES
  // ============================================

  // Formater la date (si nécessaire)
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }

  // Ouvrir le formulaire de création
  openCreateWalletForm() {
    this.showCreateWalletForm = true;
  }

  // Ouvrir le formulaire de modification
  openUpdateWalletForm() {
    if (this.walletInfo) {
      this.updateWalletData = {
        balance: this.walletInfo.balance,
        currency: this.walletInfo.currency,
        isActive: this.walletInfo.isActive
      };
      this.showUpdateWalletForm = true;
    } else {
      alert('Aucun wallet à modifier');
    }
  }
}
