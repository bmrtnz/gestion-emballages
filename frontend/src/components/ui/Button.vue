<script setup>
import { computed } from 'vue';
import { cva, cn } from '../../utils/styles';

// Props definition
const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: value => ['primary', 'secondary', 'outline', 'ghost', 'danger', 'accent', 'sunshine'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: value => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value)
  },
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  icon: {
    type: Boolean,
    default: false
  },
  block: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'button',
    validator: value => ['button', 'submit', 'reset'].includes(value)
  }
});

// Button variants using class-variance-authority
const buttonVariants = cva(
  // Base classes - enhanced with playful animations
  'inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary: 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 focus:ring-primary-500 active:from-primary-700 active:to-primary-800 shadow-colored-primary hover:shadow-lg',
        secondary: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-900 hover:from-gray-200 hover:to-gray-300 focus:ring-gray-500 active:from-gray-300 active:to-gray-400 shadow-medium hover:shadow-lg',
        outline: 'border-2 border-primary-300 bg-white text-primary-700 hover:bg-primary-50 hover:border-primary-400 focus:ring-primary-500 active:bg-primary-100 shadow-soft hover:shadow-colored-primary',
        ghost: 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-500 active:bg-gray-200 hover:shadow-soft',
        danger: 'bg-gradient-to-r from-error-500 to-error-600 text-white hover:from-error-600 hover:to-error-700 focus:ring-error-500 active:from-error-700 active:to-error-800 shadow-colored-energy hover:shadow-lg',
        accent: 'bg-gradient-to-r from-accent-500 to-accent-600 text-white hover:from-accent-600 hover:to-accent-700 focus:ring-accent-500 active:from-accent-700 active:to-accent-800 shadow-colored-accent hover:shadow-lg',
        sunshine: 'bg-gradient-to-r from-sunshine-500 to-sunshine-600 text-white hover:from-sunshine-600 hover:to-sunshine-700 focus:ring-sunshine-500 active:from-sunshine-700 active:to-sunshine-800 shadow-colored-sunshine hover:shadow-lg'
      },
      size: {
        xs: 'px-2.5 py-1.5 text-xs rounded-md',
        sm: 'px-3 py-2 text-sm rounded-md',
        md: 'px-4 py-2 text-sm rounded-lg',
        lg: 'px-4 py-2 text-base rounded-lg',
        xl: 'px-6 py-3 text-base rounded-xl'
      },
      icon: {
        true: 'p-3'
      },
      block: {
        true: 'w-full'
      }
    },
    compoundVariants: [
      {
        icon: true,
        size: 'xs',
        class: 'p-2'
      },
      {
        icon: true,
        size: 'sm',
        class: 'p-3'
      },
      {
        icon: true,
        size: 'md',
        class: 'p-4'
      },
      {
        icon: true,
        size: 'lg',
        class: 'p-5'
      },
      {
        icon: true,
        size: 'xl',
        class: 'p-6'
      }
    ]
  }
);

// Computed class names
const buttonClasses = computed(() => {
  return buttonVariants({
    variant: props.variant,
    size: props.size,
    icon: props.icon,
    block: props.block
  });
});

// Define emits
const emit = defineEmits(['click']);

// Handle click with loading state
const handleClick = (event) => {
  if (!props.loading && !props.disabled) {
    emit('click', event);
  }
};
</script>

<template>
  <button
    :type="type"
    :class="buttonClasses"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <!-- Loading spinner -->
    <svg
      v-if="loading"
      class="w-4 h-4 mr-2 animate-spin"
      :class="{ 'mr-0': icon }"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>

    <!-- Slot content -->
    <slot />
  </button>
</template>