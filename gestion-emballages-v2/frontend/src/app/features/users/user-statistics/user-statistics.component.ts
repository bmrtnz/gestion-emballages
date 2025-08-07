import { Component, OnInit, inject, signal, computed, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '@core/services/user.service';
import { UserRole } from '@core/models/user.model';
import { 
  LucideAngularModule,
  Users,
  CheckCircle,
  XCircle,
  UserCheck,
  Building2,
  Truck,
  Settings,
  ShieldCheck,
  Building,
  Package
} from 'lucide-angular';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  roleDistribution: {
    [key in UserRole]?: number;
  };
  stationUsers: number;
  fournisseurUsers: number;
}

@Component({
  selector: 'app-user-statistics',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
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
      <div class="text-red-600 font-medium text-sm">Erreur</div>
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
        
        <!-- Total Users Section -->
        <div class="flex items-center space-x-3">
          <div class="p-2 bg-pink-100 rounded-lg">
            <lucide-angular 
              name="users" 
              class="w-5 h-5 text-pink-600"
              [size]="20">
            </lucide-angular>
          </div>
          <div>
            <div class="text-2xl font-semibold text-gray-900">{{ statistics().totalUsers }}</div>
            <div class="text-gray-500 text-sm">Utilisateurs</div>
          </div>
        </div>

        <!-- Vertical Separator - Hidden on mobile -->
        <div class="hidden xl:block h-16 w-px bg-gray-300 mx-6"></div>

        <!-- Active/Inactive Stats Section -->
        <div class="space-y-2">
          <!-- Active Users -->
          <div class="flex items-center space-x-2">
            <lucide-angular 
              name="check-circle" 
              class="w-4 h-4 text-green-600"
              [size]="16">
            </lucide-angular>
            <div class="flex items-baseline space-x-2">
              <span class="text-base font-medium text-gray-900">{{ statistics().activeUsers }}</span>
              <span class="text-gray-500 text-xs">actifs ({{ activePercentage() }}%)</span>
            </div>
          </div>

          <!-- Inactive Users -->
          <div class="flex items-center space-x-2">
            <lucide-angular 
              name="x-circle" 
              class="w-4 h-4 text-red-600"
              [size]="16">
            </lucide-angular>
            <div class="flex items-baseline space-x-2">
              <span class="text-base font-medium text-gray-900">{{ statistics().inactiveUsers }}</span>
              <span class="text-gray-500 text-xs">inactifs ({{ inactivePercentage() }}%)</span>
            </div>
          </div>
        </div>

        <!-- Second Vertical Separator - Hidden on mobile -->
        <div class="hidden xl:block h-16 w-px bg-gray-300 mx-6"></div>

        <!-- Role Distribution Chart Section -->
        <div class="flex-1 overflow-visible">
          <div class="w-full max-w-lg h-24">
            <canvas #roleChart></canvas>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class UserStatisticsComponent implements OnInit {
  private userService = inject(UserService);
  
  @ViewChild('roleChart', { static: false }) roleChart!: ElementRef<HTMLCanvasElement>;
  private chart?: Chart;
  
  // Icon names for Lucide Angular
  readonly icons = {
    users: Users,
    checkCircle: CheckCircle, 
    xCircle: XCircle,
    building2: Building2,
    shieldCheck: ShieldCheck,
    settings: Settings,
    building: Building,
    truck: Truck
  };

  constructor() {
    // Register Chart.js components
    Chart.register(...registerables, ChartDataLabels);
  }
  
  statistics = signal<UserStatistics>({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    roleDistribution: {},
    stationUsers: 0,
    fournisseurUsers: 0
  });

  isLoading = signal(false);
  error = signal<string | null>(null);

  activePercentage = computed(() => {
    const stats = this.statistics();
    if (stats.totalUsers === 0) return 0;
    return Math.round((stats.activeUsers / stats.totalUsers) * 100);
  });

  inactivePercentage = computed(() => {
    const stats = this.statistics();
    if (stats.totalUsers === 0) return 0;
    return Math.round((stats.inactiveUsers / stats.totalUsers) * 100);
  });

  UserRole = UserRole; // Make UserRole available in template

  ngOnInit() {
    this.loadStatistics();
  }

  loadStatistics() {
    this.isLoading.set(true);
    this.error.set(null);

    // Fetch all users to calculate statistics
    // In a production app, you might want to create a dedicated endpoint for statistics
    this.userService.getUsers({ limit: 1000 }).subscribe({
      next: (response) => {
        const users = response.data;
        
        const stats: UserStatistics = {
          totalUsers: users.length,
          activeUsers: users.filter(u => u.isActive).length,
          inactiveUsers: users.filter(u => !u.isActive).length,
          roleDistribution: {},
          stationUsers: users.filter(u => u.role === UserRole.STATION).length,
          fournisseurUsers: users.filter(u => u.role === UserRole.SUPPLIER).length
        };

        // Calculate role distribution
        users.forEach(user => {
          stats.roleDistribution[user.role] = (stats.roleDistribution[user.role] || 0) + 1;
        });

        this.statistics.set(stats);
        this.isLoading.set(false);
        this.createRoleChart();
      },
      error: (error) => {
        console.error('Error loading user statistics:', error);
        this.error.set('Erreur lors du chargement des statistiques');
        this.isLoading.set(false);
      }
    });
  }

  private createRoleChart() {
    if (this.chart) {
      this.chart.destroy();
    }

    if (!this.roleChart?.nativeElement) {
      setTimeout(() => this.createRoleChart(), 100);
      return;
    }

    const ctx = this.roleChart.nativeElement.getContext('2d');
    if (!ctx) {
      console.error('Could not get canvas context');
      return;
    }

    const roleDistribution = this.statistics().roleDistribution;
    const roleLabels: string[] = [];
    const roleData: number[] = [];
    const roleColors: string[] = [];

    // Define role colors and labels - matching user list badge background colors
    const roleConfig = {
      [UserRole.ADMIN]: { label: 'Admin', color: '#FEE2E2' }, // red-100
      [UserRole.MANAGER]: { label: 'Manager', color: '#F3E8FF' }, // purple-100
      [UserRole.HANDLER]: { label: 'Gestionnaire', color: '#DBEAFE' }, // blue-100
      [UserRole.STATION]: { label: 'Station', color: '#DCFCE7' }, // green-100
      [UserRole.SUPPLIER]: { label: 'Fournisseur', color: '#FED7AA' } // orange-100
    };

    // Prepare data for chart
    Object.entries(roleDistribution).forEach(([role, count]) => {
      if (count && count > 0) {
        const config = roleConfig[role as UserRole];
        if (config) {
          roleLabels.push(config.label);
          roleData.push(count);
          roleColors.push(config.color);
        }
      }
    });

    if (roleData.length === 0) {
      return;
    }

    const chartConfig: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels: ['Utilisateurs par Rôle'],
        datasets: roleLabels.map((label, i) => ({
          label: label,
          data: [roleData[i]],
          backgroundColor: roleColors[i],
          borderWidth: 0,
          barThickness: 40
        }))
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false, // Disable all animations
        indexAxis: 'y' as const,
        scales: {
          x: {
            stacked: true,
            beginAtZero: true,
            display: false
          },
          y: {
            stacked: true,
            display: false
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'right',
            align: 'center',
            labels: {
              usePointStyle: true,
              pointStyle: 'rect',
              padding: 8,
              boxWidth: 10,
              boxHeight: 10,
              font: {
                size: 11,
                family: 'Inter, sans-serif'
              }
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                return `${context.dataset.label}: ${context.parsed.x}`;
              }
            }
          },
          datalabels: {
            display: true,
            color: (context) => {
              // Use badge text colors based on role
              const roleTextColors = {
                [UserRole.ADMIN]: '#991B1B', // red-800
                [UserRole.MANAGER]: '#581C87', // purple-800
                [UserRole.HANDLER]: '#1E40AF', // blue-800
                [UserRole.STATION]: '#166534', // green-800
                [UserRole.SUPPLIER]: '#9A3412' // orange-800
              };
              
              const datasets = context.chart.data.datasets;
              if (datasets && datasets.length > context.datasetIndex) {
                const dataset = datasets[context.datasetIndex];
                const label = dataset.label;
                
                // Find matching role
                for (const [role, config] of Object.entries({
                  [UserRole.ADMIN]: 'Admin',
                  [UserRole.MANAGER]: 'Manager',
                  [UserRole.HANDLER]: 'Gestionnaire',
                  [UserRole.STATION]: 'Station',
                  [UserRole.SUPPLIER]: 'Fournisseur'
                })) {
                  if (config === label) {
                    return roleTextColors[role as UserRole];
                  }
                }
              }
              return '#374151'; // gray-700 fallback
            },
            font: {
              weight: 'bold',
              size: 12
            },
            anchor: 'center',
            align: 'center',
            formatter: (value: number) => {
              return value.toString();
            }
          }
        },
        layout: {
          padding: {
            left: 10,
            right: 100,
            top: 10,
            bottom: 10
          }
        }
      }
    };

    try {
      this.chart = new Chart(ctx, chartConfig);
    } catch (error) {
      console.error('Error creating chart:', error);
    }
  }
}