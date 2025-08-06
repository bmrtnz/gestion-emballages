import { Component, Input, Output, EventEmitter, signal, HostListener, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Backdrop -->
    <div 
      *ngIf="isOpen"
      class="fixed inset-0 z-50 overflow-y-auto"
      [class.animate-fade-in]="isOpen">
      
      <!-- Overlay -->
      <div 
        class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        (click)="onBackdropClick($event)">
      </div>

      <!-- Modal Container -->
      <div class="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <!-- Modal Panel -->
        <div 
          #modalPanel
          class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all w-full focus:outline-none"
          [class]="modalSizeClasses()"
          (click)="onModalClick($event)"
          tabindex="-1"
          role="dialog"
          [attr.aria-labelledby]="title ? 'modal-title' : null"
          [attr.aria-describedby]="description ? 'modal-description' : null">
          
          <!-- Header -->
          <div 
            *ngIf="title || showCloseButton"
            class="flex items-center justify-between px-4 py-3 border-b border-gray-200 sm:px-6">
            
            <!-- Title -->
            <div *ngIf="title">
              <h3 id="modal-title" class="text-lg font-medium leading-6 text-gray-900">
                {{ title }}
              </h3>
              <p *ngIf="description" id="modal-description" class="mt-1 text-sm text-gray-500">
                {{ description }}
              </p>
            </div>

            <!-- Custom Header Content -->
            <ng-content select="[modalHeader]"></ng-content>

            <!-- Close Button -->
            <button
              *ngIf="showCloseButton"
              type="button"
              class="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              (click)="closeModal()">
              <span class="sr-only">Fermer</span>
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="px-4 py-5 sm:p-6">
            <ng-content></ng-content>
          </div>

          <!-- Footer -->
          <div 
            *ngIf="hasFooter"
            class="px-4 py-3 bg-gray-50 border-t border-gray-200 sm:px-6 sm:flex sm:flex-row-reverse">
            <ng-content select="[modalFooter]"></ng-content>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ModalComponent implements AfterViewInit {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() description = '';
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'md';
  @Input() showCloseButton = true;
  @Input() closeOnOverlayClick = true;

  @Output() modalClose = new EventEmitter<void>();

  @ViewChild('modalPanel') modalPanel!: ElementRef;

  hasFooter = false;

  ngAfterViewInit() {
    // Focus management for accessibility
    if (this.isOpen && this.modalPanel) {
      setTimeout(() => {
        this.modalPanel.nativeElement.focus();
      }, 100);
    }
  }

  ngAfterContentInit() {
    // Check if footer content is projected
    setTimeout(() => {
      this.hasFooter = !!document.querySelector('[modalFooter]');
    });
  }

  @HostListener('document:keydown.escape')
  onEscapeKey() {
    if (this.isOpen) {
      this.closeModal();
    }
  }

  modalSizeClasses() {
    const sizeClasses = {
      sm: 'sm:max-w-sm',
      md: 'sm:max-w-md',
      lg: 'sm:max-w-lg',
      xl: 'sm:max-w-xl',
      full: 'sm:max-w-full sm:m-4'
    };

    return sizeClasses[this.size];
  }

  closeModal() {
    if (this.closeOnOverlayClick) {
      this.modalClose.emit();
    }
  }

  onBackdropClick(event: Event) {
    if (this.closeOnOverlayClick) {
      this.closeModal();
    }
  }

  onModalClick(event: Event) {
    // Prevent backdrop click when clicking inside modal
    event.stopPropagation();
  }
}