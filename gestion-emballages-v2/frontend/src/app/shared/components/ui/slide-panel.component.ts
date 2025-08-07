import { Component, Input, Output, EventEmitter, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

type PanelSize = 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'ui-slide-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Backdrop -->
    <div 
      *ngIf="open"
      class="fixed inset-0 z-50 overflow-hidden"
      (click)="onBackdropClick($event)">
      
      <!-- Background overlay -->
      <div 
        class="fixed inset-0 bg-black transition-opacity duration-300"
        [class.bg-opacity-25]="open"
        [class.bg-opacity-0]="!open">
      </div>
      
      <!-- Panel container -->
      <div class="absolute inset-0 overflow-hidden">
        <div class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-4 sm:pl-6 lg:pl-8">
          
          <!-- Slide panel -->
          <div 
            class="pointer-events-auto transform transition-transform duration-300 ease-in-out"
            [class.translate-x-0]="open"
            [class.translate-x-full]="!open"
            [class]="sizeClasses()">
            
            <div class="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
              <!-- Header -->
              <div class="bg-white px-4 py-6 sm:px-6 border-b border-gray-200">
                <div class="flex items-start justify-between">
                  <h2 
                    *ngIf="title"
                    class="text-lg font-semibold leading-6 text-gray-900">
                    {{ title }}
                  </h2>
                  
                  <div class="ml-3 flex h-7 items-center">
                    <button
                      type="button"
                      class="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
                      (click)="close.emit()">
                      <span class="sr-only">Fermer</span>
                      <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              <!-- Content -->
              <div class="relative flex-1 px-4 py-6 sm:px-6">
                <ng-content></ng-content>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class SlidePanelComponent {
  @Input() open: boolean = false;
  @Input() title: string = '';
  @Input() size: PanelSize = 'md';
  
  @Output() close = new EventEmitter<void>();

  sizeClasses = computed(() => {
    const sizeMap = {
      sm: 'w-full max-w-sm lg:w-96',
      md: 'w-full max-w-md lg:w-[32rem]',
      lg: 'w-full max-w-lg lg:w-[40rem]',
      xl: 'w-full max-w-xl lg:w-[48rem]'
    };
    
    return sizeMap[this.size];
  });

  onBackdropClick(event: MouseEvent): void {
    // Only close if clicking the backdrop, not the panel content
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }
}