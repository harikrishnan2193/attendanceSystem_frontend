import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BreaksService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // gets current break status (active/inactive) for user
  getCurrentBreakStatus(token: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this.http.get(`${this.baseUrl}/api/breaks/status`, { headers });
  }

  // starts a new break session for user
  startBreak(token: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this.http.post(`${this.baseUrl}/api/breaks/start`, {}, { headers });
  }

  // ends current break session for user
  endBreak(token: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this.http.post(`${this.baseUrl}/api/breaks/end`, {}, { headers });
  }
}
