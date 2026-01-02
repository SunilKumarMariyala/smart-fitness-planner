import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ApiService, WorkoutMealPlan, User, Meal } from '../../shared/services/api.service';

@Component({
  standalone: true,
  selector: 'app-meals',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatCheckboxModule,
    MatTabsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule,
    MatProgressBarModule
  ],
  templateUrl: './meals.html',
  styleUrls: ['./meals.css'],
})
export class MealsComponent implements OnInit {
  private apiService = inject(ApiService);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  currentUser: User | null = null;
  weeklyPlans: WorkoutMealPlan[] = [];
  isLoading = false;
  isGenerating = false;
  selectedTabIndex: number = 0;

  days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  mealTypes = ['breakfast', 'lunch', 'dinner', 'snacks'];

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
          this.showInfo('Please create your profile first to view meal plans.');
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
          this.showInfo('No meal plans found. Click "Generate Weekly Plan" to create one.');
        }
      },
      error: (error) => {
        setTimeout(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        }, 0);
        if (error.message.includes('No workout/meal plans found')) {
          this.showInfo('No meal plans found. Click "Generate Weekly Plan" to create one.');
        } else {
          this.showError('Failed to load meal plans.');
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
        this.showSuccess('Weekly meal plan generated successfully!');
        this.loadWeeklyPlan(this.currentUser!.id!);
      },
      error: (error) => {
        setTimeout(() => {
          this.isGenerating = false;
          this.cdr.detectChanges();
        }, 0);
        this.showError('Failed to generate meal plan. Please try again.');
        console.error('Error generating plan:', error);
      }
    });
  }

  toggleMeal(plan: WorkoutMealPlan, mealType: string) {
    if (!this.currentUser?.id || !plan.id) return;

    const isCompleted = plan.completed_status?.meals.includes(mealType) || false;
    const newStatus = !isCompleted;

    this.apiService.updateMealCompletion(
      this.currentUser.id,
      plan.id,
      mealType,
      newStatus
    ).subscribe({
      next: () => {
        // Update local state
        if (!plan.completed_status) {
          plan.completed_status = { exercises: [], meals: [] };
        }
        if (newStatus) {
          if (!plan.completed_status.meals.includes(mealType)) {
            plan.completed_status.meals.push(mealType);
          }
        } else {
          const index = plan.completed_status.meals.indexOf(mealType);
          if (index > -1) {
            plan.completed_status.meals.splice(index, 1);
          }
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.showError('Failed to update meal status.');
      }
    });
  }

  getDayPlan(day: string): WorkoutMealPlan | undefined {
    return this.weeklyPlans.find(p => p.day === day);
  }

  getMealCompletionPercentage(plan: WorkoutMealPlan): number {
    if (!plan.meals) return 0;
    const totalMeals = 4; // breakfast, lunch, dinner, snacks
    const completed = plan.completed_status?.meals.length || 0;
    return Math.round((completed / totalMeals) * 100);
  }

  getConsumedCalories(plan: WorkoutMealPlan): number {
    if (!plan.meals || !plan.completed_status) return 0;
    
    let consumed = 0;
    const completedMeals = plan.completed_status.meals || [];

    if (completedMeals.includes('breakfast')) {
      consumed += plan.meals.breakfast.calories;
    }
    if (completedMeals.includes('lunch')) {
      consumed += plan.meals.lunch.calories;
    }
    if (completedMeals.includes('dinner')) {
      consumed += plan.meals.dinner.calories;
    }
    if (completedMeals.includes('snacks')) {
      consumed += plan.meals.snacks.reduce((sum, snack) => sum + snack.calories, 0);
    }

    return consumed;
  }

  getTargetCalories(plan: WorkoutMealPlan): number {
    return plan.meals?.totalCalories || 0;
  }

  isMealCompleted(plan: WorkoutMealPlan, mealType: string): boolean {
    return plan.completed_status?.meals.includes(mealType) || false;
  }

  getTotalSnackCalories(snacks: Meal[]): number {
    if (!snacks) return 0;
    return snacks.reduce((sum, snack) => sum + snack.calories, 0);
  }

  getSnackNames(snacks: Meal[]): string {
    if (!snacks || snacks.length === 0) return 'Healthy Snacks';
    return snacks.map(s => s.name).join(', ');
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
    if (!plan || !plan.meals) return false;
    const completed = (plan.completed_status?.meals?.length) || 0;
    return completed === 4; // All 4 meals completed
  }

  // Macro estimation helpers (simplified - in real app, these would come from backend)
  estimateProtein(calories: number): number {
    // Rough estimate: 25% of calories from protein, 4 cal/g
    return Math.round((calories * 0.25) / 4);
  }

  estimateCarbs(calories: number): number {
    // Rough estimate: 45% of calories from carbs, 4 cal/g
    return Math.round((calories * 0.45) / 4);
  }

  estimateFat(calories: number): number {
    // Rough estimate: 30% of calories from fat, 9 cal/g
    return Math.round((calories * 0.30) / 9);
  }

  getConsumedProtein(plan: WorkoutMealPlan): number {
    if (!plan.meals || !plan.completed_status) return 0;
    let protein = 0;
    const completedMeals = plan.completed_status.meals || [];
    
    if (completedMeals.includes('breakfast')) {
      protein += this.estimateProtein(plan.meals.breakfast.calories);
    }
    if (completedMeals.includes('lunch')) {
      protein += this.estimateProtein(plan.meals.lunch.calories);
    }
    if (completedMeals.includes('dinner')) {
      protein += this.estimateProtein(plan.meals.dinner.calories);
    }
    if (completedMeals.includes('snacks')) {
      protein += this.estimateProtein(this.getTotalSnackCalories(plan.meals.snacks));
    }
    
    return protein;
  }

  getConsumedCarbs(plan: WorkoutMealPlan): number {
    if (!plan.meals || !plan.completed_status) return 0;
    let carbs = 0;
    const completedMeals = plan.completed_status.meals || [];
    
    if (completedMeals.includes('breakfast')) {
      carbs += this.estimateCarbs(plan.meals.breakfast.calories);
    }
    if (completedMeals.includes('lunch')) {
      carbs += this.estimateCarbs(plan.meals.lunch.calories);
    }
    if (completedMeals.includes('dinner')) {
      carbs += this.estimateCarbs(plan.meals.dinner.calories);
    }
    if (completedMeals.includes('snacks')) {
      carbs += this.estimateCarbs(this.getTotalSnackCalories(plan.meals.snacks));
    }
    
    return carbs;
  }

  getConsumedFat(plan: WorkoutMealPlan): number {
    if (!plan.meals || !plan.completed_status) return 0;
    let fat = 0;
    const completedMeals = plan.completed_status.meals || [];
    
    if (completedMeals.includes('breakfast')) {
      fat += this.estimateFat(plan.meals.breakfast.calories);
    }
    if (completedMeals.includes('lunch')) {
      fat += this.estimateFat(plan.meals.lunch.calories);
    }
    if (completedMeals.includes('dinner')) {
      fat += this.estimateFat(plan.meals.dinner.calories);
    }
    if (completedMeals.includes('snacks')) {
      fat += this.estimateFat(this.getTotalSnackCalories(plan.meals.snacks));
    }
    
    return fat;
  }

  getTargetProtein(): number {
    // Rough estimate based on user weight (2g per kg)
    if (!this.currentUser?.weight) return 100;
    return Math.round(this.currentUser.weight * 2);
  }

  getTargetCarbs(): number {
    // Rough estimate: 45% of total calories
    const targetCalories = this.currentUser ? this.calculateDailyCalories() : 2000;
    return Math.round((targetCalories * 0.45) / 4);
  }

  getTargetFat(): number {
    // Rough estimate: 30% of total calories
    const targetCalories = this.currentUser ? this.calculateDailyCalories() : 2000;
    return Math.round((targetCalories * 0.30) / 9);
  }

  calculateDailyCalories(): number {
    if (!this.currentUser || !this.currentUser.height || !this.currentUser.weight || !this.currentUser.age) {
      return 2000;
    }
    // Simplified BMR calculation
    const bmr = 10 * this.currentUser.weight + 6.25 * this.currentUser.height - 5 * this.currentUser.age;
    const genderMultiplier = this.currentUser.gender === 'female' ? -161 : 5;
    const baseCalories = bmr + genderMultiplier;
    const activityMultiplier = 1.2;
    let targetCalories = baseCalories * activityMultiplier;
    
    if (this.currentUser.goal === 'weight_loss') {
      targetCalories -= 500;
    } else if (this.currentUser.goal === 'muscle_gain') {
      targetCalories += 300;
    }
    
    return Math.round(targetCalories);
  }

  // Expose Math to template
  Math = Math;

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
