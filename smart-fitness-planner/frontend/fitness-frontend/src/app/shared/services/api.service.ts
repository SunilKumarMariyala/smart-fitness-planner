import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface User {
  id?: number;
  name: string;
  age: number;
  gender?: string;
  height: number;
  weight: number;
  goal: 'weight_loss' | 'muscle_gain' | 'maintenance';
  created_at?: string;
  updated_at?: string;
}

export interface Exercise {
  name: string;
  sets: number;
  reps: number;
  instructions: string;
  duration?: number;
}

export interface Meal {
  name: string;
  calories: number;
  description: string;
}

export interface DailyMeals {
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
  snacks: Meal[];
  totalCalories: number;
}

export interface WorkoutMealPlan {
  id?: number;
  user_id: number;
  day: string;
  exercises: Exercise[];
  meals: DailyMeals;
  completed_status?: {
    exercises: number[];
    meals: string[];
  };
  created_at?: string;
  updated_at?: string;
}

export interface WeightEntry {
  id?: number;
  user_id: number;
  weight: number;
  recorded_date: string; // YYYY-MM-DD format
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api';

  // User Profile Methods
  saveProfile(profile: Omit<User, 'id' | 'created_at' | 'updated_at'>): Observable<{ message: string; userId: number }> {
    return this.http.post<{ message: string; userId: number }>(`${this.apiUrl}/profile`, profile)
      .pipe(catchError(this.handleError));
  }

  getProfile(userId?: number): Observable<User> {
    const url = userId 
      ? `${this.apiUrl}/profile?userId=${userId}`
      : `${this.apiUrl}/profile`;
    return this.http.get<User>(url)
      .pipe(
        catchError((error) => {
          // If it's a 404, return a user-friendly error (don't log to console as it's expected)
          if (error.status === 404) {
            return throwError(() => new Error('No profile found'));
          }
          return this.handleError(error);
        })
      );
  }

  updateProfile(userId: number, updates: Partial<User>): Observable<{ message: string; user: User }> {
    return this.http.put<{ message: string; user: User }>(`${this.apiUrl}/users/${userId}`, updates)
      .pipe(catchError(this.handleError));
  }

  // Workout & Meal Plan Methods
  generateWeeklyPlan(userId: number): Observable<{ message: string; plans: any[] }> {
    return this.http.post<{ message: string; plans: any[] }>(
      `${this.apiUrl}/users/${userId}/plans/generate`,
      {}
    ).pipe(catchError(this.handleError));
  }

  getWeeklyPlan(userId: number): Observable<WorkoutMealPlan[]> {
    return this.http.get<WorkoutMealPlan[]>(`${this.apiUrl}/users/${userId}/plans`)
      .pipe(catchError(this.handleError));
  }

  getDayPlan(userId: number, day: string): Observable<WorkoutMealPlan> {
    return this.http.get<WorkoutMealPlan>(`${this.apiUrl}/users/${userId}/plans/${day}`)
      .pipe(catchError(this.handleError));
  }

  updateExerciseCompletion(
    userId: number,
    planId: number,
    exerciseIndex: number,
    completed: boolean
  ): Observable<{ message: string; completedExercises: number[] }> {
    return this.http.patch<{ message: string; completedExercises: number[] }>(
      `${this.apiUrl}/users/${userId}/plans/${planId}/exercises`,
      { exerciseIndex, completed }
    ).pipe(catchError(this.handleError));
  }

  updateMealCompletion(
    userId: number,
    planId: number,
    mealType: string,
    completed: boolean
  ): Observable<{ message: string; completedMeals: string[] }> {
    return this.http.patch<{ message: string; completedMeals: string[] }>(
      `${this.apiUrl}/users/${userId}/plans/${planId}/meals`,
      { mealType, completed }
    ).pipe(catchError(this.handleError));
  }

  // Weight Tracking Methods
  addWeightEntry(
    userId: number,
    weight: number,
    recorded_date: string,
    notes?: string
  ): Observable<{ message: string; entry: WeightEntry }> {
    return this.http.post<{ message: string; entry: WeightEntry }>(
      `${this.apiUrl}/users/${userId}/weight`,
      { weight, recorded_date, notes }
    ).pipe(catchError(this.handleError));
  }

  getWeightHistory(userId: number, limit?: number): Observable<{ message: string; history: WeightEntry[] }> {
    const url = limit 
      ? `${this.apiUrl}/users/${userId}/weight/history?limit=${limit}`
      : `${this.apiUrl}/users/${userId}/weight/history`;
    return this.http.get<{ message: string; history: WeightEntry[] }>(url)
      .pipe(catchError(this.handleError));
  }

  getLatestWeight(userId: number): Observable<{ message: string; weight: WeightEntry }> {
    return this.http.get<{ message: string; weight: WeightEntry }>(
      `${this.apiUrl}/users/${userId}/weight/latest`
    ).pipe(catchError(this.handleError));
  }

  deleteWeightEntry(userId: number, entryId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/users/${userId}/weight/${entryId}`
    ).pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error (network issue, CORS, etc.)
      errorMessage = `Network Error: ${error.error.message}`;
      console.error('Client-side API Error:', errorMessage);
    } else {
      // Server-side error
      if (error.status === 0) {
        // CORS or connection refused
        errorMessage = 'Cannot connect to server. Please ensure the backend is running on http://localhost:3000';
      } else if (error.status === 404) {
        errorMessage = 'No profile found';
      } else {
        errorMessage = error.error?.message || `Error Code: ${error.status}\nMessage: ${error.message}`;
      }
      console.error('Server-side API Error:', errorMessage, error);
    }
    
    return throwError(() => new Error(errorMessage));
  }
}

