import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let userFriendlyMessage = 'Something went wrong. Please try again.';
      let technicalDetails = '';

      if (error.error instanceof ErrorEvent) {
        technicalDetails = error.error.message;
        userFriendlyMessage = 'A network error occurred. Please check your connection.';
      } else {
        technicalDetails = extractTechnicalDetails(error);
        
        switch (error.status) {
          case 0:
            userFriendlyMessage = 'Unable to connect to the server. Please check your internet connection.';
            break;
          case 400:
            userFriendlyMessage = sanitizeErrorMessage(error) || 'Invalid request. Please check your input.';
            break;
          case 401:
            // Clear auth data and redirect
            if (typeof window !== 'undefined') {
              localStorage.removeItem('auth_token');
              localStorage.removeItem('current_user');
            }
            router.navigate(['/auth/login']);
            userFriendlyMessage = 'Your session has expired. Please login again.';
            break;
          case 403:
            userFriendlyMessage = 'You do not have permission to perform this action.';
            break;
          case 404:
            userFriendlyMessage = 'The requested resource was not found.';
            break;
          case 409:
            userFriendlyMessage = sanitizeErrorMessage(error) || 'A conflict occurred. The resource may already exist.';
            break;
          case 422:
            userFriendlyMessage = sanitizeErrorMessage(error) || 'Please check your input and try again.';
            break;
          case 429:
            userFriendlyMessage = 'Too many requests. Please wait a moment and try again.';
            break;
          case 500:
          case 502:
          case 503:
          case 504:
            userFriendlyMessage = 'The server is experiencing issues. Please try again later.';
            break;
          default:
            userFriendlyMessage = 'An unexpected error occurred. Please try again.';
        }
      }

      console.error('HTTP Error Details:', {
        status: error.status,
        statusText: error.statusText,
        url: error.url,
        technical: technicalDetails,
        timestamp: new Date().toISOString()
      });

      return throwError(() => ({
        message: userFriendlyMessage,
        status: error.status,
        error: null
      }));
    })
  );
};

function extractTechnicalDetails(error: HttpErrorResponse): string {
  try {
    if (error.error) {
      if (typeof error.error === 'string') {
        return error.error;
      }
      if (error.error.message) {
        return error.error.message;
      }
      if (error.error.error) {
        return error.error.error;
      }
      return JSON.stringify(error.error);
    }
    return error.message || 'Unknown error';
  } catch {
    return 'Error parsing error details';
  }
}

function sanitizeErrorMessage(error: HttpErrorResponse): string | null {
  try {
    const errorBody = error.error;
    
    if (!errorBody) return null;
    
    let message = errorBody.message || errorBody.error || '';
    
    if (typeof message !== 'string') {
      return null;
    }

    const technicalPatterns = [
      /mongodb/i, /duplicate key/i, /collection/i, /document/i, /objectid/i,
      /entity/i, /repository/i, /hibernate/i, /jdbc/i, /sql/i, /constraint/i,
      /foreign key/i, /primary key/i, /null pointer/i, /stack trace/i,
      /exception/i, /error at/i, /\.java:/i, /\.class/i, /spring/i, /bean/i,
      /injection/i, /autowired/i, /could not execute/i, /failed to/i,
      /internal server/i, /unexpected token/i, /parse error/i, /syntax error/i,
      /connection refused/i, /timeout/i, /deadlock/i, /transaction/i, /rollback/i
    ];

    for (const pattern of technicalPatterns) {
      if (pattern.test(message)) {
        console.warn('Filtered technical error from user view:', message);
        return null;
      }
    }

    const validationMappings: { [key: string]: string } = {
      'email already exists': 'This email is already registered. Try logging in instead.',
      'username already exists': 'This username is taken. Please choose another.',
      'user not found': 'Account not found. Please check your credentials.',
      'invalid password': 'Incorrect password. Please try again.',
      'invalid credentials': 'Invalid email or password.',
      'email is required': 'Please enter your email address.',
      'password is required': 'Please enter your password.',
      'name is required': 'Please enter your name.',
      'username is required': 'Please enter a username.',
      'invalid email': 'Please enter a valid email address.',
      'password too short': 'Password must be at least 6 characters.',
      'insufficient funds': 'You don\'t have enough balance for this transaction.',
      'insufficient stock': 'This product is out of stock.',
      'product not found': 'This product is no longer available.',
      'order not found': 'Order not found.',
      'already exists': 'This item already exists.'
    };

    const lowerMessage = message.toLowerCase();
    for (const [pattern, friendly] of Object.entries(validationMappings)) {
      if (lowerMessage.includes(pattern)) {
        return friendly;
      }
    }

    if (message.length < 200 && !message.includes('\n')) {
      return message;
    }

    return null;
  } catch {
    return null;
  }
}
