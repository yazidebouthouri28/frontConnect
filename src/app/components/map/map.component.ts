import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';  // 👈 ADD THIS LINE!

interface MapLocation {
  id: number;
  name: string;
  type: 'campsite' | 'rental' | 'event';
  lat: number;
  lng: number;
  available: boolean;
  description: string;
}

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-sage-green/20 py-16 px-4 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-7xl">
        <div class="mb-8">
          <h2 class="text-3xl font-bold text-forest-green mb-2">🗺️ Interactive Map</h2>
          <p class="text-olive-green">Explore campsites, rental locations, and event venues</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <!-- Map Controls Sidebar -->
          <div class="space-y-4">
            <!-- Filter Options -->
            <div class="bg-white rounded-xl p-5 shadow-md">
              <h3 class="font-semibold text-forest-green mb-4 flex items-center gap-2">
                📊 Filter Locations
              </h3>
              <div class="space-y-2">
                <button
                  (click)="selectedType = 'all'"
                  [class.bg-olive-green]="selectedType === 'all'"
                  [class.text-cream-beige]="selectedType === 'all'"
                  [class.bg-sage-green/20]="selectedType !== 'all'"
                  [class.text-forest-green]="selectedType !== 'all'"
                  class="w-full text-left px-4 py-2 rounded-lg transition-colors hover:bg-sage-green/40">
                  All Locations ({{locations.length}})
                </button>
                <button
                  (click)="selectedType = 'campsite'"
                  [class.bg-olive-green]="selectedType === 'campsite'"
                  [class.text-cream-beige]="selectedType === 'campsite'"
                  [class.bg-sage-green/20]="selectedType !== 'campsite'"
                  [class.text-forest-green]="selectedType !== 'campsite'"
                  class="w-full text-left px-4 py-2 rounded-lg transition-colors hover:bg-sage-green/40">
                  ⛺ Campsites ({{getCountByType('campsite')}})
                </button>
                <button
                  (click)="selectedType = 'rental'"
                  [class.bg-olive-green]="selectedType === 'rental'"
                  [class.text-cream-beige]="selectedType === 'rental'"
                  [class.bg-sage-green/20]="selectedType !== 'rental'"
                  [class.text-forest-green]="selectedType !== 'rental'"
                  class="w-full text-left px-4 py-2 rounded-lg transition-colors hover:bg-sage-green/40">
                  🏪 Rental Shops ({{getCountByType('rental')}})
                </button>
                <button
                  (click)="selectedType = 'event'"
                  [class.bg-olive-green]="selectedType === 'event'"
                  [class.text-cream-beige]="selectedType === 'event'"
                  [class.bg-sage-green/20]="selectedType !== 'event'"
                  [class.text-forest-green]="selectedType !== 'event'"
                  class="w-full text-left px-4 py-2 rounded-lg transition-colors hover:bg-sage-green/40">
                  🎪 Events ({{getCountByType('event')}})
                </button>
              </div>
            </div>

            <!-- Map Options -->
            <div class="bg-white rounded-xl p-5 shadow-md">
              <h3 class="font-semibold text-forest-green mb-4">🛠️ Map Options</h3>
              <div class="space-y-3">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    [(ngModel)]="showRoutes"
                    class="w-4 h-4 text-forest-green rounded">
                  <span class="text-forest-green">Show Routes</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    [(ngModel)]="showAvailableOnly"
                    class="w-4 h-4 text-forest-green rounded">
                  <span class="text-forest-green">Available Only</span>
                </label>
              </div>
            </div>

            <!-- Location List -->
            <div class="bg-white rounded-xl p-5 shadow-md">
              <h3 class="font-semibold text-forest-green mb-4">📍 Locations</h3>
              <div class="space-y-2 max-h-96 overflow-y-auto">
                <div
                  *ngFor="let location of filteredLocations"
                  (click)="selectedLocation = location"
                  [class.bg-olive-green]="selectedLocation?.id === location.id"
                  [class.text-cream-beige]="selectedLocation?.id === location.id"
                  class="p-3 rounded-lg hover:bg-sage-green/20 cursor-pointer transition-colors">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="font-medium">{{getLocationIcon(location.type)}} {{location.name}}</p>
                      <p class="text-xs opacity-75">{{location.description}}</p>
                    </div>
                    <span
                      [class.bg-green-500]="location.available"
                      [class.bg-red-500]="!location.available"
                      class="w-2 h-2 rounded-full">
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Map Display Area -->
          <div class="lg:col-span-3">
            <div class="bg-white rounded-xl shadow-lg overflow-hidden">
              <!-- Map Controls -->
              <div class="bg-forest-green p-4 flex justify-between items-center">
                <h3 class="text-cream-beige font-semibold">Map View</h3>
                <div class="flex gap-2">
                  <button class="bg-olive-green text-cream-beige px-3 py-1 rounded hover:bg-sage-green transition-colors">
                    🔍 Zoom In
                  </button>
                  <button class="bg-olive-green text-cream-beige px-3 py-1 rounded hover:bg-sage-green transition-colors">
                    🔎 Zoom Out
                  </button>
                  <button class="bg-olive-green text-cream-beige px-3 py-1 rounded hover:bg-sage-green transition-colors">
                    🧭 My Location
                  </button>
                </div>
              </div>

              <!-- Simplified Map Visualization -->
              <div class="relative bg-gradient-to-br from-sage-green/30 to-olive-green/20 h-[600px] p-8">
                <!-- Map Grid Background -->
                <div class="absolute inset-0 opacity-10">
                  <div class="grid grid-cols-10 grid-rows-10 h-full">
                    <div *ngFor="let i of [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100]"
                         class="border border-forest-green/10"></div>
                  </div>
                </div>

                <!-- Location Markers -->
                <div
                  *ngFor="let location of filteredLocations"
                  [style.left.%]="getPositionX(location.lng)"
                  [style.top.%]="getPositionY(location.lat)"
                  (click)="selectedLocation = location"
                  class="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform">
                  <div
                    [class.bg-forest-green]="location.type === 'campsite'"
                    [class.bg-blue-500]="location.type === 'rental'"
                    [class.bg-purple-500]="location.type === 'event'"
                    [class.ring-4]="selectedLocation?.id === location.id"
                    [class.ring-yellow-400]="selectedLocation?.id === location.id"
                    class="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-lg">
                    {{getLocationIcon(location.type)}}
                  </div>
                  <div class="text-xs font-medium text-forest-green mt-1 text-center whitespace-nowrap">
                    {{location.name}}
                  </div>
                </div>

                <!-- Routes (if enabled) -->
                <svg *ngIf="showRoutes" class="absolute inset-0 pointer-events-none">
                  <line
                    *ngFor="let i of [0,1,2,3]"
                    x1="20%"
                    y1="30%"
                    [attr.x2]="(i * 20 + 40) + '%'"
                    [attr.y2]="(i * 15 + 45) + '%'"
                    stroke="#5D7B5F"
                    stroke-width="2"
                    stroke-dasharray="5,5"
                    opacity="0.5"/>
                </svg>
              </div>

              <!-- Selected Location Info -->
              <div *ngIf="selectedLocation" class="p-6 bg-sage-green/10 border-t border-sage-green/30">
                <h3 class="text-xl font-bold text-forest-green mb-2">
                  {{getLocationIcon(selectedLocation.type)}} {{selectedLocation.name}}
                </h3>
                <p class="text-olive-green mb-4">{{selectedLocation.description}}</p>
                <div class="flex items-center gap-4 mb-4">
                  <span
                    [class.text-green-600]="selectedLocation.available"
                    [class.text-red-600]="!selectedLocation.available"
                    class="font-medium">
                    {{selectedLocation.available ? '✓ Available' : '✗ Not Available'}}
                  </span>
                  <span class="text-olive-green">📍 Lat: {{selectedLocation.lat}}, Lng: {{selectedLocation.lng}}</span>
                </div>
                <div class="flex gap-2">
                  <button class="bg-forest-green text-cream-beige px-6 py-2 rounded-lg hover:bg-olive-green transition-colors">
                    View Details
                  </button>
                  <button class="bg-white border-2 border-forest-green text-forest-green px-6 py-2 rounded-lg hover:bg-sage-green/20 transition-colors">
                    Get Directions
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MapComponent {
  selectedType: 'all' | 'campsite' | 'rental' | 'event' = 'all';
  showRoutes = false;
  showAvailableOnly = false;
  selectedLocation: MapLocation | null = null;

  locations: MapLocation[] = [
    {
      id: 1,
      name: 'Pine Valley',
      type: 'campsite',
      lat: 37.7,
      lng: -119.5,
      available: true,
      description: 'Beautiful forest campground with modern facilities'
    },
    {
      id: 2,
      name: 'Crystal Lake',
      type: 'campsite',
      lat: 39.2,
      lng: -120.1,
      available: true,
      description: 'Lakeside camping with stunning views'
    },
    {
      id: 3,
      name: 'Mountain Peak',
      type: 'campsite',
      lat: 40.3,
      lng: -105.7,
      available: false,
      description: 'High-altitude camping experience'
    },
    {
      id: 4,
      name: 'Gear Rental Shop',
      type: 'rental',
      lat: 37.9,
      lng: -119.8,
      available: true,
      description: 'Full camping gear rental and supplies'
    },
    {
      id: 5,
      name: 'Summer Camping Festival',
      type: 'event',
      lat: 38.5,
      lng: -119.3,
      available: true,
      description: 'Annual camping and music festival'
    },
    {
      id: 6,
      name: 'Riverside Camp',
      type: 'campsite',
      lat: 38.8,
      lng: -120.5,
      available: true,
      description: 'Peaceful riverside camping spots'
    },
    {
      id: 7,
      name: 'Adventure Outfitters',
      type: 'rental',
      lat: 39.5,
      lng: -119.0,
      available: true,
      description: 'Premium outdoor equipment rentals'
    },
    {
      id: 8,
      name: 'Nature Photography Workshop',
      type: 'event',
      lat: 37.5,
      lng: -120.8,
      available: true,
      description: 'Learn photography in nature'
    }
  ];

  get filteredLocations(): MapLocation[] {
    let filtered = this.selectedType === 'all'
      ? this.locations
      : this.locations.filter(loc => loc.type === this.selectedType);

    if (this.showAvailableOnly) {
      filtered = filtered.filter(loc => loc.available);
    }

    return filtered;
  }

  getCountByType(type: string): number {
    return this.locations.filter(loc => loc.type === type).length;
  }

  getLocationIcon(type: string): string {
    const icons: {[key: string]: string} = {
      campsite: '⛺',
      rental: '🏪',
      event: '🎪'
    };
    return icons[type] || '📍';
  }

  getPositionX(lng: number): number {
    // Convert longitude to percentage (simplified)
    // Range: -125 to -100 maps to 0-100%
    return ((lng + 125) / 25) * 100;
  }

  getPositionY(lat: number): number {
    // Convert latitude to percentage (simplified)
    // Range: 32 to 42 maps to 100-0% (inverted for map coordinates)
    return 100 - ((lat - 32) / 10) * 100;
  }
}
