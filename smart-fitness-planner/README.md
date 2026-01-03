# Smart Fitness Routine & Meal Planner

A comprehensive full-stack web application that provides personalized fitness routines and meal plans based on user goals. Built with modern technologies including Angular 21, Node.js (TypeScript), and MySQL.

## 🌟 Features

### Core Functionality
- **👤 User Profile Management**: Create and update your profile with personal information and fitness goals
- **💪 Personalized Workout Plans**: Auto-generated weekly workout routines based on your fitness goals (weight loss, muscle gain, maintenance)
- **🥗 Meal Planning**: Customized meal plans with calorie tracking based on your goals
- **📊 Progress Tracking**: Visual progress tracking for workouts and nutrition
- **✅ Exercise & Meal Completion**: Mark exercises and meals as completed to track your progress
- **🔥 Calorie Tracking**: Monitor daily calorie intake vs. target calories
- **⚖️ Weight Tracking**: Track weight changes over time with historical data

### Advanced Features
- **🎯 Goal-Based Planning**: Tailored recommendations for weight loss, muscle gain, or maintenance
- **📱 Responsive Design**: Mobile-friendly interface using Angular Material
- **🔐 Route Protection**: Profile-based access control for premium features
- **⚡ Real-time Updates**: Instant feedback on progress and achievements
- **📈 Visual Analytics**: Charts and graphs for progress visualization

## 🛠️ Tech Stack

### Frontend Technologies
- **Angular 21** - Modern frontend framework with standalone components
- **Angular Material 21** - UI component library for professional design
- **TypeScript 5.9** - Type-safe JavaScript for better development experience
- **RxJS 7.8** - Reactive programming for handling asynchronous operations
- **Angular Router 21** - Client-side routing with route guards

### Backend Technologies
- **Node.js** - JavaScript runtime for server-side development
- **Express.js 5.2** - Fast, minimalist web framework for Node.js
- **TypeScript 5.9** - Type-safe backend development
- **MySQL 2** - Relational database for data persistence
- **CORS 2.8** - Cross-origin resource sharing configuration
- **dotenv 17.2** - Environment variable management

### Development Tools
- **Nodemon 3.1** - Auto-reload for backend development
- **Angular CLI 21** - Command-line tools for Angular development
- **ts-node 10.9** - TypeScript execution for Node.js
- **Vitest 4.0** - Testing framework
- **Git** - Version control system

## 📋 Prerequisites

Ensure you have the following installed on your system:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (v10 or higher) - Comes with Node.js
- **MySQL** (v8.0 or higher) - [Download here](https://www.mysql.com/)
- **MySQL Workbench** (optional) - For database management
- **Git** - For version control

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/SunilKumarMariyala/smart-fitness-planner.git
cd smart-fitness-planner-main/smart-fitness-planner
```

### 2. Database Setup

1. **Start MySQL Service**:
   - Windows: Open Services and start MySQL80
   - Mac/Linux: `brew services start mysql` or `sudo systemctl start mysql`

2. **Create Database**:
   ```sql
   CREATE DATABASE smart_fitness;
   ```

3. **Create Tables**:
   ```bash
   # Execute SQL files in order
   mysql -u root -p smart_fitness < backend/database/schema.sql
   mysql -u root -p smart_fitness < backend/database/add_gender_column.sql
   mysql -u root -p smart_fitness < backend/database/create_workout_meal_plans_table.sql
   mysql -u root -p smart_fitness < backend/database/create_weight_tracking_table.sql
   ```

### 3. Backend Setup

1. **Navigate to Backend**:
   ```bash
   cd backend
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Environment Configuration**:
   Create a `.env` file in the `backend` directory:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=smart_fitness
   PORT=3000
   NODE_ENV=development
   ```

4. **Start Backend Server**:
   ```bash
   npm run dev
   ```
   
   🟢 **Server running at**: `http://localhost:3000`

### 4. Frontend Setup

1. **Navigate to Frontend**:
   ```bash
   cd frontend/fitness-frontend
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start Development Server**:
   ```bash
   npm start
   ```
   
   🟢 **Application running at**: `http://localhost:4200`

## 📁 Project Structure

```
smart-fitness-planner/
├── 📄 README.md                    # Project documentation
├── 📄 .gitignore                   # Git ignore patterns
├── 📁 .vscode/                     # VS Code settings
├── 📁 backend/                     # Node.js/Express backend
│   ├── 📄 .env                     # Environment variables
│   ├── 📄 ENV_SETUP.md             # Environment setup guide
│   ├── � package.json             # Backend dependencies
│   ├── 📄 package-lock.json        # Locked dependencies
│   ├── 📄 tsconfig.json            # TypeScript configuration
│   ├── �📁 src/
│   │   ├── 📄 app.ts               # Express app setup
│   │   ├── 📁 config/
│   │   │   └── 📄 db.ts           # Database configuration
│   │   ├── 📁 controllers/
│   │   │   ├── 📄 user.controller.ts
│   │   │   ├── 📄 workout-meal-plan.controller.ts
│   │   │   └── 📄 weight-tracking.controller.ts
│   │   ├── 📁 models/
│   │   │   ├── 📄 user.model.ts
│   │   │   ├── 📄 workout-meal-plan.model.ts
│   │   │   └── 📄 weight-tracking.model.ts
│   │   ├── 📁 routes/
│   │   │   ├── 📄 user.routes.ts
│   │   │   ├── 📄 workout-meal-plan.routes.ts
│   │   │   └── 📄 weight-tracking.routes.ts
│   │   └── 📁 services/
│   │       ├── 📄 workout-generator.service.ts
│   │       └── 📄 meal-generator.service.ts
│   └── � database/               # SQL scripts
│       ├── � schema.sql                           # Main database schema
│       ├── 📄 add_gender_column.sql                # Gender column addition
│       ├── 📄 create_workout_meal_plans_table.sql  # Workout/meal plans table
│       └── 📄 create_weight_tracking_table.sql     # Weight tracking table
│
└── 📁 frontend/                   # Angular frontend
    └── 📁 fitness-frontend/
        ├── 📄 angular.json          # Angular configuration
        ├── 📄 package.json          # Frontend dependencies
        ├── 📄 package-lock.json     # Locked dependencies
        ├── 📄 tsconfig.json         # TypeScript configuration
        ├── 📁 src/
        │   ├── 📄 index.html        # Main HTML file
        │   ├── 📄 main.ts           # Application entry point
        │   ├── 📄 material-theme.scss # Material Design theme
        │   ├── 📄 styles.css        # Global styles
        │   └── 📁 app/
        │       ├── 📄 app.config.ts # Application configuration
        │       ├── 📄 app.css       # App styles
        │       ├── 📄 app.html      # App template
        │       ├── � app.routes.ts # Routing configuration
        │       ├── � app.ts        # Root component
        │       ├── 📁 core/
        │       │   └── 📁 layout/    # Main layout component
        │       ├── 📁 features/
        │       │   ├── 📁 profile/   # Profile management
        │       │   ├── 📁 workouts/  # Workout routine display
        │       │   ├── 📁 meals/     # Meal planner
        │       │   ├── 📁 progress/  # Progress tracking
        │       │   └── 📁 dashboard/ # Main dashboard
        │       └── 📁 shared/
        │           ├── 📁 guards/    # Route guards
        │           └── 📁 services/  # API service
```

## 🔌 API Documentation

### User Profile Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/profile` | Create new user profile |
| `GET` | `/api/profile?userId={id}` | Get user profile (or latest if no userId) |
| `PUT` | `/api/users/:id` | Update existing user profile |

### Workout & Meal Plans
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/users/:userId/plans/generate` | Generate weekly workout and meal plans |
| `GET` | `/api/users/:userId/plans` | Get all weekly plans for user |
| `GET` | `/api/users/:userId/plans/:day` | Get plan for specific day |
| `PATCH` | `/api/users/:userId/plans/:planId/exercises` | Update exercise completion status |
| `PATCH` | `/api/users/:userId/plans/:planId/meals` | Update meal completion status |

### Weight Tracking
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/weight-tracking` | Add new weight entry |
| `GET` | `/api/weight-tracking/:userId` | Get weight history for user |

## 🎯 How to Use

### 1. **Create Your Profile**
- Navigate to the **Profile** page
- Fill in your personal information:
  - Name, Age, Gender
  - Height (cm) and Weight (kg)
  - Select your fitness goal:
    - 🏃‍♂️ Weight Loss
    - 💪 Muscle Gain
    - ⚖️ Maintenance

### 2. **Generate Your Plans**
- Plans are **auto-generated** after profile creation
- Regenerate plans anytime from:
  - Workouts page 🏋️‍♂️
  - Meals page 🍽️

### 3. **Track Your Progress**
- **Workouts**: Mark exercises as completed ✅
- **Meals**: Mark meals as consumed 🍴
- **Progress**: View your achievements in the Progress page 📊
- **Weight**: Track weight changes over time ⚖️

## 🛠️ Development

### Backend Development
```bash
cd backend
npm run dev  # Uses nodemon for auto-reload
```
**Server**: `http://localhost:3000`

### Frontend Development
```bash
cd frontend/fitness-frontend
npm start  # Angular dev server with hot reload
```
**Application**: `http://localhost:4200`

### Build for Production
```bash
# Frontend
cd frontend/fitness-frontend
npm run build

# Backend (no build needed for Node.js)
```

## ✅ Validation & Error Handling

### Input Validation
- **Profile Fields**: Name, age, height, weight are required
- **Age Range**: Must be between 10-100 years
- **Physical Measurements**: Height and weight must be positive numbers
- **Goals**: Must be one of: weight_loss, muscle_gain, maintenance

### Error Handling
- **Frontend**: User-friendly error messages via Material Snackbar
- **Backend**: Proper HTTP status codes and detailed error messages
- **Logging**: Server-side error logging for debugging

## 🔐 Security Features

### Route Guards
The application uses Angular route guards to protect premium features:
- **Workouts page** - Requires user profile
- **Meals page** - Requires user profile  
- **Progress page** - Requires user profile

**Behavior**: Users without profiles are automatically redirected to the Profile page.

### Data Protection
- Environment variables for sensitive data
- CORS configuration for API security
- Input sanitization and validation

## 🐛 Troubleshooting

### Common Issues

**Database Connection Error**
```bash
# Check MySQL service status
# Windows: Services > MySQL80
# Mac/Linux: brew services list | grep mysql
```

**Port Already in Use**
```bash
# Kill processes on ports 3000 and 4200
netstat -ano | findstr :3000
netstat -ano | findstr :4200
# Kill the process using the PID
```

**Module Not Found**
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## 📊 Database Schema

### Users Table
- `id` (Primary Key)
- `name`, `age`, `gender`
- `height`, `weight`
- `goal` (weight_loss/muscle_gain/maintenance)
- `created_at`, `updated_at`

### Workout & Meal Plans Table
- `id` (Primary Key)
- `user_id` (Foreign Key)
- `day_of_week`
- `exercises` (JSON)
- `meals` (JSON)
- `completion_status`

### Weight Tracking Table
- `id` (Primary Key)
- `user_id` (Foreign Key)
- `weight`
- `date`
- `notes`

## 🚀 Deployment

### Environment Variables
```env
# Production
NODE_ENV=production
DB_HOST=your-production-db-host
DB_USER=your-db-user
DB_PASSWORD=your-secure-password
DB_NAME=smart_fitness
PORT=3000
```

### Build Commands
```bash
# Frontend production build
cd frontend/fitness-frontend
npm run build --prod

# Backend (no build needed, just start)
cd backend
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is created for educational purposes (Capstone Project).

## 👨‍💻 Author

**Smart Fitness Planner** - Developed as a full-stack capstone project demonstrating modern web development practices.

---

**⭐ Give this project a star if you find it helpful!**
