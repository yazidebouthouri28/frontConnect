import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SiteService } from '../../services/site.service';
import { Site, Review, CampHighlight, VirtualTour, Certification } from '../../models/camping.models';
import { ReviewService } from '../../services/review.service';
import { CampHighlightService } from '../../services/camp-highlight.service';
import { VirtualTourService } from '../../services/virtual-tour.service';
import { CertificationService } from '../../services/certification.service';
import { AuthService } from '../../services/auth.service';

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
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        this.route.params.subscribe(params => {
            const id = +params['id'];
            if (id) {
                this.loadCampsite(id);
                this.loadRelatedData(id);
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

    goBack() {
        this.location.back();
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
                    reviewCount,
                    averageRating
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
