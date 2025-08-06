import { Component, Input, Output, EventEmitter, forwardRef, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

type InputSize = 'sm' | 'md' | 'lg';
type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';

@Component({
  selector: 'ui-input',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ],
  template: `
    <div class="space-y-1">
      <!-- Label -->
      <label 
        *ngIf="label"
        [for]="inputId"
        class="block text-sm font-medium text-gray-700">
        {{ label }}
        <span *ngIf="required" class="text-error-500">*</span>
      </label>

      <!-- Input Container -->
      <div class="relative">
        <!-- Left Icon -->
        <div 
          *ngIf="hasLeftIcon"
          class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="leftIcon" />
          </svg>
        </div>

        <!-- Input Element -->
        <input
          [id]="inputId"
          [type]="type"
          [value]="value"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [readonly]="readonly"
          [required]="required"
          [autocomplete]="autocomplete"
          [class]="inputClasses()"
          (input)="onInput($event)"
          (blur)="onBlur()"
          (focus)="onFocus()"
        />

        <!-- Right Icon -->
        <div 
          *ngIf="rightIcon"
          class="absolute inset-y-0 right-0 pr-3 flex items-center">
          <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="rightIcon" />
          </svg>
        </div>

        <!-- Clear Button -->
        <button
          *ngIf="clearable && value && !disabled"
          type="button"
          class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          (click)="clearValue()">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Help Text -->
      <p 
        *ngIf="helpText && !error"
        class="text-sm text-gray-500">
        {{ helpText }}
      </p>

      <!-- Error Message -->
      <p 
        *ngIf="error"
        class="text-sm text-error-600">
        {{ error }}
      </p>
    </div>
  `
})
export class InputComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() type: InputType = 'text';
  @Input() size: InputSize = 'md';
  @Input() placeholder = '';
  @Input() helpText = '';
  @Input() error = '';
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() required = false;
  @Input() clearable = false;
  @Input() autocomplete = '';
  @Input() inputId = `input-${Math.random().toString(36).substr(2, 9)}`;
  @Input() leftIcon = '';  // SVG path string for left icon
  @Input() rightIcon = ''; // SVG path string for right icon

  @Output() inputChange = new EventEmitter<string>();
  @Output() inputFocus = new EventEmitter<void>();
  @Output() inputBlur = new EventEmitter<void>();

  value = '';

  get hasLeftIcon() {
    return !!this.leftIcon;
  }

  get hasRightIcon() {
    return !!this.rightIcon || this.clearable;
  }

  private onChange = (value: string) => {};
  private onTouched = () => {};


  inputClasses = computed(() => {
    const baseClasses = [
      'block',
      'w-full',
      'border',
      'rounded-md',
      'shadow-sm',
      'transition-colors',
      'duration-200',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-primary-500',
      'focus:border-primary-500',
      'disabled:bg-gray-50',
      'disabled:text-gray-500',
      'disabled:cursor-not-allowed',
      'placeholder-gray-400'
    ];

    // Size classes
    const sizeClasses = {
      sm: ['px-3', 'py-1.5', 'text-sm'],
      md: ['px-3', 'py-2', 'text-sm'],
      lg: ['px-4', 'py-3', 'text-base']
    };

    // State classes
    const stateClasses = this.error 
      ? ['border-error-300', 'text-error-900', 'placeholder-error-300', 'focus:ring-error-500', 'focus:border-error-500']
      : ['border-gray-300'];

    // Padding adjustments for icons
    const paddingClasses = [];
    if (this.hasLeftIcon) {
      paddingClasses.push('pl-10');
    }
    if (this.rightIcon || this.clearable) {
      paddingClasses.push('pr-10');
    }

    return [
      ...baseClasses,
      ...sizeClasses[this.size],
      ...stateClasses,
      ...paddingClasses
    ].join(' ');
  });

  onInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
    this.inputChange.emit(this.value);
  }

  onFocus() {
    this.inputFocus.emit();
  }

  onBlur() {
    this.onTouched();
    this.inputBlur.emit();
  }

  clearValue() {
    this.value = '';
    this.onChange(this.value);
    this.inputChange.emit(this.value);
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}