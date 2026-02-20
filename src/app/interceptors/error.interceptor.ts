import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An error occurred';

        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = error.error.message;
        } else {
          // Server-side error
          switch (error.status) {
            case 401:
              // Unauthorized - token expired or invalid
              this.authService.logout();
              this.router.navigate(['/auth/login']);
              errorMessage = 'Session expired. Please login again.';
              break;
            case 403:
              errorMessage = 'Access denied. You do not have permission.';
              break;
            case 404:
              errorMessage = 'Resource not found.';
              break;
            case 422:
              errorMessage = error.error?.message || 'Validation error.';
              break;
            case 500:
              errorMessage = 'Server error. Please try again later.';
              break;
            default:
              errorMessage = error.error?.message || `Error: ${error.status}`;
          }
        }

        console.error('HTTP Error:', errorMessage, error);
        return throwError(() => ({ message: errorMessage, status: error.status, error: error.error }));
      })
    );
  }
}
