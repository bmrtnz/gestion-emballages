export interface SalesOrderProduct {
  id: string;
  salesOrderId: string;
  productId: string;
  lineNumber: number;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  discountAmount: number;
  lineTotal: number;
  taxRate: number;
  taxAmount: number;
  lineTotalWithTax: number;
  
  // Stock information
  stockLocation?: string;
  batchNumber?: string;
  expiryDate?: string;
  
  // Fulfillment status
  quantityShipped: number;
  quantityDelivered: number;
  fulfillmentStatus: 'PENDING' | 'PICKED' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  notes?: string;
  
  // Audit fields
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  
  // Relations
  product?: any; // Product interface
}

export interface SalesOrder {
  id: string;
  soNumber: string;
  sellerName: string;
  
  // Customer information
  customerStationId: string;
  customerPoNumber: string;
  
  // Fulfillment information
  fulfillmentPlatformId: string;
  deliveryAddress: string;
  
  // Order details
  status: string; // OrderStatus enum value
  subtotalAmount: number;
  platformFees: number;
  totalAmountExcludingTax: number;
  taxAmount: number;
  totalAmountIncludingTax: number;
  currency: string;
  
  // Dates
  orderDate: string;
  promisedDeliveryDate?: string;
  actualShipDate?: string;
  actualDeliveryDate?: string;
  
  // Invoice information
  invoiceNumber?: string;
  invoiceDate?: string;
  invoiceStatus?: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  paymentDueDate?: string;
  paymentReceivedDate?: string;
  
  // Fulfillment tracking
  pickingListNumber?: string;
  shippingTrackingNumber?: string;
  carrierName?: string;
  
  // Additional information
  notes?: string;
  paymentTerms?: string;
  
  // Audit fields
  createdAt: string;
  updatedAt: string;
  createdById?: string;
  fulfilledById?: string;
  fulfilledAt?: string;
  isActive: boolean;
  
  // Relations
  customerStation?: any; // Station interface
  fulfillmentPlatform?: any; // Platform interface
  linkedPurchaseOrder?: any; // PurchaseOrder interface
  salesOrderProducts: SalesOrderProduct[];
}

export interface CreateSalesOrderDto {
  soNumber?: string;
  customerStationId: string;
  customerPoNumber: string;
  fulfillmentPlatformId: string;
  deliveryAddress: string;
  orderDate?: string;
  promisedDeliveryDate?: string;
  platformFees?: number;
  currency?: string;
  notes?: string;
  paymentTerms?: string;
  carrierName?: string;
  salesOrderProducts: CreateSalesOrderProductDto[];
}

export interface CreateSalesOrderProductDto {
  productId: string;
  lineNumber: number;
  quantity: number;
  unitPrice: number;
  discountPercent?: number;
  discountAmount?: number;
  taxRate?: number;
  stockLocation?: string;
  batchNumber?: string;
  expiryDate?: string;
  notes?: string;
}

export interface UpdateSalesOrderDto extends Partial<CreateSalesOrderDto> {
  status?: string;
  actualShipDate?: string;
  actualDeliveryDate?: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  invoiceStatus?: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  paymentDueDate?: string;
  paymentReceivedDate?: string;
  pickingListNumber?: string;
  shippingTrackingNumber?: string;
  taxAmount?: number;
  fulfilledAt?: string;
}