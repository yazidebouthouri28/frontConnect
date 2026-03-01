import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';
import { ServiceService } from '../../modules/services/services/service.service';
import { PackService } from '../../modules/services/services/pack.service';

interface Review {
    author: string;
    avatar: string;
    rating: number;
    date: string;
    text: string;
}

interface Campsite {
    id: number;
    name: string;
    location: string;
    images: string[];
    rating: number;
    reviews: number;
    price: number;
    description: string;
    amenities: { icon: string; label: string }[];
    maxGuests: number;
    reviewsList: Review[];
}

@Component({
    selector: 'app-campsite-detail',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './campsite-detail.component.html',
    styleUrls: ['./campsite-detail.component.css']
})
export class CampsiteDetailComponent implements OnInit {
    campsite: Campsite | undefined;
    selectedAddon: any = null;
    addonType: 'service' | 'pack' | null = null;
    nights = 5;
    guests = 1;

    // Mock data
    private campsites: Campsite[] = [
        {
            id: 1,
            name: 'Pine Valley Campground',
            location: 'Yosemite National Park, CA',
            images: [
                'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?q=80&w=1200',
                'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?q=80&w=800',
                'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=800',
            ],
            rating: 4.8,
            reviews: 324,
            price: 45,
            description: 'Nestled in the heart of Yosemite...',
            amenities: [
                { icon: '🌲', label: 'Nature Trails' },
                { icon: '🔥', label: 'Campfire Rings' },
                { icon: '🚿', label: 'Hot Showers' },
                { icon: '📶', label: 'WiFi (Lodge)' }
            ],
            maxGuests: 6,
            reviewsList: [
                {
                    author: 'Sarah Jenkins',
                    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100',
                    rating: 5,
                    date: 'Oct 2025',
                    text: 'Absolutely stunning location!'
                }
            ]
        },
        {
            id: 2,
            name: 'Crystal Lake Retreat',
            location: 'Tahoe National Forest, CA',
            images: [
                'https://images.unsplash.com/photo-1763771056927-557d39cb5e02?q=80&w=1200',
                'https://images.unsplash.com/photo-1492648272180-61e45a8d98a7?q=80&w=800',
                'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?q=80&w=800'
            ],
            rating: 4.9,
            reviews: 512,
            price: 55,
            description: 'Experience the crystal clear waters of Lake Tahoe...',
            amenities: [
                { icon: '🚣', label: 'Boat Rentals' },
                { icon: '🎣', label: 'Fishing' },
                { icon: '🔌', label: 'RV Hookups' },
                { icon: '🛒', label: 'General Store' }
            ],
            maxGuests: 8,
            reviewsList: []
        }
    ];

    constructor(
        private route: ActivatedRoute,
        private location: Location,
        private cartService: CartService,
        private serviceService: ServiceService,
        private packService: PackService,
        private router: Router
    ) { }

    ngOnInit() {
        this.route.params.subscribe(params => {
            const id = +params['id'];
            this.campsite = this.campsites.find(c => c.id === id) || this.campsites[0];
        });

        this.route.queryParams.subscribe(params => {
            if (params['service']) {
                this.addonType = 'service';
                this.loadServiceAddon(+params['service']);
            } else if (params['pack']) {
                this.addonType = 'pack';
                this.loadPackAddon(+params['pack']);
            }
        });
    }

    private loadServiceAddon(id: number) {
        this.serviceService.getById(id).subscribe({
            next: (service) => {
                this.selectedAddon = service;
            },
            error: () => {
                // Fallback or handle error
                this.selectedAddon = { id, name: 'Service Add-on', price: 0 };
            }
        });
    }

    private loadPackAddon(id: number) {
        this.packService.getById(id).subscribe({
            next: (pack) => {
                this.selectedAddon = pack;
            },
            error: () => {
                this.selectedAddon = { id, name: 'Pack Add-on', price: 0 };
            }
        });
    }

    get totalAddons(): number {
        if (!this.selectedAddon) return 0;
        // User wants dynamic pricing. Let's assume services are per night if not specified otherwise.
        // For bundles (packs), it might be a single price.
        if (this.addonType === 'service') {
            return (this.selectedAddon.price || 0) * this.nights;
        }
        return this.selectedAddon.price || 0;
    }

    get totalPrice(): number {
        if (!this.campsite) return 0;
        const cleaningFee = 45;
        const serviceFee = 32;
        return (this.campsite.price * this.nights) + cleaningFee + serviceFee + this.totalAddons;
    }

    removeAddon() {
        this.selectedAddon = null;
        this.addonType = null;
    }

    onReserve() {
        if (!this.campsite) return;

        const reservationItem: CartItem = {
            id: `res-${this.campsite.id}-${Date.now()}`,
            name: `${this.campsite.name} Reservation`,
            image: this.campsite.images[0],
            type: 'Reservation',
            quantity: 1,
            price: this.totalPrice,
            details: {
                campsiteId: this.campsite.id,
                nights: this.nights,
                addon: this.selectedAddon
            }
        };

        this.cartService.addItem(reservationItem);
        this.router.navigate(['/cart']);
    }

    goBack() {
        this.location.back();
    }
}
