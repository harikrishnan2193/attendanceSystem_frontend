import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertService } from '../../core/services/alert.service';
import { EmployeeService } from '../../core/services/employee.service';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.css'],
})
export class EmployeesComponent implements OnInit {
  employees: any[] = [];
  totalEmployees = 0;
  availableUsers: any[] = [];
  showModal = false;
  selectedUserId = '';

  constructor(
    private router: Router,
    private alertService: AlertService,
    private employeeService: EmployeeService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadEmployees();
  }

  // load all employees from server
  loadEmployees() {
    const token = sessionStorage.getItem('token');
    const userStr = sessionStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const userId = user?.user_id;

    if (!token || !userId) {
      this.alertService.warning('You are not logged in, need to login');
      this.router.navigate(['/']);
      return;
    }

    this.employeeService.getAllEmployees(token, userId).subscribe({
      next: (response) => {
        this.employees = response?.employees || [];
        this.totalEmployees = this.employees.length;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error fetching employees:', error);
        this.employees = [];
        this.totalEmployees = 0;
        this.cdr.detectChanges();

        if (error.status === 401) {
          sessionStorage.clear();
          this.router.navigate(['/']).then(() => {
            const message = error.error?.message || 'Session expired. Please login again.';
            this.alertService.error(message);
          });
        } else if (error.status === 403) {
          const message = error.error?.message || 'Unauthorized access';
          this.alertService.error(message);
        } else {
          const errorMessage = error.error?.message || 'Failed to fetch employees';
          this.alertService.error(errorMessage);
        }
      },
    });
  }

  // get current date formatted for display
  getCurrentDate(): string {
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  // remove employee with confirmation
  removeEmployee(userId: string, name: string) {
    this.alertService
      .confirm(`Are you sure you want to remove ${name}?`, 'Remove Employee')
      .then((result) => {
        if (result.isConfirmed) {
          const token = sessionStorage.getItem('token');

          if (!token) {
            this.alertService.warning('You are not logged in');
            return;
          }

          this.employeeService.deleteEmployee(token, userId).subscribe({
            next: (response) => {
              const message = response?.message || `${name} has been removed successfully`;
              this.alertService.success(message);
              this.loadEmployees();
            },
            error: (error) => {
              console.error('Delete employee error:', error);

              if (error.status === 401) {
                sessionStorage.clear();
                this.router.navigate(['/']).then(() => {
                  const message = error.error?.message || 'Session expired. Please login again.';
                  this.alertService.error(message);
                });
              } else {
                const errorMessage = error.error?.message || 'Failed to remove employee';
                this.alertService.error(errorMessage);

                if (error.status === 404) {
                  this.loadEmployees();
                }
              }
            },
          });
        }
      });
  }

  // get CSS class based on employee status
  getStatusClass(status: string): string {
    switch (status) {
      case 'Checked In':
        return 'status-checked-in';
      case 'Checked Out':
        return 'status-checked-out';
      case 'Not Checked In':
        return 'status-checked-out';
      case 'On Leave':
        return 'status-leave';
      case 'On Break':
        return 'status-break';
      default:
        return 'status-default';
    }
  }

  // get available users for assignment
  getAvailableUsers() {
    // get authentication data from session
    const token = sessionStorage.getItem('token');
    const userStr = sessionStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const userId = user?.user_id;

    // validate authentication
    if (!token || !userId) {
      this.alertService.warning('You are not logged in, need to login');
      this.router.navigate(['/']);
      return;
    }

    // fetch available users from server
    this.employeeService.getAvailableUsers(token, userId).subscribe({
      next: (response) => {
        this.availableUsers = response?.users || [];

        // show modal if users found, otherwise show warning
        if (this.availableUsers.length > 0) {
          this.showModal = true;
          this.selectedUserId = '';
          this.cdr.detectChanges();
        } else {
          const message = response?.message || 'No available users found';
          this.alertService.warning(message);
        }
      },
      error: (error) => {
        console.error('Error fetching available users:', error);

        // handle authentication errors
        if (error.status === 401) {
          sessionStorage.clear();
          this.router.navigate(['/']).then(() => {
            const message = error.error?.message || 'Session expired. Please login again.';
            this.alertService.error(message);
          });
        } else {
          // show message from backend
          const errorMessage = error.error?.message || 'Failed to fetch available users';
          this.alertService.error(errorMessage);
        }
      },
    });
  }

  // close assignment modal
  closeModal() {
    this.showModal = false;
    this.selectedUserId = '';
    this.availableUsers = [];
  }

  // assign new employee
  assignNewEmployee() {
    // validate user selection
    if (!this.selectedUserId) {
      this.alertService.error('Please select a user');
      return;
    }

    const token = sessionStorage.getItem('token');

    if (!token) {
      this.alertService.warning('You are not logged in');
      return;
    }

    // send assignment request to server
    this.employeeService.assignNewEmployee(token, this.selectedUserId).subscribe({
      next: (response) => {
        // show success message and refresh data
        const message = response?.message || 'Employee assigned successfully';
        this.alertService.success(message);
        this.closeModal();
        this.loadEmployees();
      },
      error: (error) => {
        console.error('Assign employee error:', error);

        // handle authentication errors
        if (error.status === 401) {
          sessionStorage.clear();
          this.router.navigate(['/']).then(() => {
            const message = error.error?.message || 'Session expired. Please login again.';
            this.alertService.error(message);
          });
        } else {
          // show error message from backend
          const errorMessage = error.error?.message || 'Failed to assign employee';
          this.alertService.error(errorMessage);
        }
      },
    });
  }
}
