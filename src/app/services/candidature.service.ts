import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CandidatureService, StatutCandidature } from '../models/candidature.model';

@Injectable({
    providedIn: 'root'
})
export class CandidatureServiceFrontend {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/candidatures`;

    apply(eventServiceId: number, userId: number, candidature: any): Observable<any> {
        const params = new HttpParams().set('userId', userId.toString());
        return this.http.post<any>(`${this.apiUrl}/apply/${eventServiceId}`, candidature, { params });
    }

    updateStatus(candidatureId: number, organisateurId: number, status: StatutCandidature, notes?: string): Observable<any> {
        let params = new HttpParams()
            .set('organisateurId', organisateurId.toString())
            .set('status', status);

        if (notes) {
            params = params.set('notes', notes);
        }

        return this.http.patch<any>(`${this.apiUrl}/${candidatureId}/status`, {}, { params });
    }

    withdraw(candidatureId: number, userId: number): Observable<any> {
        const params = new HttpParams().set('userId', userId.toString());
        return this.http.post<any>(`${this.apiUrl}/${candidatureId}/withdraw`, {}, { params });
    }
}
