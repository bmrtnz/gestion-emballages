import { Component, inject, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { UserService } from '@core/services/user.service';
import { AuthService } from '@core/services/auth.service';
import { NotificationService } from '@core/services/notification.service';
import { StationService } from '@core/services/station.service';
import { SupplierService } from '@core/services/supplier.service';
import { ButtonComponent } from '@shared/components/ui/button.component';
import { UserRole, EntityType, CreateUserRequest } from '@core/models/user.model';
import { Station } from '@core/models/station.model';
import { Supplier } from '@core/models/supplier.model';

@Component({
  selector: 'app-add-user-form',
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

          <!-- Entity Selection (for Station/Fournisseur roles) -->
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

        <!-- Password -->
        <div>
          <h3 class="text-lg font-medium text-gray-900 mb-4">Mot de passe</h3>
          
          <!-- Password -->
          <div class="mb-4">
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe *
            </label>
            <input
              type="password"
              id="password"
              formControlName="password"
              class="form-input"
              [class.border-red-300]="userForm.get('password')?.invalid && userForm.get('password')?.touched">
            <p *ngIf="userForm.get('password')?.invalid && userForm.get('password')?.touched" 
               class="mt-1 text-sm text-red-600">
              <span *ngIf="userForm.get('password')?.errors?.['required']">Le mot de passe est obligatoire</span>
              <span *ngIf="userForm.get('password')?.errors?.['minlength']">Le mot de passe doit contenir au moins 6 caractères</span>
            </p>
          </div>

          <!-- Confirm Password -->
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">
              Confirmer le mot de passe *
            </label>
            <input
              type="password"
              id="confirmPassword"
              formControlName="confirmPassword"
              class="form-input"
              [class.border-red-300]="userForm.get('confirmPassword')?.invalid && userForm.get('confirmPassword')?.touched">
            <p *ngIf="userForm.get('confirmPassword')?.invalid && userForm.get('confirmPassword')?.touched" 
               class="mt-1 text-sm text-red-600">
              <span *ngIf="userForm.get('confirmPassword')?.errors?.['required']">La confirmation est obligatoire</span>
              <span *ngIf="userForm.get('confirmPassword')?.errors?.['passwordMismatch']">Les mots de passe ne correspondent pas</span>
            </p>
          </div>
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
            Créer l'utilisateur
          </ui-button>
        </div>
      </form>
    </div>
  `,
  styles: []
})
export class AddUserFormComponent {
  private fb = inject(FormBuilder);
  public userService = inject(UserService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private stationService = inject(StationService);
  private supplierService = inject(SupplierService);

  @Output() cancel = new EventEmitter<void>();
  @Output() userCreated = new EventEmitter<void>();

  public loading = signal(false);
  public availableRoles: UserRole[] = [];
  public stations = signal<Station[]>([]);
  public suppliers = signal<Supplier[]>([]);

  public userForm: FormGroup = this.fb.group({
    fullName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.pattern(/^[\d\s\-\+\(\)]+$/)]],
    role: ['', [Validators.required]],
    entityId: [''],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  constructor() {
    this.initializeForm();
    this.loadEntities();
  }

  private initializeForm(): void {
    const currentUserRole = this.authService.userRole();
    if (currentUserRole) {
      this.availableRoles = this.userService.getAvailableRoles(currentUserRole);
    }
  }

  private async loadEntities(): Promise<void> {
    try {
      // Load active stations
      const activeStations = await this.stationService.getActiveStations();
      this.stations.set(activeStations);
      
      // Load active suppliers
      const suppliersResponse = await this.supplierService.getSuppliers({
        status: 'active',
        limit: 1000 // Get all active suppliers
      });
      this.suppliers.set(suppliersResponse.data);
      
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

  availableEntities = signal<(Station | Supplier)[]>([]);

  onRoleChange(): void {
    const selectedRole = this.userForm.get('role')?.value;
    const entityIdControl = this.userForm.get('entityId');
    
    // Reset entity selection
    entityIdControl?.setValue('');
    
    // Update validators
    if (selectedRole === UserRole.STATION || selectedRole === UserRole.SUPPLIER) {
      entityIdControl?.setValidators([Validators.required]);
      
      // Set available entities based on role
      if (selectedRole === UserRole.STATION) {
        this.availableEntities.set(this.stations());
      } else if (selectedRole === UserRole.SUPPLIER) {
        this.availableEntities.set(this.suppliers());
      }
    } else {
      entityIdControl?.clearValidators();
      this.availableEntities.set([]);
    }
    
    entityIdControl?.updateValueAndValidity();
  }

  private passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  async onSubmit(): Promise<void> {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    try {
      const formValue = this.userForm.value;
      const userData: CreateUserRequest = {
        fullName: formValue.fullName.trim(),
        email: formValue.email,
        phone: formValue.phone?.trim() || undefined,
        role: formValue.role,
        entityId: this.getEntityId(formValue.role, formValue.entityId),
        entityType: this.getEntityType(formValue.role) || undefined,
        password: formValue.password
      };

      this.userService.createUser(userData).subscribe({
        next: (response) => {
          this.notificationService.showSuccess('Utilisateur créé avec succès');
          this.userCreated.emit();
          this.loading.set(false);
        },
        error: (error: any) => {
          console.error('Error creating user:', error);
          this.notificationService.showError(
            error?.error?.message || 'Erreur lors de la création de l\'utilisateur'
          );
          this.loading.set(false);
        }
      });
      
    } catch (error: any) {
      console.error('Error creating user:', error);
      this.notificationService.showError('Erreur lors de la création de l\'utilisateur');
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