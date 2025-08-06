import { Station } from './station.model';
import { Fournisseur } from './fournisseur.model';
import { Article } from './article.model';
import { User } from './user.model';

export enum OrderStatus {
  ENREGISTREE = 'Enregistrée',
  CONFIRMEE = 'Confirmée',
  EXPEDIEE = 'Expédiée',
  RECEPTIONNEE = 'Réceptionnée',
  CLOTUREE = 'Clôturée',
  FACTUREE = 'Facturée',
  ARCHIVEE = 'Archivée'
}

export interface CommandeArticle {
  id: string;
  commandeId: string;
  articleId: string;
  articleFournisseurId: string;
  quantiteCommandee: number;
  prixUnitaire: number;
  uniteConditionnement?: string;
  quantiteParConditionnement?: number;
  referenceFournisseur?: string;
  dateSouhaitee_livraison?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  article: Article;
  articleFournisseur: {
    id: string;
    referenceFournisseur?: string;
    prixUnitaire: number;
    uniteConditionnement?: string;
    quantiteParConditionnement?: number;
    delaiIndicatifApprovisionnement?: number;
    imageUrl?: string;
    fournisseur: Fournisseur;
  };
}

export interface Commande {
  id: string;
  numeroCommande: string;
  commandeGlobaleId?: string;
  stationId: string;
  fournisseurId: string;
  statut: OrderStatus;
  montantTotalHt: number;
  dateLivraisonPrevue?: Date;
  dateLivraisonReelle?: Date;
  createdById?: string;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  commandeGlobale?: CommandeGlobale;
  station: Station;
  fournisseur: Fournisseur;
  createdBy?: User;
  commandeArticles: CommandeArticle[];
}

export interface CommandeGlobale {
  id: string;
  referenceGlobale: string;
  stationId: string;
  statutGeneral: OrderStatus;
  montantTotalHt: number;
  createdById?: string;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  station: Station;
  createdBy?: User;
  commandes: Commande[];
}

// Request/Response interfaces
export interface CreateCommandeArticleRequest {
  articleId: string;
  articleFournisseurId: string;
  quantiteCommandee: number;
  prixUnitaire: number;
  uniteConditionnement?: string;
  quantiteParConditionnement?: number;
  referenceFournisseur?: string;
  dateSouhaitee_livraison?: string;
}

export interface CreateCommandeRequest {
  commandeGlobaleId?: string;
  stationId: string;
  fournisseurId: string;
  statut?: OrderStatus;
  dateLivraisonPrevue?: string;
  commandeArticles: CreateCommandeArticleRequest[];
}

export interface UpdateCommandeRequest {
  statut?: OrderStatus;
  dateLivraisonPrevue?: string;
  dateLivraisonReelle?: string;
  commandeArticles?: CreateCommandeArticleRequest[];
}

export interface CreateCommandeGlobaleRequest {
  stationId: string;
  statutGeneral?: OrderStatus;
  commandes: Omit<CreateCommandeRequest, 'stationId'>[];
}

export interface UpdateCommandeGlobaleRequest {
  statutGeneral?: OrderStatus;
}

export interface CommandeFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  status?: 'active' | 'inactive' | '';
  statut?: OrderStatus | '';
  stationId?: string;
  fournisseurId?: string;
}

export interface PaginatedCommandesResponse {
  data: Commande[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedCommandesGlobalesResponse {
  data: CommandeGlobale[];
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