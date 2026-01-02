import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { race, timer, of, map } from 'rxjs';
import { ApiService, User } from '../../shared/services/api.service';

@Component({
  standalone: true,
  selector: 'app-profile',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  profileForm!: FormGroup;
  currentUser: User | null = null;
  isLoading = false;
  isSaving = false;
  isEditing = false;

  ngOnInit() {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      age: ['', [Validators.required, Validators.min(10), Validators.max(100)]],
      gender: [''],
      height: ['', [Validators.required, Validators.min(50), Validators.max(250)]],
      weight: ['', [Validators.required, Validators.min(20), Validators.max(300)]],
      goal: ['', Validators.required]
    });

    // If no profile exists, allow editing immediately
    // Otherwise, disable fields until edit mode is activated
    this.loadProfile();
  }

  loadProfile() {
    this.isLoading = true;
    this.cdr.detectChanges();
    
    // Race between API call and 3 second timeout
    race(
      this.apiService.getProfile(),
      timer(3000).pipe(map(() => null))
    ).subscribe({
      next: (user) => {
        if (user) {
          this.currentUser = user;
          this.isEditing = false; // Start in view mode when profile exists
          this.profileForm.patchValue({
            name: user.name,
            age: user.age,
            gender: user.gender || '',
            height: user.height,
            weight: user.weight,
            goal: user.goal
          });
          // Disable form when profile exists and not editing
          this.updateFormControlsState();
        } else {
          // No profile exists, allow editing immediately
          this.currentUser = null;
          this.isEditing = true;
          this.updateFormControlsState();
        }
        setTimeout(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        }, 0);
      },
      error: (error) => {
        // No profile exists, allow editing immediately
        this.currentUser = null;
        this.isEditing = true;
        this.updateFormControlsState();
        setTimeout(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        }, 0);
        // Only log errors that aren't expected (404 when no profile exists)
        const errorMessage = error?.message || '';
        if (!errorMessage.includes('No profile found') && !errorMessage.includes('404')) {
          console.error('Error loading profile:', error);
        }
      }
    });
  }

  private updateFormControlsState() {
    if (this.isEditing || !this.currentUser) {
      // Enable all form controls when editing or no profile exists
      this.profileForm.get('name')?.enable();
      this.profileForm.get('age')?.enable();
      this.profileForm.get('gender')?.enable();
      this.profileForm.get('height')?.enable();
      this.profileForm.get('weight')?.enable();
      this.profileForm.get('goal')?.enable();
    } else {
      // Disable all form controls when viewing existing profile
      this.profileForm.get('name')?.disable();
      this.profileForm.get('age')?.disable();
      this.profileForm.get('gender')?.disable();
      this.profileForm.get('height')?.disable();
      this.profileForm.get('weight')?.disable();
      this.profileForm.get('goal')?.disable();
    }
  }

  onSubmit() {
    if (this.profileForm.valid) {
      this.isSaving = true;
      this.cdr.detectChanges();
      const formValue = this.profileForm.value;

      if (this.currentUser?.id) {
        // Update existing profile
        const oldWeight = this.currentUser.weight;
        this.apiService.updateProfile(this.currentUser.id, formValue).subscribe({
          next: (response) => {
            this.currentUser = response.user;
            // Record weight change if weight was updated
            if (formValue.weight && formValue.weight !== oldWeight && this.currentUser.id) {
              const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
              this.apiService.addWeightEntry(this.currentUser.id, formValue.weight, today)
                .subscribe({
                  next: () => console.log('Weight entry recorded'),
                  error: (err) => console.error('Failed to record weight entry:', err)
                });
            }
            setTimeout(() => {
              this.isSaving = false;
              this.cdr.detectChanges();
            }, 0);
            this.showSuccess('Profile updated successfully!');
            // Generate new plans if goal changed
            if (formValue.goal !== this.currentUser.goal && this.currentUser.id) {
              this.generateNewPlans(this.currentUser.id);
            }
          },
          error: (error) => {
            console.error('Error updating profile:', error);
            setTimeout(() => {
              this.isSaving = false;
              this.cdr.detectChanges();
            }, 0);
            const errorMsg = error?.message || 'Failed to update profile';
            if (errorMsg.includes('Cannot connect to server')) {
              this.showError('Cannot connect to backend server. Please ensure the backend is running on port 3000.');
            } else if (errorMsg.includes('Access denied')) {
              this.showError('Database connection error. Please check your database credentials in the .env file.');
            } else {
              this.showError('Failed to update profile. Please check your database connection and try again.');
            }
          }
        });
      } else {
        // Create new profile
        this.apiService.saveProfile(formValue).subscribe({
          next: (response) => {
            setTimeout(() => {
              this.isSaving = false;
              this.cdr.detectChanges();
            }, 0);
            this.showSuccess('Profile saved successfully!');
            // Load the newly created profile
            setTimeout(() => {
              this.loadProfile();
              // Generate plans for the new user
              if (response.userId) {
                this.generateNewPlans(response.userId);
              }
            }, 500);
          },
          error: (error) => {
            console.error('Error saving profile:', error);
            setTimeout(() => {
              this.isSaving = false;
              this.cdr.detectChanges();
            }, 0);
            const errorMsg = error?.message || 'Failed to save profile';
            if (errorMsg.includes('Cannot connect to server')) {
              this.showError('Cannot connect to backend server. Please ensure the backend is running on port 3000.');
            } else if (errorMsg.includes('Access denied')) {
              this.showError('Database connection error. Please check your database credentials in the .env file.');
            } else {
              this.showError('Failed to save profile. Please check your database connection and try again.');
            }
          }
        });
      }
    } else {
      this.profileForm.markAllAsTouched();
      this.showError('Please fill in all required fields correctly.');
    }
  }

  generateNewPlans(userId: number) {
    this.apiService.generateWeeklyPlan(userId).subscribe({
      next: () => {
        this.showSuccess('Weekly workout and meal plans generated!');
      },
      error: (error) => {
        console.error('Error generating plans:', error);
        this.showError('Profile saved, but failed to generate plans. You can generate them from the Workouts page.');
      }
    });
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

  toggleEditMode() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing && this.currentUser) {
      // Reset form to current user values
      this.profileForm.patchValue({
        name: this.currentUser.name,
        age: this.currentUser.age,
        gender: this.currentUser.gender || '',
        height: this.currentUser.height,
        weight: this.currentUser.weight,
        goal: this.currentUser.goal
      });
    }
    this.updateFormControlsState();
  }

  selectGoal(goal: string) {
    if (this.isEditing || !this.currentUser) {
      this.profileForm.patchValue({ goal });
      if (this.currentUser) {
        this.onSubmit();
      }
    }
  }

  calculateBMI(): string {
    if (!this.currentUser || !this.currentUser.height || !this.currentUser.weight) {
      return '--';
    }
    const heightInMeters = this.currentUser.height / 100;
    const bmi = this.currentUser.weight / (heightInMeters * heightInMeters);
    return bmi.toFixed(1);
  }

  calculateDailyCalories(): number {
    if (!this.currentUser || !this.currentUser.height || !this.currentUser.weight || !this.currentUser.age) {
      return 2000;
    }
    // Simplified BMR calculation (Mifflin-St Jeor Equation)
    const bmr = 10 * this.currentUser.weight + 6.25 * this.currentUser.height - 5 * this.currentUser.age;
    const genderMultiplier = this.currentUser.gender === 'female' ? -161 : 5;
    const baseCalories = bmr + genderMultiplier;
    
    // Activity multiplier (sedentary = 1.2)
    const activityMultiplier = 1.2;
    let targetCalories = baseCalories * activityMultiplier;
    
    // Adjust based on goal
    if (this.currentUser.goal === 'weight_loss') {
      targetCalories -= 500; // 500 calorie deficit
    } else if (this.currentUser.goal === 'muscle_gain') {
      targetCalories += 300; // 300 calorie surplus
    }
    
    return Math.round(targetCalories);
  }

  calculateProteinTarget(): number {
    if (!this.currentUser || !this.currentUser.weight) {
      return 0;
    }
    // Protein target: 1.6-2.2g per kg body weight (using 2.0g as target)
    return Math.round(this.currentUser.weight * 2.0);
  }

  getInitials(): string {
    if (!this.currentUser || !this.currentUser.name) {
      return 'U';
    }
    const names = this.currentUser.name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return this.currentUser.name.substring(0, 2).toUpperCase();
  }

  getMemberSince(): string {
    if (!this.currentUser || !this.currentUser.created_at) {
      return 'Recently';
    }
    const date = new Date(this.currentUser.created_at);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }
}
