import { Request, Response } from 'express';
import { getUserById } from '../models/user.model';
import {
  createWorkoutMealPlan,
  getWorkoutMealPlanByUserAndDay,
  getWorkoutMealPlansByUser,
  updateCompletedStatus,
  updateWorkoutMealPlan
} from '../models/workout-meal-plan.model';
import { WorkoutGeneratorService } from '../services/workout-generator.service';
import { MealGeneratorService } from '../services/meal-generator.service';

const workoutGenerator = new WorkoutGeneratorService();
const mealGenerator = new MealGeneratorService();

export const generateWeeklyPlan = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate workouts and meals
    const weeklyWorkouts = workoutGenerator.generateWeeklyWorkouts(user);
    const weeklyMeals = mealGenerator.generateWeeklyMeals(user);

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const createdPlans = [];

    // Create plans for each day
    for (const day of days) {
      // Check if plan already exists
      const existing = await getWorkoutMealPlanByUserAndDay(userId, day);
      
      if (existing) {
        // Update existing plan
        await updateWorkoutMealPlan(existing.id!, {
          exercises: weeklyWorkouts[day],
          meals: weeklyMeals[day]
        });
        createdPlans.push({ day, id: existing.id, updated: true });
      } else {
        // Create new plan
        const planId = await createWorkoutMealPlan({
          user_id: userId,
          day: day as any,
          exercises: weeklyWorkouts[day],
          meals: weeklyMeals[day],
          completed_status: { exercises: [], meals: [] }
        });
        createdPlans.push({ day, id: planId, updated: false });
      }
    }

    res.status(201).json({
      message: 'Weekly plan generated successfully',
      plans: createdPlans
    });
  } catch (error: any) {
    console.error('GENERATE WEEKLY PLAN ERROR:', error);
    res.status(500).json({
      message: 'Failed to generate weekly plan',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getWeeklyPlan = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const plans = await getWorkoutMealPlansByUser(userId);

    if (plans.length === 0) {
      return res.status(404).json({ 
        message: 'No workout/meal plans found. Please generate a plan first.' 
      });
    }

    res.json(plans);
  } catch (error: any) {
    console.error('GET WEEKLY PLAN ERROR:', error);
    res.status(500).json({
      message: 'Failed to fetch weekly plan',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getDayPlan = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const day = req.params.day;

    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    if (!validDays.includes(day)) {
      return res.status(400).json({ 
        message: `Day must be one of: ${validDays.join(', ')}` 
      });
    }

    const plan = await getWorkoutMealPlanByUserAndDay(userId, day);

    if (!plan) {
      return res.status(404).json({ 
        message: `No plan found for ${day}. Please generate a weekly plan first.` 
      });
    }

    res.json(plan);
  } catch (error: any) {
    console.error('GET DAY PLAN ERROR:', error);
    res.status(500).json({
      message: 'Failed to fetch day plan',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const updateExerciseCompletion = async (req: Request, res: Response) => {
  try {
    const planId = parseInt(req.params.planId);
    const { exerciseIndex, completed } = req.body;

    if (isNaN(planId)) {
      return res.status(400).json({ message: 'Invalid plan ID' });
    }

    if (exerciseIndex === undefined || typeof completed !== 'boolean') {
      return res.status(400).json({ 
        message: 'exerciseIndex and completed (boolean) are required' 
      });
    }

    // Get current plan
    const plans = await getWorkoutMealPlansByUser(parseInt(req.params.userId));
    const plan = plans.find(p => p.id === planId);

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    const completedExercises = [...(plan.completed_status?.exercises || [])];
    
    if (completed) {
      if (!completedExercises.includes(exerciseIndex)) {
        completedExercises.push(exerciseIndex);
      }
    } else {
      const index = completedExercises.indexOf(exerciseIndex);
      if (index > -1) {
        completedExercises.splice(index, 1);
      }
    }

    await updateCompletedStatus(planId, {
      exercises: completedExercises,
      meals: plan.completed_status?.meals || []
    });

    res.json({ message: 'Exercise completion updated', completedExercises });
  } catch (error: any) {
    console.error('UPDATE EXERCISE COMPLETION ERROR:', error);
    res.status(500).json({
      message: 'Failed to update exercise completion',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const updateMealCompletion = async (req: Request, res: Response) => {
  try {
    const planId = parseInt(req.params.planId);
    const { mealType, completed } = req.body;

    if (isNaN(planId)) {
      return res.status(400).json({ message: 'Invalid plan ID' });
    }

    const validMealTypes = ['breakfast', 'lunch', 'dinner', 'snacks'];
    if (!mealType || !validMealTypes.includes(mealType)) {
      return res.status(400).json({ 
        message: `mealType must be one of: ${validMealTypes.join(', ')}` 
      });
    }

    if (typeof completed !== 'boolean') {
      return res.status(400).json({ message: 'completed must be a boolean' });
    }

    // Get current plan
    const plans = await getWorkoutMealPlansByUser(parseInt(req.params.userId));
    const plan = plans.find(p => p.id === planId);

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    const completedMeals = [...(plan.completed_status?.meals || [])];
    
    if (completed) {
      if (!completedMeals.includes(mealType)) {
        completedMeals.push(mealType);
      }
    } else {
      const index = completedMeals.indexOf(mealType);
      if (index > -1) {
        completedMeals.splice(index, 1);
      }
    }

    await updateCompletedStatus(planId, {
      exercises: plan.completed_status?.exercises || [],
      meals: completedMeals
    });

    res.json({ message: 'Meal completion updated', completedMeals });
  } catch (error: any) {
    console.error('UPDATE MEAL COMPLETION ERROR:', error);
    res.status(500).json({
      message: 'Failed to update meal completion',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

