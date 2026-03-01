import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ServiceService } from '../../services/service.service';
import { Service } from '../../models/service.model';
import { UserService } from '../../../../services/user.service';

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

    @Input() adminViewMode: 'ALL' | 'USER' | 'ORGANIZER' = 'ALL';

    constructor(
        private serviceService: ServiceService,
        private userService: UserService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.loadServices();
    }

    onBook(serviceId: number): void {
        // Recommendation: Redirect to reservation with query params
        this.router.navigate(['/campsites'], {
            queryParams: {
                service: serviceId,
                autoOpen: 'reservation'
            }
        });
    }

    isAdmin(): boolean { return this.userService.isAdmin(); }
    isOrganizer(): boolean { return this.userService.isOrganizer(); }
    isParticipant(): boolean { return this.userService.isParticipant(); }
    isUser(): boolean { return this.userService.isUser(); }

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
            // For non-admins, show only active services
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
}
