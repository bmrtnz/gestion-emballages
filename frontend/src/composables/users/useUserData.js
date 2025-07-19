import { ref, computed } from 'vue';
import { useLoading } from '../useLoading';
import { useErrorHandler } from '../useErrorHandler';
import { useNotification } from '../useNotification';
import api from '../../api/axios';

export function useUserData() {
  // Data state
  const users = ref([]);
  const selectedUser = ref(null);
  
  // Pagination state
  const currentPage = ref(1);
  const totalPages = ref(0);
  const totalItems = ref(0);
  const itemsPerPage = ref(10);
  const hasNextPage = ref(false);
  const hasPrevPage = ref(false);
  const pagination = ref(null);

  // Composables
  const { isLoading, execute } = useLoading();
  const { withErrorHandling } = useErrorHandler();
  const { success, error: notifyError } = useNotification();

  // Computed properties
  const paginationInfo = computed(() => {
    if (!pagination.value || !totalItems.value) {
      return { start: 0, end: 0, total: 0 };
    }
    
    const start = Math.max(1, (currentPage.value - 1) * itemsPerPage.value + 1);
    const end = Math.min(
      currentPage.value * itemsPerPage.value,
      totalItems.value
    );
    
    return {
      start: start || 0,
      end: end || 0,
      total: totalItems.value || 0
    };
  });

  // API methods
  const fetchUsers = async (params = {}) => {
    await execute(async () => {
      const searchParams = {
        page: currentPage.value,
        limit: itemsPerPage.value,
        sortBy: 'nomComplet',
        sortOrder: 'asc',
        ...params
      };

      const response = await withErrorHandling(
        () => api.get('/users', { params: searchParams }),
        'Erreur lors du chargement des utilisateurs'
      );

      if (response && response.data) {
        users.value = response.data.data || [];
        pagination.value = response.data.pagination || null;
        
        // Debug logging
        console.log('API Response:', response.data);
        console.log('Pagination:', pagination.value);
        
        if (pagination.value) {
          currentPage.value = pagination.value.currentPage || 1;
          totalPages.value = pagination.value.totalPages || 1;
          totalItems.value = pagination.value.totalCount || pagination.value.totalItems || 0;
          hasNextPage.value = pagination.value.hasNextPage || false;
          hasPrevPage.value = pagination.value.hasPreviousPage || pagination.value.hasPrevPage || false;
        } else {
          // Fallback if no pagination object
          totalItems.value = users.value.length;
          totalPages.value = 1;
          currentPage.value = 1;
          hasNextPage.value = false;
          hasPrevPage.value = false;
        }
        
        console.log('Updated state:', {
          currentPage: currentPage.value,
          totalPages: totalPages.value,
          totalItems: totalItems.value,
          itemsPerPage: itemsPerPage.value
        });
      }
    });
  };

  const createUser = async (userData) => {
    return await execute(async () => {
      const response = await withErrorHandling(
        () => api.post('/users', userData),
        'Erreur lors de la création de l\'utilisateur'
      );
      
      success('Utilisateur créé avec succès');
      await fetchUsers();
      return response.data;
    });
  };

  const updateUser = async (userId, userData) => {
    return await execute(async () => {
      const response = await withErrorHandling(
        () => api.put(`/users/${userId}`, userData),
        'Erreur lors de la mise à jour de l\'utilisateur'
      );
      
      success('Utilisateur mis à jour avec succès');
      await fetchUsers();
      return response.data;
    });
  };

  const deactivateUser = async (userId) => {
    await execute(async () => {
      await withErrorHandling(
        () => api.patch(`/users/${userId}/deactivate`),
        'Erreur lors de la désactivation de l\'utilisateur'
      );
      
      success('Utilisateur désactivé avec succès');
      await fetchUsers();
    });
  };

  const reactivateUser = async (userId) => {
    await execute(async () => {
      await withErrorHandling(
        () => api.patch(`/users/${userId}/reactivate`),
        'Erreur lors de la réactivation de l\'utilisateur'
      );
      
      success('Utilisateur réactivé avec succès');
      await fetchUsers();
    });
  };

  // Pagination methods
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
      currentPage.value = page;
      fetchUsers();
    }
  };

  const goToPrevPage = () => {
    if (hasPrevPage.value) {
      goToPage(currentPage.value - 1);
    }
  };

  const goToNextPage = () => {
    if (hasNextPage.value) {
      goToPage(currentPage.value + 1);
    }
  };

  const goToFirstPage = () => {
    goToPage(1);
  };

  const goToLastPage = () => {
    goToPage(totalPages.value);
  };

  const changePageSize = (newSize) => {
    itemsPerPage.value = parseInt(newSize);
    currentPage.value = 1;
    fetchUsers();
  };

  const resetPagination = () => {
    currentPage.value = 1;
  };

  // Selection methods
  const selectUser = (user) => {
    selectedUser.value = user;
  };

  const clearSelection = () => {
    selectedUser.value = null;
  };

  return {
    // Data
    users,
    selectedUser,
    isLoading,
    
    // Pagination
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    hasNextPage,
    hasPrevPage,
    paginationInfo,
    
    // Methods
    fetchUsers,
    createUser,
    updateUser,
    deactivateUser,
    reactivateUser,
    goToPage,
    goToPrevPage,
    goToNextPage,
    goToFirstPage,
    goToLastPage,
    changePageSize,
    resetPagination,
    selectUser,
    clearSelection
  };
}