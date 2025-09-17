import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (loadingService.isLoading()) {
    <div class="top-progress-bar">
      <div class="progress-fill"></div>
    </div>
    }
  `,
  styles: [
    `
      .top-progress-bar {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 4px;
        background: rgba(0, 0, 0, 0.1);
        z-index: 9999;
        overflow: hidden;
      }

      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #007bff, #0056b3);
        width: 100%;
        animation: slide 1.5s infinite;
      }

      @keyframes slide {
        0% {
          transform: translateX(-100%);
        }
        100% {
          transform: translateX(100%);
        }
      }
    `,
  ],
})
export class LoadingComponent {
  loadingService = inject(LoadingService);
}
