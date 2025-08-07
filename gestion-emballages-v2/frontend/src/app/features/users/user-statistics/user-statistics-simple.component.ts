import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-statistics-simple',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-blue-500 text-white p-4 mb-4 rounded">
      <h2 class="text-xl font-bold">SIMPLE USER STATISTICS TEST</h2>
      <p>This is a minimal test component.</p>
    </div>
  `
})
export class UserStatisticsSimpleComponent {
}