import { User } from '../models/user.model';
import { Exercise } from '../models/workout-meal-plan.model';

export class WorkoutGeneratorService {
  private weightLossExercises: Exercise[] = [
    { name: 'Cardio: Running', sets: 1, reps: 1, instructions: 'Run at moderate pace for 30 minutes', duration: 30 },
    { name: 'Jumping Jacks', sets: 3, reps: 20, instructions: 'Perform jumping jacks with full arm extension' },
    { name: 'Burpees', sets: 3, reps: 10, instructions: 'Full burpee with push-up and jump' },
    { name: 'Mountain Climbers', sets: 3, reps: 20, instructions: 'Alternate legs quickly in plank position' },
    { name: 'High Knees', sets: 3, reps: 30, instructions: 'Run in place bringing knees to chest' },
    { name: 'Plank', sets: 3, reps: 1, instructions: 'Hold plank position for 60 seconds', duration: 60 },
    { name: 'Squats', sets: 3, reps: 15, instructions: 'Bodyweight squats with proper form' },
    { name: 'Lunges', sets: 3, reps: 12, instructions: 'Alternating forward lunges' },
  ];

  private muscleGainExercises: Exercise[] = [
    { name: 'Push-ups', sets: 4, reps: 12, instructions: 'Standard push-ups, full range of motion' },
    { name: 'Pull-ups', sets: 4, reps: 8, instructions: 'If unavailable, use resistance bands or lat pulldowns' },
    { name: 'Squats', sets: 4, reps: 12, instructions: 'Bodyweight or weighted squats' },
    { name: 'Deadlifts', sets: 3, reps: 10, instructions: 'Use proper form, start with bodyweight or light weights' },
    { name: 'Bench Press', sets: 4, reps: 10, instructions: 'Use dumbbells or barbell if available' },
    { name: 'Shoulder Press', sets: 3, reps: 12, instructions: 'Overhead press with dumbbells or resistance bands' },
    { name: 'Bicep Curls', sets: 3, reps: 12, instructions: 'Dumbbell or resistance band curls' },
    { name: 'Tricep Dips', sets: 3, reps: 12, instructions: 'Use chair or bench for support' },
    { name: 'Plank', sets: 3, reps: 1, instructions: 'Hold for 45 seconds', duration: 45 },
    { name: 'Leg Raises', sets: 3, reps: 15, instructions: 'Lying leg raises for core strength' },
  ];

  private maintenanceExercises: Exercise[] = [
    { name: 'Cardio: Brisk Walk', sets: 1, reps: 1, instructions: 'Walk at brisk pace for 30 minutes', duration: 30 },
    { name: 'Push-ups', sets: 3, reps: 10, instructions: 'Standard push-ups' },
    { name: 'Squats', sets: 3, reps: 12, instructions: 'Bodyweight squats' },
    { name: 'Plank', sets: 3, reps: 1, instructions: 'Hold for 45 seconds', duration: 45 },
    { name: 'Yoga Flow', sets: 1, reps: 1, instructions: '20-minute yoga session focusing on flexibility', duration: 20 },
    { name: 'Lunges', sets: 3, reps: 10, instructions: 'Alternating lunges' },
    { name: 'Stretching', sets: 1, reps: 1, instructions: 'Full body stretching routine for 15 minutes', duration: 15 },
  ];

  generateWeeklyWorkouts(user: User): { [key: string]: Exercise[] } {
    let baseExercises: Exercise[] = [];

    switch (user.goal) {
      case 'weight_loss':
        baseExercises = this.weightLossExercises;
        break;
      case 'muscle_gain':
        baseExercises = this.muscleGainExercises;
        break;
      case 'maintenance':
        baseExercises = this.maintenanceExercises;
        break;
    }

    const weeklyWorkouts: { [key: string]: Exercise[] } = {
      Monday: this.selectExercises(baseExercises, user.goal === 'weight_loss' ? 5 : 6),
      Tuesday: this.selectExercises(baseExercises, user.goal === 'weight_loss' ? 5 : 6),
      Wednesday: this.selectExercises(baseExercises, user.goal === 'weight_loss' ? 4 : 5),
      Thursday: this.selectExercises(baseExercises, user.goal === 'weight_loss' ? 5 : 6),
      Friday: this.selectExercises(baseExercises, user.goal === 'weight_loss' ? 5 : 6),
      Saturday: this.selectExercises(baseExercises, user.goal === 'weight_loss' ? 4 : 5),
      Sunday: this.selectExercises(baseExercises, 3), // Rest day with light activity
    };

    return weeklyWorkouts;
  }

  private selectExercises(exercises: Exercise[], count: number): Exercise[] {
    const shuffled = [...exercises].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, exercises.length));
  }
}

