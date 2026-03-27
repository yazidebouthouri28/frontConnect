import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Site } from '../../models/camping.models';
import { SiteService } from '../../services/site.service';

interface CampsiteCard {
  id: number;
  name: string;
  location: string;
  image: string;
  rating: number;
  reviews: number;
  price: number;
  amenities: string[];
  distance: number | null;
}

@Component({
  selector: 'app-campsite-listings',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './campsite-listings.component.html',
  styleUrls: ['./campsite-listings.component.css'],
})
export class CampsiteListingsComponent implements OnInit {
  isLoading = false;
  loadError = '';
  campsites: CampsiteCard[] = [];
  recommendedCampsites: CampsiteCard[] = [];

  private readonly fallbackImage = 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=1080';
  private readonly tunisCenter = { latitude: 36.8065, longitude: 10.1815 };

  amenityLabels: Record<string, string> = {
    wifi: 'WiFi',
    campfire: 'Campfire',
    hiking: 'Hiking',
    water: 'Water',
    group: 'Group',
  };

  constructor(
    private siteService: SiteService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadSites();
  }

  getAmenityLabel(amenity: string): string {
    return this.amenityLabels[amenity] ?? this.toTitleCase(amenity);
  }

  private loadSites(): void {
    this.isLoading = true;
    this.loadError = '';

    this.siteService.getAllSites().subscribe({
      next: (sites) => {
        const mapped = sites.map((site) => this.toCard(site));
        this.campsites = mapped;

        let recommendations = [...mapped].sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
        try {
          const prefsStr = typeof window !== 'undefined' ? localStorage.getItem('camp_user_preferences') : null;
          if (prefsStr) {
            const prefs = JSON.parse(prefsStr);
            const scored = [...mapped].map(site => {
              let score = site.rating || 0;
              if (prefs.amenities && Array.isArray(prefs.amenities)) {
                prefs.amenities.forEach((pref: string) => {
                  if (site.amenities.some(a => a.toLowerCase().includes(pref.toLowerCase()))) {
                    score += 2;
                  }
                });
              }
              if (prefs.style && Array.isArray(prefs.style)) {
                prefs.style.forEach((style: string) => {
                  const s = style.toLowerCase();
                  if (site.location.toLowerCase().includes(s) || site.name.toLowerCase().includes(s)) {
                    score += 3;
                  }
                });
              }
              return { site, score };
            });
            recommendations = scored.sort((a, b) => b.score - a.score).map(x => x.site);
          }
        } catch (e) {
          console.warn('Error applying user preferences to recommendations', e);
        }

        this.recommendedCampsites = recommendations.slice(0, 3);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.loadError = 'Unable to load campsites right now.';
        this.cdr.detectChanges();
      }
    });
  }

  private toCard(site: Site): CampsiteCard {
    const cityOrLocation = (site.location || site.city || '').trim();
    const country = (site.country || 'Tunisia').trim();
    const location = cityOrLocation ? `${cityOrLocation}, ${country}` : country;
    const amenities = (site.amenities ?? [])
      .map((amenity) => String(amenity).trim().toLowerCase())
      .filter(Boolean);

    return {
      id: site.id,
      name: site.name,
      location,
      image: site.images?.[0] || site.image || this.fallbackImage,
      rating: Number(site.averageRating ?? 0),
      reviews: Number(site.reviewCount ?? 0),
      price: Number(site.pricePerNight ?? site.price ?? 0),
      amenities,
      distance: this.estimateDistanceInMiles(site.latitude, site.longitude)
    };
  }

  private estimateDistanceInMiles(latitude?: number, longitude?: number): number | null {
    if (latitude === undefined || longitude === undefined || Number.isNaN(latitude) || Number.isNaN(longitude)) {
      return null;
    }

    const distanceKm = this.haversineDistanceKm(
      this.tunisCenter.latitude,
      this.tunisCenter.longitude,
      latitude,
      longitude
    );

    return Number((distanceKm * 0.621371).toFixed(1));
  }

  private haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const earthRadiusKm = 6371;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadiusKm * c;
  }

  private toTitleCase(value: string): string {
    return value
      .split(/[-_\s]+/)
      .filter(Boolean)
      .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1).toLowerCase())
      .join(' ');
  }
}
