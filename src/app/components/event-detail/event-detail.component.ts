import { Component, Input, Output, EventEmitter, inject, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

import { Event } from '../../models/event.model';
import { EventServiceEntity } from '../../models/event-service-entity.model';
import { UserService } from '../../services/user.service';
import { ParticipantService } from '../../services/participant.service';
import { CandidatureService } from '../../services/candidature.service';

@Component({
    selector: 'app-event-detail',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './event-detail.component.html',
    styleUrls: ['./event-detail.component.css']
})
export class EventDetailComponent implements OnInit {
    private http = inject(HttpClient);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private location = inject(Location);
    public authService = inject(AuthService);
    private cdr = inject(ChangeDetectorRef);
    private userService = inject(UserService);
    private participantService = inject(ParticipantService);
    private candidatureService = inject(CandidatureService);

    newComment: string = '';
    userRating: number = 0;
    ticketCount: number = 1;
    showClaimForm: boolean = false;
    claimSubject: string = '';
    claimDescription: string = '';
    purchaseSuccess: boolean = false;
    errorMessage: string = '';
    isProcessing: boolean = false;

    userLiked: boolean = false;
    userDisliked: boolean = false;

    // Participant specific state
    isRegistered: boolean = false;
    registrationData: any = null;
    userCandidatures: any[] = []; // Changed to array
    showTicket: boolean = false;
    showApplyModal: boolean = false;
    selectedService: EventServiceEntity | null = null;
    applyMotivation: string = '';
    
    // Organizer specific state
    eventCandidatures: any[] = [];
    isCandidaturesLoading: boolean = false;

    private apiUrl = environment.apiUrl;

    @Input() isModal = false;
    @Input() viewOnly = false;
    @Input() set event(value: Event | null) {
        if (!value) {
            this._event = null;
            return;
        }
        
        console.log('[EventDetail] Setting event:', value.id, value.title);
        const clonedEvent = { ...value } as any;

        // More robust image field mapping
        if (!clonedEvent.image) {
            clonedEvent.image = clonedEvent.thumbnail || clonedEvent.picture || clonedEvent.imagePath;
        }

        if (clonedEvent.image) {
            clonedEvent.image = this.resolveImagePath(clonedEvent.image);
        }
        
        if (clonedEvent.images) {
            clonedEvent.images = clonedEvent.images.map((img: string) => this.resolveImagePath(img));
        }
        
        this._event = clonedEvent;
        this.userLiked = false;
        this.userDisliked = false;

        this.loadComments();
        this.loadUserReaction();
        this.checkRegistrationStatus();
        if (this.canManage) {
            this.loadEventCandidatures();
        }
    }
    get event(): Event | null { return this._event; }
    private _event: Event | null = null;

    @Output() back = new EventEmitter<void>();
    @Output() edit = new EventEmitter<Event>();
    @Output() add = new EventEmitter<void>();
    @Output() uploadImage = new EventEmitter<number>();
    @Output() apply = new EventEmitter<{ event: Event, service: EventServiceEntity }>();

    constructor() { }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.fetchEventById(Number(id));
        }
    }

    private fetchEventById(id: number) {
        console.log(`[EventDetail] Fetching event ${id}...`);
        this.isProcessing = true;
        this.http.get<any>(`${this.apiUrl}/events/${id}`).subscribe({
            next: (res) => {
                const eventData = res.data || res;
                console.log(`[EventDetail] Event data for ${id}:`, eventData);
                this.event = eventData;
                this.isProcessing = false;
                this.loadComments();
                this.loadUserReaction();
                this.checkRegistrationStatus();
            },
            error: (err) => {
                console.error('[EventDetail] Failed to fetch event:', err);
                this.isProcessing = false;
                this.errorMessage = 'Could not load event details.';
            }
        });
    }

    handleImageError(event: any) {
        event.target.src = 'assets/placeholder-event.jpg';
    }

    get progressPercent(): number {
        if (!this.event || !this.event.participants || !this.event.maxParticipants) return 0;
        return (this.event.participants / this.event.maxParticipants) * 100;
    }

    onBack() {
        if (this.isModal) {
            this.back.emit();
        } else {
            this.location.back();
        }
    }

    get canManage(): boolean {
        const user = this.authService.getCurrentUser();
        if (!user || user.role !== 'ORGANIZER' || !this.event) return false;
        return Number(user.id) === this.event.organizerUserId;
    }

    get displayRating(): number {
        if (!this.event || this.event.rating == null) {
            return 0;
        }
        return Number(this.event.rating);
    }

    get isOrganizerEvent(): boolean {
        // Events created by admin or legacy ones might use organizerId
        return !!(this.event && (this.event.organizerUserId || this.event.organizerId));
    }

    getStarFill(s: number): number {
        const rating = this.displayRating;
        if (s <= rating) return 100;
        if (s - 1 < rating) return (rating - (s - 1)) * 100;
        return 0;
    }

    editEvent() {
        if (!this.event) return;
        this.edit.emit(this.event);
    }

    addNewEvent() {
        this.add.emit();
    }

    triggerUpload(index: number) {
        if (!this.canManage) return;
        this.uploadImage.emit(index);
    }

    deleteEvent() {
        if (!this.event) return;
        if (confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
            this.isProcessing = true;
            this.http.delete(`${this.apiUrl}/api/events/${this.event.id}`).subscribe({
                next: () => {
                    this.isProcessing = false;
                    this.onBack();
                },
                error: (err) => {
                    this.isProcessing = false;
                    console.error('Delete failed:', err);
                    alert('Erreur lors de la suppression.');
                }
            });
        }
    }

    private loadUserReaction() {
        if (!this._event || !this.authService.isAuthenticated()) return;
        const userId = this.authService.getCurrentUser()?.id;
        if (!userId) return;
        this.http.get<{ liked: boolean; disliked: boolean }>(
            `${this.apiUrl}/events/${this._event.id}/my-reaction?userId=${userId}`
        ).subscribe({
            next: (res) => {
                this.userLiked = res.liked === true;
                this.userDisliked = res.disliked === true;
                this.cdr.detectChanges();
            },
            error: () => { }
        });
    }

    likeEvent() {
        if (!this.event || this.isProcessing) return;
        const user = this.authService.getCurrentUser();
        if (!user) {
            alert('Veuillez vous connecter pour aimer un événement.');
            this.router.navigate(['/auth/login']);
            return;
        }

        const userId = user.id;
        this.isProcessing = true;
        const originalLiked = this.userLiked;
        const originalDisliked = this.userDisliked;

        // Optimistic update: Toggle off if already liked, otherwise set liked
        if (this.userLiked) {
            this.userLiked = false;
        } else {
            this.userLiked = true;
            this.userDisliked = false;
        }
        this.cdr.detectChanges();

        this.http.post(`${this.apiUrl}/events/${this.event.id}/like?userId=${userId}`, {}).subscribe({
            next: () => {
                this.loadUserReaction();
                this.refreshEventData();
                this.isProcessing = false;
            },
            error: () => {
                this.userLiked = originalLiked;
                this.userDisliked = originalDisliked;
                this.isProcessing = false;
            }
        });
    }

    dislikeEvent() {
        if (!this.event || this.isProcessing) return;
        if (!this.authService.isAuthenticated()) {
            alert('Veuillez vous connecter pour ne pas aimer un événement.');
            this.router.navigate(['/auth/login']);
            return;
        }
        const userId = this.authService.getCurrentUser()?.id;
        if (!userId) return;

        this.isProcessing = true;
        const originalLiked = this.userLiked;
        const originalDisliked = this.userDisliked;

        // Backend handleDislike already toggles off if same, so we just optimism
        if (this.userDisliked) {
            this.userDisliked = false;
        } else {
            this.userDisliked = true;
            this.userLiked = false;
        }
        this.cdr.detectChanges();

        this.http.post(`${this.apiUrl}/events/${this.event.id}/dislike?userId=${userId}`, {}).subscribe({
            next: () => {
                this.loadUserReaction();
                this.refreshEventData();
                this.isProcessing = false;
            },
            error: () => {
                this.userLiked = originalLiked;
                this.userDisliked = originalDisliked;
                this.isProcessing = false;
            }
        });
    }

    rateEvent(rating: number) {
        if (!this.event) return;
        if (!this.authService.isAuthenticated()) {
            alert('Veuillez vous connecter pour noter un événement.');
            this.router.navigate(['/auth/login']);
            return;
        }
        this.userRating = rating;
        const userId = this.authService.getCurrentUser()?.id;
        if (!userId) return;

        const payload = {
            targetType: 'EVENT',
            targetId: this.event.id,
            rating: rating,
            comment: 'Note via interface event-detail'
        };
        this.http.post(`${this.apiUrl}/general-reviews?userId=${userId}`, payload).subscribe({
            next: () => {
                console.log(`Rated event ${this.event?.id} with ${rating} stars`);
                this.refreshEventData();
            },
            error: (err) => console.error('Rating failed', err)
        });
    }

    addComment() {
        if (!this.event || !this.newComment.trim()) return;
        if (!this.authService.isAuthenticated()) {
            alert('Veuillez vous connecter pour ajouter un commentaire.');
            this.router.navigate(['/auth/login']);
            return;
        }
        const userId = this.authService.getCurrentUser()?.id;
        const payload = {
            eventId: this.event.id,
            userId: Number(userId),
            content: this.newComment
        };
        this.http.post(`${this.apiUrl}/comments`, payload).subscribe({
            next: () => {
                this.newComment = '';
                this.refreshEventData();
                this.loadComments();
            },
            error: (err) => console.error('Comment failed', err)
        });
    }

    public comments: any[] = [];
    loadComments() {
        if (!this.event) return;
        this.http.get<any>(`${this.apiUrl}/comments/event/${this.event.id}`).subscribe({
            next: (res) => {
                this.comments = res.data || res;
            }
        });
    }

    buyTickets() {
        if (!this.event || !this.authService.isAuthenticated()) return;
        this.purchaseSuccess = true;
        setTimeout(() => this.purchaseSuccess = false, 5000);
    }

    submitClaim() {
        if (!this.event || !this.claimSubject.trim() || !this.authService.isAuthenticated()) return;
        const userId = this.authService.getCurrentUser()?.id;
        const payload = {
            subject: this.claimSubject,
            description: this.claimDescription,
            category: 'OTHER',
            referenceType: 'RESERVATION',
            referenceId: this.event.id
        };
        this.http.post(`${this.apiUrl}/complaints?userId=${userId}`, payload).subscribe({
            next: () => {
                this.showClaimForm = false;
                this.claimSubject = '';
                this.claimDescription = '';
                alert('Réclamation soumise avec succès.');
            },
            error: (err) => console.error('Claim failed', err)
        });
    }

    deleteComment(commentId: number) {
        if (!confirm('Voulez-vous vraiment supprimer ce commentaire ?')) return;
        this.http.delete(`${this.apiUrl}/comments/${commentId}`).subscribe({
            next: () => {
                this.loadComments();
                this.refreshEventData();
            },
            error: (err) => console.error('Delete comment failed', err)
        });
    }

    private refreshEventData() {
        if (!this.event) return;
        this.http.get<any>(`${this.apiUrl}/events/${this.event.id}`).subscribe({
            next: (res) => {
                const refreshedEvent = res.data || res;
                if (this._event) {
                    this._event.likesCount = refreshedEvent.likesCount;
                    this._event.dislikesCount = refreshedEvent.dislikesCount;
                    this._event.participants = refreshedEvent.currentParticipants || refreshedEvent.participants;
                    if (refreshedEvent.rating !== undefined) {
                        this._event.rating = refreshedEvent.rating;
                    }
                    this.cdr.detectChanges();
                }
            },
            error: (err) => console.error('Refresh failed', err)
        });
    }

    onApply(service: EventServiceEntity) {
        if (!this.event || !this.authService.isAuthenticated()) {
            alert('Please login as a Participant to apply.');
            this.router.navigate(['/auth/login']);
            return;
        }

        const user = this.authService.getCurrentUser();
        if (!user || user.role !== 'PARTICIPANT') {
            alert('Only Participants can apply for staff roles.');
            return;
        }

        this.selectedService = service;
        this.applyMotivation = '';
        this.showApplyModal = true;
    }

    submitApplication() {
        if (!this.selectedService || !this._event) return;
        const user = this.authService.getCurrentUser();
        if (!user) return;

        this.isProcessing = true;
        this.candidatureService.apply(Number(this.selectedService.id), Number(user.id), {
            lettreMotivation: this.applyMotivation || 'Candidature via event detail page'
        }).subscribe({
            next: () => {
                this.isProcessing = false;
                this.showApplyModal = false;
                this.applyMotivation = '';
                alert('Success! Your application has been submitted and is now EN_ATTENTE.');
                this.checkRegistrationStatus();
            },
            error: (err) => {
                this.isProcessing = false;
                console.error('Submission failed details:', err);
                const msg = err.error?.message || err.message || 'Unknown server error';
                alert(`Submission failed: ${msg}`);
            }
        });
    }

    joinEvent() {
        if (!this.event || !this.authService.isAuthenticated()) {
            alert('Please login to join this event.');
            this.router.navigate(['/auth/login']);
            return;
        }

        const user = this.authService.getCurrentUser();
        if (!user) return;

        this.isProcessing = true;
        this.participantService.joinEvent({
            name: user.name,
            email: user.email,
            phone: user.phone,
            eventId: Number(this.event.id),
            userId: Number(user.id)
        }).subscribe({
            next: () => {
                this.isProcessing = false;
                alert('Success! You are now registered for this event.');
                this.refreshEventData();
                this.checkRegistrationStatus();
                this.purchaseSuccess = true;
                setTimeout(() => this.purchaseSuccess = false, 5000);
            },
            error: (err) => {
                this.isProcessing = false;
                console.error('Join failed:', err);
                alert(err.error?.message || 'Failed to join event.');
            }
        });
    }

    private checkRegistrationStatus() {
        if (!this._event || !this.authService.isParticipant()) {
            this.isRegistered = false;
            this.registrationData = null;
            this.userCandidatures = [];
            return;
        }

        const user = this.authService.getCurrentUser();
        if (!user) return;

        // Fetch registration
        this.participantService.getMyEvents(Number(user.id)).subscribe({
            next: (response: any) => {
                const myEvents = response.data || response;
                if (Array.isArray(myEvents)) {
                    this.registrationData = myEvents.find((p: any) => Number(p.eventId) === Number(this._event?.id));
                    this.isRegistered = !!this.registrationData;
                }
                this.cdr.detectChanges();
            },
            error: (err: any) => console.error('Failed to check registration:', err)
        });

        // Fetch candidatures
        this.candidatureService.getByUser(Number(user.id)).subscribe({
            next: (response: any) => {
                const myCands = response.data || response;
                if (Array.isArray(myCands)) {
                    const serviceIds = this._event?.requestedServices?.map(s => Number(s.id)) || [];
                    this.userCandidatures = myCands.filter((c: any) => 
                        (c.eventId && Number(c.eventId) === Number(this._event?.id)) ||
                        (c.eventServiceId && serviceIds.includes(Number(c.eventServiceId)))
                    );
                }
                this.cdr.detectChanges();
            },
            error: (err: any) => console.error('Failed to fetch candidatures:', err)
        });
    }

    loadEventCandidatures() {
        if (!this._event || !this.canManage) return;
        this.isCandidaturesLoading = true;
        this.http.get<any>(`${this.apiUrl}/candidatures/event/${this._event.id}`).subscribe({
            next: (res) => {
                this.eventCandidatures = res.data || res;
                this.isCandidaturesLoading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Failed to load event candidatures:', err);
                this.isCandidaturesLoading = false;
            }
        });
    }

    updateCandidatureStatus(candId: number, status: string) {
        if (!this.canManage) return;
        const user = this.authService.getCurrentUser();
        if (!user) return;

        this.isProcessing = true;
        this.http.patch(`${this.apiUrl}/candidatures/${candId}/status?organisateurId=${user.id}&status=${status}`, {}).subscribe({
            next: () => {
                this.isProcessing = false;
                alert(`Candidature ${status === 'ACCEPTEE' ? 'acceptée' : 'rejetée'} avec succès !`);
                this.loadEventCandidatures();
                this.refreshEventData(); // To update quantiteAcceptee
            },
            error: (err) => {
                this.isProcessing = false;
                console.error('Failed to update status:', err);
                alert('Erreur lors de la mise à jour du statut.');
            }
        });
    }

    getCandidatureForService(serviceId: number): any {
        return this.userCandidatures.find(c => c.eventServiceId === serviceId);
    }

    get hasStaffAccess(): boolean {
        return this.userCandidatures.some(c => c.statut === 'ACCEPTEE' || c.statut === 'ACCEPTED');
    }

    getServicePlaceholderImage(serviceName: string): string {
        if (!serviceName) return 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800';
        const name = serviceName.toLowerCase();
        if (name.includes('guide') || name.includes('hiking'))
            return 'https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=800';
        if (name.includes('security') || name.includes('guard'))
            return 'https://images.unsplash.com/photo-1582139329536-e7284fece509?q=80&w=800';
        if (name.includes('cook') || name.includes('food') || name.includes('catering'))
            return 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=800';
        if (name.includes('photo') || name.includes('video'))
            return 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800';
        if (name.includes('music') || name.includes('dj') || name.includes('sound'))
            return 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=800';
        if (name.includes('medical') || name.includes('first aid') || name.includes('nurse'))
            return 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=800';
        if (name.includes('clean') || name.includes('maintenance'))
            return 'https://images.unsplash.com/photo-1581578731548-c64695cc6954?q=80&w=800';

        return 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800';
    }

    get isWorker(): boolean {
        return this.authService.getCurrentUser()?.role === 'PARTICIPANT';
    }

    get isOrganizer(): boolean {
        return this.userService.isOrganizer();
    }

    resolveImagePath(path: string | null): string {
        if (!path) return 'assets/placeholder-event.jpg';
        
        // If it's already a full URL or blob, return it as is
        if (path.startsWith('http') || path.startsWith('blob') || path.startsWith('data:')) {
            return path;
        }

        // Clean the path: remove leading / and any leading uploads/ prefix to avoid duplication
        const cleanPath = path.replace(/^\/+/, '').replace(/^uploads\//i, '');
        
        // Determine the base URL (strip /api if present)
        const baseUrl = this.apiUrl.endsWith('/api') ? this.apiUrl.substring(0, this.apiUrl.length - 4) : this.apiUrl;
        
        // Construct the final URL. We assume the backend serves uploads at /uploads/
        const finalPath = `${baseUrl}/uploads/${cleanPath}`;
        
        console.log(`[EventDetail] Resolving: "${path}" -> "${finalPath}"`);
        return finalPath;
    }
}
