export interface PurchaseOrderProduct {
  id: string;
  productId: string;
  productSupplierId: string;
  quantity: number;
  unitPrice: number;
  packagingUnit?: string;
  quantityPerPackage?: number;
  supplierReference?: string;
  desiredDeliveryDate?: string;
  // Relations
  product?: any; // Product interface
  productSupplier?: any; // ProductSupplier interface
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  masterOrderId?: string;
  
  // Buyer information
  buyerType: 'BLUE_WHALE' | 'STATION';
  stationId?: string;
  
  // Supplier information
  supplierId?: string;
  isInternalSupplier: boolean;
  
  // Delivery information
  deliveryLocationType: 'PLATFORM' | 'STATION' | 'OTHER';
  platformId?: string;
  deliveryStationId?: string;
  deliveryAddress?: string;
  
  // Order details
  status: string; // OrderStatus enum value
  totalAmountExcludingTax: number;
  totalAmountIncludingTax: number;
  currency: string;
  
  // Dates
  orderDate: string;
  requestedDeliveryDate?: string;
  confirmedDeliveryDate?: string;
  actualDeliveryDate?: string;
  
  // Additional information
  linkedSalesOrderId?: string;
  notes?: string;
  paymentTerms?: string;
  
  // Audit fields
  createdAt: string;
  updatedAt: string;
  createdById?: string;
  approvedById?: string;
  approvedAt?: string;
  isActive: boolean;
  
  // Relations
  station?: any; // Station interface
  supplier?: any; // Supplier interface
  platform?: any; // Platform interface
  deliveryStation?: any; // Station interface
  orderProducts: PurchaseOrderProduct[];
  linkedSalesOrder?: any; // SalesOrder interface
}

export interface CreatePurchaseOrderDto {
  poNumber?: string;
  masterOrderId?: string;
  buyerType: 'BLUE_WHALE' | 'STATION';
  stationId?: string;
  supplierId?: string;
  isInternalSupplier: boolean;
  deliveryLocationType: 'PLATFORM' | 'STATION' | 'OTHER';
  platformId?: string;
  deliveryStationId?: string;
  deliveryAddress?: string;
  orderDate?: string;
  requestedDeliveryDate?: string;
  currency?: string;
  notes?: string;
  paymentTerms?: string;
  orderProducts: CreatePurchaseOrderProductDto[];
}

export interface CreatePurchaseOrderProductDto {
  productId: string;
  productSupplierId: string;
  quantity: number;
  unitPrice: number;
  packagingUnit?: string;
  quantityPerPackage?: number;
  supplierReference?: string;
  desiredDeliveryDate?: string;
}

export interface UpdatePurchaseOrderDto extends Partial<CreatePurchaseOrderDto> {
  status?: string;
  confirmedDeliveryDate?: string;
  actualDeliveryDate?: string;
  approvedAt?: string;
}