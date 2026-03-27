import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { SiteService } from '../../services/site.service';
import { Site, Review, CampHighlight, VirtualTour, Certification } from '../../models/camping.models';
import { ReviewService } from '../../services/review.service';
import { CampHighlightService } from '../../services/camp-highlight.service';
import { VirtualTourService } from '../../services/virtual-tour.service';
import { CertificationService } from '../../services/certification.service';
import { AuthService } from '../../services/auth.service';

import { CartService, CartItem } from '../../services/cart.service';
import { ServiceService } from '../../modules/services/services/service.service';
import { PackService } from '../../modules/services/services/pack.service';

@Component({
    selector: 'app-campsite-detail',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule],
    templateUrl: './campsite-detail.component.html',
    styleUrls: ['./campsite-detail.component.css']
})
export class CampsiteDetailComponent implements OnInit {
    campsite: Site | undefined;
    isLoading = true;
    errorMessage = '';
    mappedAmenities: { icon: string; label: string }[] = [];

    reviews: Review[] = [];
    highlights: CampHighlight[] = [];
    virtualTours: VirtualTour[] = [];
    certifications: Certification[] = [];
    readonly ratingStars = [1, 2, 3, 4, 5];
    reviewDraft = { rating: 5, comment: '' };
    reviewSubmitError = '';
    reviewSubmitSuccess = '';
    isSubmittingReview = false;

    likes = 12;
    dislikes = 0;
    userReaction: 'LIKE' | 'DISLIKE' | null = null;
    isGalleryOpen = false;
    activeGalleryIndex = 0;
    galleryImages: string[] = [];

    // Bundle / Reservation State (AhmedFront Work)
    selectedAddon: any = null;
    addonType: 'service' | 'pack' | null = null;
    nights = 5;
    guests = 1;

    private amenityConfig: Record<string, { icon: string; label: string }> = {
        wifi: { icon: '📶', label: 'WiFi (Lodge)' },
        campfire: { icon: '🔥', label: 'Campfire Rings' },
        hiking: { icon: '🌲', label: 'Nature Trails' },
        water: { icon: '🚿', label: 'Hot Showers' },
        group: { icon: '👥', label: 'Group Accommodation' },
        parking: { icon: '🅿️', label: 'Free Parking' },
        pets: { icon: '🐕', label: 'Pets Allowed' },
        default: { icon: '⛺', label: 'Standard Amenity' }
    };

    constructor(
        private route: ActivatedRoute,
        private location: Location,
        private siteService: SiteService,
        private reviewService: ReviewService,
        private highlightService: CampHighlightService,
        private virtualTourService: VirtualTourService,
        private certificationService: CertificationService,
        private authService: AuthService,
        private cdr: ChangeDetectorRef,
        public cartService: CartService,
        private serviceService: ServiceService,
        private packService: PackService,
        private router: Router
    ) { }

    ngOnInit() {
        // Sync nights from cart
        this.nights = this.cartService.getReservationNights() || 1;

        this.route.params.subscribe(params => {
            const id = +params['id'];
            if (id) {
                this.loadCampsite(id);
                this.loadRelatedData(id);
            }
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

    private loadCampsite(id: number) {
        this.isLoading = true;
        this.errorMessage = '';
        this.cdr.detectChanges();

        this.siteService.getSiteById(id).subscribe({
            next: (site) => {
                this.campsite = site;
                this.mapAmenities(site.amenities || []);
                this.isLoading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error fetching campsite details', err);
                this.errorMessage = 'Could not load campsite details';
                this.isLoading = false;
                this.cdr.detectChanges();
            }
        });
    }

    private loadRelatedData(siteId: number) {
        // Reviews
        this.reviewService.getReviewsBySite(siteId).subscribe({
            next: (reviews) => {
                this.reviews = reviews;
                this.cdr.detectChanges();
            },
            error: () => {
                this.reviews = [];
                this.cdr.detectChanges();
            }
        });

        // Highlights
        this.highlightService.getHighlightsBySite(siteId).subscribe({
            next: (highlights) => {
                this.highlights = highlights.filter(h => h.isPublished);
                this.cdr.detectChanges();
            },
            error: () => {
                this.highlights = [];
                this.cdr.detectChanges();
            }
        });

        // Virtual tours
        this.virtualTourService.getToursBySite(siteId).subscribe({
            next: (tours) => {
                this.virtualTours = tours;
                this.cdr.detectChanges();
            },
            error: () => {
                this.virtualTours = [];
                this.cdr.detectChanges();
            }
        });

        // Certifications
        this.certificationService.getCertificationsBySite(siteId).subscribe({
            next: (certs) => {
                this.certifications = certs;
                this.cdr.detectChanges();
            },
            error: () => {
                this.certifications = [];
                this.cdr.detectChanges();
            }
        });
    }

    private loadServiceAddon(id: number) {
        this.serviceService.getById(id).subscribe({
            next: (service) => {
                this.selectedAddon = service;
            },
            error: () => {
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

    private mapAmenities(amenities: string[]) {
        this.mappedAmenities = amenities.map(amenity => {
            const key = String(amenity).toLowerCase().trim();
            const config = this.amenityConfig[key];
            if (config) {
                return config;
            }
            return {
                icon: this.amenityConfig['default'].icon,
                label: amenity.charAt(0).toUpperCase() + amenity.slice(1)
            };
        });
    }

    // Reservation & Price Calculation (AhmedFront logic)
    get totalAddons(): number {
        if (!this.selectedAddon) return 0;
        if (this.addonType === 'service') {
            return (this.selectedAddon.price || 0) * this.nights;
        }
        return this.selectedAddon.price || 0;
    }

    get totalPrice(): number {
        if (!this.campsite) return 0;
        const cleaningFee = 45;
        const serviceFee = 32;
        return ((this.campsite.price || 0) * this.nights) + cleaningFee + serviceFee + this.totalAddons;
    }

    removeAddon() {
        this.selectedAddon = null;
        this.addonType = null;
    }

    onReserve() {
        if (!this.campsite) return;

        const mainImage = this.campsite.images?.[0] || (this.campsite as any).image || 'assets/images/logo.png';

        const reservationItem: CartItem = {
            productId: `res-${this.campsite.id}`,
            productName: `${this.campsite.name} Reservation`,
            id: `res-${this.campsite.id}-${Date.now()}`,
            name: `${this.campsite.name} Reservation`,
            image: mainImage,
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

    // Gallery, Likes, Reviews logic from HEAD
    toggleLike(): void {
        if (!this.isAuthenticated) return;
        if (this.userReaction === 'LIKE') {
            this.userReaction = null;
            this.likes--;
        } else {
            if (this.userReaction === 'DISLIKE') {
                this.dislikes--;
            }
            this.userReaction = 'LIKE';
            this.likes++;
        }
    }

    toggleDislike(): void {
        if (!this.isAuthenticated) return;
        if (this.userReaction === 'DISLIKE') {
            this.userReaction = null;
            this.dislikes--;
        } else {
            if (this.userReaction === 'LIKE') {
                this.likes--;
            }
            this.userReaction = 'DISLIKE';
            this.dislikes++;
        }
    }

    openGallery(index: number = 0): void {
        const fallbacks = [
            'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=1080',
            'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?q=80&w=800'
        ];

        if (this.campsite?.images?.length) {
            this.galleryImages = this.campsite.images.filter((u) => !!u && String(u).trim().length > 0);
        } else if ((this.campsite as any)?.image) {
            this.galleryImages = [(this.campsite as any).image].filter((u) => !!u);
            if (this.galleryImages.length < 2) {
                this.galleryImages = [...this.galleryImages, fallbacks[1]];
            }
        } else {
            this.galleryImages = [...fallbacks];
        }

        if (this.galleryImages.length === 0) {
            this.galleryImages = [...fallbacks];
        }

        this.activeGalleryIndex = Math.min(Math.max(0, index), this.galleryImages.length - 1);
        this.isGalleryOpen = true;
        document.body.style.overflow = 'hidden';
        this.cdr.detectChanges();
    }

    closeGallery(): void {
        this.isGalleryOpen = false;
        document.body.style.overflow = '';
        this.cdr.detectChanges();
    }

    @HostListener('document:keydown.escape')
    onEscapeGallery(): void {
        if (this.isGalleryOpen) {
            this.closeGallery();
        }
    }

    onGalleryBackdropClick(event: MouseEvent): void {
        if ((event.target as HTMLElement).classList.contains('gallery-backdrop')) {
            this.closeGallery();
        }
    }

    nextImage(): void {
        if (this.galleryImages.length > 0) {
            this.activeGalleryIndex = (this.activeGalleryIndex + 1) % this.galleryImages.length;
        }
    }

    prevImage(): void {
        if (this.galleryImages.length > 0) {
            this.activeGalleryIndex = (this.activeGalleryIndex - 1 + this.galleryImages.length) % this.galleryImages.length;
        }
    }

    goBack() {
        this.location.back();
    }

    get isAuthenticated(): boolean {
        return this.authService.isAuthenticated();
    }

    get isReviewAllowed(): boolean {
        return this.authService.isAuthenticated() && !this.authService.isAdmin();
    }

    get shouldShowReviewLoginHint(): boolean {
        return !this.authService.isAuthenticated();
    }

    setDraftRating(star: number): void {
        if (star >= 1 && star <= 5) {
            this.reviewDraft.rating = star;
        }
    }

    isHighlightVideo(mediaUrl?: string): boolean {
        if (!mediaUrl) return false;
        if (mediaUrl.startsWith('data:')) {
            return mediaUrl.startsWith('data:video/');
        }
        const normalized = mediaUrl.split('?')[0].toLowerCase();
        return /\.(mp4|webm|ogg|mov|m4v)$/.test(normalized);
    }

    submitReview(): void {
        if (!this.campsite || !this.isReviewAllowed || this.isSubmittingReview) {
            return;
        }

        const comment = (this.reviewDraft.comment || '').trim();
        const rating = Number(this.reviewDraft.rating);

        if (!comment) {
            this.reviewSubmitError = 'Please write your review comment.';
            this.reviewSubmitSuccess = '';
            return;
        }

        if (rating < 1 || rating > 5) {
            this.reviewSubmitError = 'Please choose a star rating between 1 and 5.';
            this.reviewSubmitSuccess = '';
            return;
        }

        const currentUser = this.authService.getCurrentUser();
        const numericUserId = currentUser?.id && /^\d+$/.test(String(currentUser.id))
            ? Number(currentUser.id)
            : undefined;

        this.isSubmittingReview = true;
        this.reviewSubmitError = '';
        this.reviewSubmitSuccess = '';

        this.reviewService.createReview(this.campsite.id, {
            rating,
            comment,
            userId: numericUserId
        }).subscribe({
            next: (created) => {
                const fallbackName = currentUser?.name || currentUser?.username || 'Guest';
                const reviewWithUser = {
                    ...created,
                    userName: created.userName || fallbackName
                };

                this.reviews = [reviewWithUser, ...this.reviews];

                const reviewCount = this.reviews.length;
                const totalRating = this.reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0);
                const averageRating = reviewCount ? Number((totalRating / reviewCount).toFixed(1)) : 0;

                this.campsite = {
                    ...this.campsite!,
                    reviewCount: reviewCount as any,
                    averageRating: averageRating as any
                };

                this.reviewDraft = { rating: 5, comment: '' };
                this.reviewSubmitSuccess = 'Your review has been submitted.';
                this.isSubmittingReview = false;
                this.cdr.detectChanges();
            },
            error: (error) => {
                this.reviewSubmitError = error?.message || 'Unable to submit review right now.';
                this.reviewSubmitSuccess = '';
                this.isSubmittingReview = false;
                this.cdr.detectChanges();
            }
        });
    }
}
