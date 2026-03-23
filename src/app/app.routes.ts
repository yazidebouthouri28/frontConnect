import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: '/login' },
      {
        path: 'home',
        loadComponent: () => import('./components/home-page/home-page.component').then((m) => m.HomePageComponent),
      },
      {
        path: 'campsites',
        loadComponent: () =>
          import('./components/campsite-listings/campsite-listings.component').then((m) => m.CampsiteListingsComponent),
      },
      {
        path: 'events',
        loadComponent: () =>
          import('./components/events-management/events-management.component').then((m) => m.EventsManagementComponent),
      },
      {
        path: 'marketplace',
        loadComponent: () => import('./components/marketplace/marketplace.component').then((m) => m.MarketplaceComponent),
      },
      {
        path: 'community',
        loadComponent: () =>
          import('./components/community-forum/community-forum.component').then((m) => m.CommunityForumComponent),
      },
      {
        path: 'sponsors',
        loadComponent: () => import('./components/sponsors/sponsors.component').then((m) => m.SponsorsComponent),
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./components/user-dashboard/user-dashboard.component').then((m) => m.UserDashboardComponent),
      },
      { path: 'profile', loadComponent: () => import('./components/profile/profile.component').then((m) => m.ProfileComponent) },
      {
        path: 'profile/:id',
        loadComponent: () => import('./components/profile/profile.component').then((m) => m.ProfileComponent),
      },
      {
        path: 'campsites/:id',
        loadComponent: () =>
          import('./components/campsite-detail/campsite-detail.component').then((m) => m.CampsiteDetailComponent),
      },
      {
        path: 'events/:id',
        loadComponent: () => import('./components/event-detail/event-detail.component').then((m) => m.EventDetailComponent),
      },
      {
        path: 'marketplace/:id',
        loadComponent: () =>
          import('./components/marketplace/product-detail/product-detail.component').then((m) => m.ProductDetailComponent),
      },
    ],
  },
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin-panel/admin-panel.component').then((m) => m.AdminPanelComponent),
  },
  {
    path: 'login',
    loadComponent: () => import('./components/auth/auth.component').then((m) => m.AuthComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./components/auth/auth.component').then((m) => m.AuthComponent),
  },
  {
    path: 'cart',
    loadComponent: () => import('./components/cart/cart.component').then((m) => m.CartComponent),
  },
  {
    path: 'preferences',
    loadComponent: () =>
      import('./components/user-preferences/user-preferences.component').then((m) => m.UserPreferencesComponent),
  },
  { path: '**', redirectTo: '/login' },
];
