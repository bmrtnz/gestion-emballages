import { Injectable, signal, computed } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingCount = signal(0);
  private initialPageLoad = signal(true);

  public isLoading = computed(() => this.loadingCount() > 0);
  public isInitialLoad = computed(() => this.initialPageLoad());

  /**
   * Show loading state
   */
  show(): void {
    const newCount = this.loadingCount() + 1;
    this.loadingCount.set(newCount);
  }

  /**
   * Hide loading state
   */
  hide(): void {
    const newCount = Math.max(0, this.loadingCount() - 1);
    this.loadingCount.set(newCount);
  }

  /**
   * Reset all loading states
   */
  reset(): void {
    this.loadingCount.set(0);
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

  /**
   * Mark initial page load as complete
   */
  markInitialLoadComplete(): void {
    this.initialPageLoad.set(false);
  }

  /**
   * Reset initial page load state (for navigation)
   */
  resetInitialLoad(): void {
    this.initialPageLoad.set(true);
  }
}