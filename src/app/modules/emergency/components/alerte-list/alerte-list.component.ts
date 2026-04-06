import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AlerteService } from '../../services/alerte.service';
import { Alerte } from '../../models/alerte.model';
import { UserService } from '../../../../services/user.service';

@Component({
    selector: 'app-alerte-list',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './alerte-list.component.html',
    styleUrls: ['./alerte-list.component.css']
})
export class AlerteListComponent implements OnInit {
    isAdmin = false;
    isCamper = false;
    myAlerts: Alerte[] = [];
    loading = false;

    constructor(
        private userService: UserService,
        private alerteService: AlerteService
    ) { }

    ngOnInit(): void {
        this.isAdmin = this.userService.isAdmin();
        const role = this.userService.getLoggedInUser()?.role as string;
        this.isCamper = role === 'CAMPER' || role === 'PARTICIPANT' || role === 'USER';

        if (this.isCamper) {
            this.loadMyAlerts();
        }
    }

    loadMyAlerts(): void {
        this.loading = true;
        this.alerteService.getMyAlerts().subscribe({
            next: (alerts) => {
                this.myAlerts = alerts;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading my alerts', err);
                this.loading = false;
            }
        });
    }

    getStatusClass(status: string): string {
        switch (status) {
            case 'ACTIVE': return 'bg-red-50 text-red-600 border-red-100';
            case 'ACKNOWLEDGED': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'RESOLVED': return 'bg-green-50 text-green-700 border-green-100';
            default: return 'bg-gray-50 text-gray-400 border-gray-100';
        }
    }
}
