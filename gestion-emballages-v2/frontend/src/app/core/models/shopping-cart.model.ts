import { Station } from './station.model';
import { Product } from './product.model';
import { Supplier } from './supplier.model';
import { User } from './user.model';

export interface ShoppingCartItem {
  id: string;
  listeAchatId: string; // shopping_cart_id in backend  
  articleId: string; // product_id in backend
  supplierId: string; // supplier_id in backend
  quantite: number; // quantity
  dateSouhaitee_livraison?: Date; // desired_delivery_date
  createdAt: Date;
  updatedAt: Date;

  // Relations
  product: Product;
  supplier: Supplier;
}

export interface ShoppingCart {
  id: string;
  stationId: string;
  status: 'active' | 'archived';
  createdById?: string;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  station: Station;
  createdBy?: User;
  items: ShoppingCartItem[];
}

// Request/Response interfaces
export interface CreateShoppingCartItemRequest {
  productId: string; // Changed from articleId
  supplierId: string; // Changed from fournisseurId
  quantity: number; // Changed from quantite
  desiredDeliveryDate?: string; // Changed from dateSouhaitee_livraison
}

export interface CreateShoppingCartRequest {
  stationId: string;
  status?: string;
  items?: CreateShoppingCartItemRequest[];
}

export interface UpdateShoppingCartItemRequest extends CreateShoppingCartItemRequest {
  id?: string;
}

export interface UpdateShoppingCartRequest {
  status?: string;
  items?: UpdateShoppingCartItemRequest[];
}

export interface AddItemToCartRequest {
  productId: string; // Changed from articleId
  supplierId: string; // Changed from fournisseurId
  quantity?: number; // Changed from quantite
  desiredDeliveryDate?: string; // Changed from dateSouhaitee_livraison
}

export interface ValidateShoppingCartRequest {
  notes?: string;
}

export interface ShoppingCartFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  status?: 'active' | 'inactive' | '';
  stationId?: string;
}

export interface PaginatedShoppingCartsResponse {
  data: ShoppingCart[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ShoppingCartAnalytics {
  totalCarts: number; // Changed from totalListes
  activeCarts: number; // Changed from activeListes
  archivedCarts: number; // Changed from archivedListes
  totalItems: number;
  averageItemsPerCart: number; // Changed from averageItemsPerListe
}

// UI helpers
export interface ShoppingCartGroupedBySupplier {
  supplier: Supplier; // Changed from fournisseur
  items: ShoppingCartItem[];
  totalQuantity: number;
}

export interface CartItem {
  productId: string; // Changed from articleId
  supplierId: string; // Changed from fournisseurId
  quantity: number; // Changed from quantite
  desiredDeliveryDate?: Date; // Changed from dateSouhaitee_livraison
  product?: Product; // Changed from article
  supplier?: Supplier; // Changed from fournisseur
}