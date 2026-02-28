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

  filterStatus: 'all' | 'pending' | 'approved' = 'all'; // kept for UI, but no real filtering possible yet
  searchTerm = '';

  sponsors: any[] = [];  // ← using any[] to avoid strict typing issues for now

  isLoading = true;
  errorMessage: string | null = null;

  // Stats – most will be 0 or based on limited data
  approvedCount = 0;
  pendingCount = 0;
  totalBudget = 0;

  private apiUrl = 'http://localhost:8089/api/sponsors'; // ← CHANGE THIS to your real endpoint

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
      this.updateStats();
      this.isLoading = false;
    },
    error: (err) => {
      this.errorMessage = 'Failed to load sponsors. Please try again.';
      console.error(err);
      this.isLoading = false;
    }
  });
}

  private updateStats() {
    // These are placeholders — real stats would need different endpoint or logic
    this.approvedCount = this.sponsors.length; // example fallback
    this.pendingCount = 0;
    this.totalBudget = 0;
  }

  statusClass(status: string): string {
    // fallback - we don't have status field
    return 'bg-gray-100 text-gray-700 border-gray-300';
  }

  // Keep your filteredSponsors getter but adjust fields
  get filteredSponsors() {
    return this.sponsors.filter(s => {
      const matchSearch = !this.searchTerm ||
        (s.name || '').toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchSearch;
      // status filter removed because no status field exists
    });
  }
}