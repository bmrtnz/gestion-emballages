import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-center" [class]="containerClass">
      <div class="animate-spin rounded-full border-2 border-gray-300" 
           [class]="spinnerClass"
           [style.border-top-color]="color">
      </div>
      <span *ngIf="message" class="ml-3 text-sm font-medium" [style.color]="textColor">
        {{ message }}
      </span>
    </div>
  `,
  styles: []
})
export class LoadingSpinnerComponent {
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() color = '#2563eb';
  @Input() textColor = '#374151';
  @Input() message?: string;
  @Input() containerClass = '';

  get spinnerClass(): string {
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-8 w-8',
      lg: 'h-12 w-12'
    };
    return sizeClasses[this.size];
  }
}