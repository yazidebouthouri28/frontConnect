import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GamificationService } from '../../services/gamification.service';
import { Badge, Medal } from '../../models/gamification.models';

type ViewMode = 'organizer' | 'admin';
type OrganizerMedalFilterKey = 'all' | 'community' | 'science' | 'scout';
type EditEntityType = 'badge' | 'medal';
type ProgressStep = { level: string; requirement: string; icon: string; tone: string };

@Component({
    selector: 'app-gamification-management',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './gamification-management.component.html',
    styleUrls: ['./gamification-management.component.css']
})
export class GamificationManagementComponent implements OnInit {
    private gamificationService = inject(GamificationService);
    private router = inject(Router);

    badges: Badge[] = [];
    medals: Medal[] = [];
    loading = false;
    viewMode: ViewMode = 'organizer';
    selectedOrganizerFilter: OrganizerMedalFilterKey = 'all';

    showEditorModal = false;
    saving = false;
    deleting = false;
    modalError = '';
    editorType: EditEntityType = 'badge';
    isEditing = false;

    currentBadge: { id?: number; name: string; icon: string; medalId: number | null } = {
        name: '',
        icon: '',
        medalId: null
    };
    currentMedal: { id?: number; name: string; icon: string; type: string } = {
        name: '',
        icon: '',
        type: ''
    };

    readonly badgeImageBasePath = 'assets/images/Badge/';
    readonly medalImageBasePath = 'assets/images/Medal/';
    readonly organizerFilters: Array<{ key: OrganizerMedalFilterKey; label: string }> = [
        { key: 'all', label: 'All Medals' },
        { key: 'community', label: 'Community Leadership Medal' },
        { key: 'science', label: 'Science and Arts' },
        { key: 'scout', label: 'Scout Leadership' }
    ];
    readonly progressionSteps: ProgressStep[] = [
        { level: 'Bronze', requirement: 'Collect at least 3 badges in the medal', icon: '🥉', tone: 'bronze' },
        { level: 'Silver', requirement: 'Collect at least 6 badges in the medal', icon: '🥈', tone: 'silver' },
        { level: 'Gold', requirement: 'Collect all badges in the medal', icon: '🥇', tone: 'gold' }
    ];
    selectedBadgeForRules: Badge | null = null;

    ngOnInit() {
        this.viewMode = this.router.url.includes('/admin') ? 'admin' : 'organizer';
        this.loadData();
    }

    loadData() {
        this.loading = true;
        this.gamificationService.getBadges().subscribe({
            next: (data) => {
                this.badges = data;
                this.loading = false;
            },
            error: (err) => {
                console.error('Failed to load badges', err);
                this.loading = false;
            }
        });

        this.gamificationService.getMedals().subscribe({
            next: (data) => {
                this.medals = data;
            },
            error: (err) => console.error('Failed to load medals', err)
        });
    }

    get organizerFilteredBadges(): Badge[] {
        if (this.selectedOrganizerFilter === 'all') {
            return this.badges;
        }
        return this.badges.filter((badge) =>
            this.matchesOrganizerFilter(this.selectedOrganizerFilter, badge.medalName || '')
        );
    }

    get totalBadgesCount(): number {
        return this.badges.length;
    }

    get publishedMedalsCount(): number {
        const distinct = new Set(
            this.badges
                .map((b) => (b.medalName || '').trim())
                .filter((name) => name.length > 0)
        );
        return distinct.size;
    }

    setOrganizerFilter(filter: OrganizerMedalFilterKey): void {
        this.selectedOrganizerFilter = filter;
    }

    getOrganizerFilterCount(filter: OrganizerMedalFilterKey): number {
        if (filter === 'all') return this.badges.length;
        return this.badges.filter((b) => this.matchesOrganizerFilter(filter, b.medalName || '')).length;
    }

    openBadgeRules(badge: Badge): void {
        this.selectedBadgeForRules = badge;
    }

    closeBadgeRules(): void {
        this.selectedBadgeForRules = null;
    }

    trackByBadgeId(_: number, badge: Badge): number {
        return badge.id;
    }

    trackByMedalId(_: number, medal: Medal): number {
        return medal.id;
    }

    getBadgeImageSrc(badge: Badge): string {
        return this.resolveImagePath(badge.icon, this.badgeImageBasePath);
    }

    getMedalImageSrc(medal: Medal): string {
        return this.resolveImagePath(medal.icon, this.medalImageBasePath);
    }

    get selectedAdminBadgeCount(): number {
        return this.badges.filter((b) => b.medalId != null).length;
    }

    openCreateBadge(): void {
        this.editorType = 'badge';
        this.isEditing = false;
        this.modalError = '';
        this.currentBadge = { name: '', icon: '', medalId: null };
        this.showEditorModal = true;
    }

    openCreateMedal(): void {
        this.editorType = 'medal';
        this.isEditing = false;
        this.modalError = '';
        this.currentMedal = { name: '', icon: '', type: '' };
        this.showEditorModal = true;
    }

    openEditBadge(badge: Badge): void {
        this.editorType = 'badge';
        this.isEditing = true;
        this.modalError = '';
        this.currentBadge = {
            id: badge.id,
            name: badge.name || '',
            icon: this.stripAssetsPrefix(badge.icon || '', this.badgeImageBasePath),
            medalId: badge.medalId ?? null
        };
        this.showEditorModal = true;
    }

    openEditMedal(medal: Medal): void {
        this.editorType = 'medal';
        this.isEditing = true;
        this.modalError = '';
        this.currentMedal = {
            id: medal.id,
            name: medal.name || '',
            icon: this.stripAssetsPrefix(medal.icon || '', this.medalImageBasePath),
            type: medal.type || ''
        };
        this.showEditorModal = true;
    }

    closeModal(): void {
        this.showEditorModal = false;
        this.modalError = '';
    }

    saveCurrent(): void {
        this.modalError = '';
        this.saving = true;

        if (this.editorType === 'badge') {
            if (!this.currentBadge.name?.trim()) {
                this.modalError = 'Badge name is required.';
                this.saving = false;
                return;
            }
            const payload = {
                name: this.currentBadge.name.trim(),
                icon: this.ensureAssetsPrefix(this.currentBadge.icon?.trim(), this.badgeImageBasePath),
                medalId: this.currentBadge.medalId
            };

            const request$ = this.isEditing && this.currentBadge.id
                ? this.gamificationService.updateBadge(this.currentBadge.id, payload)
                : this.gamificationService.createBadge(payload);

            request$.subscribe({
                next: () => this.handleCrudSuccess(),
                error: (err) => this.handleCrudError(err, 'Failed to save badge.')
            });
            return;
        }

        if (!this.currentMedal.name?.trim()) {
            this.modalError = 'Medal name is required.';
            this.saving = false;
            return;
        }

        const payload = {
            name: this.currentMedal.name.trim(),
            icon: this.ensureAssetsPrefix(this.currentMedal.icon?.trim(), this.medalImageBasePath),
            type: this.currentMedal.type?.trim() || 'DEFAULT'
        };
        const request$ = this.isEditing && this.currentMedal.id
            ? this.gamificationService.updateMedal(this.currentMedal.id, payload)
            : this.gamificationService.createMedal(payload);

        request$.subscribe({
            next: () => this.handleCrudSuccess(),
            error: (err) => this.handleCrudError(err, 'Failed to save medal.')
        });
    }

    deleteBadge(badge: Badge): void {
        if (!confirm(`Delete badge "${badge.name}"?`)) return;
        this.deleting = true;
        this.gamificationService.deleteBadge(badge.id).subscribe({
            next: () => {
                this.deleting = false;
                this.loadData();
            },
            error: (err) => {
                this.deleting = false;
                alert(err?.error?.message || 'Failed to delete badge.');
            }
        });
    }

    deleteMedal(medal: Medal): void {
        if (!confirm(`Delete medal "${medal.name}"?`)) return;
        this.deleting = true;
        this.gamificationService.deleteMedal(medal.id).subscribe({
            next: () => {
                this.deleting = false;
                this.loadData();
            },
            error: (err) => {
                this.deleting = false;
                alert(err?.error?.message || 'Failed to delete medal.');
            }
        });
    }

    onImageError(event: Event, kind: 'badge' | 'medal'): void {
        const target = event.target as HTMLImageElement;
        if (!target) return;
        target.src = kind === 'badge'
            ? `${this.badgeImageBasePath}placeholder.png`
            : `${this.medalImageBasePath}placeholder.png`;
    }

    private matchesOrganizerFilter(filter: OrganizerMedalFilterKey, medalName: string): boolean {
        const name = medalName.toLowerCase();
        if (filter === 'community') return name.includes('community leadership');
        if (filter === 'science') return name.includes('science and arts');
        if (filter === 'scout') return name.includes('scout leadership');
        return true;
    }

    private ensureAssetsPrefix(icon: string | undefined, basePath: string): string {
        const clean = (icon || '').trim();
        if (!clean) return '';
        if (clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('/') || clean.startsWith('assets/')) {
            return clean;
        }
        return `${basePath}${clean}`;
    }

    private stripAssetsPrefix(icon: string, basePath: string): string {
        if (!icon) return '';
        if (icon.startsWith(basePath)) {
            return icon.substring(basePath.length);
        }
        return icon;
    }

    private handleCrudSuccess(): void {
        this.saving = false;
        this.showEditorModal = false;
        this.loadData();
    }

    private handleCrudError(err: any, fallbackMessage: string): void {
        this.saving = false;
        this.modalError = err?.error?.message || fallbackMessage;
    }

    private resolveImagePath(icon: string | undefined, basePath: string): string {
        const clean = (icon || '').trim();
        if (!clean) {
            return `${basePath}placeholder.png`;
        }
        if (
            clean.startsWith('http://') ||
            clean.startsWith('https://') ||
            clean.startsWith('/') ||
            clean.startsWith('assets/')
        ) {
            return clean;
        }
        return `${basePath}${clean}`;
    }
}
