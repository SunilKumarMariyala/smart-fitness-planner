-- Add gender column to users table if it doesn't exist
-- Run this in MySQL Workbench or command line

USE smart_fitness;

-- Check if column exists first, then add it
-- Note: MySQL doesn't support "IF NOT EXISTS" for ALTER TABLE ADD COLUMN
-- So we'll just try to add it - if it exists, you'll get an error which is fine

ALTER TABLE users 
ADD COLUMN gender VARCHAR(20) NULL AFTER age;

-- If you get an error saying the column already exists, that's okay - it means it's already there!
