// frontend/src/composables/useFormValidation.js
import { ref, reactive, computed } from 'vue';

/**
 * Composable pour la gestion de validation de formulaires
 * @param {Object} initialData - Données initiales du formulaire
 * @param {Object} validationRules - Règles de validation
 * @returns {Object} État du formulaire et méthodes de validation
 */
export function useFormValidation(initialData = {}, validationRules = {}) {
  const formData = reactive({ ...initialData });
  const errors = ref({});
  const touched = ref({});

  // Règles de validation communes
  const validators = {
    required: (value, message = 'Ce champ est requis') => {
      if (!value || (typeof value === 'string' && !value.trim())) {
        return message;
      }
      return null;
    },

    email: (value, message = 'Format d\'email invalide') => {
      if (!value) return null;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value) ? null : message;
    },

    minLength: (min, message) => (value) => {
      if (!value) return null;
      return value.length >= min ? null : message || `Minimum ${min} caractères requis`;
    },

    maxLength: (max, message) => (value) => {
      if (!value) return null;
      return value.length <= max ? null : message || `Maximum ${max} caractères autorisés`;
    },

    pattern: (regex, message = 'Format invalide') => (value) => {
      if (!value) return null;
      return regex.test(value) ? null : message;
    },

    numeric: (value, message = 'Valeur numérique requise') => {
      if (!value && value !== 0) return null;
      return !isNaN(value) && isFinite(value) ? null : message;
    },

    positive: (value, message = 'Valeur positive requise') => {
      if (!value && value !== 0) return null;
      return Number(value) >= 0 ? null : message;
    },

    range: (min, max, message) => (value) => {
      if (!value && value !== 0) return null;
      const num = Number(value);
      return (num >= min && num <= max) ? null : message || `Valeur entre ${min} et ${max} requise`;
    }
  };

  // Valide un champ spécifique
  const validateField = (fieldName) => {
    const rules = validationRules[fieldName];
    if (!rules) return;

    const value = formData[fieldName];
    let error = null;

    // Exécute les règles de validation
    for (const rule of rules) {
      if (typeof rule === 'function') {
        error = rule(value);
      } else if (typeof rule === 'object' && rule.validator) {
        error = rule.validator(value);
      }
      
      if (error) break;
    }

    if (error) {
      errors.value[fieldName] = error;
    } else {
      delete errors.value[fieldName];
    }

    return !error;
  };

  // Valide tous les champs
  const validateForm = () => {
    let isValid = true;
    
    Object.keys(validationRules).forEach(fieldName => {
      if (!validateField(fieldName)) {
        isValid = false;
      }
    });

    return isValid;
  };

  // Marque un champ comme touché
  const touchField = (fieldName) => {
    touched.value[fieldName] = true;
  };

  // Remet à zéro le formulaire
  const resetForm = () => {
    Object.assign(formData, initialData);
    errors.value = {};
    touched.value = {};
  };

  // Remet à zéro les erreurs
  const clearErrors = () => {
    errors.value = {};
  };

  // État calculé
  const isValid = computed(() => Object.keys(errors.value).length === 0);
  const hasErrors = computed(() => Object.keys(errors.value).length > 0);

  // Utilitaires pour Ant Design Vue
  const getFieldProps = (fieldName) => ({
    value: formData[fieldName],
    'onUpdate:value': (value) => {
      formData[fieldName] = value;
      if (touched.value[fieldName]) {
        validateField(fieldName);
      }
    },
    onBlur: () => {
      touchField(fieldName);
      validateField(fieldName);
    }
  });

  const getFieldStatus = (fieldName) => {
    if (errors.value[fieldName]) return 'error';
    if (touched.value[fieldName] && !errors.value[fieldName]) return 'success';
    return '';
  };

  const getFieldMessage = (fieldName) => errors.value[fieldName] || '';

  return {
    // État
    formData,
    errors: computed(() => errors.value),
    touched: computed(() => touched.value),
    isValid,
    hasErrors,

    // Méthodes
    validateField,
    validateForm,
    touchField,
    resetForm,
    clearErrors,

    // Utilitaires
    validators,
    getFieldProps,
    getFieldStatus,
    getFieldMessage
  };
}

/**
 * Validators standalone pour les règles communes
 */
const validators = {
  required: (value, message = 'Ce champ est requis') => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return message;
    }
    return null;
  },

  email: (value, message = 'Format d\'email invalide') => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? null : message;
  },

  minLength: (min, message) => (value) => {
    if (!value) return null;
    return value.length >= min ? null : message || `Minimum ${min} caractères requis`;
  },

  maxLength: (max, message) => (value) => {
    if (!value) return null;
    return value.length <= max ? null : message || `Maximum ${max} caractères autorisés`;
  },

  pattern: (regex, message = 'Format invalide') => (value) => {
    if (!value) return null;
    return regex.test(value) ? null : message;
  },

  numeric: (value, message = 'Valeur numérique requise') => {
    if (!value && value !== 0) return null;
    return !isNaN(value) && isFinite(value) ? null : message;
  },

  positive: (value, message = 'Valeur positive requise') => {
    if (!value && value !== 0) return null;
    return Number(value) >= 0 ? null : message;
  },

  range: (min, max, message) => (value) => {
    if (!value && value !== 0) return null;
    const num = Number(value);
    return (num >= min && num <= max) ? null : message || `Valeur entre ${min} et ${max} requise`;
  }
};

/**
 * Règles de validation prédéfinies pour les champs communs
 */
export const commonValidationRules = {
  email: [
    (value) => validators.required(value),
    (value) => validators.email(value)
  ],
  
  password: [
    (value) => validators.required(value, 'Mot de passe requis'),
    (value) => validators.minLength(6, 'Minimum 6 caractères')(value)
  ],
  
  confirmPassword: (passwordField) => [
    (value) => validators.required(value, 'Confirmation requise'),
    (value) => value === passwordField ? null : 'Les mots de passe ne correspondent pas'
  ],
  
  codeArticle: [
    (value) => validators.required(value, 'Code article requis'),
    (value) => validators.pattern(/^[A-Z0-9-]+$/, 'Format: lettres majuscules, chiffres et tirets uniquement')(value)
  ],
  
  prix: [
    (value) => validators.required(value, 'Prix requis'),
    (value) => validators.numeric(value),
    (value) => validators.positive(value)
  ],
  
  quantite: [
    (value) => validators.required(value, 'Quantité requise'),
    (value) => validators.numeric(value),
    (value) => validators.positive(value)
  ]
};

// Export validators for direct use
export { validators };