import { User } from '../models/user.model';
import { DailyMeals, Meal } from '../models/workout-meal-plan.model';

export class MealGeneratorService {
  calculateDailyCalories(user: User): number {
    // BMR calculation using Mifflin-St Jeor Equation
    let bmr: number;
    const age = user.age;
    const weight = user.weight; // kg
    const height = user.height; // cm

    if (user.gender?.toLowerCase() === 'female') {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    }

    // Activity multiplier (sedentary to moderate activity)
    const activityMultiplier = 1.5;
    const maintenanceCalories = bmr * activityMultiplier;

    // Adjust based on goal
    switch (user.goal) {
      case 'weight_loss':
        return Math.round(maintenanceCalories - 500); // 500 calorie deficit
      case 'muscle_gain':
        return Math.round(maintenanceCalories + 300); // 300 calorie surplus
      case 'maintenance':
        return Math.round(maintenanceCalories);
      default:
        return Math.round(maintenanceCalories);
    }
  }

  generateWeeklyMeals(user: User): { [key: string]: DailyMeals } {
    const dailyCalories = this.calculateDailyCalories(user);
    const weeklyMeals: { [key: string]: DailyMeals } = {};

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    days.forEach((day) => {
      weeklyMeals[day] = this.generateDailyMealPlan(user, dailyCalories);
    });

    return weeklyMeals;
  }

  private generateDailyMealPlan(user: User, targetCalories: number): DailyMeals {
    const breakfastCalories = Math.round(targetCalories * 0.25);
    const lunchCalories = Math.round(targetCalories * 0.35);
    const dinnerCalories = Math.round(targetCalories * 0.30);
    const snackCalories = Math.round(targetCalories * 0.10);

    const breakfast = this.getBreakfast(user.goal, breakfastCalories);
    const lunch = this.getLunch(user.goal, lunchCalories);
    const dinner = this.getDinner(user.goal, dinnerCalories);
    const snacks = this.getSnacks(user.goal, snackCalories);

    return {
      breakfast,
      lunch,
      dinner,
      snacks,
      totalCalories: breakfast.calories + lunch.calories + dinner.calories + snacks.reduce((sum, s) => sum + s.calories, 0)
    };
  }

  private getBreakfast(goal: string, calories: number): Meal {
    const meals: { [key: string]: Meal[] } = {
      weight_loss: [
        { name: 'Greek Yogurt with Berries', calories: 250, description: '1 cup Greek yogurt, 1/2 cup mixed berries, 1 tbsp honey' },
        { name: 'Oatmeal with Fruits', calories: 280, description: '1 cup cooked oatmeal, 1/2 banana, 1/4 cup blueberries, 1 tbsp almond butter' },
        { name: 'Scrambled Eggs with Vegetables', calories: 270, description: '2 eggs, spinach, tomatoes, mushrooms, whole grain toast' },
        { name: 'Smoothie Bowl', calories: 260, description: 'Blended fruits, Greek yogurt, granola, chia seeds' },
      ],
      muscle_gain: [
        { name: 'Protein Pancakes', calories: 450, description: 'Protein powder pancakes with banana and berries, 2 eggs' },
        { name: 'Egg Scramble with Toast', calories: 480, description: '3 eggs, whole grain toast, avocado, turkey bacon' },
        { name: 'Oatmeal with Protein', calories: 470, description: 'Oatmeal, protein powder, nuts, fruits' },
        { name: 'Breakfast Burrito', calories: 460, description: 'Whole grain tortilla, eggs, black beans, cheese, vegetables' },
      ],
      maintenance: [
        { name: 'Avocado Toast with Eggs', calories: 350, description: 'Whole grain toast, avocado, 2 poached eggs' },
        { name: 'Yogurt Parfait', calories: 340, description: 'Greek yogurt, granola, mixed fruits, nuts' },
        { name: 'Breakfast Bowl', calories: 360, description: 'Quinoa, eggs, vegetables, feta cheese' },
        { name: 'French Toast', calories: 350, description: 'Whole grain bread, eggs, berries, maple syrup' },
      ]
    };

    const options = meals[goal] || meals.maintenance;
    return options[Math.floor(Math.random() * options.length)];
  }

  private getLunch(goal: string, calories: number): Meal {
    const meals: { [key: string]: Meal[] } = {
      weight_loss: [
        { name: 'Grilled Chicken Salad', calories: 350, description: 'Grilled chicken breast, mixed greens, vegetables, light dressing' },
        { name: 'Quinoa Bowl', calories: 380, description: 'Quinoa, roasted vegetables, chickpeas, tahini dressing' },
        { name: 'Turkey Wrap', calories: 340, description: 'Whole grain wrap, turkey, vegetables, hummus' },
        { name: 'Vegetable Soup with Protein', calories: 360, description: 'Lentil soup, grilled chicken, whole grain bread' },
      ],
      muscle_gain: [
        { name: 'Chicken and Rice Bowl', calories: 550, description: 'Grilled chicken, brown rice, vegetables, sauce' },
        { name: 'Beef Stir Fry', calories: 580, description: 'Lean beef, vegetables, brown rice or noodles' },
        { name: 'Salmon with Sweet Potato', calories: 560, description: 'Grilled salmon, roasted sweet potato, vegetables' },
        { name: 'Turkey and Quinoa', calories: 540, description: 'Ground turkey, quinoa, vegetables, cheese' },
      ],
      maintenance: [
        { name: 'Mediterranean Bowl', calories: 450, description: 'Quinoa, grilled chicken, vegetables, feta, olives' },
        { name: 'Pasta with Protein', calories: 440, description: 'Whole grain pasta, lean protein, vegetables, light sauce' },
        { name: 'Sandwich and Salad', calories: 460, description: 'Whole grain sandwich, side salad, protein' },
        { name: 'Buddha Bowl', calories: 450, description: 'Grains, protein, vegetables, healthy fats' },
      ]
    };

    const options = meals[goal] || meals.maintenance;
    return options[Math.floor(Math.random() * options.length)];
  }

  private getDinner(goal: string, calories: number): Meal {
    const meals: { [key: string]: Meal[] } = {
      weight_loss: [
        { name: 'Baked Fish with Vegetables', calories: 320, description: 'White fish, roasted vegetables, quinoa' },
        { name: 'Turkey Meatballs with Zoodles', calories: 340, description: 'Lean turkey meatballs, zucchini noodles, marinara' },
        { name: 'Chicken and Vegetable Skewers', calories: 330, description: 'Grilled chicken, bell peppers, onions, side salad' },
        { name: 'Lentil Curry', calories: 310, description: 'Lentil curry, brown rice, vegetables' },
      ],
      muscle_gain: [
        { name: 'Steak with Potatoes', calories: 520, description: 'Lean steak, roasted potatoes, vegetables' },
        { name: 'Chicken Pasta', calories: 540, description: 'Grilled chicken, whole grain pasta, vegetables, sauce' },
        { name: 'Salmon with Rice', calories: 510, description: 'Grilled salmon, brown rice, vegetables, avocado' },
        { name: 'Pork Tenderloin', calories: 530, description: 'Pork tenderloin, sweet potato, vegetables' },
      ],
      maintenance: [
        { name: 'Grilled Chicken with Sides', calories: 420, description: 'Grilled chicken, roasted vegetables, whole grain' },
        { name: 'Fish Tacos', calories: 410, description: 'Grilled fish, whole grain tortillas, vegetables, salsa' },
        { name: 'Stir Fry', calories: 430, description: 'Protein, vegetables, brown rice or noodles' },
        { name: 'Pizza Night', calories: 420, description: 'Thin crust pizza, vegetables, lean protein' },
      ]
    };

    const options = meals[goal] || meals.maintenance;
    return options[Math.floor(Math.random() * options.length)];
  }

  private getSnacks(goal: string, calories: number): Meal[] {
    const snackOptions: { [key: string]: Meal[] } = {
      weight_loss: [
        { name: 'Apple with Almond Butter', calories: 150, description: '1 medium apple, 1 tbsp almond butter' },
        { name: 'Greek Yogurt', calories: 120, description: '1 cup Greek yogurt with berries' },
        { name: 'Vegetable Sticks with Hummus', calories: 130, description: 'Carrots, celery, bell peppers with hummus' },
        { name: 'Protein Smoothie', calories: 140, description: 'Protein powder, almond milk, berries' },
      ],
      muscle_gain: [
        { name: 'Protein Shake', calories: 200, description: 'Protein powder, banana, milk, peanut butter' },
        { name: 'Trail Mix', calories: 180, description: 'Nuts, seeds, dried fruits' },
        { name: 'Greek Yogurt with Granola', calories: 190, description: 'Greek yogurt, granola, fruits' },
        { name: 'Protein Bar', calories: 200, description: 'High protein bar with nuts' },
      ],
      maintenance: [
        { name: 'Mixed Nuts', calories: 160, description: 'Almonds, walnuts, cashews' },
        { name: 'Fruit and Cheese', calories: 150, description: 'Apple slices with cheese' },
        { name: 'Rice Cakes with Toppings', calories: 140, description: 'Rice cakes, avocado, or nut butter' },
        { name: 'Smoothie', calories: 150, description: 'Fruits, yogurt, milk' },
      ]
    };

    const options = snackOptions[goal] || snackOptions.maintenance;
    // Return 1-2 snacks
    const snackCount = calories > 150 ? 2 : 1;
    const selected: Meal[] = [];
    for (let i = 0; i < snackCount && i < options.length; i++) {
      selected.push(options[Math.floor(Math.random() * options.length)]);
    }
    return selected;
  }
}

