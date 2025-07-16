// frontend/src/composables/useNotification.js
import { ref, reactive } from 'vue';

// Global notification state
const notifications = ref([]);
let notificationId = 0;

/**
 * Composable pour les notifications modernes
 */
export function useNotification() {
  const addNotification = (notification) => {
    // Don't add notifications on mobile devices
    if (window.innerWidth < 1024) {
      return null;
    }

    const id = ++notificationId;
    const newNotification = {
      id,
      type: 'info',
      duration: 4000,
      ...notification,
    };

    notifications.value.push(newNotification);

    // Auto-remove notification
    if (newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  };

  const removeNotification = (id) => {
    const index = notifications.value.findIndex(n => n.id === id);
    if (index > -1) {
      notifications.value.splice(index, 1);
    }
  };

  const success = (message, options = {}) => {
    return addNotification({
      type: 'success',
      title: 'Succès',
      message,
      ...options
    });
  };

  const error = (message, options = {}) => {
    return addNotification({
      type: 'error',
      title: 'Erreur',
      message,
      duration: 6000, // Longer duration for errors
      ...options
    });
  };

  const warning = (message, options = {}) => {
    return addNotification({
      type: 'warning',
      title: 'Attention',
      message,
      ...options
    });
  };

  const info = (message, options = {}) => {
    return addNotification({
      type: 'info',
      title: 'Information',
      message,
      ...options
    });
  };

  const clear = () => {
    notifications.value = [];
  };

  return {
    notifications,
    success,
    error,
    warning,
    info,
    addNotification,
    removeNotification,
    clear
  };
}

// Global notification instance for easy access
export const notification = {
  success: (message, options) => useNotification().success(message, options),
  error: (message, options) => useNotification().error(message, options),
  warning: (message, options) => useNotification().warning(message, options),
  info: (message, options) => useNotification().info(message, options),
};