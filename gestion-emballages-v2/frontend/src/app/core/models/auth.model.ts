import { User } from './user.model';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface TokenPayload {
  sub: string;
  email: string;
  role: string;
  entityType?: string;
  entityId?: string;
  iat: number;
  exp: number;
}