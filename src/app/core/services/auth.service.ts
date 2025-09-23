import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OAuthService } from './oauth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // api base url
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient, private oauthService: OAuthService) {}

  // authentication actions
  /**
   * register a new user (Admin or Employee).
   * requires an authentication token (admin privileges).
   * @param userData - user details (name, email, password, role)
   * @returns observable with server response
   */
  register(userData: any): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.post(`${this.baseUrl}/api/users/register`, userData, { headers });
  }

  /**
   * login user and receive authentication token.
   * @param credentials - login credentials (email, password)
   * @returns observable with server response (token, user info)
   */
  login(credentials: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/users/login`, credentials);
  }

  // get token feom session
  getToken(): string | null {
    return sessionStorage.getItem('token');
  }

  // clear all session data
  logout(): void {
    sessionStorage.clear();
  }

  // oauth initializ
  async initOAuth(): Promise<void> {
    try {
      await this.oauthService.initializeGoogleSignIn();
    } catch (error) {
      console.error('Failed to initialize OAuth:', error);
    }
  }

  // oauth login
  async signInWithGoogle(): Promise<void> {
    await this.oauthService.signInWithGoogle();
  }
}
