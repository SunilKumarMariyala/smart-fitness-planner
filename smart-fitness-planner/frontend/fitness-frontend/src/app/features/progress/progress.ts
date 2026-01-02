import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService, WorkoutMealPlan, User, WeightEntry } from '../../shared/services/api.service';

interface WeeklyStats {
  totalExercises: number;
  completedExercises: number;
  totalMeals: number;
  completedMeals: number;
  totalCaloriesTarget: number;
  totalCaloriesConsumed: number;
  workoutCompletionRate: number;
  mealCompletionRate: number;
}

@Component({
  standalone: true,
  selector: 'app-progress',
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressBarModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatChipsModule
  ],
  templateUrl: './progress.html',
  styleUrls: ['./progress.css'],
})
export class ProgressComponent implements OnInit {
  private apiService = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);

  currentUser: User | null = null;
  weeklyPlans: WorkoutMealPlan[] = [];
  isLoading = false;
  weeklyStats: WeeklyStats | null = null;
  weightHistory: WeightEntry[] = [];
  startingWeight: number = 0;

  days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Cache for day plan data to avoid repeated calculations
  private dayPlanCache: Map<string, WorkoutMealPlan | undefined> = new Map();
  private dayStatsCache: Map<string, {
    workoutCompletion: number;
    mealCompletion: number;
    calories: { consumed: number; target: number };
  }> = new Map();

  ngOnInit() {
    this.loadUserAndPlans();
  }

  loadUserAndPlans() {
    this.isLoading = true;
    this.cdr.detectChanges();
    
    // Load profile and plans in parallel for faster loading
    this.apiService.getProfile().pipe(
      catchError(() => of(null))
    ).subscribe({
      next: (user) => {
        if (user && user.id) {
          // Load both profile and plans in parallel
          forkJoin({
            user: of(user),
            plans: this.apiService.getWeeklyPlan(user.id).pipe(
              catchError(() => of([]))
            )
          }).subscribe({
            next: ({ user, plans }) => {
              this.currentUser = user;
              this.weeklyPlans = plans;
              this.calculateWeeklyStats();
              this.clearCache();
              // Load weight history
              if (user.id) {
                this.loadWeightHistory(user.id);
              }
              setTimeout(() => {
                this.isLoading = false;
                this.cdr.detectChanges();
              }, 0);
            },
            error: () => {
              setTimeout(() => {
                this.isLoading = false;
                this.cdr.detectChanges();
              }, 0);
            }
          });
        } else {
          setTimeout(() => {
            this.isLoading = false;
            this.cdr.detectChanges();
          }, 0);
        }
      },
      error: () => {
        setTimeout(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        }, 0);
      }
    });
  }

  clearCache() {
    this.dayPlanCache.clear();
    this.dayStatsCache.clear();
  }

  loadWeightHistory(userId: number) {
    this.apiService.getWeightHistory(userId, 56) // Get last 8 weeks (56 days)
      .pipe(catchError(() => of({ message: '', history: [] })))
      .subscribe({
        next: (response) => {
          this.weightHistory = response.history || [];
          // Set starting weight (oldest entry or current user weight)
          if (this.weightHistory.length > 0) {
            // Sort by date ascending to get oldest
            const sorted = [...this.weightHistory].sort((a, b) => 
              new Date(a.recorded_date).getTime() - new Date(b.recorded_date).getTime()
            );
            this.startingWeight = sorted[0].weight;
          } else if (this.currentUser) {
            this.startingWeight = this.currentUser.weight;
          }
          this.cdr.detectChanges();
        }
      });
  }

  calculateWeeklyStats() {
    let totalExercises = 0;
    let completedExercises = 0;
    let totalMeals = 0;
    let completedMeals = 0;
    let totalCaloriesTarget = 0;
    let totalCaloriesConsumed = 0;

    this.weeklyPlans.forEach(plan => {
      // Exercise stats
      const planExercises = plan.exercises?.length || 0;
      totalExercises += planExercises;
      completedExercises += plan.completed_status?.exercises.length || 0;

      // Meal stats
      totalMeals += 4; // breakfast, lunch, dinner, snacks
      completedMeals += plan.completed_status?.meals.length || 0;

      // Calorie stats
      if (plan.meals) {
        totalCaloriesTarget += plan.meals.totalCalories || 0;
        
        let consumed = 0;
        const completedMealTypes = plan.completed_status?.meals || [];
        
        if (completedMealTypes.includes('breakfast')) {
          consumed += plan.meals.breakfast.calories;
        }
        if (completedMealTypes.includes('lunch')) {
          consumed += plan.meals.lunch.calories;
        }
        if (completedMealTypes.includes('dinner')) {
          consumed += plan.meals.dinner.calories;
        }
        if (completedMealTypes.includes('snacks')) {
          consumed += plan.meals.snacks.reduce((sum, snack) => sum + snack.calories, 0);
        }
        
        totalCaloriesConsumed += consumed;
      }
    });

    this.weeklyStats = {
      totalExercises,
      completedExercises,
      totalMeals,
      completedMeals,
      totalCaloriesTarget,
      totalCaloriesConsumed,
      workoutCompletionRate: totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0,
      mealCompletionRate: totalMeals > 0 ? (completedMeals / totalMeals) * 100 : 0
    };
  }

  getDayPlan(day: string): WorkoutMealPlan | undefined {
    if (this.dayPlanCache.has(day)) {
      return this.dayPlanCache.get(day);
    }
    const plan = this.weeklyPlans.find(p => p.day === day);
    this.dayPlanCache.set(day, plan);
    return plan;
  }

  getDayWorkoutCompletion(plan: WorkoutMealPlan): number {
    if (!plan.exercises || plan.exercises.length === 0) return 0;
    const completed = (plan.completed_status?.exercises?.length) || 0;
    return Math.round((completed / plan.exercises.length) * 100);
  }

  getDayMealCompletion(plan: WorkoutMealPlan): number {
    const totalMeals = 4;
    const completed = (plan.completed_status?.meals?.length) || 0;
    return Math.round((completed / totalMeals) * 100);
  }

  getDayCalories(plan: WorkoutMealPlan): { consumed: number; target: number } {
    if (!plan) return { consumed: 0, target: 0 };
    
    const cacheKey = `${plan.id}-calories`;
    if (this.dayStatsCache.has(cacheKey)) {
      return this.dayStatsCache.get(cacheKey)!.calories;
    }

    const target = plan.meals?.totalCalories || 0;
    let consumed = 0;

    if (plan.meals && plan.completed_status) {
      const completedMealTypes = plan.completed_status.meals || [];
      
      if (completedMealTypes.includes('breakfast') && plan.meals.breakfast) {
        consumed += plan.meals.breakfast.calories || 0;
      }
      if (completedMealTypes.includes('lunch') && plan.meals.lunch) {
        consumed += plan.meals.lunch.calories || 0;
      }
      if (completedMealTypes.includes('dinner') && plan.meals.dinner) {
        consumed += plan.meals.dinner.calories || 0;
      }
      if (completedMealTypes.includes('snacks') && plan.meals.snacks) {
        consumed += plan.meals.snacks.reduce((sum, snack) => sum + (snack.calories || 0), 0);
      }
    }

    const result = { consumed, target: target || 1 }; // Ensure target is never 0 to avoid division by zero
    // Cache the result
    if (!this.dayStatsCache.has(cacheKey)) {
      this.dayStatsCache.set(cacheKey, {
        workoutCompletion: this.getDayWorkoutCompletion(plan),
        mealCompletion: this.getDayMealCompletion(plan),
        calories: result
      });
    }
    return result;
  }

  calculateWeightLost(): number {
    if (!this.currentUser || this.startingWeight === 0) return 0;
    const currentWeight = this.currentUser.weight;
    const lost = this.startingWeight - currentWeight;
    return Math.max(0, lost); // Only return positive values (weight loss)
  }

  getTotalWorkoutsCompleted(): number {
    if (!this.weeklyStats) return 0;
    return this.weeklyStats.completedExercises;
  }

  getAverageCompletion(): number {
    if (!this.weeklyStats) return 0;
    return Math.round((this.weeklyStats.workoutCompletionRate + this.weeklyStats.mealCompletionRate) / 2);
  }

  getCurrentStreak(): number {
    // Simplified streak calculation - count consecutive days with any completed exercises
    if (!this.weeklyPlans || this.weeklyPlans.length === 0) return 0;
    
    // Get today's day name
    const today = new Date();
    const todayDayName = today.toLocaleDateString('en-US', { weekday: 'long' });
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const todayIndex = dayNames.indexOf(todayDayName);
    
    if (todayIndex === -1) return 0;
    
    // Count consecutive days backwards from today
    let streak = 0;
    let currentIndex = todayIndex;
    
    // Check days backwards (today, yesterday, day before, etc.)
    for (let i = 0; i < 7; i++) {
      const dayName = dayNames[currentIndex];
      const plan = this.weeklyPlans.find(p => p.day === dayName);
      
      if (plan) {
        const totalExercises = plan.exercises?.length || 0;
        const completedExercises = plan.completed_status?.exercises?.length || 0;
        
        // Count if at least 1 exercise is completed (very lenient)
        if (totalExercises > 0 && completedExercises > 0) {
          streak++;
          // Move to previous day
          currentIndex = currentIndex === 0 ? 6 : currentIndex - 1;
        } else {
          // Streak broken - no exercises completed on this day
          break;
        }
      } else {
        // No plan for this day - streak broken
        break;
      }
    }
    
    return streak;
  }

  getWeightLossProgress(): number {
    // Progress towards 5kg weight loss goal
    const lost = this.calculateWeightLost();
    return Math.min(100, Math.round((lost / 5) * 100));
  }

  getStreakProgress(): number {
    // Progress towards 30-day streak
    const current = this.getCurrentStreak();
    return Math.min(100, Math.round((current / 30) * 100));
  }

  getDayShortName(day: string): string {
    return day.substring(0, 3);
  }

  // Chart Data Methods
  getWeightChartData(): Array<{x1: number, y1: number, x2: number, y2: number}> {
    const points: Array<{x1: number, y1: number, x2: number, y2: number}> = [];
    
    if (this.weightHistory.length === 0) {
      // If no weight history, use current weight as single point
      if (!this.currentUser) return [];
      const weight = this.currentUser.weight;
      const chartHeight = 150;
      const chartTop = 20;
      const y = chartTop + (chartHeight / 2); // Middle of chart
      points.push({ x1: 50, y1: y, x2: 400, y2: y });
      return points;
    }

    // Use real weight history data
    const sortedHistory = [...this.weightHistory].sort((a, b) => 
      new Date(a.recorded_date).getTime() - new Date(b.recorded_date).getTime()
    );

    // Get last 8 weeks of data (or all if less than 8 weeks)
    const weeksToShow = Math.min(8, Math.ceil(sortedHistory.length / 7));
    const recentHistory = sortedHistory.slice(-weeksToShow * 7);
    
    // Group by week (average weight per week)
    const weeklyData: number[] = [];
    for (let week = 0; week < weeksToShow; week++) {
      const weekStart = week * 7;
      const weekEnd = Math.min(weekStart + 7, recentHistory.length);
      const weekEntries = recentHistory.slice(weekStart, weekEnd);
      if (weekEntries.length > 0) {
        const avgWeight = weekEntries.reduce((sum, e) => sum + e.weight, 0) / weekEntries.length;
        weeklyData.push(avgWeight);
      } else if (week === 0 && this.currentUser) {
        // Use current weight if no history
        weeklyData.push(this.currentUser.weight);
      }
    }

    if (weeklyData.length === 0) return [];

    const maxWeight = Math.max(...weeklyData);
    const minWeight = Math.min(...weeklyData);
    const weightRange = maxWeight - minWeight || 1; // Avoid division by zero
    const chartHeight = 150;
    const chartTop = 20;
    const chartWidth = 350;
    const padding = 50;
    const stepX = (chartWidth - 2 * padding) / (weeklyData.length - 1 || 1);
    
    let previousY2: number = chartTop + (chartHeight - ((weeklyData[0] - minWeight) / weightRange * chartHeight));
    
    for (let i = 0; i < weeklyData.length; i++) {
      const normalizedWeight = (weeklyData[i] - minWeight) / weightRange;
      const y2 = chartTop + (chartHeight - (normalizedWeight * chartHeight));
      
      const x1 = i === 0 ? padding : padding + ((i - 1) * stepX);
      const y1 = i === 0 ? previousY2 : previousY2;
      const x2 = padding + (i * stepX);
      
      points.push({ x1, y1, x2, y2 });
      previousY2 = y2;
    }
    
    return points;
  }

  getWeightAreaPath(): string {
    const points = this.getWeightChartData();
    if (points.length === 0) return '';
    let path = `M ${points[0].x1} ${points[0].y1}`;
    points.forEach(point => {
      path += ` L ${point.x2} ${point.y2}`;
    });
    const lastPoint = points[points.length - 1];
    path += ` L ${lastPoint.x2} 170 L ${points[0].x1} 170 Z`;
    return path;
  }

  getWeightLinePath(): string {
    const points = this.getWeightChartData();
    if (points.length === 0) return '';
    let path = `M ${points[0].x1} ${points[0].y1}`;
    points.forEach(point => {
      path += ` L ${point.x2} ${point.y2}`;
    });
    return path;
  }

  getWeightChartLabels(): Array<{x: number, text: string}> {
    const labels = [];
    const points = this.getWeightChartData();
    if (points.length === 0) {
      // If no data, show at least one label
      if (this.currentUser) {
        labels.push({ x: 200, text: 'Current' });
      }
      return labels;
    }
    
    const weeksToShow = Math.max(1, Math.min(8, points.length));
    const chartWidth = 350;
    const padding = 50;
    const stepX = weeksToShow > 1 ? (chartWidth - 2 * padding) / (weeksToShow - 1) : chartWidth / 2;
    
    for (let i = 0; i < weeksToShow; i++) {
      labels.push({
        x: padding + (i * stepX),
        text: weeksToShow === 1 ? 'Current' : `W${i + 1}`
      });
    }
    return labels;
  }

  estimateCaloriesBurned(plan: WorkoutMealPlan | undefined): number {
    if (!plan || !plan.exercises || plan.exercises.length === 0) return 0;
    // Rough estimate: 10 calories per minute, average 30 min workout
    // More accurate: base calories on exercise type and duration
    const baseCaloriesPerExercise = 50; // Base calories per exercise
    const totalCalories = plan.exercises.length * baseCaloriesPerExercise;
    return totalCalories;
  }

  // Achievement Methods
  isAchievementEarned(achievement: string): boolean {
    switch (achievement) {
      case 'firstWeek':
        return this.weeklyPlans.length >= 7 && this.getAverageCompletion() >= 50;
      case 'tenWorkouts':
        return this.getTotalWorkoutsCompleted() >= 10;
      case 'weightLoss':
        return this.calculateWeightLost() >= 5;
      case 'streak':
        return this.getCurrentStreak() >= 30;
      default:
        return false;
    }
  }

  getFirstWeekProgress(): number {
    if (this.weeklyPlans.length === 0) return 0;
    const completion = this.getAverageCompletion();
    return Math.min(100, Math.round((completion / 50) * 100));
  }

  getTenWorkoutsProgress(): number {
    const completed = this.getTotalWorkoutsCompleted();
    return Math.min(100, Math.round((completed / 10) * 100));
  }
}
