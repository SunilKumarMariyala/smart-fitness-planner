import { Request, Response } from 'express';
import { createUser, getLatestUser, getUserById, updateUser } from '../models/user.model';

export const saveProfile = async (req: Request, res: Response) => {
  try {
    const { name, age, gender, height, weight, goal } = req.body;

    // Validation
    if (!name || !age || !height || !weight || !goal) {
      return res.status(400).json({ 
        message: 'Missing required fields: name, age, height, weight, goal are required' 
      });
    }

    if (age < 10 || age > 100) {
      return res.status(400).json({ message: 'Age must be between 10 and 100' });
    }

    if (height <= 0 || weight <= 0) {
      return res.status(400).json({ message: 'Height and weight must be positive numbers' });
    }

    const validGoals = ['weight_loss', 'muscle_gain', 'maintenance'];
    if (!validGoals.includes(goal)) {
      return res.status(400).json({ 
        message: `Goal must be one of: ${validGoals.join(', ')}` 
      });
    }

    const userId = await createUser({ name, age, gender, height, weight, goal });
    res.status(201).json({ message: 'Profile saved successfully', userId });
  } catch (error: any) {
    console.error('SAVE PROFILE ERROR:', error);
    res.status(500).json({ 
      message: 'Failed to save profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const fetchProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId ? parseInt(req.query.userId as string) : null;
    
    let user;
    if (userId) {
      user = await getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
    } else {
      user = await getLatestUser();
      if (!user) {
        return res.status(404).json({ message: 'No profile found' });
      }
    }

    res.json(user);
  } catch (error: any) {
    console.error('FETCH PROFILE ERROR:', error);
    res.status(500).json({ 
      message: 'Failed to fetch profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    const updates = req.body;

    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Validate goal if provided
    if (updates.goal) {
      const validGoals = ['weight_loss', 'muscle_gain', 'maintenance'];
      if (!validGoals.includes(updates.goal)) {
        return res.status(400).json({ 
          message: `Goal must be one of: ${validGoals.join(', ')}` 
        });
      }
    }

    // Validate age if provided
    if (updates.age !== undefined && (updates.age < 10 || updates.age > 100)) {
      return res.status(400).json({ message: 'Age must be between 10 and 100' });
    }

    // Validate height and weight if provided
    if (updates.height !== undefined && updates.height <= 0) {
      return res.status(400).json({ message: 'Height must be a positive number' });
    }
    if (updates.weight !== undefined && updates.weight <= 0) {
      return res.status(400).json({ message: 'Weight must be a positive number' });
    }

    const success = await updateUser(userId, updates);
    
    if (!success) {
      return res.status(404).json({ message: 'User not found or no updates provided' });
    }

    const updatedUser = await getUserById(userId);
    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error: any) {
    console.error('UPDATE PROFILE ERROR:', error);
    res.status(500).json({ 
      message: 'Failed to update profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
