import { Component, Input, Output, EventEmitter, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslocoModule } from '@jsverse/transloco';
import { LucideAngularModule } from 'lucide-angular';

import { ButtonComponent } from '@shared/components/ui/button.component';
import { StationService } from '@core/services/station.service';
import { NotificationService } from '@core/services/notification.service';
import { Station, StationGroup, CreateStationRequest, UpdateStationRequest } from '@core/models/station.model';

@Component({
  selector: 'app-station-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TranslocoModule,
    LucideAngularModule,
    ButtonComponent
  ],
  template: `
    <form [formGroup]="stationForm" (ngSubmit)="onSubmit()" class="space-y-6">
      
      <!-- Basic Information Section -->
      <div class="space-y-4">
        <h3 class="text-lg font-medium text-gray-900">{{ 'stations.station' | transloco }} {{ 'common.details' | transloco }}</h3>
        
        <!-- Station Name -->
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
            {{ 'stations.station' | transloco }} {{ 'common.name' | transloco }} *
          </label>
          <input
            type="text"
            id="name"
            formControlName="name"
            class="form-input"
            [placeholder]="'Nom de la station'"
            required>
          <div *ngIf="stationForm.get('name')?.invalid && stationForm.get('name')?.touched" 
               class="mt-1 text-sm text-red-600">
            Le nom de la station est requis
          </div>
        </div>

        <!-- Station Code -->
        <div>
          <label for="code" class="block text-sm font-medium text-gray-700 mb-1">
            {{ 'stations.code' | transloco }}
          </label>
          <input
            type="text"
            id="code"
            formControlName="code"
            class="form-input"
            [placeholder]="'Code de la station'">
        </div>

        <!-- Station Group Selection -->
        <div>
          <label for="stationGroupId" class="block text-sm font-medium text-gray-700 mb-1">
            {{ 'stations.stationGroup' | transloco }}
          </label>
          <div class="flex space-x-2">
            <div class="flex-1">
              <select
                id="stationGroupId"
                formControlName="stationGroupId"
                class="form-select">
                <option value="">{{ 'stations.selectGroup' | transloco }}</option>
                <option *ngFor="let group of availableGroups()" [value]="group.id">
                  {{ group.name }}
                </option>
              </select>
            </div>
            <ui-button
              type="button"
              variant="outline"
              size="sm"
              (click)="showCreateGroupForm.set(true)"
              *ngIf="!showCreateGroupForm()">
              {{ 'stations.createNewGroup' | transloco }}
            </ui-button>
          </div>
        </div>

        <!-- Create New Group Form -->
        <div *ngIf="showCreateGroupForm()" class="bg-gray-50 p-4 rounded-lg border">
          <div class="flex items-center justify-between mb-3">
            <h4 class="text-sm font-medium text-gray-900">{{ 'stations.createStationGroup' | transloco }}</h4>
            <button
              type="button"
              (click)="cancelCreateGroup()"
              class="text-gray-400 hover:text-gray-500">
              <lucide-angular name="x" class="h-4 w-4" [size]="16"></lucide-angular>
            </button>
          </div>
          
          <div class="space-y-3">
            <div>
              <label for="groupName" class="block text-sm font-medium text-gray-700 mb-1">
                {{ 'stations.groupName' | transloco }} *
              </label>
              <input
                type="text"
                id="groupName"
                [(ngModel)]="newGroupName"
                class="form-input"
                [placeholder]="'Nom du groupe'"
                required>
            </div>
            
            <div>
              <label for="groupDescription" class="block text-sm font-medium text-gray-700 mb-1">
                {{ 'stations.groupDescription' | transloco }}
              </label>
              <textarea
                id="groupDescription"
                [(ngModel)]="newGroupDescription"
                class="form-textarea"
                rows="2"
                [placeholder]="'Description du groupe'">
              </textarea>
            </div>
            
            <div class="flex space-x-2">
              <ui-button
                type="button"
                variant="primary"
                size="sm"
                (click)="createStationGroup()"
                [disabled]="!newGroupName || creatingGroup()">
                {{ creatingGroup() ? 'common.loading' : 'common.create' | transloco }}
              </ui-button>
              <ui-button
                type="button"
                variant="outline"
                size="sm"
                (click)="cancelCreateGroup()">
                {{ 'common.cancel' | transloco }}
              </ui-button>
            </div>
          </div>
        </div>
      </div>

      <!-- Address Section -->
      <div class="space-y-4">
        <h3 class="text-lg font-medium text-gray-900">{{ 'stations.address' | transloco }}</h3>
        
        <div formGroupName="address" class="space-y-4">
          <!-- Street -->
          <div>
            <label for="street" class="block text-sm font-medium text-gray-700 mb-1">
              {{ 'stations.address' | transloco }}
            </label>
            <input
              type="text"
              id="street"
              formControlName="street"
              class="form-input"
              [placeholder]="'Adresse de la station'">
          </div>

          <!-- City and Postal Code -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="city" class="block text-sm font-medium text-gray-700 mb-1">
                {{ 'stations.city' | transloco }}
              </label>
              <input
                type="text"
                id="city"
                formControlName="city"
                class="form-input"
                [placeholder]="'Ville'">
            </div>
            
            <div>
              <label for="postalCode" class="block text-sm font-medium text-gray-700 mb-1">
                {{ 'stations.postalCode' | transloco }}
              </label>
              <input
                type="text"
                id="postalCode"
                formControlName="postalCode"
                class="form-input"
                [placeholder]="'Code postal'">
            </div>
          </div>

          <!-- Country -->
          <div>
            <label for="country" class="block text-sm font-medium text-gray-700 mb-1">
              {{ 'stations.country' | transloco }}
            </label>
            <input
              type="text"
              id="country"
              formControlName="country"
              class="form-input"
              [placeholder]="'Pays'">
          </div>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <ui-button
          type="button"
          variant="outline"
          (click)="onCancel()">
          {{ 'common.cancel' | transloco }}
        </ui-button>
        <ui-button
          type="submit"
          variant="primary"
          [disabled]="stationForm.invalid || saving()">
          {{ saving() ? ('common.loading' | transloco) : (isEditMode ? ('common.update' | transloco) : ('common.create' | transloco)) }}
        </ui-button>
      </div>
    </form>
  `,
  styles: []
})
export class StationFormComponent implements OnInit {
  @Input() station?: Station | null = null;
  @Output() cancel = new EventEmitter<void>();
  @Output() stationCreated = new EventEmitter<Station>();
  @Output() stationUpdated = new EventEmitter<Station>();

  private fb = inject(FormBuilder);
  private stationService = inject(StationService);
  private notificationService = inject(NotificationService);

  // Signals
  saving = signal(false);
  creatingGroup = signal(false);
  showCreateGroupForm = signal(false);
  availableGroups = signal<StationGroup[]>([]);

  // New group form data
  newGroupName = '';
  newGroupDescription = '';

  stationForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    code: [''],
    stationGroupId: [''],
    address: this.fb.group({
      street: [''],
      city: [''],
      postalCode: [''],
      country: ['']
    })
  });

  get isEditMode(): boolean {
    return !!this.station;
  }

  ngOnInit() {
    this.loadAvailableGroups();
    
    if (this.station) {
      this.populateForm();
    }
  }

  private loadAvailableGroups() {
    this.stationService.getActiveStationGroups().subscribe({
      next: (groups) => {
        this.availableGroups.set(groups);
      },
      error: (error) => {
        console.error('Error loading station groups:', error);
      }
    });
  }

  private populateForm() {
    if (this.station) {
      this.stationForm.patchValue({
        name: this.station.name,
        code: this.station.code || '',
        stationGroupId: this.station.stationGroupId || '',
        address: {
          street: this.station.address.street || '',
          city: this.station.address.city || '',
          postalCode: this.station.address.postalCode || '',
          country: this.station.address.country || ''
        }
      });
    }
  }

  createStationGroup() {
    if (!this.newGroupName.trim()) {
      return;
    }

    this.creatingGroup.set(true);
    
    const createRequest = {
      name: this.newGroupName.trim(),
      description: this.newGroupDescription.trim() || undefined
    };

    this.stationService.createStationGroup(createRequest).subscribe({
      next: (newGroup) => {
        // Add new group to the list and select it
        const currentGroups = this.availableGroups();
        this.availableGroups.set([...currentGroups, newGroup]);
        this.stationForm.patchValue({ stationGroupId: newGroup.id });
        
        // Reset and hide the form
        this.newGroupName = '';
        this.newGroupDescription = '';
        this.showCreateGroupForm.set(false);
        this.creatingGroup.set(false);
        
        this.notificationService.showSuccess('Groupe de stations créé avec succès');
      },
      error: (error) => {
        console.error('Error creating station group:', error);
        this.creatingGroup.set(false);
        this.notificationService.showError('Erreur lors de la création du groupe');
      }
    });
  }

  cancelCreateGroup() {
    this.newGroupName = '';
    this.newGroupDescription = '';
    this.showCreateGroupForm.set(false);
  }

  onSubmit() {
    if (this.stationForm.invalid) {
      this.stationForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const formValue = this.stationForm.value;

    if (this.isEditMode && this.station) {
      // Update existing station
      const updateRequest: UpdateStationRequest = {
        name: formValue.name,
        code: formValue.code || undefined,
        stationGroupId: formValue.stationGroupId || undefined,
        address: formValue.address
      };

      this.stationService.updateStation(this.station.id, updateRequest).subscribe({
        next: (updatedStation) => {
          this.saving.set(false);
          this.notificationService.showSuccess('Station mise à jour avec succès');
          this.stationUpdated.emit(updatedStation);
        },
        error: (error) => {
          console.error('Error updating station:', error);
          this.saving.set(false);
          this.notificationService.showError('Erreur lors de la mise à jour de la station');
        }
      });
    } else {
      // Create new station
      const createRequest: CreateStationRequest = {
        name: formValue.name,
        code: formValue.code || undefined,
        stationGroupId: formValue.stationGroupId || undefined,
        address: formValue.address
      };

      this.stationService.createStation(createRequest).subscribe({
        next: (newStation) => {
          this.saving.set(false);
          this.notificationService.showSuccess('Station créée avec succès');
          this.stationCreated.emit(newStation);
        },
        error: (error) => {
          console.error('Error creating station:', error);
          this.saving.set(false);
          this.notificationService.showError('Erreur lors de la création de la station');
        }
      });
    }
  }

  onCancel() {
    this.cancel.emit();
  }
}