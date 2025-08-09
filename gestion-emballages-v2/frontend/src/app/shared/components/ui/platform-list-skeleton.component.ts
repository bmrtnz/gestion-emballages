import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-platform-list-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <!-- Header skeleton -->
      <div class="flex justify-between items-center">
        <div>
          <div class="h-8 w-40 bg-gray-200 rounded animate-pulse"></div>
          <div class="h-5 w-56 bg-gray-200 rounded animate-pulse mt-2"></div>
        </div>
        <div class="h-10 w-36 bg-gray-200 rounded animate-pulse"></div>
      </div>

      <!-- Search and filters skeleton -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex items-center space-x-4 mb-4">
          <div class="h-10 w-20 bg-gray-200 rounded animate-pulse"></div>
          <div class="flex-1 h-10 bg-gray-200 rounded animate-pulse"></div>
        </div>
        
        <div *ngIf="showFilters" class="border-t pt-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div *ngFor="let item of [1,2,3]" class="space-y-2">
              <div class="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
              <div class="h-10 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
          <div class="flex justify-end">
            <div class="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>

      <!-- Table skeleton -->
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <!-- Desktop table skeleton -->
        <div class="hidden md:block">
          <table class="min-w-full">
            <thead class="bg-gray-50">
              <tr>
                <th *ngFor="let header of headers" class="px-6 py-3">
                  <div class="h-4 bg-gray-200 rounded animate-pulse"></div>
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let row of skeletonRows" class="hover:bg-gray-50">
                <td *ngFor="let cell of headers" class="px-6 py-4">
                  <div class="h-4 bg-gray-200 rounded animate-pulse" 
                       [style.width]="getSkeletonWidth()"></div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile cards skeleton -->
        <div class="md:hidden space-y-4 p-4">
          <div *ngFor="let card of skeletonRows" 
               class="border border-gray-200 rounded-lg p-4 space-y-3">
            <div class="flex justify-between items-start">
              <div class="flex-1 space-y-2">
                <div class="h-5 w-36 bg-gray-200 rounded animate-pulse"></div>
                <div class="h-4 w-28 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div class="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
            </div>
            
            <div class="space-y-2">
              <div class="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
              <div class="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
            </div>

            <div class="grid grid-cols-2 gap-4 text-sm">
              <div class="space-y-2">
                <div class="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                <div class="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div class="space-y-2">
                <div class="h-4 w-18 bg-gray-200 rounded animate-pulse"></div>
                <div class="h-4 w-14 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>

            <div class="flex justify-end space-x-2 pt-2 border-t border-gray-100">
              <div class="h-8 w-12 bg-gray-200 rounded animate-pulse"></div>
              <div class="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
              <div class="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination skeleton -->
      <div class="flex items-center justify-between">
        <div class="h-5 w-52 bg-gray-200 rounded animate-pulse"></div>
        <div class="flex items-center space-x-2">
          <div class="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
          <div class="flex space-x-1">
            <div *ngFor="let page of [1,2,3,4,5]" 
                 class="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div class="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  `
})
export class PlatformListSkeletonComponent {
  @Input() showFilters: boolean = false;
  @Input() headers: string[] = ['Plateforme', 'Ville', 'Stations', 'Contacts', 'Statut', 'Actions'];
  @Input() rowCount: number = 5;

  get skeletonRows() {
    return Array(this.rowCount).fill(0).map((_, i) => i);
  }

  getSkeletonWidth(): string {
    const widths = ['60%', '80%', '40%', '70%', '50%', '90%'];
    return widths[Math.floor(Math.random() * widths.length)];
  }
}