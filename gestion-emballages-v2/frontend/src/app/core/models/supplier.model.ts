export interface Supplier {
  id: string;
  name: string;
  siret?: string;
  type?: string;
  specialties: string[];
  sites: SupplierSite[];
  contacts?: SupplierContact[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdById?: string;
  updatedById?: string;
}

export interface SupplierSite {
  id: string;
  supplierId: string;
  name: string;
  address: {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
  isPrincipal: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SupplierContact {
  id: string;
  supplierId: string;
  fullName: string;
  position?: string;
  phone?: string;
  email?: string;
  isPrincipal: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSupplierRequest {
  name: string;
  siret?: string;
  type?: string;
  specialties: string[];
  sites?: Omit<SupplierSite, 'id' | 'supplierId' | 'createdAt' | 'updatedAt'>[];
  contacts?: Omit<SupplierContact, 'id' | 'supplierId' | 'createdAt' | 'updatedAt'>[];
}

export interface UpdateSupplierRequest extends Partial<CreateSupplierRequest> {}

export interface SupplierFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  status?: 'active' | 'inactive' | '';
  specialty?: string;
}

export interface PaginatedSuppliersResponse {
  data: Supplier[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}