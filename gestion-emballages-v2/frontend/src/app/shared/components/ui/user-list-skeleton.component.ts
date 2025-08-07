import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-list-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen">
      <!-- Page Header Skeleton -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <div class="h-8 bg-gray-200 rounded animate-pulse mb-2 w-48"></div>
          <div class="h-4 bg-gray-200 rounded animate-pulse w-80"></div>
        </div>
        <!-- Button Skeleton -->
        <div class="h-10 bg-gray-200 rounded animate-pulse w-40"></div>
      </div>
      
      <div class="space-y-6">

        <!-- Search and Filters Skeleton -->
        <div class="bg-gray-50 rounded-lg p-4 mb-6">
          <div class="flex items-center space-x-4 mb-4">
            <div class="h-10 bg-gray-200 rounded animate-pulse w-20"></div>
            <div class="flex-1 h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        <!-- Desktop Table Skeleton -->
        <div class="hidden md:block">
          <div class="overflow-hidden">
            <!-- Table Header -->
            <div class="bg-gray-50 px-6 py-3 grid grid-cols-5 gap-4">
              <div class="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div class="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div class="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div class="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div class="h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
            
            <!-- Table Rows -->
            <div class="bg-white divide-y divide-gray-200">
              <div *ngFor="let item of [1,2,3,4,5,6,7,8]" class="px-6 py-4 grid grid-cols-5 gap-4 items-center">
                <!-- User Info -->
                <div class="space-y-2">
                  <div class="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                  <div class="h-3 bg-gray-200 rounded animate-pulse w-40"></div>
                </div>
                
                <!-- Role -->
                <div class="h-6 bg-gray-200 rounded-full animate-pulse w-20"></div>
                
                <!-- Entity -->
                <div class="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                
                <!-- Status -->
                <div class="h-6 bg-gray-200 rounded-full animate-pulse w-16"></div>
                
                <!-- Actions -->
                <div class="flex justify-end space-x-2">
                  <div class="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                  <div class="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                  <div class="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Mobile Cards Skeleton -->
        <div class="md:hidden space-y-4 p-4">
          <div *ngFor="let item of [1,2,3,4,5]" class="border border-gray-200 rounded-lg p-4 space-y-3">
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1 space-y-2">
                <div class="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                <div class="h-3 bg-gray-200 rounded animate-pulse w-40"></div>
              </div>
              <div class="h-6 bg-gray-200 rounded-full animate-pulse w-16"></div>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <div class="h-3 bg-gray-200 rounded animate-pulse w-12"></div>
                <div class="h-3 bg-gray-200 rounded animate-pulse w-20"></div>
              </div>
              <div class="space-y-1">
                <div class="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
                <div class="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
              </div>
            </div>
            
            <div class="flex justify-end space-x-2 pt-2 border-t border-gray-100">
              <div class="h-6 bg-gray-200 rounded animate-pulse w-12"></div>
              <div class="h-6 bg-gray-200 rounded animate-pulse w-16"></div>
              <div class="h-6 bg-gray-200 rounded animate-pulse w-20"></div>
            </div>
          </div>
        </div>

        <!-- Pagination Skeleton -->
        <div class="flex items-center justify-between border-t border-gray-200 px-0 py-3">
          <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div class="h-4 bg-gray-200 rounded animate-pulse w-48"></div>
            <div class="flex items-center space-x-2">
              <div class="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
              <div class="h-8 bg-gray-200 rounded animate-pulse w-16"></div>
              <div class="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
            </div>
            <div class="flex space-x-1">
              <div *ngFor="let page of [1,2,3,4,5]" class="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div> <!-- Close space-y-6 wrapper -->
    </div>
  `,
  styles: []
})
export class UserListSkeletonComponent {
}