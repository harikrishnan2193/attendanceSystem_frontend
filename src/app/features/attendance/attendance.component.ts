import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AlertService } from '../../core/services/alert.service';
import { AttendanceService } from '../../core/services/attendance.service';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.css'],
})
export class AttendanceComponent implements OnInit {
  attendanceHistory: any[] = [];
  totalRecords = 0;
  showPreview = false;
  selectedLeave: any = null;

  constructor(
    private router: Router,
    private alertService: AlertService,
    private attendanceService: AttendanceService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.getAttendanceHistory();
  }

  getAttendanceHistory() {
    const token = sessionStorage.getItem('token');
    const userStr = sessionStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const userId = user?.user_id;

    if (!token || !userId) {
      this.alertService.warning('You are not logged in, need to login');
      this.router.navigate(['/']);
      return;
    }

    this.attendanceService.getAttendanceHistory(token, userId).subscribe({
      next: (response) => {
        this.attendanceHistory = response?.history || [];
        this.totalRecords = this.attendanceHistory.length;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error fetching attendance history:', error);
        const errorMessage = error.error?.message || 'Failed to fetch attendance history';
        this.alertService.error(errorMessage);
      },
    });
  }

  formatTime(timeString: string | null): string {
    if (!timeString) return '—';
    return timeString;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      weekday: 'short',
    });
  }

  formatTimeSpent(timeSpent: string): string {
    if (!timeSpent || timeSpent === '0.00') return '0h 0m';
    const hours = parseFloat(timeSpent);
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h ${minutes}m`;
  }

  showLeavePreview(record: any) {
    this.selectedLeave = record;
    this.showPreview = true;
  }

  closePreview() {
    this.showPreview = false;
    this.selectedLeave = null;
  }
}
