import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GamificationService, Gamification } from '../../services/gamification.service';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-gamification-management',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './gamification-management.component.html',
    styleUrls: ['./gamification-management.component.css']
})
export class GamificationManagementComponent implements OnInit {
    private gamificationService = inject(GamificationService);
    private authService = inject(AuthService);

    badges: Gamification[] = [];
    loading = false;
    showModal = false;
    isEditing = false;
    modalErrorMessage = '';

    currentBadge: Gamification = {
        name: '',
        description: '',
        icon: '',
        pointsValue: 0
    };

    ngOnInit() {
        this.loadBadges();
    }

    loadBadges() {
        this.loading = true;
        const organizerId = this.authService.hasRole('ORGANIZER') ? this.authService.getCurrentUser()?.organizerId : undefined;

        this.gamificationService.getAll(organizerId).subscribe({
            next: (data) => {
                this.badges = data;
                this.loading = false;
            },
            error: (err) => {
                console.error('Failed to load badges', err);
                this.loading = false;
            }
        });
    }

    openModal(badge?: Gamification) {
        if (badge) {
            this.currentBadge = { ...badge };
            this.isEditing = true;
        } else {
            this.currentBadge = {
                name: '',
                description: '',
                icon: '',
                pointsValue: 0
            };
            this.isEditing = false;
        }
        this.showModal = true;
    }

    closeModal() {
        this.showModal = false;
    }

    saveBadge() {
        this.modalErrorMessage = '';

        if (!this.currentBadge.name || this.currentBadge.name.length < 2) {
            this.modalErrorMessage = 'Le nom doit contenir au moins 2 caractères.';
            return;
        }

        if (this.currentBadge.pointsValue < 0) {
            this.modalErrorMessage = 'Les points ne peuvent pas être négatifs.';
            return;
        }

        if (!this.currentBadge.icon) {
            this.modalErrorMessage = 'L\'icône est obligatoire.';
            return;
        }

        if (this.authService.hasRole('ORGANIZER')) {
            this.currentBadge.organizerId = this.authService.getCurrentUser()?.organizerId;
        }

        if (this.isEditing && this.currentBadge.id) {
            this.gamificationService.update(this.currentBadge.id, this.currentBadge).subscribe({
                next: () => {
                    this.loadBadges();
                    this.closeModal();
                },
                error: (err) => alert('Update failed: ' + err.message)
            });
        } else {
            this.gamificationService.create(this.currentBadge).subscribe({
                next: () => {
                    this.loadBadges();
                    this.closeModal();
                },
                error: (err) => alert('Create failed: ' + err.message)
            });
        }
    }

    deleteBadge(id: number) {
        if (confirm('Are you sure you want to delete this badge?')) {
            this.gamificationService.delete(id).subscribe({
                next: () => this.loadBadges(),
                error: (err) => alert('Delete failed: ' + err.message)
            });
        }
    }
}
