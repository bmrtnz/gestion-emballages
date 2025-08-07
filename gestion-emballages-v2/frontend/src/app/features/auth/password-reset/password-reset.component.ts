import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '@core/services/auth.service';
import { NotificationService } from '@core/services/notification.service';
import { ButtonComponent } from '@shared/components/ui/button.component';

@Component({
  selector: 'app-password-reset',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Réinitialiser votre mot de passe
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Entrez votre nouveau mot de passe ci-dessous
          </p>
        </div>

        <!-- Loading State -->
        <div *ngIf="validatingToken()" class="text-center">
          <div class="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-gray-500 bg-white">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Validation du lien en cours...
          </div>
        </div>

        <!-- Invalid Token -->
        <div *ngIf="!validatingToken() && !isValidToken()" class="rounded-md bg-red-50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">
                Lien invalide ou expiré
              </h3>
              <div class="mt-2 text-sm text-red-700">
                <p>Ce lien de réinitialisation n'est plus valide. Veuillez demander un nouveau lien de réinitialisation.</p>
              </div>
              <div class="mt-4">
                <ui-button
                  variant="outline"
                  size="sm"
                  (click)="goToLogin()">
                  Retour à la connexion
                </ui-button>
              </div>
            </div>
          </div>
        </div>

        <!-- Password Reset Form -->
        <form *ngIf="!validatingToken() && isValidToken()" [formGroup]="resetForm" (ngSubmit)="onSubmit()" class="mt-8 space-y-6">
          <div class="space-y-4">
            <!-- New Password -->
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
                Nouveau mot de passe *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                formControlName="password"
                required
                class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Entrez votre nouveau mot de passe"
                [class.border-red-300]="resetForm.get('password')?.invalid && resetForm.get('password')?.touched">
              
              <div *ngIf="resetForm.get('password')?.invalid && resetForm.get('password')?.touched" class="mt-1 text-sm text-red-600">
                <p *ngIf="resetForm.get('password')?.errors?.['required']">Le mot de passe est obligatoire</p>
                <p *ngIf="resetForm.get('password')?.errors?.['minlength']">Le mot de passe doit contenir au moins 6 caractères</p>
              </div>
            </div>

            <!-- Confirm Password -->
            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">
                Confirmer le mot de passe *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                formControlName="confirmPassword"
                required
                class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Confirmez votre nouveau mot de passe"
                [class.border-red-300]="resetForm.get('confirmPassword')?.invalid && resetForm.get('confirmPassword')?.touched">
              
              <div *ngIf="resetForm.get('confirmPassword')?.invalid && resetForm.get('confirmPassword')?.touched" class="mt-1 text-sm text-red-600">
                <p *ngIf="resetForm.get('confirmPassword')?.errors?.['required']">La confirmation est obligatoire</p>
                <p *ngIf="resetForm.get('confirmPassword')?.errors?.['passwordMismatch']">Les mots de passe ne correspondent pas</p>
              </div>
            </div>
          </div>

          <div>
            <ui-button
              type="submit"
              variant="primary"
              size="lg"
              class="w-full"
              [loading]="loading()"
              [disabled]="resetForm.invalid || loading()">
              Réinitialiser le mot de passe
            </ui-button>
          </div>

          <div class="text-center">
            <button
              type="button"
              class="text-sm text-blue-600 hover:text-blue-500"
              (click)="goToLogin()">
              Retour à la connexion
            </button>
          </div>
        </form>

        <!-- Success Message -->
        <div *ngIf="resetSuccessful()" class="rounded-md bg-green-50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-green-800">
                Mot de passe réinitialisé avec succès !
              </h3>
              <div class="mt-2 text-sm text-green-700">
                <p>Votre mot de passe a été modifié. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</p>
              </div>
              <div class="mt-4">
                <ui-button
                  variant="primary"
                  size="sm"
                  (click)="goToLogin()">
                  Se connecter
                </ui-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class PasswordResetComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  public validatingToken = signal(true);
  public loading = signal(false);
  public resetSuccessful = signal(false);
  public isValidToken = signal(false);
  
  private token: string | null = null;

  public resetForm: FormGroup = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  ngOnInit() {
    // Get token from URL query parameters
    this.token = this.route.snapshot.queryParams['token'];
    
    if (!this.token) {
      this.validatingToken.set(false);
      this.isValidToken.set(false);
      this.notificationService.showError('Token de réinitialisation manquant');
      return;
    }

    // For now, we'll assume the token is valid if it exists
    // In a real implementation, you might want to validate the token with the backend first
    this.validatingToken.set(false);
    this.isValidToken.set(true);
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  onSubmit() {
    if (this.resetForm.invalid || !this.token) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const { password } = this.resetForm.value;

    this.authService.resetPassword(this.token, password).subscribe({
      next: (response: any) => {
        this.resetSuccessful.set(true);
        this.notificationService.showSuccess('Mot de passe réinitialisé avec succès');
        this.loading.set(false);
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 3000);
      },
      error: (error: any) => {
        console.error('Password reset error:', error);
        this.loading.set(false);
        
        if (error.status === 400) {
          this.isValidToken.set(false);
          this.notificationService.showError('Token invalide ou expiré');
        } else {
          this.notificationService.showError('Erreur lors de la réinitialisation du mot de passe');
        }
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/auth/login']);
  }
}