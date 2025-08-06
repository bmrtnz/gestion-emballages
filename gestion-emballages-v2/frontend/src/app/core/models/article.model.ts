export enum ArticleCategory {
  BARQUETTE = 'Barquette',
  CAGETTE = 'Cagette',
  PLATEAU = 'Plateau',
  FILM_PLASTIQUE = 'Film Plastique',
  CARTON = 'Carton',
  SAC_PLASTIQUE = 'Sac Plastique',
  SAC_PAPIER = 'Sac Papier',
  EMBALLAGE_ISOTHERME = 'Emballage Isotherme',
  ETIQUETTE = 'Etiquette',
  AUTRE = 'Autre'
}

export interface ArticleFournisseur {
  id: string;
  articleId: string;
  fournisseurId: string;
  referenceFournisseur?: string;
  prixUnitaire: number;
  uniteConditionnement?: string;
  quantiteParConditionnement?: number;
  delaiIndicatifApprovisionnement?: number; // in working days
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  fournisseur?: {
    id: string;
    nom: string;
    siret?: string;
    type?: string;
  };
}

export interface Article {
  id: string;
  codeArticle: string;
  designation: string;
  categorie: ArticleCategory;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdById?: string;
  updatedById?: string;
  articleFournisseurs: ArticleFournisseur[];
}

export interface CreateArticleRequest {
  codeArticle: string;
  designation: string;
  categorie: ArticleCategory;
}

export interface UpdateArticleRequest {
  codeArticle?: string;
  designation?: string;
  categorie?: ArticleCategory;
}

export interface CreateArticleFournisseurRequest {
  fournisseurId: string;
  referenceFournisseur?: string;
  prixUnitaire: number;
  uniteConditionnement?: string;
  quantiteParConditionnement?: number;
  delaiIndicatifApprovisionnement?: number;
  imageUrl?: string;
}

export interface PaginatedArticlesResponse {
  data: Article[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}