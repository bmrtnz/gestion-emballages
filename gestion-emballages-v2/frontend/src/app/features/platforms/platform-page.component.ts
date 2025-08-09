import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { LucideAngularModule } from 'lucide-angular';
import { PlatformListComponent } from './platform-list/platform-list.component';
import { PlatformStatisticsComponent } from './platform-statistics/platform-statistics.component';

@Component({
  selector: 'app-platform-page',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, PlatformListComponent, PlatformStatisticsComponent],
  template: `
    <div class="min-h-screen">
      <!-- Page Header with Expandable Statistics -->
      <div class="mb-8">
        <!-- Title Row with Statistics Icon and Chevron -->
        <div class="flex items-center mb-2">
          <h1 class="text-3xl font-bold text-gray-900">Plateformes</h1>
          <lucide-angular 
            name="chart-column" 
            class="w-6 h-6 text-gray-400 ml-3"
            [size]="24">
          </lucide-angular>
          <button 
            (click)="toggleStatistics()"
            class="ml-2 p-1.5 rounded-md hover:bg-gray-100 transition-colors"
            [attr.aria-expanded]="showStatistics()"
            [attr.aria-label]="showStatistics() ? 'Masquer les statistiques' : 'Afficher les statistiques'">
            <lucide-angular 
              [name]="showStatistics() ? 'chevron-up' : 'chevron-down'" 
              class="w-5 h-5 text-gray-500"
              [size]="20">
            </lucide-angular>
          </button>
        </div>
        
        <p class="text-sm text-gray-500">
          Gérez les plateformes et leurs sites.
        </p>

        <!-- Expandable Statistics Panel -->
        <div 
          *ngIf="showStatistics()"
          class="mt-6 bg-gray-100 rounded-lg p-4 border border-gray-200">
          <app-platform-statistics></app-platform-statistics>
        </div>
      </div>
      
      <!-- Platform List -->
      <app-platform-list></app-platform-list>
    </div>
  `,
  styles: [],
  animations: [
    // Simple slide down animation
    trigger('slideDown', [
      transition(':enter', [
        style({ height: '0', opacity: '0', overflow: 'hidden' }),
        animate('200ms ease-out', style({ height: '*', opacity: '1' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ height: '0', opacity: '0' }))
      ])
    ])
  ]
})
export class PlatformPageComponent {
  showStatistics = signal(false);

  toggleStatistics() {
    this.showStatistics.update(current => !current);
  }
}