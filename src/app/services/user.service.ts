import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { User } from '../models/api.models';
import { map } from 'rxjs/operators';

export type { User };
export type UserAccount = User;

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private apiUrl = `${environment.apiUrl}/users`;

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) { }

    getCurrentUser(): User | null {
        return this.authService.getCurrentUser();
    }

    getLoggedInUser(): User | null {
        return this.getCurrentUser();
    }

    isAdmin(): boolean {
        return this.authService.isAdmin();
    }

    isCamper(): boolean {
        return this.authService.isCamper();
    }

    isOrganizer(): boolean {
        return this.authService.isOrganizer();
    }

    isStaff(): boolean {
        return this.authService.hasRole('STAFF');
    }

    isParticipant(): boolean {
        return this.authService.hasRole('PARTICIPANT');
    }

    isUser(): boolean {
        return this.authService.hasRole('USER') || this.authService.isClient();
    }

    getUserById(id: string | number): Observable<User> {
        return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
            map(res => res.data || res)
        );
    }

    updateUserProfile(id: string, data: Partial<User>): Observable<User> {
        return this.http.put<User>(`${this.apiUrl}/${id}`, data);
    }

    getActiveUsers(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/active`);
    }

    // Social / Follow methods
    followUser(id: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/${id}/follow`, {});
    }

    unfollowUser(id: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/${id}/unfollow`, {});
    }

    isFollowing(id: string): Observable<boolean> {
        return this.http.get<boolean>(`${this.apiUrl}/is-following/${id}`);
    }

    getFollowerCount(id: string): Observable<number> {
        return this.http.get<number>(`${this.apiUrl}/${id}/followers/count`);
    }

    getFollowingCount(id: string): Observable<number> {
        return this.http.get<number>(`${this.apiUrl}/${id}/following/count`);
    }

    getAllUsers(): Observable<any> {
        return this.http.get<any>(this.apiUrl);
    }
}
