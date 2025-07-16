<script setup>
import { computed } from 'vue';
import { useFormValidation, validators } from '../../composables/useFormValidation';
import { useErrorHandler } from '../../composables/useErrorHandler';
import { useLoading } from '../../composables/useLoading';
import { message } from 'ant-design-vue';
import api from '../../api/axios';

const props = defineProps({
  station: {
    type: Object,
    default: null
  },
  mode: {
    type: String,
    default: 'create', // 'create' ou 'edit'
    validator: value => ['create', 'edit'].includes(value)
  }
});

const emit = defineEmits(['success', 'cancel']);

// Règles de validation spécifiques aux stations
const stationValidationRules = {
  nom: [
    validators.required,
    validators.minLength(2, 'Minimum 2 caractères requis'),
    validators.maxLength(100, 'Maximum 100 caractères autorisés')
  ],
  identifiantInterne: [
    validators.required,
    validators.pattern(/^[A-Z0-9-]+$/, 'Format: lettres majuscules, chiffres et tirets uniquement'),
    validators.minLength(3, 'Minimum 3 caractères requis'),
    validators.maxLength(20, 'Maximum 20 caractères autorisés')
  ],
  adresse: [
    validators.required,
    validators.minLength(10, 'Adresse trop courte (minimum 10 caractères)'),
    validators.maxLength(200, 'Adresse trop longue (maximum 200 caractères)')
  ],
  contactPrincipal: [
    validators.maxLength(100, 'Maximum 100 caractères autorisés')
  ]
};

// Données initiales basées sur le mode
const initialData = computed(() => {
  if (props.mode === 'edit' && props.station) {
    return {
      nom: props.station.nom || '',
      identifiantInterne: props.station.identifiantInterne || '',
      adresse: props.station.adresse || '',
      contactPrincipal: props.station.contactPrincipal || ''
    };
  }
  return {
    nom: '',
    identifiantInterne: '',
    adresse: '',
    contactPrincipal: ''
  };
});

// Validation du formulaire
const { 
  formData, 
  validateForm, 
  resetForm, 
  getFieldProps, 
  getFieldStatus, 
  getFieldMessage,
  isValid 
} = useFormValidation(initialData.value, stationValidationRules);

// Gestion du loading et des erreurs
const { isLoading, execute } = useLoading();
const { withErrorHandling } = useErrorHandler();

// Actions
const handleSubmit = async () => {
  if (!validateForm()) {
    message.warning('Veuillez corriger les erreurs du formulaire');
    return;
  }

  await execute(async () => {
    let response;
    
    if (props.mode === 'create') {
      response = await withErrorHandling(
        () => api.post('/stations', formData),
        'Erreur lors de la création de la station'
      );
      message.success('Station créée avec succès !');
    } else {
      response = await withErrorHandling(
        () => api.put(`/stations/${props.station._id}`, formData),
        'Erreur lors de la mise à jour de la station'
      );
      message.success('Station mise à jour avec succès !');
    }
    
    emit('success', response.data);
    if (props.mode === 'create') {
      resetForm();
    }
  });
};

const handleCancel = () => {
  if (props.mode === 'create') {
    resetForm();
  }
  emit('cancel');
};

// Titre dynamique
const title = computed(() => {
  return props.mode === 'create' ? 'Créer une nouvelle station' : 'Modifier la station';
});

const submitButtonText = computed(() => {
  return props.mode === 'create' ? 'Créer' : 'Mettre à jour';
});
</script>

<template>
  <div class="station-form">
    <h3>{{ title }}</h3>
    
    <a-form :model="formData" layout="vertical" @finish="handleSubmit">
      <a-form-item 
        label="Nom de la station" 
        required
        :validate-status="getFieldStatus('nom')"
        :help="getFieldMessage('nom')"
      >
        <a-input 
          v-bind="getFieldProps('nom')"
          placeholder="Ex: Station Nord"
        />
      </a-form-item>
      
      <a-form-item 
        label="Identifiant interne" 
        required
        :validate-status="getFieldStatus('identifiantInterne')"
        :help="getFieldMessage('identifiantInterne')"
      >
        <a-input 
          v-bind="getFieldProps('identifiantInterne')"
          placeholder="Ex: STN-001"
        />
      </a-form-item>
      
      <a-form-item 
        label="Adresse" 
        required
        :validate-status="getFieldStatus('adresse')"
        :help="getFieldMessage('adresse')"
      >
        <a-textarea 
          v-bind="getFieldProps('adresse')"
          placeholder="Adresse complète de la station"
          :rows="3"
        />
      </a-form-item>
      
      <a-form-item 
        label="Contact principal"
        :validate-status="getFieldStatus('contactPrincipal')"
        :help="getFieldMessage('contactPrincipal')"
      >
        <a-input 
          v-bind="getFieldProps('contactPrincipal')"
          placeholder="Nom du responsable (optionnel)"
        />
      </a-form-item>
      
      <a-form-item>
        <a-space>
          <a-button @click="handleCancel">
            Annuler
          </a-button>
          <a-button 
            type="primary" 
            html-type="submit"
            :loading="isLoading"
            :disabled="!isValid"
          >
            {{ submitButtonText }}
          </a-button>
        </a-space>
      </a-form-item>
    </a-form>
  </div>
</template>

<style scoped>
.station-form {
  max-width: 600px;
}

.station-form h3 {
  margin-bottom: 1.5rem;
  color: var(--primary-color);
}
</style>