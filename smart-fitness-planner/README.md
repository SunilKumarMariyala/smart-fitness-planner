# Smart Fitness Routine & Meal Planner

A full-stack web application that provides personalized fitness routines and meal plans based on user goals using Angular 18, Node.js (TypeScript), and MySQL.

## Features

- **User Profile Management**: Create and update your profile with personal information and fitness goals
- **Personalized Workout Plans**: Auto-generated weekly workout routines based on your fitness goals (weight loss, muscle gain, maintenance)
- **Meal Planning**: Customized meal plans with calorie tracking based on your goals
- **Progress Tracking**: Visual progress tracking for workouts and nutrition
- **Exercise & Meal Completion**: Mark exercises and meals as completed to track your progress
- **Calorie Tracking**: Monitor daily calorie intake vs. target calories

## Tech Stack

### Frontend
- Angular 18
- Angular Material
- TypeScript
- RxJS

### Backend
- Node.js
- Express.js
- TypeScript
- MySQL

## Prerequisites

- Node.js (v18 or higher)
- npm (v10 or higher)
- MySQL (v8.0 or higher)
- MySQL Workbench (optional, for database management)

## Setup Instructions

### 1. Database Setup

1. Open MySQL Workbench or MySQL command line
2. Create a database (if not exists):
   ```sql
   CREATE DATABASE smart_fitness;
   ```
3. Create the `users` table (if you haven't already):
   ```sql
   USE smart_fitness;
   
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
   ```
4. Run the SQL script to create the `workout_meal_plans` table:
   ```bash
   # Execute the SQL file in MySQL Workbench or command line
   mysql -u root -p smart_fitness < backend/database/create_workout_meal_plans_table.sql
   ```

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `backend` directory:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=smart_fitness
   PORT=3000
   NODE_ENV=development
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```

   The server will run on `http://localhost:3000`

### 3. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend/fitness-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

   The application will open at `http://localhost:4200`

## Project Structure

```
smart-fitness-planner/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.ts              # Database configuration
│   │   ├── controllers/
│   │   │   ├── user.controller.ts
│   │   │   └── workout-meal-plan.controller.ts
│   │   ├── models/
│   │   │   ├── user.model.ts
│   │   │   └── workout-meal-plan.model.ts
│   │   ├── routes/
│   │   │   ├── user.routes.ts
│   │   │   └── workout-meal-plan.routes.ts
│   │   ├── services/
│   │   │   ├── workout-generator.service.ts
│   │   │   └── meal-generator.service.ts
│   │   └── app.ts                 # Express app setup
│   ├── database/
│   │   └── create_workout_meal_plans_table.sql
│   └── package.json
│
└── frontend/
    └── fitness-frontend/
        └── src/
            └── app/
                ├── core/
                │   └── layout/    # Main layout component
                ├── features/
                │   ├── profile/   # Profile management
                │   ├── workouts/  # Workout routine display
                │   ├── meals/     # Meal planner
                │   └── progress/  # Progress tracking
                ├── shared/
                │   ├── guards/    # Route guards
                │   └── services/  # API service
                └── app.routes.ts  # Routing configuration
```

## API Endpoints

### User Profile
- `POST /api/profile` - Create user profile
- `GET /api/profile?userId={id}` - Get user profile (or latest if no userId)
- `PUT /api/users/:id` - Update user profile

### Workout & Meal Plans
- `POST /api/users/:userId/plans/generate` - Generate weekly workout and meal plans
- `GET /api/users/:userId/plans` - Get all weekly plans
- `GET /api/users/:userId/plans/:day` - Get plan for specific day
- `PATCH /api/users/:userId/plans/:planId/exercises` - Update exercise completion
- `PATCH /api/users/:userId/plans/:planId/meals` - Update meal completion

## Usage

1. **Create Profile**: Navigate to the Profile page and fill in your personal information and fitness goal
2. **Generate Plans**: After creating your profile, plans will be auto-generated. You can also regenerate them from the Workouts or Meals pages
3. **Track Progress**: 
   - Mark exercises as completed in the Workouts page
   - Mark meals as consumed in the Meals page
   - View your progress in the Progress page

## Development

### Backend Development
```bash
cd backend
npm run dev  # Uses nodemon for auto-reload
```

### Frontend Development
```bash
cd frontend/fitness-frontend
npm start  # Angular dev server with hot reload
```

## Validation

The application includes comprehensive validation:
- Profile fields (name, age, height, weight) must not be empty
- Age must be between 10 and 100
- Height and weight must be positive numbers
- Goal must be one of: weight_loss, muscle_gain, maintenance
- All API endpoints include proper error handling

## Error Handling

- Frontend: User-friendly error messages via Material Snackbar
- Backend: Proper HTTP status codes and error messages
- Server-side error logging for debugging

## Route Guards

The application uses Angular route guards to ensure users have created a profile before accessing:
- Workouts page
- Meals page
- Progress page

Users without a profile are automatically redirected to the Profile page.

## License

This project is created for educational purposes (Capstone Project).

## Author

Developed as a full-stack capstone project.
