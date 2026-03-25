import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { MainLayoutComponent } from './components/main-layout/main-layout.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MainLayoutComponent],
  template: `
    <ng-container *ngIf="showLayout; else noLayout">
      <app-main-layout>
        <router-outlet></router-outlet>
      </app-main-layout>
    </ng-container>
    <ng-template #noLayout>
      <router-outlet></router-outlet>
    </ng-template>
  `,
})
export class AppComponent implements OnInit {
  showLayout = true;

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        // List of routes that should NOT show the navbar (layout)
        const noLayoutRoutes = ['/auth', '/login', '/register'];
        this.showLayout = !noLayoutRoutes.some(route => event.urlAfterRedirects.includes(route));
      });
  }
}