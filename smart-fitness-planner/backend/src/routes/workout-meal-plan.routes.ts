import { Router } from 'express';
import {
  generateWeeklyPlan,
  getWeeklyPlan,
  getDayPlan,
  updateExerciseCompletion,
  updateMealCompletion
} from '../controllers/workout-meal-plan.controller';

const router = Router();

router.post('/users/:userId/plans/generate', generateWeeklyPlan);
router.get('/users/:userId/plans', getWeeklyPlan);
router.get('/users/:userId/plans/:day', getDayPlan);
router.patch('/users/:userId/plans/:planId/exercises', updateExerciseCompletion);
router.patch('/users/:userId/plans/:planId/meals', updateMealCompletion);

export default router;

