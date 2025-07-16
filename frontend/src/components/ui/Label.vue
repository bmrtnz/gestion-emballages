<script setup>
import { computed } from 'vue';
import { cn } from '../../utils/styles';

const props = defineProps({
  for: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'md',
    validator: value => ['sm', 'md', 'lg'].includes(value)
  },
  variant: {
    type: String,
    default: 'default',
    validator: value => ['default', 'muted'].includes(value)
  }
});

const labelClasses = computed(() => {
  const baseClasses = 'block font-medium';
  
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };
  
  const variantClasses = {
    default: 'text-gray-700',
    muted: 'text-gray-500'
  };

  return cn(
    baseClasses,
    sizeClasses[props.size],
    variantClasses[props.variant]
  );
});
</script>

<template>
  <label
    :for="for"
    :class="labelClasses"
  >
    <slot />
    <span v-if="required" class="text-error-500 ml-1">*</span>
  </label>
</template>