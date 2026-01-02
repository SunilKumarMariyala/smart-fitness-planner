-- Smart Fitness Planner Database Schema

CREATE DATABASE IF NOT EXISTS smart_fitness;
USE smart_fitness;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  age INT NOT NULL,
  gender VARCHAR(20),
  height DECIMAL(5, 2) NOT NULL COMMENT 'Height in cm',
  weight DECIMAL(5, 2) NOT NULL COMMENT 'Weight in kg',
  goal ENUM('weight_loss', 'muscle_gain', 'maintenance') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_goal (goal)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- WorkoutMealPlans Table
CREATE TABLE IF NOT EXISTS workout_meal_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  day ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
  exercises JSON NOT NULL COMMENT 'Array of exercise objects with name, sets, reps, instructions',
  meals JSON NOT NULL COMMENT 'Object with breakfast, lunch, dinner, snacks and calories',
  completed_status JSON COMMENT 'Tracks completed exercises and meals',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_day (user_id, day),
  INDEX idx_user_id (user_id),
  INDEX idx_day (day)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

