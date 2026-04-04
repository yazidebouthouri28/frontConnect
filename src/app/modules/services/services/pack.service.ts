import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Pack } from '../models/pack.model';

@Injectable({
    providedIn: 'root'
})
export class PackService {
    private apiUrl = `${environment.apiUrl}/api/packs`;

    constructor(private http: HttpClient) { }

    private mapPack(p: any): Pack {
        // Handle images array vs single string from various possible sources
        let imageToUse = p.image || p.imageUrl || p.image_url;

        // If imageToUse is an array, take the first one
        if (Array.isArray(imageToUse) && imageToUse.length > 0) {
            imageToUse = imageToUse[0];
        }
        // fallback to p.images if p.image was missing
        else if (p.images && Array.isArray(p.images) && p.images.length > 0) {
            imageToUse = p.images[0];
        }

        const imagesArray = Array.isArray(p.images) ? p.images :
            (Array.isArray(p.image) ? p.image :
                (typeof imageToUse === 'string' ? [imageToUse] : []));

        return {
            ...p,
            available: p.isActive !== undefined ? p.isActive : p.available,
            isActive: p.isActive,
            image: typeof imageToUse === 'string' ? imageToUse : (imagesArray[0] || undefined),
            imageUrl: (typeof imageToUse === 'string' && (imageToUse.startsWith('http') || imageToUse.startsWith('data:') || imageToUse.startsWith('blob:'))) ? imageToUse : undefined,
            discount: p.discountPercentage || 0,
            serviceIds: p.serviceIds || [],
            images: imagesArray,
            discountPercentage: p.discountPercentage || p.discount || 0
        };
    }

    getAll(): Observable<Pack[]> {
        const ts = Date.now();
        return this.http.get<any>(`${this.apiUrl}?page=0&size=100&sortBy=createdAt&sortDir=desc&_=${ts}`).pipe(
            map(response => {
                const data = response?.data?.content || response?.data || response || [];
                return (Array.isArray(data) ? data : []).map((p: any) => this.mapPack(p));
            })
        );
    }

    getAllAdmin(): Observable<Pack[]> {
        return this.http.get<any>(`${this.apiUrl}/admin/all`).pipe(
            map(response => {
                const data = response?.data?.content || response?.data || response || [];
                return (Array.isArray(data) ? data : []).map((p: any) => this.mapPack(p));
            })
        );
    }

    getById(id: number): Observable<Pack> {
        return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
            map(response => this.mapPack(response.data))
        );
    }

    create(pack: Pack): Observable<Pack> {
        return this.http.post<any>(this.apiUrl, pack).pipe(
            map(response => this.mapPack(response.data))
        );
    }

    update(id: number, pack: Pack): Observable<Pack> {
        // Map available back to isActive for the backend
        const backendPack = {
            ...pack,
            isActive: pack.isActive !== undefined ? pack.isActive : pack.available
        };
        return this.http.put<any>(`${this.apiUrl}/${id}`, backendPack).pipe(
            map(response => this.mapPack(response.data))
        );
    }

    setStatus(id: number, active: boolean): Observable<Pack> {
        return this.http.patch<any>(`${this.apiUrl}/${id}/status?active=${active}`, {}).pipe(
            map(response => this.mapPack(response.data))
        );
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    getActive(): Observable<Pack[]> {
        return this.http.get<any>(`${this.apiUrl}/disponibles`).pipe(
            map(response => {
                const data = response?.data?.content || response?.data || response || [];
                return (Array.isArray(data) ? data : []).map((p: any) => this.mapPack(p));
            })
        );
    }
}
