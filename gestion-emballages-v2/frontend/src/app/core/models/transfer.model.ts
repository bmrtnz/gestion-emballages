import { Station } from './station.model';
import { Article } from './article.model';
import { User } from './user.model';

export enum TransferStatus {
  ENREGISTREE = 'Enregistrée',
  CONFIRMEE = 'Confirmée',
  REJETEE = 'Rejetée',
  TRAITEE_LOGISTIQUE = 'Traitée logistique',
  EXPEDIEE = 'Expédiée',
  RECEPTIONNEE = 'Réceptionnée',
  CLOTUREE = 'Clôturée',
  TRAITEE_COMPTABILITE = 'Traitée comptabilité',
  ARCHIVEE = 'Archivée'
}

export interface DemandeTransfertArticle {
  id: string;
  demandeTransfertId: string;
  articleId: string;
  quantiteDemandee: number;
  quantiteAccordee?: number;
  quantiteLivree?: number;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  article: Article;
}

export interface DemandeTransfert {
  id: string;
  numeroDemande: string;
  stationDemandeuseId: string;
  stationSourceId: string;
  statut: TransferStatus;
  montantTotal: number;
  createdById?: string;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  stationDemandeuse: Station;
  stationSource: Station;
  createdBy?: User;
  articles: DemandeTransfertArticle[];
}

// Request/Response interfaces
export interface CreateDemandeTransfertArticleRequest {
  articleId: string;
  quantiteDemandee: number;
  quantiteAccordee?: number;
  quantiteLivree?: number;
}

export interface CreateDemandeTransfertRequest {
  stationDemandeuseId: string;
  stationSourceId: string;
  statut?: TransferStatus;
  articles: CreateDemandeTransfertArticleRequest[];
}

export interface UpdateDemandeTransfertRequest {
  statut?: TransferStatus;
  articles?: CreateDemandeTransfertArticleRequest[];
}

export interface ApproveTransferRequest {
  articles: CreateDemandeTransfertArticleRequest[];
}

export interface TransferFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  status?: 'active' | 'inactive' | '';
  statut?: TransferStatus | '';
  stationDemandeuseId?: string;
  stationSourceId?: string;
  pendingApproval?: boolean;
}

export interface PaginatedTransfersResponse {
  data: DemandeTransfert[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface TransferStatusOption {
  value: TransferStatus;
  label: string;
}

export interface TransferAnalytics {
  totalTransfers: number;
  pendingTransfers: number;
  approvedTransfers: number;
  completedTransfers: number;
  rejectedTransfers: number;
  statusDistribution: {
    [key: string]: number;
  };
}

export interface TransferWorkflow {
  currentStatus: TransferStatus;
  nextPossibleStatuses: TransferStatus[];
  canEdit: boolean;
  canApprove: boolean;
  canReject: boolean;
  canDelete: boolean;
}