<script setup>
import { computed } from 'vue';
import { cn } from '../../utils/styles';

const props = defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: value => ['default', 'outline', 'ghost', 'elevated'].includes(value)
  },
  padding: {
    type: String,
    default: 'md',
    validator: value => ['none', 'sm', 'md', 'lg', 'xl'].includes(value)
  },
  hover: {
    type: Boolean,
    default: false
  },
  clickable: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['click']);

const cardClasses = computed(() => {
  const baseClasses = 'bg-white transition-all duration-200';
  
  const variantClasses = {
    default: 'border border-gray-200 rounded-3xl',
    outline: 'border-2 border-gray-200 rounded-3xl',
    ghost: 'border border-transparent rounded-3xl',
    elevated: 'border border-gray-100 rounded-3xl shadow-large'
  };
  
  const paddingClasses = {
    none: '',
    sm: 'p-6',
    md: 'p-8',
    lg: 'p-10',
    xl: 'p-12'
  };
  
  const interactionClasses = props.hover || props.clickable
    ? 'hover:shadow-medium hover:-translate-y-0.5'
    : '';
  
  const clickableClasses = props.clickable
    ? 'cursor-pointer active:scale-[0.98]'
    : '';

  return cn(
    baseClasses,
    variantClasses[props.variant],
    paddingClasses[props.padding],
    interactionClasses,
    clickableClasses
  );
});

const handleClick = (event) => {
  if (props.clickable) {
    emit('click', event);
  }
};
</script>

<template>
  <div
    :class="cardClasses"
    @click="handleClick"
  >
    <slot />
  </div>
</template>