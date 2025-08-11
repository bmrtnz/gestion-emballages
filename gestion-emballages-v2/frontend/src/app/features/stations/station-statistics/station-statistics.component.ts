import { Component, OnInit, inject, signal, computed, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StationService } from '@core/services/station.service';
import { StationStatistics } from '@core/models/station.model';
import { TranslocoModule } from '@jsverse/transloco';
import { 
  LucideAngularModule,
  Building2,
  CheckCircle,
  XCircle,
  Users,
  UserCheck,
  Factory,
  MapPin,
  Globe,
  BarChart3
} from 'lucide-angular';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

@Component({
  selector: 'app-station-statistics',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, TranslocoModule],
  template: `
    <!-- Loading State -->
    <div *ngIf="isLoading()" class="grid grid-cols-4 gap-3 mb-4">
      <div *ngFor="let i of [1,2,3,4]" class="bg-white rounded border border-gray-200 p-3 animate-pulse">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="p-1.5 bg-gray-200 rounded w-6 h-6"></div>
          </div>
          <div class="ml-2 flex-1 min-w-0">
            <div class="h-2 bg-gray-200 rounded w-3/4 mb-1"></div>
            <div class="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div *ngIf="error() && !isLoading()" class="bg-red-50 border border-red-200 rounded p-3 mb-4">
      <div class="text-red-600 font-medium text-sm">{{ 'common.error' | transloco }}</div>
      <div class="text-red-500 text-xs">{{ error() }}</div>
      <button 
        (click)="loadStatistics()" 
        class="mt-1 px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700">
        Réessayer
      </button>
    </div>
    
    <!-- Single Card with All Statistics -->
    <div *ngIf="!isLoading() && !error()" class="bg-white rounded-lg border border-gray-200 px-6">
      <!-- Main Statistics - Responsive Layout -->
      <div class="flex flex-col xl:flex-row xl:items-center xl:justify-start space-y-6 xl:space-y-0">
        
        <!-- Total Stations Section -->
        <div class="flex items-center space-x-3">
          <div class="p-2 bg-blue-100 rounded-lg">
            <lucide-angular 
              name="building-2" 
              class="w-5 h-5 text-blue-600"
              [size]="20">
            </lucide-angular>
          </div>
          <div>
            <div class="text-2xl font-semibold text-gray-900">{{ statistics().totalStations }}</div>
            <div class="text-gray-500 text-sm">{{ 'stations.totalStations' | transloco }}</div>
          </div>
        </div>

        <!-- Vertical Separator - Hidden on mobile -->
        <div class="hidden xl:block h-16 w-px bg-gray-300 mx-6"></div>

        <!-- Active/Inactive Stats Section -->
        <div class="space-y-2">
          <!-- Active Stations -->
          <div class="flex items-center space-x-2">
            <lucide-angular 
              name="check-circle" 
              class="w-4 h-4 text-green-600"
              [size]="16">
            </lucide-angular>
            <div class="flex items-baseline space-x-2">
              <span class="text-base font-medium text-gray-900">{{ statistics().activeStations }}</span>
              <span class="text-gray-500 text-xs">{{ 'common.active' | transloco | lowercase }} ({{ activePercentage() }}%)</span>
            </div>
          </div>

          <!-- Inactive Stations -->
          <div class="flex items-center space-x-2">
            <lucide-angular 
              name="x-circle" 
              class="w-4 h-4 text-red-600"
              [size]="16">
            </lucide-angular>
            <div class="flex items-baseline space-x-2">
              <span class="text-base font-medium text-gray-900">{{ statistics().inactiveStations }}</span>
              <span class="text-gray-500 text-xs">{{ 'common.inactive' | transloco | lowercase }} ({{ inactivePercentage() }}%)</span>
            </div>
          </div>
        </div>

        <!-- Second Vertical Separator - Hidden on mobile -->
        <div class="hidden xl:block h-16 w-px bg-gray-300 mx-6"></div>

        <!-- Station Type Stats Section -->
        <div class="space-y-2">
          <!-- Grouped Stations -->
          <div class="flex items-center space-x-2">
            <lucide-angular 
              name="users" 
              class="w-4 h-4 text-purple-600"
              [size]="16">
            </lucide-angular>
            <div class="flex items-baseline space-x-2">
              <span class="text-base font-medium text-gray-900">{{ statistics().groupedStations }}</span>
              <span class="text-gray-500 text-xs">{{ 'stations.grouped' | transloco | lowercase }} ({{ groupedPercentage() }}%)</span>
            </div>
          </div>

          <!-- Independent Stations -->
          <div class="flex items-center space-x-2">
            <lucide-angular 
              name="factory" 
              class="w-4 h-4 text-orange-600"
              [size]="16">
            </lucide-angular>
            <div class="flex items-baseline space-x-2">
              <span class="text-base font-medium text-gray-900">{{ statistics().independentStations }}</span>
              <span class="text-gray-500 text-xs">{{ 'stations.independent' | transloco | lowercase }} ({{ independentPercentage() }}%)</span>
            </div>
          </div>
        </div>

        <!-- Third Vertical Separator - Hidden on mobile -->
        <div class="hidden xl:block h-16 w-px bg-gray-300 mx-6"></div>

        <!-- Distribution Charts Section -->
        <div class="flex-1 overflow-visible">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <!-- Stations by Group Chart -->
            <div class="text-center" *ngIf="hasGroupData()">
              <div class="text-xs font-medium text-gray-700 mb-1">{{ 'stations.stationsByGroup' | transloco }}</div>
              <div class="h-20">
                <canvas #groupChart></canvas>
              </div>
            </div>
            
            <!-- Stations by City Chart -->
            <div class="text-center" *ngIf="hasCityData()">
              <div class="text-xs font-medium text-gray-700 mb-1">{{ 'stations.stationsByCity' | transloco }}</div>
              <div class="h-20">
                <canvas #cityChart></canvas>
              </div>
            </div>
            
            <!-- Stations by Country Chart -->
            <div class="text-center" *ngIf="hasCountryData()">
              <div class="text-xs font-medium text-gray-700 mb-1">{{ 'stations.stationsByCountry' | transloco }}</div>
              <div class="h-20">
                <canvas #countryChart></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class StationStatisticsComponent implements OnInit {
  private stationService = inject(StationService);
  
  @ViewChild('groupChart', { static: false }) groupChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('cityChart', { static: false }) cityChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('countryChart', { static: false }) countryChart!: ElementRef<HTMLCanvasElement>;
  
  private groupChartInstance?: Chart;
  private cityChartInstance?: Chart;
  private countryChartInstance?: Chart;

  constructor() {
    // Register Chart.js components
    Chart.register(...registerables, ChartDataLabels);
  }
  
  statistics = signal<StationStatistics>({
    totalStations: 0,
    activeStations: 0,
    inactiveStations: 0,
    groupedStations: 0,
    independentStations: 0,
    stationsByGroup: [],
    stationsByCity: [],
    stationsByCountry: []
  });

  isLoading = signal(false);
  error = signal<string | null>(null);

  activePercentage = computed(() => {
    const stats = this.statistics();
    if (stats.totalStations === 0) return 0;
    return Math.round((stats.activeStations / stats.totalStations) * 100);
  });

  inactivePercentage = computed(() => {
    const stats = this.statistics();
    if (stats.totalStations === 0) return 0;
    return Math.round((stats.inactiveStations / stats.totalStations) * 100);
  });

  groupedPercentage = computed(() => {
    const stats = this.statistics();
    if (stats.totalStations === 0) return 0;
    return Math.round((stats.groupedStations / stats.totalStations) * 100);
  });

  independentPercentage = computed(() => {
    const stats = this.statistics();
    if (stats.totalStations === 0) return 0;
    return Math.round((stats.independentStations / stats.totalStations) * 100);
  });

  hasGroupData = computed(() => {
    return this.statistics().stationsByGroup.length > 0;
  });

  hasCityData = computed(() => {
    return this.statistics().stationsByCity.length > 0;
  });

  hasCountryData = computed(() => {
    return this.statistics().stationsByCountry.length > 0;
  });

  ngOnInit() {
    this.loadStatistics();
  }

  loadStatistics() {
    this.isLoading.set(true);
    this.error.set(null);

    this.stationService.getStationStatistics().subscribe({
      next: (stats) => {
        this.statistics.set(stats);
        this.isLoading.set(false);
        // Create charts after data is loaded
        setTimeout(() => {
          this.createCharts();
        }, 100);
      },
      error: (error) => {
        console.error('Error loading station statistics:', error);
        this.error.set('Erreur lors du chargement des statistiques des stations');
        this.isLoading.set(false);
      }
    });
  }

  private createCharts() {
    this.createGroupChart();
    this.createCityChart();
    this.createCountryChart();
  }

  private createGroupChart() {
    if (this.groupChartInstance) {
      this.groupChartInstance.destroy();
    }

    if (!this.groupChart?.nativeElement || !this.hasGroupData()) {
      return;
    }

    const ctx = this.groupChart.nativeElement.getContext('2d');
    if (!ctx) return;

    const data = this.statistics().stationsByGroup.slice(0, 5); // Top 5 groups
    const labels = data.map(item => item.groupName);
    const values = data.map(item => item.count);
    const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'];

    this.groupChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: colors.slice(0, values.length),
          borderWidth: 0,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                return `${context.label}: ${context.parsed}`;
              }
            }
          }
        }
      }
    });
  }

  private createCityChart() {
    if (this.cityChartInstance) {
      this.cityChartInstance.destroy();
    }

    if (!this.cityChart?.nativeElement || !this.hasCityData()) {
      return;
    }

    const ctx = this.cityChart.nativeElement.getContext('2d');
    if (!ctx) return;

    const data = this.statistics().stationsByCity.slice(0, 5); // Top 5 cities
    const labels = data.map(item => item.city);
    const values = data.map(item => item.count);
    const colors = ['#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'];

    this.cityChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: colors.slice(0, values.length),
          borderWidth: 0,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                return `${context.label}: ${context.parsed}`;
              }
            }
          }
        }
      }
    });
  }

  private createCountryChart() {
    if (this.countryChartInstance) {
      this.countryChartInstance.destroy();
    }

    if (!this.countryChart?.nativeElement || !this.hasCountryData()) {
      return;
    }

    const ctx = this.countryChart.nativeElement.getContext('2d');
    if (!ctx) return;

    const data = this.statistics().stationsByCountry.slice(0, 5); // Top 5 countries
    const labels = data.map(item => item.country);
    const values = data.map(item => item.count);
    const colors = ['#059669', '#DC2626', '#7C3AED', '#EA580C', '#0891B2'];

    this.countryChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: colors.slice(0, values.length),
          borderWidth: 0,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                return `${context.label}: ${context.parsed}`;
              }
            }
          }
        }
      }
    });
  }
}