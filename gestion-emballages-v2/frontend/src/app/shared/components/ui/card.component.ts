import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

type CardVariant = 'default' | 'elevated' | 'outlined' | 'ghost';

@Component({
  selector: 'ui-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="cardClasses()">
      <!-- Header -->
      <div 
        *ngIf="title || subtitle || hasHeaderActions"
        class="px-4 py-5 border-b border-gray-200 sm:px-6">
        
        <div class="flex items-center justify-between">
          <div>
            <h3 *ngIf="title" class="text-lg leading-6 font-medium text-gray-900">
              {{ title }}
            </h3>
            <p *ngIf="subtitle" class="mt-1 max-w-2xl text-sm text-gray-500">
              {{ subtitle }}
            </p>
          </div>
          
          <!-- Header Actions -->
          <div *ngIf="hasHeaderActions">
            <ng-content select="[cardHeaderActions]"></ng-content>
          </div>
        </div>

        <!-- Custom Header -->
        <ng-content select="[cardHeader]"></ng-content>
      </div>

      <!-- Body -->
      <div [class]="bodyClasses()">
        <ng-content></ng-content>
      </div>

      <!-- Footer -->
      <div 
        *ngIf="hasFooter"
        class="px-4 py-4 bg-gray-50 border-t border-gray-200 sm:px-6">
        <ng-content select="[cardFooter]"></ng-content>
      </div>
    </div>
  `
})
export class CardComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() variant: CardVariant = 'default';
  @Input() padding = true;
  @Input() hoverable = false;

  hasHeaderActions = false;
  hasFooter = false;

  ngAfterContentInit() {
    // Check for projected content
    setTimeout(() => {
      this.hasHeaderActions = !!document.querySelector('[cardHeaderActions]');
      this.hasFooter = !!document.querySelector('[cardFooter]');
    });
  }

  cardClasses = computed(() => {
    const baseClasses = [
      'bg-white',
      'rounded-lg',
      'transition-all',
      'duration-200'
    ];

    const variantClasses = {
      default: ['border', 'border-gray-200', 'shadow-sm'],
      elevated: ['shadow-medium', 'border', 'border-gray-100'],
      outlined: ['border-2', 'border-gray-200'],
      ghost: ['border', 'border-transparent']
    };

    const hoverClasses = this.hoverable 
      ? ['hover:shadow-large', 'hover:border-gray-300', 'cursor-pointer']
      : [];

    return [
      ...baseClasses,
      ...variantClasses[this.variant],
      ...hoverClasses
    ].join(' ');
  });

  bodyClasses = computed(() => {
    const baseClasses = this.padding ? ['px-4', 'py-5', 'sm:p-6'] : [];
    return baseClasses.join(' ');
  });
}