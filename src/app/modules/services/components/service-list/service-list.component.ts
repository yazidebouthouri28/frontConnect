import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ServiceService } from '../../services/service.service';
import { Service } from '../../models/service.model';
import { UserService } from '../../../../services/user.service';
import { CartService } from '../../../../services/cart.service';
import { CartItem } from '../../../../models/api.models';
import { environment } from '../../../../../environments/environment';
import { EventService } from '../../../../services/event.service';
import { Event } from '../../../../models/event.model';

@Component({
    selector: 'app-service-list',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './service-list.component.html',
    styleUrls: ['./service-list.component.css']
})
export class ServiceListComponent implements OnInit {
    services: Service[] = [];
    loading = false;
    error: string | null = null;
    searchTerm = '';
    userEvents: Event[] = [];
    selectedEventId: number | null = null;

    @Input() adminViewMode: 'ALL' | 'USER' | 'ORGANIZER' = 'ALL';

    constructor(
        private serviceService: ServiceService,
        private userService: UserService,
        private router: Router,
        private cartService: CartService,
        private eventService: EventService
    ) { }

    ngOnInit(): void {
        this.loadServices();
        if (this.isOrganizer()) {
            this.loadUserEvents();
        }
    }

    addToCart(service: Service): void {
        const image = (service.images && service.images.length > 0) ? service.images[0] : '';

        this.cartService.addItem({
            productId: service.id.toString(),
            productName: service.name,
            price: service.price,
            quantity: 1,
            image: image,
            type: 'PURCHASE'
        });
        alert(`✅ ${service.name} added to cart!`);
        this.router.navigate(['/cart']);
    }

    onBook(serviceId: number): void {
        const service = this.services.find(s => s.id === serviceId);
        if (service) {
            localStorage.setItem('campingExtra', JSON.stringify({
                id: service.id,
                name: service.name,
                price: service.price,
                type: 'SERVICE'
            }));
        }
        this.router.navigate(['/campsites'], {
            queryParams: {
                service: serviceId,
                autoOpen: 'reservation'
            },
            queryParamsHandling: 'merge'
        });
    }

    // Role Checks (Defined once)
    isAdmin(): boolean { return this.userService.isAdmin(); }
    isOrganizer(): boolean { return this.userService.isOrganizer(); }
    isParticipant(): boolean {
        const role = this.userService.getLoggedInUser()?.role;
        return role === 'PARTICIPANT' || role === 'CAMPER' || role === 'USER';
    }
    isUser(): boolean {
        const role = this.userService.getLoggedInUser()?.role;
        return role === 'USER' || role === 'CLIENT';
    }
    isCamper(): boolean {
        const role = this.userService.getLoggedInUser()?.role;
        return role === 'CAMPER';
    }

    loadServices(): void {
        this.loading = true;
        this.error = null;
        this.serviceService.getAll().subscribe({
            next: (data) => {
                this.services = data;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading services', err);
                this.error = 'Failed to load services. Please try again later.';
                this.loading = false;
            }
        });
    }

    loadUserEvents(): void {
        const user = this.userService.getLoggedInUser();
        if (!user) return;

        const userOrgIdStr = (user as any).organizerId?.toString();

        this.eventService.getEvents().subscribe({
            next: (events) => {
                const eventsList = Array.isArray(events) ? events : [];

                this.userEvents = eventsList.filter((e: any) => {
                    const eOrgId = e.organizerId?.toString();
                    return userOrgIdStr && eOrgId === userOrgIdStr;
                });
                console.log('Found user events:', this.userEvents.length);
                
                if (this.userEvents.length > 0) {
                    this.selectedEventId = this.userEvents[0].id;
                } else {
                    this.selectedEventId = null;
                }
            },
            error: (err) => {
                console.error('Error loading events:', err);
                this.selectedEventId = null;
            }
        });
    }

    onEventChange(eventId: any): void {
        console.log('Event selection changed to:', eventId);
        this.selectedEventId = eventId;
    }

    onSelectForEvent(service: Service): void {
        console.log('--- DEBUG SERVICE SELECTION ---');
        console.log('Selected Event ID:', this.selectedEventId);
        console.log('Total Available User Events:', this.userEvents.length);
        
        if (this.selectedEventId === null || this.selectedEventId === undefined) {
            alert(`Please select an event from the dropdown at the top first!`);
            return;
        }

        const request = {
            name: service.name,
            description: service.description,
            serviceType: service.type ? service.type.toUpperCase() : 'OTHER',
            price: service.price,
            quantiteRequise: 1,
            eventId: this.selectedEventId,
            serviceId: service.id,
            included: false,
            optional: true
        };

        this.eventService.addRequestedService(this.selectedEventId, request as any).subscribe({
            next: () => {
                alert(`✅ ${service.name} has been linked to your event!`);
            },
            error: (err) => {
                console.error('Error linking service to event', err);
                alert('Failed to link service to event.');
            }
        });
    }

    deleteService(id: number): void {
        if (confirm('Are you sure you want to delete this service?')) {
            this.serviceService.delete(id).subscribe({
                next: () => {
                    this.loadServices();
                },
                error: (err) => {
                    console.error('Error deleting service', err);
                    alert('Error during deletion.');
                }
            });
        }
    }

    toggleServiceAvailability(service: Service): void {
        const action = service.isActive ? 'Deactivate' : 'Activate';
        if (confirm(`Are you sure you want to ${action.toLowerCase()} this service?`)) {
            const newStatus = !service.isActive;
            const updatedService = { ...service, isActive: newStatus, available: newStatus };
            this.serviceService.update(service.id, updatedService).subscribe({
                next: () => {
                    this.loadServices();
                },
                error: () => alert(`Failed to ${action.toLowerCase()} service.`)
            });
        }
    }

    get filteredServices(): Service[] {
        const userRole = this.userService.getLoggedInUser()?.role;

        let roleFiltered: Service[];
        if (userRole === 'ADMIN') {
            if (this.adminViewMode === 'USER') {
                roleFiltered = this.services.filter(s => !s.targetRole || s.targetRole === 'USER');
            } else if (this.adminViewMode === 'ORGANIZER') {
                roleFiltered = this.services.filter(s => s.targetRole === 'ORGANIZER');
            } else {
                roleFiltered = this.services;
            }
        } else {
            let base = this.services.filter(s => s.isActive !== false);

            if (userRole === 'ORGANIZER') {
                roleFiltered = base.filter(s => s.isOrganizerService || s.targetRole === 'ORGANIZER');
            } else {
                roleFiltered = base.filter(s => (!s.targetRole || s.targetRole === 'USER') && !s.isOrganizerService);
            }
        }

        if (!this.searchTerm) return roleFiltered;
        const term = this.searchTerm.toLowerCase();
        return roleFiltered.filter(s =>
            s.name.toLowerCase().includes(term) ||
            s.type.toLowerCase().includes(term)
        );
    }

    onBookService(service: Service): void {
        this.onBook(service.id);
    }

    getImageUrl(imagePath: string | undefined): string {
        return this.cartService.getImageUrl(imagePath);
    }
}
