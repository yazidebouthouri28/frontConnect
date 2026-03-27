import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Campsite } from '../../models/campsite.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Hero Section -->
    <section class="relative h-[600px] overflow-hidden">
      <div class="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1920&q=80"
          alt="Mountain camping"
          class="w-full h-full object-cover"
        />
        <div class="absolute inset-0 bg-gradient-to-r from-forest-green/80 to-forest-green/40"></div>
      </div>

      <div class="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
        <div class="max-w-3xl">
          <h1 class="mb-6 text-4xl md:text-5xl lg:text-6xl font-bold text-cream-beige leading-tight">
            CAMP IS MORE THAN JUST A WORD,<br />IT'S AN EXPERIENCE!
          </h1>
          <p class="mb-8 text-lg md:text-xl text-cream-beige/90">
            Discover unforgettable camping locations and create memories that last a lifetime.
          </p>

          <div class="bg-white rounded-xl shadow-2xl p-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Where to?"
                [(ngModel)]="searchLocation"
                class="px-4 py-3 border border-sage-green rounded-lg focus:outline-none focus:ring-2 focus:ring-olive-green"
              />
              <input
                type="date"
                [(ngModel)]="searchDate"
                class="px-4 py-3 border border-sage-green rounded-lg focus:outline-none focus:ring-2 focus:ring-olive-green"
              />
              <button class="bg-forest-green text-cream-beige py-3 rounded-lg font-medium hover:bg-olive-green transition-colors">
                Search
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Recommended Section (Hidden if no preferences) -->
    <section *ngIf="userPreferences && recommendedCampsites.length > 0" class="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-sage-green/5 rounded-3xl my-12 border border-sage-green/10 shadow-inner">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h2 class="text-3xl font-black text-forest-green tracking-tight">Recommended for You</h2>
          <p class="text-olive-green text-sm font-medium">Curated based on your camping style preference.</p>
        </div>
        <button (click)="viewDetails()" class="text-sm font-bold text-forest-green hover:underline flex items-center gap-2">
          View Suggestions <i class="fas fa-arrow-right text-xs"></i>
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div *ngFor="let site of recommendedCampsites" 
             class="group relative bg-white rounded-2xl shadow-sm border border-sage-green/20 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div class="h-56 relative overflow-hidden">
            <img [src]="getImageUrl(site.image)" [alt]="site.name" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div class="absolute top-4 left-4">
              <span class="px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black text-forest-green uppercase tracking-widest shadow-sm">
                {{site['style']}} Experience
              </span>
            </div>
          </div>
          <div class="p-6">
            <h3 class="text-xl font-bold text-forest-green mb-2">{{site.name}}</h3>
            <p class="text-olive-green text-xs mb-4">📍 {{site.location}}</p>
            <div class="flex justify-between items-center">
              <span class="text-2xl font-black text-forest-green">{{site.price}} TND</span>
              <button (click)="viewDetails()" class="w-10 h-10 rounded-xl bg-forest-green text-cream-beige flex items-center justify-center hover:bg-black transition-colors shadow-lg">
                <i class="fas fa-chevron-right text-xs"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Campsites -->
    <section class="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div class="flex items-center justify-between mb-8">
        <h2 class="text-3xl font-black text-forest-green tracking-tight">Featured Destinations</h2>
        <div class="h-px bg-sage-green/20 flex-1 mx-8 hidden md:block"></div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div *ngFor="let campsite of campsites"
             class="bg-white rounded-2xl shadow-sm border border-sage-green/20 overflow-hidden hover:shadow-lg transition-all group">
          <div class="h-48 overflow-hidden">
            <img [src]="getImageUrl(campsite.image)" [alt]="campsite.name" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          </div>

          <div class="p-5">
            <div class="flex justify-between items-center mb-2">
               <h3 class="text-lg font-bold text-forest-green">{{campsite.name}}</h3>
               <span class="text-yellow-500 font-bold text-sm">⭐ {{campsite.rating}}</span>
            </div>
            <p class="text-olive-green text-xs mb-4 flex items-center">
              <i class="fas fa-map-marker-alt mr-2 opacity-50"></i> {{campsite.location}}
            </p>

            <div class="flex justify-between items-center pt-4 border-t border-sage-green/10">
              <span class="text-xl font-black text-forest-green">\${{campsite.price}}<small class="text-[10px] font-bold text-olive-green italic">/night</small></span>
              <button (click)="viewDetails()" class="text-xs font-black uppercase tracking-widest text-olive-green hover:text-forest-green transition-colors">
                Explore <i class="fas fa-long-arrow-alt-right ml-1"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  `
})
export class HomeComponent implements OnInit {
  searchLocation = '';
  searchDate = '';
  userPreferences: any = null;
  recommendedCampsites: Campsite[] = [];

  campsites: Campsite[] = [
    {
      id: 1,
      name: 'Pine Valley Campground',
      location: 'Yosemite National Park, CA',
      image: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800&q=80',
      rating: 4.8,
      reviews: 324,
      price: 45,
      amenities: ['WiFi', 'Campfire'],
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
      amenities: ['WiFi', 'Water'],
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
      amenities: ['Hiking'],
      distance: 5.8
    }
  ];

  // A larger pool of campsites for the "algorithm" to choose from
  allCampsites: any[] = [
    { id: 10, name: 'Beni Mtir Forest', location: 'Jendouba, Tunisia', image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80', rating: 4.9, price: 35, style: 'forest', intensity: 'rustic' },
    { id: 11, name: 'Ghar El Melh Beach', location: 'Bizerte, Tunisia', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80', rating: 4.7, price: 60, style: 'beach', intensity: 'relaxed' },
    { id: 12, name: 'Zaghouan Mountain Peak', location: 'Zaghouan, Tunisia', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80', rating: 4.8, price: 40, style: 'mountain', intensity: 'extreme' },
    { id: 13, name: 'Ichkeul Lakeside', location: 'Mateur, Tunisia', image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80', rating: 4.6, price: 25, style: 'lakeside', intensity: 'moderate' },
    { id: 14, name: 'Douz Desert Oasis', location: 'Kebili, Tunisia', image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80', rating: 4.9, price: 80, style: 'desert', intensity: 'rustic' },
    { id: 15, name: 'Korbous Coastal Cliffs', location: 'Nabeul, Tunisia', image: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800&q=80', rating: 4.5, price: 50, style: 'beach', intensity: 'moderate' }
  ];

  constructor(private router: Router) { }

  ngOnInit() {
    this.checkPreferences();
  }

  checkPreferences() {
    const prefsJson = localStorage.getItem('camp_user_preferences');
    if (prefsJson) {
      this.userPreferences = JSON.parse(prefsJson);
      this.generateRecommendations();
    }
  }

  generateRecommendations() {
    if (!this.userPreferences) return;

    const preferredStyles = this.userPreferences.style || [];
    const preferredIntensity = this.userPreferences.intensity?.[0] || '';

    // Simple "algorithm"
    this.recommendedCampsites = this.allCampsites.filter(site => {
      // Prioritize by style
      if (preferredStyles.includes(site.style)) return true;
      // Then by intensity
      if (site.intensity === preferredIntensity) return true;
      return false;
    }).slice(0, 3); // Take top 3

    // Fallback if no exact matches
    if (this.recommendedCampsites.length === 0) {
      this.recommendedCampsites = this.allCampsites.slice(0, 3);
    }
  }

  viewDetails() {
    this.router.navigate(['/campsites']);
  }

  getImageUrl(imagePath: string | undefined): string {
    if (!imagePath) return '';
    if (imagePath.startsWith('http') || imagePath.startsWith('data:') || imagePath.startsWith('blob:')) {
      return imagePath;
    }
    const baseUrl = environment.apiUrl.replace('/api', '');
    return `${baseUrl}/uploads/${imagePath}`;
  }
}
