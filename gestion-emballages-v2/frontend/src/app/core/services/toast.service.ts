import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts$ = new BehaviorSubject<Toast[]>([]);
  private toastIdCounter = 0;

  get toasts() {
    return this.toasts$.asObservable();
  }

  success(title: string, message?: string, duration = 4000) {
    this.addToast({
      type: 'success',
      title,
      message,
      duration
    });
  }

  error(title: string, message?: string, duration = 6000) {
    this.addToast({
      type: 'error',
      title,
      message,
      duration
    });
  }

  warning(title: string, message?: string, duration = 5000) {
    this.addToast({
      type: 'warning',
      title,
      message,
      duration
    });
  }

  info(title: string, message?: string, duration = 4000) {
    this.addToast({
      type: 'info',
      title,
      message,
      duration
    });
  }

  private addToast(toast: Omit<Toast, 'id'>) {
    const id = `toast-${++this.toastIdCounter}`;
    const newToast: Toast = { ...toast, id };
    
    const currentToasts = this.toasts$.getValue();
    this.toasts$.next([...currentToasts, newToast]);

    // Auto-remove toast after duration (unless persistent)
    if (!toast.persistent && toast.duration && toast.duration > 0) {
      setTimeout(() => {
        this.removeToast(id);
      }, toast.duration);
    }
  }

  removeToast(id: string) {
    const currentToasts = this.toasts$.getValue();
    const filteredToasts = currentToasts.filter(toast => toast.id !== id);
    this.toasts$.next(filteredToasts);
  }

  removeAllToasts() {
    this.toasts$.next([]);
  }
}