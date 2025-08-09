export interface Station {
  id: string;
  name: string;
  internalId?: string;
  address: {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
  groupId?: string;
  mainContact: {
    name?: string;
    phone?: string;
    email?: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdById?: string;
  updatedById?: string;
}

export interface CreateStationRequest {
  name: string;
  internalId?: string;
  address: {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
  groupId?: string;
  mainContact: {
    name?: string;
    phone?: string;
    email?: string;
  };
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