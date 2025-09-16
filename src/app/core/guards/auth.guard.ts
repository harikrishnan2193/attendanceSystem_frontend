import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = sessionStorage.getItem('token');

  if (token) {
    return true;
  } else {
    router.navigate(['']);
    return false;
  }
};

export const loginGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = sessionStorage.getItem('token');

  if (token) {
    router.navigate(['/home/dashboard']);
    return false;
  } else {
    return true;
  }
};

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  try {
    const userDataString = sessionStorage.getItem('user');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      if (userData.role === 'ADMIN') {
        return true;
      }
    }
  } catch (error) {
    console.error('Error checking admin role:', error);
  }

  router.navigate(['/home/dashboard']);
  return false;
};
