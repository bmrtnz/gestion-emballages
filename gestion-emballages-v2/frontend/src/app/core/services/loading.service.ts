import { Injectable, signal, computed, untracked } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingCount = signal(0);

  public isLoading = computed(() => this.loadingCount() > 0);

  /**
   * Show loading state
   */
  show(): void {
    untracked(() => {
      const newCount = this.loadingCount() + 1;
      this.loadingCount.set(newCount);
    });
  }

  /**
   * Hide loading state
   */
  hide(): void {
    untracked(() => {
      const newCount = Math.max(0, this.loadingCount() - 1);
      this.loadingCount.set(newCount);
    });
  }

  /**
   * Reset all loading states
   */
  reset(): void {
    untracked(() => {
      this.loadingCount.set(0);
    });
  }

  /**
   * Set loading state to a specific value
   */
  setLoading(loading: boolean): void {
    if (loading) {
      this.show();
    } else {
      this.hide();
    }
  }
}