import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
import { AdminDashboardComponent } from '../admin-dashboard/admin-dashboard.component';
import { SponsorsManagementComponent } from '../sponsors-management/sponsors-management.component';
import { CampsitesManagementComponent } from '../campsites-management/campsites-management.component';
import { UsersManagementComponent } from '../users-management/users-management.component';
import { CampHighlightsManagementComponent } from '../camp-highlights-management/camp-highlights-management.component';
import { EventsAdminManagementComponent } from '../events-management/events-management.component';
import { MarketplaceManagementComponent } from '../marketplace-management/marketplace-management.component';
import { ReportsManagementComponent } from '../reports-management/reports-management.component';
import { ReservationsManagementComponent } from '../reservations-management/reservations-management.component';
import { ModerationPanelComponent } from '../moderation-panel/moderation-panel.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [
    CommonModule,
    AdminSidebarComponent,
    AdminDashboardComponent,
    SponsorsManagementComponent,
    CampsitesManagementComponent,
    UsersManagementComponent,
    CampHighlightsManagementComponent,
    EventsAdminManagementComponent,
    MarketplaceManagementComponent,
    ReportsManagementComponent,
    ReservationsManagementComponent,
    ModerationPanelComponent
  ],
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css'],
})
export class AdminPanelComponent {
  activeSection = signal('dashboard');
  systemTimeLabel = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date());

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  setSection(section: string) {
    this.activeSection.set(section);
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }
}
