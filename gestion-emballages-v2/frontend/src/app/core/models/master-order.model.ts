import { Station } from './station.model';
import { User } from './user.model';
import { PurchaseOrder } from './purchase-order.model';

export enum OrderStatus {
  ENREGISTREE = 'Enregistrée',
  CONFIRMEE = 'Confirmée',
  EXPEDIEE = 'Expédiée',
  RECEPTIONNEE = 'Réceptionnée',
  CLOTUREE = 'Clôturée',
  FACTUREE = 'Facturée',
  ARCHIVEE = 'Archivée'
}

export interface MasterOrder {
  id: string;
  referenceMaster: string;
  stationId: string;
  statutGeneral: OrderStatus;
  totalAmountExcludingTax: number;
  totalAmountIncludingTax: number;
  currency: string;
  orderDate: string;
  shoppingCartId?: string;
  supplierCount: number;
  notes?: string;
  createdById?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;

  // Relations
  station: Station;
  createdBy?: User;
  purchaseOrders: PurchaseOrder[];

  // Virtual properties
  childOrdersCount: number;
  isMultiSupplierOrder: boolean;
  overallProgress: string;
  supplierList: string[];
}

export interface CreateMasterOrderDto {
  stationId: string;
  statutGeneral?: OrderStatus;
  totalAmountExcludingTax?: number;
  totalAmountIncludingTax?: number;
  currency?: string;
  orderDate?: string;
  shoppingCartId?: string;
  supplierCount?: number;
  notes?: string;
}

export interface UpdateMasterOrderDto extends Partial<CreateMasterOrderDto> {
  referenceMaster?: string;
}

export interface MasterOrderFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  status?: 'active' | 'inactive' | '';
  orderStatus?: OrderStatus | '';
  stationId?: string;
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

export interface MasterOrderStatusOption {
  value: OrderStatus;
  label: string;
}