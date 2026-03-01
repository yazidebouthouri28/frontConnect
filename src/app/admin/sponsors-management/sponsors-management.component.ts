import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-sponsors-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sponsors-management.component.html',
  styleUrls: ['./sponsors-management.component.css'],
})
export class SponsorsManagementComponent implements OnInit {

  searchTerm = '';
  sponsors: any[] = [];
  allSponsorsCount = 0;
  isLoading = true;
  errorMessage: string | null = null;

  // Pending requests modal
  showRequestsModal = false;
  pendingRequests: any[] = [];
  isLoadingRequests = false;

  // Edit modal
  showEditModal = false;
  selectedSponsor: any = null;
  editForm: any = {};
  isSaving = false;

  // Delete modal
  showDeleteModal = false;
  isDeleting = false;

  private apiUrl = '/api/sponsors';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadSponsors();
  }

  loadSponsors() {
    this.isLoading = true;
    this.errorMessage = null;
    this.http.get<any>(this.apiUrl).subscribe({
      next: (response) => {
        this.sponsors = response.data || [];
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load sponsors. Please try again.';
        console.error(err);
        this.isLoading = false;
      }
    });

    this.http.get<any>('/api/sponsors/all').subscribe({
      next: (response) => this.allSponsorsCount = (response.data || []).length,
      error: () => {}
    });
  }

  get filteredSponsors() {
    return this.sponsors.filter(s =>
      !this.searchTerm ||
      (s.name || '').toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      (s.email || '').toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  // ── Pending Requests Modal ─────────────────────────────
  openRequestsModal() {
    this.showRequestsModal = true;
    this.isLoadingRequests = true;
    this.http.get<any>(`${this.apiUrl}/requests`).subscribe({
      next: (res) => {
        this.pendingRequests = res.data || [];
        this.isLoadingRequests = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoadingRequests = false;
      }
    });
  }

  closeRequestsModal() {
    this.showRequestsModal = false;
    this.pendingRequests = [];
  }

  approveRequest(userId: number) {
    this.http.put(`${this.apiUrl}/requests/${userId}/approve`, {}).subscribe({
      next: () => {
        this.pendingRequests = this.pendingRequests.filter(r => r.id !== userId);
        this.loadSponsors();
      },
      error: (err) => console.error(err)
    });
  }

  rejectRequest(userId: number) {
    this.http.put(`${this.apiUrl}/requests/${userId}/reject`, {}).subscribe({
      next: () => this.pendingRequests = this.pendingRequests.filter(r => r.id !== userId),
      error: (err) => console.error(err)
    });
  }

  // ── Edit Modal ─────────────────────────────────────────
  openEditModal(sponsor: any) {
    this.selectedSponsor = sponsor;
    this.editForm = { ...sponsor };
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.selectedSponsor = null;
    this.editForm = {};
  }

  saveSponsor() {
    if (!this.selectedSponsor) return;
    this.isSaving = true;
    this.http.put<any>(`${this.apiUrl}/${this.selectedSponsor.id}`, this.editForm).subscribe({
      next: (response) => {
        const updated = response.data;
        const index = this.sponsors.findIndex(s => s.id === this.selectedSponsor.id);
        if (index !== -1) this.sponsors[index] = updated;
        this.isSaving = false;
        this.closeEditModal();
      },
      error: (err) => {
        console.error('Update failed:', err);
        this.isSaving = false;
      }
    });
  }

  // ── Delete Modal ───────────────────────────────────────
  openDeleteModal(sponsor: any) {
    this.selectedSponsor = sponsor;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.selectedSponsor = null;
  }

  confirmDelete() {
    if (!this.selectedSponsor) return;
    this.isDeleting = true;
    this.http.delete<any>(`${this.apiUrl}/${this.selectedSponsor.id}`).subscribe({
      next: () => {
        this.sponsors = this.sponsors.filter(s => s.id !== this.selectedSponsor.id);
        this.allSponsorsCount--;
        this.isDeleting = false;
        this.closeDeleteModal();
      },
      error: (err) => {
        console.error('Delete failed:', err);
        this.isDeleting = false;
      }
    });
  }

  tierOptions = ['GOLD', 'SILVER', 'BRONZE', 'PLATINUM', 'DIAMOND', 'TITLE_SPONSOR'];
}