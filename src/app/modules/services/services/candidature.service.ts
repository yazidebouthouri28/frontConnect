import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Candidature } from '../models/candidature.model';

@Injectable({
    providedIn: 'root'
})
export class CandidatureService {
    private apiUrl = `${environment.apiUrl}/candidatures`;

    constructor(private http: HttpClient) { }

    getMyCandidatures(): Observable<Candidature[]> {
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const userId = user.userId;
        // Backend doesn't have mes-candidatures directly, but we can filter by candidateId if available
        // Or using the list all and filtering on frontend for now if needed, 
        // but it's better to have a dedicated endpoint. 
        // Assuming for now we use the general list and filter or a specific endpoint exists.
        return this.http.get<any>(this.apiUrl).pipe(
            map(response => response.data.content.filter((c: any) => c.candidatId === userId))
        );
    }

    apply(candidature: any): Observable<Candidature> {
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const userId = user.userId;
        const params = new HttpParams().set('userId', userId);
        const eventServiceId = candidature.serviceId;
        return this.http.post<any>(`${this.apiUrl}/apply/${eventServiceId}`, candidature, { params }).pipe(
            map(response => response.data)
        );
    }

    withdraw(id: number): Observable<void> {
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const userId = user.userId;
        const params = new HttpParams().set('userId', userId);
        return this.http.post<any>(`${this.apiUrl}/${id}/withdraw`, {}, { params }).pipe(
            map(response => response.data)
        );
    }

    getByEvent(eventId: number): Observable<Candidature[]> {
        return this.http.get<Candidature[]>(`${this.apiUrl}/event/${eventId}`);
    }

    updateStatus(id: number, status: string, notes?: string): Observable<Candidature> {
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const organisateurId = user.userId;
        let params = new HttpParams()
            .set('organisateurId', organisateurId)
            .set('status', status);
        if (notes) params = params.set('notes', notes);

        return this.http.patch<any>(`${this.apiUrl}/${id}/status`, {}, { params }).pipe(
            map(response => response.data)
        );
    }
}
