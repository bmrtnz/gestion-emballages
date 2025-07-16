import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names with clsx and merges Tailwind classes with twMerge
 * @param {...any} inputs - Class names to combine
 * @returns {string} - Combined and merged class names
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Component variant utility using class-variance-authority
 */
export { cva } from 'class-variance-authority';