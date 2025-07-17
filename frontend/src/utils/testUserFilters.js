// Test utility for user filtering functionality
// This file can be used in browser console to test filtering logic

export const testUserFilters = () => {
  console.log('=== TEST DES FILTRES UTILISATEUR ===');
  
  // Mock data similar to what we expect from API
  const mockUsers = [
    { _id: '1', nomComplet: 'Thomas Decoudun', role: 'Manager', isActive: true },
    { _id: '2', nomComplet: 'Nicole Lang', role: 'Gestionnaire', isActive: true },
    { _id: '3', nomComplet: 'Germain Vidil', role: 'Station', isActive: false },
    { _id: '4', nomComplet: 'Lucas Grard', role: 'Station', isActive: true },
    { _id: '5', nomComplet: 'Laurent Dubois', role: 'Fournisseur', isActive: false },
    { _id: '6', nomComplet: 'Catherine Michel', role: 'Fournisseur', isActive: true },
    { _id: '7', nomComplet: 'Stéphane Mathieu', role: 'Fournisseur', isActive: false },
  ];
  
  // Test search functionality
  console.log('\n--- Test Recherche ---');
  const searchResults = mockUsers.filter(user => 
    user.nomComplet.toLowerCase().includes('thomas')
  );
  console.log('Recherche "thomas":', searchResults.length, 'résultats');
  
  // Test role filtering
  console.log('\n--- Test Filtrage par Rôle ---');
  const roleResults = mockUsers.filter(user => user.role === 'Fournisseur');
  console.log('Rôle "Fournisseur":', roleResults.length, 'résultats');
  
  // Test inactive filtering
  console.log('\n--- Test Utilisateurs Inactifs ---');
  const inactiveResults = mockUsers.filter(user => !user.isActive);
  console.log('Utilisateurs inactifs:', inactiveResults.length, 'résultats');
  
  // Test combined filtering
  console.log('\n--- Test Filtrage Combiné ---');
  const combinedResults = mockUsers.filter(user => 
    user.role === 'Fournisseur' && !user.isActive
  );
  console.log('Fournisseurs inactifs:', combinedResults.length, 'résultats');
  
  // Test role options generation
  console.log('\n--- Test Options de Rôle ---');
  const roles = [...new Set(mockUsers.map(u => u.role))];
  const roleOptions = [
    { value: '', label: 'Tous les rôles' },
    ...roles.map(role => ({ value: role, label: role }))
  ];
  console.log('Options de rôle:', roleOptions);
  
  console.log('\n✅ Tous les tests terminés !');
  
  return {
    mockUsers,
    searchResults,
    roleResults,
    inactiveResults,
    combinedResults,
    roleOptions
  };
};

// Usage in browser console:
// import { testUserFilters } from '/src/utils/testUserFilters.js';
// testUserFilters();