import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'ui-toggle-button',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <button
      type="button"
      [class]="buttonClasses"
      (click)="onToggle()">
      
      <!-- Icon (optional) -->
      <ng-container *ngIf="icon">
        <lucide-icon 
          *ngIf="!useCustomIcon" 
          [name]="icon" 
          [class]="iconClasses">
        </lucide-icon>
        <ng-content *ngIf="useCustomIcon" select="[slot=icon]"></ng-content>
      </ng-container>
      
      <!-- Text -->
      <span>{{ label }}</span>
      
      <!-- Badge (optional) -->
      <span 
        *ngIf="badgeCount > 0" 
        [class]="badgeClasses">
        {{ badgeCount }}
      </span>
      
      <!-- Chevron indicator -->
      <lucide-icon 
        [name]="isToggled ? 'chevron-up' : 'chevron-down'" 
        [class]="chevronClasses">
      </lucide-icon>
    </button>
  `,
  styles: []
})
export class ToggleButtonComponent {
  @Input() label = '';
  @Input() icon?: string;
  @Input() useCustomIcon = false;
  @Input() isToggled = false;
  @Input() badgeCount = 0;
  @Input() variant: 'default' | 'primary' | 'outline' = 'outline';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() disabled = false;

  @Output() toggle = new EventEmitter<boolean>();

  get buttonClasses(): string {
    const baseClasses = 'inline-flex items-center rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    // Size classes
    const sizeClasses = {
      sm: 'px-2 py-1 text-xs gap-1',
      md: 'px-3 py-2 text-sm gap-2',
      lg: 'px-4 py-2 text-base gap-2'
    };
    
    // Variant classes
    const variantClasses = {
      default: 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-gray-500',
      primary: 'border border-primary-600 text-primary-700 bg-primary-50 hover:bg-primary-100 focus:ring-primary-500',
      outline: 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-gray-500'
    };
    
    // Toggle state classes
    const toggleClasses = this.isToggled 
      ? 'border-primary-500 bg-primary-50 text-primary-700' 
      : '';
    
    // Disabled classes
    const disabledClasses = this.disabled 
      ? 'opacity-50 cursor-not-allowed' 
      : '';
    
    return [
      baseClasses,
      sizeClasses[this.size],
      variantClasses[this.variant],
      toggleClasses,
      disabledClasses
    ].filter(Boolean).join(' ');
  }

  get iconClasses(): string {
    const sizeClasses = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5'
    };
    
    return sizeClasses[this.size];
  }

  get chevronClasses(): string {
    const sizeClasses = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4', 
      lg: 'h-5 w-5'
    };
    
    return `${sizeClasses[this.size]} text-gray-400`;
  }

  get badgeClasses(): string {
    return 'inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800';
  }

  onToggle(): void {
    if (!this.disabled) {
      this.toggle.emit(!this.isToggled);
    }
  }
}