import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

import { AuthService } from './core/services/auth.service';
import { NotificationService } from './core/services/notification.service';
import { NotificationComponent } from './shared/components/notification/notification.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NotificationComponent
  ],
  template: `
    <!-- Persistent background layer -->
    <div class="fixed inset-0 bg-gray-50"></div>
    
    <!-- Main app container -->
    <div class="relative min-h-screen">
      <!-- Main Application -->
      <router-outlet></router-outlet>

      <!-- Global Notifications -->
      <app-notification></app-notification>
    </div>
  `,
  styles: []
})
export class AppComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  public notificationService = inject(NotificationService);

  ngOnInit() {
    // Initialize authentication
    this.authService.initializeAuth();

    // Handle route changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        // Scroll to top on route change
        window.scrollTo(0, 0);
      });
  }
}