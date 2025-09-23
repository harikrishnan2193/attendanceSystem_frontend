import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertService } from '../../core/services/alert.service';
import { AttendanceService } from '../../core/services/attendance.service';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  // filters
  filterType: 'all' | 'week' | 'month' | 'date' | 'range' = 'all';
  selectedMonth: string | null = null; // YYYY-MM
  selectedDate: string | null = null; // YYYY-MM-DD
  startDate: string | null = null;
  endDate: string | null = null;
  selectedStatus: 'all' | 'present' | 'leave' = 'all';
  searchQuery: string = '';

  // modal/pagination specifics
  showPreview = false;
  selectedLeave: any = null;
  showBreaksModal = false;
  selectedRecord: any = null;
  currentBreakPage = 0;
  breaksPerPage = 4;
  isAdmin = false;

  // analytics from server
  analytics = {
    totalWorkingHours: 0,
    totalOvertime: 0,
    totalLeaves: 0,
  };

  constructor(
    private router: Router,
    private alertService: AlertService,
    private attendanceService: AttendanceService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.checkUserRole();
    this.loadPage(1);
  }

  checkUserRole() {
    const userStr = sessionStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    this.isAdmin = user?.role === 'ADMIN';
  }

  buildFilters() {
    const filters: any = {};
    if (this.filterType && this.filterType !== 'all') {
      filters.filterType = this.filterType;
      if (this.filterType === 'month' && this.selectedMonth) {
        filters.month = this.selectedMonth; // YYYY-MM
      } else if (this.filterType === 'date' && this.selectedDate) {
        filters.date = this.selectedDate; // YYYY-MM-DD
      } else if (this.filterType === 'range' && this.startDate && this.endDate) {
        filters.startDate = this.startDate;
        filters.endDate = this.endDate;
      }
    }

    if (this.selectedStatus && this.selectedStatus !== 'all') {
      filters.status = this.selectedStatus;
    }

    if (this.searchQuery && this.searchQuery.trim() !== '') {
      filters.search = this.searchQuery.trim();
    }

    return filters;
  }

  // when a filter value changes
  onFilterChange() {
    this.currentPage = 1;
    this.allLoadedRecords = []; // clear cache when filters change
    this.loadPage(1);
  }

  onSearchInput() {
    // simple immediate search; for production add debounce
    this.onFilterChange();
  }

  loadPage(page: number) {
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
    const filters = this.buildFilters();
    this.attendanceService
      .getAttendanceHistory(token, userId, page, this.recordsPerPage, filters)
      .subscribe({
        next: (response) => {
          const newRecords = response?.history || [];

          if (page === 1) {
            this.allLoadedRecords = newRecords.slice(); // reset loaded cache
          } else {
            this.allLoadedRecords = [...this.allLoadedRecords, ...newRecords];
          }

          // show the current page records
          // If prefer to keep only page data use: this.attendanceHistory = newRecords;
          this.currentPage = page;
          this.attendanceHistory = this.getCurrentPageRecords();
          this.totalRecords = response?.pagination?.totalRecords || 0;
          this.hasMore = response?.pagination?.hasMore ?? newRecords.length === this.recordsPerPage;
          this.analytics = response?.analytics || {
            totalWorkingHours: 0,
            totalOvertime: 0,
            totalLeaves: 0,
          };

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
      // load next page from server (this will append to allLoadedRecords)
      this.currentPage++;
      this.loadPage(this.currentPage);
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

  // --- existing helpers (formatTime, formatDate, formatTimeSpent, modals) ---
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
    if (this.currentBreakPage < this.getTotalBreakPages() - 1) this.currentBreakPage++;
  }

  previousBreakPage() {
    if (this.currentBreakPage > 0) this.currentBreakPage--;
  }
}
