import { Station } from './station.model';
import { Supplier } from './supplier.model';
import { Product } from './product.model';
import { User } from './user.model';

/**
 * LEGACY ORDER MODELS
 * 
 * These models represent the legacy Order system.
 * New implementations should use:
 * - PurchaseOrder for orders placed by stations/Blue Whale
 * - SalesOrder for orders fulfilled by Blue Whale to stations
 * 
 * See purchase-order.model.ts and sales-order.model.ts
 */

export enum OrderStatus {
  ENREGISTREE = 'Enregistrée',
  CONFIRMEE = 'Confirmée',
  EXPEDIEE = 'Expédiée',
  RECEPTIONNEE = 'Réceptionnée',
  CLOTUREE = 'Clôturée',
  FACTUREE = 'Facturée',
  ARCHIVEE = 'Archivée'
}

export interface OrderProduct {
  id: string;
  orderId: string;
  productId: string;
  productSupplierId: string;
  orderedQuantity: number;
  unitPrice: number;
  packagingUnit?: string;
  quantityPerPackage?: number;
  supplierReference?: string;
  desiredDeliveryDate?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  product: Product;
  productSupplier: {
    id: string;
    supplierReference?: string;
    unitPrice: number;
    packagingUnit?: string;
    quantityPerPackage?: number;
    indicativeSupplyDelay?: number;
    imageUrl?: string;
    supplier: Supplier;
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  masterOrderId?: string;
  stationId: string;
  supplierId: string;
  platformId?: string;
  isPlatformDelivery: boolean;
  status: OrderStatus;
  totalAmountExcludingTax: number;
  expectedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  createdById?: string;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  masterOrder?: MasterOrder;
  station: Station;
  supplier: Supplier;
  createdBy?: User;
  orderProducts: OrderProduct[];
}

export interface MasterOrder {
  id: string;
  masterReference: string;
  stationId: string;
  generalStatus: OrderStatus;
  totalAmountExcludingTax: number;
  createdById?: string;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  station: Station;
  createdBy?: User;
  orders: Order[];
}

// Request/Response interfaces
export interface CreateOrderProductRequest {
  productId: string;
  productSupplierId: string;
  orderedQuantity: number;
  unitPrice: number;
  packagingUnit?: string;
  quantityPerPackage?: number;
  supplierReference?: string;
  desiredDeliveryDate?: string;
}

export interface CreateOrderRequest {
  masterOrderId?: string;
  stationId: string;
  supplierId: string;
  platformId?: string;
  isPlatformDelivery?: boolean;
  status?: OrderStatus;
  expectedDeliveryDate?: string;
  orderProducts: CreateOrderProductRequest[];
}

export interface UpdateOrderRequest {
  status?: OrderStatus;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  orderProducts?: CreateOrderProductRequest[];
}

export interface CreateMasterOrderRequest {
  stationId: string;
  generalStatus?: OrderStatus;
  orders: Omit<CreateOrderRequest, 'stationId'>[];
}

export interface UpdateMasterOrderRequest {
  generalStatus?: OrderStatus;
}

export interface OrderFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  status?: 'active' | 'inactive' | '';
  orderStatus?: OrderStatus | '';
  stationId?: string;
  supplierId?: string;
}

export interface PaginatedOrdersResponse {
  data: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedMasterOrdersResponse {
  data: MasterOrder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface OrderStatusOption {
  value: OrderStatus;
  label: string;
}