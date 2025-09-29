import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  // base url
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient, private authService: AuthService) {}

  // create http headers with authorization token
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  // api call to change user password
  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    const headers = this.getHeaders();
    const passwordData = { currentPassword, newPassword };
    return this.http.put(`${this.baseUrl}/api/users/change-password`, passwordData, { headers });
  }
}
