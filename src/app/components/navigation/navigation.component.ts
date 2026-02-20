import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/api.models';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="sticky top-0 z-50 w-full border-b border-olive-green/20 bg-forest-green shadow-sm">
      <nav class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 items-center justify-between">
          <!-- Logo -->
          <a routerLink="/" class="flex items-center gap-2 cursor-pointer">
            <span class="text-2xl">⛺</span>
            <span class="text-xl font-bold text-cream-beige">CampConnect</span>
          </a>

          <!-- Desktop Navigation -->
          <div class="hidden md:flex items-center gap-8">
            <a routerLink="/"
               routerLinkActive="text-sage-green"
               [routerLinkActiveOptions]="{exact: true}"
               class="text-cream-beige hover:text-sage-green transition-colors">
              Home
            </a>
            <a routerLink="/map"
               routerLinkActive="text-sage-green"
               class="text-cream-beige hover:text-sage-green transition-colors">
              Map
            </a>
            <a routerLink="/campsites"
               routerLinkActive="text-sage-green"
               class="text-cream-beige hover:text-sage-green transition-colors">
              Campsites
            </a>
            <a routerLink="/marketplace"
               routerLinkActive="text-sage-green"
               class="text-cream-beige hover:text-sage-green transition-colors">
              Marketplace
            </a>
            <a routerLink="/events"
               routerLinkActive="text-sage-green"
               class="text-cream-beige hover:text-sage-green transition-colors">
              Events
            </a>
            <a routerLink="/community"
               routerLinkActive="text-sage-green"
               class="text-cream-beige hover:text-sage-green transition-colors">
              Community
            </a>
            <!-- Seller Dashboard Link (only for sellers) -->
            <a *ngIf="currentUser?.role === 'SELLER'"
               routerLink="/seller"
               routerLinkActive="text-sage-green"
               class="text-cream-beige hover:text-sage-green transition-colors">
              Seller Dashboard
            </a>
          </div>

          <!-- Right Side Icons -->
          <div class="flex items-center gap-4">
            <!-- Shopping Cart with Badge -->
            <a routerLink="/client"
               [queryParams]="{tab: 'cart'}"
               class="relative text-cream-beige hover:text-sage-green transition-colors">
              <span class="text-2xl">🛒</span>
              <span *ngIf="cartCount > 0"
                    class="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {{cartCount}}
              </span>
            </a>

            <!-- User Profile / Auth -->
            <div class="relative" *ngIf="currentUser; else loginButton">
              <button (click)="toggleUserMenu()" class="flex items-center gap-2 text-cream-beige hover:text-sage-green transition-colors">
                <span class="text-2xl">👤</span>
                <span class="hidden lg:inline text-sm">{{ currentUser.name }}</span>
              </button>
              <!-- User Dropdown -->
              <div *ngIf="userMenuOpen" class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                <div class="px-4 py-2 border-b">
                  <p class="text-sm font-medium text-gray-900">{{ currentUser.name }}</p>
                  <p class="text-xs text-gray-500">{{ currentUser.email }}</p>
                </div>
                <a routerLink="/client" (click)="userMenuOpen = false"
                   class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  My Account
                </a>
                <a *ngIf="currentUser.role === 'SELLER'" routerLink="/seller" (click)="userMenuOpen = false"
                   class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Seller Dashboard
                </a>
                <button (click)="logout()"
                        class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                  Logout
                </button>
              </div>
            </div>
            <ng-template #loginButton>
              <a routerLink="/auth/login"
                 class="text-cream-beige hover:text-sage-green transition-colors flex items-center gap-1">
                <span class="text-2xl">👤</span>
                <span class="hidden lg:inline text-sm">Login</span>
              </a>
            </ng-template>

            <!-- Mobile Menu Button -->
            <button
              (click)="toggleMobileMenu()"
              class="md:hidden text-cream-beige">
              {{mobileMenuOpen ? '✕' : '☰'}}
            </button>
          </div>
        </div>

        <!-- Mobile Menu -->
        <div *ngIf="mobileMenuOpen"
             class="md:hidden py-4 space-y-2 border-t border-olive-green/20">
          <a routerLink="/"
             (click)="toggleMobileMenu()"
             class="block py-2 text-cream-beige hover:text-sage-green">
            Home
          </a>
          <a routerLink="/map"
             (click)="toggleMobileMenu()"
             class="block py-2 text-cream-beige hover:text-sage-green">
            Map
          </a>
          <a routerLink="/campsites"
             (click)="toggleMobileMenu()"
             class="block py-2 text-cream-beige hover:text-sage-green">
            Campsites
          </a>
          <a routerLink="/marketplace"
             (click)="toggleMobileMenu()"
             class="block py-2 text-cream-beige hover:text-sage-green">
            Marketplace
          </a>
          <a routerLink="/events"
             (click)="toggleMobileMenu()"
             class="block py-2 text-cream-beige hover:text-sage-green">
            Events
          </a>
          <a routerLink="/community"
             (click)="toggleMobileMenu()"
             class="block py-2 text-cream-beige hover:text-sage-green">
            Community
          </a>
          <a *ngIf="currentUser?.role === 'SELLER'"
             routerLink="/seller"
             (click)="toggleMobileMenu()"
             class="block py-2 text-cream-beige hover:text-sage-green">
            Seller Dashboard
          </a>
          <div class="border-t border-olive-green/20 pt-2 mt-2">
            <ng-container *ngIf="currentUser; else mobileLogin">
              <a routerLink="/client"
                 (click)="toggleMobileMenu()"
                 class="block py-2 text-cream-beige hover:text-sage-green">
                My Account
              </a>
              <button (click)="logout(); toggleMobileMenu()"
                      class="block w-full text-left py-2 text-red-400 hover:text-red-300">
                Logout
              </button>
            </ng-container>
            <ng-template #mobileLogin>
              <a routerLink="/auth/login"
                 (click)="toggleMobileMenu()"
                 class="block py-2 text-cream-beige hover:text-sage-green">
                Login / Register
              </a>
            </ng-template>
          </div>
        </div>
      </nav>
    </header>
  `
})
export class NavigationComponent implements OnInit {
  mobileMenuOpen = false;
  userMenuOpen = false;
  cartCount = 0;
  currentUser: User | null = null;

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cartService.cart$.subscribe(items => {
      this.cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
    });

    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    this.userMenuOpen = false;
  }

  toggleUserMenu() {
    this.userMenuOpen = !this.userMenuOpen;
  }

  logout() {
    this.authService.logout();
    this.userMenuOpen = false;
    this.router.navigate(['/']);
  }
}
