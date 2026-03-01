import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { Promotion } from '../models/promotion.model';

@Injectable({
    providedIn: 'root'
})
export class PromotionService {
    private apiUrl = `${environment.apiUrl}/promotions`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<Promotion[]> {
        return this.http.get<any>(this.apiUrl).pipe(
            map(response => {
                if (response && response.data) {
                    return response.data;
                }
                return response; // Fallback if not wrapped
            })
        );
    }

    create(promotion: Promotion): Observable<Promotion> {
        return this.http.post<any>(this.apiUrl, promotion).pipe(
            map(response => {
                if (response && response.data) {
                    return response.data;
                }
                if (response && response.success && response.data === null) {
                    return {} as Promotion; // Handle empty data success
                }
                return response;
            })
        );
    }

    validateCode(code: string, amount: number): Observable<any> {
        return this.http.get(`${this.apiUrl}/valider?code=${code}&montant=${amount}`);
    }

    getById(id: number): Observable<Promotion> {
        return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
            map(response => {
                if (response && response.data) {
                    return response.data;
                }
                return response;
            })
        );
    }

    update(id: number, promotion: Promotion): Observable<Promotion> {
        return this.http.put<any>(`${this.apiUrl}/${id}`, promotion).pipe(
            map(response => {
                if (response && response.data) {
                    return response.data;
                }
                return response;
            })
        );
    }

    delete(id: number): Observable<void> {
        return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
            map(response => {
                if (!response.success) {
                    throw new Error(response.message || 'Error deleting promotion');
                }
            })
        );
    }
}
