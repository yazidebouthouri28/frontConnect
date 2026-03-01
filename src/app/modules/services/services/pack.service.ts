import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Pack } from '../models/pack.model';

@Injectable({
    providedIn: 'root'
})
export class PackService {
    private apiUrl = `${environment.apiUrl}/packs`;

    constructor(private http: HttpClient) { }

    private mapPack(p: any): Pack {
        return {
            ...p,
            available: p.isActive !== undefined ? p.isActive : p.available,
            isActive: p.isActive,
            discount: p.discountPercentage || 0,
            serviceIds: p.serviceIds || []
        };
    }

    getAll(): Observable<Pack[]> {
        return this.http.get<any>(this.apiUrl).pipe(
            map(response => (response.data?.content || []).map((p: any) => this.mapPack(p)))
        );
    }

    getAllAdmin(): Observable<Pack[]> {
        return this.http.get<any>(`${this.apiUrl}/admin/all`).pipe(
            map(response => (response.data?.content || []).map((p: any) => this.mapPack(p)))
        );
    }

    getById(id: number): Observable<Pack> {
        return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
            map(response => this.mapPack(response.data))
        );
    }

    create(pack: Pack): Observable<Pack> {
        return this.http.post<any>(this.apiUrl, pack).pipe(
            map(response => response.data)
        );
    }

    update(id: number, pack: Pack): Observable<Pack> {
        // Map available back to isActive for the backend
        const backendPack = {
            ...pack,
            isActive: pack.isActive !== undefined ? pack.isActive : pack.available
        };
        return this.http.put<any>(`${this.apiUrl}/${id}`, backendPack).pipe(
            map(response => response.data)
        );
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    getActive(): Observable<Pack[]> {
        return this.http.get<any>(`${this.apiUrl}/disponibles`).pipe(
            map(response => response.data?.content || [])
        );
    }
}
