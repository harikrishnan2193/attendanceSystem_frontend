import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AlertService } from '../../core/services/alert.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
})
export class AuthComponent {
  isLogin = true;
  formData = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  };

  constructor(
    private authService: AuthService,
    private alertService: AlertService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  toggleMode() {
    this.isLogin = !this.isLogin;
    this.formData = { name: '', email: '', password: '', confirmPassword: '' };
  }

  onSubmit() {
    if (this.isLogin) {
      this.login();
    } else {
      this.register();
    }
  }

  login() {
    const loginData = {
      email: this.formData.email,
      password: this.formData.password,
    };

    this.authService.login(loginData).subscribe({
      next: (response) => {
        // store token and user details in session storage
        if (response.token) {
          sessionStorage.setItem('token', response.token);
        }
        if (response.user) {
          sessionStorage.setItem('user', JSON.stringify(response.user));
        }

        this.formData = { name: '', email: '', password: '', confirmPassword: '' };

        this.router.navigate(['/home/dashboard']).then(() => {
          const successMessage = response.message || 'Login successful!';
          this.alertService.success(successMessage);
        });
      },
      error: (error) => {
        console.error('Login error', error);
        const errorMessage = error.error?.message || 'Login failed. Please try again.';
        this.alertService.error(errorMessage);
      },
    });
  }

  register() {
    if (this.formData.password !== this.formData.confirmPassword) {
      this.alertService.error('Passwords do not match!');
      return;
    }

    this.authService.register(this.formData).subscribe({
      next: (response) => {
        // update state
        this.isLogin = true;
        this.formData = { name: '', email: '', password: '', confirmPassword: '' };

        // force change detection
        this.cdr.detectChanges();

        const successMessage = response.message || 'Registration successful!';
        this.alertService.success(successMessage);
      },
      error: (error) => {
        console.error('Register error', error);
        const errorMessage = error.error?.message || 'Registration failed. Please try again.';
        this.alertService.error(errorMessage);
      },
    });
  }
}
