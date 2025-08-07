import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserListComponent } from './user-list/user-list.component';

@Component({
  selector: 'app-user-page',
  standalone: true,
  imports: [CommonModule, UserListComponent],
  template: `
    <div class="min-h-screen">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Utilisateurs</h1>
      <p class="mt-1 text-sm text-gray-500 mb-8">Gérez les utilisateurs de la plateforme ici.</p>
      
      <app-user-list></app-user-list>
    </div>
  `,
  styles: []
})
export class UserPageComponent {}