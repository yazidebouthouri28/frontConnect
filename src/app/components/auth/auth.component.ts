import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { User } from '../../models/api.models';

type UserRole = User['role'];

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit, OnDestroy {

  isLoginMode = true;
  isSidebarAnimatingOut = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  returnUrl = '/';

  /* Password visibility toggles */
  showLoginPassword = false;
  showSignupPassword = false;

  currentYear = new Date().getFullYear();

  /** Campfire stars + audio */
  stars: { id: number; x: number; y: number }[] = [];
  private starIdCounter = 0;
  private campfireAudio: HTMLAudioElement | null = null;
  private owlAudio: HTMLAudioElement | null = null;
  private cricketAudio: HTMLAudioElement | null = null;
  private readonly isBrowser = typeof window !== 'undefined';
  private removeAudioUnlockListeners: (() => void) | null = null;

  /* ===== Forms ===== */
  loginForm = { email: '', password: '' };

  registerForm = {
    name: '',
    username: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    country: '',
    age: null as number | null,
    role: 'CLIENT' as UserRole,
    isSeller: false,
    isBuyer: true,
    storeName: '',
    bio: ''
  };

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  /* ===== Lifecycle ===== */
  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    if (this.router.url.includes('register')) this.isLoginMode = false;
    if (this.authService.isAuthenticated()) this.router.navigate([this.returnUrl]);
    if (this.isBrowser) {
      this.initCampfireAudio();
      this.startAmbientAudio();
    }
  }

  ngOnDestroy(): void {
    if (this.removeAudioUnlockListeners) {
      this.removeAudioUnlockListeners();
      this.removeAudioUnlockListeners = null;
    }
    if (this.campfireAudio) {
      this.campfireAudio.pause();
      this.campfireAudio = null;
    }
    if (this.owlAudio) {
      this.owlAudio.pause();
      this.owlAudio = null;
    }
    if (this.cricketAudio) {
      this.cricketAudio.pause();
      this.cricketAudio = null;
    }
  }

  /* ===== Mode switching ===== */
  switchToSignup(): void {
    this.animateSidebarSwitch(false);
  }

  switchToLogin(): void {
    this.animateSidebarSwitch(true);
  }

  /* ===== Role change ===== */
  onRoleChange(): void {
    this.registerForm.isSeller = this.registerForm.role === 'SELLER';
  }

  /* ===== Login ===== */
  login(): void {
    if (!this.loginForm.email || !this.loginForm.password) {
      this.errorMessage = 'Please fill in all fields'; return;
    }
    this.isLoading = true;
    this.clearMessages();
    this.authService.login(this.loginForm).subscribe({
      next: () => { this.cartService.syncCartAfterLogin(); this.router.navigate([this.returnUrl]); },
      error: (err) => { this.isLoading = false; this.errorMessage = err.message || 'Login failed.'; }
    });
  }

  /* ===== Register ===== */
  register(): void {
    if (!this.registerForm.name || !this.registerForm.username ||
      !this.registerForm.email || !this.registerForm.password) {
      this.errorMessage = 'Please fill in all required fields'; return;
    }
    if (this.registerForm.username.length < 3) { this.errorMessage = 'Username must be at least 3 characters'; return; }
    if (this.registerForm.password.length < 6) { this.errorMessage = 'Password must be at least 6 characters'; return; }

    this.isLoading = true;
    this.clearMessages();

    const payload: any = {
      name: this.registerForm.name,
      username: this.registerForm.username,
      email: this.registerForm.email,
      password: this.registerForm.password,
      role: this.registerForm.role,
      isSeller: this.registerForm.role === 'SELLER',
      isBuyer: this.registerForm.isBuyer,
      avatar: 'avatar.png'
    };
    if (this.registerForm.phone) payload.phone = this.registerForm.phone;
    if (this.registerForm.address) payload.address = this.registerForm.address;
    if (this.registerForm.country) payload.country = this.registerForm.country;
    if (this.registerForm.age) payload.age = this.registerForm.age;
    if (this.registerForm.storeName) payload.storeName = this.registerForm.storeName;
    if (this.registerForm.bio) payload.bio = this.registerForm.bio;

    this.authService.register(payload).subscribe({
      next: () => {
        this.successMessage = 'Account created! Redirecting…';
        this.cartService.syncCartAfterLogin();
        setTimeout(() => this.router.navigate([this.returnUrl]), 1200);
      },
      error: (err) => { this.isLoading = false; this.errorMessage = err.message || 'Registration failed.'; }
    });
  }

  /* ===== Helpers ===== */
  clearMessages(): void { this.errorMessage = ''; this.successMessage = ''; }

  private animateSidebarSwitch(targetIsLogin: boolean): void {
    if (this.isLoginMode === targetIsLogin || this.isSidebarAnimatingOut) return;

    this.isSidebarAnimatingOut = true;

    setTimeout(() => {
      this.isLoginMode = targetIsLogin;
      this.clearMessages();

      setTimeout(() => {
        this.isSidebarAnimatingOut = false;
      }, 30);

    }, 200);
  }

  private initCampfireAudio(): void {
    try {
      this.campfireAudio = new Audio(this.publicUrl('Fire Crackling Sound Effect.mp3'));
      this.campfireAudio.loop = true;
      this.campfireAudio.volume = 0.4;
      this.owlAudio = new Audio(this.publicUrl('Sound Effects - Owl Hooting Noise.mp3'));
      this.owlAudio.loop = true;
      this.owlAudio.volume = 0.25;
      this.cricketAudio = new Audio(this.publicUrl('Cricket  Sound Effect.mp3'));
      this.cricketAudio.loop = true;
      this.cricketAudio.volume = 0.2;
    } catch {
      this.campfireAudio = null;
      this.owlAudio = null;
      this.cricketAudio = null;
    }
  }

  private publicUrl(fileName: string): string {
    // Files in Angular's `public/` are served from the site root.
    return encodeURI(`/${fileName}`);
  }

  private startAmbientAudio(): void {
    // Try immediately (works if the browser allows autoplay).
    this.tryPlayAmbient().then((played) => {
      if (played) return;
      // Autoplay blocked: unlock on first user interaction anywhere on the page.
      this.installAudioUnlockListeners();
    });
  }

  private async tryPlayAmbient(): Promise<boolean> {
    const tasks: Promise<unknown>[] = [];
    if (this.campfireAudio) tasks.push(this.campfireAudio.play());
    if (this.owlAudio) tasks.push(this.owlAudio.play());
    if (this.cricketAudio) tasks.push(this.cricketAudio.play());
    if (tasks.length === 0) return false;

    const results = await Promise.allSettled(tasks);
    return results.some((r) => r.status === 'fulfilled');
  }

  private installAudioUnlockListeners(): void {
    if (!this.isBrowser || this.removeAudioUnlockListeners) return;

    const handler = async () => {
      const played = await this.tryPlayAmbient();
      if (played && this.removeAudioUnlockListeners) {
        this.removeAudioUnlockListeners();
        this.removeAudioUnlockListeners = null;
      }
    };

    window.addEventListener('pointerdown', handler, { passive: true });
    window.addEventListener('keydown', handler);
    window.addEventListener('touchstart', handler, { passive: true });

    this.removeAudioUnlockListeners = () => {
      window.removeEventListener('pointerdown', handler);
      window.removeEventListener('keydown', handler);
      window.removeEventListener('touchstart', handler);
    };
  }

  onCampfireMove(event: MouseEvent): void {
    const target = event.currentTarget as HTMLElement | null;
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const baseX = event.clientX - rect.left;
    const baseY = event.clientY - rect.top;

    const STARS_PER_MOVE = 4;
    const RADIUS_MIN = 6;
    const RADIUS_MAX = 18;

    for (let i = 0; i < STARS_PER_MOVE; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = RADIUS_MIN + Math.random() * (RADIUS_MAX - RADIUS_MIN);
      const x = baseX + Math.cos(angle) * radius;
      const y = baseY + Math.sin(angle) * radius;

      const id = ++this.starIdCounter;
      this.stars.push({ id, x, y });

      setTimeout(() => {
        this.stars = this.stars.filter(star => star.id !== id);
      }, 700);
    }
  }
}
