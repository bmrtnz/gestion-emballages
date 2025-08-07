export interface Platform {
  id: string;
  nom: string;
  siret?: string;
  type?: string;
  specialites: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdById?: string;
  updatedById?: string;
  sites?: PlatformSite[];
}

export interface PlatformSite {
  id: string;
  nom: string;
  adresse?: string;
  ville?: string;
  codePostal?: string;
  telephone?: string;
  email?: string;
  isPrincipal: boolean;
  isActive: boolean;
  platformId: string;
  createdAt: string;
  updatedAt: string;
  platform?: Platform;
  stocks?: StockPlatform[];
}

export interface StockPlatform {
  id: string;
  platformId: string;
  articleId: string;
  platformSiteId?: string;
  quantite: number;
  stockMinimum?: number;
  stockMaximum?: number;
  isPointInTime: boolean;
  snapshotDate?: string;
  updatedById?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlatformDto {
  nom: string;
  siret?: string;
  type?: string;
  specialites?: string[];
  isActive?: boolean;
}

export interface UpdatePlatformDto extends Partial<CreatePlatformDto> {}

export interface CreatePlatformSiteDto {
  nom: string;
  adresse?: string;
  ville?: string;
  codePostal?: string;
  telephone?: string;
  email?: string;
  isPrincipal?: boolean;
  isActive?: boolean;
}