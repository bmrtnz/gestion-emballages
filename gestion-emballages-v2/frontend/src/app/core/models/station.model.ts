export interface StationGroup {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StationContact {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  position?: string;
  isActive: boolean;
  stationId: string;
}

export interface Station {
  id: string;
  name: string;
  code?: string; // Updated field name for consistency
  address: {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
  coordinates?: {
    lat?: number;
    lng?: number;
    metadata?: {
      specialization?: string;
      productionVolume?: number;
      peakSeason?: string;
    };
  };
  stationGroupId?: string;
  stationGroup?: StationGroup; // ManyToOne relationship
  contacts?: StationContact[]; // OneToMany relationship
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdById?: string;
  updatedById?: string;
  
  // Virtual properties (computed on backend)
  principalContactFromContacts?: StationContact;
  activeContacts?: StationContact[];
  hasGroup?: boolean;
  isIndependent?: boolean;
  fullNameWithGroup?: string;
  stationType?: 'grouped' | 'independent';
}

export interface CreateStationRequest {
  name: string;
  code?: string;
  address: {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
  coordinates?: {
    lat?: number;
    lng?: number;
    metadata?: {
      specialization?: string;
      productionVolume?: number;
      peakSeason?: string;
    };
  };
  stationGroupId?: string;
  contacts?: {
    name: string;
    phone?: string;
    email?: string;
    position?: string;
  }[];
}

export interface UpdateStationRequest extends Partial<CreateStationRequest> {}

export interface CreateStationGroupRequest {
  name: string;
  description?: string;
}

export interface UpdateStationGroupRequest extends Partial<CreateStationGroupRequest> {}

export interface StationFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  status?: 'active' | 'inactive' | '';
  stationGroupId?: string;
  city?: string;
  country?: string;
  stationType?: 'grouped' | 'independent' | '';
}

export interface StationGroupFilters {
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

export interface PaginatedStationGroupsResponse {
  data: StationGroup[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface StationStatistics {
  totalStations: number;
  activeStations: number;
  inactiveStations: number;
  groupedStations: number;
  independentStations: number;
  stationsByGroup: {
    groupName: string;
    count: number;
  }[];
  stationsByCity: {
    city: string;
    count: number;
  }[];
  stationsByCountry: {
    country: string;
    count: number;
  }[];
}