import { Routes } from '@angular/router';
import { LayoutComponent } from './core/layout/layout';
import { profileGuard } from './shared/guards/profile.guard';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard')
            .then(c => c.DashboardComponent)
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile')
            .then(c => c.ProfileComponent)
      },
      {
        path: 'workouts',
        loadComponent: () =>
          import('./features/workouts/workouts')
            .then(c => c.WorkoutsComponent),
        canActivate: [profileGuard]
      },
      {
        path: 'progress',
        loadComponent: () =>
          import('./features/progress/progress')
            .then(c => c.ProgressComponent),
        canActivate: [profileGuard]
      },
      {
        path: 'meals',
        loadComponent: () =>
          import('./features/meals/meals')
            .then(c => c.MealsComponent),
        canActivate: [profileGuard]
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];
