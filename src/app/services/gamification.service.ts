import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api.models';

export interface Gamification {
    id?: number;
    name: string;
    description: string;
    icon: string;
    pointsValue: number;
    organizerId?: number;
    organizerName?: string;
}

@Injectable({
    providedIn: 'root'
})
export class GamificationService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/api/gamifications`;

    getAll(organizerId?: number): Observable<Gamification[]> {
        const url = organizerId ? `${this.apiUrl}?organizerId=${organizerId}` : this.apiUrl;
        return this.http.get<ApiResponse<Gamification[]>>(url).pipe(
            map(res => res.data || [])
        );
    }

    getById(id: number): Observable<Gamification> {
        return this.http.get<ApiResponse<Gamification>>(`${this.apiUrl}/${id}`).pipe(
            map(res => {
                if (!res.data) throw new Error('Gamification not found');
                return res.data;
            })
        );
    }

    create(data: Gamification): Observable<Gamification> {
        return this.http.post<ApiResponse<Gamification>>(this.apiUrl, data).pipe(
            map(res => {
                if (!res.data) throw new Error('Create failed');
                return res.data;
            })
        );
    }

    update(id: number, data: Gamification): Observable<Gamification> {
        return this.http.put<ApiResponse<Gamification>>(`${this.apiUrl}/${id}`, data).pipe(
            map(res => {
                if (!res.data) throw new Error('Update failed');
                return res.data;
            })
        );
    }

    delete(id: number): Observable<void> {
        return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`).pipe(
            map(() => undefined)
        );
    }

    assignToEvent(gamificationId: number, eventId: number): Observable<void> {
        return this.http.post<ApiResponse<void>>(`${this.apiUrl}/${gamificationId}/assign/${eventId}`, {}).pipe(
            map(() => undefined)
        );
    }

    unassignFromEvent(gamificationId: number, eventId: number): Observable<void> {
        return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${gamificationId}/unassign/${eventId}`).pipe(
            map(() => undefined)
        );
    }
}
