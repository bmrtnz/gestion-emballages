export interface Platform {
  id: string;
  name: string;
  type?: string;
  specialties: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdById?: string;
  updatedById?: string;
}

export interface CreatePlatformDto {
  name: string;
  type?: string;
  specialties?: string[];
  isActive?: boolean;
}

export interface UpdatePlatformDto extends Partial<CreatePlatformDto> {}