import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AlertService } from '../../core/services/alert.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  // state & form data
  isLoading = false;
  formData = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
  };

  constructor(
    private authService: AuthService,
    private alertService: AlertService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  // register function (entry point)
  registerUser() {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;
    this.cdr.detectChanges();

    const userData = {
      name: this.formData.name.trim(),
      email: this.formData.email.trim().toLowerCase(),
      password: this.formData.password,
      role: this.formData.role,
    };

    this.authService.register(userData).subscribe({
      next: (response) => {
        this.alertService.success(
          `${
            this.formData.role === 'admin' ? 'Administrator' : 'Employee'
          } account created successfully!`
        );
        this.resetForm();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isLoading = false;
        this.cdr.detectChanges();

        const errorMessage = error.error?.message || 'Registration failed. Please try again.';
        this.alertService.error(errorMessage);

        // redirect on auth errors
        if (error.status === 403 || error.status === 401) {
          this.router.navigate(['/home/dashboard']);
        }
      },
    });
  }

  // validation functions
  private validateForm(): boolean {
    const { name, email, password, confirmPassword, role } = this.formData;

    // all fields empty
    if (!name.trim() && !email.trim() && !password && !confirmPassword && !role) {
      this.alertService.error('Please fill all the fields');
      return false;
    }

    // individual field checks
    if (!name.trim()) {
      this.alertService.error('Please enter full name');
      return false;
    }

    if (!email.trim()) {
      this.alertService.error('Please enter email address');
      return false;
    }

    if (!this.isValidEmail(email)) {
      this.alertService.error('Please enter a valid email address');
      return false;
    }

    if (!password) {
      this.alertService.error('Please enter password');
      return false;
    }

    if (password.length < 6) {
      this.alertService.error('Password must be at least 6 characters long');
      return false;
    }

    if (password !== confirmPassword) {
      this.alertService.error('Passwords do not match');
      return false;
    }

    if (!role) {
      this.alertService.error('Please select a user role');
      return false;
    }

    return true;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // reset form fields
  private resetForm() {
    this.formData = {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: '',
    };
  }
}
