import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeaveService } from '../../core/services/leave.service';
import { AlertService } from '../../core/services/alert.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css'],
})
export class NotificationsComponent implements OnInit {
  selectedStatus = 'PENDING';
  isAdmin = false;
  leaveRequests: any[] = [];
  notifications: any[] = [];

  constructor(
    private leaveService: LeaveService,
    private alertService: AlertService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadUserRole();
    setTimeout(() => {
      this.loadLeaves();
    }, 100);
  }

  private loadUserRole(): void {
    try {
      const userDataString = sessionStorage.getItem('user');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        this.isAdmin = userData.role === 'ADMIN';
      }
    } catch (error) {
      this.isAdmin = false;
    }
  }

  private loadLeaves(): void {
    const token = sessionStorage.getItem('token');
    if (!token) {
      this.alertService.error('Authentication required. Please login again.');
      return;
    }

    this.leaveService.getLeaves(token).subscribe({
      next: (response) => {
        if (response?.leaves) {
          if (this.isAdmin) {
            this.leaveRequests = [...response.leaves];
          } else {
            this.notifications = this.convertLeavesToNotifications(response.leaves);
          }
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        const errorMessage = error.error?.message || 'Failed to load data. Please try again.';
        this.alertService.error(errorMessage);
      },
    });
  }

  updateLeaveStatus(request: any, newStatus: string): void {
    const token = sessionStorage.getItem('token');
    if (!token) {
      this.alertService.error('Authentication required. Please login again.');
      return;
    }

    this.leaveService.updateLeaveStatus(token, request.user_id, newStatus).subscribe({
      next: (response) => {
        request.status = newStatus;
        this.alertService.success(`Leave request ${newStatus.toLowerCase()} successfully`);
        this.cdr.detectChanges();
      },
      error: (error) => {
        const errorMessage =
          error.error?.message || 'Failed to update leave status. Please try again.';
        this.alertService.error(errorMessage);
      },
    });
  }

  private convertLeavesToNotifications(leaves: any[]): any[] {
    return leaves.map((leave, index) => ({
      id: leave.user_id + index,
      message: `Your leave request (${leave.reason}) from ${leave.start_date} to ${
        leave.end_date
      } is ${leave.status.toLowerCase()}`,
      timestamp: new Date(leave.start_date),
    }));
  }

  get filteredLeaveRequests() {
    return this.leaveRequests.filter((request) => request.status === this.selectedStatus);
  }

  trackByFn(index: number, item: any): any {
    return item.id || item.user_id || index;
  }
}
