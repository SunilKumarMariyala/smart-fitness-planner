import { db } from '../config/db';

// Helper function to safely parse JSON (handles both strings and already-parsed objects)
function safeJsonParse(value: any, defaultValue: any = null): any {
  if (value === null || value === undefined) {
    return defaultValue;
  }
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch (e) {
      console.error('JSON parse error:', e, 'Value:', value);
      return defaultValue;
    }
  }
  // Already an object
  return value;
}

export interface Exercise {
  name: string;
  sets: number;
  reps: number;
  instructions: string;
  duration?: number; // in minutes for cardio
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
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  exercises: Exercise[];
  meals: DailyMeals;
  completed_status?: {
    exercises: number[]; // indices of completed exercises
    meals: string[]; // meal types completed: 'breakfast', 'lunch', 'dinner', 'snacks'
  };
  created_at?: string;
  updated_at?: string;
}

export const createWorkoutMealPlan = async (plan: WorkoutMealPlan): Promise<number> => {
  const { user_id, day, exercises, meals, completed_status } = plan;

  const [result]: any = await db.query(
    `INSERT INTO workout_meal_plans (user_id, day, exercises, meals, completed_status)
     VALUES (?, ?, ?, ?, ?)`,
    [
      user_id,
      day,
      JSON.stringify(exercises),
      JSON.stringify(meals),
      JSON.stringify(completed_status || { exercises: [], meals: [] })
    ]
  );

  return result.insertId;
};

export const getWorkoutMealPlanByUserAndDay = async (
  user_id: number,
  day: string
): Promise<WorkoutMealPlan | null> => {
  const [rows]: any = await db.query(
    `SELECT * FROM workout_meal_plans WHERE user_id = ? AND day = ?`,
    [user_id, day]
  );

  if (rows[0]) {
    return {
      ...rows[0],
      exercises: safeJsonParse(rows[0].exercises, []),
      meals: safeJsonParse(rows[0].meals, null),
      completed_status: safeJsonParse(rows[0].completed_status, { exercises: [], meals: [] })
    };
  }

  return null;
};

export const getWorkoutMealPlansByUser = async (user_id: number): Promise<WorkoutMealPlan[]> => {
  const [rows]: any = await db.query(
    `SELECT * FROM workout_meal_plans WHERE user_id = ? ORDER BY 
     FIELD(day, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')`,
    [user_id]
  );

  return rows.map((row: any) => ({
    ...row,
    exercises: safeJsonParse(row.exercises, []),
    meals: safeJsonParse(row.meals, null),
    completed_status: safeJsonParse(row.completed_status, { exercises: [], meals: [] })
  }));
};

export const updateWorkoutMealPlan = async (
  id: number,
  updates: Partial<WorkoutMealPlan>
): Promise<boolean> => {
  const updateFields: string[] = [];
  const values: any[] = [];

  if (updates.exercises !== undefined) {
    updateFields.push('exercises = ?');
    values.push(JSON.stringify(updates.exercises));
  }
  if (updates.meals !== undefined) {
    updateFields.push('meals = ?');
    values.push(JSON.stringify(updates.meals));
  }
  if (updates.completed_status !== undefined) {
    updateFields.push('completed_status = ?');
    values.push(JSON.stringify(updates.completed_status));
  }

  if (updateFields.length === 0) {
    return false;
  }

  values.push(id);

  const [result]: any = await db.query(
    `UPDATE workout_meal_plans SET ${updateFields.join(', ')} WHERE id = ?`,
    values
  );

  return result.affectedRows > 0;
};

export const updateCompletedStatus = async (
  id: number,
  completed_status: { exercises: number[]; meals: string[] }
): Promise<boolean> => {
  const [result]: any = await db.query(
    `UPDATE workout_meal_plans SET completed_status = ? WHERE id = ?`,
    [JSON.stringify(completed_status), id]
  );

  return result.affectedRows > 0;
};

