import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables FIRST before importing anything that uses them
dotenv.config();

import userRoutes from './routes/user.routes';
import workoutMealPlanRoutes from './routes/workout-meal-plan.routes';
import weightTrackingRoutes from './routes/weight-tracking.routes';

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api', userRoutes);
app.use('/api', workoutMealPlanRoutes);
app.use('/api', weightTrackingRoutes);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'OK', message: 'Smart Fitness Planner API is running' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
