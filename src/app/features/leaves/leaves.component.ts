import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertService } from '../../core/services/alert.service';
import { LeaveService } from '../../core/services/leave.service';

@Component({
  selector: 'app-leaves',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leaves.component.html',
  styleUrls: ['./leaves.component.css'],
})
export class LeavesComponent {
  leaveData = {
    startDate: '',
    endDate: '',
    reason: '',
  };

  constructor(
    private router: Router,
    private alertService: AlertService,
    private leaveService: LeaveService,
    private cdr: ChangeDetectorRef
  ) {}

  onSubmitLeave() {
    const token = sessionStorage.getItem('token');
    const userStr = sessionStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const userId = user?.user_id;

    if (!token || !userId) {
      this.alertService.warning('You are not logged in, need to login');
      this.router.navigate(['/']);
      return;
    }

    if (!this.leaveData.startDate || !this.leaveData.endDate || !this.leaveData.reason.trim()) {
      this.alertService.error('Please fill all required fields');
      return;
    }

    const leavePayload = {
      userId: userId,
      startDate: this.leaveData.startDate,
      endDate: this.leaveData.endDate,
      reason: this.leaveData.reason.trim(),
    };
    console.log(leavePayload);

    this.leaveService.submitLeave(token, leavePayload).subscribe({
      next: (response) => {
        const message = response?.message || 'Leave request submitted successfully!';
        this.resetForm();
        this.cdr.detectChanges();
        this.alertService.success(message);
      },
      error: (error) => {
        const errorMessage =
          error.error?.message || 'Failed to submit leave request. Please try again.';
        this.alertService.error(errorMessage);
      },
    });
  }

  private resetForm() {
    this.leaveData = {
      startDate: '',
      endDate: '',
      reason: '',
    };
  }
}
