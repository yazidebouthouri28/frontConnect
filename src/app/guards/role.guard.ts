import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { UserService } from '../services/user.service';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AdminGuard implements CanActivate {
    constructor(private userService: UserService, private router: Router) { }

    canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        const isAdmin = this.userService.isAdmin();
        if (!isAdmin) {
            return this.router.parseUrl('/emergency/list');
        }
        return true;
    }
}

@Injectable({
    providedIn: 'root'
})
export class CamperGuard implements CanActivate {
    constructor(private userService: UserService, private router: Router) { }

    canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        const role = this.userService.getLoggedInUser()?.role as string;
        const isCamper = role === 'CAMPER' || role === 'PARTICIPANT' || role === 'USER';
        if (!isCamper) {
            return this.router.parseUrl('/admin');
        }
        return true;
    }
}

@Injectable({
    providedIn: 'root'
})
export class NoAdminGuard implements CanActivate {
    constructor(private userService: UserService, private router: Router) { }

    canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        const role = this.userService.getLoggedInUser()?.role;
        if (role === 'ADMIN') {
            return this.router.parseUrl('/admin');
        }
        return true;
    }

    canActivateChild(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        return this.canActivate();
    }
}
