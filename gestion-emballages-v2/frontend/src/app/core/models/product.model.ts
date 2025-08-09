export enum ProductCategory {
  TRAY = 'Tray',
  CRATE = 'Crate', 
  PLATTER = 'Platter',
  PLASTIC_FILM = 'Plastic Film',
  CARDBOARD = 'Cardboard',
  PLASTIC_BAG = 'Plastic Bag',
  PAPER_BAG = 'Paper Bag',
  ISOTHERMAL_PACKAGING = 'Isothermal Packaging',
  LABEL = 'Label',
  OTHER = 'Other'
}

export interface ProductSupplier {
  id: string;
  productId: string;
  supplierId: string;
  supplierReference?: string;
  unitPrice: number;
  packagingUnit?: string;
  quantityPerPackage?: number;
  indicativeSupplyDelay?: number; // in working days
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  supplier?: {
    id: string;
    name: string;
    siret?: string;
    type?: string;
  };
}

export interface Product {
  id: string;
  productCode: string;
  description: string;
  category: ProductCategory;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdById?: string;
  updatedById?: string;
  productSuppliers: ProductSupplier[];
}

export interface CreateProductRequest {
  productCode: string;
  description: string;
  category: ProductCategory;
}

export interface UpdateProductRequest {
  productCode?: string;
  description?: string;
  category?: ProductCategory;
}

export interface CreateProductSupplierRequest {
  supplierId: string;
  supplierReference?: string;
  unitPrice: number;
  packagingUnit?: string;
  quantityPerPackage?: number;
  indicativeSupplyDelay?: number;
  imageUrl?: string;
}

export interface PaginatedProductsResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}