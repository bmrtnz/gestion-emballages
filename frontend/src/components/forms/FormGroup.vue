<script setup>
import { computed } from 'vue';
import { cn } from '../../utils/styles';

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  spacing: {
    type: String,
    default: 'md',
    validator: value => ['sm', 'md', 'lg', 'xl'].includes(value)
  },
  columns: {
    type: [Number, String],
    default: 1,
    validator: value => [1, 2, 3, 4, '1', '2', '3', '4'].includes(value)
  },
  variant: {
    type: String,
    default: 'default',
    validator: value => ['default', 'card', 'bordered'].includes(value)
  }
});

const spacingClasses = computed(() => {
  const classes = {
    sm: 'space-y-3',
    md: 'space-y-4',
    lg: 'space-y-6',
    xl: 'space-y-8'
  };
  return classes[props.spacing];
});

const gridClasses = computed(() => {
  const numColumns = Number(props.columns);
  if (numColumns === 1) return '';
  
  const classes = {
    2: 'grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6',
    3: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6',
    4: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6'
  };
  return classes[numColumns] || '';
});

const containerClasses = computed(() => {
  const baseClasses = 'w-full';
  
  const variantClasses = {
    default: '',
    card: 'bg-white rounded-xl border border-gray-200 p-6',
    bordered: 'border border-gray-200 rounded-lg p-4'
  };
  
  return cn(baseClasses, variantClasses[props.variant]);
});

const contentClasses = computed(() => {
  return cn(spacingClasses.value, gridClasses.value);
});
</script>

<template>
  <div :class="containerClasses">
    <!-- Header -->
    <div v-if="title || description" class="mb-6">
      <h3 v-if="title" class="text-lg font-semibold text-gray-900 mb-1">
        {{ title }}
      </h3>
      <p v-if="description" class="text-sm text-gray-600">
        {{ description }}
      </p>
    </div>
    
    <!-- Content -->
    <div :class="contentClasses">
      <slot />
    </div>
  </div>
</template>