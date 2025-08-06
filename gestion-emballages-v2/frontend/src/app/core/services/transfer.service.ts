import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '@environments/environment';
import {
  DemandeTransfert,
  CreateDemandeTransfertRequest,
  UpdateDemandeTransfertRequest,
  ApproveTransferRequest,
  TransferFilters,
  PaginatedTransfersResponse,
  TransferStatus,
  TransferStatusOption,
  TransferAnalytics,
  TransferWorkflow
} from '../models/transfer.model';

@Injectable({
  providedIn: 'root'
})
export class TransferService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/transferts`;

  // Transfer Request Management
  getTransfers(filters?: TransferFilters): Observable<PaginatedTransfersResponse> {
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof TransferFilters];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<PaginatedTransfersResponse>(this.baseUrl, { params });
  }

  getTransfer(id: string): Observable<DemandeTransfert> {
    return this.http.get<DemandeTransfert>(`${this.baseUrl}/${id}`);
  }

  createTransfer(transfer: CreateDemandeTransfertRequest): Observable<DemandeTransfert> {
    return this.http.post<DemandeTransfert>(this.baseUrl, transfer);
  }

  updateTransfer(id: string, transfer: UpdateDemandeTransfertRequest): Observable<DemandeTransfert> {
    return this.http.patch<DemandeTransfert>(`${this.baseUrl}/${id}`, transfer);
  }

  updateTransferStatus(id: string, statut: TransferStatus): Observable<DemandeTransfert> {
    return this.http.patch<DemandeTransfert>(`${this.baseUrl}/${id}/status`, { statut });
  }

  approveTransfer(id: string, approval: ApproveTransferRequest): Observable<DemandeTransfert> {
    return this.http.patch<DemandeTransfert>(`${this.baseUrl}/${id}/approve`, approval);
  }

  rejectTransfer(id: string, reason?: string): Observable<DemandeTransfert> {
    return this.http.patch<DemandeTransfert>(`${this.baseUrl}/${id}/reject`, { reason });
  }

  deleteTransfer(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // Analytics and Reports
  getPendingApprovals(): Observable<DemandeTransfert[]> {
    return this.http.get<DemandeTransfert[]>(`${this.baseUrl}/pending-approvals`);
  }

  getTransferAnalytics(stationId?: string): Observable<TransferAnalytics> {
    let params = new HttpParams();
    if (stationId) {
      params = params.set('stationId', stationId);
    }
    return this.http.get<TransferAnalytics>(`${this.baseUrl}/analytics`, { params });
  }

  getTransferStatuses(): Observable<{ statuses: TransferStatusOption[] }> {
    return this.http.get<{ statuses: TransferStatusOption[] }>(`${this.baseUrl}/status/list`);
  }

  // Utility methods
  getStatusDisplayName(status: TransferStatus): string {
    return status;
  }

  getStatusClass(status: TransferStatus): string {
    const statusClasses = {
      [TransferStatus.ENREGISTREE]: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800',
      [TransferStatus.CONFIRMEE]: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800',
      [TransferStatus.REJETEE]: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800',
      [TransferStatus.TRAITEE_LOGISTIQUE]: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800',
      [TransferStatus.EXPEDIEE]: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800',
      [TransferStatus.RECEPTIONNEE]: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800',
      [TransferStatus.CLOTUREE]: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800',
      [TransferStatus.TRAITEE_COMPTABILITE]: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800',
      [TransferStatus.ARCHIVEE]: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800'
    };
    return statusClasses[status] || 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800';
  }

  getStatusIcon(status: TransferStatus): string {
    const statusIcons = {
      [TransferStatus.ENREGISTREE]: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      [TransferStatus.CONFIRMEE]: 'M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11',
      [TransferStatus.REJETEE]: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
      [TransferStatus.TRAITEE_LOGISTIQUE]: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4',
      [TransferStatus.EXPEDIEE]: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8',
      [TransferStatus.RECEPTIONNEE]: 'M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4',
      [TransferStatus.CLOTUREE]: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      [TransferStatus.TRAITEE_COMPTABILITE]: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z',
      [TransferStatus.ARCHIVEE]: 'M5 8h14l-1.5 7.5A2 2 0 0115.687 17H8.313a2 2 0 01-1.938-1.5L5 8zm0 0V6a2 2 0 012-2h4a2 2 0 012 2v2m6 0V6a2 2 0 00-2-2h-4a2 2 0 00-2 2v2'
    };
    return statusIcons[status] || 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z';
  }

  getWorkflowInfo(transfer: DemandeTransfert, userRole: string): TransferWorkflow {
    const currentStatus = transfer.statut;
    
    // Define status transitions based on user role and current status
    const nextPossibleStatuses = this.getNextPossibleStatuses(currentStatus, userRole);
    
    return {
      currentStatus,
      nextPossibleStatuses,
      canEdit: this.canEditTransfer(transfer, userRole),
      canApprove: this.canApproveTransfer(transfer, userRole),
      canReject: this.canRejectTransfer(transfer, userRole),
      canDelete: this.canDeleteTransfer(transfer, userRole)
    };
  }

  getNextPossibleStatuses(currentStatus: TransferStatus, userRole: string): TransferStatus[] {
    const roleBasedTransitions = {
      'Manager': {
        [TransferStatus.ENREGISTREE]: [TransferStatus.CONFIRMEE, TransferStatus.REJETEE, TransferStatus.ARCHIVEE],
        [TransferStatus.CONFIRMEE]: [TransferStatus.TRAITEE_LOGISTIQUE, TransferStatus.ARCHIVEE],
        [TransferStatus.TRAITEE_LOGISTIQUE]: [TransferStatus.EXPEDIEE, TransferStatus.ARCHIVEE],
        [TransferStatus.EXPEDIEE]: [TransferStatus.RECEPTIONNEE, TransferStatus.ARCHIVEE],
        [TransferStatus.RECEPTIONNEE]: [TransferStatus.CLOTUREE, TransferStatus.ARCHIVEE],
        [TransferStatus.CLOTUREE]: [TransferStatus.TRAITEE_COMPTABILITE, TransferStatus.ARCHIVEE],
        [TransferStatus.TRAITEE_COMPTABILITE]: [TransferStatus.ARCHIVEE]
      },
      'Gestionnaire': {
        [TransferStatus.ENREGISTREE]: [TransferStatus.CONFIRMEE, TransferStatus.REJETEE],
        [TransferStatus.CONFIRMEE]: [TransferStatus.TRAITEE_LOGISTIQUE],
        [TransferStatus.TRAITEE_LOGISTIQUE]: [TransferStatus.EXPEDIEE],
        [TransferStatus.EXPEDIEE]: [TransferStatus.RECEPTIONNEE],
        [TransferStatus.RECEPTIONNEE]: [TransferStatus.CLOTUREE],
        [TransferStatus.CLOTUREE]: [TransferStatus.TRAITEE_COMPTABILITE]
      },
      'Station': {
        [TransferStatus.ENREGISTREE]: [TransferStatus.CONFIRMEE, TransferStatus.REJETEE], // Source station can approve/reject
        [TransferStatus.EXPEDIEE]: [TransferStatus.RECEPTIONNEE], // Requesting station can confirm reception
        [TransferStatus.RECEPTIONNEE]: [TransferStatus.CLOTUREE] // Requesting station can close
      }
    };

    const transitions = roleBasedTransitions[userRole as keyof typeof roleBasedTransitions];
    return transitions?.[currentStatus] || [];
  }

  canEditTransfer(transfer: DemandeTransfert, userRole: string): boolean {
    // Only allow editing if status is still "Enregistrée"
    return transfer.statut === TransferStatus.ENREGISTREE && 
           ['Manager', 'Gestionnaire', 'Station'].includes(userRole);
  }

  canApproveTransfer(transfer: DemandeTransfert, userRole: string): boolean {
    return transfer.statut === TransferStatus.ENREGISTREE && 
           ['Manager', 'Gestionnaire', 'Station'].includes(userRole);
  }

  canRejectTransfer(transfer: DemandeTransfert, userRole: string): boolean {
    return transfer.statut === TransferStatus.ENREGISTREE && 
           ['Manager', 'Gestionnaire', 'Station'].includes(userRole);
  }

  canDeleteTransfer(transfer: DemandeTransfert, userRole: string): boolean {
    return transfer.statut === TransferStatus.ENREGISTREE && 
           ['Manager', 'Gestionnaire'].includes(userRole);
  }

  getTransferProgress(status: TransferStatus): { percentage: number; label: string } {
    const progressMapping = {
      [TransferStatus.ENREGISTREE]: { percentage: 10, label: 'Enregistrée' },
      [TransferStatus.CONFIRMEE]: { percentage: 20, label: 'Confirmée' },
      [TransferStatus.REJETEE]: { percentage: 0, label: 'Rejetée' },
      [TransferStatus.TRAITEE_LOGISTIQUE]: { percentage: 40, label: 'Logistique' },
      [TransferStatus.EXPEDIEE]: { percentage: 60, label: 'Expédiée' },
      [TransferStatus.RECEPTIONNEE]: { percentage: 80, label: 'Réceptionnée' },
      [TransferStatus.CLOTUREE]: { percentage: 90, label: 'Clôturée' },
      [TransferStatus.TRAITEE_COMPTABILITE]: { percentage: 95, label: 'Comptabilité' },
      [TransferStatus.ARCHIVEE]: { percentage: 100, label: 'Archivée' }
    };

    return progressMapping[status] || { percentage: 0, label: 'Inconnu' };
  }

  calculateTotalQuantityRequested(transfer: DemandeTransfert): number {
    return transfer.articles.reduce((total, article) => total + article.quantiteDemandee, 0);
  }

  calculateTotalQuantityApproved(transfer: DemandeTransfert): number {
    return transfer.articles.reduce((total, article) => total + (article.quantiteAccordee || 0), 0);
  }

  calculateTotalQuantityDelivered(transfer: DemandeTransfert): number {
    return transfer.articles.reduce((total, article) => total + (article.quantiteLivree || 0), 0);
  }

  getApprovalRate(transfer: DemandeTransfert): number {
    const requested = this.calculateTotalQuantityRequested(transfer);
    const approved = this.calculateTotalQuantityApproved(transfer);
    return requested > 0 ? Math.round((approved / requested) * 100) : 0;
  }

  formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(dateObj);
  }

  formatDateTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj);
  }

  formatQuantity(quantity: number): string {
    return new Intl.NumberFormat('fr-FR').format(quantity);
  }

  isTransferPending(transfer: DemandeTransfert): boolean {
    return transfer.statut === TransferStatus.ENREGISTREE;
  }

  isTransferCompleted(transfer: DemandeTransfert): boolean {
    return [
      TransferStatus.CLOTUREE,
      TransferStatus.TRAITEE_COMPTABILITE,
      TransferStatus.ARCHIVEE
    ].includes(transfer.statut);
  }

  isTransferRejected(transfer: DemandeTransfert): boolean {
    return transfer.statut === TransferStatus.REJETEE;
  }
}