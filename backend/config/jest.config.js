// backend/config/jest.config.js
module.exports = {
  // Définit les répertoires racines où Jest doit rechercher les fichiers de test.
  // <rootDir> est le répertoire du fichier de config (c-à-d /config), donc nous remontons d'un niveau.
  roots: ['<rootDir>/../'], 
  testEnvironment: 'node',
  // Removed setupFilesAfterEnv since we only have unit tests with mocked models
  testTimeout: 5000, // Reduced timeout since we no longer need mongodb-memory-server startup time
};
