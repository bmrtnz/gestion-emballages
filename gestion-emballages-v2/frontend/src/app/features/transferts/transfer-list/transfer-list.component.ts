import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { TransferService } from '@core/services/transfer.service';
import { AuthService } from '@core/services/auth.service';
import {
  DemandeTransfert,
  TransferFilters,
  TransferStatus,
  TransferAnalytics
} from '@core/models/transfer.model';

import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';
import { StatsCardsComponent } from '@shared/components/stats-cards/stats-cards.component';

@Component({
  selector: 'app-transfer-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LoadingSpinnerComponent,
    PaginationComponent,
    ConfirmDialogComponent,
    StatsCardsComponent
  ],
  templateUrl: './transfer-list.component.html',
  styleUrls: ['./transfer-list.component.scss']
})
export class TransferListComponent implements OnInit {
  // Signals
  transfers = signal<DemandeTransfert[]>([]);
  analytics = signal<TransferAnalytics | null>(null);
  loading = signal(false);
  searchLoading = signal(false);
  error = signal<string | null>(null);

  // Pagination
  currentPage = signal(1);
  totalPages = signal(0);
  totalItems = signal(0);
  itemsPerPage = signal(10);
  hasNextPage = signal(false);
  hasPreviousPage = signal(false);

  // Filters
  showFilters = signal(false);
  searchTerm = signal('');
  statusFilter = signal<string>('');
  statutFilter = signal<TransferStatus | ''>('');
  
  // Form
  filterForm: FormGroup;
  searchTimeout: any;

  // UI state
  selectedTransfer = signal<DemandeTransfert | null>(null);
  showDeleteDialog = signal(false);

  // User info
  currentUser = computed(() => this.authService.currentUser());
  userRole = computed(() => this.currentUser()?.role || '');
  isManager = computed(() => this.userRole() === 'Manager');
  isGestionnaire = computed(() => this.userRole() === 'Gestionnaire');
  isStation = computed(() => this.userRole() === 'Station');

  // Status options
  statusOptions = [
    { value: '', label: 'Tout' },
    { value: 'active', label: 'Actif' },
    { value: 'inactive', label: 'Inactif' }
  ];

  statutOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: TransferStatus.ENREGISTREE, label: 'Enregistrée' },
    { value: TransferStatus.CONFIRMEE, label: 'Confirmée' },
    { value: TransferStatus.REJETEE, label: 'Rejetée' },
    { value: TransferStatus.TRAITEE_LOGISTIQUE, label: 'Traitée logistique' },
    { value: TransferStatus.EXPEDIEE, label: 'Expédiée' },
    { value: TransferStatus.RECEPTIONNEE, label: 'Réceptionnée' },
    { value: TransferStatus.CLOTUREE, label: 'Clôturée' },
    { value: TransferStatus.TRAITEE_COMPTABILITE, label: 'Traitée comptabilité' },
    { value: TransferStatus.ARCHIVEE, label: 'Archivée' }
  ];

  constructor(
    private transferService: TransferService,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      status: [''],
      statut: ['']
    });

    this.setupFormSubscriptions();
  }

  ngOnInit(): void {
    this.loadTransfers();
    this.loadAnalytics();
  }

  private setupFormSubscriptions(): void {
    // Search input with debounce
    this.filterForm.get('search')?.valueChanges.subscribe(value => {
      this.searchTerm.set(value || '');
      this.debouncedSearch();
    });

    // Other filters
    this.filterForm.get('status')?.valueChanges.subscribe(value => {
      this.statusFilter.set(value || '');
      this.loadTransfers();
    });

    this.filterForm.get('statut')?.valueChanges.subscribe(value => {
      this.statutFilter.set(value || '');
      this.loadTransfers();
    });
  }

  private debouncedSearch(): void {
    this.searchLoading.set(true);
    
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(() => {
      this.currentPage.set(1);
      this.loadTransfers();
      this.searchLoading.set(false);
    }, 300);
  }

  loadTransfers(): void {
    this.loading.set(true);
    this.error.set(null);

    const filters: TransferFilters = {
      page: this.currentPage(),
      limit: this.itemsPerPage(),
      search: this.searchTerm() || undefined,
      status: this.statusFilter() as 'active' | 'inactive' | '' || undefined,
      statut: this.statutFilter() || undefined,
      sortBy: 'createdAt',
      sortOrder: 'DESC'
    };

    // Remove empty filters
    Object.keys(filters).forEach(key => {
      const value = filters[key as keyof TransferFilters];
      if (value === undefined || value === null || value === '') {
        delete filters[key as keyof TransferFilters];
      }
    });

    this.transferService.getTransfers(filters).subscribe({
      next: (response) => {
        this.transfers.set(response.data);
        this.totalItems.set(response.total);
        this.totalPages.set(response.totalPages);
        this.hasNextPage.set(response.hasNextPage);
        this.hasPreviousPage.set(response.hasPreviousPage);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading transfers:', error);
        this.error.set('Erreur lors du chargement des demandes de transfert');
        this.loading.set(false);
      }
    });
  }

  loadAnalytics(): void {
    const stationId = this.isStation() ? this.currentUser()?.entiteId : undefined;
    
    this.transferService.getTransferAnalytics(stationId).subscribe({
      next: (analytics) => {
        this.analytics.set(analytics);
      },
      error: (error) => {
        console.error('Error loading analytics:', error);
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadTransfers();
  }

  onPageSizeChange(size: number): void {
    this.itemsPerPage.set(size);
    this.currentPage.set(1);
    this.loadTransfers();
  }

  toggleFilters(): void {
    this.showFilters.set(!this.showFilters());
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.searchTerm.set('');
    this.statusFilter.set('');
    this.statutFilter.set('');
    this.currentPage.set(1);
    this.loadTransfers();
  }

  // Transfer actions
  createTransfer(): void {
    this.router.navigate(['/transferts/create']);
  }

  viewTransfer(transfer: DemandeTransfert): void {
    this.router.navigate(['/transferts', transfer.id]);
  }

  editTransfer(transfer: DemandeTransfert): void {
    const workflow = this.transferService.getWorkflowInfo(transfer, this.userRole());
    if (workflow.canEdit) {
      this.router.navigate(['/transferts', transfer.id, 'edit']);
    }
  }

  approveTransfer(transfer: DemandeTransfert): void {
    const workflow = this.transferService.getWorkflowInfo(transfer, this.userRole());
    if (workflow.canApprove) {
      this.router.navigate(['/transferts', transfer.id, 'approve']);
    }
  }

  rejectTransfer(transfer: DemandeTransfert): void {
    const workflow = this.transferService.getWorkflowInfo(transfer, this.userRole());
    if (workflow.canReject) {
      // Show reject dialog with reason input
      this.router.navigate(['/transferts', transfer.id, 'reject']);
    }
  }

  deleteTransfer(transfer: DemandeTransfert): void {
    const workflow = this.transferService.getWorkflowInfo(transfer, this.userRole());
    if (workflow.canDelete) {
      this.selectedTransfer.set(transfer);
      this.showDeleteDialog.set(true);
    }
  }

  confirmDelete(): void {
    const transfer = this.selectedTransfer();
    if (!transfer) return;

    this.transferService.deleteTransfer(transfer.id).subscribe({
      next: () => {
        this.loadTransfers();
        this.loadAnalytics();
        this.showDeleteDialog.set(false);
        this.selectedTransfer.set(null);
      },
      error: (error) => {
        console.error('Error deleting transfer:', error);
        this.error.set('Erreur lors de la suppression de la demande de transfert');
        this.showDeleteDialog.set(false);
      }
    });
  }

  cancelDelete(): void {
    this.showDeleteDialog.set(false);
    this.selectedTransfer.set(null);
  }

  // Utility methods
  getStatusClass(status: TransferStatus): string {
    return this.transferService.getStatusClass(status);
  }

  getStatusIcon(status: TransferStatus): string {
    return this.transferService.getStatusIcon(status);
  }

  formatDate(date: Date | string): string {
    return this.transferService.formatDate(date);
  }

  formatQuantity(quantity: number): string {
    return this.transferService.formatQuantity(quantity);
  }

  getTotalQuantityRequested(transfer: DemandeTransfert): number {
    return this.transferService.calculateTotalQuantityRequested(transfer);
  }

  getTotalQuantityApproved(transfer: DemandeTransfert): number {
    return this.transferService.calculateTotalQuantityApproved(transfer);
  }

  getWorkflowInfo(transfer: DemandeTransfert) {
    return this.transferService.getWorkflowInfo(transfer, this.userRole());
  }

  // Analytics computed values
  analyticsCards = computed(() => {
    const analytics = this.analytics();
    if (!analytics) return [];

    return [
      {
        title: 'Total des demandes',
        value: analytics.totalTransfers.toString(),
        icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100'
      },
      {
        title: 'En attente',
        value: analytics.pendingTransfers.toString(),
        icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100'
      },
      {
        title: 'Approuvées',
        value: analytics.approvedTransfers.toString(),
        icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
        color: 'text-green-600',
        bgColor: 'bg-green-100'
      },
      {
        title: 'Rejetées',
        value: analytics.rejectedTransfers.toString(),
        icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
        color: 'text-red-600',
        bgColor: 'bg-red-100'
      }
    ];
  });

  // Filter count
  activeFiltersCount = computed(() => {
    let count = 0;
    if (this.searchTerm()) count++;
    if (this.statusFilter()) count++;
    if (this.statutFilter()) count++;
    return count;
  });
}