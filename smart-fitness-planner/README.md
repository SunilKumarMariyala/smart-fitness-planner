# Smart Fitness Routine & Meal Planner

A full-stack web application that provides personalized fitness routines and meal plans based on user goals. Built with Angular 21, Node.js (TypeScript), and MySQL.

## Features

- **User Profile Management** - Create and update profile with fitness goals
- **Personalized Workout Plans** - Auto-generated weekly workout routines
- **Meal Planning** - Customized meal plans with calorie tracking
- **Progress Tracking** - Visual progress tracking for workouts and nutrition
- **Weight Tracking** - Historical weight data and progress visualization

## Tech Stack

### Frontend
- Angular 21
- Angular Material
- TypeScript
- RxJS

### Backend
- Node.js
- Express.js
- TypeScript
- MySQL

## Quick Start

### Prerequisites
- Node.js (v18+)
- MySQL (v8.0+)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/SunilKumarMariyala/smart-fitness-planner.git
cd smart-fitness-planner-main/smart-fitness-planner
```

2. **Database Setup**
```sql
CREATE DATABASE smart_fitness;
-- Run SQL files in backend/database/ folder in order
```

3. **Backend Setup**
```bash
cd backend
npm install
# Create .env file with database credentials
npm run dev
```

4. **Frontend Setup**
```bash
cd frontend/fitness-frontend
npm install
npm start
```

### Environment Variables
Create `.env` file in backend directory:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=smart_fitness
PORT=3000
```

## Project Structure

```
smart-fitness-planner/
├── backend/                 # Node.js/Express backend
│   ├── src/
│   │   ├── controllers/     # API controllers
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   └── services/        # Business logic
│   └── database/            # SQL scripts
└── frontend/
    └── fitness-frontend/    # Angular frontend
        └── src/app/
            ├── core/        # Layout components
            ├── features/     # Feature components
            └── shared/      # Shared services/guards
```

## API Endpoints

### User Profile
- `POST /api/profile` - Create user profile
- `GET /api/profile` - Get user profile
- `PUT /api/users/:id` - Update user profile

### Workout & Meal Plans
- `POST /api/users/:userId/plans/generate` - Generate weekly plans
- `GET /api/users/:userId/plans` - Get all plans
- `PATCH /api/users/:userId/plans/:planId/exercises` - Update exercise completion
- `PATCH /api/users/:userId/plans/:planId/meals` - Update meal completion

### Weight Tracking
- `POST /api/weight-tracking` - Add weight entry
- `GET /api/weight-tracking/:userId` - Get weight history

## Usage

1. **Create Profile** - Navigate to Profile page and enter your information
2. **Generate Plans** - Plans are auto-generated based on your goals
3. **Track Progress** - Mark exercises and meals as completed
4. **View Progress** - Check your progress in the Progress section

## License

This project is created for educational purposes (Capstone Project).
