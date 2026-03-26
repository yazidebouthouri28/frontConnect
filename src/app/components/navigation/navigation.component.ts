import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

interface StoredUser {
  name?: string;
  email?: string;
  role?: string;
  avatar?: string;
}

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css'],
})
export class NavigationComponent {
  mobileMenuOpen = false;
  profileDropdownOpen = false;
  logoError = false;

  constructor(private router: Router) {}

  get currentUser(): StoredUser | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }

    const rawUser = localStorage.getItem('campconnect_user');
    if (!rawUser) {
      return null;
    }

    try {
      return JSON.parse(rawUser) as StoredUser;
    } catch {
      return null;
    }
  }

  get isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  get userName(): string {
    return this.currentUser?.name ?? '';
  }

  get isSeller(): boolean {
    return this.currentUser?.role === 'SELLER';
  }

  get isSponsor(): boolean {
    return this.currentUser?.role === 'SPONSOR';
  }

  get isAdmin(): boolean {
    return this.currentUser?.role === 'ADMIN';
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  toggleProfileDropdown() {
    this.profileDropdownOpen = !this.profileDropdownOpen;
  }

  logout() {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('campconnect_user');
    }

    this.profileDropdownOpen = false;
    this.mobileMenuOpen = false;
    this.router.navigate(['/login']);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.profile-dropdown-container')) {
      this.profileDropdownOpen = false;
    }
  }
}
