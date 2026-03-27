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
  isForgotMode = false;
  isSidebarAnimatingOut = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  returnUrl = '/';
  emailForReset = '';

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
    this.stopAudio(this.campfireAudio);
    this.stopAudio(this.owlAudio);
    this.stopAudio(this.cricketAudio);
  }

  private stopAudio(audio: HTMLAudioElement | null): void {
    if (audio) {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch (e) {}
    }
  }

  /* ===== Mode switching ===== */
  switchToSignup(): void {
    this.isForgotMode = false;
    this.animateSidebarSwitch(false);
  }

  switchToLogin(): void {
    this.isForgotMode = false;
    this.animateSidebarSwitch(true);
  }

  switchToForgot(): void {
    this.isForgotMode = true;
    this.clearMessages();
  }

  backToLogin(): void {
    this.isForgotMode = false;
    this.clearMessages();
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
      next: () => {
        this.cartService.syncCartAfterLogin();
        const user = this.authService.getCurrentUser();
        const role = user?.role;
        
        let redirect = this.returnUrl;
        if (role === 'ADMIN') redirect = '/admin';
        else if (role === 'CAMPER') redirect = '/user-preferences';
        else if (role === 'ORGANIZER') redirect = '/organizer';
        else if (role === 'PARTICIPANT') redirect = '/participant';

        this.router.navigate([redirect]);
      },
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

    // Map only the fields expected by the backend RegisterRequest DTO
    // IMPORTANT: Frontend uses 'CLIENT', but backend enum is 'USER'
    const payload = {
      name: this.registerForm.name,
      username: this.registerForm.username,
      email: this.registerForm.email,
      password: this.registerForm.password,
      role: (this.registerForm.role === 'CLIENT' ? 'USER' : this.registerForm.role),
      phone: this.registerForm.phone,
      address: this.registerForm.address
    };
    
    console.log('Registering with payload:', payload);

    this.authService.register(payload).subscribe({
      next: (res: any) => {
        console.log('Registration success:', res);
        this.successMessage = 'Account created! Redirecting…';
        this.cartService.syncCartAfterLogin();
        
        // AuthService unmarshals to { token: string, user: User }
        const role = res?.user?.role;
        let redirect = this.returnUrl;
        
        if (role === 'ADMIN') redirect = '/admin';
        else if (role === 'ORGANIZER') redirect = '/organizer';
        else if (role === 'PARTICIPANT') redirect = '/participant';
        else if (role === 'CAMPER') redirect = '/user-preferences';

        setTimeout(() => this.router.navigate([redirect]), 1200);
      },
      error: (err) => { 
        console.error('Registration error details:', err);
        this.isLoading = false; 
        this.errorMessage = err.error?.message || err.message || 'Registration failed.'; 
      }
    });
  }

  /* ===== Forgot Password ===== */
  forgotPassword(): void {
    if (!this.emailForReset) {
      this.errorMessage = 'Please enter your email';
      return;
    }
    this.isLoading = true;
    this.clearMessages();
    this.authService.forgotPassword(this.emailForReset).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'If an account exists, a reset link has been sent.';
        this.emailForReset = '';
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.message || 'Error occurred. Please try again.';
      }
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
      }, 50);
    }, 400);
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
      this.campfireAudio = this.owlAudio = this.cricketAudio = null;
    }
  }

  private publicUrl(fileName: string): string {
    return encodeURI(`/${fileName}`);
  }

  private startAmbientAudio(): void {
    this.tryPlayAmbient().then((played) => {
      if (!played) this.installAudioUnlockListeners();
    });
  }

  private async tryPlayAmbient(): Promise<boolean> {
    const tasks: Promise<unknown>[] = [];
    if (this.campfireAudio) tasks.push(this.campfireAudio.play());
    if (this.owlAudio) tasks.push(this.owlAudio.play());
    if (this.cricketAudio) tasks.push(this.cricketAudio.play());
    if (tasks.length === 0) return false;
    try {
      const results = await Promise.allSettled(tasks);
      return results.some((r) => r.status === 'fulfilled');
    } catch { return false; }
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
    for (let i = 0; i < STARS_PER_MOVE; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 6 + Math.random() * 12;
      const x = baseX + Math.cos(angle) * radius;
      const y = baseY + Math.sin(angle) * radius;
      const id = ++this.starIdCounter;
      this.stars.push({ id, x, y });
      setTimeout(() => {
        this.stars = this.stars.filter(s => s.id !== id);
      }, 700);
    }
  }
}
