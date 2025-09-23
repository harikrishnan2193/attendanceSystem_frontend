import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AttendanceService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAttendanceStatus(token: string, userId: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this.http.get(`${this.baseUrl}/api/attendance/status/${userId}`, { headers });
  }

  checkIn(token: string, userId: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this.http.post(`${this.baseUrl}/api/attendance/checkin`, { userId }, { headers });
  }

  checkOut(token: string, userId: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this.http.post(`${this.baseUrl}/api/attendance/checkout`, { userId }, { headers });
  }

  getAttendanceHistory(
    token: string,
    userId: string,
    page: number = 1,
    limit: number = 5,
    filters: any = {}
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    let params = new HttpParams().set('page', String(page)).set('limit', String(limit));

    // attach filters (only when present)
    Object.keys(filters || {}).forEach((k) => {
      const v = filters[k];
      if (v !== undefined && v !== null && String(v).trim() !== '') {
        params = params.set(k, String(v));
      }
    });

    return this.http.get(`${this.baseUrl}/api/attendance/history/${userId}`, {
      headers,
      params,
    });
  }

  getAnalyticsData(token: string, params: { type: string; month: string }) {
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    return this.http.get<any>(`${this.baseUrl}/api/attendance/analytics`, {
      params,
      headers,
    });
  }
}
