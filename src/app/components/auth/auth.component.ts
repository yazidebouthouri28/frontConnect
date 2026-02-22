import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h2>{{ isLoginMode ? 'Welcome Back' : 'Create Account' }}</h2>
          <p>{{ isLoginMode ? 'Sign in to continue' : 'Join our camping community' }}</p>
        </div>

        <div class="auth-tabs">
          <button 
            [class.active]="isLoginMode" 
            (click)="isLoginMode = true; clearError()">
            Login
          </button>
          <button 
            [class.active]="!isLoginMode" 
            (click)="isLoginMode = false; clearError()">
            Register
          </button>
        </div>

        <div *ngIf="errorMessage" class="error-message">
          <span>⚠️</span> {{ errorMessage }}
        </div>

        <div *ngIf="successMessage" class="success-message">
          <span>✅</span> {{ successMessage }}
        </div>

        <!-- Login Form -->
        <form *ngIf="isLoginMode" (ngSubmit)="login()" class="auth-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email" 
              [(ngModel)]="loginForm.email" 
              name="email" 
              placeholder="your@email.com"
              required>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input 
              type="password" 
              id="password" 
              [(ngModel)]="loginForm.password" 
              name="password" 
              placeholder="••••••••"
              required>
          </div>

          <button type="submit" class="submit-btn" [disabled]="isLoading">
            {{ isLoading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <!-- Register Form -->
        <form *ngIf="!isLoginMode" (ngSubmit)="register()" class="auth-form">
          <div class="form-row">
            <div class="form-group">
              <label for="name">Full Name *</label>
              <input 
                type="text" 
                id="name" 
                [(ngModel)]="registerForm.name" 
                name="name" 
                placeholder="John Doe"
                required>
            </div>

            <div class="form-group">
              <label for="username">Username *</label>
              <input 
                type="text" 
                id="username" 
                [(ngModel)]="registerForm.username" 
                name="username" 
                placeholder="johndoe"
                required
                minlength="3">
            </div>
          </div>

          <div class="form-group">
            <label for="regEmail">Email *</label>
            <input 
              type="email" 
              id="regEmail" 
              [(ngModel)]="registerForm.email" 
              name="email" 
              placeholder="your@email.com"
              required>
          </div>

          <div class="form-group">
            <label for="regPassword">Password *</label>
            <input 
              type="password" 
              id="regPassword" 
              [(ngModel)]="registerForm.password" 
              name="password" 
              placeholder="••••••••"
              required
              minlength="6">
          </div>

          <!-- Role Selection - PROMINENT -->
          <div class="form-group role-selection">
            <label class="role-label">Select Your Role *</label>
            <p class="role-hint">Choose the role that best describes how you'll use CampConnect</p>
            <div class="role-options">
              <label class="role-option" [class.selected]="registerForm.role === 'CLIENT'">
                <input 
                  type="radio" 
                  name="role" 
                  value="CLIENT" 
                  [(ngModel)]="registerForm.role">
                <div class="role-content">
                  <span class="role-icon">🛒</span>
                  <span class="role-name">Client</span>
                  <span class="role-desc">Shop products, book campsites, join events</span>
                </div>
              </label>

              <label class="role-option" [class.selected]="registerForm.role === 'SELLER'">
                <input 
                  type="radio" 
                  name="role" 
                  value="SELLER" 
                  [(ngModel)]="registerForm.role">
                <div class="role-content">
                  <span class="role-icon">🏪</span>
                  <span class="role-name">Seller</span>
                  <span class="role-desc">Sell camping gear and outdoor products</span>
                </div>
              </label>

              <label class="role-option" [class.selected]="registerForm.role === 'ORGANIZER'">
                <input 
                  type="radio" 
                  name="role" 
                  value="ORGANIZER" 
                  [(ngModel)]="registerForm.role">
                <div class="role-content">
                  <span class="role-icon">📅</span>
                  <span class="role-name">Organizer</span>
                  <span class="role-desc">Create and manage camping events</span>
                </div>
              </label>

              <label class="role-option" [class.selected]="registerForm.role === 'SPONSOR'">
                <input 
                  type="radio" 
                  name="role" 
                  value="SPONSOR" 
                  [(ngModel)]="registerForm.role">
                <div class="role-content">
                  <span class="role-icon">🤝</span>
                  <span class="role-name">Sponsor</span>
                  <span class="role-desc">Sponsor events and promote your brand</span>
                </div>
              </label>

              <label class="role-option" [class.selected]="registerForm.role === 'CAMPER'">
                <input 
                  type="radio" 
                  name="role" 
                  value="CAMPER" 
                  [(ngModel)]="registerForm.role">
                <div class="role-content">
                  <span class="role-icon">⛺</span>
                  <span class="role-name">Camper</span>
                  <span class="role-desc">Find campsites and outdoor experiences</span>
                </div>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label for="phone">Phone Number</label>
            <input 
              type="tel" 
              id="phone" 
              [(ngModel)]="registerForm.phone" 
              name="phone" 
              placeholder="+1 234 567 8900">
          </div>

          <div class="form-group">
            <label for="address">Address</label>
            <input 
              type="text" 
              id="address" 
              [(ngModel)]="registerForm.address" 
              name="address" 
              placeholder="123 Main St, Apt 4B">
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="city">City</label>
              <input 
                type="text" 
                id="city" 
                [(ngModel)]="registerForm.city" 
                name="city" 
                placeholder="New York">
            </div>

            <div class="form-group">
              <label for="country">Country</label>
              <select 
                id="country" 
                [(ngModel)]="registerForm.country" 
                name="country">
                <option value="">Select country</option>
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="UK">United Kingdom</option>
                <option value="DE">Germany</option>
                <option value="FR">France</option>
                <option value="AU">Australia</option>
                <option value="TN">Tunisia</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <button type="submit" class="submit-btn" [disabled]="isLoading">
            {{ isLoading ? 'Creating account...' : 'Create Account' }}
          </button>
        </form>

        <div class="auth-footer">
          <a routerLink="/">← Back to Home</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      padding: 20px;
    }

    .auth-card {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 20px;
      padding: 40px;
      width: 100%;
      max-width: 600px;
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .auth-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .auth-header h2 {
      color: #fff;
      font-size: 28px;
      margin-bottom: 8px;
    }

    .auth-header p {
      color: rgba(255, 255, 255, 0.6);
    }

    .auth-tabs {
      display: flex;
      gap: 10px;
      margin-bottom: 25px;
    }

    .auth-tabs button {
      flex: 1;
      padding: 12px;
      border: none;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.05);
      color: rgba(255, 255, 255, 0.6);
      cursor: pointer;
      transition: all 0.3s;
    }

    .auth-tabs button.active {
      background: linear-gradient(135deg, #10b981, #059669);
      color: #fff;
    }

    .error-message {
      background: rgba(239, 68, 68, 0.2);
      border: 1px solid rgba(239, 68, 68, 0.5);
      color: #fca5a5;
      padding: 12px 16px;
      border-radius: 10px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .success-message {
      background: rgba(16, 185, 129, 0.2);
      border: 1px solid rgba(16, 185, 129, 0.5);
      color: #6ee7b7;
      padding: 12px 16px;
      border-radius: 10px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-row {
      display: flex;
      gap: 15px;
    }

    .form-row .form-group {
      flex: 1;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-group label {
      color: rgba(255, 255, 255, 0.8);
      font-size: 14px;
    }

    .form-group input,
    .form-group select {
      padding: 14px 16px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.05);
      color: #fff;
      font-size: 16px;
      transition: all 0.3s;
    }

    .form-group select option {
      background: #1a1a2e;
      color: #fff;
    }

    .form-group input:focus,
    .form-group select:focus {
      outline: none;
      border-color: #10b981;
      background: rgba(255, 255, 255, 0.1);
    }

    .form-group input::placeholder {
      color: rgba(255, 255, 255, 0.3);
    }

    /* Role Selection Styles */
    .role-selection {
      margin: 10px 0;
      padding: 20px;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 15px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .role-label {
      font-size: 16px !important;
      font-weight: 600;
      color: #fff !important;
    }

    .role-hint {
      color: rgba(255, 255, 255, 0.5);
      font-size: 13px;
      margin-bottom: 15px;
    }

    .role-options {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 10px;
    }

    .role-option {
      position: relative;
      cursor: pointer;
    }

    .role-option input {
      position: absolute;
      opacity: 0;
      width: 0;
      height: 0;
    }

    .role-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 15px 10px;
      background: rgba(255, 255, 255, 0.05);
      border: 2px solid transparent;
      border-radius: 12px;
      transition: all 0.3s;
      text-align: center;
    }

    .role-option:hover .role-content {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.2);
    }

    .role-option.selected .role-content {
      background: rgba(16, 185, 129, 0.2);
      border-color: #10b981;
    }

    .role-icon {
      font-size: 28px;
      margin-bottom: 8px;
    }

    .role-name {
      color: #fff;
      font-weight: 600;
      font-size: 14px;
    }

    .role-desc {
      color: rgba(255, 255, 255, 0.5);
      font-size: 11px;
      margin-top: 4px;
      line-height: 1.3;
    }

    .submit-btn {
      padding: 16px;
      border: none;
      border-radius: 10px;
      background: linear-gradient(135deg, #10b981, #059669);
      color: #fff;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      margin-top: 10px;
    }

    .submit-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
    }

    .submit-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .auth-footer {
      margin-top: 25px;
      text-align: center;
    }

    .auth-footer a {
      color: rgba(255, 255, 255, 0.6);
      text-decoration: none;
      transition: color 0.3s;
    }

    .auth-footer a:hover {
      color: #10b981;
    }

    @media (max-width: 500px) {
      .form-row {
        flex-direction: column;
        gap: 16px;
      }

      .role-options {
        grid-template-columns: 1fr 1fr;
      }
    }
  `]
})
export class AuthComponent implements OnInit {
  isLoginMode = true;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  returnUrl = '/';

  loginForm = {
    email: '',
    password: ''
  };

  registerForm = {
    name: '',
    username: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    role: 'CLIENT' // Default role
  };

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    
    // Check if we should show register form
    if (this.router.url.includes('register')) {
      this.isLoginMode = false;
    }
    
    // Redirect if already logged in
    if (this.authService.isAuthenticated()) {
      this.router.navigate([this.returnUrl]);
    }
  }

  login(): void {
    if (!this.loginForm.email || !this.loginForm.password) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    this.isLoading = true;
    this.clearError();

    this.authService.login(this.loginForm).subscribe({
      next: () => {
        this.cartService.syncCartAfterLogin();
        this.router.navigate([this.returnUrl]);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Login failed. Please check your credentials.';
      }
    });
  }

  register(): void {
    if (!this.registerForm.name || !this.registerForm.username || 
        !this.registerForm.email || !this.registerForm.password) {
      this.errorMessage = 'Please fill in all required fields';
      return;
    }

    if (!this.registerForm.role) {
      this.errorMessage = 'Please select a role';
      return;
    }

    if (this.registerForm.username.length < 3) {
      this.errorMessage = 'Username must be at least 3 characters';
      return;
    }

    if (this.registerForm.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters';
      return;
    }

    this.isLoading = true;
    this.clearError();

    // Combine city and address for full address if both provided
    const fullAddress = this.registerForm.city 
      ? `${this.registerForm.address}, ${this.registerForm.city}`.trim()
      : this.registerForm.address;

    const registrationData = {
      name: this.registerForm.name,
      username: this.registerForm.username,
      email: this.registerForm.email,
      password: this.registerForm.password,
      phone: this.registerForm.phone || undefined,
      address: fullAddress || undefined,
      country: this.registerForm.country || undefined,
      role: this.registerForm.role as 'CLIENT' | 'SELLER' | 'ORGANIZER' | 'CAMPER' | 'SPONSOR'
    };

    this.authService.register(registrationData).subscribe({
      next: () => {
        this.successMessage = 'Account created successfully!';
        this.cartService.syncCartAfterLogin();
        setTimeout(() => {
          this.router.navigate([this.returnUrl]);
        }, 1000);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Registration failed. Please try again.';
      }
    });
  }

  clearError(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
}
