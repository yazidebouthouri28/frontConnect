import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Event } from '../models/event.model';
import { EventServiceEntity } from '../models/event-service-entity.model';

@Injectable({
    providedIn: 'root'
})
export class EventService {
    private apiUrl = `${environment.apiUrl}/events`;

    constructor(private http: HttpClient) { }

    getEvents(): Observable<Event[]> {
        return this.http.get<any>(this.apiUrl).pipe(
            map(res => res.data || res)
        );
    }

    getEventById(id: number): Observable<Event> {
        return this.http.get<Event>(`${this.apiUrl}/${id}`);
    }

    addRequestedService(eventId: number, service: any): Observable<any> {
        return this.http.post<any>(`${environment.apiUrl}/event-services`, service);
    }

    updateRequestedServiceSpots(eventId: number, requestedServiceId: number, change: number): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/${eventId}/requested-services/${requestedServiceId}/spots`, { change });
    }
}
