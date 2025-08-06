export interface Fournisseur {
  id: string;
  nom: string;
  adresse: string;
  ville: string;
  codePostal: string;
  telephone?: string;
  email?: string;
  contact?: string;
  siret: string;
  specialites: string[];
  sites: FournisseurSite[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FournisseurSite {
  id: string;
  nom: string;
  adresse: string;
  ville: string;
  codePostal: string;
  telephone?: string;
  email?: string;
  contact?: string;
  isActive: boolean;
}

export interface CreateFournisseurRequest {
  nom: string;
  adresse: string;
  ville: string;
  codePostal: string;
  telephone?: string;
  email?: string;
  contact?: string;
  siret: string;
  specialites: string[];
  sites?: Omit<FournisseurSite, 'id'>[];
}

export interface UpdateFournisseurRequest extends Partial<CreateFournisseurRequest> {}

export interface FournisseurFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  status?: 'active' | 'inactive' | '';
  specialite?: string;
}

export interface PaginatedFournisseursResponse {
  data: Fournisseur[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}