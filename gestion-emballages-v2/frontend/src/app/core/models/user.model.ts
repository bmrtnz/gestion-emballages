export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  HANDLER = 'HANDLER', 
  STATION = 'STATION',
  SUPPLIER = 'SUPPLIER'
}

export enum EntityType {
  STATION = 'STATION',
  SUPPLIER = 'SUPPLIER'
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  entityType?: EntityType;
  entityId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Virtual properties
  isAdmin: boolean;
  isManager: boolean;
  isHandler: boolean;
  isStation: boolean;
  isSupplier: boolean;

  // Relations
  station?: {
    id: string;
    name: string;
    internalIdentifier?: string;
  };
  supplier?: {
    id: string;
    name: string;
    siret?: string;
    type?: string;
  };
}

export interface CreateUserRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  entityType?: EntityType;
  entityId?: string;
}

export interface UpdateUserRequest {
  email?: string;
  fullName?: string;
  phone?: string;
  role?: UserRole;
  entityType?: EntityType;
  entityId?: string;
}