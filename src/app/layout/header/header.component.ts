import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AlertService } from '../../core/services/alert.service';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  userName: string = '';

  constructor(
    private authService: AuthService,
    private alertService: AlertService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadUserData();
  }

  private loadUserData(): void {
    try {
      const userDataString = sessionStorage.getItem('user');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        this.userName = this.formatUserName(userData.name || '');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      this.userName = 'User';
    }
  }

  private formatUserName(name: string): string {
    if (!name || name.trim() === '') return 'User';
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  }

  logout(): void {
    this.alertService.confirm('Are you sure you want to logout?', 'Logout').then((result) => {
      if (result.isConfirmed) {
        this.authService.logout();
        this.router.navigate(['/']).then(() => {
          this.alertService.success('Logged out successfully!');
        });
      }
    });
  }
}
