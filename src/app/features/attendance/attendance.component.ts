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
  allLoadedRecords: any[] = [];
  totalRecords = 0;
  currentPage = 1;
  recordsPerPage = 5;
  hasMore = true;
  isLoading = false;
  showPreview = false;
  selectedLeave: any = null;
  showBreaksModal = false;
  selectedRecord: any = null;
  currentBreakPage = 0;
  breaksPerPage = 4;
  isAdmin = false;

  constructor(
    private router: Router,
    private alertService: AlertService,
    private attendanceService: AttendanceService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.checkUserRole();
    this.getAttendanceHistory(1);
  }

  checkUserRole() {
    const userStr = sessionStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    this.isAdmin = user?.role === 'ADMIN';
  }

  getAttendanceHistory(page: number = 1) {
    const token = sessionStorage.getItem('token');
    const userStr = sessionStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const userId = user?.user_id;

    if (!token || !userId) {
      this.alertService.warning('You are not logged in, need to login');
      this.router.navigate(['/']);
      return;
    }

    this.isLoading = true;
    this.attendanceService
      .getAttendanceHistory(token, userId, page, this.recordsPerPage)
      .subscribe({
        next: (response) => {
          const newRecords = response?.history || [];

          if (page === 1) {
            this.allLoadedRecords = newRecords;
          } else {
            this.allLoadedRecords = [...this.allLoadedRecords, ...newRecords];
          }

          this.currentPage = page;
          this.attendanceHistory = this.getCurrentPageRecords();

          this.totalRecords = response?.pagination?.totalRecords || response?.history?.length || 0;
          this.hasMore = response?.pagination?.hasMore ?? newRecords.length === this.recordsPerPage;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error fetching attendance history:', error);
          const errorMessage = error.error?.message || 'Failed to fetch attendance history';
          this.alertService.error(errorMessage);
          this.isLoading = false;
        },
      });
  }

  getCurrentPageRecords() {
    const startIndex = (this.currentPage - 1) * this.recordsPerPage;
    const endIndex = startIndex + this.recordsPerPage;
    return this.allLoadedRecords.slice(startIndex, endIndex);
  }

  nextPage() {
    const maxLoadedPage = Math.ceil(this.allLoadedRecords.length / this.recordsPerPage);

    if (this.currentPage < maxLoadedPage) {
      // show next page from already loaded data
      this.currentPage++;
      this.attendanceHistory = this.getCurrentPageRecords();
      this.updateHasMore();
    } else if (this.hasMore && !this.isLoading) {
      // load next page from server
      this.currentPage++;
      this.getAttendanceHistory(this.currentPage);
    } else if (!this.hasMore) {
      this.alertService.warning('No more records available');
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.attendanceHistory = this.getCurrentPageRecords();
      this.updateHasMore();
      this.cdr.detectChanges();
    }
  }

  updateHasMore() {
    const maxLoadedPage = Math.ceil(this.allLoadedRecords.length / this.recordsPerPage);
    const totalPages = Math.ceil(this.totalRecords / this.recordsPerPage);

    // enable next if have more loaded pages or more records on server
    this.hasMore = this.currentPage < maxLoadedPage || this.currentPage < totalPages;
    this.cdr.detectChanges();
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

  showBreaksPreview(record: any) {
    this.selectedRecord = record;
    this.currentBreakPage = 0;
    this.showBreaksModal = true;
  }

  closeBreaksPreview() {
    this.showBreaksModal = false;
    this.selectedRecord = null;
    this.currentBreakPage = 0;
  }

  getPaginatedBreaks() {
    if (!this.selectedRecord?.breaks) return [];
    const start = this.currentBreakPage * this.breaksPerPage;
    const end = start + this.breaksPerPage;
    return this.selectedRecord.breaks.slice(start, end);
  }

  getTotalBreakPages() {
    if (!this.selectedRecord?.breaks) return 0;
    return Math.ceil(this.selectedRecord.breaks.length / this.breaksPerPage);
  }

  nextBreakPage() {
    if (this.currentBreakPage < this.getTotalBreakPages() - 1) {
      this.currentBreakPage++;
    }
  }

  previousBreakPage() {
    if (this.currentBreakPage > 0) {
      this.currentBreakPage--;
    }
  }
}
