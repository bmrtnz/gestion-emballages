import { Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  persistent?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private notifications = signal<Notification[]>([]);

  private readonly DEFAULT_DURATION = 5000;

  showSuccess(message: string, title?: string, duration?: number): void {
    this.addNotification({
      type: 'success',
      title,
      message,
      duration: duration ?? this.DEFAULT_DURATION
    });
  }

  showError(message: string, title?: string, persistent = false): void {
    this.addNotification({
      type: 'error',
      title,
      message,
      persistent,
      duration: persistent ? undefined : this.DEFAULT_DURATION
    });
  }

  showWarning(message: string, title?: string, duration?: number): void {
    this.addNotification({
      type: 'warning',
      title,
      message,
      duration: duration ?? this.DEFAULT_DURATION
    });
  }

  showInfo(message: string, title?: string, duration?: number): void {
    this.addNotification({
      type: 'info',
      title,
      message,
      duration: duration ?? this.DEFAULT_DURATION
    });
  }

  dismiss(id: string): void {
    const current = this.notifications();
    const updated = current.filter(n => n.id !== id);
    this.notifications.set(updated);
    this.notificationsSubject.next(updated);
  }

  dismissAll(): void {
    this.notifications.set([]);
    this.notificationsSubject.next([]);
  }

  private addNotification(notification: Omit<Notification, 'id'>): void {
    const id = this.generateId();
    const newNotification: Notification = { ...notification, id };
    
    const current = this.notifications();
    const updated = [...current, newNotification];
    
    this.notifications.set(updated);
    this.notificationsSubject.next(updated);

    // Auto-dismiss if not persistent
    if (!notification.persistent && notification.duration) {
      setTimeout(() => {
        this.dismiss(id);
      }, notification.duration);
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}