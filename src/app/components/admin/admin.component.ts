import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent {
  activeSection = 'dashboard';

  menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'campsites', label: 'Campsites', icon: '⛺' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'orders', label: 'Orders', icon: '📦' },
    { id: 'moderation', label: 'Moderation', icon: '🛡️' },
    { id: 'sponsors', label: 'Sponsors', icon: '🤝' }
  ];
}
