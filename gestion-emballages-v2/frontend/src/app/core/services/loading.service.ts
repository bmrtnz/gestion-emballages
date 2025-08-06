import { Injectable, signal, computed } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingCountSubject = new BehaviorSubject<number>(0);
  private loadingCount = signal<number>(0);

  public isLoading$ = this.loadingCountSubject.asObservable();
  public isLoading = computed(() => this.loadingCount() > 0);

  show(): void {
    const newCount = this.loadingCount() + 1;
    this.loadingCount.set(newCount);
    this.loadingCountSubject.next(newCount);
  }

  hide(): void {
    const currentCount = this.loadingCount();
    if (currentCount > 0) {
      const newCount = currentCount - 1;
      this.loadingCount.set(newCount);
      this.loadingCountSubject.next(newCount);
    }
  }

  reset(): void {
    this.loadingCount.set(0);
    this.loadingCountSubject.next(0);
  }
}