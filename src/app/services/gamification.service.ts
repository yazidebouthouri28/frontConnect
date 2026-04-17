import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api.models';
import { Badge, Medal } from '../models/gamification.models';

@Injectable({
    providedIn: 'root'
})
export class GamificationService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/api/gamifications`;

    getBadges(): Observable<Badge[]> {
        return this.http.get<ApiResponse<Badge[]>>(`${this.apiUrl}/badges`).pipe(
            map(res => res.data || [])
        );
    }

    getMedals(): Observable<Medal[]> {
        return this.http.get<ApiResponse<Medal[]>>(`${this.apiUrl}/medals`).pipe(
            map(res => res.data || [])
        );
    }

    getBadgeById(id: number): Observable<Badge> {
        return this.http.get<ApiResponse<Badge>>(`${this.apiUrl}/badges/${id}`).pipe(
            map(res => {
                if (!res.data) throw new Error('Badge not found');
                return res.data;
            })
        );
    }

    createBadge(data: any): Observable<Badge> {
        return this.http.post<ApiResponse<Badge>>(`${this.apiUrl}/badges`, data).pipe(
            map(res => {
                if (!res.data) throw new Error('Create failed');
                return res.data;
            })
        );
    }

    createMedal(data: any): Observable<Medal> {
        return this.http.post<ApiResponse<Medal>>(`${this.apiUrl}/medals`, data).pipe(
            map(res => {
                if (!res.data) throw new Error('Create failed');
                return res.data;
            })
        );
    }

    updateBadge(id: number, data: any): Observable<Badge> {
        return this.http.put<ApiResponse<Badge>>(`${this.apiUrl}/badges/${id}`, data).pipe(
            map(res => {
                if (!res.data) throw new Error('Update failed');
                return res.data;
            })
        );
    }

    deleteBadge(id: number): Observable<void> {
        return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/badges/${id}`).pipe(
            map(() => void 0)
        );
    }

    updateMedal(id: number, data: any): Observable<Medal> {
        return this.http.put<ApiResponse<Medal>>(`${this.apiUrl}/medals/${id}`, data).pipe(
            map(res => {
                if (!res.data) throw new Error('Update failed');
                return res.data;
            })
        );
    }

    deleteMedal(id: number): Observable<void> {
        return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/medals/${id}`).pipe(
            map(() => void 0)
        );
    }
}
