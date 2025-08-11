import { Component, inject, Input, Output, EventEmitter, signal, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { UserService } from '@core/services/user.service';
import { AuthService } from '@core/services/auth.service';
import { NotificationService } from '@core/services/notification.service';
import { StationService } from '@core/services/station.service';
import { SupplierService } from '@core/services/supplier.service';
import { ButtonComponent } from '@shared/components/ui/button.component';
import { User, UserRole, EntityType, UpdateUserRequest } from '@core/models/user.model';
import { Station } from '@core/models/station.model';
import { Supplier } from '@core/models/supplier.model';

@Component({
  selector: 'app-edit-user-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent
  ],
  template: `
    <div class="space-y-6">
      <form [formGroup]="userForm" (ngSubmit)="onSubmit()" class="space-y-6">
        
        <!-- Personal Information -->
        <div>
          <h3 class="text-lg font-medium text-gray-900 mb-4">Informations personnelles</h3>
          
          <!-- Nom complet -->
          <div class="mb-4">
            <label for="fullName" class="block text-sm font-medium text-gray-700 mb-1">
              Nom complet *
            </label>
            <input
              type="text"
              id="fullName"
              formControlName="fullName"
              placeholder="Ex: Jean Dupont"
              class="form-input"
              [class.border-red-300]="userForm.get('fullName')?.invalid && userForm.get('fullName')?.touched">
            <p *ngIf="userForm.get('fullName')?.invalid && userForm.get('fullName')?.touched" 
               class="mt-1 text-sm text-red-600">
              Le nom complet est obligatoire
            </p>
          </div>

          <!-- Email -->
          <div class="mt-4">
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              id="email"
              formControlName="email"
              class="form-input"
              [class.border-red-300]="userForm.get('email')?.invalid && userForm.get('email')?.touched">
            <p *ngIf="userForm.get('email')?.invalid && userForm.get('email')?.touched" 
               class="mt-1 text-sm text-red-600">
              <span *ngIf="userForm.get('email')?.errors?.['required']">L'email est obligatoire</span>
              <span *ngIf="userForm.get('email')?.errors?.['email']">L'email n'est pas valide</span>
            </p>
          </div>

          <!-- Phone -->
          <div class="mt-4">
            <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">
              Téléphone
            </label>
            <input
              type="tel"
              id="phone"
              formControlName="phone"
              placeholder="Ex: 01 23 45 67 89"
              class="form-input"
              [class.border-red-300]="userForm.get('phone')?.invalid && userForm.get('phone')?.touched">
            <p *ngIf="userForm.get('phone')?.invalid && userForm.get('phone')?.touched" 
               class="mt-1 text-sm text-red-600">
              Le format du téléphone n'est pas valide
            </p>
          </div>
        </div>

        <!-- Role and Entity -->
        <div>
          <h3 class="text-lg font-medium text-gray-900 mb-4">Rôle et entité</h3>
          
          <!-- Role -->
          <div class="mb-4">
            <label for="role" class="block text-sm font-medium text-gray-700 mb-1">
              Rôle *
            </label>
            <select
              id="role"
              formControlName="role"
              class="form-select"
              [class.border-red-300]="userForm.get('role')?.invalid && userForm.get('role')?.touched"
              (change)="onRoleChange()">
              <option value="">Sélectionner un rôle</option>
              <option *ngFor="let role of availableRoles" [value]="role">
                {{ userService.getRoleDisplayName(role) }}
              </option>
            </select>
            <p *ngIf="userForm.get('role')?.invalid && userForm.get('role')?.touched" 
               class="mt-1 text-sm text-red-600">
              Le rôle est obligatoire
            </p>
          </div>

          <!-- Entity Selection (for Station/Supplier roles) -->
          <div *ngIf="showEntitySelection()" class="mb-4">
            <label for="entityId" class="block text-sm font-medium text-gray-700 mb-1">
              {{ getEntityLabel() }} *
            </label>
            <select
              id="entityId"
              formControlName="entityId"
              class="form-select"
              [class.border-red-300]="userForm.get('entityId')?.invalid && userForm.get('entityId')?.touched">
              <option value="">{{ getEntitySelectPlaceholder() }}</option>
              <option *ngFor="let entity of availableEntities()" [value]="entity.id">
                {{ entity.name }}
              </option>
            </select>
            <p *ngIf="userForm.get('entityId')?.invalid && userForm.get('entityId')?.touched" 
               class="mt-1 text-sm text-red-600">
              {{ getEntityLabel() }} est obligatoire
            </p>
          </div>
        </div>

        <!-- Password Reset Section -->
        <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 class="text-lg font-medium text-gray-900 mb-3">Mot de passe</h3>
          <p class="text-sm text-gray-600 mb-4">
            Pour des raisons de sécurité, le mot de passe ne peut pas être modifié directement. 
            Vous pouvez envoyer un lien de réinitialisation à l'utilisateur.
          </p>
          <ui-button
            type="button"
            variant="outline"
            size="sm"
            [loading]="sendingResetLink()"
            [disabled]="!userForm.get('email')?.value || sendingResetLink()"
            (click)="sendPasswordResetLink()">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
            Envoyer un lien de réinitialisation
          </ui-button>
        </div>


        <!-- Form Actions -->
        <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <ui-button
            type="button"
            variant="outline"
            (click)="cancel.emit()">
            Annuler
          </ui-button>
          
          <ui-button
            type="submit"
            variant="primary"
            [loading]="loading()"
            [disabled]="userForm.invalid || loading()">
            Modifier l'utilisateur
          </ui-button>
        </div>
      </form>
    </div>
  `,
  styles: []
})
export class EditUserFormComponent implements OnInit, OnChanges {
  private fb = inject(FormBuilder);
  public userService = inject(UserService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private stationService = inject(StationService);
  private supplierService = inject(SupplierService);

  @Input() user: User | null = null;
  @Output() cancel = new EventEmitter<void>();
  @Output() userUpdated = new EventEmitter<void>();

  public loading = signal(false);
  public sendingResetLink = signal(false);
  public availableRoles: UserRole[] = [];
  public stations = signal<Station[]>([]);
  public suppliers = signal<Supplier[]>([]);
  public availableEntities = signal<(Station | Supplier)[]>([]);

  public userForm: FormGroup = this.fb.group({
    fullName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.pattern(/^[\d\s\-\+\(\)]+$/)]],
    role: ['', [Validators.required]],
    entityId: ['']
  });

  ngOnInit(): void {
    this.initializeForm();
    this.loadEntities();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] && this.user) {
      this.populateForm();
    }
  }

  private initializeForm(): void {
    const currentUserRole = this.authService.userRole();
    if (currentUserRole) {
      this.availableRoles = this.userService.getAvailableRoles(currentUserRole);
    }
  }

  private populateForm(): void {
    if (this.user) {
      this.userForm.patchValue({
        fullName: this.user.fullName,
        email: this.user.email,
        phone: this.user.phone || '',
        role: this.user.role,
        entityId: this.user.entityId || ''
      });
      
      // Trigger role change to set up entity selection
      this.onRoleChange();
    }
  }

  private async loadEntities(): Promise<void> {
    try {
      // Load active stations
      this.stationService.getActiveStations().subscribe({
        next: (activeStations) => {
          this.stations.set(activeStations);
          // Populate form after entities are loaded
          if (this.user) {
            this.populateForm();
          }
        },
        error: (error) => {
          console.error('Error loading stations:', error);
          this.notificationService.showError('Erreur lors du chargement des stations');
        }
      });
      
      // Load active suppliers
      try {
        const suppliersResponse = await this.supplierService.getSuppliers({
          status: 'active',
          limit: 1000
        });
        this.suppliers.set(suppliersResponse.data);
        // Populate form after entities are loaded
        if (this.user) {
          this.populateForm();
        }
      } catch (error) {
        console.error('Error loading suppliers:', error);
        this.notificationService.showError('Erreur lors du chargement des fournisseurs');
      }
      
    } catch (error) {
      console.error('Error loading entities:', error);
      this.notificationService.showError('Erreur lors du chargement des entités');
    }
  }

  showEntitySelection(): boolean {
    const selectedRole = this.userForm.get('role')?.value;
    return selectedRole === UserRole.STATION || selectedRole === UserRole.SUPPLIER;
  }

  getEntityLabel(): string {
    const selectedRole = this.userForm.get('role')?.value;
    return selectedRole === UserRole.STATION ? 'Station' : 'Fournisseur';
  }

  getEntitySelectPlaceholder(): string {
    const selectedRole = this.userForm.get('role')?.value;
    return selectedRole === UserRole.STATION ? 'Sélectionner une station' : 'Sélectionner un fournisseur';
  }

  onRoleChange(): void {
    const selectedRole = this.userForm.get('role')?.value;
    const entityIdControl = this.userForm.get('entityId');
    
    // Reset entity selection only if role actually changed
    const currentEntityId = entityIdControl?.value;
    
    // Update validators
    if (selectedRole === UserRole.STATION || selectedRole === UserRole.SUPPLIER) {
      entityIdControl?.setValidators([Validators.required]);
      
      // Set available entities based on role
      if (selectedRole === UserRole.STATION) {
        this.availableEntities.set(this.stations());
        // If current entity is not a station, reset it
        if (this.user && this.user.role !== UserRole.STATION) {
          entityIdControl?.setValue('');
        }
      } else if (selectedRole === UserRole.SUPPLIER) {
        this.availableEntities.set(this.suppliers());
        // If current entity is not a supplier, reset it
        if (this.user && this.user.role !== UserRole.SUPPLIER) {
          entityIdControl?.setValue('');
        }
      }
    } else {
      entityIdControl?.clearValidators();
      entityIdControl?.setValue('');
      this.availableEntities.set([]);
    }
    
    entityIdControl?.updateValueAndValidity();
  }

  async sendPasswordResetLink(): Promise<void> {
    if (!this.user?.email) {
      this.notificationService.showError('Email utilisateur introuvable');
      return;
    }

    this.sendingResetLink.set(true);

    try {
      // Call the password reset service
      this.userService.sendPasswordResetLink(this.user.email).subscribe({
        next: () => {
          this.notificationService.showSuccess(`Lien de réinitialisation envoyé à ${this.user!.email}`);
          this.sendingResetLink.set(false);
        },
        error: (error: any) => {
          console.error('Error sending password reset link:', error);
          this.notificationService.showError('Erreur lors de l\'envoi du lien de réinitialisation');
          this.sendingResetLink.set(false);
        }
      });
    } catch (error: any) {
      console.error('Error sending password reset link:', error);
      this.notificationService.showError('Erreur lors de l\'envoi du lien de réinitialisation');
      this.sendingResetLink.set(false);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.userForm.invalid || !this.user) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    try {
      const formValue = this.userForm.value;
      const userData: UpdateUserRequest = {
        fullName: formValue.fullName.trim(),
        email: formValue.email,
        phone: formValue.phone?.trim() || undefined,
        role: formValue.role,
        entityId: this.getEntityId(formValue.role, formValue.entityId),
        entityType: this.getEntityType(formValue.role) || undefined
      };

      this.userService.updateUser(this.user.id, userData).subscribe({
        next: (response) => {
          this.notificationService.showSuccess('Utilisateur modifié avec succès');
          this.userUpdated.emit();
          this.loading.set(false);
        },
        error: (error: any) => {
          console.error('Error updating user:', error);
          this.notificationService.showError(
            error?.error?.message || 'Erreur lors de la modification de l\'utilisateur'
          );
          this.loading.set(false);
        }
      });
      
    } catch (error: any) {
      console.error('Error updating user:', error);
      this.notificationService.showError('Erreur lors de la modification de l\'utilisateur');
      this.loading.set(false);
    }
  }

  private getEntityId(role: UserRole, formEntityId: string): string | null {
    // For roles that don't require entities, always return null
    if ([UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER].includes(role)) {
      return null;
    }
    // For roles that require entities, return the form value or null if empty
    return formEntityId || null;
  }

  private getEntityType(role: UserRole): EntityType | null {
    switch (role) {
      case UserRole.STATION:
        return EntityType.STATION;
      case UserRole.SUPPLIER:
        return EntityType.SUPPLIER;
      default:
        return null;
    }
  }
}