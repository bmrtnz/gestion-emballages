<script setup>
import { useFormValidation, commonValidationRules } from '../../composables/useFormValidation';
import { useErrorHandler } from '../../composables/useErrorHandler';
import { useLoading } from '../../composables/useLoading';
import FormField from '../forms/FormField.vue';
import FormGroup from '../forms/FormGroup.vue';
import Select from '../ui/Select.vue';
import Button from '../ui/Button.vue';
import api from '../../api/axios';

const emit = defineEmits(['created', 'close']);

// Catégories d'articles
const categories = [
  { value: 'Barquette', label: 'Barquette' },
  { value: 'Cagette', label: 'Cagette' },
  { value: 'Plateau', label: 'Plateau' },
  { value: 'Film Plastique', label: 'Film Plastique' },
  { value: 'Autre', label: 'Autre' },
];

// Validation du formulaire
const { formData, validateForm, resetForm, getFieldProps, getFieldStatus, getFieldMessage } = useFormValidation(
  {
    codeArticle: '',
    designation: '',
    categorie: null,
  },
  {
    codeArticle: commonValidationRules.codeArticle,
    designation: [
      (value) => !value || !value.trim() ? 'Désignation requise' : null,
      (value) => value && value.length > 100 ? 'Maximum 100 caractères' : null
    ],
    categorie: [
      (value) => !value ? 'Catégorie requise' : null
    ]
  }
);

// Gestion du loading et des erreurs
const { isLoading, execute } = useLoading();
const { withErrorHandling } = useErrorHandler();

const handleSubmit = async () => {
  if (!validateForm()) {
    return;
  }

  await execute(async () => {
    await withErrorHandling(
      () => api.post('/articles', formData),
      'Erreur lors de la création de l\'article'
    );
    
    emit('created');
    resetForm();
  });
};

const handleCancel = () => {
  resetForm();
  emit('close');
};
</script>

<template>
  <FormGroup title="Nouvel Article" spacing="lg">
    <FormField
      name="codeArticle"
      label="Code Article"
      placeholder="Ex: BARQ-001"
      required
      :model-value="formData.codeArticle"
      :error="getFieldMessage('codeArticle')"
      @update:model-value="value => formData.codeArticle = value"
      @blur="() => getFieldProps('codeArticle').onBlur?.()"
    />
    
    <FormField
      name="designation"
      label="Désignation"
      placeholder="Description de l'article"
      required
      :model-value="formData.designation"
      :error="getFieldMessage('designation')"
      @update:model-value="value => formData.designation = value"
      @blur="() => getFieldProps('designation').onBlur?.()"
    />
    
    <div class="space-y-2">
      <label class="block text-sm font-medium text-gray-700">
        Catégorie <span class="text-red-500">*</span>
      </label>
      <Select
        :model-value="formData.categorie"
        :options="categories"
        placeholder="Sélectionnez une catégorie"
        :error="getFieldMessage('categorie')"
        @update:model-value="value => formData.categorie = value"
      />
    </div>
    
    <div class="flex justify-end space-x-3 pt-6 border-t">
      <Button variant="secondary" @click="handleCancel">
        Annuler
      </Button>
      <Button 
        variant="primary" 
        @click="handleSubmit" 
        :loading="isLoading"
      >
        Créer
      </Button>
    </div>
  </FormGroup>
</template>