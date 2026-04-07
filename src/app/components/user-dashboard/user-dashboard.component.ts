import { Component, OnInit } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, NgClass],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css'],
})
export class UserDashboardComponent implements OnInit {
  activeTab = 'bookings';
  isLoadingOrders = false;

  tabs = [
    { id: 'bookings', label: 'My Bookings' },
    { id: 'purchases', label: 'Orders & Rentals' },
    { id: 'rewards', label: 'Loyalty Rewards' },
    { id: 'events', label: 'My Events' },
    { id: 'saved', label: 'Saved Locations' },
    { id: 'forum', label: 'Forum Activity' },
  ];

  bookingsData = [
    { id: 1, name: 'Pine Valley Campground', location: 'Yosemite National Park, CA', checkIn: 'Mar 15, 2026', checkOut: 'Mar 18, 2026', status: 'Confirmed', nights: 3, total: 135 },
    { id: 2, name: 'Crystal Lake Retreat', location: 'Tahoe National Forest, CA', checkIn: 'Apr 22, 2026', checkOut: 'Apr 25, 2026', status: 'Confirmed', nights: 3, total: 165 },
  ];

  ordersData: any[] = [];

  orderTabs = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered'];
  activeOrderTab = 'All';

  rewardsData = { currentPoints: 1245, tier: 'Gold', nextTier: 'Platinum', pointsToNext: 755, discountRate: 15, specialOffers: 3 };

  savedLocations = [
    { id: 1, name: 'Redwood Grove Campsite', location: 'Redwood National Park, CA', rating: 4.6 },
    { id: 2, name: 'Mountain Peak Base Camp', location: 'Rocky Mountain NP, CO', rating: 4.7 },
  ];

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    // Optionnel : charger les orders au démarrage si l'onglet actif est 'purchases'
    if (this.activeTab === 'purchases') {
      this.loadOrders();
    }
  }

  setActiveTab(tabId: string): void {
    this.activeTab = tabId;
    if (tabId === 'purchases') {
      this.loadOrders();
    }
  }

  loadOrders(): void {
    this.isLoadingOrders = true;
    this.orderService.getMyOrders().subscribe({
      next: (data) => {
        this.ordersData = data;
        this.isLoadingOrders = false;
      },
      error: (err) => {
        console.error('Failed to load orders', err);
        this.isLoadingOrders = false;
      }
    });
  }

  get filteredOrders(): any[] {
    if (this.activeOrderTab === 'All') return this.ordersData;
    return this.ordersData.filter(o =>
      o.status?.toLowerCase() === this.activeOrderTab.toLowerCase()
    );
  }

  rewardsProgress(): number {
    const total = this.rewardsData.currentPoints + this.rewardsData.pointsToNext;
    return (this.rewardsData.currentPoints / total) * 100;
  }

  get activeTabLabel(): string {
    const tab = this.tabs.find((t) => t.id === this.activeTab);
    return tab?.label ?? this.activeTab;
  }
}
