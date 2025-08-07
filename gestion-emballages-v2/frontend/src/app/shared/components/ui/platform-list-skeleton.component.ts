import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-platform-list-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen">
      <!-- Static header content - renders immediately -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div class="h-6 bg-gray-200 rounded animate-pulse mb-2 w-64"></div>
        <div class="h-4 bg-gray-200 rounded animate-pulse w-96"></div>
      </div>

      <!-- Main content skeleton -->
      <div class="space-y-6">
        <!-- Header with create button -->
        <div class="flex items-center justify-between">
          <div class="h-10 bg-gray-200 rounded animate-pulse w-40"></div>
        </div>

        <!-- Search and Filters skeleton -->
        <div class="space-y-4">
          <div class="flex items-center space-x-4">
            <div class="h-10 bg-gray-200 rounded animate-pulse w-20"></div>
            <div class="flex-1 h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        <!-- Cards grid skeleton -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div *ngFor="let item of [1,2,3,4,5,6]" class="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <!-- Platform header -->
            <div class="flex items-start justify-between">
              <div class="space-y-2 flex-1">
                <div class="h-5 bg-gray-200 rounded animate-pulse w-32"></div>
                <div class="h-4 bg-gray-200 rounded animate-pulse w-40"></div>
              </div>
              <div class="h-6 bg-gray-200 rounded-full animate-pulse w-16"></div>
            </div>
            
            <!-- Platform details -->
            <div class="space-y-2">
              <div class="flex items-center space-x-2">
                <div class="h-4 bg-gray-200 rounded animate-pulse w-12"></div>
                <div class="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
              </div>
              <div class="flex items-center space-x-2">
                <div class="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                <div class="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
              </div>
              <div class="flex items-center space-x-2">
                <div class="h-4 bg-gray-200 rounded animate-pulse w-14"></div>
                <div class="h-4 bg-gray-200 rounded animate-pulse w-28"></div>
              </div>
            </div>
            
            <!-- Actions -->
            <div class="flex justify-end space-x-2 pt-4 border-t border-gray-100">
              <div class="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
              <div class="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
              <div class="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>

        <!-- Pagination skeleton -->
        <div class="flex items-center justify-between border-t border-gray-200 pt-6">
          <div class="h-4 bg-gray-200 rounded animate-pulse w-48"></div>
          <div class="flex space-x-1">
            <div *ngFor="let page of [1,2,3,4,5]" class="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class PlatformListSkeletonComponent {
}