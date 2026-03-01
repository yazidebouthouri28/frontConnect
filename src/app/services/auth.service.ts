import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AuthResponse {
    token: string;
    userId: number;
    email: string;
    role: string;
    name: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private baseUrl = environment.apiUrl;
    private authUrl = `${environment.apiUrl.replace('/api', '')}/auth`;

    login(credentials: { email: string, password: string }): Observable<any> {
        return this.http.post<any>(`${this.authUrl}/login`, {
            username: credentials.email,
            password: credentials.password
        }).pipe(
            tap(response => {
                if (response.success && response.data && response.data.token) {
                    localStorage.setItem('token', response.data.token);
                    localStorage.setItem('currentUser', JSON.stringify(response.data));
                }
            })
        );
    }

    register(userData: any): Observable<any> {
        return this.http.post<any>(`${this.authUrl}/register`, {
            name: userData.name,
            username: userData.email, // Use email as username
            email: userData.email,
            password: userData.password,
            role: userData.role
        });
    }

    logout(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    getCurrentUser(): AuthResponse | null {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    }

    isLoggedIn(): boolean {
        return !!this.getToken();
    }

    hasRole(role: string): boolean {
        const user = this.getCurrentUser();
        return user ? user.role === role : false;
    }
}
