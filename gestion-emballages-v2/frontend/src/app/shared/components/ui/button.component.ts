import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'ui-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [class]="buttonClasses()"
      [disabled]="disabled || loading"
      [type]="type">
      
      <!-- Loading Spinner -->
      <svg
        *ngIf="loading"
        class="animate-spin -ml-1 mr-2 h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24">
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4">
        </circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
        </path>
      </svg>

      <!-- Icon (left) -->
      <ng-content select="[slot=icon-left]"></ng-content>

      <!-- Content -->
      <ng-content></ng-content>

      <!-- Icon (right) -->
      <ng-content select="[slot=icon-right]"></ng-content>
    </button>
  `
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() block = false;

  buttonClasses = computed(() => {
    const baseClasses = [
      'inline-flex',
      'items-center',
      'justify-center',
      'font-medium',
      'rounded-md',
      'transition-all',
      'duration-200',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-offset-2',
      'disabled:opacity-50',
      'disabled:cursor-not-allowed',
      'disabled:pointer-events-none'
    ];

    // Size classes
    const sizeClasses = {
      xs: ['px-2.5', 'py-1.5', 'text-xs'],
      sm: ['px-3', 'py-2', 'text-sm'],
      md: ['px-4', 'py-2', 'text-sm'],
      lg: ['px-4', 'py-2', 'text-base'],
      xl: ['px-6', 'py-3', 'text-base']
    };

    // Variant classes
    const variantClasses = {
      primary: [
        'bg-primary-600',
        'text-white',
        'hover:bg-primary-700',
        'focus:ring-primary-500',
        'shadow-sm',
        'hover:shadow-colored-primary'
      ],
      secondary: [
        'bg-gray-600',
        'text-white',
        'hover:bg-gray-700',
        'focus:ring-gray-500',
        'shadow-sm'
      ],
      accent: [
        'bg-accent-600',
        'text-white',
        'hover:bg-accent-700',
        'focus:ring-accent-500',
        'shadow-sm',
        'hover:shadow-colored-accent'
      ],
      outline: [
        'bg-white',
        'text-gray-700',
        'border',
        'border-gray-300',
        'hover:bg-gray-50',
        'hover:text-gray-900',
        'focus:ring-primary-500',
        'shadow-sm'
      ],
      ghost: [
        'bg-transparent',
        'text-gray-700',
        'hover:bg-gray-100',
        'hover:text-gray-900',
        'focus:ring-primary-500'
      ],
      danger: [
        'bg-error-600',
        'text-white',
        'hover:bg-error-700',
        'focus:ring-error-500',
        'shadow-sm'
      ]
    };

    const blockClasses = this.block ? ['w-full'] : [];

    return [
      ...baseClasses,
      ...sizeClasses[this.size],
      ...variantClasses[this.variant],
      ...blockClasses
    ].join(' ');
  });
}