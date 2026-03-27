import { Component, EventEmitter, Output, inject, computed } from '@angular/core';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
})
export class AdminDashboardComponent {
  private userService = inject(UserService);
  @Output() onSectionChange = new EventEmitter<string>();

  user = computed(() => this.userService.getLoggedInUser());

  changeSection(sectionId: string) {
    this.onSectionChange.emit(sectionId);
  }

  stats = computed(() => {
    const role = this.user()?.role;
    if (role === 'ORGANIZER') {
      return [
        { title: 'Open Positions', value: '12', change: '+2', trend: 'up', subtitle: 'STAFFING NEEDS', icon: '👥' },
        { title: 'Pending Apps', value: '45', change: '+8', trend: 'up', subtitle: 'REQUIRES REVIEW', icon: '📝' },
        { title: 'Active Events', value: '3', change: 'Live', trend: 'up', subtitle: 'CURRENT OPERATIONS', icon: '🗓️' },
        { title: 'Partner Services', value: '28', change: '+5', trend: 'up', subtitle: 'AVAILABLE B2B', icon: '🤝' },
      ];
    }
    return [
      { title: 'Global Volume', value: '2,450', change: '+2.4%', trend: 'up', subtitle: 'TOTAL SKU REGISTRY', icon: '📊' },
      { title: 'Market Value', value: '12.5k DT', change: '+5.7%', trend: 'up', subtitle: 'LIQUID ASSET APPRAISAL', icon: '💰' },
      { title: 'Resource Alert', value: '8', change: 'Alert', trend: 'down', subtitle: 'CRITICAL STOCK THRESHOLDS', icon: '⚠️' },
      { title: 'Operational Yield', value: '+14% WoW', change: 'Growth', trend: 'up', subtitle: 'TRANSACTION VELOCITY', icon: '📈' },
    ];
  });

  activities = computed(() => {
    const role = this.user()?.role;
    if (role === 'ORGANIZER') {
      return [
        { user: 'Sarah Connor', action: 'applied for Logistics Coordinator', time: '10 min ago' },
        { user: 'John Doe', action: 'applied for Security Staff', time: '25 min ago' },
        { user: 'Eco-Camp Service', action: 'updated their B2B pricing', time: '1h ago' },
        { user: 'System', action: 'Event "Summer Camp 2026" is now live', time: '3h ago' },
      ];
    }
    return [
      { user: 'Marie Dubois', action: 'reserved Pine Valley Campground', time: '5 min ago' },
      { user: 'Thomas Martin', action: 'bought a 4-person tent', time: '12 min ago' },
      { user: 'Sophie Laurent', action: "registered for Summer Festival", time: '23 min ago' },
      { user: 'Pierre Rousseau', action: 'posted in the forum', time: "1h ago" },
      { user: 'Julie Bernard', action: 'created an account', time: '2h ago' },
    ];
  });
}
