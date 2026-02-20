import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Campsite } from '../../models/campsite.model';

@Component({
  selector: 'app-campsites',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-cream-beige py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <h1 class="text-4xl font-bold text-forest-green mb-8">Discover Campsites</h1>

        <!-- Filters -->
        <div class="bg-white rounded-xl p-6 shadow-md mb-8">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-medium text-forest-green mb-2">Location</label>
              <input
                type="text"
                [(ngModel)]="filters.location"
                placeholder="Search location..."
                class="w-full px-4 py-2 border border-sage-green rounded-lg focus:outline-none focus:ring-2 focus:ring-olive-green">
            </div>

            <div>
              <label class="block text-sm font-medium text-forest-green mb-2">Price Range</label>
              <select [(ngModel)]="filters.priceRange" class="w-full px-4 py-2 border border-sage-green rounded-lg focus:outline-none focus:ring-2 focus:ring-olive-green">
                <option value="">All Prices</option>
                <option value="0-50">$0 - $50</option>
                <option value="50-100">$50 - $100</option>
                <option value="100+">$100+</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-forest-green mb-2">Amenities</label>
              <select [(ngModel)]="filters.amenity" class="w-full px-4 py-2 border border-sage-green rounded-lg focus:outline-none focus:ring-2 focus:ring-olive-green">
                <option value="">All Amenities</option>
                <option value="wifi">WiFi</option>
                <option value="water">Water</option>
                <option value="campfire">Campfire</option>
                <option value="hiking">Hiking</option>
              </select>
            </div>

            <div class="flex items-end">
              <button class="w-full bg-forest-green text-cream-beige py-2 rounded-lg hover:bg-olive-green transition-colors">
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        <!-- Campsite Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div *ngFor="let campsite of campsites"
               class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer">
            <div class="relative h-48">
              <img [src]="campsite.image" [alt]="campsite.name" class="w-full h-full object-cover" />
              <div class="absolute top-4 right-4 bg-white px-3 py-1 rounded-full">
                <span class="font-bold text-forest-green">\${{campsite.price}}/night</span>
              </div>
            </div>

            <div class="p-4">
              <h3 class="text-xl font-bold text-forest-green mb-2">{{campsite.name}}</h3>
              <p class="text-olive-green text-sm mb-3 flex items-center gap-1">
                📍 {{campsite.location}}
              </p>

              <div class="flex items-center gap-2 mb-3">
                <span class="text-yellow-500">⭐ {{campsite.rating}}</span>
                <span class="text-sm text-olive-green">({{campsite.reviews}} reviews)</span>
              </div>

              <div class="flex flex-wrap gap-2 mb-4">
                <span *ngFor="let amenity of campsite.amenities"
                      class="px-2 py-1 bg-sage-green/20 text-olive-green text-xs rounded-full">
                  {{amenity}}
                </span>
              </div>

              <button class="w-full bg-forest-green text-cream-beige py-2 rounded-lg hover:bg-olive-green transition-colors">
                Book Now
              </button>
            </div>
          </div>
        </div>

        <!-- Load More -->
        <div class="mt-12 text-center">
          <button class="px-8 py-3 bg-forest-green text-cream-beige rounded-lg hover:bg-olive-green transition-colors">
            Load More Campsites
          </button>
        </div>
      </div>
    </div>
  `
})
export class CampsitesComponent {
  filters = {
    location: '',
    priceRange: '',
    amenity: ''
  };

  campsites: Campsite[] = [
    {
      id: 1,
      name: 'Pine Valley Campground',
      location: 'Yosemite National Park, CA',
      image: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800&q=80',
      rating: 4.8,
      reviews: 324,
      price: 45,
      amenities: ['WiFi', 'Campfire', 'Hiking', 'Water'],
      distance: 2.5
    },
    {
      id: 2,
      name: 'Crystal Lake Retreat',
      location: 'Tahoe National Forest, CA',
      image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80',
      rating: 4.9,
      reviews: 512,
      price: 55,
      amenities: ['WiFi', 'Campfire', 'Water', 'Group'],
      distance: 3.2
    },
    {
      id: 3,
      name: 'Mountain Peak Base Camp',
      location: 'Rocky Mountain NP, CO',
      image: 'https://images.unsplash.com/photo-1537225228614-56cc3556d7ed?w=800&q=80',
      rating: 4.7,
      reviews: 289,
      price: 40,
      amenities: ['Campfire', 'Hiking', 'Water'],
      distance: 5.8
    },
    {
      id: 4,
      name: 'Redwood Grove Campsite',
      location: 'Redwood National Park, CA',
      image: 'https://images.unsplash.com/photo-1445308394109-4ec2920981b1?w=800&q=80',
      rating: 4.6,
      reviews: 178,
      price: 38,
      amenities: ['Campfire', 'Hiking', 'Group'],
      distance: 4.3
    },
    {
      id: 5,
      name: 'Sunset Vista Campground',
      location: 'Grand Canyon NP, AZ',
      image: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=800&q=80',
      rating: 4.9,
      reviews: 456,
      price: 50,
      amenities: ['WiFi', 'Campfire', 'Hiking', 'Water', 'Group'],
      distance: 1.8
    },
    {
      id: 6,
      name: 'Riverside Adventure Camp',
      location: 'Zion National Park, UT',
      image: 'https://images.unsplash.com/photo-1487730116645-74489c95b41b?w=800&q=80',
      rating: 4.8,
      reviews: 367,
      price: 48,
      amenities: ['WiFi', 'Water', 'Group'],
      distance: 3.7
    }
  ];
}
