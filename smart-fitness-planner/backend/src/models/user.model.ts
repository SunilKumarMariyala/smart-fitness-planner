import { db } from '../config/db';

export interface User {
  id?: number;
  name: string;
  age: number;
  gender?: string;
  height: number;
  weight: number;
  goal: 'weight_loss' | 'muscle_gain' | 'maintenance';
  created_at?: string;
  updated_at?: string;
}

export const createUser = async (user: User) => {
  const { name, age, height, weight, goal } = user;
  const gender = user.gender || null;

  // Check if gender column exists, if not insert without it
  try {
    const [result]: any = await db.query(
      `INSERT INTO users (name, age, gender, height, weight, goal)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, age, gender, height, weight, goal]
    );
    return result.insertId;
  } catch (error: any) {
    // If gender column doesn't exist, insert without it
    if (error.code === 'ER_BAD_FIELD_ERROR' && error.message.includes('gender')) {
      console.warn('Gender column not found, inserting without gender field');
      const [result]: any = await db.query(
        `INSERT INTO users (name, age, height, weight, goal)
         VALUES (?, ?, ?, ?, ?)`,
        [name, age, height, weight, goal]
      );
      return result.insertId;
    }
    throw error;
  }
};

export const getUserById = async (id: number): Promise<User | null> => {
  const [rows]: any = await db.query(
    `SELECT * FROM users WHERE id = ?`,
    [id]
  );

  return rows[0] || null;
};

export const getLatestUser = async (): Promise<User | null> => {
  const [rows]: any = await db.query(
    `SELECT * FROM users ORDER BY id DESC LIMIT 1`
  );

  return rows[0] || null;
};

export const updateUser = async (id: number, user: Partial<User>): Promise<boolean> => {
  const { name, age, gender, height, weight, goal } = user;
  const updates: string[] = [];
  const values: any[] = [];

  if (name !== undefined) {
    updates.push('name = ?');
    values.push(name);
  }
  if (age !== undefined) {
    updates.push('age = ?');
    values.push(age);
  }
  // Only include gender if it's defined (skip if column doesn't exist)
  if (gender !== undefined) {
    updates.push('gender = ?');
    values.push(gender);
  }
  if (height !== undefined) {
    updates.push('height = ?');
    values.push(height);
  }
  if (weight !== undefined) {
    updates.push('weight = ?');
    values.push(weight);
  }
  if (goal !== undefined) {
    updates.push('goal = ?');
    values.push(goal);
  }

  if (updates.length === 0) {
    return false;
  }

  values.push(id);

  try {
    const [result]: any = await db.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  } catch (error: any) {
    // If gender column doesn't exist, retry without it
    if (error.code === 'ER_BAD_FIELD_ERROR' && error.message.includes('gender')) {
      const updatesWithoutGender = updates.filter(u => !u.includes('gender'));
      const valuesWithoutGender = values.slice(0, -1).filter((_, i) => !updates[i].includes('gender'));
      valuesWithoutGender.push(id);
      
      if (updatesWithoutGender.length > 0) {
        const [result]: any = await db.query(
          `UPDATE users SET ${updatesWithoutGender.join(', ')} WHERE id = ?`,
          valuesWithoutGender
        );
        return result.affectedRows > 0;
      }
    }
    throw error;
  }
};
