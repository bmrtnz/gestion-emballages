import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { PlatformService } from '@core/services/platform.service';

interface PlatformStatistics {
  totalPlatforms: number;
  activePlatforms: number;
  inactivePlatforms: number;
  uniqueSpecialties: number;
}

@Component({
  selector: 'app-platform-statistics',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Total Platforms -->
      <div class="bg-white rounded-lg p-4 shadow-sm">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <lucide-angular name="building-2" class="w-8 h-8 text-blue-600" [size]="32"></lucide-angular>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-600">Total plateformes</p>
            <p class="text-2xl font-semibold text-gray-900">{{ statistics().totalPlatforms }}</p>
          </div>
        </div>
      </div>
      
      <!-- Active Platforms -->
      <div class="bg-white rounded-lg p-4 shadow-sm">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <lucide-angular name="check-circle" class="w-8 h-8 text-green-600" [size]="32"></lucide-angular>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-600">Actives</p>
            <p class="text-2xl font-semibold text-gray-900">{{ statistics().activePlatforms }}</p>
          </div>
        </div>
      </div>
      
      <!-- Unique Specialties -->
      <div class="bg-white rounded-lg p-4 shadow-sm">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <lucide-angular name="tag" class="w-8 h-8 text-orange-600" [size]="32"></lucide-angular>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-600">Spécialités</p>
            <p class="text-2xl font-semibold text-gray-900">{{ statistics().uniqueSpecialties }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div *ngIf="loading()" class="flex justify-center items-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <!-- Error State -->
    <div *ngIf="error()" class="text-center py-8">
      <lucide-angular name="alert-circle" class="w-12 h-12 text-red-500 mx-auto mb-2" [size]="48"></lucide-angular>
      <p class="text-red-600">Erreur lors du chargement des statistiques</p>
    </div>
  `,
  styles: []
})
export class PlatformStatisticsComponent implements OnInit {
  private platformService = inject(PlatformService);
  
  loading = signal(true);
  error = signal(false);
  statistics = signal<PlatformStatistics>({
    totalPlatforms: 0,
    activePlatforms: 0,
    inactivePlatforms: 0,
    uniqueSpecialties: 0
  });

  ngOnInit() {
    this.loadStatistics();
  }

  private async loadStatistics() {
    try {
      this.loading.set(true);
      this.error.set(false);

      // Load all platforms with pagination to get statistics
      const response = await this.platformService.getAll({
        page: 1,
        limit: 1000 // Get all platforms for statistics
      }).toPromise();

      if (response) {
        const platforms = response.data;
        const activePlatforms = platforms.filter(p => p.isActive).length;
        
        // Get unique specialties
        const allSpecialties = platforms.flatMap(p => p.specialties || []);
        const uniqueSpecialties = new Set(allSpecialties).size;

        this.statistics.set({
          totalPlatforms: platforms.length,
          activePlatforms: activePlatforms,
          inactivePlatforms: platforms.length - activePlatforms,
          uniqueSpecialties: uniqueSpecialties
        });
      }
    } catch (error) {
      console.error('Error loading platform statistics:', error);
      this.error.set(true);
    } finally {
      this.loading.set(false);
    }
  }
}