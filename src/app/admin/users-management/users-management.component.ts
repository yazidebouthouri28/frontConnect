import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, NgClass, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BackendUserService, UserDTO } from '../../services/backend-user.service';

@Component({
    selector: 'app-users-management',
    standalone: true,
    imports: [CommonModule, FormsModule, NgClass, DatePipe],
    templateUrl: './users-management.component.html',
    styleUrl: './users-management.component.css'
})
export class UsersManagementComponent implements OnInit {
    private backendUserService = inject(BackendUserService);

    searchTerm = '';
    filterRole: 'All' | 'ADMIN' | 'ORGANIZER' | 'USER' | 'Seller' = 'All';
    users: UserDTO[] = [];
    loading = true;
    error = '';

    ngOnInit(): void {
        this.loadUsers();
    }

    loadUsers(): void {
        this.loading = true;
        this.backendUserService.getAllUsers().subscribe({
            next: (response) => {
                // The API might wrap it in success/data or just return the array depending on the exact implementation in UserController.
                // Based on standard wrapper ApiResponse.success(users):
                if (response && response.data) {
                    this.users = response.data;
                } else {
                    this.users = response as any;
                }
                this.loading = false;
            },
            error: (err) => {
                console.error('Error fetching users', err);
                this.error = 'Failed to load users from server.';
                this.loading = false;
            }
        });
    }

    get filteredUsers(): UserDTO[] {
        if (!this.users) return [];
        return this.users.filter(u => {
            const searchStr = this.searchTerm.toLowerCase();
            const matchSearch = (u.name && u.name.toLowerCase().includes(searchStr)) ||
                (u.email && u.email.toLowerCase().includes(searchStr)) ||
                (u.username && u.username.toLowerCase().includes(searchStr));

            if (this.filterRole === 'All') return matchSearch;

            // Special handling for Sellers since they are essentially USERs with isSeller = true in this system's DTO
            if (this.filterRole === 'Seller') {
                return matchSearch && (u as any).isSeller === true;
            }

            let targetRole = this.filterRole.toUpperCase();
            // Map the UI "Camper" option to the backend "USER" role
            if (targetRole === 'CAMPER') targetRole = 'USER';

            return matchSearch && (u.role?.toUpperCase() === targetRole);
        });
    }

    getStatusClass(isActive: boolean): string {
        if (isActive) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        return 'bg-red-100 text-red-700 border-red-200';
    }

    getRoleClass(role: string): string {
        switch (role?.toUpperCase()) {
            case 'ADMIN': return 'text-purple-600 bg-purple-50';
            case 'ORGANIZER': return 'text-blue-600 bg-blue-50';
            case 'USER': return 'text-emerald-600 bg-emerald-50'; // Camper
            default: return 'text-gray-600 bg-gray-50';
        }
    }

    toggleUserStatus(user: UserDTO): void {
        if (!user.id) return;

        if (user.isActive) {
            const reason = prompt('Please provide a reason for suspension:');
            if (reason) {
                this.backendUserService.suspendUser(user.id, reason).subscribe({
                    next: () => this.loadUsers(),
                    error: (err) => alert('Failed to suspend user: ' + (err.error?.message || err.message))
                });
            }
        } else {
            if (confirm(`Are you sure you want to unsuspend ${user.name}?`)) {
                this.backendUserService.unsuspendUser(user.id).subscribe({
                    next: () => this.loadUsers(),
                    error: (err) => alert('Failed to unsuspend user: ' + (err.error?.message || err.message))
                });
            }
        }
    }

    changeRole(user: UserDTO, newRole: string): void {
        if (confirm(`Change ${user.name}'s role to ${newRole}?`)) {
            this.backendUserService.updateUserRole(user.id, newRole).subscribe({
                next: () => this.loadUsers(),
                error: (err) => alert('Failed to update role: ' + (err.error?.message || err.message))
            });
        }
    }
}
