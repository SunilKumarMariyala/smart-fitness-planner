import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { ApiService, WorkoutMealPlan, User } from '../../shared/services/api.service';

@Component({
  standalone: true,
  selector: 'app-workouts',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatCheckboxModule,
    MatTabsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatChipsModule
  ],
  templateUrl: './workouts.html',
  styleUrls: ['./workouts.css'],
})
export class WorkoutsComponent implements OnInit {
  private apiService = inject(ApiService);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  currentUser: User | null = null;
  weeklyPlans: WorkoutMealPlan[] = [];
  isLoading = false;
  isGenerating = false;
  selectedTabIndex: number = 0;

  days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  ngOnInit() {
    // Initialize to current day
    this.initializeToCurrentDay();
    this.loadUserAndPlans();
  }

  initializeToCurrentDay() {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const dayIndex = this.days.indexOf(today);
    if (dayIndex !== -1) {
      this.selectedTabIndex = dayIndex;
    }
  }

  loadUserAndPlans() {
    this.isLoading = true;
    this.cdr.detectChanges();
    this.apiService.getProfile().subscribe({
      next: (user) => {
        this.currentUser = user;
        if (user.id) {
          this.loadWeeklyPlan(user.id);
        } else {
          setTimeout(() => {
            this.isLoading = false;
            this.cdr.detectChanges();
          }, 0);
          this.showInfo('Please create your profile first to view workout plans.');
        }
      },
      error: () => {
        setTimeout(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        }, 0);
        this.showError('Failed to load user profile. Please create a profile first.');
      }
    });
  }

  loadWeeklyPlan(userId: number) {
    this.apiService.getWeeklyPlan(userId).subscribe({
      next: (plans) => {
        setTimeout(() => {
          this.weeklyPlans = plans;
          this.isLoading = false;
          this.cdr.detectChanges();
        }, 0);
        if (plans.length === 0) {
          this.showInfo('No workout plans found. Click "Generate Weekly Plan" to create one.');
        }
      },
      error: (error) => {
        setTimeout(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        }, 0);
        if (error.message.includes('No workout/meal plans found')) {
          this.showInfo('No workout plans found. Click "Generate Weekly Plan" to create one.');
        } else {
          this.showError('Failed to load workout plans.');
        }
      }
    });
  }

  generateWeeklyPlan() {
    if (!this.currentUser?.id) {
      this.showError('Please create your profile first.');
      return;
    }

    this.isGenerating = true;
    this.cdr.detectChanges();
    this.apiService.generateWeeklyPlan(this.currentUser.id).subscribe({
      next: () => {
        setTimeout(() => {
          this.isGenerating = false;
          this.cdr.detectChanges();
        }, 0);
        this.showSuccess('Weekly workout plan generated successfully!');
        this.loadWeeklyPlan(this.currentUser!.id!);
      },
      error: (error) => {
        setTimeout(() => {
          this.isGenerating = false;
          this.cdr.detectChanges();
        }, 0);
        this.showError('Failed to generate workout plan. Please try again.');
        console.error('Error generating plan:', error);
      }
    });
  }

  toggleExercise(plan: WorkoutMealPlan, exerciseIndex: number) {
    if (!this.currentUser?.id || !plan.id) return;

    const isCompleted = (plan.completed_status?.exercises?.includes(exerciseIndex)) || false;
    const newStatus = !isCompleted;

    this.apiService.updateExerciseCompletion(
      this.currentUser.id,
      plan.id,
      exerciseIndex,
      newStatus
    ).subscribe({
      next: () => {
        // Update local state
        if (!plan.completed_status) {
          plan.completed_status = { exercises: [], meals: [] };
        }
        if (newStatus) {
          if (!plan.completed_status.exercises.includes(exerciseIndex)) {
            plan.completed_status.exercises.push(exerciseIndex);
          }
        } else {
          const index = plan.completed_status.exercises.indexOf(exerciseIndex);
          if (index > -1) {
            plan.completed_status.exercises.splice(index, 1);
          }
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.showError('Failed to update exercise status.');
      }
    });
  }

  getDayPlan(day: string): WorkoutMealPlan | undefined {
    return this.weeklyPlans.find(p => p.day === day);
  }

  getCompletionPercentage(plan: WorkoutMealPlan): number {
    if (!plan.exercises || plan.exercises.length === 0) return 0;
    const completed = (plan.completed_status?.exercises?.length) || 0;
    return Math.round((completed / plan.exercises.length) * 100);
  }

  getCurrentDay(): string {
    return this.days[this.selectedTabIndex];
  }

  selectDay(index: number) {
    this.selectedTabIndex = index;
  }

  previousWeek() {
    if (this.selectedTabIndex > 0) {
      this.selectedTabIndex--;
    }
  }

  nextWeek() {
    if (this.selectedTabIndex < this.days.length - 1) {
      this.selectedTabIndex++;
    }
  }

  getDayShortName(day: string): string {
    return day.substring(0, 3);
  }

  isDayCompleted(day: string): boolean {
    const plan = this.getDayPlan(day);
    if (!plan || !plan.exercises || plan.exercises.length === 0) return false;
    const completed = (plan.completed_status?.exercises?.length) || 0;
    return completed === plan.exercises.length;
  }

  getWorkoutType(plan: WorkoutMealPlan): string {
    if (!plan.exercises || plan.exercises.length === 0) return 'Rest Day';
    const exercises = plan.exercises.map(e => e.name.toLowerCase()).join(' ');
    if (exercises.includes('push') || exercises.includes('chest') || exercises.includes('shoulder')) {
      return 'Upper Body';
    } else if (exercises.includes('squat') || exercises.includes('leg') || exercises.includes('deadlift')) {
      return 'Lower Body';
    } else if (exercises.includes('cardio') || exercises.includes('run') || exercises.includes('bike')) {
      return 'Cardio';
    }
    return 'Full Body';
  }

  getWorkoutTitle(plan: WorkoutMealPlan): string {
    const type = this.getWorkoutType(plan);
    if (type === 'Upper Body') return 'Push Day';
    if (type === 'Lower Body') return 'Leg Day';
    if (type === 'Cardio') return 'Cardio Day';
    return 'Full Body Workout';
  }

  estimateDuration(plan: WorkoutMealPlan): number {
    if (!plan.exercises || plan.exercises.length === 0) return 0;
    // Rough estimate: 5 minutes per exercise (including rest)
    return plan.exercises.length * 5;
  }

  getWorkoutDaysCount(): number {
    return this.weeklyPlans.filter(p => p.exercises && p.exercises.length > 0).length;
  }

  getTotalTime(): number {
    return this.weeklyPlans.reduce((total, plan) => {
      if (plan.exercises && plan.exercises.length > 0) {
        return total + this.estimateDuration(plan);
      }
      return total;
    }, 0);
  }

  getEstimatedCalories(): number {
    // Rough estimate: 10 calories per minute
    return Math.round(this.getTotalTime() * 10);
  }

  getTodayCalories(): number {
    const todayPlan = this.getDayPlan(this.getCurrentDay());
    if (!todayPlan || !todayPlan.exercises || todayPlan.exercises.length === 0) return 0;
    return Math.round(this.estimateDuration(todayPlan) * 10);
  }

  private showSuccess(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  private showError(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }

  private showInfo(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 4000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }
}
