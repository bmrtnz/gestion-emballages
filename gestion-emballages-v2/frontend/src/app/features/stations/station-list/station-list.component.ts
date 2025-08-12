import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { LucideAngularModule } from 'lucide-angular';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';

import { StationService } from '@core/services/station.service';
import { StationContactService, UpdateStationContactRequest } from '@core/services/station-contact.service';
import { AuthService } from '@core/services/auth.service';
import { NotificationService } from '@core/services/notification.service';
import { LoadingService } from '@core/services/loading.service';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { ButtonComponent } from '@shared/components/ui/button.component';
import { SlidePanelComponent } from '@shared/components/ui/slide-panel.component';
import { ToggleButtonComponent } from '@shared/components/ui/toggle-button.component';
import { StationFormComponent } from '../station-form/station-form.component';
import {
  Station,
  StationContact,
  StationGroup,
  StationFilters,
  PaginatedStationsResponse,
} from '@core/models/station.model';
import { UserRole } from '@core/models/user.model';

@Component({
  selector: 'app-station-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    LucideAngularModule,
    TranslocoModule,
    LoadingSpinnerComponent,
    ButtonComponent,
    SlidePanelComponent,
    ToggleButtonComponent,
    StationFormComponent,
  ],
  template: `
    <div class="space-y-6">
      <!-- Search, Filters and Add Button Row -->
      <div class="flex items-start gap-4 mb-6">
        <!-- Filter Panel (Left side) -->
        <div class="flex-1 bg-gray-100 rounded-lg p-4 border border-gray-200">
          <form [formGroup]="searchForm" class="space-y-4">
            <!-- Search Bar -->
            <div class="flex items-center space-x-4">
              <ui-toggle-button
                [label]="'common.filters' | transloco"
                [useCustomIcon]="true"
                [isToggled]="showFilters()"
                [badgeCount]="activeFiltersCount()"
                variant="outline"
                size="md"
                (toggle)="showFilters.set($event)"
              >
                <svg slot="icon" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M3 4a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v2.586a1 1 0 0 1-.293.707l-6.414 6.414a1 1 0 0 0-.293.707V17l-4 4v-6.586a1 1 0 0 0-.293-.707L3.293 7.207A1 1 0 0 1 3 6.5V4Z"
                  />
                </svg>
              </ui-toggle-button>

              <div class="flex-1 relative">
                <svg
                  class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  formControlName="search"
                  class="form-input pl-10 w-full"
                  [placeholder]="'stations.searchPlaceholder' | transloco"
                  (input)="onSearchChange()"
                />
              </div>

              <!-- Reset Filters Button -->
              <ui-button type="button" variant="outline" size="md" (click)="clearFilters()">
                {{ 'stations.resetFilters' | transloco }}
              </ui-button>
            </div>

            <!-- Filters Panel -->
            <div *ngIf="showFilters()" class="border-t pt-4">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <!-- Status Filter -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ 'common.status' | transloco }}</label>
                  <select formControlName="status" class="form-select w-full" (change)="onFiltersChange()">
                    <option value="">{{ 'common.all' | transloco }}</option>
                    <option value="active">{{ 'common.active' | transloco }}</option>
                    <option value="inactive">{{ 'common.inactive' | transloco }}</option>
                  </select>
                </div>

                <!-- Station Group Filter -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{
                    'stations.stationGroup' | transloco
                  }}</label>
                  <select formControlName="stationGroupId" class="form-select w-full" (change)="onFiltersChange()">
                    <option value="">{{ 'common.all' | transloco }}</option>
                    <option value="independent">{{ 'stations.independent' | transloco }}</option>
                    <option *ngFor="let group of availableGroups()" [value]="group.id">
                      {{ group.name }}
                    </option>
                  </select>
                </div>

                <!-- City Filter -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ 'stations.city' | transloco }}</label>
                  <select formControlName="city" class="form-select w-full" (change)="onFiltersChange()">
                    <option value="">{{ 'common.all' | transloco }}</option>
                    <option *ngFor="let city of availableCities()" [value]="city">
                      {{ city }}
                    </option>
                  </select>
                </div>

              </div>
            </div>
          </form>
        </div>

        <!-- Add Station Button (Right side) - Fixed position aligned with search bar -->
        <div class="flex-shrink-0 pt-4">
          <ui-button
            [variant]="authService.canAccessUserManagement() ? 'primary' : 'secondary'"
            size="md"
            [disabled]="!canCreateStation()"
            (click)="canCreateStation() ? openCreateModal() : null"
          >
            {{ 'stations.createStation' | transloco }}
          </ui-button>
        </div>
      </div>

      <!-- Content -->
      <ng-container *ngIf="!loading(); else loadingMessage">
        <!-- Stations Table -->
        <div class="overflow-hidden">
          <!-- Pagination Controls -->
          <div *ngIf="stations().length > 0" class="flex items-center justify-between px-6 py-2">
            <!-- Mobile pagination (Previous/Next only) -->
            <div class="flex flex-1 justify-between sm:hidden">
              <button
                [disabled]="!paginatedResponse()?.hasPreviousPage || (paginatedResponse()?.totalPages || 0) <= 1"
                (click)="goToPage(currentPage() - 1)"
                class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-2 py-0.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ 'pagination.previous' | transloco }}
              </button>
              <button
                [disabled]="!paginatedResponse()?.hasNextPage || (paginatedResponse()?.totalPages || 0) <= 1"
                (click)="goToPage(currentPage() + 1)"
                class="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-2 py-0.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ 'pagination.next' | transloco }}
              </button>
            </div>

            <!-- Desktop pagination (Full controls) -->
            <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p class="text-xs text-gray-700">
                  {{
                    'stations.displayingStations'
                      | transloco
                        : {
                            start: getResultStart(),
                            end: getResultEnd(),
                            total: paginatedResponse()?.total,
                          }
                  }}
                </p>
              </div>

              <div class="flex items-center space-x-4">
                <div class="flex items-center space-x-2">
                  <label class="text-xs text-gray-700">{{ 'pagination.show' | transloco }}:</label>
                  <select
                    [value]="itemsPerPage()"
                    (change)="changeItemsPerPage($event)"
                    class="border border-gray-300 rounded px-2 py-0.5 text-xs bg-white w-14 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                  </select>
                  <span class="text-xs text-gray-700">{{ 'users.showPerPage' | transloco }}</span>
                </div>

                <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <!-- Previous Page -->
                  <button
                    [disabled]="!paginatedResponse()?.hasPreviousPage || (paginatedResponse()?.totalPages || 0) <= 1"
                    (click)="goToPage(currentPage() - 1)"
                    class="relative inline-flex items-center rounded-l-md px-2 py-0.5 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fill-rule="evenodd"
                        d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a1 1 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </button>

                  <!-- Page Numbers -->
                  <button
                    *ngFor="let page of getVisiblePages(); trackBy: trackByPage"
                    (click)="(paginatedResponse()?.totalPages || 0) > 1 ? goToPage(page) : null"
                    [disabled]="(paginatedResponse()?.totalPages || 0) <= 1"
                    [class]="getPageButtonClass(page)"
                  >
                    {{ page }}
                  </button>

                  <!-- Next Page -->
                  <button
                    [disabled]="!paginatedResponse()?.hasNextPage || (paginatedResponse()?.totalPages || 0) <= 1"
                    (click)="goToPage(currentPage() + 1)"
                    class="relative inline-flex items-center rounded-r-md px-2 py-0.5 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fill-rule="evenodd"
                        d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>

          <!-- Desktop Table -->
          <div class="hidden md:block">
            <div class="overflow-hidden rounded-lg border border-gray-200">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-100">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {{ 'stations.code' | transloco }}
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {{ 'stations.station' | transloco }}
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {{ 'stations.mainContact' | transloco }}
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {{ 'stations.group' | transloco }}
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {{ 'common.status' | transloco }}
                    </th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {{ 'common.actions' | transloco }}
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr *ngFor="let station of stations(); trackBy: trackByStationId" class="hover:bg-gray-50">
                    <!-- Code -->
                    <td class="px-6 py-2">
                      <div class="flex items-center justify-between">
                        <span class="text-sm font-medium text-gray-900">{{ station.code || '-' }}</span>
                        <button
                          type="button"
                          class="inline-flex items-center p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 rounded-md transition-all duration-200"
                          (click)="openAllContactsPanel(station)"
                          [attr.aria-label]="'View all contacts for ' + getStationNameOnly(station)"
                          title="View all contacts"
                        >
                          <lucide-angular name="book-user" class="h-4 w-4" [size]="16"></lucide-angular>
                        </button>
                      </div>
                    </td>

                    <!-- Station Name -->
                    <td class="px-6 py-2">
                      <div class="text-sm font-medium text-gray-900">
                        {{ getStationNameOnly(station) }}
                      </div>
                    </td>

                    <!-- Main Contact -->
                    <td class="px-6 py-2">
                      <div class="flex items-center justify-between">
                        <span class="text-sm font-medium text-gray-900">
                          {{ getMainContactFormatted(station).name }}
                        </span>
                        <!-- Contact Details Icon -->
                        <button
                          *ngIf="hasMainContact(station)"
                          type="button"
                          class="inline-flex items-center p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 rounded-md transition-all duration-200"
                          [attr.aria-label]="'View contact details for ' + getMainContactFormatted(station).name"
                          (click)="openContactDetailsPanel(station)"
                          title="View contact details"
                        >
                          <lucide-angular name="id-card" class="h-4 w-4" [size]="16"></lucide-angular>
                        </button>
                      </div>
                    </td>

                    <!-- Station Group -->
                    <td class="px-6 py-2">
                      <div *ngIf="station.stationGroup" class="text-sm font-medium text-blue-600">
                        {{ station.stationGroup.name }}
                      </div>
                      <div *ngIf="!station.stationGroup" class="text-sm text-gray-500">
                        {{ 'stations.independent' | transloco }}
                      </div>
                    </td>

                    <!-- Status -->
                    <td class="px-6 py-2">
                      <span [class]="getStationStatusClass(station.isActive)">
                        {{ station.isActive ? ('common.active' | transloco) : ('common.inactive' | transloco) }}
                      </span>
                    </td>

                    <!-- Actions -->
                    <td class="px-6 py-2 text-right text-sm font-medium">
                      <div class="flex items-center justify-end space-x-2">
                        <button
                          type="button"
                          [class]="
                            canEditStation() ? 'text-gray-600 hover:text-gray-900' : 'text-gray-300 cursor-not-allowed'
                          "
                          [disabled]="!canEditStation()"
                          (click)="canEditStation() ? editStation(station) : null"
                          [title]="canEditStation() ? ('common.edit' | transloco) : 'Action non autorisée'"
                        >
                          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>

                        <button
                          type="button"
                          [class]="
                            canToggleStatus()
                              ? station.isActive
                                ? 'text-orange-600 hover:text-orange-900'
                                : 'text-green-600 hover:text-green-900'
                              : 'text-gray-300 cursor-not-allowed'
                          "
                          [disabled]="!canToggleStatus()"
                          (click)="canToggleStatus() ? toggleStationStatus(station) : null"
                          [title]="
                            canToggleStatus()
                              ? station.isActive
                                ? ('common.deactivate' | transloco)
                                : ('common.activate' | transloco)
                              : 'Action non autorisée'
                          "
                        >
                          <lucide-angular
                            *ngIf="station.isActive"
                            name="pause"
                            class="h-4 w-4"
                            [size]="16"
                          ></lucide-angular>
                          <lucide-angular
                            *ngIf="!station.isActive"
                            name="play"
                            class="h-4 w-4"
                            [size]="16"
                          ></lucide-angular>
                        </button>

                        <button
                          type="button"
                          [class]="
                            canDeleteStation() ? 'text-red-600 hover:text-red-900' : 'text-gray-300 cursor-not-allowed'
                          "
                          [disabled]="!canDeleteStation()"
                          (click)="canDeleteStation() ? deleteStation(station) : null"
                          [title]="canDeleteStation() ? 'Supprimer définitivement' : 'Action non autorisée'"
                        >
                          <lucide-angular name="x" class="h-4 w-4" [size]="16"></lucide-angular>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Mobile Cards -->
          <div class="md:hidden space-y-4 p-4">
            <div
              *ngFor="let station of stations(); trackBy: trackByStationId"
              class="border border-gray-200 rounded-lg p-4 space-y-3"
            >
              <div class="flex items-start justify-between mb-3">
                <div class="flex-1">
                  <h3 class="text-sm font-medium text-gray-900">{{ getStationNameOnly(station) }}</h3>
                  <div class="flex items-center justify-between mt-1">
                    <p class="text-sm text-gray-500">{{ 'stations.code' | transloco }}: {{ station.code || '-' }}</p>
                    <button
                      type="button"
                      class="inline-flex items-center p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 rounded-md transition-colors ml-2"
                      (click)="openAllContactsPanel(station)"
                      [attr.aria-label]="'View all contacts for ' + getStationNameOnly(station)"
                      title="View all contacts"
                    >
                      <lucide-angular name="book-user" class="h-4 w-4" [size]="16"></lucide-angular>
                    </button>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-1 gap-3 text-sm">
                <div>
                  <div class="text-gray-500 mb-1">{{ 'stations.mainContact' | transloco }}:</div>
                  <div class="ml-1 flex items-center justify-between">
                    <div class="text-sm font-medium text-gray-900">
                      {{ getMainContactFormatted(station).name }}
                    </div>
                    <!-- Contact Details Icon for Mobile -->
                    <button
                      *ngIf="hasMainContact(station)"
                      type="button"
                      class="inline-flex items-center p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 rounded-md transition-all duration-200"
                      [attr.aria-label]="'View contact details for ' + getMainContactFormatted(station).name"
                      (click)="openContactDetailsPanel(station)"
                      title="View contact details"
                    >
                      <lucide-angular name="id-card" class="h-4 w-4" [size]="16"></lucide-angular>
                    </button>
                  </div>
                </div>
                <div>
                  <span class="text-gray-500">{{ 'stations.group' | transloco }}:</span>
                  <span class="ml-1" [class]="station.stationGroup ? 'text-blue-600 font-medium' : 'text-gray-500'">
                    {{ station.stationGroup?.name || ('stations.independent' | transloco) }}
                  </span>
                </div>
                <div>
                  <span class="text-gray-500">{{ 'common.status' | transloco }}:</span>
                  <span class="ml-1" [class]="getStationStatusClass(station.isActive)">
                    {{ station.isActive ? ('common.active' | transloco) : ('common.inactive' | transloco) }}
                  </span>
                </div>
              </div>

              <!-- Mobile Actions -->
              <div class="flex justify-end space-x-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  [class]="
                    canEditStation()
                      ? 'text-sm text-gray-600 hover:text-gray-900'
                      : 'text-sm text-gray-300 cursor-not-allowed'
                  "
                  [disabled]="!canEditStation()"
                  (click)="canEditStation() ? editStation(station) : null"
                >
                  {{ 'common.edit' | transloco }}
                </button>
                <button
                  type="button"
                  [class]="
                    canToggleStatus()
                      ? station.isActive
                        ? 'text-sm text-orange-600 hover:text-orange-900'
                        : 'text-sm text-green-600 hover:text-green-900'
                      : 'text-sm text-gray-300 cursor-not-allowed'
                  "
                  [disabled]="!canToggleStatus()"
                  (click)="canToggleStatus() ? toggleStationStatus(station) : null"
                >
                  <lucide-angular
                    [name]="station.isActive ? 'pause' : 'play'"
                    class="h-4 w-4 inline mr-1"
                    [size]="16"
                  ></lucide-angular>
                  {{ station.isActive ? ('common.deactivate' | transloco) : ('common.activate' | transloco) }}
                </button>
                <button
                  type="button"
                  [class]="
                    canDeleteStation()
                      ? 'text-sm text-red-600 hover:text-red-900'
                      : 'text-sm text-gray-300 cursor-not-allowed'
                  "
                  [disabled]="!canDeleteStation()"
                  (click)="canDeleteStation() ? deleteStation(station) : null"
                >
                  <lucide-angular name="x" class="h-4 w-4 inline mr-1" [size]="16"></lucide-angular>
                  {{ 'common.delete' | transloco }}
                </button>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div *ngIf="stations().length === 0" class="text-center py-12">
            <lucide-angular name="building-2" class="mx-auto h-12 w-12 text-gray-400" [size]="48"></lucide-angular>
            <h3 class="mt-2 text-sm font-medium text-gray-900">{{ 'messages.noStationsFound' | transloco }}</h3>
            <p class="mt-1 text-sm text-gray-500">
              {{
                searchForm.get('search')?.value
                  ? 'Essayez de modifier vos critères de recherche.'
                  : 'Commencez par créer une nouvelle station.'
              }}
            </p>
            <div class="mt-6">
              <ui-button *ngIf="canCreateStation()" variant="primary" size="md" (click)="openCreateModal()">
                {{ 'stations.createStation' | transloco }}
              </ui-button>
            </div>
          </div>
        </div>
      </ng-container>

      <!-- Simple Loading Message -->
      <ng-template #loadingMessage>
        <div class="flex items-center justify-center py-12">
          <div class="text-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p class="text-gray-500">{{ 'messages.loadingStations' | transloco }}</p>
          </div>
        </div>
      </ng-template>
    </div>
    <!-- Close space-y-6 wrapper -->

    <!-- Add Station Slide Panel -->
    <ui-slide-panel
      [open]="showAddStationPanel()"
      [title]="'stations.createStation' | transloco"
      size="lg"
      (close)="closeAddStationPanel()"
    >
      <app-station-form (cancel)="closeAddStationPanel()" (stationCreated)="onStationCreated()"> </app-station-form>
    </ui-slide-panel>

    <!-- Edit Station Slide Panel -->
    <ui-slide-panel
      [open]="showEditStationPanel()"
      [title]="'stations.editStation' | transloco"
      size="lg"
      (close)="closeEditStationPanel()"
    >
      <app-station-form
        *ngIf="selectedStation()"
        [station]="selectedStation()"
        (cancel)="closeEditStationPanel()"
        (stationUpdated)="onStationUpdated()"
      >
      </app-station-form>
    </ui-slide-panel>

    <!-- All Contacts Slide Panel -->
    <ui-slide-panel
      [open]="showAllContactsPanel()"
      [title]="'Annuaire des contacts'"
      size="md"
      (close)="closeAllContactsPanel()"
    >
      <div *ngIf="selectedContactStation()" class="space-y-4">
        <!-- Station Info Header -->
        <div class="bg-gray-50 rounded-lg p-4 border">
          <div class="flex items-top space-x-3">
            <div class="flex-shrink-0 py-1">
              <lucide-angular name="factory" class="h-5 w-5 text-gray-600" [size]="20"></lucide-angular>
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-lg font-medium text-gray-900 truncate">
                {{ getStationNameOnly(selectedContactStation()!) }}
              </h3>
              <p class="text-sm text-gray-600 truncate" *ngIf="selectedContactStation()!.code">
                {{ selectedContactStation()!.code }}
              </p>
            </div>
          </div>
        </div>

        <!-- Contacts List -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h4 class="text-md font-medium text-gray-900">
              {{ getAllContacts(selectedContactStation()!).length }} {{ 'stations.contacts' | transloco }}
            </h4>
          </div>

          <!-- Contact Cards -->
          <div *ngIf="getAllContacts(selectedContactStation()!).length > 0; else noContactsTemplate" class="space-y-3">
            <div
              *ngFor="let contact of getAllContacts(selectedContactStation()!); trackBy: trackByContactId"
              class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
            >
              <!-- View Mode -->
              <div *ngIf="editingContactId() !== contact.id" class="flex items-start justify-between">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center space-x-2 mb-2">
                    <h5 class="text-sm font-medium text-gray-900 truncate">
                      {{ contact.name }}
                    </h5>
                    <span
                      *ngIf="contact.isPrimary"
                      class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      Principal
                    </span>
                  </div>

                  <div class="space-y-1 text-sm text-gray-600">
                    <div *ngIf="contact.position" class="flex items-center space-x-2">
                      <lucide-angular name="building-2" class="h-3 w-3 text-gray-400" [size]="12"></lucide-angular>
                      <span>{{ contact.position }}</span>
                    </div>
                    <div *ngIf="contact.phone" class="flex items-center space-x-2">
                      <lucide-angular name="phone" class="h-3 w-3 text-gray-400" [size]="12"></lucide-angular>
                      <a href="tel:{{ contact.phone }}" class="hover:text-primary-600">{{ contact.phone }}</a>
                    </div>
                    <div *ngIf="contact.email" class="flex items-center space-x-2">
                      <lucide-angular name="mail" class="h-3 w-3 text-gray-400" [size]="12"></lucide-angular>
                      <a href="mailto:{{ contact.email }}" class="hover:text-primary-600 truncate">{{
                        contact.email
                      }}</a>
                    </div>
                  </div>
                </div>

                <!-- Edit Button -->
                <div class="flex items-start space-x-2 ml-4">
                  <button
                    *ngIf="canEditContacts()"
                    (click)="startEditingContact(contact)"
                    class="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Edit contact"
                  >
                    <lucide-angular name="square-pen" [size]="16"></lucide-angular>
                  </button>
                </div>
              </div>

              <!-- Edit Mode -->
              <div *ngIf="editingContactId() === contact.id" class="flex flex-col min-h-0">
                <div class="flex-1">
                  <!-- Name Field with Primary Checkbox -->
                  <div class="flex items-center space-x-2 mb-2">
                    <lucide-angular
                      name="user"
                      class="h-3 w-3 text-gray-400 flex-shrink-0"
                      [size]="12"
                    ></lucide-angular>
                    <input
                      type="text"
                      [value]="contactFormValues().name"
                      (input)="updateContactField('name', $event)"
                      class="flex-1 min-w-0 px-2 py-1 border border-gray-300 rounded text-sm font-medium text-gray-900 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Contact name"
                      required
                    />
                    <div class="flex items-center ml-2">
                      <input
                        type="checkbox"
                        id="isPrimary-{{ contact.id }}"
                        [checked]="contactFormValues().isPrimary"
                        (change)="updateContactField('isPrimary', $event)"
                        class="h-3 w-3 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label
                        for="isPrimary-{{ contact.id }}"
                        class="ml-1 text-xs font-medium bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded"
                      >
                        Principal
                      </label>
                    </div>
                  </div>

                  <div class="space-y-1 text-sm mb-4">
                    <!-- Position Field -->
                    <div class="flex items-center space-x-2">
                      <lucide-angular
                        name="building-2"
                        class="h-3 w-3 text-gray-400 flex-shrink-0"
                        [size]="12"
                      ></lucide-angular>
                      <input
                        type="text"
                        [value]="contactFormValues().position || ''"
                        (input)="updateContactField('position', $event)"
                        class="flex-1 min-w-0 px-2 py-1 border border-gray-300 rounded text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Job position"
                      />
                    </div>

                    <!-- Phone Field -->
                    <div class="flex items-center space-x-2">
                      <lucide-angular
                        name="phone"
                        class="h-3 w-3 text-gray-400 flex-shrink-0"
                        [size]="12"
                      ></lucide-angular>
                      <input
                        type="tel"
                        [value]="contactFormValues().phone || ''"
                        (input)="updateContactField('phone', $event)"
                        class="flex-1 min-w-0 px-2 py-1 border border-gray-300 rounded text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Phone number"
                      />
                    </div>

                    <!-- Email Field -->
                    <div class="flex items-center space-x-2">
                      <lucide-angular
                        name="mail"
                        class="h-3 w-3 text-gray-400 flex-shrink-0"
                        [size]="12"
                      ></lucide-angular>
                      <input
                        type="email"
                        [value]="contactFormValues().email || ''"
                        (input)="updateContactField('email', $event)"
                        class="flex-1 min-w-0 px-2 py-1 border border-gray-300 rounded text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Email address"
                      />
                    </div>
                  </div>
                </div>

                <!-- Action Buttons positioned at bottom right -->
                <div class="flex justify-end items-center space-x-2">
                  <!-- Cancel Button -->
                  <ui-button
                    variant="outline"
                    size="xs"
                    (click)="cancelContactEdit()"
                    [disabled]="contactUpdateLoading()"
                    title="Cancel editing"
                  >
                    Cancel
                  </ui-button>

                  <!-- Save Button -->
                  <ui-button
                    variant="primary"
                    size="xs"
                    (click)="saveContactEdit()"
                    [disabled]="contactUpdateLoading() || !isContactFormValid()"
                    title="Save changes"
                  >
                    <lucide-angular
                      *ngIf="contactUpdateLoading()"
                      name="loader-2"
                      [size]="14"
                      class="mr-1 animate-spin"
                    ></lucide-angular>
                    Save
                  </ui-button>
                </div>
              </div>
            </div>
          </div>

          <!-- No Contacts Template -->
          <ng-template #noContactsTemplate>
            <div class="text-center py-8">
              <lucide-angular name="user-x" class="mx-auto h-8 w-8 text-gray-400" [size]="32"></lucide-angular>
              <h3 class="mt-2 text-sm font-medium text-gray-900">No contacts found</h3>
              <p class="mt-1 text-sm text-gray-500">This station doesn't have any contacts registered.</p>
            </div>
          </ng-template>
        </div>
      </div>
    </ui-slide-panel>

    <!-- Contact Details Slide Panel -->
    <ui-slide-panel
      [open]="showContactDetailsPanel()"
      [title]="'Contact Details'"
      size="sm"
      (close)="closeContactDetailsPanel()"
    >
      <div
        *ngIf="selectedContactStation() && getMainContactDetails(selectedContactStation()!) as contact"
        class="space-y-6"
      >
        <!-- Station Info Header -->
        <div class="bg-gray-50 rounded-lg p-4 border">
          <div class="flex items-center space-x-3">
            <div class="flex-shrink-0">
              <lucide-angular name="building-2" class="h-5 w-5 text-gray-600" [size]="20"></lucide-angular>
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-sm font-medium text-gray-900 truncate">
                {{ getStationNameOnly(selectedContactStation()!) }}
              </h3>
              <p class="text-xs text-gray-600 truncate" *ngIf="selectedContactStation()!.code">
                {{ 'stations.code' | transloco }}: {{ selectedContactStation()!.code }}
              </p>
            </div>
          </div>
        </div>

        <!-- Contact Details Card -->
        <div class="bg-white border border-gray-200 rounded-lg p-6">
          <div class="flex items-center space-x-3 mb-4">
            <div class="flex-shrink-0">
              <div class="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                <lucide-angular name="user" class="h-5 w-5 text-primary-600" [size]="20"></lucide-angular>
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="text-lg font-medium text-gray-900 truncate">
                {{ contact.name }}
              </h4>
              <div class="flex items-center space-x-2">
                <span
                  *ngIf="contact.isPrimary"
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                >
                  Principal Contact
                </span>
              </div>
            </div>
          </div>

          <!-- Contact Information -->
          <div class="space-y-4">
            <div *ngIf="contact.position" class="flex items-center space-x-3">
              <div class="flex-shrink-0">
                <lucide-angular name="building-2" class="h-4 w-4 text-gray-400" [size]="16"></lucide-angular>
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-700">Position</p>
                <p class="text-sm text-gray-900">{{ contact.position }}</p>
              </div>
            </div>

            <div *ngIf="contact.phone" class="flex items-center space-x-3">
              <div class="flex-shrink-0">
                <lucide-angular name="phone" class="h-4 w-4 text-gray-400" [size]="16"></lucide-angular>
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-700">Phone</p>
                <a href="tel:{{ contact.phone }}" class="text-sm text-primary-600 hover:text-primary-700">
                  {{ contact.phone }}
                </a>
              </div>
            </div>

            <div *ngIf="contact.email" class="flex items-center space-x-3">
              <div class="flex-shrink-0">
                <lucide-angular name="mail" class="h-4 w-4 text-gray-400" [size]="16"></lucide-angular>
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-700">Email</p>
                <a href="mailto:{{ contact.email }}" class="text-sm text-primary-600 hover:text-primary-700 break-all">
                  {{ contact.email }}
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Additional Actions -->
        <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <ui-button variant="outline" size="sm" (click)="openAllContactsPanel(selectedContactStation()!)">
            View All Contacts
          </ui-button>
        </div>
      </div>

      <!-- No Contact Template -->
      <div
        *ngIf="selectedContactStation() && !getMainContactDetails(selectedContactStation()!)"
        class="text-center py-8"
      >
        <lucide-angular name="user-x" class="mx-auto h-8 w-8 text-gray-400" [size]="32"></lucide-angular>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No contact details</h3>
        <p class="mt-1 text-sm text-gray-500">This station doesn't have a main contact registered.</p>
      </div>
    </ui-slide-panel>
  `,
})
export class StationListComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  public stationService = inject(StationService);
  private stationContactService = inject(StationContactService);
  public authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private translocoService = inject(TranslocoService);
  private loadingService = inject(LoadingService);

  // Reactive state
  public loading = signal(false);
  public showFilters = signal(false);
  public showAddStationPanel = signal(false);
  public showEditStationPanel = signal(false);
  public showAllContactsPanel = signal(false);
  public showContactDetailsPanel = signal(false);
  public selectedStation = signal<Station | null>(null);
  public selectedContactStation = signal<Station | null>(null);
  public stations = signal<Station[]>([]);
  public availableGroups = signal<StationGroup[]>([]);
  public availableCities = signal<string[]>([]);
  public paginatedResponse = signal<PaginatedStationsResponse | null>(null);
  public currentPage = signal(1);
  public itemsPerPage = signal(10);

  // Inline editing signals
  public editingContactId = signal<string | null>(null);
  public contactFormValues = signal<UpdateStationContactRequest>({
    name: '',
    position: '',
    phone: '',
    email: '',
    isPrimary: false,
  });
  public contactUpdateLoading = signal(false);

  // Signal to track form values for reactive computed
  public formValues = signal({
    search: '',
    status: 'active',
    stationGroupId: '',
    city: '',
  });

  // Computed values
  public activeFiltersCount = computed(() => {
    const values = this.formValues();
    let count = 0;

    // Count search filter if it's not empty
    if (values.search && values.search.trim() !== '') count++;

    // Count status filter only if it's different from the default 'active'
    if (values.status !== 'active') count++;

    // Count station group filter if it's set (not empty)
    if (values.stationGroupId && values.stationGroupId !== '') count++;

    // Count city filter if it's set (not empty)
    if (values.city && values.city !== '') count++;

    return count;
  });

  // Form
  public searchForm: FormGroup = this.fb.group({
    search: [''],
    status: ['active'],
    stationGroupId: [''],
    city: [''],
  });

  private searchTimeout: any;

  ngOnInit() {
    // Subscribe to form changes to update the signal
    this.searchForm.valueChanges.subscribe(values => {
      this.formValues.set({
        search: values.search || '',
        status: values.status || '',
        stationGroupId: values.stationGroupId || '',
        city: values.city || '',
      });
    });

    // Load initial data
    this.loadAvailableGroups();
    this.loadStations();
  }

  loadStations() {
    this.loading.set(true);

    const filters: StationFilters = {
      page: this.currentPage(),
      limit: this.itemsPerPage(),
      sortBy: 'name',
      sortOrder: 'ASC',
      ...this.searchForm.value,
    };

    this.stationService.getStations(filters).subscribe({
      next: response => {
        this.stations.set(response.data);
        this.paginatedResponse.set(response);
        this.loading.set(false);

        // Extract unique cities for filter dropdown
        const cities = [
          ...new Set(
            response.data
              .map(station => station.address.city)
              .filter((city): city is string => city !== undefined && city !== null && city.trim() !== '')
          ),
        ].sort();
        this.availableCities.set(cities);
      },
      error: error => {
        console.error('Error loading stations:', error);
        this.loading.set(false);
        this.notificationService.showError(this.translocoService.translate('messages.errorOccurred'));
      },
    });
  }

  loadAvailableGroups() {
    this.stationService.getActiveStationGroups().subscribe({
      next: groups => {
        this.availableGroups.set(groups);
      },
      error: error => {
        console.error('Error loading station groups:', error);
      },
    });
  }

  onSearchChange() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(() => {
      this.currentPage.set(1);
      this.loadStations();
    }, 300);
  }

  onFiltersChange() {
    this.currentPage.set(1);
    this.loadStations();
  }

  clearFilters() {
    this.searchForm.patchValue({
      search: '',
      status: 'active',
      stationGroupId: '',
      city: '',
    });
    // Update the signal to reflect cleared filters
    this.formValues.set({
      search: '',
      status: 'active',
      stationGroupId: '',
      city: '',
    });
    // Collapse the filter panel automatically
    this.showFilters.set(false);
    this.currentPage.set(1);
    this.loadStations();
  }

  // Pagination methods
  goToPage(page: number) {
    this.currentPage.set(page);
    this.loadStations();
  }

  changeItemsPerPage(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.itemsPerPage.set(parseInt(target.value));
    this.currentPage.set(1);
    this.loadStations();
  }

  getVisiblePages(): number[] {
    const totalPages = this.paginatedResponse()?.totalPages || 0;
    const current = this.currentPage();
    const delta = 2;
    const range = [];

    // Always show at least page 1
    if (totalPages === 0) {
      return [1];
    }

    for (let i = Math.max(2, current - delta); i <= Math.min(totalPages - 1, current + delta); i++) {
      range.push(i);
    }

    if (current - delta > 2) {
      range.unshift(-1);
    }
    if (current + delta < totalPages - 1) {
      range.push(-1);
    }

    if (totalPages > 1) {
      range.unshift(1);
      if (totalPages > 1) {
        range.push(totalPages);
      }
    } else {
      // Show page 1 even when totalPages is 1
      range.unshift(1);
    }

    return range.filter((v, i, arr) => arr.indexOf(v) === i && v > 0);
  }

  getPageButtonClass(page: number): string {
    const baseClasses = 'relative inline-flex items-center px-2 py-0.5 text-xs font-semibold';
    if (page === this.currentPage()) {
      return `${baseClasses} z-10 bg-primary-100 text-primary-700 ring-1 ring-inset ring-gray-300 focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600`;
    }
    return `${baseClasses} text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0`;
  }

  getResultStart(): number {
    const response = this.paginatedResponse();
    if (!response) return 0;
    return (response.page - 1) * response.limit + 1;
  }

  getResultEnd(): number {
    const response = this.paginatedResponse();
    if (!response) return 0;
    return Math.min(response.page * response.limit, response.total);
  }

  // Station actions
  editStation(station: Station) {
    this.selectedStation.set(station);
    this.showEditStationPanel.set(true);
  }

  openCreateModal() {
    this.showAddStationPanel.set(true);
  }

  closeAddStationPanel() {
    this.showAddStationPanel.set(false);
  }

  closeEditStationPanel() {
    this.showEditStationPanel.set(false);
    this.selectedStation.set(null);
  }

  // Contact panel methods
  openAllContactsPanel(station: Station) {
    this.selectedContactStation.set(station);
    // Close other panels first
    this.showContactDetailsPanel.set(false);
    this.showAddStationPanel.set(false);
    this.showEditStationPanel.set(false);
    // Open all contacts panel
    this.showAllContactsPanel.set(true);
  }

  closeAllContactsPanel() {
    this.showAllContactsPanel.set(false);
    this.selectedContactStation.set(null);
  }

  openContactDetailsPanel(station: Station) {
    this.selectedContactStation.set(station);
    // Close other panels first
    this.showAllContactsPanel.set(false);
    this.showAddStationPanel.set(false);
    this.showEditStationPanel.set(false);
    // Open contact details panel
    this.showContactDetailsPanel.set(true);
  }

  closeContactDetailsPanel() {
    this.showContactDetailsPanel.set(false);
    this.selectedContactStation.set(null);
  }

  onStationCreated() {
    this.showAddStationPanel.set(false);
    // Reload the station list to show the new station
    this.loadStations();
    this.loadAvailableGroups(); // Refresh groups in case a new one was created
  }

  onStationUpdated() {
    this.showEditStationPanel.set(false);
    this.selectedStation.set(null);
    // Reload the station list to show the updated station
    this.loadStations();
    this.loadAvailableGroups(); // Refresh groups in case changes were made
  }

  toggleStationStatus(station: Station) {
    if (station.isActive) {
      this.stationService.deleteStation(station.id).subscribe({
        next: () => {
          this.notificationService.showSuccess(this.translocoService.translate('messages.stationDeactivated'));
          this.loadStations();
        },
        error: (error: any) => {
          console.error('Error deactivating station:', error);
          this.notificationService.showError(this.translocoService.translate('messages.errorOccurred'));
        },
      });
    } else {
      this.stationService.reactivateStation(station.id).subscribe({
        next: () => {
          this.notificationService.showSuccess(this.translocoService.translate('messages.stationActivated'));
          this.loadStations();
        },
        error: (error: any) => {
          console.error('Error reactivating station:', error);
          this.notificationService.showError(this.translocoService.translate('messages.errorOccurred'));
        },
      });
    }
  }

  deleteStation(station: Station) {
    // Confirm before delete
    const confirmMessage = `Êtes-vous sûr de vouloir supprimer définitivement la station ${station.name} ? Cette action est irréversible.`;

    if (confirm(confirmMessage)) {
      this.stationService.deleteStation(station.id).subscribe({
        next: () => {
          this.notificationService.showSuccess(this.translocoService.translate('messages.stationDeleted'));
          this.loadStations();
        },
        error: (error: any) => {
          console.error('Error deleting station:', error);
          this.notificationService.showError(this.translocoService.translate('messages.errorOccurred'));
        },
      });
    }
  }

  // Permission methods
  canCreateStation(): boolean {
    const currentUserRole = this.authService.userRole();
    return (
      currentUserRole === UserRole.ADMIN || currentUserRole === UserRole.MANAGER || currentUserRole === UserRole.HANDLER
    );
  }

  canEditStation(): boolean {
    const currentUserRole = this.authService.userRole();
    return (
      currentUserRole === UserRole.ADMIN || currentUserRole === UserRole.MANAGER || currentUserRole === UserRole.HANDLER
    );
  }

  canDeleteStation(): boolean {
    const currentUserRole = this.authService.userRole();
    return currentUserRole === UserRole.ADMIN || currentUserRole === UserRole.MANAGER;
  }

  canToggleStatus(): boolean {
    const currentUserRole = this.authService.userRole();
    return (
      currentUserRole === UserRole.ADMIN || currentUserRole === UserRole.MANAGER || currentUserRole === UserRole.HANDLER
    );
  }

  // TrackBy function for performance optimization
  trackByStationId(index: number, station: Station): string {
    return station.id;
  }

  trackByPage(index: number, page: number): number {
    return page;
  }

  // Helper methods for data display
  getStationNameOnly(station: Station): string {
    // Remove the group name in parentheses if it exists
    if (station.stationGroup && station.name.includes(`(${station.stationGroup.name})`)) {
      return station.name.replace(`(${station.stationGroup.name})`, '').trim();
    }
    return station.name;
  }

  getFullAddress(station: Station): string {
    const parts = [];
    if (station.address?.street) {
      parts.push(station.address.street);
    }
    if (station.address?.postalCode) {
      parts.push(station.address.postalCode);
    }
    if (station.address?.city) {
      parts.push(station.address.city);
    }
    return parts.length > 0 ? parts.join(', ') : '-';
  }

  getMainContact(station: Station): string {
    const mainContact = station.principalContactFromContacts || station.contacts?.[0];
    if (!mainContact) {
      return '-';
    }

    const parts = [];
    if (mainContact.name) {
      parts.push(mainContact.name);
    }
    if (mainContact.phone) {
      parts.push(mainContact.phone);
    }
    if (mainContact.email) {
      parts.push(mainContact.email);
    }
    return parts.length > 0 ? parts.join(' • ') : '-';
  }

  getMainContactFormatted(station: Station): { name: string; phone: string; email: string } {
    const mainContact = station.principalContactFromContacts || station.contacts?.[0];
    if (!mainContact) {
      return { name: '-', phone: '', email: '' };
    }

    return {
      name: mainContact.name || 'Contact Principal',
      phone: mainContact.phone || '',
      email: mainContact.email || '',
    };
  }

  getStationStatusClass(isActive: boolean): string {
    return isActive
      ? 'inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800'
      : 'inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800';
  }

  // Contact helper methods
  hasMainContact(station: Station): boolean {
    if (!station) return false;
    const mainContact = station.principalContactFromContacts || station.contacts?.[0];
    return mainContact !== undefined && mainContact !== null;
  }

  getContactTooltip(station: Station): string {
    const mainContact = station.principalContactFromContacts || station.contacts?.[0];
    if (!mainContact) {
      return 'No contact information available';
    }

    const tooltipParts: string[] = [];

    // Add name
    if (mainContact.name) {
      tooltipParts.push(`Name: ${mainContact.name}`);
    }

    // Add position if available
    if (mainContact.position) {
      tooltipParts.push(`Position: ${mainContact.position}`);
    }

    // Add phone if available
    if (mainContact.phone) {
      tooltipParts.push(`Phone: ${mainContact.phone}`);
    }

    // Add email if available
    if (mainContact.email) {
      tooltipParts.push(`Email: ${mainContact.email}`);
    }

    return tooltipParts.join('\n');
  }

  // Helper methods for contact panel data
  getAllContacts(station: Station): StationContact[] {
    const contacts = station.contacts || [];

    // Separate principal and regular contacts
    const principalContact = contacts.find(contact => contact.isPrimary);
    const regularContacts = contacts.filter(contact => !contact.isPrimary);

    // Sort regular contacts alphabetically by name
    const sortedRegularContacts = regularContacts.sort((a, b) =>
      (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' })
    );

    // Return principal contact first, then sorted regular contacts
    return principalContact ? [principalContact, ...sortedRegularContacts] : sortedRegularContacts;
  }

  getMainContactDetails(station: Station): StationContact | null {
    return station.principalContactFromContacts || station.contacts?.[0] || null;
  }

  // TrackBy function for contacts
  trackByContactId(index: number, contact: StationContact): string {
    return contact.id;
  }

  // Inline editing methods for contacts
  canEditContacts(): boolean {
    const currentUser = this.authService.currentUser();
    if (!currentUser) return false;

    // Allow admins, managers, and handlers to edit contacts (consistent with other station permissions)
    return (
      currentUser.role === UserRole.ADMIN ||
      currentUser.role === UserRole.MANAGER ||
      currentUser.role === UserRole.HANDLER
    );
  }

  startEditingContact(contact: StationContact): void {
    if (!this.canEditContacts()) return;

    this.editingContactId.set(contact.id);
    this.contactFormValues.set({
      name: contact.name,
      position: contact.position || '',
      phone: contact.phone || '',
      email: contact.email || '',
      isPrimary: contact.isPrimary || false,
    });
  }

  cancelContactEdit(): void {
    this.editingContactId.set(null);
    this.contactFormValues.set({
      name: '',
      position: '',
      phone: '',
      email: '',
      isPrimary: false,
    });
  }

  updateContactField(field: keyof UpdateStationContactRequest, event: Event | InputEvent): void {
    const target = event.target as HTMLInputElement;
    const value = field === 'isPrimary' ? target.checked : target.value;

    this.contactFormValues.update(currentValues => ({
      ...currentValues,
      [field]: value,
    }));
  }

  isContactFormValid(): boolean {
    const formValues = this.contactFormValues();

    // Name is required
    if (!formValues.name.trim()) {
      return false;
    }

    // Email validation if provided
    if (formValues.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formValues.email)) {
        return false;
      }
    }

    return true;
  }

  async saveContactEdit(): Promise<void> {
    if (!this.isContactFormValid() || this.contactUpdateLoading()) {
      return;
    }

    const contactId = this.editingContactId();
    if (!contactId) return;

    const formValues = this.contactFormValues();

    try {
      this.contactUpdateLoading.set(true);

      const updatedContact = await firstValueFrom(this.stationContactService.updateContact(contactId, formValues));

      // Update the station data to reflect the changes
      const currentStation = this.selectedContactStation();
      if (currentStation?.contacts) {
        const contactIndex = currentStation.contacts.findIndex(c => c.id === contactId);
        if (contactIndex !== -1) {
          currentStation.contacts[contactIndex] = updatedContact;
          this.selectedContactStation.set({ ...currentStation });
        }
      }

      // Also update in the main stations array
      const stations = this.stations();
      const stationIndex = stations.findIndex(s => s.id === currentStation?.id);
      if (stationIndex !== -1) {
        const stationContactIndex = stations[stationIndex].contacts?.findIndex(c => c.id === contactId);
        if (stationContactIndex !== undefined && stationContactIndex !== -1) {
          stations[stationIndex].contacts![stationContactIndex] = updatedContact;
          this.stations.set([...stations]);
        }
      }

      this.notificationService.showSuccess(
        await firstValueFrom(this.translocoService.selectTranslate('messages.contactUpdated'))
      );

      this.cancelContactEdit();
    } catch (error: any) {
      console.error('Error updating contact:', error);
      this.notificationService.showError(
        error.error?.message ||
          (await firstValueFrom(this.translocoService.selectTranslate('messages.contactUpdateError')))
      );
    } finally {
      this.contactUpdateLoading.set(false);
    }
  }
}
