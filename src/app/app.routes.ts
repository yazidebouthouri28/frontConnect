import { Routes } from '@angular/router';
import { AuthGuard, SellerGuard, ClientGuard, AdminGuard, OrganizerGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./components/home-hub/home-hub.component').then(m => m.HomeHubComponent) },

  { path: 'campsites', loadComponent: () => import('./components/campsites/campsite-listings.component').then(m => m.CampsiteListingsComponent) },
  { path: 'campsites/:siteId/highlights/:highlightId', loadComponent: () => import('./components/camp-highlight-detail/camp-highlight-detail.component').then(m => m.CampHighlightDetailComponent) },
  { path: 'campsites/:id', loadComponent: () => import('./components/campsite-detail/campsite-detail.component').then(m => m.CampsiteDetailComponent) },

  { path: 'events', loadComponent: () => import('./components/events/events-management.component').then(m => m.EventsManagementComponent) },
  { path: 'events/:id', loadComponent: () => import('./components/event-detail/event-detail.component').then(m => m.EventDetailComponent) },

  { path: 'marketplace', loadComponent: () => import('./components/marketplace/marketplace.component').then(m => m.MarketplaceComponent) },
  { path: 'marketplace/:id', loadComponent: () => import('./components/marketplace/product-detail/product-detail.component').then(m => m.ProductDetailComponent) },

  { path: 'community', loadComponent: () => import('./components/community/community-forum.component').then(m => m.CommunityForumComponent) },

  { path: 'map', loadComponent: () => import('./components/map/interactive-map.component').then(m => m.InteractiveMapComponent) },

  { path: 'sponsors', loadComponent: () => import('./components/sponsors/sponsors.component').then(m => m.SponsorsComponent) },

  { path: 'cart', loadComponent: () => import('./components/client/client.component').then(m => m.ClientComponent), canActivate: [AuthGuard], data: { defaultTab: 'cart' } },

  { path: 'dashboard', loadComponent: () => import('./components/client/client.component').then(m => m.ClientComponent), canActivate: [AuthGuard] },

  { path: 'client', redirectTo: '/dashboard', pathMatch: 'full' },

  { path: 'profile', loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent), canActivate: [AuthGuard] },
  { path: 'profile/:id', loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent) },

  { path: 'preferences', loadComponent: () => import('./components/user-preferences/user-preferences.component').then(m => m.UserPreferencesComponent), canActivate: [AuthGuard] },

  { path: 'seller', loadComponent: () => import('./components/seller/seller.component').then(m => m.SellerComponent), canActivate: [AuthGuard], data: { role: 'SELLER' } },

  { path: 'sponsor-dashboard', loadComponent: () => import('./components/sponsors/sponsors.component').then(m => m.SponsorsComponent), canActivate: [AuthGuard], data: { role: 'SPONSOR' } },

  { path: 'admin', loadComponent: () => import('./admin/admin-panel/admin-panel.component').then(m => m.AdminPanelComponent), canActivate: [AdminGuard] },

  { path: 'auth', loadComponent: () => import('./components/auth/auth.component').then(m => m.AuthComponent) },
  { path: 'auth/login', loadComponent: () => import('./components/auth/auth.component').then(m => m.AuthComponent) },
  { path: 'auth/register', loadComponent: () => import('./components/auth/auth.component').then(m => m.AuthComponent) },

  { path: 'login', redirectTo: '/auth/login', pathMatch: 'full' },
  { path: 'register', redirectTo: '/auth/register', pathMatch: 'full' },

  { path: '**', redirectTo: '' }
];