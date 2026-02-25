import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: '/login' },
      { path: 'home', loadComponent: () => import('./components/home-page/home-page.component').then(m => m.HomePageComponent), data: { section: 'home' } },
      { path: 'campsites', loadComponent: () => import('./components/home-page/home-page.component').then(m => m.HomePageComponent), data: { section: 'campsites' } },
      { path: 'events', loadComponent: () => import('./components/home-page/home-page.component').then(m => m.HomePageComponent), data: { section: 'events' } },
      { path: 'marketplace', loadComponent: () => import('./components/home-page/home-page.component').then(m => m.HomePageComponent), data: { section: 'marketplace' } },
      { path: 'community', loadComponent: () => import('./components/home-page/home-page.component').then(m => m.HomePageComponent), data: { section: 'community' } },
      { path: 'sponsors', loadComponent: () => import('./components/home-page/home-page.component').then(m => m.HomePageComponent), data: { section: 'sponsors' } },
      { path: 'dashboard', loadComponent: () => import('./components/home-page/home-page.component').then(m => m.HomePageComponent), data: { section: 'dashboard' } },
      { path: 'profile', loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent) },
      { path: 'profile/:id', loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent) },
      { path: 'campsites/:id', loadComponent: () => import('./components/campsite-detail/campsite-detail.component').then(m => m.CampsiteDetailComponent) },
    ],
  },
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin-panel/admin-panel.component').then(m => m.AdminPanelComponent),
  },
  {
    path: 'login',
    loadComponent: () => import('./components/auth/auth.component').then(m => m.AuthComponent),
  },
  {
    path: 'cart',
    loadComponent: () => import('./components/cart/cart.component').then(m => m.CartComponent),
  },
  {
    path: 'preferences',
    loadComponent: () => import('./components/user-preferences/user-preferences.component').then(m => m.UserPreferencesComponent),
  },
  { path: '**', redirectTo: '/login' },
];
