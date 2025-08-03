<script setup>
import { computed, ref } from 'vue';
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/vue';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/vue/24/outline';
import { cn } from '../../utils/styles';

const props = defineProps({
  modelValue: {
    type: [String, Number, Object],
    default: null
  },
  options: {
    type: Array,
    required: true,
    default: () => []
  },
  placeholder: {
    type: String,
    default: 'Sélectionner une option'
  },
  disabled: {
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
  searchable: {
    type: Boolean,
    default: false
  },
  clearable: {
    type: Boolean,
    default: false
  },
  multiple: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

const searchQuery = ref('');

// Computed properties
const hasError = computed(() => !!props.error);
const hasSuccess = computed(() => !!props.success && !hasError.value);

const selectedOption = computed(() => {
  if (!props.modelValue) return null;
  return props.options.find(option => 
    (typeof option === 'object' ? option.value : option) === props.modelValue
  );
});

const filteredOptions = computed(() => {
  if (!props.searchable || !searchQuery.value) {
    return props.options;
  }
  
  return props.options.filter(option => {
    const label = typeof option === 'object' ? option.label : option;
    return label.toLowerCase().includes(searchQuery.value.toLowerCase());
  });
});

const buttonClasses = computed(() => {
  const baseClasses = 'relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors duration-200';
  
  const sizeClasses = {
    sm: 'py-1.5 pl-3 pr-8 text-sm',
    md: 'py-2.5 pl-3 pr-10 text-sm',
    lg: 'py-3 pl-4 pr-10 text-base'
  };
  
  const stateClasses = hasError.value
    ? 'border border-error-300 focus:border-error-500 focus:ring-error-500'
    : hasSuccess.value
    ? 'border border-success-300 focus:border-success-500 focus:ring-success-500'
    : 'border border-gray-300 focus:border-primary-500 focus:ring-primary-500';
  
  return cn(
    baseClasses,
    sizeClasses[props.size],
    stateClasses,
    {
      'opacity-50 cursor-not-allowed': props.disabled
    }
  );
});

// Event handlers
const handleChange = (value) => {
  emit('update:modelValue', value);
  emit('change', value);
};

const getDisplayValue = (option) => {
  if (!option) return props.placeholder;
  return typeof option === 'object' ? option.label : option;
};

const getOptionValue = (option) => {
  return typeof option === 'object' ? option.value : option;
};
</script>

<template>
  <div class="w-full">
    <Listbox 
      :model-value="modelValue" 
      :disabled="disabled"
      @update:model-value="handleChange"
    >
      <div class="relative">
        <ListboxButton :class="buttonClasses">
          <span 
            class="block truncate"
            :class="{
              'text-gray-500': !selectedOption,
              'text-gray-900': selectedOption
            }"
          >
            {{ getDisplayValue(selectedOption) }}
          </span>
          <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
          </span>
        </ListboxButton>

        <transition
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <ListboxOptions 
            class="absolute mt-1 max-h-60 w-full rounded-lg bg-white text-base shadow-large ring-1 ring-black ring-opacity-5 focus:outline-none z-50 flex flex-col"
          >
            <!-- Search input -->
            <div v-if="searchable" class="flex-shrink-0 p-2 border-b border-gray-100">
              <input
                v-model="searchQuery"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Rechercher..."
              />
            </div>

            <!-- Scrollable options container -->
            <div class="flex-1 overflow-auto py-1">
              <!-- No results -->
              <div 
                v-if="filteredOptions.length === 0" 
                class="relative cursor-default select-none py-2 px-4 text-gray-700"
              >
                Aucun résultat trouvé
              </div>

              <!-- Options -->
              <ListboxOption
                v-for="option in filteredOptions"
                :key="getOptionValue(option)"
                v-slot="{ active, selected }"
                :value="getOptionValue(option)"
                as="template"
              >
                <li
                  :class="[
                    active ? 'bg-primary-100 text-primary-900' : 'text-gray-900',
                    'relative cursor-default select-none py-2 pl-10 pr-4'
                  ]"
                >
                  <span
                    :class="[
                      selected ? 'font-medium' : 'font-normal',
                      'block truncate'
                    ]"
                  >
                    {{ getDisplayValue(option) }}
                  </span>
                  <span
                    v-if="selected"
                    class="absolute inset-y-0 left-0 flex items-center pl-3 text-primary-600"
                  >
                    <CheckIcon class="h-5 w-5" aria-hidden="true" />
                  </span>
                </li>
              </ListboxOption>
            </div>
          </ListboxOptions>
        </transition>
      </div>
    </Listbox>

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