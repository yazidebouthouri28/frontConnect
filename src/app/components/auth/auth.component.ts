import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface CarouselSlide {
  headline: string;
  description: string;
  image: string;
}

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
  isSubmittingLogin = false;

  loginEmail = '';
  loginPassword = '';
  signupName = '';
  signupEmail = '';
  signupDob = '';
  signupGender = '';
  signupPhone = '';
  signupPassword = '';
  signupConfirmPassword = '';

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

  constructor(private router: Router, private authService: AuthService) { }

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
    if (!this.loginEmail.trim() || !this.loginPassword) {
      this.loginError = 'Veuillez saisir votre identifiant et mot de passe.';
      return;
    }

    this.loginError = '';
    this.isSubmittingLogin = true;

    this.authService.login({
      email: this.loginEmail.trim(),
      password: this.loginPassword,
    }).subscribe({
      next: (auth) => {
        this.isSubmittingLogin = false;
        const role = auth.user.role;

        if (role === 'ADMIN') {
          this.router.navigate(['/admin']);
          return;
        }

        const prefsDone = localStorage.getItem(`campconnect_preferences_done_${auth.user.email}`);
        if (prefsDone === 'true') {
          this.router.navigate(['/home']);
        } else {
          this.router.navigate(['/preferences']);
        }
      },
      error: (error: Error) => {
        this.isSubmittingLogin = false;
        this.loginError = error.message || 'Login failed. Please check your credentials.';
      }
    });
  }

  onSubmitSignup() {
    if (this.signupPassword !== this.signupConfirmPassword) {
      alert('Passwords do not match');
      return;
    }
    console.log('Sign up', {
      name: this.signupName,
      email: this.signupEmail,
      dob: this.signupDob,
      gender: this.signupGender,
      phone: this.signupPhone,
      password: this.signupPassword,
    });
  }
}
