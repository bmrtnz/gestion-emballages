export enum UserRole {
  MANAGER = 'Manager',
  GESTIONNAIRE = 'Gestionnaire', 
  STATION = 'Station',
  FOURNISSEUR = 'Fournisseur'
}

export enum EntityType {
  STATION = 'Station',
  FOURNISSEUR = 'Fournisseur'
}

export interface User {
  id: string;
  email: string;
  nomComplet: string;
  role: UserRole;
  entiteType?: EntityType;
  entiteId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Virtual properties
  isManager: boolean;
  isGestionnaire: boolean;
  isStation: boolean;
  isFournisseur: boolean;

  // Relations
  station?: {
    id: string;
    nom: string;
    identifiantInterne?: string;
  };
  fournisseur?: {
    id: string;
    nom: string;
    siret?: string;
    type?: string;
  };
}

export interface CreateUserRequest {
  email: string;
  password: string;
  nomComplet: string;
  role: UserRole;
  entiteType?: EntityType;
  entiteId?: string;
}

export interface UpdateUserRequest {
  email?: string;
  nomComplet?: string;
  role?: UserRole;
  entiteType?: EntityType;
  entiteId?: string;
}