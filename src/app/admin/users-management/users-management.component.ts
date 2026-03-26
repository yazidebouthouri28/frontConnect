import { Component } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';

type UserStatus = 'Active' | 'Suspended' | 'Inactive';
type UserRoleOption = 'All' | 'Admin' | 'Organizer' | 'Camper' | 'Seller' | 'Sponsor' | 'Client';

interface UserRow {
    id: number;
    name: string;
    email: string;
    role: Exclude<UserRoleOption, 'All'>;
    joinedDate: string;
    status: UserStatus;
    avatarLabel: string;
}

@Component({
    selector: 'app-users-management',
    standalone: true,
    imports: [CommonModule, FormsModule, NgClass],
    templateUrl: './users-management.component.html',
    styleUrl: './users-management.component.css'
})
export class UsersManagementComponent {
    searchTerm = '';
    filterRole: UserRoleOption = 'All';
    roleOptions: UserRoleOption[] = ['All', 'Admin', 'Organizer', 'Camper', 'Seller', 'Sponsor', 'Client'];

    users: UserRow[] = [
        { id: 1, name: 'Ahmed Trabelsi', email: 'ahmed.admin@connectcamp.tn', role: 'Admin', joinedDate: '14 Jan 2026', status: 'Active', avatarLabel: 'AT' },
        { id: 2, name: 'Salma Ben Ali', email: 'salma.events@connectcamp.tn', role: 'Organizer', joinedDate: '21 Jan 2026', status: 'Active', avatarLabel: 'SB' },
        { id: 3, name: 'Youssef Hamdi', email: 'youssef.market@connectcamp.tn', role: 'Seller', joinedDate: '05 Feb 2026', status: 'Active', avatarLabel: 'YH' },
        { id: 4, name: 'Leila Gharbi', email: 'leila.sponsor@connectcamp.tn', role: 'Sponsor', joinedDate: '11 Feb 2026', status: 'Active', avatarLabel: 'LG' },
        { id: 5, name: 'Rami Khelifi', email: 'rami.trails@connectcamp.tn', role: 'Camper', joinedDate: '17 Feb 2026', status: 'Inactive', avatarLabel: 'RK' },
        { id: 6, name: 'Nour Ben Salem', email: 'nour.community@connectcamp.tn', role: 'Client', joinedDate: '19 Feb 2026', status: 'Active', avatarLabel: 'NB' },
        { id: 7, name: 'Moez Jaziri', email: 'moez.support@connectcamp.tn', role: 'Client', joinedDate: '24 Feb 2026', status: 'Suspended', avatarLabel: 'MJ' },
        { id: 8, name: 'Ines Saidi', email: 'ines.partners@connectcamp.tn', role: 'Organizer', joinedDate: '02 Mar 2026', status: 'Active', avatarLabel: 'IS' }
    ];

    get filteredUsers(): UserRow[] {
        const term = this.searchTerm.trim().toLowerCase();

        return this.users.filter((user) => {
            const matchesSearch = !term
                || user.name.toLowerCase().includes(term)
                || user.email.toLowerCase().includes(term);
            const matchesRole = this.filterRole === 'All' || user.role === this.filterRole;

            return matchesSearch && matchesRole;
        });
    }

    get totalUsersCount(): number {
        return this.users.length;
    }

    get activeUsersCount(): number {
        return this.users.filter((user) => user.status === 'Active').length;
    }

    get suspendedUsersCount(): number {
        return this.users.filter((user) => user.status === 'Suspended').length;
    }

    get adminUsersCount(): number {
        return this.users.filter((user) => user.role === 'Admin').length;
    }

    getStatusClass(status: UserStatus): string {
        switch (status) {
            case 'Active':
                return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Suspended':
                return 'bg-red-100 text-red-700 border-red-200';
            case 'Inactive':
                return 'bg-gray-100 text-gray-700 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    }

    getRoleClass(role: UserRow['role']): string {
        switch (role) {
            case 'Admin':
                return 'text-purple-600 bg-purple-50';
            case 'Organizer':
                return 'text-blue-600 bg-blue-50';
            case 'Seller':
                return 'text-amber-600 bg-amber-50';
            case 'Camper':
                return 'text-emerald-600 bg-emerald-50';
            case 'Sponsor':
                return 'text-rose-600 bg-rose-50';
            case 'Client':
                return 'text-slate-600 bg-slate-50';
            default:
                return 'text-gray-600 bg-gray-50';
        }
    }
}
