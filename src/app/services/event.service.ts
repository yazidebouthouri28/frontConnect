import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
        return this.http.get<Event[]>(this.apiUrl);
    }

    getEventById(id: number): Observable<Event> {
        return this.http.get<Event>(`${this.apiUrl}/${id}`);
    }

    addRequestedService(eventId: number, service: EventServiceEntity): Observable<EventServiceEntity> {
        return this.http.post<EventServiceEntity>(`${this.apiUrl}/${eventId}/requested-services`, service);
    }

    updateRequestedServiceSpots(eventId: number, requestedServiceId: number, change: number): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/${eventId}/requested-services/${requestedServiceId}/spots`, { change });
    }
}
