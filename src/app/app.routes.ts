import { Routes } from '@angular/router';
import { NoAdminGuard } from './guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivateChild: [NoAdminGuard],
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
      { path: 'services', loadChildren: () => import('./modules/services/services.routes').then(m => m.SERVICES_ROUTES) },
      { path: 'emergency', loadChildren: () => import('./modules/emergency/emergency.routes').then(m => m.EMERGENCY_ROUTES) },
    ],
  },
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin-panel/admin-panel.component').then(m => m.AdminPanelComponent),
    children: [
      { path: 'emergency/protocols', loadComponent: () => import('./modules/emergency/components/protocole-list/protocole-list.component').then(m => m.ProtocoleListComponent) },
      { path: 'emergency/detail/:id', loadComponent: () => import('./modules/emergency/components/alerte-detail/alerte-detail.component').then(m => m.AlerteDetailComponent) },
      { path: 'emergency/intervention/create/:alertId', loadComponent: () => import('./modules/emergency/components/intervention-create/intervention-create.component').then(m => m.InterventionCreateComponent) },
      { path: 'emergency/protocole/create', loadComponent: () => import('./modules/emergency/components/protocole-create/protocole-create.component').then(m => m.ProtocoleCreateComponent) },
      { path: 'emergency/protocole/detail/:id', loadComponent: () => import('./modules/emergency/components/protocole-detail/protocole-detail.component').then(m => m.ProtocoleDetailComponent) },
      { path: 'emergency/protocole/edit/:id', loadComponent: () => import('./modules/emergency/components/protocole-edit/protocole-edit.component').then(m => m.ProtocoleEditComponent) },

      // Services Management
      { path: 'services/create', loadComponent: () => import('./modules/services/components/service-create/service-create.component').then(m => m.ServiceCreateComponent) },
      { path: 'services/edit/:id', loadComponent: () => import('./modules/services/components/service-edit/service-edit.component').then(m => m.ServiceEditComponent) },

      // Packs Management
      { path: 'services/packs/create', loadComponent: () => import('./modules/services/components/pack-create/pack-create.component').then(m => m.PackCreateComponent) },
      { path: 'services/packs/edit/:id', loadComponent: () => import('./modules/services/components/pack-edit/pack-edit.component').then(m => m.PackEditComponent) },

      // Promotions Management
      { path: 'services/promotions/create', loadComponent: () => import('./modules/services/components/promotion-create/promotion-create.component').then(m => m.PromotionCreateComponent) },
      { path: 'services/promotions/edit/:id', loadComponent: () => import('./modules/services/components/promotion-edit/promotion-edit.component').then(m => m.PromotionEditComponent) }
    ]
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
