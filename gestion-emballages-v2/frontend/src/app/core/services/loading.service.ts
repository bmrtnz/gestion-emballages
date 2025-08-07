import { Injectable, signal, computed } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private initialPageLoad = signal(true);
  private loadingCount = signal(0);

  public isLoading = computed(() => this.loadingCount() > 0);
  public isInitialLoad = computed(() => this.initialPageLoad());

  /**
   * Mark the initial page load as complete
   * This should be called when the first meaningful content is rendered
   */
  markInitialLoadComplete(): void {
    this.initialPageLoad.set(false);
  }

  /**
   * Show loading state
   * @param skipInitialCheck - If true, shows loading even during initial page load
   */
  show(skipInitialCheck = false): void {
    if (this.initialPageLoad() && !skipInitialCheck) {
      // Don't show loading spinner during initial page load
      // This prevents flicker when switching from skeleton to spinner
      return;
    }
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
    this.initialPageLoad.set(true);
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