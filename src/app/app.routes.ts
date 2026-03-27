import { Routes } from '@angular/router';
import { AuthGuard, SellerGuard, ClientGuard, AdminGuard, OrganizerGuard } from './guards/auth.guard';
import { ParticipantGuard } from './guards/participant.guard';
import { NoAdminGuard } from './guards/role.guard';
import { MainLayoutComponent } from './components/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./components/home-hub/home-hub.component').then(m => m.HomeHubComponent)
      },
      {
        path: 'home',
        loadComponent: () => import('./components/home-hub/home-hub.component').then(m => m.HomeHubComponent)
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
      // Marketplace routes
      {
        path: 'marketplace',
        loadComponent: () => import('./components/marketplace/marketplace.component').then(m => m.MarketplaceComponent)
      },
      {
        path: 'marketplace/:id',
        loadComponent: () => import('./components/marketplace/product-detail/product-detail.component').then(m => m.ProductDetailComponent)
      },
      // Community
      {
        path: 'community',
        loadComponent: () => import('./components/community-forum/community-forum.component').then(m => m.CommunityForumComponent)
      },
      // Map
      {
        path: 'map',
        loadComponent: () => import('./components/map/interactive-map.component').then(m => m.InteractiveMapComponent)
      },
      // Sponsors
      {
        path: 'sponsors',
        loadComponent: () => import('./components/sponsors/sponsors.component').then(m => m.SponsorsComponent)
      },
      // Services & Emergency
      { path: 'services', loadChildren: () => import('./modules/services/services.routes').then(m => m.SERVICES_ROUTES) },
      { path: 'emergency', loadChildren: () => import('./modules/emergency/emergency.routes').then(m => m.EMERGENCY_ROUTES) },
      // Cart & Dashboard
      {
        path: 'cart',
        loadComponent: () => import('./components/client/client.component').then(m => m.ClientComponent),
        canActivate: [AuthGuard],
        data: { defaultTab: 'cart' }
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./components/client/client.component').then(m => m.ClientComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'profile',
        loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'profile/:id',
        loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent)
      },
      {
        path: 'preferences',
        loadComponent: () => import('./components/user-preferences/user-preferences.component').then(m => m.UserPreferencesComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'seller',
        loadComponent: () => import('./components/seller/seller.component').then(m => m.SellerComponent),
        canActivate: [AuthGuard],
        data: { role: 'SELLER' }
      },
      {
        path: 'sponsor-dashboard',
        loadComponent: () => import('./components/sponsors/sponsors.component').then(m => m.SponsorsComponent),
        canActivate: [AuthGuard],
        data: { role: 'SPONSOR' }
      }
    ]
  },
  {
    path: 'organizer',
    loadComponent: () => import('./admin/admin-panel/admin-panel.component').then(m => m.AdminPanelComponent),
    canActivate: [OrganizerGuard]
  },
  {
    path: 'participant',
    loadComponent: () => import('./admin/admin-panel/admin-panel.component').then(m => m.AdminPanelComponent),
    canActivate: [ParticipantGuard]
  },

  // Admin remains separate or also under layout? Usually sidebar-based.
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin-panel/admin-panel.component').then(m => m.AdminPanelComponent),
    canActivate: [AdminGuard],
    children: [
      { path: 'emergency/protocols', loadComponent: () => import('./modules/emergency/components/protocole-list/protocole-list.component').then(m => m.ProtocoleListComponent) },
      { path: 'emergency/detail/:id', loadComponent: () => import('./modules/emergency/components/alerte-detail/alerte-detail.component').then(m => m.AlerteDetailComponent) },
      { path: 'emergency/intervention/create/:alertId', loadComponent: () => import('./modules/emergency/components/intervention-create/intervention-create.component').then(m => m.InterventionCreateComponent) },
      { path: 'emergency/protocole/create', loadComponent: () => import('./modules/emergency/components/protocole-create/protocole-create.component').then(m => m.ProtocoleCreateComponent) },
      { path: 'emergency/protocole/detail/:id', loadComponent: () => import('./modules/emergency/components/protocole-detail/protocole-detail.component').then(m => m.ProtocoleDetailComponent) },
      { path: 'emergency/protocole/edit/:id', loadComponent: () => import('./modules/emergency/components/protocole-edit/protocole-edit.component').then(m => m.ProtocoleEditComponent) },
      { path: 'services/create', loadComponent: () => import('./modules/services/components/service-create/service-create.component').then(m => m.ServiceCreateComponent) },
      { path: 'services/edit/:id', loadComponent: () => import('./modules/services/components/service-edit/service-edit.component').then(m => m.ServiceEditComponent) },
      { path: 'services/packs/create', loadComponent: () => import('./modules/services/components/pack-create/pack-create.component').then(m => m.PackCreateComponent) },
      { path: 'services/packs/edit/:id', loadComponent: () => import('./modules/services/components/pack-edit/pack-edit.component').then(m => m.PackEditComponent) },
      { path: 'services/promotions/create', loadComponent: () => import('./modules/services/components/promotion-create/promotion-create.component').then(m => m.PromotionCreateComponent) },
      { path: 'services/promotions/edit/:id', loadComponent: () => import('./modules/services/components/promotion-edit/promotion-edit.component').then(m => m.PromotionEditComponent) }
    ]
  },

  // Auth is standalone (no navbar/footer)
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

  // Fallback
  { path: '**', redirectTo: '' }
];
