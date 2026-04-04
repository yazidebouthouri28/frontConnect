import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PackService } from '../../services/pack.service';
import { Pack } from '../../models/pack.model';
import { ServiceService } from '../../services/service.service';
import { Service } from '../../models/service.model';
import { forkJoin } from 'rxjs';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../../../services/user.service';
import { CartService } from '../../../../services/cart.service';
import { CartItem } from '../../../../models/api.models';
import { environment } from '../../../../../environments/environment';

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
        private router: Router,
        private cartService: CartService
    ) { }

    addToCart(pack: Pack): void {
        const image = (pack.images && pack.images.length > 0) ? pack.images[0] : (pack.image || '');

        this.cartService.addItem({
            productId: pack.id!.toString(),
            productName: pack.name,
            price: pack.price,
            quantity: 1,
            image: image,
            type: 'PURCHASE'
        });
        alert(`✅ Bundle "${pack.name}" added to cart!`);
        this.router.navigate(['/cart']);
    }

    onBook(packId: number, promoCode?: string): void {
        const pack = this.packs.find(p => p.id === packId);
        if (pack) {
            localStorage.setItem('campingExtra', JSON.stringify({
                id: pack.id,
                name: pack.name,
                price: pack.price,
                type: 'BUNDLE'
            }));
        }
        this.router.navigate(['/campsites'], {
            queryParams: {
                pack: packId,
                promo: promoCode || 'SPECIAL20',
                autoOpen: 'reservation'
            },
            queryParamsHandling: 'merge'
        });
    }

    isAdmin(): boolean { return this.userService.isAdmin(); }
    isUser(): boolean { return this.userService.isUser(); }
    isOrganizer(): boolean { return this.userService.isOrganizer(); }
    isParticipant(): boolean {
        const role = this.userService.getLoggedInUser()?.role;
        return role === 'PARTICIPANT' || role === 'CAMPER' || role === 'USER';
    }
    isCamper(): boolean {
        const role = this.userService.getLoggedInUser()?.role;
        return role === 'CAMPER';
    }

    onBookPack(pack: Pack): void {
        this.onBook(pack.id!);
    }

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
                // Ensure result.packs is an array before filtering
                const packsArray = Array.isArray(result.packs) ? result.packs : [];
                this.packs = isAdmin ? packsArray : packsArray.filter(p => p.isActive === true);
                this.services = result.services || [];
                this.loading = false;
            },
            error: (err) => {
                console.warn('Could not load bundles/services', err);
                const serverMsg = err.error?.message || err.message || 'Access Denied';
                this.error = `Bundles might be restricted or your session expired. (Details: ${serverMsg})`;
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
            this.packService.delete(id!).subscribe({
                next: () => this.loadData(),
                error: (err) => alert('Error deleting pack')
            });
        }
    }

    togglePackAvailability(pack: Pack): void {
        const currentlyActive = pack.isActive === true;
        const action = currentlyActive ? 'Deactivate' : 'Activate';
        if (confirm(`Are you sure you want to ${action.toLowerCase()} this bundle?`)) {
            this.packService.setStatus(pack.id!, !currentlyActive).subscribe({
                next: () => this.loadData(),
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
                this.packService.update(pack.id!, updatedPack).subscribe({
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

    getImageUrl(imagePath: string | undefined): string {
        return this.cartService.getImageUrl(imagePath);
    }
}
