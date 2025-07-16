<script setup>
import { computed, useSlots } from 'vue';
import Label from '../ui/Label.vue';
import Input from '../ui/Input.vue';
import { cn } from '../../utils/styles';

const props = defineProps({
  // Form field props
  name: {
    type: String,
    required: true
  },
  label: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    default: ''
  },
  
  // Input props (passed through)
  modelValue: {
    type: [String, Number],
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  },
  placeholder: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  readonly: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'md'
  },
  variant: {
    type: String,
    default: 'default'
  },
  autocomplete: {
    type: String,
    default: ''
  },
  
  // Validation props
  error: {
    type: String,
    default: ''
  },
  success: {
    type: String,
    default: ''
  },
  
  // Layout props
  spacing: {
    type: String,
    default: 'md',
    validator: value => ['sm', 'md', 'lg'].includes(value)
  }
});

const emit = defineEmits(['update:modelValue', 'blur', 'focus', 'keydown', 'keyup']);

const slots = useSlots();

// Computed properties
const fieldId = computed(() => `field-${props.name}`);
const hasLabel = computed(() => props.label || slots.label);
const hasDescription = computed(() => props.description || slots.description);

const spacingClasses = computed(() => {
  const classes = {
    sm: 'space-y-1',
    md: 'space-y-2',
    lg: 'space-y-3'
  };
  return classes[props.spacing];
});

// Event handlers - pass through to Input component
const handleUpdate = (value) => {
  emit('update:modelValue', value);
};

const handleBlur = (event) => {
  emit('blur', event);
};

const handleFocus = (event) => {
  emit('focus', event);
};

const handleKeydown = (event) => {
  emit('keydown', event);
};

const handleKeyup = (event) => {
  emit('keyup', event);
};
</script>

<template>
  <div :class="cn('w-full', spacingClasses)">
    <!-- Label -->
    <Label
      v-if="hasLabel"
      :for="fieldId"
      :required="required"
      :size="size === 'lg' ? 'lg' : 'md'"
    >
      <slot name="label">{{ label }}</slot>
    </Label>
    
    <!-- Description -->
    <p
      v-if="hasDescription"
      class="text-sm text-gray-500"
    >
      <slot name="description">{{ description }}</slot>
    </p>
    
    <!-- Input field -->
    <div class="relative">
      <slot
        name="input"
        :id="fieldId"
        :value="modelValue"
        :error="error"
        :success="success"
        :update="handleUpdate"
        :blur="handleBlur"
        :focus="handleFocus"
        :keydown="handleKeydown"
        :keyup="handleKeyup"
      >
        <Input
          :id="fieldId"
          :name="name"
          :model-value="modelValue"
          :type="type"
          :placeholder="placeholder"
          :disabled="disabled"
          :readonly="readonly"
          :size="size"
          :variant="variant"
          :error="error"
          :success="success"
          :autocomplete="autocomplete"
          @update:model-value="handleUpdate"
          @blur="handleBlur"
          @focus="handleFocus"
          @keydown="handleKeydown"
          @keyup="handleKeyup"
        >
          <template v-if="slots.prefix" #prefix>
            <slot name="prefix" />
          </template>
          <template v-if="slots.suffix" #suffix>
            <slot name="suffix" />
          </template>
        </Input>
      </slot>
    </div>
  </div>
</template>