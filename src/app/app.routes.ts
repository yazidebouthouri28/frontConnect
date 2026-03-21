import { Routes } from '@angular/router';

export const routes: Routes = [
<<<<<<< Updated upstream
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
=======
  // Home routes
  {
    path: '',
    loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent)
  },

  // Campsite routes
  {
    path: 'campsites',
    loadComponent: () => import('./components/campsites/campsite-listings.component').then(m => m.CampsiteListingsComponent)
  },
  {
    path: 'campsites/:id',
    loadComponent: () => import('./components/campsite-detail/campsite-detail.component').then(m => m.CampsiteDetailComponent)
  },

  // Event routes
  {
    path: 'events',
    loadComponent: () => import('./components/events/events-management.component').then(m => m.EventsManagementComponent)
  },
  {
    path: 'events/:id',
    loadComponent: () => import('./components/event-detail/event-detail.component').then(m => m.EventDetailComponent)
  },
  {
    path: 'organizer/events',
    loadComponent: () => import('./admin/events-management/events-management.component').then(m => m.EventsAdminManagementComponent),
    canActivate: [OrganizerGuard]
  },

  // Marketplace routes (e-commerce)
  {
    path: 'marketplace',
    loadComponent: () => import('./components/marketplace/marketplace.component').then(m => m.MarketplaceComponent)
  },
  {
    path: 'marketplace/:id',
    loadComponent: () => import('./components/marketplace/product-detail/product-detail.component').then(m => m.ProductDetailComponent)
  },

  // Community routes
  {
    path: 'community',
    loadComponent: () => import('./components/community/community-forum.component').then(m => m.CommunityForumComponent)
  },

  // Map route
  {
    path: 'map',
    loadComponent: () => import('./components/map/interactive-map.component').then(m => m.InteractiveMapComponent)
  },

  // Sponsors route
  {
    path: 'sponsors',
    loadComponent: () => import('./components/sponsors/sponsors.component').then(m => m.SponsorsComponent)
  },

  // Cart route - standalone page
  {
    path: 'cart',
    loadComponent: () => import('./components/client/client.component').then(m => m.ClientComponent),
    canActivate: [AuthGuard],
    data: { defaultTab: 'cart' }
  },

  // Dashboard route - main user dashboard
  {
    path: 'dashboard',
    loadComponent: () => import('./components/client/client.component').then(m => m.ClientComponent),
    canActivate: [AuthGuard]
  },

  // Legacy /client redirect to /dashboard
  {
    path: 'client',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },

  // Profile routes
  {
    path: 'profile',
    loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile/:id',
    loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent)
  },

  // User preferences
  {
    path: 'preferences',
    loadComponent: () => import('./components/user-preferences/user-preferences.component').then(m => m.UserPreferencesComponent),
    canActivate: [AuthGuard]
  },

  // E-commerce Seller Dashboard
  {
    path: 'seller',
    loadComponent: () => import('./components/seller/seller.component').then(m => m.SellerComponent),
    canActivate: [AuthGuard],
    data: { role: 'SELLER' }
  },

  // Sponsor Dashboard
  {
    path: 'sponsor-dashboard',
    loadComponent: () => import('./components/sponsors/sponsors.component').then(m => m.SponsorsComponent),
    canActivate: [AuthGuard],
    data: { role: 'SPONSOR' }
  },

  // Admin Panel (comprehensive)
>>>>>>> Stashed changes
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin-panel/admin-panel.component').then(m => m.AdminPanelComponent),
  },
<<<<<<< Updated upstream
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
=======

  // Authentication routes - Single unified auth page
  {
    path: 'auth',
    loadComponent: () => import('./components/auth/auth.component').then(m => m.AuthComponent)
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./components/auth/auth.component').then(m => m.AuthComponent)
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./components/auth/auth.component').then(m => m.AuthComponent)
  },
  {
    path: 'login',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },
  {
    path: 'register',
    redirectTo: '/auth/register',
    pathMatch: 'full'
  },

  // Fallback route
  { path: '**', redirectTo: '' }
>>>>>>> Stashed changes
];
