import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AlertService } from './alert.service';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

declare const google: any;

@Injectable({
  providedIn: 'root',
})
export class OAuthService {
  private isGoogleLoaded = false;
  private initPromise: Promise<void> | null = null;

  constructor(
    private http: HttpClient,
    private alertService: AlertService,
    private router: Router
  ) {}

  // initialize google oauth
  initializeGoogleSignIn(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise((resolve, reject) => {
      const checkGoogleLoaded = (attempts = 0) => {
        if (attempts > 50) {
          // 5 seconds timeout
          reject(new Error('Google script failed to load'));
          return;
        }

        if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
          try {
            google.accounts.id.initialize({
              client_id: environment.googleClientId,
              use_fedcm_for_prompt: false,
            });
            this.isGoogleLoaded = true;
            resolve();
          } catch (error) {
            console.error('Error initializing Google OAuth:', error);
            reject(error);
          }
        } else {
          setTimeout(() => checkGoogleLoaded(attempts + 1), 100);
        }
      };
      checkGoogleLoaded();
    });

    return this.initPromise;
  }

  // sighn in with google
  async signInWithGoogle(): Promise<void> {
    try {
      if (!this.isGoogleLoaded) {
        await this.initializeGoogleSignIn();
      }

      // open google popup
      google.accounts.oauth2
        .initTokenClient({
          client_id: environment.googleClientId,
          scope: 'email profile',
          callback: (response: any) => {
            if (response.access_token) {
              this.getUserInfo(response.access_token);
            }
          },
        })
        .requestAccessToken(); // triggers to open popup
    } catch (error) {
      console.error('Google OAuth error:', error);
      this.alertService.error('Google Sign-In failed. Please try again.');
    }
  }

  // get user data from google
  private getUserInfo(accessToken: string): void {
    fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((response) => response.json())
      .then((userInfo) => {
        // sent access token to backend
        this.http
          .post(`${environment.apiUrl}/api/users/google`, {
            token: accessToken,
          })
          .subscribe({
            next: (result: any) => {
              // store response data in session
              sessionStorage.setItem('token', result.token);
              sessionStorage.setItem('user', JSON.stringify(result.user));
              this.router.navigate(['/home/dashboard']).then(() => {
                const successMessage = result.message || 'Google login successful!';
                this.alertService.success(successMessage);
              });
            },
            error: (error) => {
              const errorMessage =
                error.error?.message || 'Google Sign-In failed. Please try again.';
              this.alertService.error(errorMessage);
            },
          });
      });
  }
}
