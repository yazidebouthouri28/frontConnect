import { Component, OnInit } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface BackendUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
  isSuspended?: boolean;
  isActive?: boolean;
  isSeller?: boolean;
  sellerVerified?: boolean;
  avatar?: string;
  username?: string;
}

interface DisplayUser {
  id: string;
  name: string;
  email: string;
  role: string;
  joinedDate: string;
  status: 'Active' | 'Suspended' | 'Pending';
  avatar: string;
  isSeller?: boolean;
  sellerVerified?: boolean;
  raw: BackendUser;
}

@Component({
  selector: 'app-users-management',
  standalone: true,
  imports: [CommonModule, FormsModule, NgClass],
  templateUrl: './users-management.component.html',
  styleUrl: './users-management.component.css'
})
export class UsersManagementComponent implements OnInit {
  searchTerm = '';
  filterRole: string = 'All';
  isLoading = false;
  errorMessage = '';

  // Pagination
  currentPage = 0;
  pageSize = 20;
  totalElements = 0;

  users: DisplayUser[] = [];

  private apiUrl = `${environment.apiUrl}/api/admin/users`;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = '';

    let params = new HttpParams()
      .set('page', this.currentPage.toString())
      .set('size', this.pageSize.toString());

    const url = this.searchTerm
      ? `${this.apiUrl}/search`
      : this.apiUrl;

    if (this.searchTerm) {
      params = params.set('query', this.searchTerm);
    }

    this.http.get<any>(url, { params }).subscribe({
      next: (res) => {
        const raw: BackendUser[] = res?.data?.content || res?.data || res || [];
        this.totalElements = res?.data?.totalElements || raw.length;
        this.users = raw.map(u => this.mapUser(u));
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load users:', err);
        this.errorMessage = 'Failed to load users.';
        this.isLoading = false;
      }
    });
  }

  private mapUser(u: BackendUser): DisplayUser {
    let status: 'Active' | 'Suspended' | 'Pending' = 'Active';
    if (u.isSuspended) {
      status = 'Suspended';
    } else if (!u.isActive) {
      status = 'Pending';
    }

    const nameParts = (u.name || u.username || 'U').split(' ');
    const avatar = nameParts.length >= 2
      ? (nameParts[0][0] + nameParts[1][0]).toUpperCase()
      : (u.name || 'U').substring(0, 2).toUpperCase();

    return {
      id: u.id,
      name: u.name || u.username || u.email,
      email: u.email,
      role: u.role || 'CLIENT',
      joinedDate: u.createdAt ? u.createdAt.split('T')[0] : '—',
      status,
      avatar,
      isSeller: u.isSeller,
      sellerVerified: u.sellerVerified,
      raw: u,
    };
  }

  get filteredUsers(): DisplayUser[] {
    return this.users.filter(u => {
      const matchSearch =
        !this.searchTerm ||
        u.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchRole =
        this.filterRole === 'All' ||
        u.role.toUpperCase() === this.filterRole.toUpperCase();

      return matchSearch && matchRole;
    });
  }

  get activeCount():    number { return this.users.filter(u => u.status === 'Active').length; }
  get pendingCount():   number { return this.users.filter(u => u.status === 'Pending').length; }
  get suspendedCount(): number { return this.users.filter(u => u.status === 'Suspended').length; }

  onSearch(): void {
    this.currentPage = 0;
    this.loadUsers();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.filterRole = 'All';
    this.currentPage = 0;
    this.loadUsers();
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  suspendUser(user: DisplayUser): void {
    this.http.post<any>(`${this.apiUrl}/${user.id}/suspend`, {}, {
      params: { reason: 'Policy violation' }
    }).subscribe({
      next: () => this.loadUsers(),
      error: (err) => { console.error(err); alert('Failed to suspend user.'); }
    });
  }

  activateUser(user: DisplayUser): void {
    this.http.post<any>(`${this.apiUrl}/${user.id}/activate`, {}).subscribe({
      next: () => this.loadUsers(),
      error: (err) => { console.error(err); alert('Failed to activate user.'); }
    });
  }

  verifySellerUser(user: DisplayUser): void {
    this.http.post<any>(`${this.apiUrl}/${user.id}/verify-seller`, {}).subscribe({
      next: () => this.loadUsers(),
      error: (err) => { console.error(err); alert('Failed to verify seller.'); }
    });
  }

  updateRole(user: DisplayUser, role: string): void {
    this.http.put<any>(`${this.apiUrl}/${user.id}/role`, {}, {
      params: { role }
    }).subscribe({
      next: () => this.loadUsers(),
      error: (err) => { console.error(err); alert('Failed to update role.'); }
    });
  }

  // ── Pagination ────────────────────────────────────────────────────────────

  get totalPages(): number {
    return Math.ceil(this.totalElements / this.pageSize);
  }

  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadUsers();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadUsers();
    }
  }

  // ── Style helpers ─────────────────────────────────────────────────────────

  getStatusClass(status: string): string {
    switch (status) {
      case 'Active':    return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Pending':   return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Suspended': return 'bg-red-100 text-red-700 border-red-200';
      default:          return 'bg-gray-100 text-gray-700';
    }
  }

  getRoleClass(role: string): string {
    switch (role?.toUpperCase()) {
      case 'ADMIN':     return 'text-purple-600 bg-purple-50';
      case 'ORGANIZER': return 'text-blue-600 bg-blue-50';
      case 'SELLER':    return 'text-amber-600 bg-amber-50';
      case 'CAMPER':
      case 'CLIENT':    return 'text-emerald-600 bg-emerald-50';
      case 'SPONSOR':   return 'text-orange-600 bg-orange-50';
      default:          return 'text-gray-600 bg-gray-50';
    }
  }
}
