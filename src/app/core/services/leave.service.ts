import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LeaveService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  submitLeave(token: string, leaveData: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this.http.post(`${this.baseUrl}/api/leaves/submit`, leaveData, { headers });
  }

  getLeaves(token: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get(`${this.baseUrl}/api/leaves/getleaves`, { headers });
  }

  updateLeaveStatus(token: string, leaveId: number, status: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this.http.put(
      `${this.baseUrl}/api/leaves/update-status`,
      { leaveId, status },
      { headers }
    );
  }
}
