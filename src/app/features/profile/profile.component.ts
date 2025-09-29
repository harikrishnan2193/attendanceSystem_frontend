import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../core/services/alert.service';
import { ProfileService } from '../../core/services/profile.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  // current user information for display
  currentUser = {
    name: '',
    email: '',
  };

  // form data for password change
  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };

  isPasswordLoading = false;

  constructor(
    private alertService: AlertService,
    private profileService: ProfileService,
    private cdr: ChangeDetectorRef
  ) {}

  // component initialization
  ngOnInit() {
    this.loadUserProfile();
  }

  // load user data from session storage
  loadUserProfile() {
    const userData = sessionStorage.getItem('user');
    if (userData) {
      this.currentUser = JSON.parse(userData);
    }
  }

  // handle password change
  changePassword() {
    // validate all password fields are filled
    if (
      !this.passwordForm.currentPassword ||
      !this.passwordForm.newPassword ||
      !this.passwordForm.confirmPassword
    ) {
      this.alertService.error('Please fill all password fields');
      return;
    }

    // validate new password and confirm password match
    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.alertService.error('New passwords do not match');
      return;
    }

    // validate new password length
    if (this.passwordForm.newPassword.length < 6) {
      this.alertService.error('New password must be at least 6 characters');
      return;
    }

    // set loading state and trigger change detection
    this.isPasswordLoading = true;
    this.cdr.detectChanges();

    // call api to change password
    this.profileService
      .changePassword(this.passwordForm.currentPassword, this.passwordForm.newPassword)
      .subscribe({
        next: (response: any) => {
          // clear form on success
          this.passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };

          // stop loading and update ui
          this.isPasswordLoading = false;
          this.cdr.detectChanges();

          // success message
          this.alertService.success(response.message || 'Password changed successfully');
        },
        error: (error) => {
          // stop loading and update ui
          this.isPasswordLoading = false;
          this.cdr.detectChanges();

          // error message
          const errorMessage = error.error?.message || 'Failed to change password';
          this.alertService.error(errorMessage);
        },
      });
  }
}
