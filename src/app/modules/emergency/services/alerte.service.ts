import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Alerte } from '../models/alerte.model';

@Injectable({
    providedIn: 'root'
})
export class AlerteService {
    private apiUrl = `${environment.apiUrl}/api/emergency-alerts`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<Alerte[]> {
        return this.http.get<any>(this.apiUrl + '/active').pipe(
            map(response => response.data)
        );
    }

    getById(id: number): Observable<Alerte> {
        return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
            map(response => response.data)
        );
    }

    create(alerte: Alerte): Observable<Alerte> {
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        // Handle both real backend (userId) and mock service (id/none)
        const reporterId = user.userId || user.id || 1;
        let params = new HttpParams().set('reporterId', reporterId.toString());

        console.log('Reporting SOS alert with data:', alerte, 'Reporter:', reporterId);

        return this.http.post<any>(this.apiUrl, alerte, { params }).pipe(
            map(response => response.data)
        );
    }

    getMyAlerts(): Observable<Alerte[]> {
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const reporterId = user.userId || user.id || 1;
        let params = new HttpParams().set('reporterId', reporterId.toString());

        return this.http.get<any>(`${this.apiUrl}/my-alerts`, { params }).pipe(
            map(response => response.data.content)
        );
    }

    getDashboardAlerts(): Observable<Alerte[]> {
        return this.http.get<any>(this.apiUrl + '/all').pipe(
            map(response => response.data)
        );
    }

    acknowledge(id: number): Observable<Alerte> {
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const userId = user.userId;
        let params = new HttpParams().set('userId', userId);

        return this.http.put<any>(`${this.apiUrl}/${id}/acknowledge`, {}, { params }).pipe(
            map(response => response.data)
        );
    }

    resolve(id: number, notes: string): Observable<Alerte> {
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const userId = user.userId;
        let params = new HttpParams()
            .set('userId', userId)
            .set('resolutionNotes', notes);

        return this.http.put<any>(`${this.apiUrl}/${id}/resolve`, {}, { params }).pipe(
            map(response => response.data)
        );
    }
}
