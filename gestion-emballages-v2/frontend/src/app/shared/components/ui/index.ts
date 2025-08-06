// UI Components Barrel Export
export { ButtonComponent } from './button.component';
export { InputComponent } from './input.component';
export { ModalComponent } from './modal.component';
export { CardComponent } from './card.component';
export { DropdownComponent, type DropdownItem } from './dropdown.component';

// Re-export common types
export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type InputSize = 'sm' | 'md' | 'lg';
export type CardVariant = 'default' | 'elevated' | 'outlined' | 'ghost';