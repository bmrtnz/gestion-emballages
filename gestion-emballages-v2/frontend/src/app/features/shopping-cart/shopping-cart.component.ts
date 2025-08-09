import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shopping-cart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
        <p class="text-gray-600">Feature under development...</p>
      </div>
    </div>
  `,
  styles: []
})
export class ShoppingCartComponent {}