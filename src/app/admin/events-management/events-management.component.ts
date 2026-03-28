import { Component, HostListener, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

interface AdminEvent {
    id: number;
    name: string;
    title: string;
    type: 'Workshop' | 'Trip' | 'Festival';
    location: string;
    date: string;
    participants: number;
    capacity: number;
    price: number;
    description: string;
    status: 'Published' | 'Draft';
    category: string;
    startDate: string;         // ADDED
    endDate: string;
    picture: string;
    isFree: boolean;
    eventType: string;
    createdAt: string;
    reviewCount: number;
    organizerId: number | null;
    organizerName: string;
    siteId: number | null;
    siteName: string;
}

interface EventForm {
    title: string;             // CHANGED: from 'name' to 'title'
    description: string;
    eventType: string;
    category: string;
    startDate: string;         // ADDED
    endDate: string;
    location: string;
    maxParticipants: number | null;
    price: number | null;
    isFree: boolean;
    picture: string;
    status: string;
    organizerId: number | null;
    siteId: number | null;
}

@Component({
    selector: 'app-events-admin-management',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './events-management.component.html',
    styleUrls: ['./events-management.component.css']
})
export class EventsAdminManagementComponent implements OnInit {

    private http = inject(HttpClient);
    private cdr = inject(ChangeDetectorRef);
    private route = inject(ActivatedRoute);
    private authService = inject(AuthService);

    private apiUrl = `${environment.apiUrl}/api/events`;
    private uploadUrl = `${environment.apiUrl}/api/files/upload`;
    private imageUrlBase = `${environment.apiUrl}/uploads/`;

    @HostListener('document:click')
    onDocumentClick() {
        this.activeActionMenu = null;
    }

    showAddForm = false;
    deleteMode = false;
    selectedEventIds = new Set<number>();
    imagePreview: string | null = null;
    selectedFileName = '';
    selectedFile: File | null = null;
    imageError = '';
    activeActionMenu: number | null = null;
    editingEventId: number | null = null;
    otherEventType = '';
    otherCategory = '';

    private readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
    private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    newEvent: EventForm = {
        title: '',               // CHANGED
        description: '',
        eventType: '',
        category: '',
        startDate: '',          // ADDED
        endDate: '',
        location: '',
        maxParticipants: null,
        price: null,
        isFree: false,
        picture: '',
        status: 'PUBLISHED',
        organizerId: null,
        siteId: 1
    };

    events: AdminEvent[] = [];
    loading = true;
    errorMessage = '';
    modalErrorMessage = '';

    eventTypes = ['WORKSHOP', 'CONFERENCE', 'FESTIVAL', 'OUTDOOR_ACTIVITY', 'CAMPING', 'HIKING', 'CONCERT', 'EXHIBITION', 'SPORTS', 'SOCIAL', 'Other'];
    categories = ['Nature', 'Adventure', 'Music', 'Sport', 'Education', 'Culture', 'Technology', 'Other'];

    openAddForm() {
        this.resetForm();
        this.setOrganizerId();
        this.newEvent.price = this.getAvgPrice();
        // Set a default start date (tomorrow at 10:00) – you can remove or adjust
        if (!this.newEvent.startDate) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(10, 0, 0);
            this.newEvent.startDate = tomorrow.toISOString().slice(0, 16);
        }
        this.showAddForm = true;
    }

    ngOnInit() {
        this.loadEvents();

        // Handle direct navigation for Add/Edit
        this.route.queryParams.subscribe(params => {
            const action = params['action'];
            const id = params['id'];

            if (action === 'add') {
                setTimeout(() => this.openAddForm(), 500);
            } else if (action === 'edit' && id) {
                const checkInterval = setInterval(() => {
                    if (!this.loading) {
                        const eventToEdit = this.events.find(e => e.id === Number(id));
                        if (eventToEdit) {
                            this.editEvent(eventToEdit);
                        }
                        clearInterval(checkInterval);
                    }
                }, 100);
                setTimeout(() => clearInterval(checkInterval), 3000);
            }
        });
    }

private setOrganizerId() {
  const user = this.authService.getCurrentUser();
  if (user && user.organizerId !== undefined && user.organizerId !== null) {
    // user.organizerId is already a number; assign directly
    this.newEvent.organizerId = user.organizerId;
  } else {
    // fallback to null if no organizer ID
    this.newEvent.organizerId = null;
  }
}

    loadEvents() {
        this.loading = true;
        this.errorMessage = '';
        this.http.get<any>(`${this.apiUrl}`).subscribe({
            next: (response) => {
                const data = response.data || response;
                this.events = (Array.isArray(data) ? data : []).map((e: any) => ({
                    id: e.id,
                    name: e.title || '',                    // CHANGED: backend returns title
                    title: (e.title || e.description || 'Untitled').substring(0, 30),
                    type: this.mapEventType(e.eventType),
                    location: e.location || '',
                    date: e.startDate ? new Date(e.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD', // CHANGED: use startDate
                    participants: e.currentParticipants || 0,
                    capacity: e.maxParticipants || 0,
                    price: e.price || 0,
                    description: e.description || '',
                    status: this.mapStatus(e.status),
                    category: e.category || '',
                    startDate: e.startDate ? e.startDate.replace('T', 'T').substring(0, 16) : '', // ADDED
                    endDate: e.endDate ? e.endDate.replace('T', 'T').substring(0, 16) : '',
                    picture: e.thumbnail || e.picture || e.images?.[0] || '',
                    isFree: e.isFree || false,
                    eventType: e.eventType || '',
                    createdAt: e.createdAt || '',
                    reviewCount: e.reviewCount || 0,
                    organizerId: e.organizerId || null,
                    organizerName: e.organizerName || '',
                    siteId: e.siteId || null,
                    siteName: e.siteName || ''
                }));
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Failed to load events:', err);
                this.errorMessage = 'Failed to load events. Is the backend running?';
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }

    private mapEventType(type: string): 'Workshop' | 'Trip' | 'Festival' {
        const map: Record<string, 'Workshop' | 'Trip' | 'Festival'> = {
            'WORKSHOP': 'Workshop', 'CONFERENCE': 'Workshop', 'FESTIVAL': 'Festival',
            'OUTDOOR_ACTIVITY': 'Trip', 'CAMPING': 'Trip', 'HIKING': 'Trip',
            'CONCERT': 'Festival', 'EXHIBITION': 'Festival', 'SPORTS': 'Trip',
            'SOCIAL': 'Festival', 'Other': 'Workshop'
        };
        return map[type] || 'Workshop';
    }

    private mapStatus(status: string): 'Published' | 'Draft' {
        switch (status) {
            case 'PUBLISHED': return 'Published';
            default: return 'Draft';
        }
    }

    getCategoryIcon(category: string): string {
        const icons: Record<string, string> = {
            'Nature': '🌿',
            'Adventure': '🏕️',
            'Music': '🎸',
            'Sport': '⚽',
            'Education': '📚',
            'Culture': '🎭',
            'Technology': '💻',
            'Other': '📌'
        };
        return icons[category] || '🎪';
    }

    getTotalParticipants(): number {
        return this.events.reduce((sum, e) => sum + (e.participants || 0), 0);
    }

    getAvgPrice(): number {
        if (this.events.length === 0) return 0;
        const total = this.events.reduce((sum, e) => sum + (e.price || 0), 0);
        return Math.round(total / this.events.length);
    }

    closeAddForm() {
        this.showAddForm = false;
        this.editingEventId = null;
        this.modalErrorMessage = '';
        this.removeImage();
    }

    resetForm() {
        this.newEvent = {
            title: '',               // CHANGED
            description: '',
            eventType: '',
            category: '',
            startDate: '',          // ADDED
            endDate: '',
            location: '',
            maxParticipants: null,
            price: null,
            isFree: false,
            picture: '',
            status: 'PUBLISHED',
            organizerId: null,
            siteId: 1
        };
        this.editingEventId = null;
        this.otherEventType = '';
        this.otherCategory = '';
        this.removeImage();
    }

    onFreeToggle() {
        if (this.newEvent.isFree) {
            this.newEvent.price = 0;
        } else if (this.newEvent.price === 0) {
            this.newEvent.price = this.getAvgPrice();
        }
    }

    onPriceChange() {
        if (this.newEvent.price === 0) {
            this.newEvent.isFree = true;
        } else if (this.newEvent.price && this.newEvent.price > 0) {
            this.newEvent.isFree = false;
        }
    }

    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        this.imageError = '';
        if (input.files && input.files[0]) {
            const file = input.files[0];

            if (!this.ALLOWED_TYPES.includes(file.type)) {
                this.imageError = `Invalid file type "${file.type || 'unknown'}". Only JPG, PNG, and WebP are allowed.`;
                input.value = '';
                return;
            }

            if (file.size > this.MAX_FILE_SIZE) {
                const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
                this.imageError = `File is too large (${sizeMB}MB). Maximum allowed size is 5MB.`;
                input.value = '';
                return;
            }

            if (this.imagePreview) {
                URL.revokeObjectURL(this.imagePreview);
            }

            this.selectedFile = file;
            this.selectedFileName = file.name;
            this.imagePreview = URL.createObjectURL(file);
            this.newEvent.picture = file.name;
            input.value = '';
        }
    }

    removeImage() {
        if (this.imagePreview) {
            URL.revokeObjectURL(this.imagePreview);
        }
        this.imagePreview = null;
        this.selectedFileName = '';
        this.selectedFile = null;
        this.newEvent.picture = '';
        this.imageError = '';
    }

    submitEvent() {
          console.log('submitEvent called');
        this.modalErrorMessage = '';

        let finalEventType = this.newEvent.eventType;
        if (finalEventType === 'Other') {
            finalEventType = this.otherEventType.trim() || 'Other';
        }

        let finalCategory = this.newEvent.category;
        if (finalCategory === 'Other') {
            finalCategory = this.otherCategory.trim() || 'Other';
        }

        if (!this.newEvent.picture && !this.imagePreview) {
            this.modalErrorMessage = 'L\'image de l\'événement est obligatoire.';
            return;
        }

        this.loading = true;

        if (this.selectedFile) {
            const formData = new FormData();
            formData.append('file', this.selectedFile);

            this.http.post<any>(this.uploadUrl, formData).subscribe({
                next: (res) => {
                    this.newEvent.picture = res.data.fileName;
                    this.selectedFile = null;
                    this.proceedWithSubmit(finalEventType, finalCategory);
                },
                error: (err) => {
                    console.error('Upload failed:', err);
                    this.modalErrorMessage = 'Échec du chargement de l\'image.';
                    this.loading = false;
                    this.cdr.detectChanges();
                }
            });
        } else {
            this.proceedWithSubmit(finalEventType, finalCategory);
        }
    }

    private proceedWithSubmit(finalEventType: string, finalCategory: string) {
        // Validate required fields
        if (!this.newEvent.title) {
            this.modalErrorMessage = 'Le titre de l\'événement est obligatoire.';
            this.loading = false;
            return;
        }
        if (!this.newEvent.startDate) {
            this.modalErrorMessage = 'La date de début est obligatoire.';
            this.loading = false;
            return;
        }
        if (!this.newEvent.endDate) {
            this.modalErrorMessage = 'La date de fin est obligatoire.';
            this.loading = false;
            return;
        }

        // Format dates: ensure they end with ':00' for seconds
        const startDateFormatted = this.newEvent.startDate.includes(':') ?
            (this.newEvent.startDate.length === 16 ? this.newEvent.startDate + ':00' : this.newEvent.startDate) :
            this.newEvent.startDate;
        const endDateFormatted = this.newEvent.endDate.includes(':') ?
            (this.newEvent.endDate.length === 16 ? this.newEvent.endDate + ':00' : this.newEvent.endDate) :
            this.newEvent.endDate;

        const normalizedThumbnail = this.normalizeStoredImagePath(this.newEvent.picture);
        const payload = {
            title: this.newEvent.title,               // CHANGED: use title instead of name
            description: this.newEvent.description,
            eventType: finalEventType,
            category: finalCategory,
            startDate: startDateFormatted,            // ADDED
            endDate: endDateFormatted,
            location: this.newEvent.location,
            maxParticipants: this.newEvent.maxParticipants,
            price: this.newEvent.price,
            isFree: this.newEvent.isFree,
            thumbnail: normalizedThumbnail,
            images: normalizedThumbnail ? [normalizedThumbnail] : [],
            status: this.newEvent.status,
            organizerId: this.newEvent.organizerId || 1,
            siteId: this.newEvent.siteId || 1
        };

        if (this.editingEventId !== null) {
            this.http.put<any>(`${this.apiUrl}/${this.editingEventId}`, payload).subscribe({
                next: () => {
                    this.loadEvents();
                    this.showAddForm = false;
                    this.editingEventId = null;
                    this.resetForm();
                },
                error: (err) => {
                    console.error('Update failed:', err);
                    this.modalErrorMessage = err.error?.message || 'Échec de la mise à jour de l\'événement.';
                    this.loading = false;
                    this.cdr.detectChanges();
                }
            });
        } else {
            this.http.post<any>(`${this.apiUrl}`, payload).subscribe({
                next: () => {
                    this.loadEvents();
                    this.showAddForm = false;
                    this.resetForm();
                },
                error: (err) => {
                    console.error('Creation failed:', err);
                    this.modalErrorMessage = err.error?.message || 'Échec de la création de l\'événement. Vérifiez que tous les champs obligatoires sont remplis.';
                    this.loading = false;
                    this.cdr.detectChanges();
                }
            });
        }
    }

    getStatusClass(status: string): string {
        switch (status) {
            case 'Published': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Draft': return 'bg-slate-100 text-slate-700 border-slate-200';
            default: return 'bg-gray-100 text-gray-700';
        }
    }

    toggleDeleteMode() {
        this.deleteMode = !this.deleteMode;
        if (!this.deleteMode) {
            this.selectedEventIds.clear();
        }
    }

    toggleEventSelection(id: number) {
        if (this.selectedEventIds.has(id)) {
            this.selectedEventIds.delete(id);
        } else {
            this.selectedEventIds.add(id);
        }
    }

    isSelected(id: number): boolean {
        return this.selectedEventIds.has(id);
    }

    selectAll() {
        if (this.isAllSelected()) {
            this.selectedEventIds.clear();
        } else {
            this.events.forEach(e => this.selectedEventIds.add(e.id));
        }
    }

    isAllSelected(): boolean {
        return this.events.length > 0 && this.selectedEventIds.size === this.events.length;
    }

    deleteSelectedEvents() {
        if (confirm(`Are you sure you want to delete ${this.selectedEventIds.size} events?`)) {
            const ids = Array.from(this.selectedEventIds);
            let deletedCount = 0;

            ids.forEach(id => {
                this.http.delete(`${this.apiUrl}/${id}`).subscribe({
                    next: () => {
                        deletedCount++;
                        if (deletedCount === ids.length) {
                            this.loadEvents();
                            this.selectedEventIds.clear();
                            this.deleteMode = false;
                        }
                    },
                    error: (err) => console.error(`Failed to delete event ${id}:`, err)
                });
            });
        }
    }

    toggleActionMenu(eventId: number, event: Event) {
        event.stopPropagation();
        this.activeActionMenu = this.activeActionMenu === eventId ? null : eventId;
    }

    closeActionMenu() {
        this.activeActionMenu = null;
    }

    editEvent(event: AdminEvent) {
        this.closeActionMenu();
        this.editingEventId = event.id;

        this.newEvent = {
            title: event.name || event.title,        // CHANGED
            description: event.description,
            eventType: event.eventType,
            category: event.category,
            startDate: event.startDate ? event.startDate.substring(0, 16) : '', // ADDED
            endDate: event.endDate ? event.endDate.substring(0, 16) : '',
            location: event.location,
            maxParticipants: event.capacity,
            price: event.price,
            isFree: event.isFree,
            picture: event.picture,
            status: event.status === 'Published' ? 'PUBLISHED' : 'DRAFT',
            organizerId: event.organizerId,
            siteId: event.siteId
        };

        if (!this.eventTypes.includes(event.eventType)) {
            this.newEvent.eventType = 'Other';
            this.otherEventType = event.eventType;
        } else {
            this.otherEventType = '';
        }

        if (!this.categories.includes(event.category)) {
            this.newEvent.category = 'Other';
            this.otherCategory = event.category;
        } else {
            this.otherCategory = '';
        }

        if (event.picture) {
            this.selectedFileName = event.picture.split('/').pop() || event.picture;
            this.imagePreview = this.resolveStoredImageUrl(event.picture);
        }

        this.showAddForm = true;
    }

    deleteSingleEvent(eventId: number) {
        if (confirm('Are you sure you want to delete this event?')) {
            this.http.delete(`${this.apiUrl}/${eventId}`).subscribe({
                next: () => {
                    this.loadEvents();
                    this.closeActionMenu();
                },
                error: (err) => {
                    console.error('Delete failed:', err);
                    this.errorMessage = 'Failed to delete event.';
                    this.cdr.detectChanges();
                }
            });
        }
    }

    publishEvent(eventId: number) {
        this.loading = true;
        this.http.post<any>(`${this.apiUrl}/${eventId}/publish`, {}).subscribe({
            next: () => {
                this.loadEvents();
                this.closeActionMenu();
            },
            error: (err) => {
                console.error('Publish failed:', err);
                this.errorMessage = err.error?.message || 'Failed to publish event.';
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }

    private resolveStoredImageUrl(path: string): string {
        if (!path) {
            return '';
        }

        if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:')) {
            return path;
        }

        if (path.startsWith('/uploads/')) {
            return `${environment.apiUrl}${path}`;
        }

        return `${this.imageUrlBase}${path}`;
    }

    private normalizeStoredImagePath(path: string): string {
        if (!path) {
            return '';
        }

        if (path.startsWith(this.imageUrlBase)) {
            return path.substring(this.imageUrlBase.length);
        }

        if (path.startsWith('/uploads/')) {
            return path.substring('/uploads/'.length);
        }

        if (path.startsWith('http://') || path.startsWith('https://')) {
            try {
                const url = new URL(path);
                const uploadsPrefix = '/uploads/';
                const uploadsIndex = url.pathname.indexOf(uploadsPrefix);
                if (uploadsIndex >= 0) {
                    return url.pathname.substring(uploadsIndex + uploadsPrefix.length);
                }
            } catch {
                return path;
            }
        }

        return path.replace(/^\/+/, '');
    }
}
