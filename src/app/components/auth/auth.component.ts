import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

interface CarouselSlide {
  headline: string;
  description: string;
  image: string;
}

import { UserService, UserAccount } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
})
export class AuthComponent implements OnInit, OnDestroy {
  isLogin = signal(true);
  logoError = false;
  currentYear = new Date().getFullYear();
  loginError = '';

  loginEmail = '';
  loginPassword = '';
  signupName = '';
  signupEmail = '';
  signupDob = '';
  signupGender = '';
  signupPhone = '';
  signupPassword = '';
  signupConfirmPassword = '';
  signupRole: 'ADMIN' | 'ORGANIZER' | 'PARTICIPANT' | 'USER' = 'USER';

  showLoginPassword = false;
  showSignupPassword = false;
  showSignupConfirm = false;

  private carouselInterval: ReturnType<typeof setInterval> | null = null;
  readonly CAROUSEL_INTERVAL_MS = 5000;

  currentSlide = 0;
  carouselSlides: CarouselSlide[] = [
    {
      headline: 'Discover unforgettable camping experiences',
      description: 'Connect with nature, find the perfect campsite, and join a community of outdoor enthusiasts who share your passion for adventure.',
      image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=1200',
    },
    {
      headline: 'Book campsites and join events',
      description: 'From family weekends to backcountry trips—browse, book, and get tickets for workshops and camping events near you.',
      image: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?q=80&w=1200',
    },
    {
      headline: 'Gear up at the marketplace',
      description: 'Buy or rent quality camping equipment and earn loyalty points on every purchase. Everything you need for your next trip.',
      image: 'https://images.unsplash.com/photo-1627820988643-8077d82eed7d?q=80&w=1200',
    },
  ];

  constructor(
    private router: Router,
    private userService: UserService,
    private authService: AuthService
  ) { }

  get slide(): CarouselSlide {
    return this.carouselSlides[this.currentSlide];
  }

  ngOnInit() {
    this.carouselInterval = setInterval(() => this.nextSlide(), this.CAROUSEL_INTERVAL_MS);
  }

  ngOnDestroy() {
    if (this.carouselInterval) clearInterval(this.carouselInterval);
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.carouselSlides.length;
  }

  switchToSignup() {
    this.isLogin.set(false);
  }

  switchToLogin() {
    this.isLogin.set(true);
  }

  onSubmitLogin() {
    this.loginError = '';
    this.authService.login({ email: this.loginEmail, password: this.loginPassword }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const account = response.data;
          if (['ADMIN', 'ORGANIZER', 'PARTICIPANT'].includes(account.role)) {
            this.router.navigate(['/admin']);
          } else {
            const prefsDone = localStorage.getItem(`campconnect_preferences_done_${account.email}`);
            if (prefsDone === 'true') {
              this.router.navigate(['/home']);
            } else {
              this.router.navigate(['/preferences']);
            }
          }
        } else {
          this.loginError = response.message || 'Identifiants invalides.';
        }
      },
      error: (err) => {
        this.loginError = `Erreur ${err.status || ''}: ${err.error?.message || err.message || 'Connexion impossible'}`;
        console.error('Login error:', err);
      }
    });
  }

  onSubmitSignup() {
    if (this.signupPassword !== this.signupConfirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }

    const userData = {
      name: this.signupName,
      username: this.signupEmail.split('@')[0], // Generate username from email to satisfy backend validation
      email: this.signupEmail,
      password: this.signupPassword,
      role: this.signupRole,
      phone: this.signupPhone || ''
    };

    this.authService.register(userData).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Compte créé avec succès ! Connectez-vous maintenant.');
          this.isLogin.set(true);
        } else {
          alert(response.message || 'Erreur lors de l\'inscription');
        }
      },
      error: (err) => {
        let detail = err.error?.message || err.message || 'Erreur inconnue';
        
        // Extract specific field validation errors from Spring Boot @Valid
        if (err.error?.data && typeof err.error.data === 'object' && Object.keys(err.error.data).length > 0) {
          const fieldErrors = Object.entries(err.error.data)
            .map(([field, msg]) => `- ${field}: ${msg}`)
            .join('\n');
          detail += `\n\nDétails spécifiques :\n${fieldErrors}`;
        }
        
        alert(`Erreur d'inscription (${err.status}): ${detail}`);
        console.error('Signup error:', err);
      }
    });
  }
}
