import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
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
export class AuthComponent implements OnInit {
  // form data
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

  async ngOnInit(): Promise<void> {
    // oauth initializ (pre-load google oauth)
    await this.authService.initOAuth();
  }

  // reset form data
  private resetForm() {
    setTimeout(() => {
      this.formData = { name: '', email: '', password: '', confirmPassword: '' };
      this.cdr.detectChanges();
    });
  }

  // for users login
  login() {
    const loginData = {
      email: this.formData.email,
      password: this.formData.password,
    };

    this.authService.login(loginData).subscribe({
      next: (response) => {
        //store token & user detils on session
        if (response.token) {
          sessionStorage.setItem('token', response.token);
        }
        if (response.user) {
          sessionStorage.setItem('user', JSON.stringify(response.user));
        }

        // navigate to home page
        this.router.navigate(['/home/dashboard']).then(() => {
          const successMessage = response.message || 'Login successful!';
          this.alertService.success(successMessage);
          this.resetForm();
        });
      },
      error: (error) => {
        console.error('Login error', error);
        const errorMessage = error.error?.message || 'Login failed. Please try again.';
        this.alertService.error(errorMessage);
      },
    });
  }

  // oauth login
  async signInWithGoogle(): Promise<void> {
    await this.authService.signInWithGoogle();
  }
}
