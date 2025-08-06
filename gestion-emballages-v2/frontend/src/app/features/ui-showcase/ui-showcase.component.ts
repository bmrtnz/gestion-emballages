import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { 
  ButtonComponent, 
  InputComponent, 
  ModalComponent, 
  CardComponent, 
  DropdownComponent,
  type DropdownItem 
} from '@shared/components/ui';

@Component({
  selector: 'app-ui-showcase',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    InputComponent,
    ModalComponent,
    CardComponent,
    DropdownComponent
  ],
  template: `
    <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        
        <!-- Header -->
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 mb-4 font-display">
            Composants UI
          </h1>
          <p class="text-xl text-gray-600">
            Système de design avec Tailwind CSS et thème Embadif
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">

          <!-- Buttons Section -->
          <ui-card title="Boutons" subtitle="Différentes variantes et tailles">
            <div class="space-y-4">
              
              <!-- Button Variants -->
              <div>
                <h4 class="text-sm font-medium text-gray-700 mb-3">Variantes</h4>
                <div class="flex flex-wrap gap-3">
                  <ui-button variant="primary">Primary</ui-button>
                  <ui-button variant="secondary">Secondary</ui-button>
                  <ui-button variant="accent">Accent</ui-button>
                  <ui-button variant="outline">Outline</ui-button>
                  <ui-button variant="ghost">Ghost</ui-button>
                  <ui-button variant="danger">Danger</ui-button>
                </div>
              </div>

              <!-- Button Sizes -->
              <div>
                <h4 class="text-sm font-medium text-gray-700 mb-3">Tailles</h4>
                <div class="flex flex-wrap items-center gap-3">
                  <ui-button size="xs">Extra Small</ui-button>
                  <ui-button size="sm">Small</ui-button>
                  <ui-button size="md">Medium</ui-button>
                  <ui-button size="lg">Large</ui-button>
                  <ui-button size="xl">Extra Large</ui-button>
                </div>
              </div>

              <!-- Button States -->
              <div>
                <h4 class="text-sm font-medium text-gray-700 mb-3">États</h4>
                <div class="flex flex-wrap gap-3">
                  <ui-button [loading]="true">Loading</ui-button>
                  <ui-button [disabled]="true">Disabled</ui-button>
                  <ui-button [block]="true">Block</ui-button>
                </div>
              </div>

            </div>
          </ui-card>

          <!-- Inputs Section -->
          <ui-card title="Champs de saisie" subtitle="Inputs avec validation et icônes">
            <form [formGroup]="sampleForm" class="space-y-4">
              
              <ui-input
                label="Email"
                type="email"
                placeholder="votre@email.com"
                formControlName="email"
                helpText="Saisissez votre adresse email"
                [clearable]="true">
                
                <svg iconLeft class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </ui-input>

              <ui-input
                label="Mot de passe"
                type="password"
                placeholder="••••••••"
                formControlName="password"
                [required]="true">
                
                <svg iconLeft class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </ui-input>

              <ui-input
                label="Recherche"
                type="search"
                placeholder="Rechercher..."
                size="lg"
                formControlName="search">
                
                <svg iconLeft class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </ui-input>

            </form>
          </ui-card>

          <!-- Dropdown Section -->
          <ui-card title="Listes déroulantes" subtitle="Sélection simple et multiple">
            <div class="space-y-4">
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Sélection simple
                </label>
                <ui-dropdown
                  [items]="dropdownItems()"
                  placeholder="Choisir une option"
                  (selectionChange)="onSelectionChange($event)">
                </ui-dropdown>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Avec icône
                </label>
                <ui-dropdown
                  [items]="dropdownItems()"
                  placeholder="Sélectionner"
                  icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  variant="outline">
                </ui-dropdown>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Multiple
                </label>
                <ui-dropdown
                  [items]="dropdownItems()"
                  placeholder="Sélection multiple"
                  [multiple]="true"
                  size="lg">
                </ui-dropdown>
              </div>

            </div>
          </ui-card>

          <!-- Modal Section -->
          <ui-card title="Modales" subtitle="Dialogues et fenêtres modales">
            <div class="space-y-4">
              
              <ui-button (click)="openModal('simple')" variant="primary">
                Modale simple
              </ui-button>

              <ui-button (click)="openModal('with-footer')" variant="accent">
                Avec footer
              </ui-button>

              <ui-button (click)="openModal('large')" variant="outline">
                Grande modale
              </ui-button>

            </div>
          </ui-card>

          <!-- Cards Section -->
          <ui-card title="Cartes" subtitle="Différents styles de cartes">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <ui-card variant="default" [hoverable]="true">
                <h4 class="font-medium text-gray-900 mb-2">Carte par défaut</h4>
                <p class="text-sm text-gray-500">
                  Contenu de la carte avec style par défaut.
                </p>
              </ui-card>

              <ui-card variant="elevated">
                <h4 class="font-medium text-gray-900 mb-2">Carte élevée</h4>
                <p class="text-sm text-gray-500">
                  Avec une ombre plus prononcée.
                </p>
              </ui-card>

              <ui-card variant="outlined">
                <h4 class="font-medium text-gray-900 mb-2">Carte outlined</h4>
                <p class="text-sm text-gray-500">
                  Avec bordure épaisse.
                </p>
              </ui-card>

              <ui-card variant="ghost">
                <h4 class="font-medium text-gray-900 mb-2">Carte ghost</h4>
                <p class="text-sm text-gray-500">
                  Style minimal sans bordure.
                </p>
              </ui-card>

            </div>
          </ui-card>

        </div>

        <!-- Sample Modals -->
        <ui-modal
          [isOpen]="currentModal() === 'simple'"
          title="Modale Simple"
          description="Ceci est une modale basique avec titre et description."
          (modalClose)="closeModal()">
          
          <p class="text-gray-600">
            Contenu de la modale. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </p>
        </ui-modal>

        <ui-modal
          [isOpen]="currentModal() === 'with-footer'"
          title="Modale avec Footer"
          (modalClose)="closeModal()">
          
          <p class="text-gray-600 mb-4">
            Cette modale a un footer avec des actions.
          </p>

          <div modalFooter class="flex space-x-3">
            <ui-button variant="outline" (click)="closeModal()">
              Annuler
            </ui-button>
            <ui-button variant="primary" (click)="closeModal()">
              Confirmer
            </ui-button>
          </div>
        </ui-modal>

        <ui-modal
          [isOpen]="currentModal() === 'large'"
          title="Grande Modale"
          size="xl"
          (modalClose)="closeModal()">
          
          <div class="space-y-4">
            <p class="text-gray-600">
              Cette modale est plus large et peut contenir plus de contenu.
            </p>
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-900 mb-2">Section</h4>
              <p class="text-sm text-gray-600">
                Contenu additionnel dans une section avec fond gris.
              </p>
            </div>
          </div>
        </ui-modal>

      </div>
    </div>
  `
})
export class UiShowcaseComponent {
  currentModal = signal<string | null>(null);
  
  sampleForm: FormGroup;
  
  dropdownItems = signal<DropdownItem[]>([
    { id: 1, label: 'Option 1', value: 'option1' },
    { id: 2, label: 'Option 2', value: 'option2' },
    { id: 3, label: 'Option 3', value: 'option3' },
    { id: 'divider', label: '', divider: true },
    { id: 4, label: 'Option désactivée', value: 'disabled', disabled: true },
    { id: 5, label: 'Dernière option', value: 'last' }
  ]);

  constructor(private fb: FormBuilder) {
    this.sampleForm = this.fb.group({
      email: ['', [Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      search: ['']
    });
  }

  openModal(type: string) {
    this.currentModal.set(type);
  }

  closeModal() {
    this.currentModal.set(null);
  }

  onSelectionChange(selection: DropdownItem | DropdownItem[]) {
    console.log('Selection changed:', selection);
  }
}