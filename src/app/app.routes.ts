import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { CampsitesComponent } from './components/campsites/campsites.component';
import { EventsComponent } from './components/events/events.component';
import { MarketplaceComponent } from './components/marketplace/marketplace.component';
import { CommunityComponent } from './components/community/community.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AdminComponent } from './components/admin/admin.component';
import { MapComponent } from './components/map/map.component';
import { SellerComponent } from './components/seller/seller.component';
import { ClientComponent } from './components/client/client.component';
import { AuthComponent } from './components/auth/auth.component';
import { AuthGuard, SellerGuard, ClientGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'campsites', component: CampsitesComponent },
  { path: 'events', component: EventsComponent },
  { path: 'marketplace', component: MarketplaceComponent },
  { path: 'community', component: CommunityComponent },
  { path: 'map', component: MapComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'seller', component: SellerComponent, canActivate: [AuthGuard] },
  { path: 'client', component: ClientComponent, canActivate: [AuthGuard] },
  { path: 'admin', component: AdminComponent, canActivate: [AuthGuard], data: { role: 'ADMIN' } },
  { path: 'auth/login', component: AuthComponent },
  { path: 'auth/register', component: AuthComponent },
  { path: '**', redirectTo: '' }
];
