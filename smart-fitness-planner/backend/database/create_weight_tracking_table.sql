-- Create weight_tracking table for Smart Fitness Planner
-- This table stores historical weight data for users
--
-- IMPORTANT: Make sure the 'users' table exists before running this script!
-- If you haven't created the users table yet, run schema.sql first.
--
-- This script is safe to run multiple times (uses IF NOT EXISTS)

USE smart_fitness;

-- Weight Tracking Table
CREATE TABLE IF NOT EXISTS weight_tracking (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  weight DECIMAL(5, 2) NOT NULL COMMENT 'Weight in kg',
  recorded_date DATE NOT NULL COMMENT 'Date when weight was recorded',
  notes TEXT COMMENT 'Optional notes about the weight entry',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_recorded_date (recorded_date),
  UNIQUE KEY unique_user_date (user_id, recorded_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verify table was created successfully
SELECT 'Weight tracking table created successfully!' AS status;

