<script setup>
import { computed } from 'vue';
import { DocumentIcon, DocumentCheckIcon, TruckIcon, ArrowDownOnSquareIcon, CircleStackIcon, DocumentCurrencyEuroIcon, ArchiveBoxIcon, ChevronDoubleRightIcon } from '@heroicons/vue/24/outline';

// Props
const props = defineProps({
  currentStatus: {
    type: String,
    required: true
  },
  workflowType: {
    type: String,
    default: 'commande',
    validator: (value) => ['commande', 'transfert'].includes(value)
  },
  createdAt: {
    type: String,
    default: null
  }
});

// Workflow steps configuration
const workflowSteps = {
  commande: [
    { key: 'Enregistrée', label: 'Enregistrée', subtitle: 'Commande créée', icon: DocumentIcon },
    { key: 'Confirmée', label: 'Confirmée', subtitle: 'Par fournisseur', icon: DocumentCheckIcon },
    { key: 'Expédiée', label: 'Expédiée', subtitle: 'En transit', icon: TruckIcon },
    { key: 'Réceptionnée', label: 'Réceptionnée', subtitle: 'Par station', icon: ArrowDownOnSquareIcon },
    { key: 'Clôturée', label: 'Clôturée', subtitle: 'Validée', icon: CircleStackIcon },
    { key: 'Facturée', label: 'Facturée', subtitle: 'Comptabilisée', icon: DocumentCurrencyEuroIcon },
    { key: 'Archivée', label: 'Archivée', subtitle: 'Terminée', icon: ArchiveBoxIcon }
  ],
  transfert: [
    { key: 'Enregistrée', label: 'Enregistrée', subtitle: 'Demande créée', icon: DocumentIcon },
    { key: 'Confirmée', label: 'Confirmée', subtitle: 'Par source', icon: DocumentCheckIcon },
    { key: 'Traitée logistique', label: 'Traitée logistique', subtitle: 'Gestion', icon: CircleStackIcon },
    { key: 'Expédiée', label: 'Expédiée', subtitle: 'En transit', icon: TruckIcon },
    { key: 'Réceptionnée', label: 'Réceptionnée', subtitle: 'Par destination', icon: ArrowDownOnSquareIcon },
    { key: 'Clôturée', label: 'Clôturée', subtitle: 'Validée', icon: CircleStackIcon },
    { key: 'Traitée comptabilité', label: 'Traitée comptabilité', subtitle: 'Comptabilisée', icon: DocumentCurrencyEuroIcon },
    { key: 'Archivée', label: 'Archivée', subtitle: 'Terminée', icon: ArchiveBoxIcon }
  ]
};

// Date formatting helper
const formatDate = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', { 
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Computed properties
const steps = computed(() => {
  const baseSteps = [...workflowSteps[props.workflowType]]; // Create a copy
  
  // If we have a creation date, update the first step's subtitle
  if (props.createdAt) {
    const formattedDate = formatDate(props.createdAt);
    if (formattedDate && baseSteps.length > 0) {
      baseSteps[0] = {
        ...baseSteps[0],
        subtitle: formattedDate
      };
    }
  }
  
  return baseSteps;
});

const getWorkflowStepClass = (stepKey) => {
  if (!props.currentStatus) return 'border-2 border-gray-300 text-gray-400 bg-white';
  
  const currentIndex = steps.value.findIndex(step => step.key === props.currentStatus);
  const stepIndex = steps.value.findIndex(step => step.key === stepKey);
  
  if (stepIndex === currentIndex) {
    // Current step - thick primary border, no fill
    return 'border-[3px] border-primary-600 text-primary-600 bg-white';
  } else if (stepIndex < currentIndex) {
    // Completed step - green fill
    return 'border-2 border-green-500 text-white bg-green-500';
  } else {
    // Future step - gray
    return 'border-2 border-gray-300 text-gray-400 bg-white';
  }
};

const getWorkflowTextClass = (stepKey) => {
  if (!props.currentStatus) return '';
  
  if (stepKey === props.currentStatus) {
    // Current step - bold and primary color
    return 'font-bold text-primary-600';
  }
  
  return '';
};
</script>

<template>
  <div class="mb-8 px-6">
    <div class="relative">
      <!-- Workflow Steps -->
      <div class="flex items-center justify-between">
        <template v-for="(step, index) in steps" :key="step.key">
          <!-- Step -->
          <div class="flex flex-col items-center relative">
            <div class="flex items-center justify-center w-10 h-10 rounded-full" :class="getWorkflowStepClass(step.key)">
              <component :is="step.icon" class="w-5 h-5" />
            </div>
            <div class="mt-2 text-center">
              <div class="text-xs font-medium" :class="getWorkflowTextClass(step.key) || 'text-gray-900'">{{ step.label }}</div>
              <div class="text-xs text-gray-500">{{ step.subtitle }}</div>
            </div>
          </div>

          <!-- Arrow (not after last step) -->
          <div v-if="index < steps.length - 1" class="flex-1 flex items-center justify-center mx-2">
            <ChevronDoubleRightIcon class="w-5 h-5 text-gray-400" />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>