import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-page-not-found',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.css'],
})
export class PageNotFoundComponent {
  constructor(private router: Router) {}

  navigateToHome(): void {
    const token = sessionStorage.getItem('token');

    if (token) {
      this.router.navigate(['/home/dashboard']);
    } else {
      this.router.navigate(['']);
    }
  }
}
