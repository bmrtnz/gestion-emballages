import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-transfert-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900">Demandes de Transfert</h1>
      </div>
      
      <div class="bg-white shadow rounded-lg p-6">
        <div class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Module Transferts</h3>
          <p class="mt-1 text-sm text-gray-500">Ce module sera implémenté dans une version future.</p>
        </div>
      </div>
    </div>
  `
})
export class TransfertListComponent {
}