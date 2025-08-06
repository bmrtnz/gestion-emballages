import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { AuthService } from '@core/services/auth.service';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';

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

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <!-- Email Field -->
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Adresse e-mail *</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  formControlName="email"
                  placeholder="vous@exemple.com"
                  autocomplete="email"
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
                  <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
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
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  public isLoading = signal(false);
  public showPassword = signal(false);

  public loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['password123', [Validators.required]]
  });

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
}