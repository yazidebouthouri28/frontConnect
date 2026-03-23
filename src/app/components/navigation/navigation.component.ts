import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

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

  constructor(private router: Router) { }

  get isLoggedIn(): boolean {
    return !!localStorage.getItem('campconnect_user');
  }

  get userName(): string {
    try {
      const user = JSON.parse(localStorage.getItem('campconnect_user') || '{}');
      return user.name || '';
    } catch {
      return '';
    }
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  toggleProfileDropdown() {
    this.profileDropdownOpen = !this.profileDropdownOpen;
  }

  logout() {
    localStorage.removeItem('campconnect_user');
    this.profileDropdownOpen = false;
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
