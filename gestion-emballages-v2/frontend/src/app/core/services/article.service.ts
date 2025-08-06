import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '@environments/environment';
import { 
  Article, 
  CreateArticleRequest, 
  UpdateArticleRequest,
  CreateArticleFournisseurRequest,
  ArticleFournisseur,
  PaginatedArticlesResponse,
  ArticleCategory
} from '../models/article.model';

export interface ArticleFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  status?: 'active' | 'inactive' | '';
  categorie?: ArticleCategory | '';
}

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/articles`;

  // Article CRUD operations
  getArticles(filters?: ArticleFilters): Observable<PaginatedArticlesResponse> {
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof ArticleFilters];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<PaginatedArticlesResponse>(this.baseUrl, { params });
  }

  getArticle(id: string): Observable<Article> {
    return this.http.get<Article>(`${this.baseUrl}/${id}`);
  }

  createArticle(article: CreateArticleRequest): Observable<Article> {
    return this.http.post<Article>(this.baseUrl, article);
  }

  updateArticle(id: string, article: UpdateArticleRequest): Observable<Article> {
    return this.http.patch<Article>(`${this.baseUrl}/${id}`, article);
  }

  deleteArticle(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  reactivateArticle(id: string): Observable<Article> {
    return this.http.patch<Article>(`${this.baseUrl}/${id}/reactivate`, {});
  }

  // Article-Fournisseur relationship operations
  addFournisseur(articleId: string, fournisseurData: CreateArticleFournisseurRequest): Observable<ArticleFournisseur> {
    return this.http.post<ArticleFournisseur>(`${this.baseUrl}/${articleId}/fournisseurs`, fournisseurData);
  }

  updateFournisseur(
    articleId: string, 
    fournisseurInfoId: string, 
    fournisseurData: Partial<CreateArticleFournisseurRequest>
  ): Observable<ArticleFournisseur> {
    return this.http.patch<ArticleFournisseur>(
      `${this.baseUrl}/${articleId}/fournisseurs/${fournisseurInfoId}`, 
      fournisseurData
    );
  }

  removeFournisseur(articleId: string, fournisseurInfoId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${articleId}/fournisseurs/${fournisseurInfoId}`);
  }

  // Utility methods
  getCategories(): Observable<{ categories: ArticleCategory[] }> {
    return this.http.get<{ categories: ArticleCategory[] }>(`${this.baseUrl}/categories`);
  }

  searchArticles(query: string, limit?: number): Observable<Article[]> {
    let params = new HttpParams().set('q', query);
    if (limit) {
      params = params.set('limit', limit.toString());
    }
    return this.http.get<Article[]>(`${this.baseUrl}/search`, { params });
  }

  // Helper methods for display
  getCategoryDisplayName(category: ArticleCategory): string {
    return category; // Categories are already in French
  }

  formatSupplierDelay(days?: number): string {
    if (!days) return 'Non spécifié';
    return `${days} jour${days > 1 ? 's' : ''}`;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  }

  getLowestPrice(articleFournisseurs: ArticleFournisseur[]): number | null {
    if (!articleFournisseurs?.length) return null;
    return Math.min(...articleFournisseurs.map(af => af.prixUnitaire));
  }

  getHighestPrice(articleFournisseurs: ArticleFournisseur[]): number | null {
    if (!articleFournisseurs?.length) return null;
    return Math.max(...articleFournisseurs.map(af => af.prixUnitaire));
  }

  getSuppliersCount(articleFournisseurs: ArticleFournisseur[]): number {
    return articleFournisseurs?.length || 0;
  }
}