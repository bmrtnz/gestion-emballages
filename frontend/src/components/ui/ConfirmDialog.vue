<script setup>
import { ref } from 'vue';
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline';
import Button from './Button.vue';

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Confirmer l\'action'
  },
  message: {
    type: String,
    default: 'Êtes-vous sûr de vouloir effectuer cette action ?'
  },
  confirmText: {
    type: String,
    default: 'Confirmer'
  },
  cancelText: {
    type: String,
    default: 'Annuler'
  },
  variant: {
    type: String,
    default: 'danger', // 'danger', 'warning', 'info'
    validator: value => ['danger', 'warning', 'info'].includes(value)
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['confirm', 'cancel', 'close']);

const handleConfirm = () => {
  emit('confirm');
};

const handleCancel = () => {
  emit('cancel');
  emit('close');
};

const getVariantClasses = () => {
  switch (props.variant) {
    case 'danger':
      return {
        icon: 'text-red-600',
        iconBg: 'bg-red-100',
        confirmButton: 'danger'
      };
    case 'warning':
      return {
        icon: 'text-yellow-600',
        iconBg: 'bg-yellow-100',
        confirmButton: 'warning'
      };
    case 'info':
      return {
        icon: 'text-blue-600',
        iconBg: 'bg-blue-100',
        confirmButton: 'primary'
      };
    default:
      return {
        icon: 'text-red-600',
        iconBg: 'bg-red-100',
        confirmButton: 'danger'
      };
  }
};

const variantClasses = getVariantClasses();
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="handleCancel"></div>
      
      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
      
      <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
        <div class="sm:flex sm:items-start">
          <div :class="[variantClasses.iconBg, 'mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10']">
            <ExclamationTriangleIcon :class="[variantClasses.icon, 'h-6 w-6']" aria-hidden="true" />
          </div>
          <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
              {{ title }}
            </h3>
            <div class="mt-2">
              <p class="text-sm text-gray-500">
                {{ message }}
              </p>
            </div>
          </div>
        </div>
        <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
          <Button
            :variant="variantClasses.confirmButton"
            :loading="loading"
            @click="handleConfirm"
            class="w-full sm:ml-3 sm:w-auto"
          >
            {{ confirmText }}
          </Button>
          <Button
            variant="secondary"
            @click="handleCancel"
            :disabled="loading"
            class="mt-3 w-full sm:mt-0 sm:w-auto"
          >
            {{ cancelText }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>