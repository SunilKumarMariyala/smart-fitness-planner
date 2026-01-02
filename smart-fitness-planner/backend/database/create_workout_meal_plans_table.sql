-- Create workout_meal_plans table for Smart Fitness Planner
-- Note: This assumes the 'users' table already exists

USE smart_fitness;

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

