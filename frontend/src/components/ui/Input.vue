<script setup>
import { computed, ref, useSlots } from 'vue';
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline';
import { cn } from '../../utils/styles';

const props = defineProps({
  name: {
    type: String,
    default: ''
  },
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
  error: {
    type: String,
    default: ''
  },
  success: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'md',
    validator: value => ['sm', 'md', 'lg'].includes(value)
  },
  variant: {
    type: String,
    default: 'default',
    validator: value => ['default', 'filled'].includes(value)
  },
  autocomplete: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue', 'blur', 'focus', 'keydown', 'keyup']);

const slots = useSlots();
const showPassword = ref(false);

// Computed properties
const inputType = computed(() => {
  if (props.type === 'password') {
    return showPassword.value ? 'text' : 'password';
  }
  return props.type;
});

const hasError = computed(() => !!props.error);
const hasSuccess = computed(() => !!props.success && !hasError.value);
const hasPrefix = computed(() => !!slots.prefix);
const hasSuffix = computed(() => !!slots.suffix || props.type === 'password');

// Input classes
const inputClasses = computed(() => {
  const baseClasses = 'block w-full transition-all duration-300 focus:outline-none font-medium';
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-4 py-2 text-base'
  };
  
  const variantClasses = {
    default: 'bg-white border-2 shadow-soft hover:shadow-medium',
    filled: 'bg-gray-50 border-2 border-transparent shadow-soft hover:shadow-medium'
  };
  
  const stateClasses = hasError.value
    ? 'border-error-400 focus:border-error-500 focus:ring-4 focus:ring-error-100 focus:shadow-colored-energy'
    : hasSuccess.value
    ? 'border-success-400 focus:border-success-500 focus:ring-4 focus:ring-success-100 focus:shadow-colored-primary'
    : 'border-gray-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 focus:shadow-colored-primary';
  
  const roundingClasses = 'rounded-2xl';

  return cn(
    baseClasses,
    sizeClasses[props.size],
    variantClasses[props.variant],
    stateClasses,
    roundingClasses,
    'focus:ring-offset-0',
    {
      'opacity-50 cursor-not-allowed': props.disabled,
      'pl-12': hasPrefix.value,
      'pr-12': hasSuffix.value
    }
  );
});

const containerClasses = computed(() => {
  return cn(
    'relative flex items-center group',
    {
      'opacity-50': props.disabled
    }
  );
});

// Event handlers
const handleInput = (event) => {
  emit('update:modelValue', event.target.value);
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

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};
</script>

<template>
  <div class="w-full">
    <div :class="containerClasses">
      <!-- Prefix slot -->
      <div
        v-if="hasPrefix"
        class="absolute left-4 z-10 flex items-center pointer-events-none"
        :class="{
          'text-error-500': hasError,
          'text-success-500': hasSuccess,
          'text-gray-400': !hasError && !hasSuccess
        }"
      >
        <slot name="prefix" />
      </div>

      <!-- Input element -->
      <input
        :name="name"
        :type="inputType"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :class="inputClasses"
        :autocomplete="autocomplete"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
        @keydown="handleKeydown"
        @keyup="handleKeyup"
      />

      <!-- Suffix slot or password toggle -->
      <div
        v-if="hasSuffix"
        class="absolute right-4 z-10 flex items-center"
      >
        <button
          v-if="type === 'password'"
          type="button"
          class="text-gray-400 hover:text-gray-600 focus:outline-none"
          @click="togglePasswordVisibility"
        >
          <EyeIcon v-if="!showPassword" class="w-5 h-5" />
          <EyeSlashIcon v-else class="w-5 h-5" />
        </button>
        <div
          v-else
          class="pointer-events-none"
          :class="{
            'text-error-500': hasError,
            'text-success-500': hasSuccess,
            'text-gray-400': !hasError && !hasSuccess
          }"
        >
          <slot name="suffix" />
        </div>
      </div>
    </div>

    <!-- Error message -->
    <p v-if="hasError" class="form-error">
      {{ error }}
    </p>

    <!-- Success message -->
    <p v-if="hasSuccess" class="form-success">
      {{ success }}
    </p>
  </div>
</template>