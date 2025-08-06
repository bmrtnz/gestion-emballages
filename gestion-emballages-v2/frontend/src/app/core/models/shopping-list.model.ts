import { Station } from './station.model';
import { Article } from './article.model';
import { Fournisseur } from './fournisseur.model';
import { User } from './user.model';

export interface ListeAchatItem {
  id: string;
  listeAchatId: string;
  articleId: string;
  fournisseurId: string;
  quantite: number;
  dateSouhaitee_livraison?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  article: Article;
  fournisseur: Fournisseur;
}

export interface ListeAchat {
  id: string;
  stationId: string;
  statut: 'active' | 'archived';
  createdById?: string;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  station: Station;
  createdBy?: User;
  items: ListeAchatItem[];
}

// Request/Response interfaces
export interface CreateListeAchatItemRequest {
  articleId: string;
  fournisseurId: string;
  quantite: number;
  dateSouhaitee_livraison?: string;
}

export interface CreateListeAchatRequest {
  stationId: string;
  statut?: string;
  items?: CreateListeAchatItemRequest[];
}

export interface UpdateListeAchatItemRequest extends CreateListeAchatItemRequest {
  id?: string;
}

export interface UpdateListeAchatRequest {
  statut?: string;
  items?: UpdateListeAchatItemRequest[];
}

export interface AddItemToListeRequest {
  articleId: string;
  fournisseurId: string;
  quantite?: number;
  dateSouhaitee_livraison?: string;
}

export interface ValidateListeAchatRequest {
  notes?: string;
}

export interface ShoppingListFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  status?: 'active' | 'inactive' | '';
  stationId?: string;
}

export interface PaginatedShoppingListsResponse {
  data: ListeAchat[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ShoppingListAnalytics {
  totalListes: number;
  activeListes: number;
  archivedListes: number;
  totalItems: number;
  averageItemsPerListe: number;
}

// UI helpers
export interface ShoppingListGroupedBySupplier {
  fournisseur: Fournisseur;
  items: ListeAchatItem[];
  totalQuantity: number;
}

export interface ShoppingCartItem {
  articleId: string;
  fournisseurId: string;
  quantite: number;
  dateSouhaitee_livraison?: Date;
  article?: Article;
  fournisseur?: Fournisseur;
}