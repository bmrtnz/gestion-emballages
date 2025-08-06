import { Component, Input, Output, EventEmitter, signal, computed, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DropdownItem {
  id: string | number;
  label: string;
  value?: any;
  icon?: string;
  disabled?: boolean;
  divider?: boolean;
}

@Component({
  selector: 'ui-dropdown',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative inline-block text-left">
      <!-- Trigger Button -->
      <button
        type="button"
        [class]="triggerClasses()"
        (click)="toggleDropdown()"
        [disabled]="disabled">
        
        <!-- Content -->
        <span class="flex items-center">
          <!-- Icon -->
          <svg 
            *ngIf="icon && !loading"
            class="w-4 h-4 mr-2"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="icon" />
          </svg>

          <!-- Loading Spinner -->
          <svg
            *ngIf="loading"
            class="animate-spin -ml-1 mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>

          <span>{{ selectedLabel() || placeholder }}</span>
        </span>

        <!-- Chevron -->
        <svg 
          class="ml-2 -mr-1 h-4 w-4 transition-transform duration-200"
          [class.rotate-180]="isOpen()"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <!-- Dropdown Menu -->
      <div
        *ngIf="isOpen()"
        class="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none animate-scale-in"
        [class]="menuClasses()">
        
        <div class="py-1" role="menu">
          <ng-container *ngFor="let item of items; trackBy: trackByFn">
            
            <!-- Divider -->
            <div 
              *ngIf="item.divider"
              class="border-t border-gray-100 my-1">
            </div>

            <!-- Menu Item -->
            <button
              *ngIf="!item.divider"
              type="button"
              [class]="itemClasses(item)"
              [disabled]="item.disabled"
              (click)="selectItem(item)"
              role="menuitem">
              
              <!-- Item Icon -->
              <svg 
                *ngIf="item.icon"
                class="w-4 h-4 mr-3"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="item.icon" />
              </svg>

              <span>{{ item.label }}</span>

              <!-- Selected Indicator -->
              <svg
                *ngIf="isSelected(item)"
                class="ml-auto w-4 h-4 text-primary-600"
                fill="currentColor"
                viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </button>
          </ng-container>

          <!-- Empty State -->
          <div 
            *ngIf="!items || items.length === 0"
            class="px-4 py-2 text-sm text-gray-500 text-center">
            {{ emptyText }}
          </div>
        </div>
      </div>
    </div>
  `
})
export class DropdownComponent {
  @Input() items: DropdownItem[] = [];
  @Input() placeholder = 'Sélectionner...';
  @Input() emptyText = 'Aucun élément';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() icon = '';
  @Input() variant: 'default' | 'outline' | 'ghost' = 'default';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() multiple = false;
  @Input() searchable = false;

  @Output() selectionChange = new EventEmitter<DropdownItem | DropdownItem[]>();

  public isOpen = signal(false);
  private selectedItems = signal<DropdownItem[]>([]);

  constructor(private elementRef: ElementRef) {}

  selectedLabel = computed(() => {
    const selected = this.selectedItems();
    if (selected.length === 0) return '';
    if (selected.length === 1) return selected[0].label;
    return `${selected.length} éléments sélectionnés`;
  });

  triggerClasses = computed(() => {
    const baseClasses = [
      'inline-flex',
      'items-center',
      'justify-between',
      'w-full',
      'rounded-md',
      'border',
      'font-medium',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-primary-500',
      'focus:ring-offset-2',
      'disabled:opacity-50',
      'disabled:cursor-not-allowed',
      'transition-colors',
      'duration-200'
    ];

    const sizeClasses = {
      sm: ['px-3', 'py-1.5', 'text-sm'],
      md: ['px-3', 'py-2', 'text-sm'],
      lg: ['px-4', 'py-3', 'text-base']
    };

    const variantClasses = {
      default: [
        'bg-white',
        'border-gray-300',
        'text-gray-700',
        'hover:bg-gray-50',
        'hover:border-gray-400'
      ],
      outline: [
        'bg-transparent',
        'border-gray-300',
        'text-gray-700',
        'hover:bg-gray-50',
        'hover:border-gray-400'
      ],
      ghost: [
        'bg-transparent',
        'border-transparent',
        'text-gray-700',
        'hover:bg-gray-100'
      ]
    };

    return [
      ...baseClasses,
      ...sizeClasses[this.size],
      ...variantClasses[this.variant]
    ].join(' ');
  });

  menuClasses = computed(() => {
    return this.size === 'lg' ? 'w-64' : 'w-56';
  });

  itemClasses(item: DropdownItem) {
    const baseClasses = [
      'flex',
      'items-center',
      'w-full',
      'px-4',
      'py-2',
      'text-left',
      'text-sm',
      'transition-colors',
      'duration-150'
    ];

    const stateClasses = item.disabled
      ? ['text-gray-400', 'cursor-not-allowed']
      : this.isSelected(item)
        ? ['bg-primary-50', 'text-primary-700']
        : ['text-gray-700', 'hover:bg-gray-100', 'hover:text-gray-900'];

    return [...baseClasses, ...stateClasses].join(' ');
  }

  toggleDropdown() {
    if (!this.disabled && !this.loading) {
      this.isOpen.update(open => !open);
    }
  }

  closeDropdown() {
    this.isOpen.set(false);
  }

  selectItem(item: DropdownItem) {
    if (item.disabled) return;

    if (this.multiple) {
      const selected = this.selectedItems();
      const isCurrentlySelected = selected.some(s => s.id === item.id);
      
      if (isCurrentlySelected) {
        this.selectedItems.set(selected.filter(s => s.id !== item.id));
      } else {
        this.selectedItems.set([...selected, item]);
      }
      
      this.selectionChange.emit(this.selectedItems());
    } else {
      this.selectedItems.set([item]);
      this.selectionChange.emit(item);
      this.closeDropdown();
    }
  }

  isSelected(item: DropdownItem): boolean {
    return this.selectedItems().some(s => s.id === item.id);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeDropdown();
    }
  }

  trackByFn(index: number, item: DropdownItem): any {
    return item.id;
  }
}