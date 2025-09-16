import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../core/services/alert.service';
import { AttendanceService } from '../../core/services/attendance.service';
import { BreaksService } from '../../core/services/breaks.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  attendanceStatus: 'not_checked_in' | 'checked_in' | 'checked_out' = 'not_checked_in';
  breakStatus: 'not_on_break' | 'on_break' = 'not_on_break';
  timerDisplay = '00:00:00';
  isAccountDeleted = false;
  private timerInterval: any;
  private startTime: Date | null = null;

  constructor(
    private router: Router,
    private alertService: AlertService,
    private attendanceService: AttendanceService,
    private breaksService: BreaksService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.checkAttendanceStatus();
    this.checkBreakStatus();
  }

  checkAttendanceStatus() {
    this.stopTimer();
    const token = sessionStorage.getItem('token');
    const userStr = sessionStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const userId = user?.user_id;

    if (!token || !userId) return;

    this.attendanceService.getAttendanceStatus(token, userId).subscribe({
      next: (response) => {
        this.attendanceStatus = response?.status || 'not_checked_in';

        if (response?.totalHours) {
          this.timerDisplay = this.convertHoursToTime(response.totalHours);
        } else if (response?.currentWorkingHours) {
          const baseTime = this.convertHoursToTime(response.currentWorkingHours);
          this.timerDisplay = baseTime;

          if (response?.attendance?.check_in) {
            this.startTime = new Date(response.attendance.check_in);
            this.updateTimerDisplay();
            this.startTimer();
          }
        } else if (this.attendanceStatus === 'checked_in' && response?.attendance?.check_in) {
          this.startTime = new Date(response.attendance.check_in);
          this.updateTimerDisplay();
          this.startTimer();
        } else {
          this.timerDisplay = '00:00:00';
        }

        this.cdr.detectChanges();
      },
      error: (error) => {
        if (error.status === 404 && error.error?.message?.includes('account has been deleted')) {
          this.handleAccountDeletion(error.error.message);
        } else {
          this.attendanceStatus = 'not_checked_in';
          this.timerDisplay = '00:00:00';
        }
      },
    });
  }

  checkBreakStatus() {
    const token = sessionStorage.getItem('token');
    if (!token) return;

    this.breaksService.getCurrentBreakStatus(token).subscribe({
      next: (response) => {
        this.breakStatus = response?.status === 'on_break' ? 'on_break' : 'not_on_break';
        this.cdr.detectChanges();
      },
      error: () => {
        this.breakStatus = 'not_on_break';
      },
    });
  }

  onCheckInOut() {
    const token = sessionStorage.getItem('token');
    const userStr = sessionStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const userId = user?.user_id;

    if (!token || !userId) {
      sessionStorage.clear();
      this.router.navigate(['/']).then(() => {
        this.alertService.warning('You are not logged in, need to login');
      });
      return;
    }

    if (this.attendanceStatus === 'checked_in') {
      this.checkOut(token, userId);
    } else if (this.attendanceStatus === 'not_checked_in') {
      this.checkIn(token, userId);
    }
  }

  onBreakAction() {
    const token = sessionStorage.getItem('token');
    if (!token) return;

    if (this.breakStatus === 'not_on_break') {
      this.startBreak(token);
    } else {
      this.endBreak(token);
    }
  }

  private checkIn(token: string, userId: string) {
    this.attendanceService.checkIn(token, userId).subscribe({
      next: (response) => {
        const message = response?.message || 'Check-in successful!';
        this.alertService.success(message);
        this.checkAttendanceStatus();
      },
      error: (error) => {
        if (error.status === 404 && error.error?.message?.includes('account has been deleted')) {
          this.handleAccountDeletion(error.error.message);
        } else {
          const errorMessage = error.error?.message || 'Check-in failed. Please try again.';
          this.alertService.error(errorMessage);
        }
      },
    });
  }

  private checkOut(token: string, userId: string) {
    this.attendanceService.checkOut(token, userId).subscribe({
      next: (response) => {
        const message = response?.message || 'Check-out successful!';
        this.alertService.success(message);

        this.breakStatus = 'not_on_break';
        this.checkAttendanceStatus();
      },
      error: (error) => {
        if (error.status === 404 && error.error?.message?.includes('account has been deleted')) {
          this.handleAccountDeletion(error.error.message);
        } else {
          const errorMessage = error.error?.message || 'Check-out failed. Please try again.';
          this.alertService.error(errorMessage);
        }
      },
    });
  }

  private startBreak(token: string) {
    this.breaksService.startBreak(token).subscribe({
      next: (response) => {
        const message = response?.message || 'Break started!';
        this.alertService.success(message);

        // update break status
        this.breakStatus = 'on_break';
        this.cdr.detectChanges();

        this.checkBreakStatus();
      },
      error: (error) => {
        const errorMessage = error.error?.message || 'Failed to start break. Please try again.';
        this.alertService.error(errorMessage);
      },
    });
  }

  private endBreak(token: string) {
    this.breaksService.endBreak(token).subscribe({
      next: (response) => {
        const message = response?.message || 'Break ended!';
        this.alertService.success(message);

        this.breakStatus = 'not_on_break';
        this.cdr.detectChanges();

        this.checkBreakStatus();
      },
      error: (error) => {
        const errorMessage = error.error?.message || 'Failed to end break. Please try again.';
        this.alertService.error(errorMessage);
      },
    });
  }

  private startTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    this.timerInterval = setInterval(() => {
      this.updateTimerDisplay();
    }, 1000);
  }

  private updateTimerDisplay() {
    if (this.startTime) {
      const now = new Date();
      const diff = now.getTime() - this.startTime.getTime();
      this.timerDisplay = this.formatTime(diff);
      this.cdr.detectChanges();
    }
  }

  private stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private formatTime(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  }

  private convertHoursToTime(totalHours: string | number): string {
    const hours = parseFloat(totalHours.toString());
    const wholeHours = Math.floor(hours);
    const minutes = Math.floor((hours - wholeHours) * 60);
    const seconds = Math.floor(((hours - wholeHours) * 60 - minutes) * 60);

    return `${wholeHours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  private handleAccountDeletion(message: string) {
    this.stopTimer();
    this.attendanceStatus = 'checked_out';
    this.isAccountDeleted = true;
    sessionStorage.clear();
    this.alertService.error(message).then(() => {
      this.router.navigate(['/']);
    });
  }

  ngOnDestroy() {
    this.stopTimer();
  }
}
