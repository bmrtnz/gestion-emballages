export interface Station {
  id: string;
  nom: string;
  adresse: string;
  ville: string;
  codePostal: string;
  telephone?: string;
  email?: string;
  contact?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateStationRequest {
  nom: string;
  adresse: string;
  ville: string;
  codePostal: string;
  telephone?: string;
  email?: string;
  contact?: string;
}

export interface UpdateStationRequest extends Partial<CreateStationRequest> {}

export interface StationFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  status?: 'active' | 'inactive' | '';
}

export interface PaginatedStationsResponse {
  data: Station[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}