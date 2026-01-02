import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService, WorkoutMealPlan, User } from '../../shared/services/api.service';

interface StatCard {
  title: string;
  value: string | number;
  subtitle: string;
  icon: string;
  variant: 'primary' | 'accent' | 'success' | 'warning';
  trend?: string;
}

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatCheckboxModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  private apiService = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);

  currentUser: User | null = null;
  weeklyPlans: WorkoutMealPlan[] = [];
  isLoading = false;
  
  // Stats
  stats: StatCard[] = [];
  
  // Today's data
  todayPlan: WorkoutMealPlan | null = null;
  todayMeals: any = null;
  
  // Greeting
  greeting = '';
  currentStreak = 0;

  ngOnInit() {
    this.setGreeting();
    this.loadDashboardData();
  }

  setGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) {
      this.greeting = 'Good Morning';
    } else if (hour < 18) {
      this.greeting = 'Good Afternoon';
    } else {
      this.greeting = 'Good Evening';
    }
  }

  loadDashboardData() {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.apiService.getProfile().pipe(
      catchError(() => of(null))
    ).subscribe({
      next: (user) => {
        if (user && user.id) {
          forkJoin({
            user: of(user),
            plans: this.apiService.getWeeklyPlan(user.id).pipe(
              catchError(() => of([]))
            )
          }).subscribe({
            next: ({ user, plans }) => {
              this.currentUser = user;
              this.weeklyPlans = plans;
              this.processDashboardData();
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

  processDashboardData() {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    this.todayPlan = this.weeklyPlans.find(p => p.day === today) || null;
    this.todayMeals = this.todayPlan?.meals || null;

    // Calculate stats
    const totalExercises = this.weeklyPlans.reduce((sum, p) => sum + (p.exercises?.length || 0), 0);
    const completedExercises = this.weeklyPlans.reduce((sum, p) => sum + ((p.completed_status?.exercises?.length) || 0), 0);
    const totalCaloriesBurned = this.calculateEstimatedCalories();
    const workoutCompletionRate = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

    // Calculate streak (simplified - count consecutive days with completed workouts)
    this.currentStreak = this.calculateStreak();

    this.stats = [
      {
        title: 'Calories Burned',
        value: Math.round(totalCaloriesBurned),
        subtitle: 'This week',
        icon: 'local_fire_department',
        variant: 'warning',
        trend: '+12%'
      },
      {
        title: 'Workouts Completed',
        value: `${completedExercises}/${totalExercises}`,
        subtitle: 'Exercises done',
        icon: 'fitness_center',
        variant: 'accent'
      },
      {
        title: 'Current Streak',
        value: `${this.currentStreak} days`,
        subtitle: 'Keep it up!',
        icon: 'trending_up',
        variant: 'success',
        trend: '+3'
      },
      {
        title: 'Goal Progress',
        value: `${Math.round(workoutCompletionRate)}%`,
        subtitle: 'Weekly completion',
        icon: 'track_changes',
        variant: 'primary'
      }
    ];
  }

  calculateEstimatedCalories(): number {
    // Rough estimate: 5 calories per minute of exercise
    // Assuming average 30 min workout per day
    const workoutDays = this.weeklyPlans.filter(p => p.exercises && p.exercises.length > 0).length;
    return workoutDays * 30 * 5;
  }

  calculateStreak(): number {
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

  toggleExerciseComplete(index: number) {
    if (!this.todayPlan || !this.currentUser?.id || !this.todayPlan.id) return;
    
    const isCompleted = this.isExerciseComplete(index);
    
    this.apiService.updateExerciseCompletion(
      this.currentUser.id,
      this.todayPlan.id,
      index,
      !isCompleted
    ).subscribe({
      next: () => {
        this.loadDashboardData();
      }
    });
  }

  toggleMealComplete(mealType: string) {
    if (!this.todayPlan || !this.currentUser?.id || !this.todayPlan.id) return;
    
    const isCompleted = this.isMealComplete(mealType);
    
    this.apiService.updateMealCompletion(
      this.currentUser.id,
      this.todayPlan.id,
      mealType,
      !isCompleted
    ).subscribe({
      next: () => {
        this.loadDashboardData();
      }
    });
  }

  isExerciseComplete(index: number): boolean {
    return this.todayPlan?.completed_status?.exercises?.includes(index) || false;
  }

  isMealComplete(mealType: string): boolean {
    return this.todayPlan?.completed_status?.meals?.includes(mealType) || false;
  }

  getWorkoutCompletion(): number {
    if (!this.todayPlan || !this.todayPlan.exercises || this.todayPlan.exercises.length === 0) return 0;
    const completed = (this.todayPlan.completed_status?.exercises?.length) || 0;
    return Math.round((completed / this.todayPlan.exercises.length) * 100);
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  getWorkoutType(): string {
    if (!this.todayPlan || !this.todayPlan.exercises || this.todayPlan.exercises.length === 0) {
      return 'Rest Day';
    }
    // Simple logic to determine workout type based on exercise names
    const exercises = this.todayPlan.exercises.map(e => e.name.toLowerCase()).join(' ');
    if (exercises.includes('push') || exercises.includes('chest') || exercises.includes('shoulder')) {
      return 'Upper Body';
    } else if (exercises.includes('squat') || exercises.includes('leg') || exercises.includes('deadlift')) {
      return 'Lower Body';
    } else if (exercises.includes('cardio') || exercises.includes('run') || exercises.includes('bike')) {
      return 'Cardio';
    }
    return 'Full Body';
  }

  getConsumedCalories(): number {
    if (!this.todayMeals || !this.todayPlan?.completed_status) return 0;
    let consumed = 0;
    const completedMeals = this.todayPlan.completed_status.meals || [];
    
    if (completedMeals.includes('breakfast')) consumed += this.todayMeals.breakfast.calories;
    if (completedMeals.includes('lunch')) consumed += this.todayMeals.lunch.calories;
    if (completedMeals.includes('dinner')) consumed += this.todayMeals.dinner.calories;
    if (completedMeals.includes('snacks')) {
      consumed += this.getSnackCalories();
    }
    
    return consumed;
  }

  getSnackCalories(): number {
    if (!this.todayMeals?.snacks) return 0;
    return this.todayMeals.snacks.reduce((sum: number, snack: any) => sum + snack.calories, 0);
  }

  getDaysOfWeek(): Array<{name: string, short: string}> {
    return [
      { name: 'Monday', short: 'Mon' },
      { name: 'Tuesday', short: 'Tue' },
      { name: 'Wednesday', short: 'Wed' },
      { name: 'Thursday', short: 'Thu' },
      { name: 'Friday', short: 'Fri' },
      { name: 'Saturday', short: 'Sat' },
      { name: 'Sunday', short: 'Sun' }
    ];
  }

  getDayPlan(day: string): WorkoutMealPlan | undefined {
    return this.weeklyPlans.find(p => p.day === day);
  }

  getDayCompletion(plan: WorkoutMealPlan): number {
    if (!plan.exercises || plan.exercises.length === 0) return 0;
    const completed = (plan.completed_status?.exercises?.length) || 0;
    return Math.round((completed / plan.exercises.length) * 100);
  }

  getAverageCompletion(): number {
    if (this.weeklyPlans.length === 0) return 0;
    const totalCompletion = this.weeklyPlans.reduce((sum, plan) => {
      return sum + this.getDayCompletion(plan);
    }, 0);
    return Math.round(totalCompletion / this.weeklyPlans.length);
  }

  getTotalWeeklyCalories(): number {
    return this.weeklyPlans.reduce((sum, plan) => {
      if (plan.meals) {
        let consumed = 0;
        const completedMeals = plan.completed_status?.meals || [];
        if (completedMeals.includes('breakfast')) consumed += plan.meals.breakfast.calories;
        if (completedMeals.includes('lunch')) consumed += plan.meals.lunch.calories;
        if (completedMeals.includes('dinner')) consumed += plan.meals.dinner.calories;
        if (completedMeals.includes('snacks')) {
          consumed += plan.meals.snacks.reduce((s: number, snack: any) => s + snack.calories, 0);
        }
        return sum + consumed;
      }
      return sum;
    }, 0);
  }

  getWorkoutDaysCount(): number {
    return this.weeklyPlans.filter(p => p.exercises && p.exercises.length > 0).length;
  }

  getWeeklyChartPoints(): Array<{x: number, y: number, value: number}> {
    const points: Array<{x: number, y: number, value: number}> = [];
    const days = this.getDaysOfWeek();
    const chartWidth = 1040; // Total chart width minus margins (1120 - 80)
    const chartHeight = 180; // 230 - 50 (margins)
    const startX = 80;
    const startY = 50;
    const stepX = chartWidth / 6; // 6 intervals for 7 days = 173.33
    
    days.forEach((day, index) => {
      const plan = this.getDayPlan(day.name);
      let completion = 0;
      
      if (plan) {
        // Calculate completion based on both exercises and meals
        const exerciseCompletion = this.getDayCompletion(plan);
        const mealCompletion = this.getDayMealCompletion(plan);
        // Average of exercise and meal completion
        completion = Math.round((exerciseCompletion + mealCompletion) / 2);
      }
      
      const x = startX + (index * stepX);
      // Y is inverted (0% at bottom = 230, 100% at top = 50)
      // Map completion (0-100) to y position
      const y = startY + chartHeight - (completion / 100 * chartHeight);
      points.push({ x, y, value: completion });
    });
    
    return points;
  }

  getDayMealCompletion(plan: WorkoutMealPlan): number {
    if (!plan) return 0;
    const totalMeals = 4; // breakfast, lunch, dinner, snacks
    const completed = (plan.completed_status?.meals?.length) || 0;
    return Math.round((completed / totalMeals) * 100);
  }

  // Helper method to get grid line positions (for alignment)
  getGridLineX(index: number): number {
    const startX = 80;
    const chartWidth = 1040;
    const stepX = chartWidth / 6;
    return startX + (index * stepX);
  }

  // Helper method to get label positions (centered in each segment)
  getLabelX(index: number): number {
    const startX = 80;
    const chartWidth = 1040;
    const stepX = chartWidth / 6;
    return startX + (index * stepX) + (stepX / 2);
  }

  getWeeklyCurvedLinePath(): string {
    const points = this.getWeeklyChartPoints();
    if (points.length === 0) return '';
    
    // Create smooth curve using cubic bezier curves
    let path = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      
      // Calculate control points for smooth curve
      const dx = (next.x - current.x) / 2;
      const dy = (next.y - current.y) / 2;
      
      // Control point 1 (right of current point)
      const cp1x = current.x + dx * 0.5;
      const cp1y = current.y;
      
      // Control point 2 (left of next point)
      const cp2x = next.x - dx * 0.5;
      const cp2y = next.y;
      
      // Use cubic bezier for smooth curves
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
    }
    
    return path;
  }

  getWeeklyLinePath(): string {
    const points = this.getWeeklyChartPoints();
    if (points.length === 0) return '';
    
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
    return path;
  }

  getWeeklyAreaPath(): string {
    const points = this.getWeeklyChartPoints();
    if (points.length === 0) return '';
    
    const chartHeight = 180;
    const baseY = 50 + chartHeight; // Bottom of chart (230)
    
    // Start from bottom left
    let path = `M ${points[0].x} ${baseY}`;
    path += ` L ${points[0].x} ${points[0].y}`;
    
    // Create smooth curve using the same bezier logic as the line
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      
      // Calculate control points for smooth curve
      const dx = (next.x - current.x) / 2;
      
      // Control point 1 (right of current point)
      const cp1x = current.x + dx * 0.5;
      const cp1y = current.y;
      
      // Control point 2 (left of next point)
      const cp2x = next.x - dx * 0.5;
      const cp2y = next.y;
      
      // Use cubic bezier for smooth curves
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
    }
    
    // Close the path by going to bottom right and back to start
    path += ` L ${points[points.length - 1].x} ${baseY} Z`;
    return path;
  }

  getWeightChange(): string {
    // Calculate weight change (simplified - in real app would track weight history)
    const weightLost = this.calculateWeightLost();
    if (weightLost > 0) {
      return `-${weightLost.toFixed(1)} kg`;
    }
    return '0.0 kg';
  }

  calculateWeightLost(): number {
    // Calculate weight lost using weight tracking data
    if (!this.currentUser) return 0;
    
    // Try to get weight history from API
    // For now, we'll use a simple calculation based on current weight
    // The progress page has full weight tracking implementation
    // This is a placeholder - in a full implementation, we'd fetch weight history here
    return 0;
  }
}

