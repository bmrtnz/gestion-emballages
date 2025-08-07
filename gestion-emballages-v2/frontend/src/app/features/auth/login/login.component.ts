import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { AuthService } from '@core/services/auth.service';
import { UserService } from '@core/services/user.service';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { User } from '@core/models/user.model';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LoadingSpinnerComponent
  ],
  template: `
    <div class="min-h-screen flex flex-col lg:flex-row bg-gray-50">
      <!-- Left Panel (Decorative) -->
      <div class="hidden lg:flex lg:w-1/2 relative items-center justify-center bg-gray-800">
        <div
          class="absolute inset-0 bg-cover bg-center"
          style="background-image: url('https://source.unsplash.com/random/1200x900?abstract')">
          <div class="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-transparent"></div>
        </div>
        <div class="relative text-center p-8 animate-fade-in">
          <div class="relative w-48 h-48 mb-6 mx-auto">
            <div class="absolute inset-0 bg-white/80 rounded-full"></div>
            <div class="absolute inset-2 bg-white/80 rounded-full"></div>
            <div class="relative w-full h-full p-6 flex items-center justify-center">
              <svg class="w-24 h-24 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
              </svg>
            </div>
          </div>
          <h1 class="text-5xl font-bold text-white mb-4 font-display">
            Ravi de vous revoir !
          </h1>
          <p class="text-xl text-gray-300 font-medium">
            Bienvenue sur le nouveau
            <span class="font-bold text-primary-400">Portail Embadif</span>
          </p>
        </div>
      </div>

      <!-- Right Panel (Login Form) -->
      <div class="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div class="max-w-md w-full">
          <div class="text-center mb-10">
            <h1 class="text-4xl font-bold text-gray-900 mb-2 font-display">Connexion</h1>
            <p class="text-lg text-gray-600">Entrez vos identifiants pour continuer.</p>
          </div>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" method="post" class="space-y-6">
            <!-- Email Field (Development Mode with User Selector) -->
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
                Adresse e-mail *
                <span *ngIf="isDevelopment()" class="text-xs text-orange-600 font-normal">(Mode développement)</span>
              </label>
              
              <!-- Development Mode: Compact User Selector -->
              <div *ngIf="isDevelopment()" class="mb-3">
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <polyline points="16,11 18,13 22,9"/>
                    </svg>
                  </div>
                  <select
                    class="block w-full pl-10 pr-3 py-2 border border-orange-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm bg-orange-50 text-orange-900"
                    (change)="onUserSelect($event)">
                    <option value="">Sélectionner un utilisateur test</option>
                    <option *ngFor="let user of availableUsers()" [value]="user.email">
                      {{ getRoleIcon(user.role) }} {{ user.nomComplet }} ({{ user.email }})
                    </option>
                  </select>
                </div>
              </div>
              
              <!-- Email Input -->
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <rect width="20" height="16" x="2" y="4" rx="2"/>
                    <path d="m22 7-10 5L2 7"/>
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  formControlName="email"
                  placeholder="vous@exemple.com"
                  autocomplete="username email"
                  class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm placeholder-gray-400"
                  [class.border-red-300]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
                />
              </div>
              
              <p *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched" class="mt-1 text-sm text-red-600">
                {{ getEmailError() }}
              </p>
            </div>

            <!-- Password Field -->
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Mot de passe *</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4.828-4.828z"/>
                    <circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/>
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  formControlName="password"
                  placeholder="••••••••"
                  autocomplete="current-password"
                  class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm placeholder-gray-400"
                  [class.border-red-300]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
                />
              </div>
              <p *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched" class="mt-1 text-sm text-red-600">
                {{ getPasswordError() }}
              </p>
            </div>

            <div class="flex items-center justify-between">
              <a href="#" class="text-sm font-medium text-primary-600 hover:text-primary-500">
                Mot de passe oublié ?
              </a>
            </div>

            <div>
              <button
                type="submit"
                [disabled]="loginForm.invalid || isLoading()"
                class="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200">
                
                <svg
                  *ngIf="isLoading()"
                  class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                
                {{ isLoading() ? 'Connexion...' : 'Se connecter' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  public isLoading = signal(false);
  public showPassword = signal(false);
  public availableUsers = signal<User[]>([]);

  public loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['Claude-Whale2025!', [Validators.required]]
  });

  ngOnInit(): void {
    if (this.isDevelopment()) {
      this.loadAvailableUsers();
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid && !this.isLoading()) {
      this.isLoading.set(true);
      
      const credentials = this.loginForm.value;
      
      this.authService.login(credentials).subscribe({
        next: () => {
          // Redirect to intended URL or dashboard
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
          this.router.navigate([returnUrl]);
        },
        error: () => {
          this.isLoading.set(false);
          // Error handling is done in the interceptor and service
        },
        complete: () => {
          this.isLoading.set(false);
        }
      });
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(show => !show);
  }

  getEmailError(): string {
    const emailControl = this.loginForm.get('email');
    if (emailControl?.errors && emailControl?.touched) {
      if (emailControl.errors['required']) {
        return "L'adresse email est requise";
      }
      if (emailControl.errors['email']) {
        return "Veuillez saisir une adresse email valide";
      }
    }
    return '';
  }

  getPasswordError(): string {
    const passwordControl = this.loginForm.get('password');
    if (passwordControl?.errors && passwordControl?.touched) {
      if (passwordControl.errors['required']) {
        return "Le mot de passe est requis";
      }
    }
    return '';
  }

  // Development-only methods
  isDevelopment(): boolean {
    return !environment.production;
  }

  private loadAvailableUsers(): void {
    // Use development endpoint that doesn't require authentication
    this.userService.getDevUsers().subscribe({
      next: (response) => {
        // Sort users by role hierarchy for better UX
        const sortedUsers = response.data.sort((a, b) => {
          const roleOrder = { Admin: 0, Manager: 1, Gestionnaire: 2, Station: 3, Fournisseur: 4 };
          const aOrder = roleOrder[a.role as keyof typeof roleOrder] ?? 999;
          const bOrder = roleOrder[b.role as keyof typeof roleOrder] ?? 999;
          
          if (aOrder !== bOrder) return aOrder - bOrder;
          return a.nomComplet.localeCompare(b.nomComplet);
        });
        
        this.availableUsers.set(sortedUsers);
      },
      error: (error) => {
        console.warn('Failed to load users for development selector:', error);
        this.availableUsers.set([]);
      }
    });
  }

  onUserSelect(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const selectedEmail = target.value;
    
    if (selectedEmail) {
      this.loginForm.patchValue({
        email: selectedEmail
      });
      
      // Auto-set default password
      this.loginForm.patchValue({
        password: 'Claude-Whale2025!'
      });
    }
  }

  getRoleIcon(role: string): string {
    const roleIcons: { [key: string]: string } = {
      'Admin': '🔐',
      'Manager': '👑', 
      'Gestionnaire': '⚙️',
      'Station': '🏪',
      'Fournisseur': '🏭'
    };
    return roleIcons[role] || '👤';
  }
}