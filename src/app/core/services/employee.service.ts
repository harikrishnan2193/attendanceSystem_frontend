import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // fetches all employees managed by admin user
  getAllEmployees(token: string, userId: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this.http.get(`${this.baseUrl}/api/employees/all/${userId}`, { headers });
  }

  // removes employee from system
  deleteEmployee(token: string, employeeId: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this.http.delete(`${this.baseUrl}/api/employees/${employeeId}`, { headers });
  }

  // gets users available to be assigned as employees
  getAvailableUsers(token: string, userId: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this.http.get(`${this.baseUrl}/api/users/available/${userId}`, { headers });
  }

  // assigns user as new employee
  assignNewEmployee(token: string, employeeUserId: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this.http.post(`${this.baseUrl}/api/employees/assign`, { employeeUserId }, { headers });
  }
}
