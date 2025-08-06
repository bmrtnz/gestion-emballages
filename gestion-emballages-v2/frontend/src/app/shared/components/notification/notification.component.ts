import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { Subject, takeUntil } from 'rxjs';

import { NotificationService, Notification } from '@core/services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-50 space-y-2">
      <div
        *ngFor="let notification of notifications; trackBy: trackByFn"
        [@slideIn]
        class="max-w-sm w-full bg-white shadow-lg rounded-lg border border-l-4 p-4 cursor-pointer"
        [ngClass]="getNotificationClass(notification.type)"
        (click)="dismiss(notification.id)">
        
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <ng-container [ngSwitch]="notification.type">
              <!-- Success Icon -->
              <svg *ngSwitchCase="'success'" class="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              
              <!-- Error Icon -->
              <svg *ngSwitchCase="'error'" class="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
              
              <!-- Warning Icon -->
              <svg *ngSwitchCase="'warning'" class="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              
              <!-- Info Icon -->
              <svg *ngSwitchCase="'info'" class="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
              </svg>
            </ng-container>
          </div>
          
          <div class="ml-3 flex-1">
            <h4 *ngIf="notification.title" class="text-sm font-medium text-gray-900 mb-1">
              {{ notification.title }}
            </h4>
            <p class="text-sm text-gray-700">
              {{ notification.message }}
            </p>
          </div>
          
          <div class="ml-3 flex-shrink-0">
            <button
              type="button"
              class="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition ease-in-out duration-150"
              (click)="dismiss(notification.id); $event.stopPropagation()">
              <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'translateX(100%)', opacity: 0 }))
      ])
    ])
  ]
})
export class NotificationComponent implements OnInit, OnDestroy {
  private notificationService = inject(NotificationService);
  private destroy$ = new Subject<void>();

  notifications: Notification[] = [];

  ngOnInit() {
    this.notificationService.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe(notifications => {
        this.notifications = notifications;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  dismiss(id: string) {
    this.notificationService.dismiss(id);
  }

  getNotificationClass(type: string): string {
    const classes = {
      success: 'border-l-green-500',
      error: 'border-l-red-500',
      warning: 'border-l-yellow-500',
      info: 'border-l-blue-500'
    };
    return classes[type as keyof typeof classes] || classes.info;
  }

  trackByFn(index: number, item: Notification): string {
    return item.id;
  }
}