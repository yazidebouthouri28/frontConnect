import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Site } from '../models/camping.models';

interface SiteApiResponse {
    id: number;
    name: string;
    description?: string;
    type?: string;
    verified?: boolean;
    address?: string;
    city?: string;
    country?: string;
    latitude: number;
    longitude: number;
    capacity?: number;
    pricePerNight?: number;
    image?: string;
    images?: string[];
    amenities?: string[];
    contactPhone?: string;
    contactEmail?: string;
    isActive?: boolean;
    rating?: number;
    reviewCount?: number;
    checkInTime?: string;
    checkOutTime?: string;
    houseRules?: string;
}

interface SiteApiRequest {
    name: string;
    description?: string;
    type?: string;
    address?: string;
    city: string;
    country?: string;
    latitude: number;
    longitude: number;
    capacity?: number;
    pricePerNight?: number;
    images?: string[];
    amenities?: string[];
    contactPhone?: string;
    contactEmail?: string;
    isActive?: boolean;
    checkInTime?: string;
    checkOutTime?: string;
    houseRules?: string;
}

interface SiteSummaryApiResponse {
    id: number;
    name: string;
    description?: string;
    type?: string;
    verified?: boolean;
    address?: string;
    city?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
    capacity?: number;
    pricePerNight?: number;
    image?: string;
    amenities?: string[];
    contactPhone?: string;
    contactEmail?: string;
    isActive?: boolean;
    rating?: number;
    reviewCount?: number;
    checkInTime?: string;
    checkOutTime?: string;
    houseRules?: string;
}

@Injectable({
    providedIn: 'root'
})
export class SiteService {
    private apiUrl = `${environment.apiUrl}/api/sites`;
    private summaryUrl = `${this.apiUrl}/summary`;
    private readonly readTimeoutMs = 8000;
    private readonly writeTimeoutMs = 30000;

    constructor(private http: HttpClient) { }

    getAllSites(): Observable<Site[]> {
        return this.http.get<SiteSummaryApiResponse[]>(this.summaryUrl).pipe(
            timeout(this.readTimeoutMs),
            map((sites) => sites.map((site) => this.fromApi(site))),
            catchError(() =>
                this.http.get<SiteApiResponse[]>(this.apiUrl).pipe(
                    timeout(this.readTimeoutMs),
                    map((sites) => sites.map((site) => this.fromApi(site)))
                )
            )
        );
    }

    getSiteById(id: number): Observable<Site> {
        return this.http.get<SiteApiResponse>(`${this.apiUrl}/${id}`).pipe(
            timeout(this.readTimeoutMs),
            map((site) => this.fromApi(site))
        );
    }

    createSite(site: Site): Observable<Site> {
        return this.http.post<SiteApiResponse>(this.apiUrl, this.toApi(site)).pipe(
            timeout(this.writeTimeoutMs),
            map((created) => this.fromApi(created))
        );
    }

    updateSite(id: number, site: Site): Observable<Site> {
        return this.http.put<SiteApiResponse>(`${this.apiUrl}/${id}`, this.toApi(site)).pipe(
            timeout(this.writeTimeoutMs),
            map((updated) => this.fromApi(updated))
        );
    }

    deleteSite(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
            timeout(this.writeTimeoutMs)
        );
    }

    uploadSiteImages(id: number, files: File[]): Observable<Site> {
        const formData = new FormData();
        for (const file of files) {
            formData.append('files', file, file.name);
        }

        return this.http.post<SiteApiResponse>(`${this.apiUrl}/${id}/images`, formData).pipe(
            timeout(this.writeTimeoutMs),
            map((updated) => this.fromApi(updated))
        );
    }

    removeSiteImage(id: number, url: string): Observable<Site> {
        return this.http.delete<SiteApiResponse>(`${this.apiUrl}/${id}/images`, { params: { url } }).pipe(
            timeout(this.writeTimeoutMs),
            map((updated) => this.fromApi(updated))
        );
    }

    private fromApi(site: SiteApiResponse | SiteSummaryApiResponse): Site {
        const fullSite = site as SiteApiResponse;
        const images = fullSite.images?.length ? fullSite.images : (site.image ? [site.image] : []);
        const primaryImage = images[0] ?? site.image ?? '';
        const pricePerNight = site.pricePerNight ?? 0;
        const rating = site.rating ?? 0;
        const latitude = site.latitude ?? 36.8065;
        const longitude = site.longitude ?? 10.1815;

        return {
            id: site.id,
            name: site.name,
            description: site.description ?? '',
            type: site.type ?? '',
            verified: site.verified === true,
            address: site.address ?? '',
            city: site.city ?? '',
            country: site.country ?? '',
            location: site.city ?? '',
            latitude,
            longitude,
            averageRating: Number(rating),
            reviewCount: site.reviewCount ?? 0,
            image: primaryImage,
            images,
            capacity: site.capacity ?? 0,
            pricePerNight: Number(pricePerNight),
            price: Number(pricePerNight),
            amenities: site.amenities ?? [],
            contactPhone: site.contactPhone ?? '',
            contactEmail: site.contactEmail ?? '',
            isActive: site.isActive ?? true,
            checkInTime: fullSite.checkInTime ?? '',
            checkOutTime: fullSite.checkOutTime ?? '',
            houseRules: fullSite.houseRules ?? '',
            status: site.isActive === false ? 'Maintenance' : 'Available'
        };
    }

    private toApi(site: Site): SiteApiRequest {
        return {
            name: site.name,
            description: site.description,
            type: site.type,
            address: site.address,
            city: site.city || site.location || '',
            country: site.country,
            latitude: site.latitude,
            longitude: site.longitude,
            capacity: site.capacity,
            pricePerNight: site.pricePerNight ?? site.price,
            images: site.images ?? (site.image ? [site.image] : []),
            amenities: site.amenities ?? [],
            contactPhone: site.contactPhone,
            contactEmail: site.contactEmail,
            isActive: site.isActive,
            checkInTime: site.checkInTime,
            checkOutTime: site.checkOutTime,
            houseRules: site.houseRules
        };
    }
}
