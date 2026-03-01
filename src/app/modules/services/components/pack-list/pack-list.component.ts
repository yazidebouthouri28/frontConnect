import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PackService } from '../../services/pack.service';
import { Pack } from '../../models/pack.model';
import { ServiceService } from '../../services/service.service';
import { Service } from '../../models/service.model';
import { forkJoin } from 'rxjs';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../../../services/user.service';

@Component({
    selector: 'app-pack-list',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './pack-list.component.html',
    styleUrls: ['./pack-list.component.css']
})
export class PackListComponent implements OnInit {
    packs: Pack[] = [];
    services: Service[] = [];
    loading = false;
    error: string | null = null;

    constructor(
        private packService: PackService,
        private serviceService: ServiceService,
        private userService: UserService,
        private router: Router
    ) { }

    onBook(packId: number, promoCode?: string): void {
        this.router.navigate(['/campsites'], {
            queryParams: {
                pack: packId,
                promo: promoCode || 'SPECIAL20', // Pre-applying a mock promo code
                autoOpen: 'reservation'
            }
        });
    }

    isAdmin(): boolean { return this.userService.isAdmin(); }
    isUser(): boolean { return this.userService.isUser(); }
    isOrganizer(): boolean { return this.userService.isOrganizer(); }
    isParticipant(): boolean { return this.userService.isParticipant(); }

    ngOnInit(): void {
        this.loadData();
    }

    loadData(): void {
        this.loading = true;
        this.error = null;

        const isAdmin = this.isAdmin();
        const packsObs = isAdmin ? this.packService.getAllAdmin() : this.packService.getAll();

        forkJoin({
            packs: packsObs,
            services: this.serviceService.getAll()
        }).subscribe({
            next: (result) => {
                // Double check filtering for non-admins even if backend should handle it
                this.packs = isAdmin ? result.packs : result.packs.filter(p => p.isActive !== false);
                this.services = result.services;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading packs', err);
                this.error = 'Failed to load packs and services.';
                this.loading = false;
            }
        });
    }

    getServiceName(id: number): string {
        return this.services.find(s => s.id === id)?.name || 'Unknown Service';
    }

    calculateOriginalPrice(pack: Pack): number {
        return pack.price / (1 - pack.discount / 100);
    }

    deletePack(id: number): void {
        if (confirm('Are you sure you want to completely delete this bundle? This cannot be undone.')) {
            this.packService.delete(id).subscribe({
                next: () => this.loadData(),
                error: (err) => alert('Error deleting pack')
            });
        }
    }

    togglePackAvailability(pack: Pack): void {
        const action = pack.available ? 'Deactivate' : 'Activate';
        if (confirm(`Are you sure you want to ${action.toLowerCase()} this bundle?`)) {
            const newStatus = !pack.available;
            const updatedPack = { ...pack, available: newStatus, isActive: newStatus };
            this.packService.update(pack.id, updatedPack).subscribe({
                next: () => {
                    this.loadData();
                },
                error: () => alert(`Failed to ${action.toLowerCase()} bundle.`)
            });
        }
    }

    applyPromotion(pack: Pack): void {
        const discountStr = prompt(`Set a discount percentage for ${pack.name} (0 to 100):`, pack.discount.toString());
        if (discountStr !== null) {
            const discount = Number(discountStr);
            if (!isNaN(discount) && discount >= 0 && discount <= 100) {
                const updatedPack = { ...pack, discount: discount };
                this.packService.update(pack.id, updatedPack).subscribe({
                    next: () => {
                        alert(`Discount of ${discount}% applied successfully!`);
                        this.loadData();
                    },
                    error: () => alert('Failed to apply discount. Please try again.')
                });
            } else {
                alert('Invalid discount. Please enter a number between 0 and 100.');
            }
        }
    }
}
