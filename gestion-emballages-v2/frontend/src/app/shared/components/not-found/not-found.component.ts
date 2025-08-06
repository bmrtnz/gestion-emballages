import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50">
      <div class="max-w-md w-full text-center">
        
        <!-- 404 Illustration -->
        <div class="mb-8">
          <svg class="mx-auto h-32 w-32 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.034 0-3.894.76-5.291 2.009M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <!-- Error Message -->
        <h1 class="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 class="text-2xl font-semibold text-gray-700 mb-4">Page non trouvée</h2>
        <p class="text-gray-600 mb-8">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>

        <!-- Actions -->
        <div class="space-y-4">
          <a routerLink="/dashboard" 
             class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200">
            <svg class="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Retour à l'accueil
          </a>
          
          <div>
            <button 
              type="button"
              (click)="goBack()"
              class="text-primary-600 hover:text-primary-500 font-medium transition-colors duration-200">
              ← Retour à la page précédente
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class NotFoundComponent {
  goBack(): void {
    window.history.back();
  }
}