import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { ApiService } from '../services/api.service';
import { catchError, map, of, race, timer } from 'rxjs';

export const profileGuard: CanActivateFn = (route, state) => {
  const apiService = inject(ApiService);
  const router = inject(Router);

  // Race between API call and 3 second timeout
  return race(
    apiService.getProfile(),
    timer(3000).pipe(map(() => null))
  ).pipe(
    map((user) => {
      if (user && user.id) {
        return true;
      } else {
        // Only redirect if not already on profile page
        if (state.url !== '/profile') {
          router.navigate(['/profile']);
        }
        return false;
      }
    }),
    catchError((error) => {
      // If no profile exists, API error, or timeout, redirect to profile page
      console.warn('Profile guard: No profile found, redirecting to profile page');
      if (state.url !== '/profile') {
        router.navigate(['/profile']);
      }
      return of(false);
    })
  );
};
