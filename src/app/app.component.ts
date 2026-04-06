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
    this.updateLayoutVisibility(this.router.url);

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateLayoutVisibility(event.urlAfterRedirects);
      });
  }

  private updateLayoutVisibility(url: string) {
    const normalizedUrl = url.split(/[?#]/)[0];
    const noLayoutRoutes = ['/auth', '/login', '/register', '/admin'];
    this.showLayout = !noLayoutRoutes.some(route =>
      normalizedUrl === route || normalizedUrl.startsWith(`${route}/`)
    );
  }
}
